<?php
/**
 * Contact Form Handler for Rizwan Ullah Portfolio
 * Handles form submission and sends emails
 * 
 * Author: Rizwan Ullah
 * Email: rizwan.ullah.tech@gmail.com
 */

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to user
ini_set('log_errors', 1);     // Log errors to server log

/**
 * Configuration
 */
$config = [
    'recipient_email' => 'rizwan.ullah.tech@gmail.com',
    'recipient_name' => 'Rizwan Ullah',
    'subject_prefix' => '[Portfolio Contact] ',
    'max_message_length' => 5000,
    'allowed_domains' => [], // Empty array means all domains allowed
    'rate_limit' => [
        'enabled' => true,
        'max_requests' => 5,
        'time_window' => 3600 // 1 hour in seconds
    ]
];

/**
 * Response helper function
 */
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validate email address
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Check rate limiting
 */
function checkRateLimit($config) {
    if (!$config['rate_limit']['enabled']) {
        return true;
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rate_file = sys_get_temp_dir() . '/portfolio_rate_' . md5($ip) . '.txt';
    
    $current_time = time();
    $requests = [];
    
    // Read existing requests
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        $requests = $content ? json_decode($content, true) : [];
    }
    
    // Filter out old requests
    $requests = array_filter($requests, function($timestamp) use ($current_time, $config) {
        return ($current_time - $timestamp) < $config['rate_limit']['time_window'];
    });
    
    // Check if limit exceeded
    if (count($requests) >= $config['rate_limit']['max_requests']) {
        return false;
    }
    
    // Add current request
    $requests[] = $current_time;
    
    // Save updated requests
    file_put_contents($rate_file, json_encode($requests));
    
    return true;
}

/**
 * Send email using PHP mail function
 */
function sendEmail($to, $subject, $message, $from_email, $from_name) {
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $from_name . ' <' . $from_email . '>',
        'Reply-To: ' . $from_email,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Attempt to send email
    $result = mail($to, $subject, $message, implode("\r\n", $headers));
    
    return $result;
}

/**
 * Create HTML email template
 */
function createEmailTemplate($name, $email, $message) {
    $template = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 30px; border-left: 4px solid #2563eb; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #1e293b; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Contact Form Submission</h2>
                <p>Portfolio Website - Rizwan Ullah</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">' . htmlspecialchars($name) . '</div>
                </div>
                <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">' . htmlspecialchars($email) . '</div>
                </div>
                <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">' . nl2br(htmlspecialchars($message)) . '</div>
                </div>
                <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">' . date('Y-m-d H:i:s T') . '</div>
                </div>
                <div class="field">
                    <div class="label">IP Address:</div>
                    <div class="value">' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . '</div>
                </div>
            </div>
            <div class="footer">
                <p>This message was sent from your portfolio website contact form.</p>
            </div>
        </div>
    </body>
    </html>';
    
    return $template;
}

/**
 * Log contact form submissions
 */
function logSubmission($name, $email, $message, $success) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s T'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'name' => $name,
        'email' => $email,
        'message_length' => strlen($message),
        'success' => $success,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    $log_file = sys_get_temp_dir() . '/portfolio_contact_log.txt';
    $log_line = json_encode($log_entry) . "\n";
    
    file_put_contents($log_file, $log_line, FILE_APPEND | LOCK_EX);
}

/**
 * Main execution
 */
try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(false, 'Only POST requests are allowed.');
    }
    
    // Check rate limiting
    if (!checkRateLimit($config)) {
        sendResponse(false, 'Too many requests. Please wait before sending another message.');
    }
    
    // Get and validate input data
    $name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';
    
    // Validation
    $errors = [];
    
    // Validate name
    if (empty($name)) {
        $errors[] = 'Name is required.';
    } elseif (strlen($name) < 2) {
        $errors[] = 'Name must be at least 2 characters long.';
    } elseif (strlen($name) > 100) {
        $errors[] = 'Name must be less than 100 characters.';
    }
    
    // Validate email
    if (empty($email)) {
        $errors[] = 'Email is required.';
    } elseif (!validateEmail($email)) {
        $errors[] = 'Please enter a valid email address.';
    } elseif (strlen($email) > 255) {
        $errors[] = 'Email address is too long.';
    }
    
    // Validate message
    if (empty($message)) {
        $errors[] = 'Message is required.';
    } elseif (strlen($message) < 10) {
        $errors[] = 'Message must be at least 10 characters long.';
    } elseif (strlen($message) > $config['max_message_length']) {
        $errors[] = 'Message is too long. Maximum ' . $config['max_message_length'] . ' characters allowed.';
    }
    
    // Basic spam detection
    $spam_patterns = [
        '/\b(?:viagra|cialis|casino|poker|lottery|winner|congratulations)\b/i',
        '/\b(?:click here|free money|make money fast|work from home)\b/i',
        '/http[s]?:\/\/[^\s]{10,}/i' // Long URLs
    ];
    
    foreach ($spam_patterns as $pattern) {
        if (preg_match($pattern, $message)) {
            $errors[] = 'Message appears to be spam and was rejected.';
            break;
        }
    }
    
    // Check for suspicious patterns
    if (substr_count($message, 'http') > 2) {
        $errors[] = 'Too many links in message.';
    }
    
    // If there are validation errors, return them
    if (!empty($errors)) {
        sendResponse(false, implode(' ', $errors));
    }
    
    // Prepare email
    $subject = $config['subject_prefix'] . 'Message from ' . $name;
    $email_body = createEmailTemplate($name, $email, $message);
    
    // Attempt to send email
    $email_sent = sendEmail(
        $config['recipient_email'],
        $subject,
        $email_body,
        $email,
        $name
    );
    
    // Log the submission
    logSubmission($name, $email, $message, $email_sent);
    
    if ($email_sent) {
        sendResponse(true, 'Thank you for your message! I\'ll get back to you as soon as possible.');
    } else {
        sendResponse(false, 'Sorry, there was an error sending your message. Please try again later or contact me directly at ' . $config['recipient_email']);
    }
    
} catch (Exception $e) {
    // Log the error
    error_log('Contact form error: ' . $e->getMessage());
    
    sendResponse(false, 'An unexpected error occurred. Please try again later.');
} catch (Error $e) {
    // Log the error
    error_log('Contact form fatal error: ' . $e->getMessage());
    
    sendResponse(false, 'A system error occurred. Please try again later.');
}
?>
