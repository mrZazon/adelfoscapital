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
let apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
if (apiBase.endsWith('/')) apiBase = apiBase.slice(0, -1);
const API_BASE_URL = apiBase;

console.log('[ADELFOS] API Base URL:', API_BASE_URL);

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const userStatus = document.getElementById('user-status');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');
const apiKeyDisplay = document.getElementById('api-key-display');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        userStatus.classList.remove('hidden');
        userEmailDisplay.innerText = user.email;
        document.body.classList.remove('login-active');
    } else {
        loginContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        userStatus.classList.add('hidden');
        document.body.classList.add('login-active');
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) return;

    loginBtn.disabled = true;
    const btnSpan = loginBtn.querySelector('span');
    const originalText = btnSpan.innerText;
    btnSpan.innerText = 'AUTHENTICATING...';
    loginError.innerText = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        loginError.innerText = error.message;
    } finally {
        btnSpan.innerText = originalText;
        loginBtn.disabled = false;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
    apiKeyDisplay.innerText = '•••• •••• •••• ••••';
});

// Generate API Key
generateBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const btnSpan = generateBtn.querySelector('span');
    const originalText = btnSpan.innerText;
    btnSpan.innerText = 'GENERATING SECURE KEY...';
    generateBtn.disabled = true;

    try {
        const idToken = await user.getIdToken();
        const targetUrl = `${API_BASE_URL}/v1/keys/generate`;
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            apiKeyDisplay.innerText = data.api_key;
        } else {
            alert(data.detail || 'Failed to generate key.');
        }
    } catch (error) {
        console.error('Generation Error:', error);
        alert('Network error. Ensure the API server is running.');
    } finally {
        btnSpan.innerText = originalText;
        generateBtn.disabled = false;
    }
});

// Copy to Clipboard with fallback
copyBtn.addEventListener('click', async () => {
    const key = apiKeyDisplay.innerText.trim();
    if (key.includes('•') || !key) {
        console.warn('[ADELFOS] No key available to copy');
        return;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(key);
        } else {
            // Fallback for non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = key;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        // Success Feedback
        const originalSvg = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#00ff88" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
        copyBtn.style.color = '#00ff88';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalSvg;
            copyBtn.style.color = '';
        }, 2000);
    } catch (err) {
        console.error('[ADELFOS] Copy failed:', err);
        alert('Failed to copy. Please select and copy manually.');
    }
});

// Particles Background
if (window.particlesJS) {
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ffffff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.1, "random": false },
            "size": { "value": 1, "random": true },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.05, "width": 1 },
            "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false } },
            "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.1 } } }
        },
        "retina_detect": true
    });
}
