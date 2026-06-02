"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActorFormProps } from "@/types/projectTypes";

export function ActorForm({
  onSubmit,
  initialValues,
  buttonText = "Add Actor",
  onCancel,
}: ActorFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [age, setAge] = useState<string>(
    initialValues ? String(initialValues.age) : "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name,
      age: Number(age),
    });

    if (!initialValues) {
      setName("");
      setAge("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Actor name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        placeholder="Actor age"
        type="number"
        min={0}
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <div className="flex gap-2">
        <Button type="submit">{buttonText}</Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
