# Customer Tracking System

A comprehensive solution for managing customer relationships, interactions, and projects. Built with React + Vite (Frontend) and Firebase (Backend-as-a-Service).

## 🏗️ Architecture

The project consists of a frontend application that leverages Firebase for backend services.

- **Frontend**: React application built with Vite and TypeScript
- **Backend**: Firebase (Authentication, Firestore Database)

### Technology Stack

#### Frontend

- React 19
- Vite
- TypeScript
- TailwindCSS
- Firebase SDK (for Authentication and Firestore)
- Zustand for state management
- React Query (if still applicable for client-side server state)

## 🚀 Features

- **User Management**

  - Firebase Authentication for secure sign-up, sign-in, and session management.
  - User profile management (details to be aligned with actual implementation).

- **Customer Management**

  - Comprehensive customer profiles
  - Status tracking (Active, Inactive, Lead)
  - Contact information management
  - Company and address details

- **Interaction Tracking** (If still a feature, otherwise remove or update)

  - Record various types of customer interactions
  - Chronological interaction history
  - Notes and follow-ups

- **Project Management** (Replaces Job Management)
  - Create and track customer projects
  - Assign projects to customers
  - Define project scope, technologies used, and URLs
  - Priority levels and status updates
  - Due date tracking (if applicable)
  - Project completion workflow (if applicable)

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (>= v20)
- npm or yarn
- A Firebase project set up with Authentication and Firestore enabled.

### Frontend Setup

1.  Navigate to the frontend directory:

```bash
cd frontend
```

2.  Install dependencies:

```bash
npm install
```

3.  Create a `.env` file in the `frontend` directory with your Firebase project configuration:

```bash
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-firebase-measurement-id" # Optional
```

Replace `"your-firebase-..."` with your actual Firebase project credentials.

4.  Start the development server:

```bash
npm run dev
```

The application should now be running on `http://localhost:5173` (or the port specified by Vite).

## 📚 API Documentation

Interaction with backend services is handled through the Firebase SDK. Refer to the official Firebase documentation for details on Firestore and Firebase Authentication APIs.

## 🧪 Testing

### Frontend Tests

```bash
# Run tests (ensure your test setup is configured for Firebase, possibly with emulators)
npm run test
```

## 🚀 Deployment

### Frontend Deployment

1.  Build the application:

```bash
npm run build
```

2.  Deploy the contents of the `frontend/dist` directory to your preferred hosting service (e.g., Firebase Hosting, Vercel, Netlify).

## 🔒 Security

- Secure user authentication and authorization managed by Firebase Authentication.
- Data security in Firestore is managed by Firebase Security Rules. Ensure you have appropriate rules configured in your `firestore.rules` file to protect your data.
- Environment variables for Firebase configuration should be kept secure and not hardcoded directly into the source code (use `.env` files).

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Commit your changes
4.  Push to the branch
5.  Create a Pull Request

## 👥 Authors

- LewyBagz - Initial work

## 🙏 Acknowledgments

- Tovulti LLC
