"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  createActor,
  deleteActor,
  listenToActorsCollection,
  listenToMovieDocument,
  updateActor,
} from "@/services/movies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Actor, ActorInput, Movie } from "@/types/projectTypes";
import { ActorForm } from "@/components/ActorForm";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [editActorId, setEditActorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  const unsubscribeActors = useRef<(() => void) | undefined>(undefined);

  const handleCreateActor = async (actor: ActorInput) => {
    if (!id) return;
    await createActor(id, actor);
  };

  const handleUpdateActor = async (actorId: string, actor: ActorInput) => {
    if (!id) return;
    await updateActor(id, actorId, actor);
    setEditActorId(null);
  };

  const handleDeleteActor = async (actorId: string) => {
    if (!id) return;
    await deleteActor(id, actorId);
  };

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

    unsubscribeActors.current = listenToActorsCollection(id, (data) => {
      setActors(data);
    });

    return () => {
      unsubscribe.current?.();
      unsubscribeActors.current?.();
    };
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
    <div className="p-10">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{movie?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Director:</span> {movie?.director}
            </p>
            <p>
              <span className="font-medium">ID:</span> {movie?.id}
            </p>
          </div>

          <div className="border-t pt-4">
            <h2 className="mb-3 text-lg font-semibold">Actors</h2>

            <div className="mb-4 rounded border p-4">
              <ActorForm onSubmit={handleCreateActor} />
            </div>

            <div className="space-y-3">
              {actors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No actors added for this movie yet.
                </p>
              ) : (
                actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex items-start justify-between rounded border p-4"
                  >
                    {editActorId === actor.id ? (
                      <ActorForm
                        initialValues={{ name: actor.name, age: actor.age }}
                        buttonText="Update Actor"
                        onSubmit={(updatedActor) =>
                          handleUpdateActor(actor.id, updatedActor)
                        }
                        onCancel={() => setEditActorId(null)}
                      />
                    ) : (
                      <div>
                        <p className="font-medium">{actor.name}</p>
                        <p>Age: {actor.age}</p>
                        <p className="text-sm text-muted-foreground">
                          Actor ID: {actor.id}
                        </p>
                      </div>
                    )}

                    {editActorId !== actor.id && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditActorId(actor.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteActor(actor.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

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
