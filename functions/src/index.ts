import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

initializeApp();

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const trimSringObject = (obj: Record<string, any>) => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trimmedObj: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      trimmedObj[key] = value.trim();
    } else {
      trimmedObj[key] = value;
    }
  }

  return trimmedObj;
};

export const trimMovieData = onDocumentCreated(
  "movies/{movieId}",
  async (event) => {

    const { movieId } = event.params;
    const snapshot = event.data;

    if (!snapshot) {
      logger.error(`Document with ID ${movieId} does not exist.`);
      return;
    }

    const data = snapshot.data();
    const cleanedData = trimSringObject(data);

    const isDataTrimmed = JSON.stringify(data) !== JSON.stringify(cleanedData);

    if (!isDataTrimmed) {
      logger.info(`Document with ID ${movieId} is already trimmed.`);
      return;
    }

    await snapshot.ref.update(cleanedData);
    logger.info(
      `Document with ID ${movieId} has been trimmed. No trailing or leading spaces in string fields.`,
    );
  },
);

export const lowercaseMovieTitle = onDocumentCreated(
  "movies/{movieId}",
  async (event) => {
    const { movieId } = event.params;
    const snapshot = event.data;

    if (!snapshot) {
      logger.error(`Document with ID ${movieId} does not exist.`);
      return;
    }

    const data = snapshot.data();
    const title: string = data.title;

    if (typeof title !== "string") {
      logger.error(`Document with ID ${movieId} has no valid title field.`);
      return;
    }

    await snapshot.ref.update({ titleLowercase: title.toLowerCase().trim() });
    logger.info(`Added titleLowercase field for movie ${movieId}.`);
  },
);

export const titleUpperCasePublic = onRequest((req, res) => {
  // URL FOrmat: http://localhost:5001/{PROJECT_ID}/{REGION}/{FUNCTION_NAME}?params
  // Working URL: http://localhost:5001/fir-project-abbd4/us-central1/titleUpperCasePublic?title=Interstellar
  const title: string = req.query.title as string;

  if(!title) {
    res.status(400).json({ error: "Please provide a title in the request body." });
    return;
  }

  const dummyMovieForUpperCase = {
    originalMovieTitle: title,
    uppercaseMovieTitle: title.toUpperCase(),
    director: "Christopher Nolan",
    actor: [{
      name: 'Matthew McConaughey',
      age: 53
    },
    {
      name: 'Anne Hathaway',
      age: 41
    }]
  };

  logger.info(`titleUpperCase function called with title: ${title}`);
  res.status(200).json(dummyMovieForUpperCase);
})
