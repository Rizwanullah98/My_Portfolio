// Portfolio Website JavaScript
// Author: Rizwan Ullah
// Description: Handles navigation, theme toggle, form submission, and animations

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const contactForm = document.getElementById('contact-form');
    const navLinks = document.querySelectorAll('.nav-link');

    // Initialize the application
    function init() {
        setupNavigation();
        setupThemeToggle();
        setupContactForm();
        setupScrollEffects();
        setupAnimations();
        loadThemePreference();
    }

    // Navigation Functions
    function setupNavigation() {
        // Mobile menu toggle
        hamburger.addEventListener('click', toggleMobileMenu);

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                closeMobileMenu();
                smoothScrollToSection(e);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', updateActiveNavLink);
    }

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    function smoothScrollToSection(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100; // Offset for navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }

    // Theme Toggle Functions
    function setupThemeToggle() {
        themeToggle.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
        saveThemePreference(newTheme);
        
        // Add smooth transition
        document.documentElement.style.transition = 'all 0.3s ease-in-out';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'Switch to Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'Switch to Dark Mode';
        }
    }

    function saveThemePreference(theme) {
        localStorage.setItem('portfolioTheme', theme);
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('portfolioTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    // Contact Form Functions
    function setupContactForm() {
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmission);
            
            // Real-time validation
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => validateField(input));
                input.addEventListener('input', () => clearFieldError(input));
            });
        }
    }

    async function handleFormSubmission(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const formStatus = document.getElementById('form-status');

        // Show loading state
        setFormLoading(true);
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showFormStatus('success', result.message || 'Message sent successfully! I\'ll get back to you soon.');
                contactForm.reset();
            } else {
                showFormStatus('error', result.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormStatus('error', 'Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            setFormLoading(false);
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    function validateForm() {
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        
        let isValid = true;

        // Validate name
        if (!name.value.trim()) {
            showFieldError(name, 'Name is required');
            isValid = false;
        } else if (name.value.trim().length < 2) {
            showFieldError(name, 'Name must be at least 2 characters');
            isValid = false;
        }

        // Validate email
        if (!email.value.trim()) {
            showFieldError(email, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate message
        if (!message.value.trim()) {
            showFieldError(message, 'Message is required');
            isValid = false;
        } else if (message.value.trim().length < 10) {
            showFieldError(message, 'Message must be at least 10 characters');
            isValid = false;
        }

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;

        clearFieldError(field);

        switch (fieldName) {
            case 'name':
                if (!value) {
                    showFieldError(field, 'Name is required');
                } else if (value.length < 2) {
                    showFieldError(field, 'Name must be at least 2 characters');
                }
                break;
            case 'email':
                if (!value) {
                    showFieldError(field, 'Email is required');
                } else if (!isValidEmail(value)) {
                    showFieldError(field, 'Please enter a valid email address');
                }
                break;
            case 'message':
                if (!value) {
                    showFieldError(field, 'Message is required');
                } else if (value.length < 10) {
                    showFieldError(field, 'Message must be at least 10 characters');
                }
                break;
        }
    }

    function showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            field.style.borderColor = 'var(--error-color)';
        }
    }

    function clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            field.style.borderColor = 'var(--border-color)';
        }
    }

    function showFormStatus(type, message) {
        const formStatus = document.getElementById('form-status');
        if (formStatus) {
            formStatus.className = `form-status ${type}`;
            formStatus.textContent = message;
            formStatus.style.display = 'block';
            
            // Auto-hide success message after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        }
    }

    function setFormLoading(loading) {
        const form = document.getElementById('contact-form');
        if (loading) {
            form.classList.add('loading');
        } else {
            form.classList.remove('loading');
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Scroll Effects
    function setupScrollEffects() {
        // Navbar background on scroll
        window.addEventListener('scroll', handleNavbarScroll);
        
        // Scroll to top button (if you want to add one later)
        window.addEventListener('scroll', debounce(handleScroll, 100));
    }

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = 'var(--background-color)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    }

    function handleScroll() {
        // Add any additional scroll effects here
        // For example, show/hide scroll to top button
    }

    // Animations
    function setupAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Custom fade-in animations for elements without AOS
        observeElements();
    }

    function observeElements() {
        const elements = document.querySelectorAll('.fade-in');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(element => {
                observer.observe(element);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            elements.forEach(element => {
                element.classList.add('visible');
            });
        }
    }

    // Utility Functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Keyboard Navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Close mobile menu on Escape
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Theme toggle with Ctrl/Cmd + Shift + T
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    // Error Handling
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        // You could send error reports to a logging service here
    });

    // Performance Monitoring
    function logPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }, 0);
            });
        }
    }

    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Setup additional features
    setupKeyboardNavigation();
    logPerformance();

    // Expose some functions globally for debugging (remove in production)
    window.portfolioDebug = {
        toggleTheme,
        toggleMobileMenu,
        validateForm
    };

})();

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}
