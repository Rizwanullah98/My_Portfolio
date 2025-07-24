// Modern Portfolio Website JavaScript with Tailwind CSS
// Author: Rizwan Ullah
// Description: Handles navigation, theme toggle, form submission, and animations

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const contactForm = document.getElementById('contact-form');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Initialize the application
    function init() {
        setupNavigation();
        setupThemeToggle();
        setupContactForm();
        setupScrollEffects();
        setupAnimations();
        loadThemePreference();
        setupBackToTop();
    }

    // Navigation Functions
    function setupNavigation() {
        // Mobile menu toggle
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', toggleMobileMenu);
        }

        // Desktop navigation smooth scroll
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScrollToSection(e);
            });
        });

        // Mobile navigation smooth scroll and close menu
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileMenu();
                smoothScrollToSection(e);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && !navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', updateActiveNavLink);
    }

    function toggleMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
            
            // Update hamburger icon
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars text-lg';
                document.body.style.overflow = '';
            } else {
                icon.className = 'fas fa-times text-lg';
                document.body.style.overflow = 'hidden';
            }
        }
    }

    function closeMobileMenu() {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuButton.querySelector('i');
            icon.className = 'fas fa-bars text-lg';
            document.body.style.overflow = '';
        }
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
            const desktopNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            const mobileNavLink = document.querySelector(`.mobile-nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('text-primary-600', 'dark:text-primary-400'));
                mobileNavLinks.forEach(link => link.classList.remove('text-primary-600', 'dark:text-primary-400'));
                
                // Add active class to current section
                if (desktopNavLink) {
                    desktopNavLink.classList.add('text-primary-600', 'dark:text-primary-400');
                }
                if (mobileNavLink) {
                    mobileNavLink.classList.add('text-primary-600', 'dark:text-primary-400');
                }
            }
        });
    }

    // Theme Toggle Functions
    function setupThemeToggle() {
        themeToggle.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            saveThemePreference('light');
        } else {
            html.classList.add('dark');
            saveThemePreference('dark');
        }
        
        updateThemeIcon(!isDark);
    }

    function updateThemeIcon(isDark) {
        // Icons are already set up in HTML with Tailwind's dark: modifier
        // No need to manually toggle classes
    }

    function saveThemePreference(theme) {
        localStorage.setItem('portfolioTheme', theme);
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('portfolioTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        updateThemeIcon(shouldBeDark);
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

        // Show loading state
        setFormLoading(true);

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
                
                // Clear any remaining error states
                const inputs = contactForm.querySelectorAll('input, textarea');
                inputs.forEach(input => clearFieldError(input));
            } else {
                showFormStatus('error', result.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormStatus('error', 'Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            setFormLoading(false);
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
            errorElement.classList.remove('hidden');
            field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.remove('border-gray-300', 'dark:border-gray-600', 'focus:border-primary-500', 'focus:ring-primary-500');
        }
    }

    function clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
            field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.add('border-gray-300', 'dark:border-gray-600', 'focus:border-primary-500', 'focus:ring-primary-500');
        }
    }

    function showFormStatus(type, message) {
        const formStatus = document.getElementById('form-status');
        if (formStatus) {
            formStatus.textContent = message;
            formStatus.classList.remove('hidden');
            
            // Remove previous status classes
            formStatus.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
            
            // Add appropriate classes based on type
            if (type === 'success') {
                formStatus.classList.add('bg-green-100', 'text-green-800');
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    formStatus.classList.add('hidden');
                }, 5000);
            } else {
                formStatus.classList.add('bg-red-100', 'text-red-800');
            }
        }
    }

    function setFormLoading(loading) {
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Scroll Effects
    function setupScrollEffects() {
        // Navbar background on scroll (already handled by Tailwind classes)
        window.addEventListener('scroll', debounce(handleScroll, 100));
    }

    function handleScroll() {
        // Update active navigation
        updateActiveNavLink();
    }

    // Back to top functionality
    function setupBackToTop() {
        const backToTopLinks = document.querySelectorAll('a[href="#home"]');
        backToTopLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
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
