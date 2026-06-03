import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
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
  // Working URL deployed: https://us-central1-fir-project-abbd4.cloudfunctions.net/titleUpperCasePublic?title=Interstellar
  //its a get call
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
});

// Callable function: We can use auth directly in this one.
// http://localhost:5001/fir-project-abbd4/us-central1/titleUpperCaseWithAllActors
/*   its a post call, 
 {
  "data": {
    "title": "Interstellar"
  }
} 
*/
export const titleUpperCaseWithAllActors = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated users can call this function.",
    );
  }

  const title = request.data?.title;
  if (typeof title !== "string" || !title.trim()) {
    throw new HttpsError(
      "invalid-argument",
      "Please pass a non-empty 'title' in callable data.",
    );
  }

  const normalizedTitle = title.trim();

  const dummyMovieForUpperCase = {
    originalMovieTitle: normalizedTitle,
    uppercaseMovieTitle: normalizedTitle.toUpperCase(),
    director: "Christopher Nolan",
    actors: [
      { name: "Matthew McConaughey", age: 53 },
      { name: "Anne Hathaway", age: 41 },
      { name: "Timothee Chalamet", age: 30 },
    ],
  };

  logger.info(
    `titleUpperCaseWithAllActors called by ${request.auth.uid} with title: ${normalizedTitle}`,
  );

  return dummyMovieForUpperCase;
});
