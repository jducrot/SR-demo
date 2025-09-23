/**
 * Accessible Navigation Menu and Tab Widget Script
 * Implements WCAG 2.2 compliant keyboard navigation and screen reader support
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initAccessibleNavigation();
        initTabWidget();
    });

    function initAccessibleNavigation() {
        // Initialize dropdown menu functionality
        initDropdownMenu();
        
        // Initialize mobile menu functionality  
        initMobileMenu();
        
        // Initialize keyboard navigation
        initKeyboardNavigation();
        
        // Initialize focus management
        initFocusManagement();
        
        // Initialize disclosure widgets
        initDisclosureWidgets();
        
        // Initialize modal functionality
        initModalDialog();
        
        // Initialize plain dialog functionality
        initPlainDialog();
    }

    /**
     * Initialize dropdown menu with accessible patterns
     */
    function initDropdownMenu() {
        const dropdownButton = document.getElementById('info-menu-button');
        const submenu = document.getElementById('info-submenu');
        const dropdown = dropdownButton?.closest('.nav-dropdown');

        if (!dropdownButton || !submenu || !dropdown) return;

        // Toggle dropdown on button click
        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown(dropdown, dropdownButton, submenu);
        });

        // Handle keyboard navigation for dropdown
        dropdownButton.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    openDropdown(dropdown, dropdownButton, submenu);
                    focusFirstMenuItem(submenu);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    openDropdown(dropdown, dropdownButton, submenu);
                    focusLastMenuItem(submenu);
                    break;
                case 'Escape':
                    closeDropdown(dropdown, dropdownButton, submenu);
                    break;
            }
        });

        // Handle submenu keyboard navigation
        submenu.addEventListener('keydown', function(e) {
            const menuItems = submenu.querySelectorAll('[role="menuitem"]');
            const currentIndex = Array.from(menuItems).indexOf(e.target);

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
                    menuItems[prevIndex].focus();
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeDropdown(dropdown, dropdownButton, submenu);
                    dropdownButton.focus();
                    break;
                case 'Tab':
                    closeDropdown(dropdown, dropdownButton, submenu);
                    break;
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                closeDropdown(dropdown, dropdownButton, submenu);
            }
        });

        // Close dropdown when focus leaves the dropdown area
        dropdown.addEventListener('focusout', function(e) {
            // Use setTimeout to handle focus transitions
            setTimeout(() => {
                if (!dropdown.contains(document.activeElement)) {
                    closeDropdown(dropdown, dropdownButton, submenu);
                }
            }, 100);
        });
    }

    /**
     * Initialize mobile menu functionality
     */
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

    /**
     * Initialize general keyboard navigation patterns
     */
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

    /**
     * Initialize focus management for better accessibility
     */
    function initFocusManagement() {
        // Skip links for screen readers
        addSkipLink();
        
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

    /**
     * Add skip link for screen readers
     */
    function addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.id = 'skip-link';
        
        // Add skip link as first element in body
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content for skip link target
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('tabindex', '-1');
        }
        
        // Handle skip link functionality
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView();
            }
        });
    }

    /**
     * Initialize modal dialog with accessible patterns
     */
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
            
            // Announce to screen readers
            announceToScreenReader('Modal dialog opened');
        }
        
        function closeModal() {
            // Hide modal
            modalOverlay.hidden = true;
            
            // Restore body scroll
            document.body.classList.remove('modal-open');
            
            // Return focus to trigger button
            openButton.focus();
            
            // Announce to screen readers
            announceToScreenReader('Modal dialog closed');
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

    /**
     * Initialize plain dialog with accessible patterns
     */
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
            
            // Announce to screen readers
            announceToScreenReader('Dialog opened');
        }
        
        function closeDialog() {
            // Hide dialog
            dialogOverlay.hidden = true;
            
            // Return focus to trigger button
            openButton.focus();
            
            // Announce to screen readers
            announceToScreenReader('Dialog closed');
        }
    }

    /**
     * Initialize disclosure widgets with accessible patterns
     */
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

    /**
     * Toggle disclosure widget state
     */
    function toggleDisclosure(button, content) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeDisclosure(button, content);
        } else {
            openDisclosure(button, content);
        }
    }

    /**
     * Open disclosure widget
     */
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
        announceToScreenReader(`${contentType} content expanded`);
    }

    /**
     * Close disclosure widget
     */
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
        

        
        // Announce to screen readers
        const contentType = content.classList.contains('disclosure-floating') ? 'floating' : 'inline';
        announceToScreenReader(`${contentType} content collapsed`);
    }

    /**
     * Position floating disclosure (centered on screen)
     */
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
        
        // Announce to screen readers
        announceToScreenReader('Submenu opened');
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

    // Mobile menu utility functions
    function openMobileMenu(toggle, navigation) {
        navigation.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
        
        // Focus first navigation link
        const firstLink = navigation.querySelector('.nav-link, .nav-button');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        announceToScreenReader('Navigation menu opened');
    }

    function closeMobileMenu(toggle, navigation) {
        navigation.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        announceToScreenReader('Navigation menu closed');
    }

    /**
     * Announce message to screen readers using live region
     */
    function announceToScreenReader(message) {
        let liveRegion = document.getElementById('live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear the message after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
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
})();