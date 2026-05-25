"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

type submitProps = {
  onSubmit: (movie: { title: string; director: string }) => Promise<void>;

  initialValues?: {
    title: string;
    director: string;
  };

  buttonText?: string;

  onCancel?: () => void;
};

export function MovieAdditionForm({
  onSubmit,
  initialValues,
  buttonText = "Add Movie",
  onCancel,
}: submitProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [director, setDirector] = useState(initialValues?.director || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      director,
    });

    if (!initialValues) {
      setTitle("");
      setDirector("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Movie title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        placeholder="Director"
        value={director}
        onChange={(e) => setDirector(e.target.value)}
      />

      <Button type="submit">{buttonText}</Button>

      {onCancel && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </form>
  );
}
