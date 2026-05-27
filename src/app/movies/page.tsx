"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  createMovie,
  listenToMoviesCollection,
  getOneMovie,
  deleteMovie,
  updateMovie,
} from "@/services/movies";
import { MovieAdditionForm } from "@/components/MovieAdditionForm";
import {
  DASHED_LINE,
  GET_MOVIE,
  GET_ONE_MOVIE_BY_ID,
  LOGOUT,
  MOVIES,
  MOVIES_LIST,
  EDIT,
  DELETE,
  VIEW,
} from "../helper";

type Movie = {
  id: string;
  title: string;
  director: string;
};

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [updateMovieId, setUpdateMovieId] = useState<string | null>(null);
  const [movieId, setMovieId] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  const handleFetchOneMovie = async () => {
    try {
      const movie = await getOneMovie(movieId);
      setSelectedMovie(movie as Movie);
    } catch (err) {
      setSelectedMovie(null);
      alert((err as Error).message);
    }
  };

  const handleCreateMovie = async (movie: {
    title: string;
    director: string;
  }) => {
    await createMovie(movie);
  };

  const handleDeleteMovie = async (id: string) => {
    await deleteMovie(id);
  };

  const handleUpdateMovie = async (
    id: string,
    movie: {
      title: string;
      director: string;
    },
  ) => {
    await updateMovie(id, movie);

    setUpdateMovieId(null);
  };

  useEffect(() => {
    let unsubscribeMovies: (() => void) | undefined;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      unsubscribeMovies = listenToMoviesCollection((data) => {
        setMovies(data as Movie[]);
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
      unsubscribeMovies?.();
    };
  }, [router]);

  const handleLogout = async () => {
    await logout();

    router.push("/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-4">{MOVIES}</h1>

        <Button onClick={handleLogout}>{LOGOUT}</Button>
      </div>

      <div className="mb-10 max-w-md">
        <MovieAdditionForm onSubmit={handleCreateMovie} />
      </div>

      <div>{DASHED_LINE}</div>

      <div className="space-y-4">
        <div className="mb-10 max-w-md">
          <h2 className="text-xl font-bold">{GET_ONE_MOVIE_BY_ID}</h2>
          <input
            className="w-full rounded border p-2"
            placeholder="Enter movie ID"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
          />
          <Button className="mt-2" onClick={handleFetchOneMovie}>
            {GET_MOVIE}
          </Button>

          {selectedMovie && (
            <div className="mt-4">
              <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedMovie.title}</h3>
                  <p>{selectedMovie.director}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>{DASHED_LINE}</div>

        <div className="text-xl font-bold">{MOVIES_LIST}</div>
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex items-center justify-between rounded border p-4"
          >
            {updateMovieId === movie.id ? (
              <MovieAdditionForm
                initialValues={{
                  title: movie.title,
                  director: movie.director,
                }}
                buttonText="Update Movie"
                onSubmit={(updateMovieData) =>
                  handleUpdateMovie(movie.id, updateMovieData)
                }
                onCancel={() => setUpdateMovieId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">{movie.title}</h2>

                  <p>{movie.director}</p>
                  <p>Id: {movie.id}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/movies/${movie.id}`)}
              >
                {VIEW}
              </Button>

              <Button
                variant="outline"
                onClick={() => setUpdateMovieId(movie.id)}
              >
                {EDIT}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMovie(movie.id)}
              >
                {DELETE}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
