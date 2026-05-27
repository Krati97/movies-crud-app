export type Movie = {
  id: string;
  title: string;
  director: string;
};

export type MovieDoc = { 
    id: string; 
    title: string; 
    director: string 
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
