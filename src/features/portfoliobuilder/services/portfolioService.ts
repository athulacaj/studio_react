import { db } from '../../../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { EventPortfolio } from '../types/types';

const PORTFOLIOS_COLLECTION = 'eventPortfolios';

/**
 * Save or update a portfolio document.
 */
export const savePortfolio = async (
  userId: string,
  portfolio: EventPortfolio
): Promise<string> => {
  const portfolioId = portfolio.id || doc(collection(db, PORTFOLIOS_COLLECTION)).id;

  const docRef = doc(db, PORTFOLIOS_COLLECTION, portfolioId);
  await setDoc(
    docRef,
    {
      ...portfolio,
      id: portfolioId,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: portfolio.id ? portfolio.createdAt : serverTimestamp(),
    },
    { merge: true }
  );

  return portfolioId;
};

/**
 * Get a portfolio by ID.
 */
export const getPortfolio = async (
  portfolioId: string
): Promise<EventPortfolio | null> => {
  const docRef = doc(db, PORTFOLIOS_COLLECTION, portfolioId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as EventPortfolio;
  }
  return null;
};

/**
 * Get a published portfolio by its eventPath (public URL slug).
 */
export const getPublishedPortfolio = async (
  eventPath: string
): Promise<EventPortfolio | null> => {
  const q = query(
    collection(db, PORTFOLIOS_COLLECTION),
    where('eventPath', '==', eventPath),
    where('published', '==', true)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as EventPortfolio;
  }
  return null;
};

/**
 * Publish a portfolio — sets published to true.
 */
export const publishPortfolio = async (
  portfolioId: string
): Promise<void> => {
  const docRef = doc(db, PORTFOLIOS_COLLECTION, portfolioId);
  await updateDoc(docRef, {
    published: true,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get all portfolios for a user.
 */
export const getUserPortfolios = async (
  userId: string
): Promise<EventPortfolio[]> => {
  const q = query(
    collection(db, PORTFOLIOS_COLLECTION),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => d.data() as EventPortfolio);
};
