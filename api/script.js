// Adelfos Capital - API Management Logic
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
let apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
if (apiBase.endsWith('/')) apiBase = apiBase.slice(0, -1);
const API_BASE_URL = apiBase;

// In-memory only — cleared on reload or logout
let _keyInMemory = null;

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
const deleteBtn = document.getElementById('delete-btn');

const MASK = '•••• •••• •••• ••••';

function maskKey() {
    _keyInMemory = null;
    apiKeyDisplay.innerText = MASK;
}

function revealKey(key) {
    _keyInMemory = key;
    apiKeyDisplay.innerText = key;
}

// Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        userStatus.classList.remove('hidden');
        userEmailDisplay.innerText = user.email;
        document.body.classList.remove('login-active');
        maskKey();
    } else {
        loginContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
        userStatus.classList.add('hidden');
        document.body.classList.add('login-active');
        maskKey();
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) return;

    loginBtn.disabled = true;
    const btnSpan = loginBtn.querySelector('span');
    const original = btnSpan.innerText;
    btnSpan.innerText = 'AUTHENTICATING...';
    loginError.innerText = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
        loginError.innerText = err.message;
    } finally {
        btnSpan.innerText = original;
        loginBtn.disabled = false;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    maskKey();
    auth.signOut();
});

// Fetch key from backend into memory
async function fetchKeyIntoMemory() {
    const user = auth.currentUser;
    if (!user) return false;

    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/v1/keys/me`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
    });

    if (response.ok) {
        const data = await response.json();
        if (data.api_key) {
            _keyInMemory = data.api_key;
            return true;
        }
    }
    return false;
}

// Copy — fetches silently if not in memory yet
copyBtn.addEventListener('click', async () => {
    // If not in memory, fetch it first silently
    if (!_keyInMemory) {
        const originalSvg = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#666" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
        copyBtn.disabled = true;

        try {
            const ok = await fetchKeyIntoMemory();
            if (!ok) {
                copyBtn.innerHTML = originalSvg;
                copyBtn.disabled = false;
                return;
            }
        } catch (err) {
            console.error('[COPY] Fetch failed:', err);
            copyBtn.innerHTML = originalSvg;
            copyBtn.disabled = false;
            return;
        }

        copyBtn.innerHTML = originalSvg;
        copyBtn.disabled = false;
    }

    // Now copy from memory
    const showSuccess = () => {
        const originalSvg = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#00ff88" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        copyBtn.style.color = '#00ff88';
        setTimeout(() => {
            copyBtn.innerHTML = originalSvg;
            copyBtn.style.color = '';
        }, 2000);
    };

    const fallbackCopy = () => {
        const ta = document.createElement('textarea');
        ta.value = _keyInMemory;
        ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) showSuccess();
        else alert('No se pudo copiar. Selecciona la clave manualmente.');
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(_keyInMemory).then(showSuccess).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
});

// Generate API Key
generateBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const btnSpan = generateBtn.querySelector('span');
    const original = btnSpan.innerText;
    btnSpan.innerText = 'GENERATING SECURE KEY...';
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

        const data = await response.json();

        if (response.ok) {
            revealKey(data.api_key);
        } else {
            alert(data.detail || 'Failed to generate key.');
        }
    } catch (err) {
        console.error('Generation Error:', err);
        alert('Network error. Ensure the API server is running.');
    } finally {
        btnSpan.innerText = original;
        generateBtn.disabled = false;
    }
});

// Revoke API Key
if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;
        if (!confirm('Seguro que quieres revocar tu API key? Dejara de funcionar inmediatamente.')) return;

        deleteBtn.disabled = true;
        const btnSpan = deleteBtn.querySelector('span');
        const original = btnSpan.innerText;
        btnSpan.innerText = 'REVOKING...';

        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/v1/keys/revoke`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            if (response.ok) {
                maskKey();
            } else {
                const data = await response.json();
                alert(data.detail || 'Failed to revoke key.');
            }
        } catch (err) {
            console.error('Revoke Error:', err);
            alert('Network error. Ensure the API server is running.');
        } finally {
            btnSpan.innerText = original;
            deleteBtn.disabled = false;
        }
    });
}

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