// contexts/AuthContext.tsx

import { createContext, useContext } from "react";
import { useManagePortfolio } from "../hooks/useManagePortfolio";


export interface PortfolioContextValue {
    managePortfolioController: ReturnType<typeof useManagePortfolio>;
}

export const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export const usePortfolioContext = (): PortfolioContextValue => {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolioContext must be used within PortfolioProvider');
    }
    return context;
};