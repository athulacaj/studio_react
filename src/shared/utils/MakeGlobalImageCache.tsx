import { useEffect, useRef } from "react";

// ImageCache.js
class RAMImageCache {
    limit: number;
    cache: Map<string, HTMLImageElement | undefined>;
    constructor(limit = 100) {
        this.limit = limit;
        this.cache = new Map(); // Stores Url -> HTMLImageElement
    }

    getImageElement(url: string, props: any) {
        // 1. If exists, move to end (mark as recently used) and return it
        if (this.cache.has(url)) {
            const img = this.cache.get(url);
            this.cache.delete(url);
            this.cache.set(url, img);
            return img;
        }

        // 2. If new, create standard DOM element
        const img = new Image(

        );
        img.src = url;

        if (props.style) {
            Object.assign(img.style, props.style);
        }

        // 3. Store in cache
        this.cache.set(url, img);

        // 4. Cleanup if too big
        if (this.cache.size > this.limit) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey); // The browser will now garbage collect this one
            }
        }

        return img;
    }

    clear() {
        this.cache.clear();
    }
}
// Export a single shared instance
export const globalImageCache = new RAMImageCache(100);


const CachedImage = ({ src, className, props = {} }: { src: string; className?: string; props?: any }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !src) return;

        // 1. Get the PERSISTENT DOM element from our cache
        // If it was loaded before, this returns the existing object instanty
        const imgElement: any = globalImageCache.getImageElement(src, props);

        // 2. Apply any className props to the native element
        if (className) imgElement.className = className;

        // 3. Append it to the React container
        container.appendChild(imgElement);

        // 4. CLEANUP function
        return () => {
            // When this component unmounts (scrolls away), we just 
            // REMOVE the child from the DOM.
            // We do NOT destroy the imgElement; it stays alive in globalImageCache.
            if (container.contains(imgElement)) {
                container.removeChild(imgElement);
            }
        };
    }, [src, className]);

    return (
        // We render a placeholder div that we will manually fill
        <div
            ref={containerRef}
        // style={{ width: '100%', height: '100%' }} // Ensure container has size
        />
    );
};

function clearGlobalImageCache() {
    globalImageCache.clear();
}


export { CachedImage, clearGlobalImageCache };