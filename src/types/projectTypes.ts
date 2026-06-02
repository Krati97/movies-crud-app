export type Movie = {
  id: string;
  title: string;
  director: string;
};

export type MovieDoc = {
  id: string;
  title: string;
  director: string;
};

export type Actor = {
  id: string;
  name: string;
  age: number;
};

export type ActorDoc = {
  id: string;
  name: string;
  age: number;
};

export type ActorInput = {
  name: string;
  age: number;
};

export type ActorFormProps = {
  onSubmit: (actor: ActorInput) => Promise<void>;
  initialValues?: ActorInput;
  buttonText?: string;
  onCancel?: () => void;
};

export type submitProps = {
  onSubmit: (movie: { title: string; director: string }) => Promise<void>;

  initialValues?: {
    title: string;
    director: string;
  };

  buttonText?: string;

  onCancel?: () => void;
};
