// public/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAG1aY31vqvDjZujv_LfPSYxyjuFkQ8RGc",
  authDomain: "seoblog24-6dd99.firebaseapp.com",
  projectId: "seoblog24-6dd99",
  storageBucket: "seoblog24-6dd99.appspot.com",
  messagingSenderId: "341164988764",
  appId: "1:341164988764:web:84a44cd561144f6b3a8999",
  measurementId: "G-DS3E048F9Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      userCredential.user.getIdToken().then((token) => {
        document.cookie = `token=${token};path=/`;
        window.location.href = '/admin';
      });
    })
    .catch((error) => {
      console.error('Error signing in: ', error);
      alert('Invalid login credentials');
    });
});
