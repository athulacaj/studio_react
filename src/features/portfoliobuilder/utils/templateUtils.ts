/**
 * Template utility functions for portfolio builder
 * Handles fetching, processing, and injecting data into HTML templates
 */

/**
 * Fetches a template HTML file from the public templates directory
 * @param {string} templateName - Name of the template (e.g., 'modern', 'vintage')
 * @returns {Promise<string>} The HTML content of the template
 */
export const fetchTemplate = async (templateName) => {
    try {
        const response = await fetch(`/templates/${templateName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        const htmlContent = await response.text();
        return htmlContent;
    } catch (error) {
        console.error(`Error fetching template ${templateName}:`, error);
        throw error;
    }
};

/**
 * Injects portfolio data into an HTML template
 * The template expects a global 'data' variable containing the portfolio information
 * 
 * @param {object} portfolioData - The portfolio data to inject
 */
export const injectDataIntoTemplate = (htmlContent, portfolioData) => {
    try {
        // Create a script tag that defines the data variable
    delete portfolioData.design.templateHtml;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const head = doc.querySelector('head');
    const script = document.createElement('script');
    script.textContent = `window.data = ${JSON.stringify(portfolioData, null, 2)}`;
    head.appendChild(script);
    const newHtmlContent = doc.documentElement.outerHTML;
    return newHtmlContent;
        // Find the closing </head> tag and insert our data script before it
        // This ensures the data is available before any template scripts run
   
    } catch (error) {
        console.error('Error injecting data into template:', error);
        throw new Error('Failed to inject data into template');
    }
};

/**
 * Creates a blob URL from HTML content for iframe rendering
 * This allows safe rendering of HTML in an isolated context
 * 
 * @param {string} htmlContent - The complete HTML content
 * @returns {string} Blob URL that can be used as iframe src
 */
export const createBlobUrl = (htmlContent) => {
    try {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error creating blob URL:', error);
        throw new Error('Failed to create blob URL for template');
    }
};

/**
 * Revokes a blob URL to free up memory
 * Should be called when the blob URL is no longer needed
 * 
 * @param {string} blobUrl - The blob URL to revoke
 */
export const revokeBlobUrl = (blobUrl) => {
    try {
        if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
        }
    } catch (error) {
        console.error('Error revoking blob URL:', error);
    }
};

/**
 * Validates if HTML content appears to be a valid template
 * Basic check for required HTML structure
 * 
 * @param {string} htmlContent - HTML content to validate
 * @returns {boolean} True if content appears valid
 */
export const isValidTemplate = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return false;
    }

    // Check for basic HTML structure
    const hasHtmlTag = /<html/i.test(htmlContent);
    const hasHeadTag = /<head/i.test(htmlContent);
    const hasBodyTag = /<body/i.test(htmlContent);

    return hasHtmlTag && hasHeadTag && hasBodyTag;
};

/**
 * Gets the list of available templates
 * @returns {Array} List of available template configurations
 */
export const getAvailableTemplates = () => {
    return [
        {
            value: 'modern',
            label: 'Modern',
            description: 'Clean, contemporary design with smooth animations'
        },
        {
            value: 'vintage',
            label: 'Vintage',
            description: 'Classic, timeless aesthetic with elegant typography'
        },
        {
            value: 'classic',
            label: 'Classic',
            description: 'Traditional portfolio layout (Coming Soon)',
            disabled: true
        }
    ];
};
