// OTP Bypass Injection Script
// Bypasses "Too many login attempts" device restriction

(function() {
    'use strict';
    
    console.log('[OTPBypass] Injection script loaded');
    
    // Clear device-based restrictions
    function clearDeviceRestrictions() {
        // Clear localStorage keys related to login attempts
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
        
        // Clear cookies related to device tracking
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
        const errorSelectors = [
            '[class*="error"]',
            '[class*="Error"]',
            '[id*="error"]',
            '[id*="Error"]',
            '.error-message',
            '.errorMessage'
        ];
        
        errorSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    const text = element.textContent || element.innerText || '';
                    if (text.includes('Too many login attempts') ||
                        text.includes('too many') ||
                        text.includes('device') ||
                        text.includes('attempts detected')) {
                        element.style.display = 'none';
                        element.textContent = '';
                        element.innerHTML = '';
                    }
                });
            } catch (e) {
                // Ignore errors
            }
        });
        
        // Also check for red text (error styling)
        document.querySelectorAll('*').forEach(element => {
            const style = window.getComputedStyle(element);
            if (style.color === 'rgb(255, 0, 0)' || style.color === 'red') {
                const text = element.textContent || element.innerText || '';
                if (text.includes('Too many') || text.includes('attempts')) {
                    element.style.display = 'none';
                }
            }
        });
    }
    
    // Bypass OTP restriction
    function bypassOTPRestriction() {
        console.log('[OTPBypass] Attempting to bypass OTP restriction...');
        
        // Clear device restrictions
        clearDeviceRestrictions();
        
        // Hide error messages
        hideErrorMessages();
        
        // Try to enable retry buttons
        const retryButtons = document.querySelectorAll('button');
        retryButtons.forEach(button => {
            const text = button.textContent || button.innerText || '';
            if (text.includes('SMS') || text.includes('CALL') || text.includes('Retry')) {
                button.disabled = false;
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
                button.onclick = function() {
                    clearDeviceRestrictions();
                    return true;
                };
            }
        });
        
        // Try to enable verify button
        const verifyButton = Array.from(document.querySelectorAll('button')).find(btn => {
            const text = btn.textContent || btn.innerText || '';
            return text.includes('Verify') || text.includes('Proceed');
        });
        
        if (verifyButton) {
            verifyButton.disabled = false;
            verifyButton.style.pointerEvents = 'auto';
            verifyButton.style.opacity = '1';
        }
        
        // Generate new device ID
        const newDeviceID = generateUUID();
        localStorage.setItem('deviceID', newDeviceID);
        localStorage.setItem('deviceIDResetTime', new Date().toISOString());
        
        console.log('[OTPBypass] OTP restriction bypassed. New device ID:', newDeviceID.substring(0, 8));
        
        // Show success notification
        showNotification('Device restrictions cleared. You can now retry OTP.', 'success');
    }
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            padding: 12px 24px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Add bypass button
    function addBypassButton() {
        // Check if button already exists
        if (document.getElementById('otp-bypass-button')) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = 'otp-bypass-button';
        button.textContent = '🔓 Bypass Restriction';
        button.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            padding: 10px 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        `;
        
        button.onclick = function() {
            bypassOTPRestriction();
        };
        
        document.body.appendChild(button);
    }
    
    // Auto-bypass on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                clearDeviceRestrictions();
                hideErrorMessages();
                addBypassButton();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            clearDeviceRestrictions();
            hideErrorMessages();
            addBypassButton();
        }, 1000);
    }
    
    // Monitor for error messages and auto-bypass
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const text = node.textContent || node.innerText || '';
                        if (text.includes('Too many login attempts') ||
                            text.includes('device') && text.includes('attempts')) {
                            console.log('[OTPBypass] Error message detected, auto-bypassing...');
                            bypassOTPRestriction();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also check periodically
    setInterval(() => {
        hideErrorMessages();
    }, 2000);
    
    console.log('[OTPBypass] Bypass system active');
})();
