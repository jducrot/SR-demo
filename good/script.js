/**
 * @file Accessible Navigation Menu and Tab Widget Script
 * @description Implements WCAG 2.2 compliant keyboard navigation and screen reader support
 * @version 1.0.0
 */

const AccessibleUI = (function() {
    'use strict';

    // Cache DOM queries and commonly used values
    const selectors = {
        mainContent: '.main-content',
        dropdownButton: '#info-menu-button',
        submenu: '#info-submenu',
        mobileToggle: '.mobile-menu-toggle',
        navigation: '.global-navigation',
        tablist: '[role="tablist"]'
    };

    // Initialize the module
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAccessibleUI);
        } else {
            initAccessibleUI();
        }
    }

    // Initialize all features
    function initAccessibleUI() {
        requestAnimationFrame(() => {
            initDropdownMenu();
            initMobileMenu();
            initKeyboardNavigation();
            initModalDialog();
            initPlainDialog();
            initDisclosureWidgets();
            initFocusManagement();
            initTabWidget();
            initFormValidation();
        });
    }

    function initModalDialog() {
        const openButton = document.getElementById('open-modal-button');
        const modalOverlay = document.getElementById('modal-overlay');
        const closeButton = document.getElementById('modal-close-button');
        const cancelButton = document.getElementById('modal-cancel-button');
        
        if (!openButton || !modalOverlay || !closeButton) return;
        
        let focusableElements = [];
        let firstFocusableElement = null;
        let lastFocusableElement = null;
        
        // Open modal
        openButton.addEventListener('click', function() {
            openModal();
        });
        
        // Close modal handlers
        closeButton.addEventListener('click', function() {
            closeModal();
        });
        
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                closeModal();
            });
        }
        
        // Close modal on overlay click
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Handle keyboard events
        document.addEventListener('keydown', function(e) {
            if (!modalOverlay.hidden) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeModal();
                } else if (e.key === 'Tab') {
                    handleModalTabKey(e);
                }
            }
        });
        
        function openModal() {
            // Show modal
            modalOverlay.hidden = false;
            
            // Prevent body scroll
            document.body.classList.add('modal-open');
            
            // Set focus to first focusable element
            updateFocusableElements();
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }
        
        function closeModal() {
            // Hide modal
            modalOverlay.hidden = true;
            
            // Restore body scroll
            document.body.classList.remove('modal-open');
            
            // Return focus to trigger button
            openButton.focus();
        }
        
        function updateFocusableElements() {
            const focusableSelector = [
                'button:not([disabled])',
                '[href]',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ].join(',');
            
            focusableElements = Array.from(modalOverlay.querySelectorAll(focusableSelector));
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
        }
        
        function handleModalTabKey(e) {
            if (focusableElements.length === 0) return;
            
            const activeElement = document.activeElement;
            const currentIndex = focusableElements.indexOf(activeElement);
            
            if (e.shiftKey) {
                // Shift + Tab (backward)
                if (currentIndex <= 0) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab (forward)
                if (currentIndex >= focusableElements.length - 1) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    }

    function initPlainDialog() {
        const openButton = document.getElementById('open-dialog-button');
        const dialogOverlay = document.getElementById('dialog-overlay');
        const closeButton = document.getElementById('dialog-close-button');
        const closeButtonSecondary = document.querySelector('.dialog-close-button-secondary');
        
        if (!openButton || !dialogOverlay || !closeButton) return;
        
        // Open dialog
        openButton.addEventListener('click', function() {
            openDialog();
        });
        
        // Close dialog handlers
        closeButton.addEventListener('click', function() {
            closeDialog();
        });
        
        if (closeButtonSecondary) {
            closeButtonSecondary.addEventListener('click', function() {
                closeDialog();
            });
        }
        
        // Close dialog on overlay click
        dialogOverlay.addEventListener('click', function(e) {
            if (e.target === dialogOverlay) {
                closeDialog();
            }
        });
        
        // Handle keyboard events
        document.addEventListener('keydown', function(e) {
            if (!dialogOverlay.hidden && e.key === 'Escape') {
                e.preventDefault();
                closeDialog();
            }
        });
        
        function openDialog() {
            // Show dialog
            dialogOverlay.hidden = false;
            
            // Set focus to close button (first focusable element)
            closeButton.focus();
        }
        
        function closeDialog() {
            // Hide dialog
            dialogOverlay.hidden = true;
            
            // Return focus to trigger button
            openButton.focus();
        }
    }

    function openDisclosure(button, content) {
        button.setAttribute('aria-expanded', 'true');
        content.hidden = false;
        
        // Update button text for inline disclosures
        if (content.classList.contains('disclosure-inline')) {
            const buttonText = button.childNodes[0];
            if (buttonText && buttonText.textContent.includes('Show')) {
                buttonText.textContent = buttonText.textContent.replace('Show', 'Hide');
            }
        }
        
        // Position floating disclosures
        if (content.classList.contains('disclosure-floating')) {
            positionFloatingDisclosure(button, content);
        }
        
        // Announce to screen readers
        const contentType = content.classList.contains('disclosure-floating') ? 'floating' : 'inline';
    }

    function closeDisclosure(button, content) {
        button.setAttribute('aria-expanded', 'false');
        content.hidden = true;
        
        // Update button text for inline disclosures
        if (content.classList.contains('disclosure-inline')) {
            const buttonText = button.childNodes[0];
            if (buttonText && buttonText.textContent.includes('Hide')) {
                buttonText.textContent = buttonText.textContent.replace('Hide', 'Show');
            }
        }
    }

    function toggleDisclosure(button, content) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeDisclosure(button, content);
        } else {
            openDisclosure(button, content);
        }
    }

    // Dropdown utility functions
    function toggleDropdown(dropdown, button, submenu) {
        const isOpen = dropdown.getAttribute('data-open') === 'true';
        
        if (isOpen) {
            closeDropdown(dropdown, button, submenu);
        } else {
            openDropdown(dropdown, button, submenu);
        }
    }

    function openDropdown(dropdown, button, submenu) {
        dropdown.setAttribute('data-open', 'true');
        button.setAttribute('aria-expanded', 'true');
        submenu.style.display = 'block';
    }

    function closeDropdown(dropdown, button, submenu) {
        dropdown.setAttribute('data-open', 'false');
        button.setAttribute('aria-expanded', 'false');
        
        // Delay hiding to allow for focus transitions
        setTimeout(() => {
            if (dropdown.getAttribute('data-open') === 'false') {
                submenu.style.display = '';
            }
        }, 100);
    }

    function initTabWidget() {
        const tablist = document.querySelector('[role="tablist"]');
        if (!tablist) return;

        const tabs = [...tablist.querySelectorAll('[role="tab"]')];
        const panels = tabs.map(tab => {
            const panelId = tab.getAttribute('aria-controls');
            return document.getElementById(panelId);
        });

        // Initialize tab states
        tabs.forEach((tab, index) => {
            if (tab.getAttribute('aria-selected') === 'true') {
                tab.tabIndex = 0;
                panels[index]?.removeAttribute('hidden');
            } else {
                tab.setAttribute('aria-selected', 'false');
                tab.tabIndex = -1;
                panels[index]?.setAttribute('hidden', '');
            }
        });

        // Handle click events
        tablist.addEventListener('click', e => {
            const tab = e.target.closest('[role="tab"]');
            if (!tab || tab.getAttribute('aria-selected') === 'true') return;
            switchTab(tab);
        });

        // Handle keyboard events
        tablist.addEventListener('keydown', e => {
            const targetTab = e.target.closest('[role="tab"]');
            if (!targetTab) return;

            let newTab;
            switch (e.key) {
                case 'ArrowLeft':
                    newTab = targetTab.previousElementSibling;
                    if (!newTab && tabs.length > 0) newTab = tabs[tabs.length - 1];
                    if (newTab) {
                        e.preventDefault();
                        // Only move focus, don't activate
                        newTab.focus();
                    }
                    break;
                case 'ArrowRight':
                    newTab = targetTab.nextElementSibling;
                    if (!newTab && tabs.length > 0) newTab = tabs[0];
                    if (newTab) {
                        e.preventDefault();
                        // Only move focus, don't activate
                        newTab.focus();
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    // Only move focus to first tab
                    tabs[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    // Only move focus to last tab
                    tabs[tabs.length - 1].focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    // Only switch tabs on Enter or Space if it's not already selected
                    if (targetTab.getAttribute('aria-selected') !== 'true') {
                        switchTab(targetTab);
                    }
                    break;
            }
        });

        function switchTab(newTab) {
            // Find the old tab
            const oldTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
            
            if (oldTab !== newTab) {
                // Update tabs
                oldTab.setAttribute('aria-selected', 'false');
                oldTab.tabIndex = -1;
                
                newTab.setAttribute('aria-selected', 'true');
                newTab.tabIndex = 0;

                // Update panels
                const newPanelId = newTab.getAttribute('aria-controls');
                const oldPanelId = oldTab.getAttribute('aria-controls');
                
                document.getElementById(oldPanelId)?.setAttribute('hidden', '');
                document.getElementById(newPanelId)?.removeAttribute('hidden');

                // Announce tab switch to screen readers
                announceMessage(`${newTab.textContent} tab selected`);
            }
        }
    }

    function openMobileMenu(toggle, navigation) {
        navigation.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
        
        // Focus first navigation link
        const firstLink = navigation.querySelector('.nav-link, .nav-button');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    function closeMobileMenu(toggle, navigation) {
        navigation.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
    }

    function focusFirstMenuItem(submenu) {
        const firstItem = submenu.querySelector('[role="menuitem"]');
        if (firstItem) {
            firstItem.focus();
        }
    }

    function focusLastMenuItem(submenu) {
        const menuItems = submenu.querySelectorAll('[role="menuitem"]');
        const lastItem = menuItems[menuItems.length - 1];
        if (lastItem) {
            lastItem.focus();
        }
    }

    function positionFloatingDisclosure(button, content) {
        // For centered floating disclosures, CSS handles the positioning
        // No additional JavaScript positioning needed since we use fixed positioning
        // This function is kept for consistency and potential future customization
        
        // Ensure the content uses the CSS-defined centered positioning
        if (content.id === 'floating-disclosure-content') {
            // CSS handles all positioning via fixed positioning and transform
            // No JavaScript override needed
        }
    }
    

    function initDisclosureWidgets() {
        // Initialize all disclosure buttons
        const disclosureButtons = document.querySelectorAll('.disclosure-button');
        
        disclosureButtons.forEach(button => {
            const contentId = button.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            
            if (!content) return;
            
            // Set initial state
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            content.hidden = !isExpanded;
            
            // Handle button click
            button.addEventListener('click', function() {
                toggleDisclosure(button, content);
            });
            
            // Handle keyboard navigation
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDisclosure(button, content);
                }
            });
        });
        
        // Close floating disclosures when clicking outside
        document.addEventListener('click', function(e) {
            const floatingDisclosures = document.querySelectorAll('.disclosure-floating:not([hidden])');
            
            floatingDisclosures.forEach(disclosure => {
                const triggerButton = document.querySelector(`[aria-controls="${disclosure.id}"]`);
                
                if (triggerButton && 
                    !triggerButton.contains(e.target) && 
                    !disclosure.contains(e.target)) {
                    closeDisclosure(triggerButton, disclosure);
                }
            });
        });
        
        // Handle Escape key for floating disclosures
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openFloatingDisclosures = document.querySelectorAll('.disclosure-floating:not([hidden])');
                
                openFloatingDisclosures.forEach(disclosure => {
                    const triggerButton = document.querySelector(`[aria-controls="${disclosure.id}"]`);
                    if (triggerButton) {
                        closeDisclosure(triggerButton, disclosure);
                        triggerButton.focus();
                    }
                });
            }
        });
    }

    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navigation = document.querySelector('.global-navigation');

        if (!mobileToggle || !navigation) return;

        mobileToggle.addEventListener('click', function() {
            const isOpen = navigation.getAttribute('data-open') === 'true';
            
            if (isOpen) {
                closeMobileMenu(mobileToggle, navigation);
            } else {
                openMobileMenu(mobileToggle, navigation);
            }
        });

        // Close mobile menu when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navigation.getAttribute('data-open') === 'true') {
                closeMobileMenu(mobileToggle, navigation);
                mobileToggle.focus();
            }
        });

        // Handle window resize to close mobile menu if switching to desktop view
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navigation.getAttribute('data-open') === 'true') {
                closeMobileMenu(mobileToggle, navigation);
            }
        });
    }

    function initKeyboardNavigation() {
        // Handle Enter and Space key activation for buttons and links
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                
                if (target.matches('button') && e.key === ' ') {
                    e.preventDefault();
                    target.click();
                }
                
                if (target.matches('a[role="menuitem"]') && e.key === ' ') {
                    e.preventDefault();
                    target.click();
                }
            }
        });
    }

    function initFocusManagement() {
        // Ensure focus is visible during keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Form validation module
    function initFormValidation() {
        const demoForm = document.getElementById('demo-form');
        if (!demoForm) return;

        const inputs = demoForm.querySelectorAll('input[required]');

        // Validation configuration
        const config = {
            errorClass: 'error',
            activeClass: 'active',
            delay: 100 // Delay for screen reader announcements

        };

        // Validation rules with patterns and messages
        const validationRules = {
            name: {
                pattern: /^[a-zA-Z\s'-]{2,}$/,
                message: 'Please enter a valid name with at least 2 characters, using letters, hyphens, or apostrophes',
                required: 'Name is required'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
                required: 'Email address is required'
            },
            password: {
                pattern: /.{8,}/,
                message: 'Password must be at least 8 characters long',
                required: false // Password is optional
            }
        };

        function showError(input, message) {
            const errorId = `${input.id}-error`;
            let errorElement = document.getElementById(errorId);
            const demoForm = document.getElementById('demo-form');
            
            // Create error element if it doesn't exist
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'error-message';
                
                // Insert error element after the input
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
            
            // Update error message and styles
            errorElement.textContent = message;
            errorElement.classList.add('active');
            input.setAttribute('aria-invalid', 'true');
            
            // Ensure error message is associated with the input
            const currentDescribedBy = input.getAttribute('aria-describedby') || '';
            const descriptors = currentDescribedBy.split(' ');
            if (!descriptors.includes(errorId)) {
                descriptors.push(errorId);
                input.setAttribute('aria-describedby', descriptors.join(' '));
            }
        }

        function clearError(input) {
            const errorId = `${input.id}-error`;
            const errorElement = document.getElementById(errorId);
            
            if (!errorElement) return;

            // Clear error message
            errorElement.textContent = '';
            errorElement.classList.remove(config.activeClass);
            
            // Update input state
            input.setAttribute('aria-invalid', 'false');
            input.classList.remove(config.errorClass);
            
            // Update aria-describedby
            updateDescribedBy(input, errorId, false);
        }

        // Helper function to update aria-describedby
        function updateDescribedBy(input, errorId, add) {
            const currentDescribedBy = input.getAttribute('aria-describedby') || '';
            const descriptors = currentDescribedBy.split(' ').filter(d => d !== errorId);
            
            if (add) descriptors.push(errorId);
            input.setAttribute('aria-describedby', descriptors.join(' '));
        }

        function validateInput(input) {
            const value = input.value.trim();
            const rule = validationRules[input.name];

            if (!rule) return true; // Skip validation if no rule exists

            if (!value) {
                showError(input, rule.required);
                return false;
            }

            if (!rule.pattern.test(value)) {
                showError(input, rule.message);
                return false;
            }

            clearError(input);
            return true;
        }

        // Function to validate all inputs and return the first invalid one
        function validateAllInputs() {
            let firstInvalid = null;
            inputs.forEach(input => {
                if (!validateInput(input) && !firstInvalid) {
                    firstInvalid = input;
                }
            });
            return firstInvalid;
        }

        // Function to focus the first invalid input
        function focusFirstInvalid(input) {
            if (input) {
                setTimeout(() => {
                    input.focus();
                }, 100);
            }
        }

        // Add blur event listeners for validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input))
        });

        // Initialize form submission handling
        if (demoForm) {
            demoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Clear any existing submission error messages
                const formStatus = document.querySelector('.form-status');
                if (formStatus) formStatus.remove();
                
                // Validate all inputs
                const firstInvalid = validateAllInputs();

                if (firstInvalid) {
                    // Create a status message for screen readers
                    const formError = document.createElement('div');
                    formError.className = 'form-status error';
                    formError.textContent = 'Please correct the errors in the form before submitting.';
                    
                    // Insert status message at the top of the form
                    demoForm.insertBefore(formError, demoForm.firstChild);
                    
                    // Focus the first invalid input
                    setTimeout(() => {
                        firstInvalid.focus();
                        formError.textContent = `Form has errors. ${formError.textContent}`;
                    }, 100);
                } else {
                    // Form is valid
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-status success';
                    successMessage.setAttribute('aria-live', 'polite');
                    successMessage.textContent = 'Form submitted successfully!';
                    
                    demoForm.insertBefore(successMessage, demoForm.firstChild);
                    demoForm.reset();
                    
                    // Clear any remaining error states
                    inputs.forEach(clearError);
                    
                    // Focus the success message for screen readers
                    setTimeout(() => successMessage.focus(), 100);
                }
            });
        }
    }

    function initDropdownMenu() {
        const dropdownButton = document.querySelector(selectors.dropdownButton);
        const submenu = document.querySelector(selectors.submenu);
        const dropdown = dropdownButton?.closest('.nav-dropdown');

        if (!dropdownButton || !submenu || !dropdown) return;

        function handleDropdownClick(e) {
            e.preventDefault();
            toggleDropdown();
        }

        function handleDropdownKeyboard(e) {
            const menuItems = [...submenu.querySelectorAll('[role="menuitem"]')];
            const currentIndex = menuItems.indexOf(document.activeElement);

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    menuItems[(currentIndex + 1) % menuItems.length]?.focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
                    menuItems[prevIndex]?.focus();
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeDropdown();
                    dropdownButton.focus();
                    break;
            }
        }

        function toggleDropdown() {
            const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            dropdownButton.setAttribute('aria-expanded', 'true');
            submenu.style.display = 'block';
            const firstMenuItem = submenu.querySelector('[role="menuitem"]');
            firstMenuItem?.focus();
        }

        function closeDropdown() {
            dropdownButton.setAttribute('aria-expanded', 'false');
            submenu.style.display = '';
        }

        // Event listeners
        dropdownButton.addEventListener('click', handleDropdownClick);
        submenu.addEventListener('keydown', handleDropdownKeyboard);
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // Return public API
    return { init };
})();

// Initialize the accessibility features
AccessibleUI.init();