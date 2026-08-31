import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';

function scrollToTheId(id: string) {
    // Normalize array notation (e.g. events[0]) to dot notation (events.0)
    const normalizedId = id.replace(/\[(\d+)\]/g, '.$1');
    let element = document.getElementById(normalizedId) || document.getElementById(id);
    
    // Fallback: If section container wasn't found, try appending '.content'
    if (!element && !normalizedId.includes('.')) {
        element = document.getElementById(`${normalizedId}.content`);
    }

    if (element) {
        let didOpenAccordion = false;
        
        // Find the input first so we can open any accordions it is nested inside
        const input = element.querySelector('input') || element.querySelector('textarea');

        // Traverse up from the input (or element if no input) to open any closed parent accordions
        let current: HTMLElement | null = input || element;

        while (current) {
            if (current.classList.contains('MuiAccordion-root') && !current.classList.contains('Mui-expanded')) {
                const summary = current.querySelector(':scope > .MuiAccordionSummary-root') as HTMLElement || current.querySelector('.MuiAccordionSummary-root') as HTMLElement;
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

            // Clear any lingering inline styles that might have been set previously
            element.style.removeProperty('background-color');
            element.style.removeProperty('transition');

            // Try to focus an input if it exists
            if (input) {
                (input as HTMLElement).focus({ preventScroll: true });
            }

            // Restart CSS keyframe animation cleanly
            element.classList.remove('form-field-highlight');
            void element.offsetWidth; // Force reflow to restart CSS animation
            element.classList.add('form-field-highlight');

            // Clean up class after animation finishes
            const timer = setTimeout(() => {
                element.classList.remove('form-field-highlight');
            }, 1800);

            const handleAnimEnd = () => {
                clearTimeout(timer);
                element.classList.remove('form-field-highlight');
                element.removeEventListener('animationend', handleAnimEnd);
            };
            element.addEventListener('animationend', handleAnimEnd, { once: true });
        }, didOpenAccordion ? 300 : 0);
    } else {
        console.warn(`Element with id "${id}" (normalized to "${normalizedId}") not found for scrolling.`);
    }
}

function getByPath(obj: any, path: string[]): any {
    return path.reduce((acc, key) => acc?.[key], obj);
}

function findFieldByValue(data: any, textToFind: string): { path: string[]; jsonPath: string; fieldKey: string; section: string; label: string } | null {
    if (!data || !textToFind) return null;
    const cleanText = textToFind.trim().toLowerCase();
    if (!cleanText) return null;
    let match: any = null;

    const crawl = (node: any, path: string[], breadcrumbs: string[], section: string) => {
        if (match) return;
        if (node === null || typeof node !== 'object') {
            const strVal = String(node).trim().toLowerCase();
            if (strVal === cleanText || (cleanText.length > 3 && strVal.includes(cleanText))) {
                match = {
                    path,
                    jsonPath: path.join('.'),
                    fieldKey: breadcrumbs[breadcrumbs.length - 1] || path[path.length - 1] || 'field',
                    section,
                    label: breadcrumbs.filter((b) => b !== 'content').join(' › ')
                };
            }
            return;
        }
        if (Array.isArray(node)) {
            node.forEach((item, index) => {
                crawl(item, [...path, index.toString()], [...breadcrumbs, `Item ${index + 1}`], section);
            });
            return;
        }
        Object.entries(node).forEach(([k, v]) => {
            crawl(v, [...path, k], [...breadcrumbs, k], section || k);
        });
    };

    Object.entries(data).forEach(([secKey, secVal]) => {
        if (secKey !== 'theme' && secKey !== 'activeTheme') {
            crawl(secVal, [secKey], [secKey], secKey);
        }
    });

    return match;
}

const CLICK_INTERCEPTOR_SCRIPT = `
<script id="__portfolio_click_interceptor__">
(function() {
  document.addEventListener("click", function(event) {
    var target = event.target;
    if (!target) return;
    
    // Find closest element with data-json-path
    var curr = target;
    var jsonPath = null;
    while (curr && curr !== document.body) {
      if (curr.dataset && curr.dataset.jsonPath) {
        jsonPath = curr.dataset.jsonPath;
        break;
      }
      curr = curr.parentElement;
    }
    
    var text = (target.innerText || target.textContent || "").trim();
    var tagName = target.tagName ? target.tagName.toLowerCase() : "";
    var isImg = tagName === 'img' || (target.src ? true : false);
    var imgSrc = target.src || (target.style ? target.style.backgroundImage : "") || "";

    window.parent.postMessage({
      type: "ELEMENT_CLICKED",
      jsonPath: jsonPath,
      text: text,
      tagName: tagName,
      isImg: isImg,
      imgSrc: imgSrc
    }, "*");
  }, true);
})();
</script>
`;

