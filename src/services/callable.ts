import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import { AuthViewerInfo } from "@/types/projectTypes";

export const getAuthViewerInfo = async () => {
  const callable = httpsCallable<unknown, AuthViewerInfo>
  (
    functions, // ref to firebase.ts file where we initialize firebase functions
    "getAuthViewerInfo",
  );

  const result = await callable({});
  return result.data;
};
