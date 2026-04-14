import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const FIREBASE_APP_NAME = "campus-sheba-web-app";
let runtimeConfigPromise: Promise<FirebaseConfig | null> | null = null;

function pickConfig(input: Partial<FirebaseConfig>): FirebaseConfig | null {
  const apiKey = input.apiKey?.trim();
  const authDomain = input.authDomain?.trim();
  const projectId = input.projectId?.trim();
  const storageBucket = input.storageBucket?.trim();
  const messagingSenderId = input.messagingSenderId?.trim();
  const appId = input.appId?.trim();
  const measurementId = input.measurementId?.trim();

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

function getFirebaseConfig(): FirebaseConfig | null {
  const config = pickConfig({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });

  if (!config) {
    if (typeof window !== "undefined") {
      console.error("[firebase] Missing required NEXT_PUBLIC firebase config.");
    }
    return null;
  }
  return config;
}

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  if (existing) return existing;
  return initializeApp(config, FIREBASE_APP_NAME);
}

async function getRuntimeFirebaseConfig(): Promise<FirebaseConfig | null> {
  if (typeof window === "undefined") return null;
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetch("/api/notifications/firebase-config", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = (await res.json()) as Partial<FirebaseConfig>;
        return pickConfig(json);
      })
      .catch(() => null);
  }
  return runtimeConfigPromise;
}

export async function getFirebaseAppAsync(): Promise<FirebaseApp | null> {
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  if (existing) return existing;

  const envConfig = getFirebaseConfig();
  if (envConfig) return initializeApp(envConfig, FIREBASE_APP_NAME);

  const runtimeConfig = await getRuntimeFirebaseConfig();
  if (!runtimeConfig) return null;
  return initializeApp(runtimeConfig, FIREBASE_APP_NAME);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  const app = getFirebaseApp();
  return app ? getAnalytics(app) : null;
}

export function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  const app = getFirebaseApp();
  return app ? getMessaging(app) : null;
}
