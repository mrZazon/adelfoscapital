// Adelfos Capital - API Management Logic
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// State
let isLoading = false;

// DOM Elements
const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authBtnText = document.getElementById('authBtnText');
const authLoader = document.getElementById('authLoader');
const authError = document.getElementById('authError');
const userEmailDisplay = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const apiKeyDisplay = document.getElementById('apiKeyDisplay');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const keyWarning = document.getElementById('keyWarning');

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        showView('dashboard');
        userEmailDisplay.innerText = user.email;
    } else {
        showView('auth');
    }
});

function showView(viewName) {
    authView.classList.toggle('visible', viewName === 'auth');
    dashboardView.classList.toggle('visible', viewName === 'dashboard');
}

// Handle Auth
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    authBtnText.style.display = 'none';
    authLoader.style.display = 'block';
    authError.innerText = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        authError.innerText = error.message;
    } finally {
        authBtnText.style.display = 'block';
        authLoader.style.display = 'none';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    apiKeyDisplay.innerText = '••••••••••••••••••••••••••••';
    keyWarning.style.display = 'none';
});

// Generate API Key
generateBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const originalText = generateBtn.innerText;
    generateBtn.innerText = 'GENERATING...';
    generateBtn.disabled = true;

    try {
        const idToken = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/v1/keys/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        const contentType = response.headers.get("content-type");
        let data = {};
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const rawBody = await response.text();
            console.error('Non-JSON response:', rawBody);
        }

        if (response.ok) {
            apiKeyDisplay.innerText = data.api_key;
            keyWarning.style.display = 'block';
            document.getElementById('rateLimit').innerText = `${data.rate_limit}/hr`;
        } else {
            alert(data.detail || 'Failed to generate key. Check console for details.');
        }
    } catch (error) {
        console.error('Generation Error:', error);
        alert('Network error while generating key.');
    } finally {
        generateBtn.innerText = originalText;
        generateBtn.disabled = false;
    }
});

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
    const key = apiKeyDisplay.innerText;
    if (key.includes('•')) return;

    navigator.clipboard.writeText(key).then(() => {
        const originalSvg = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#44ff44" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
            copyBtn.innerHTML = originalSvg;
        }, 2000);
    });
});
