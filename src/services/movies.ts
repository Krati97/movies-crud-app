import { db } from "./firebase";

import {
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  collection,
  doc,
} from "firebase/firestore";

const moviesCollection = collection(db, "movies");

export const createMovie = async (movie: {
  title: string;
  director: string;
}) => {
  await addDoc(moviesCollection, movie);
};

export const getMovies = async () => {
  const snapshot = await getDocs(moviesCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteMovie = async (id: string) => {
  await deleteDoc(doc(db, "movies", id));
};

export const updateMovie = async (
  id: string,
  movie: {
    title: string;
    director: string;
  },
) => {
  await updateDoc(doc(db, "movies", id), {
    ...movie,
  });
};
