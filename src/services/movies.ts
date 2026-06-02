import { db } from "./firebase";
import { ActorDoc, ActorInput, MovieDoc } from "@/types/projectTypes";
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
const actorsSubcollectionName = "actors";

const getActorsCollection = (movieId: string) =>
  collection(db, "movies", movieId, actorsSubcollectionName);

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

export const createActor = async (movieId: string, actor: ActorInput) => {
  await addDoc(getActorsCollection(movieId), actor);
};

export const getOneActor = async (movieId: string, actorId: string) => {
  const actorRef = doc(db, "movies", movieId, actorsSubcollectionName, actorId);
  const actorSnap = await getDoc(actorRef);

  if (actorSnap.exists()) {
    return { id: actorSnap.id, ...actorSnap.data() } as ActorDoc;
  }

  throw {
    message: `Actor with this ID(${actorId}) does not exist`,
  };
};

export const listenToActorsCollection = (
  movieId: string,
  onUpdate: (actors: ActorDoc[]) => void,
) => {
  return onSnapshot(getActorsCollection(movieId), (snapshot) => {
    const actors = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ActorDoc, "id">),
    }));

    onUpdate(actors);
  });
};

export const listenToActorDocument = (
  movieId: string,
  actorId: string,
  onUpdate: (actor: ActorDoc | null) => void,
) => {
  const actorRef = doc(db, "movies", movieId, actorsSubcollectionName, actorId);

  return onSnapshot(actorRef, (actorSnap) => {
    onUpdate(
      actorSnap.exists()
        ? ({ id: actorSnap.id, ...actorSnap.data() } as ActorDoc)
        : null,
    );
  });
};

export const updateActor = async (
  movieId: string,
  actorId: string,
  actor: ActorInput,
) => {
  await updateDoc(
    doc(db, "movies", movieId, actorsSubcollectionName, actorId),
    {
      ...actor,
    },
  );
};

export const deleteActor = async (movieId: string, actorId: string) => {
  await deleteDoc(doc(db, "movies", movieId, actorsSubcollectionName, actorId));
};
