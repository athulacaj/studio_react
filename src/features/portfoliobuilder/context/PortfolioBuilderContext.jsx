import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../../../config/firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs
} from 'firebase/firestore';

const PortfolioBuilderContext = createContext();

export const usePortfolioBuilder = () => {
    const context = useContext(PortfolioBuilderContext);
    if (!context) {
        throw new Error('usePortfolioBuilder must be used within PortfolioBuilderProvider');
    }
    return context;
};

export const PortfolioBuilderProvider = ({ children }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [templates, setTemplates] = useState([]);

    // Load user's portfolio
    const loadPortfolio = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', userId);
            const portfolioSnap = await getDoc(portfolioRef);

            if (portfolioSnap.exists()) {
                setPortfolio({ id: portfolioSnap.id, ...portfolioSnap.data() });
            } else {
                setPortfolio(null);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading portfolio:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new portfolio
    const createPortfolio = async (userId, portfolioData) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', userId);
            const newPortfolio = {
                ...portfolioData,
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                published: false
            };

            await setDoc(portfolioRef, newPortfolio);
            setPortfolio({ id: userId, ...newPortfolio });
            return { success: true, portfolio: newPortfolio };
        } catch (err) {
            setError(err.message);
            console.error('Error creating portfolio:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update portfolio
    const updatePortfolio = async (userId, updates) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', userId);
            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(portfolioRef, updatedData);
            setPortfolio(prev => ({ ...prev, ...updatedData }));
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Error updating portfolio:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete portfolio
    const deletePortfolio = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', userId);
            await deleteDoc(portfolioRef);
            setPortfolio(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Error deleting portfolio:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Publish/Unpublish portfolio
    const togglePublish = async (userId, published) => {
        return updatePortfolio(userId, { published });
    };

    // Load available templates
    const loadTemplates = async () => {
        try {
            const templatesRef = collection(db, 'templates');
            const q = query(templatesRef, where('active', '==', true));
            const querySnapshot = await getDocs(q);

            const templatesData = [];
            querySnapshot.forEach((doc) => {
                templatesData.push({ id: doc.id, ...doc.data() });
            });

            setTemplates(templatesData);
        } catch (err) {
            console.error('Error loading templates:', err);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const value = {
        portfolio,
        loading,
        error,
        templates,
        loadPortfolio,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        togglePublish
    };

    return (
        <PortfolioBuilderContext.Provider value={value}>
            {children}
        </PortfolioBuilderContext.Provider>
    );
};
