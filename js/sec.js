// security.js
// Robust self-hosted sanitization module to prevent XSS and local storage attacks

const DOMPurify = (function() {
    // Configuration for sanitization
    const config = {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [], // No HTML attributes allowed
        KEEP_CONTENT: true, // Keep text content, strip tags
        FORBID_TAGS: [
            'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
            'textarea', 'button', 'link', 'meta', 'base', 'applet', 'audio', 'video'
        ],
        FORBID_ATTR: [
            'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
            'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeypress', 'onkeyup',
            'ondragstart', 'ondrop', 'oncontextmenu', 'onanimationstart', 'ontransitionend',
            'src', 'href', 'data', 'action', 'formaction'
        ],
        MAX_LENGTH: 1000, // Maximum length for any input
        ALLOWED_PROTOCOLS: ['http', 'https', 'tel', 'mailto', 'nostr', 'matrix'] // Allowed protocols for URLs
    };

    // Regular expression to detect malicious patterns
    const maliciousPatterns = [
        /javascript:/i, // JavaScript protocol
        /data:/i,       // Data URI
        /vbscript:/i,   // VBScript protocol
        /expression\(/i,// CSS expressions
        /<[^>]+>/g,    // HTML tags
        /[\u0000-\u001F\u007F-\u009F]/g, // Control characters
        /[\u2028-\u2029]/g // Line/paragraph separators
    ];

    // Logger for security events
    function logSecurityEvent(message) {
        console.warn(`[Security] ${message}`);
    }

    // Validate input type and content
    function validateInput(input) {
        if (input === null || input === undefined) {
            logSecurityEvent('Null or undefined input detected');
            return '';
        }
        if (typeof input !== 'string') {
            logSecurityEvent(`Invalid input type: ${typeof input}`);
            return '';
        }
        if (input.length > config.MAX_LENGTH) {
            logSecurityEvent(`Input exceeds maximum length of ${config.MAX_LENGTH} characters`);
            return input.substring(0, config.MAX_LENGTH);
        }
        return input;
    }

    // Check for malicious patterns
    function isMalicious(input) {
        return maliciousPatterns.some(pattern => pattern.test(input));
    }

    // Sanitize URLs to ensure safe protocols
    function sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            if (!config.ALLOWED_PROTOCOLS.includes(parsed.protocol.replace(':', '').toLowerCase())) {
                logSecurityEvent(`Blocked unsafe protocol: ${parsed.protocol}`);
                return null;
            }
            return url;
        } catch (e) {
            logSecurityEvent(`Invalid URL format: ${url}`);
            return null;
        }
    }

    // Main sanitization function
    function sanitize(dirty) {
        // Validate input
        let clean = validateInput(dirty);
        if (!clean) return '';

        // Check for malicious patterns
        if (isMalicious(clean)) {
            logSecurityEvent(`Malicious pattern detected in input: ${clean.substring(0, 50)}...`);
            return '';
        }

        // Create a temporary DOM element for sanitization
        const div = document.createElement('div');
        div.textContent = clean; // Use textContent to avoid parsing HTML

        // Explicitly remove any HTML-like content
        config.FORBID_TAGS.forEach(tag => {
            const elements = div.getElementsByTagName(tag);
            while (elements.length) {
                elements[0].parentNode.removeChild(elements[0]);
            }
        });

        // Remove forbidden attributes from all elements (unlikely to be present due to textContent)
        const elements = div.getElementsByTagName('*');
        for (let element of elements) {
            for (let attr of config.FORBID_ATTR) {
                element.removeAttribute(attr);
            }
        }

        // Normalize and return clean text
        let sanitized = (div.textContent || div.innerText || '').trim();
        
        // Additional normalization for Unicode and control characters
        sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F\u2028-\u2029]/g, '');

        // Final length check
        if (sanitized.length > config.MAX_LENGTH) {
            logSecurityEvent('Sanitized output exceeds maximum length, truncating');
            sanitized = sanitized.substring(0, config.MAX_LENGTH);
        }

        return sanitized;
    }

    return {
        sanitize: sanitize,
        addHook: function() {}, // Stub for compatibility
        setConfig: function(newConfig) {
            // Allow safe configuration updates
            const safeConfig = {};
            for (const key of ['ALLOWED_TAGS', 'ALLOWED_ATTR', 'FORBID_TAGS', 'FORBID_ATTR', 'ALLOWED_PROTOCOLS']) {
                if (newConfig[key]) safeConfig[key] = newConfig[key];
            }
            Object.assign(config, safeConfig);
        }
    };
})();

// Utility function to sanitize input strings
function sanitizeInput(input) {
    try {
        const sanitized = DOMPurify.sanitize(input);
        if (!sanitized) {
            console.warn('[Security] Sanitization returned empty string');
        }
        return sanitized || null;
    } catch (error) {
        console.error('[Security] Sanitization error:', error);
        return null;
    }
}

// Utility function to sanitize data before storing in local storage
function sanitizeForLocalStorage(data) {
    if (typeof data === 'string') {
        return sanitizeInput(data);
    } else if (Array.isArray(data)) {
        return data.map(item => sanitizeForLocalStorage(item));
    } else if (typeof data === 'object' && data !== null) {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(data)) {
            // Only sanitize string values, preserve structure
            sanitizedObj[key] = typeof value === 'string' ? sanitizeInput(value) : sanitizeForLocalStorage(value);
        }
        return sanitizedObj;
    }
    return data; // Non-string, non-object, non-array values are returned as-is
}

// Validate and sanitize local storage operations
function safeLocalStorageSet(key, value) {
    try {
        // Sanitize the key
        const cleanKey = sanitizeInput(key);
        if (!cleanKey) {
            throw new Error('Invalid storage key');
        }

        // Sanitize the value
        const cleanValue = sanitizeForLocalStorage(value);

        // Check local storage size limit (5MB is typical)
        const serialized = JSON.stringify(cleanValue);
        if (serialized.length > 5 * 1024 * 1024) {
            throw new Error('Data too large for local storage');
        }

        localStorage.setItem(cleanKey, serialized);
    } catch (error) {
        console.error('[Security] Local storage error:', error);
    }
}

// Export functions
export { sanitizeInput, sanitizeForLocalStorage, safeLocalStorageSet };
