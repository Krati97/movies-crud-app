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

export const trimMovieData = onDocumentCreated({
  document: "movies/{movieId}",
  serviceAccount: `trimmoviedata-sa@fir-project-abbd4.iam.gserviceaccount.com`
},  
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
  {
  document: "movies/{movieId}",
  serviceAccount: `lcasemovietitle-sa@fir-project-abbd4.iam.gserviceaccount.com`
},
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

export const titleUpperCasePublic = onRequest({
  serviceAccount: `titlepublic-sa@fir-project-abbd4.iam.gserviceaccount.com`
},(req, res) => {
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
export const titleUpperCaseWithAllActors = onCall({
  serviceAccount: `titleallactors-sa@fir-project-abbd4.iam.gserviceaccount.com`
},async (request) => {
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

export const getAuthViewerInfo = onCall({
  serviceAccount: `getviewerinfo-sa@fir-project-abbd4.iam.gserviceaccount.com`
},async (request) => {
  if (!request.auth) {
    logger.info("getAuthViewerInfo called without authenticated user.");
    return {
      isLoggedIn: false,
      uid: null,
      email: null,
      message: "No user logged in",
    };
  }

  const email = typeof request.auth.token.email === "string" ?
    request.auth.token.email :
    null;
  logger.info(`getAuthViewerInfo called by ${request.auth.uid}`);
  return {
    isLoggedIn: true,
    uid: request.auth.uid,
    email,
    message: "User is logged in",
  };
});

/**
 * This is just for me to understand: 
 * request.auth looks like this.
 * Firebase automatically populates it when we call a callable function with an authenticated user. 
 * We can see the email and uid of the user in this object.
 {
   "uid":"VS0VOk7NWebKXK1z2AKHetA6dHI3",
   "token":{
      "iss":"https://securetoken.google.com/fir-project-abbd4",
      "aud":"fir-project-abbd4",
      "auth_time":1781018778,
      "user_id":"VS0VOk7NWebKXK1z2AKHetA6dHI3",
      "sub":"VS0VOk7NWebKXK1z2AKHetA6dHI3",
      "iat":1781022571,
      "exp":1781026171,
      "email":"kmaheshwari+movies01@agentsonly.com",
      "email_verified":false,
      "firebase":{
         "identities":{
            "email":[
               "kmaheshwari+movies01@agentsonly.com"
            ]
         },
         "sign_in_provider":"password"
      },
      "uid":"VS0VOk7NWebKXK1z2AKHetA6dHI3"
   },
   "rawToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc5OTRiNGYzMTU2MzJiMjk3NzAwNmQ5M2U5NGIyYWNiZTMwNWZlNDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmlyLXByb2plY3QtYWJiZDQiLCJhdWQiOiJmaXItcHJvamVjdC1hYmJkNCIsImF1dGhfdGltZSI6MTc4MTAxODc3OCwidXNlcl9pZCI6IlZTMFZPazdOV2ViS1hLMXoyQUtIZXRBNmRISTMiLCJzdWIiOiJWUzBWT2s3TldlYktYSzF6MkFLSGV0QTZkSEkzIiwiaWF0IjoxNzgxMDIyNTcxLCJleHAiOjE3ODEwMjYxNzEsImVtYWlsIjoia21haGVzaHdhcmkrbW92aWVzMDFAYWdlbnRzb25seS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsia21haGVzaHdhcmkrbW92aWVzMDFAYWdlbnRzb25seS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.b9QUee6aG7qSl44v_7QJsUqXGZTweFnqaA7o3_JDMxMnDifzKw50xXlFL_jNt2_uMHWRR8UrWlC_gXidrtXe7QWzWwnytLIxECHkcxPLTM_beZZP8nX7br7t69Fp5g7ZqzeIogRd88gNmMh7XTQMsBSR9E_kaOUtfRUZML9Zr48xYEDmbFGaH_GRiFz2DWrvOhX_xzlJj-2iALogY5mgxEiMCLErc5wkuyGtbH9izWXJ6n6zmB7TqxGn5QsruEBIG-9KU3GZvRz-QN61U7ZYNGy_MOM7iMQ6Bg_WlrdWnWsH0jQJ2LiSueHif_cVytnGUII5yAOjn2SXq9YFOuji0w"
}

 */