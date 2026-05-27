"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listenToMovieDocument } from "@/services/movies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Movie } from "@/types/projectTypes";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const unsubscribe = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!id) return;

    unsubscribe.current = listenToMovieDocument(id, (data) => {
      if (data) {
        setMovie(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => unsubscribe.current?.();
  }, [id]);

  if (loading) {
    return <p className="p-10">Loading...</p>;
  }

  if (notFound) {
    return (
      <div className="p-10">
        <p className="text-red-500">Movie not found.</p>
        <Button className="mt-4" onClick={() => router.push("/movies")}>
          Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{movie?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Director:</span> {movie?.director}
          </p>
          <p>
            <span className="font-medium">ID:</span> {movie?.id}
          </p>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push("/movies")}
          >
            Back to Movies
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