export const usePortfolioIframe = (
    htmlContent: string, iframeRef: React.RefObject<HTMLIFrameElement | null>,
    setPortfolioData: (data: any) => void
) => {
    const iframeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousBlobUrlRef = useRef<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    // Create blob URL when htmlContent changes, properly revoking the old one.
    useEffect(() => {
        if (!htmlContent) {
            // Revoke any existing URL when content is cleared
            if (previousBlobUrlRef.current) {
                URL.revokeObjectURL(previousBlobUrlRef.current);
                previousBlobUrlRef.current = null;
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBlobUrl(null);
            return;
        }

        // Inject click interceptor script so all clicked elements are captured
        let finalHtml = htmlContent;
        if (!finalHtml.includes('__portfolio_click_interceptor__')) {
            if (finalHtml.includes('</body>')) {
                finalHtml = finalHtml.replace('</body>', `${CLICK_INTERCEPTOR_SCRIPT}\n</body>`);
            } else {
                finalHtml = `${finalHtml}\n${CLICK_INTERCEPTOR_SCRIPT}`;
            }
        }

        // Create a new blob URL
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const newUrl = URL.createObjectURL(blob);

        // Revoke the old URL only after the new one is ready
        if (previousBlobUrlRef.current) {
            URL.revokeObjectURL(previousBlobUrlRef.current);
        }
        previousBlobUrlRef.current = newUrl;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBlobUrl(newUrl);

        // Cleanup on unmount: revoke the active URL and clear debounce timer
        return () => {
            if (previousBlobUrlRef.current) {
                URL.revokeObjectURL(previousBlobUrlRef.current);
                previousBlobUrlRef.current = null;
            }
            if (iframeDebounceRef.current) {
                clearTimeout(iframeDebounceRef.current);
                iframeDebounceRef.current = null;
            }
        };
    }, [htmlContent]);

    // Handle postMessage communication from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (Object.keys(event.data).length <= 2) {
                return;
            }
            if (event.data?.type === "ELEMENT_CLICKED") {
                console.log("Element clicked:", event.data);
                const currentData = usePortfolioStore.getState().portfolioData;
                let pathArray: string[] = [];

                if (event.data.jsonPath) {
                    const normalized = event.data.jsonPath.replace(/\[(\d+)\]/g, '.$1');
                    pathArray = normalized.split('.').filter(Boolean);
                    scrollToTheId(event.data.jsonPath);
                }


                // If path not resolved from jsonPath or path points to whole object/section, try matching text
                if (currentData) {
                    if (pathArray.length === 0 && event.data.text) {
                        const match = findFieldByValue(currentData, event.data.text);
                        if (match) {
                            pathArray = match.path;
                            scrollToTheId(match.jsonPath);
                        }
                    }

                    if (pathArray.length > 0) {
                        let val = getByPath(currentData, pathArray);

                        // If val is an object (container/card), we intentionally do NOT try to drill down
                        // via text search anymore. We pass the whole object so the dialog renders all fields.

                        // Allow objects to fall through so we can show all their fields in the dialog.

                        const section = pathArray[0] || 'Content';
                        const rawKey = pathArray[pathArray.length - 1] || 'field';
                        const fieldKey = isNaN(Number(rawKey))
                            ? rawKey.charAt(0).toUpperCase() + rawKey.slice(1)
                            : `Item ${Number(rawKey) + 1}`;

                        const labelParts = pathArray
                            .filter((p) => p !== 'content')
                            .map((p) => (isNaN(Number(p)) ? p.charAt(0).toUpperCase() + p.slice(1) : `Item ${Number(p) + 1}`));

                        const label = labelParts.join(' › ');

                        const isImage =
                            (typeof val === 'string' &&
                                (val.startsWith('http') ||
                                    val.startsWith('/') ||
                                    /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(val) ||
                                    /image|img|photo|logo|banner|pic|src/i.test(rawKey))) ||
                            event.data.isImg;

                        usePortfolioStore.getState().setSelectedElement({
                            jsonPath: pathArray.join('.'),
                            path: pathArray,
                            value: val ?? event.data.text ?? '',
                            label: label || fieldKey,
                            fieldKey,
                            section: section.charAt(0).toUpperCase() + section.slice(1),
                            isImage,
                        });
                    }
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
    }, [setPortfolioData, iframeRef]);

    return {
        blobUrl,
        handleDataChange,
    };
};
