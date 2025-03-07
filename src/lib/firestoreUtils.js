import { db } from "../firebase/config.js";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { deleteDoc, arrayUnion, updateDoc } from "firebase/firestore";

function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getUserDetails(user) {
  return {
    name: user.fullName,
    email: user.primaryEmailAddress.emailAddress,
    profilePhoto: user.imageUrl || "",
    hasOnboarded: false,
  };
}

export async function createCollectionInFirestore(collectionName) {
  try {
    const dummyDocRef = doc(db, collectionName, "dummy");
    await setDoc(dummyDocRef, {});
    const docSnap = await getDoc(dummyDocRef);
    if (docSnap.exists()) {
      await deleteDoc(dummyDocRef);
    }
    console.log(`Collection ${collectionName} created or already exists`);
  } catch (error) {
    console.error("Error creating collection:", error);
  }
}

export async function createUserInFirestore(user) {
  const userDetails = getUserDetails(user);
  const userRef = doc(db, "users-project-01", userDetails.email); // Use email as the document ID

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // User already exists, update the loggedInAt array
      await updateDoc(userRef, {
        loggedInAt: arrayUnion(new Date().toISOString()),
      });
      console.log("User login time updated in Firestore");
    } else {
      // User doesn't exist, create a new document
      await setDoc(userRef, {
        ...userDetails,
        loggedInAt: [new Date().toISOString()],
        createdAt: new Date().toISOString(),
      });
      console.log("New user added to Firestore");
    }
  } catch (error) {
    console.error("Error managing user in Firestore:", error);
  }
}
