# Firebase Setup Guide for LASA-GUARD

This guide walks you through connecting your **own Firebase project** to the LASA-GUARD clinical platform in under 5 minutes.

> **Note:** LASA-GUARD works completely offline right out of the box with zero setup. You only need to follow these steps if you want real-time cloud database syncing across multiple devices.

---

## Step 1: Create a Free Firebase Project

1. Open your browser and go to the [Firebase Console](https://console.firebase.google.com/).
2. Log in with your personal or institutional Google account.
3. Click **"Add project"** (or **"Create a project"**).
4. Enter a project name (e.g., `lasa-guard-clinical`).
5. (Optional) Disable Google Analytics to simplify setup, then click **"Create project"**.
6. Wait a few seconds until the project is ready, then click **"Continue"**.

---

## Step 2: Register a Web Application

1. On the project overview page, click the **Web icon (`</>`)** to add an app.
2. Enter an app nickname (e.g., `LASA Web Portal`).
3. Leave "Firebase Hosting" unchecked for now.
4. Click **"Register app"**.
5. You will see a code snippet containing `firebaseConfig` with keys like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef..."
};
```

---

## Step 3: Enable Email / Password Authentication

1. In the left-hand sidebar of Firebase Console, click **"Build"** → **"Authentication"**.
2. Click **"Get started"**.
3. Under the **"Sign-in method"** tab, select **"Email/Password"**.
4. Toggle **"Email/Password"** to **Enabled**.
5. Leave "Email link (passwordless sign-in)" disabled.
6. Click **"Save"**.

---

## Step 4: Create Cloud Firestore Database

1. In the left-hand sidebar, click **"Build"** → **"Firestore Database"**.
2. Click **"Create database"**.
3. Choose a location closest to you (e.g., `asia-south1` or `us-central1`). Click **"Next"**.
4. Select **"Start in test mode"** (this allows read/write access during development and testing).
5. Click **"Create"**.

---

## Step 5: Plug Your Keys into LASA-GUARD

1. Open the file:
   `c:\Lasa Project\lasa-unified\frontend\.env.example`
2. Create a copy named:
   `c:\Lasa Project\lasa-unified\frontend\.env`
3. Paste your values from Step 2 into the file:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

4. Save the file.
5. Restart the frontend (`run_unified_frontend.bat` or `run_all.bat`).

---

## Verifying Your Setup

1. Open the portal at `http://localhost:5173`.
2. Go to the login screen and click **"Create Account"**.
3. Register with your clinical email and password.
4. Check your Firebase Console under **Authentication** → **Users**; you will immediately see your newly registered user!
5. In **Firestore Database**, you will see the `users`, `alerts`, and `history` collections automatically populated as you screen medications!
