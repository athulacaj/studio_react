import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

    // Check domain availability
    const checkDomainAvailability = useCallback(async (domain) => {
        try {
            const docRef = doc(db, 'domains', domain);
            const docSnap = await getDoc(docRef);
            return !docSnap.exists();
        } catch (err) {
            console.error("Error checking domain:", err);
            throw err;
        }
    }, []);

    // Load user's portfolio
    const loadPortfolio = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            // Since we are using userId as document ID now, we can try to get it directly
            // But to be safe and support legacy or if we change strategy, query is fine too.
            // However, if we change createPortfolio to use userId as ID, we can just use getDoc.
            // Let's stick to getDoc(doc(db, 'portfolios', userId)) for simplicity if we enforce 1:1.

            const docRef = doc(db, 'portfolios', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setPortfolio({ id: docSnap.id, ...docSnap.data() });
            } else {
                setPortfolio(null);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading portfolio:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new portfolio
    const createPortfolio = useCallback(async (userId, portfolioData) => {
        setLoading(true);
        setError(null);
        try {
            // We use userId as the portfolio ID
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
    }, []);

    // Update portfolio
    const updatePortfolio = useCallback(async (portfolioId, updates) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', portfolioId);
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
    }, []);

    // Delete portfolio
    const deletePortfolio = useCallback(async (portfolioId) => {
        setLoading(true);
        setError(null);
        try {
            const portfolioRef = doc(db, 'portfolios', portfolioId);

            // Also need to delete the domain mapping if it exists
            // We need to know the domain. We can get it from current state or read the doc.
            // Assuming portfolio state is up to date or we read it.
            // For safety, let's read the doc first if we don't have it, but here we assume we might.
            // Actually, simpler: just delete the portfolio. The domain doc might become orphaned 
            // but we should probably clean it up.
            // Let's try to read the portfolio to get the domain.
            const docSnap = await getDoc(portfolioRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.basicInfo?.domain && data.published) {
                    await deleteDoc(doc(db, 'domains', data.basicInfo.domain));
                }
            }

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
    }, []);

    // Publish/Unpublish portfolio
    const togglePublish = useCallback(async (portfolioId, published) => {
        setLoading(true);
        try {
            const portfolioRef = doc(db, 'portfolios', portfolioId);
            const portfolioSnap = await getDoc(portfolioRef);

            if (!portfolioSnap.exists()) {
                throw new Error("Portfolio not found");
            }

            const portfolioData = portfolioSnap.data();
            const domain = portfolioData.basicInfo?.domain;

            if (published) {
                if (!domain) {
                    throw new Error("Domain is required to publish");
                }

                // Check if domain is available in domains collection
                const domainRef = doc(db, 'domains', domain);
                const domainSnap = await getDoc(domainRef);

                if (domainSnap.exists() && domainSnap.data().portfolioId !== portfolioId) {
                    throw new Error("Domain is already taken");
                }

                // Create domain mapping
                await setDoc(domainRef, {
                    portfolioId,
                    userId: portfolioData.userId,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // If unpublishing, remove domain mapping
                if (domain) {
                    await deleteDoc(doc(db, 'domains', domain));
                }
            }

            await updateDoc(portfolioRef, { published });
            setPortfolio(prev => ({ ...prev, published }));
            return { success: true };
        } catch (err) {
            console.error("Error toggling publish:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Get portfolio by domain
    const getPortfolioByDomain = useCallback(async (domain) => {
        setLoading(true);
        setError(null);
        try {
            const domainRef = doc(db, 'domains', domain);
            const domainSnap = await getDoc(domainRef);

            if (!domainSnap.exists()) {
                throw new Error("Portfolio not found");
            }

            const { portfolioId } = domainSnap.data();
            const portfolioRef = doc(db, 'portfolios', portfolioId);
            const portfolioSnap = await getDoc(portfolioRef);

            if (!portfolioSnap.exists()) {
                throw new Error("Portfolio data missing");
            }

            return { id: portfolioSnap.id, ...portfolioSnap.data() };
        } catch (err) {
            console.error("Error getting portfolio by domain:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load available templates
    const loadTemplates = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const value = {
        portfolio,
        loading,
        error,
        templates,
        loadPortfolio,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        togglePublish,
        checkDomainAvailability,
        getPortfolioByDomain
    };

    return (
        <PortfolioBuilderContext.Provider value={value}>
            {children}
        </PortfolioBuilderContext.Provider>
    );
};
