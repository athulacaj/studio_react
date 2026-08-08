import { useState, useEffect, useRef, useCallback } from 'react';

function scrollToTheId(id: string) {
    // Normalize array notation (e.g. events[0]) to dot notation (events.0)
    const normalizedId = id.replace(/\[(\d+)\]/g, '.$1');
    const element = document.getElementById(normalizedId) || document.getElementById(id);

    if (element) {
        // Open any parent accordions that are closed
        let current = element.parentElement;
        let didOpenAccordion = false;

        while (current) {
            if (current.classList.contains('MuiAccordion-root') && !current.classList.contains('Mui-expanded')) {
                const summary = current.querySelector('.MuiAccordionSummary-root') as HTMLElement;
                if (summary) {
                    summary.click();
                    didOpenAccordion = true;
                }
            }
            current = current.parentElement;
        }

        // Scroll to the element, adding a slight delay if we had to open an accordion
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const originalBg = element.style.backgroundColor;
            element.style.transition = 'background-color 0.5s ease';
            element.style.backgroundColor = 'rgba(192, 132, 252, 0.3)';
            setTimeout(() => {
                element.style.backgroundColor = originalBg;
            }, 1500);
        }, didOpenAccordion ? 300 : 0);
    } else {
        console.warn(`Element with id "${id}" (normalized to "${normalizedId}") not found for scrolling.`);
    }
}

export const usePortfolioIframe = (
    htmlContent: string,
    setPortfolioData: (data: any) => void
) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Create and cleanup object URL for HTML content preview
    useEffect(() => {
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [htmlContent]);

    // Handle postMessage communication from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "ELEMENT_CLICKED") {
                console.log("Element clicked:", event.data);
                if (event.data.jsonPath) {
                    scrollToTheId(event.data.jsonPath);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    // Debounced data update to iframe
    const handleDataChange = useCallback((newData: any) => {
        setPortfolioData(newData);
        if (iframeDebounceRef.current) clearTimeout(iframeDebounceRef.current);
        iframeDebounceRef.current = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_DATA', data: newData }, '*');
            }
        }, 100);
    }, [setPortfolioData]);

    return {
        blobUrl,
        iframeRef,
        handleDataChange,
    };
};
