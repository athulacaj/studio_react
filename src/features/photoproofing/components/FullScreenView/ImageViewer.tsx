import React, { useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { CachedImage } from '../../../../shared/utils/MakeGlobalImageCache';


interface ImageViewerProps {
    transformRef: React.RefObject<any>;
    image: string;
    imageName?: string;
    onImageClick: (e: any) => void;
    onLoad?: () => void;
}





const ImageViewer: React.FC<ImageViewerProps> = ({
    transformRef,
    image,
    imageName,
    onImageClick,
    onLoad
}) => {
    return (
        <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={0.5}
            maxScale={8}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
        >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <TransformComponent
                    wrapperStyle={{
                        width: "100%",
                        height: "100%",
                    }}
                    contentStyle={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        onClick={onImageClick}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'grab'
                        }}
                    >
                        <CachedImage src={image} className="cached-image" props={
                            {
                                alt: imageName ?? '',
                                onLoad: onLoad,
                                style: {
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    transition: 'opacity 0.3s ease-in-out',
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }
                            }
                        } />
                        {/* <img
                            src={image}
                            alt={imageName ?? ''}
                            onLoad={onLoad}
                            style={{
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                transition: 'opacity 0.3s ease-in-out',
                                pointerEvents: 'none',
                                userSelect: 'none'
                            }}
                        /> */}
                    </div>
                </TransformComponent>
            )}
        </TransformWrapper>
    );
};

export default ImageViewer;
