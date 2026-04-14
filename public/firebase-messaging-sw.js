importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

// Must be initialized during initial script evaluation for Firebase Messaging SW handlers.
const firebaseConfig = {
  apiKey: "AIzaSyDwSqp20-gLpIIqezKP0ntlJ-zBCkjnhwI",
  authDomain: "campus-sheba-dev.firebaseapp.com",
  projectId: "campus-sheba-dev",
  storageBucket: "campus-sheba-dev.firebasestorage.app",
  messagingSenderId: "419204931484",
  appId: "1:419204931484:web:8d7a0eb520751c9377f259",
  measurementId: "G-LV7S5K464G",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Campus Sheba";
  const options = {
    body: payload?.notification?.body || "You have a new notification",
    icon: payload?.notification?.icon || "/favicon.ico",
    image: payload?.notification?.image,
    data: payload?.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const deeplink = event.notification?.data?.deeplink;
  const webUrl = event.notification?.data?.webUrl;
  const targetUrl = deeplink || webUrl || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
