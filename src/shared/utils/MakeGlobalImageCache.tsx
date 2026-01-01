import { useEffect, useRef } from "react";

const InOnePage = 8;
const LIMIT = 8 + 3; // 3 preload when viewing full screent
// ImageCache.js
class RAMImageCache {
    limit: number;
    cache: Map<string, HTMLImageElement | undefined>;
    constructor(limit = 100) {
        this.limit = limit;
        this.cache = new Map(); // Stores Url -> HTMLImageElement
    }

    getImageElement(url: string, shouldAdd: boolean, props: any) {
        // 1. If exists, move to end (mark as recently used) and return it
        if (this.cache.has(url)) {
            const img = this.cache.get(url);
            if (img) {
                this.cache.delete(url);
                this.cache.set(url, img);

                // Update dynamic props
                if (props.style) Object.assign(img.style, props.style);
                if (props.alt) img.alt = props.alt;
                if (props.onLoad && img.complete) {
                    props.onLoad();
                } else if (props.onLoad) {
                    img.onload = props.onLoad;
                }

                return img;
            }
        }
        if (!shouldAdd) {
            return null;
        }

        // 2. If new, create standard DOM element
        const img = new Image();
        img.src = url;

        if (props.style) {
            Object.assign(img.style, props.style);
        }
        if (props.alt) {
            img.alt = props.alt;
        }
        if (props.onLoad) {
            img.onload = props.onLoad;
        }

        // 3. Store in cache
        this.cache.set(url, img);

        // 4. Cleanup if too big
        if (this.cache.size > this.limit) {
            const oldestKey = this.cache.keys().next().value;
            // const keys = Array.from(this.cache.keys());
            // const midKey = keys[Math.floor(keys.length / 2)];


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
export const globalImageCache = new RAMImageCache(LIMIT);


const CachedImage = ({ src, className, ...props }: { src: string | undefined; className?: string;[key: string]: any }) => {

    const { shouldAdd = true } = props ?? {};
    const containerRef = useRef<HTMLDivElement>(null);
    const isImageAvailableRef = useRef<boolean>(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !src) return;

        // 1. Get the PERSISTENT DOM element from our cache
        // If it was loaded before, this returns the existing object instanty
        const imgElement: HTMLImageElement | null = globalImageCache.getImageElement(src, shouldAdd, props);

        if (imgElement) {
            // 2. Apply any className props to the native element
            if (className) imgElement.className = className;

            // 3. Append it to the React container
            container.appendChild(imgElement);
            isImageAvailableRef.current = true;
        }


        // 4. CLEANUP function
        return () => {
            // When this component unmounts (scrolls away), we just 
            // REMOVE the child from the DOM.
            // We do NOT destroy the imgElement; it stays alive in globalImageCache.
            if (imgElement && container.contains(imgElement)) {
                container.removeChild(imgElement);
            }
        };
    }, [src, className]);

    // if (isImageAvailableRef.current == false) {
    //     return <img src={src} className={className} {...props} />
    // }

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