import React, { useEffect, useRef, useMemo } from 'react';
import { usePortfolioContext } from '../context/portfolioGlobalContext';

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
    const { iframeRef }: { iframeRef: React.RefObject<HTMLIFrameElement | null> } = usePortfolioContext()
    const iframeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Create and cleanup object URL for HTML content preview
    const blobUrl = useMemo(() => {
        if (!htmlContent) return null;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }, [htmlContent]);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

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
    const handleDataChange = (newData: any) => {
        setPortfolioData(newData);
        if (iframeDebounceRef.current) clearTimeout(iframeDebounceRef.current);
        iframeDebounceRef.current = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_DATA', data: newData }, '*');
            }
        }, 100);
    }

    return {
        blobUrl,
        handleDataChange,
    };
};
