"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

type submitProps = {
  onSubmit: (
    movie: { 
        title: string; 
        director: string 
    }) => Promise<void>;
};

export function MovieAdditionForm({ onSubmit }: submitProps) {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      director,
    });

    setTitle("");
    setDirector("");
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

      <Button type="submit">Add Movie</Button>
    </form>
  );
}
