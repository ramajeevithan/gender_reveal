# Gender Reveal Voting App

This is a web application for hosting an interactive gender reveal event where participants can vote on the baby's gender and the actual gender is revealed with an exciting countdown and animation.

## Features

- User voting page for participants to cast their votes
- Admin control panel for managing the voting process
- Dedicated statistics page for displaying live results
- Real-time vote tracking with percentages
- One vote per user restriction
- Enhanced countdown with alternating boy/girl animation
- 3D reveal animation with confetti effects
- Gender-specific colors and heart emojis
- Firebase integration for real-time data synchronization

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Realtime Database
   - Go to Database in the left sidebar
   - Click "Create Database"
   - Start in test mode
4. Get your Firebase configuration
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app
   - Copy the Firebase configuration object

### 2. Configure the Application

1. Open `js/config.js`
2. Replace the placeholder Firebase configuration with your own:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

### 3. Deploy the Application

You can deploy this application using Firebase Hosting:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project directory:
```bash
firebase init
```
- Select Hosting
- Select your project
- Set public directory to the root folder
- Configure as a single-page app: No
- Set up automatic builds and deploys: No

4. Deploy to Firebase:
```bash
firebase deploy
```

## Usage

1. Open the admin panel (`admin.html`) in your browser
2. Select the actual gender in the dropdown
3. Click "Start Voting" to begin accepting votes
4. Share the main page (`index.html`) with participants
5. Open the statistics page (`stats.html`) on a separate screen for live vote tracking
6. Monitor votes in real-time with percentages
7. When voting is complete, click "Stop Voting"
8. Click "Start Reveal Countdown" when ready for the big reveal
9. Watch the animated countdown and final gender reveal with confetti
10. Use "Reset" to clear all votes and start over

### Current Configuration

The application is currently configured for the Firebase project 'oviyasbabyshower'. The configuration in `js/config.js` is:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBsaS3lw7sw2wZ2V8UyIpEoVL7Yt-_7ytI",
  authDomain: "oviyasbabyshower.firebaseapp.com",
  projectId: "oviyasbabyshower",
  storageBucket: "oviyasbabyshower.firebasestorage.app",
  databaseURL: "https://oviyasbabyshower-default-rtdb.firebaseio.com",
  messagingSenderId: "325125072862",
  appId: "1:325125072862:web:0ca394030298f13f379f4f",
  measurementId: "G-VM3TKXQ1VZ"
};

## Security Note

This demo uses Firebase Realtime Database in test mode. For production use, you should:
1. Set up proper security rules in Firebase
2. Implement user authentication
3. Add rate limiting
4. Secure the admin panel

## Technical Stack

- HTML5
- CSS3
- JavaScript (jQuery)
- jQuery UI
- Bootstrap 5
- GSAP (for 3D animations)
- Canvas Confetti
- Firebase Realtime Database
- Firebase Realtime Database
# gender_reveal
