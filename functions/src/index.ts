import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
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
