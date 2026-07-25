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
const USERS_DOCUMENT = 'users';

const getUserPortfoliosCollection = (userId: string) => {
  return collection(db, PORTFOLIOS_COLLECTION, USERS_DOCUMENT, userId);
};

const getPortfolioDocRef = (userId: string, eventPath: string) => {
  return doc(db, PORTFOLIOS_COLLECTION, USERS_DOCUMENT, userId, eventPath);
};

/**
 * Save or update a portfolio document.
 * Enforces unique eventPath (URL slug) per user.
 */
export const savePortfolio = async (
  userId: string,
  portfolio: EventPortfolio,
  isNew: boolean
): Promise<string> => {
  const eventPath = portfolio.eventPath.trim();
  const docRef = getPortfolioDocRef(userId, eventPath);

  if (isNew) {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      throw new Error('URL already taken');
    }
  }

  await setDoc(
    docRef,
    {
      ...portfolio,
      id: eventPath,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: isNew ? serverTimestamp() : (portfolio.createdAt || serverTimestamp()),
    },
    { merge: true }
  );

  return eventPath;
};

/**
 * Get a portfolio by its projectId.
 */
export const getPortfolioByProjectId = async (
  userId: string,
  projectId: string
): Promise<EventPortfolio | null> => {
  const q = query(
    getUserPortfoliosCollection(userId),
    where('projectId', '==', projectId)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as EventPortfolio;
  }
  return null;
};

/**
 * Get a portfolio by ID (eventPath).
 */
export const getPortfolio = async (
  userId: string,
  eventPath: string
): Promise<EventPortfolio | null> => {
  const docRef = getPortfolioDocRef(userId, eventPath);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as EventPortfolio;
  }
  return null;
};

/**
 * Get a published portfolio by its userId and eventPath.
 */
export const getPublishedPortfolio = async (
  userId: string,
  eventPath: string
): Promise<EventPortfolio | null> => {
  const docRef = getPortfolioDocRef(userId, eventPath);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as EventPortfolio;
    if (data.published) {
      return data;
    }
  }
  return null;
};

/**
 * Publish a portfolio — sets published to true.
 */
export const publishPortfolio = async (
  userId: string,
  eventPath: string
): Promise<void> => {
  const docRef = getPortfolioDocRef(userId, eventPath);
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
  const q = query(getUserPortfoliosCollection(userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => d.data() as EventPortfolio);
};
