import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "hawai-52704.firebaseapp.com",
  projectId: "hawai-52704",
  storageBucket: "hawai-52704.appspot.com",
  messagingSenderId: "399515824553",
  appId: "1:399515824553:web:d33948f41db65806bc54b8",
  measurementId: "G-NMN82DJC5Y",
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function registerUserWithBackend(userData) {
  const response = await fetch(
    "https://chatbot-starter.onrender.com/auth/register",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  return response.status;
}

async function getBearerToken(email, password) {
  const response = await fetch(
    "https://chatbot-starter.onrender.com/auth/token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchChatLogs(bearerToken) {
  const response = await fetch("https://chatbot-starter.onrender.com/chat/messages", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function POST(req) {
  try {
    const { user } = await req.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    const userRef = doc(db, "users-project-01", user.email);
    const docSnap = await getDoc(userRef);

    let uniquePassword;
    let isNewUser = false;

    if (docSnap.exists()) {
      uniquePassword = docSnap.data().password;
      await updateDoc(userRef, {
        loggedInAt: arrayUnion(new Date().toISOString()),
      });
    } else {
      isNewUser = true;
      uniquePassword = generateUniqueId();
      const userDetails = {
        name: user.fullName,
        email: user.email,
        profilePhoto: user.imageUrl || "",
        hasOnboarded: false,
        createdAt: new Date().toISOString(),
        loggedInAt: [new Date().toISOString()],
        password: uniquePassword,
      };
      await setDoc(userRef, userDetails);
    }

    // Prepare data for backend registration
    const registrationData = {
      email: user.email,
      password: uniquePassword,
      name: user.fullName,
      information: {
        age_range: "18-24",
        habit_struggle: "habit sm",
        wellness_goals: ["goal"],
        sleep_quality: "sleep",
        stress_level: "stress",
        check_in_style: "often",
      },
    };

    // Attempt to register with backend
    const registrationStatus = await registerUserWithBackend(registrationData);

    let registrationMessage;
    if (registrationStatus === 200) {
      registrationMessage = "User registered successfully with backend";
    } else if (registrationStatus === 400) {
      registrationMessage = "User already registered with backend";
    } else {
      throw new Error(
        `Unexpected response from backend: ${registrationStatus}`
      );
    }

    // Get bearer token
    const bearerToken = await getBearerToken(user.email, uniquePassword);
    console.log("Bearer Token:", bearerToken);

    // Fetch chat logs
    const chatLogs = await fetchChatLogs(bearerToken);
    console.log("Chat Logs:", chatLogs);

    return NextResponse.json({
      message: registrationMessage,
      isNewUser: isNewUser,
      bearerToken: bearerToken,
      chatLogs: chatLogs,
    });
  } catch (error) {
    console.error("Error processing user login:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
