/**
 * Sanitizes a message to prevent XSS attacks by escaping HTML.
 * 
 * @param {string} message - The message to sanitize.
 * @return {string} The sanitized message.
 */
module.exports = {
    sanitizeMessage: (message)=> {
        return message.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Validates the input to ensure it is neither empty nor contains only whitespace.
     * 
     * @param {string} input - The input to validate.
     * @return {boolean} True if the input is valid, false otherwise.
     */
    isValidInput: (input) =>{
        return typeof input === 'string' && input.trim().length > 0;
    }
}