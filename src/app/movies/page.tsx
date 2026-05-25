"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";
import { auth } from "@/services/firebase";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  createMovie,
  getMovies,
  deleteMovie,
  updateMovie,
} from "@/services/movies";
import { MovieAdditionForm } from "@/components/MovieAdditionForm";

type Movie = {
  id: string;
  title: string;
  director: string;
};

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);

  const fetchMovies = async () => {
    const data = await getMovies();

    setMovies(data as Movie[]);
  };
  const [updateMovieId, setUpdateMovieId] = useState<string | null>(null);

  const handleCreateMovie = async (movie: {
    title: string;
    director: string;
  }) => {
    await createMovie(movie);

    fetchMovies();
  };

  const handleDeleteMovie = async (id: string) => {
    await deleteMovie(id);

    fetchMovies();
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

    fetchMovies();
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      } 
        await fetchMovies();
        setLoading(false);
      
    });

    return () => unsubscribe();
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
        <h1 className="text-3xl font-bold">Movies</h1>

        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <div className="mb-10 max-w-md">
        <MovieAdditionForm onSubmit={handleCreateMovie} />
      </div>

      <div className="space-y-4">
        <div className="text-xl font-bold">Movies List</div>
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
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setUpdateMovieId(movie.id)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteMovie(movie.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
