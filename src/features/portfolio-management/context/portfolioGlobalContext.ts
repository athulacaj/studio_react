// contexts/AuthContext.tsx

import { createContext, useContext } from "react";


export interface PortfolioContextValue {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export const usePortfolioContext = (): PortfolioContextValue => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolioContext must be used within PortfolioProvider');
    }
    return context;
};