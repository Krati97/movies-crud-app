import { db } from "./firebase";
import { MovieDoc } from "@/types/projectTypes";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const moviesCollection = collection(db, "movies");

export const createMovie = async (movie: {
  title: string;
  director: string;
}) => {
  await addDoc(moviesCollection, movie);
};

export const getOneMovie = async (id: string) => {
  const docRef = doc(db, "movies", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw {
        message: "Movie with this ID does not exist",
    };
  }
};

export const listenToMoviesCollection = (
  onUpdate: (movies: MovieDoc[]) => void,
) => {
  return onSnapshot(moviesCollection, (snapshot) => {
    const movies = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<MovieDoc, "id">),
    }));

    onUpdate(movies);
  });
};

export const listenToMovieDocument = (
  id: string,
  onUpdate: (movie: MovieDoc | null) => void,
) => {
// Reference to one document in the "movies" collection with the given id
  const docRef = doc(db, "movies", id);

  return onSnapshot(docRef, (docSnap) => {
    onUpdate(
      docSnap.exists()
        ? ({ id: docSnap.id, ...docSnap.data() } as MovieDoc)
        : null,
    );
  });
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
