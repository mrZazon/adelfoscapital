/**
 * Adelfos Capital - Redesigned Status Page Logic
 * Final Polish: Dynamic Island UI & Custom Naming
 */

const targetDate = new Date('2028-10-11T15:00:00Z');

const CONFIG = {
    API_URL: 'https://api.uptimerobot.com/v2/getMonitors',
    API_KEY: import.meta.env.VITE_UPTIMEROBOT_API_KEY,
    REFRESH_INTERVAL: 60000,
};

const ELEMENTS = {
    grid: document.getElementById('monitorsGrid'),
    overallText: document.getElementById('overallStatusText'),
    overallDot: document.getElementById('overallStatusDot'),
    error: document.getElementById('errorMessage'),
};

/**
 * Sync Dynamic Island Countdown
 */
function updateCountdown() {
    const now = new Date();
    let years = targetDate.getFullYear() - now.getFullYear();
    let months = targetDate.getMonth() - now.getMonth();
    let days = targetDate.getDate() - now.getDate();
    let hours = targetDate.getHours() - now.getHours();
    let minutes = targetDate.getMinutes() - now.getMinutes();
    let seconds = targetDate.getSeconds() - now.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
        months--;
    }
    if (months < 0) { months += 12; years--; }

    if (new Date() >= targetDate) {
        const island = document.querySelector('.dynamic-island-countdown');
        if (island) island.innerHTML = "TERMINAL LIVE";
        return;
    }

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val.toString().padStart(2, '0');
    };

    setVal('years', years);
    setVal('months', months);
    setVal('days', days);
    setVal('hours', hours);
    setVal('minutes', minutes);
    setVal('seconds', seconds);
}

/**
 * Fetch data from UptimeRobot
 */
async function fetchStatus() {
    if (!CONFIG.API_KEY || CONFIG.API_KEY.startsWith('YOUR_')) {
        showError('CONFIGURATION PENDING: Please set VITE_UPTIMEROBOT_API_KEY in environment.');
        return;
    }

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `api_key=${CONFIG.API_KEY}&format=json&logs=1&all_time_uptime_ratio=1`
        });

        const data = await response.json();
        if (data.stat === 'fail') throw new Error(data.error.message);
        renderMonitors(data.monitors);
    } catch (err) {
        console.error('Fetch error:', err);
        showError(`INFRASTRUCTURE SYNC FAILED: ${err.message}`);
    }
}

/**
 * Custom Naming Logic
 */
function getFriendlyName(monitor) {
    const name = monitor.friendly_name.toLowerCase();
    const url = (monitor.url || '').toLowerCase();
    
    if (name.includes('adelfos-api') || url.includes('adelfos-api')) {
        return 'API';
    }
    if (name.includes('adelfos') || url.includes('adelfos')) {
        return 'Terminal';
    }
    return monitor.friendly_name;
}

/**
 * Generate Uptime Bars (White/Red Palette)
 */
function generateBars(isUp) {
    let barsHtml = '';
    const totalBars = 60;
    
    for (let i = 0; i < totalBars; i++) {
        const isRecent = i > totalBars - 10;
        // If not up, show a red bar at the end
        const stateClass = isUp ? 'up' : (i === totalBars - 1 ? 'down' : 'up');
        const recentClass = isRecent ? 'recent' : '';
        barsHtml += `<div class="uptime-bar ${stateClass} ${recentClass}"></div>`;
    }
    return barsHtml;
}

/**
 * Render monitor rows
 */
function renderMonitors(monitors) {
    ELEMENTS.grid.innerHTML = '';
    let allUp = true;

    // Filter out the current redundant landing page if needed
    const filteredMonitors = monitors.filter(monitor => {
        // Redundant check for adelfoscapital.onrender.com (the web itself)
        return !monitor.friendly_name.toLowerCase().includes('adelfoscapital.onrender.com') &&
               !(monitor.url || '').toLowerCase().includes('adelfoscapital.onrender.com');
    });

    filteredMonitors.forEach(monitor => {
        const isUp = monitor.status === 2;
        if (!isUp) allUp = false;

        const row = document.createElement('div');
        row.className = 'status-row';
        row.innerHTML = `
            <div class="service-meta">
                <div class="service-name">${getFriendlyName(monitor)}</div>
                <div class="service-uptime">${monitor.all_time_uptime_ratio}%</div>
            </div>
            <div class="uptime-bars">
                ${generateBars(isUp)}
            </div>
            <div class="service-status ${isUp ? 'is-up' : 'is-down'}">
                <span class="status-dot-static"></span>
                <span>${isUp ? 'Online' : 'Interruption'}</span>
            </div>
        `;
        ELEMENTS.grid.appendChild(row);
    });

    if (allUp) {
        ELEMENTS.overallText.innerText = 'Infrastructure Stable';
        ELEMENTS.overallText.style.color = '#fff';
        ELEMENTS.overallDot.style.background = '#fff';
        ELEMENTS.overallDot.style.boxShadow = '0 0 10px rgba(255,255,255,0.3)';
        ELEMENTS.overallDot.className = 'status-dot';
    } else {
        ELEMENTS.overallText.innerText = 'Interruption Detected';
        ELEMENTS.overallText.style.color = '#A01010';
        ELEMENTS.overallDot.style.background = '#A01010';
        ELEMENTS.overallDot.style.boxShadow = '0 0 10px rgba(160,16,16,0.3)';
        ELEMENTS.overallDot.className = 'status-dot';
    }
}

function showError(msg) {
    ELEMENTS.error.innerText = msg;
    ELEMENTS.error.style.display = 'block';
    ELEMENTS.overallText.innerText = 'Handshake Failed';
    ELEMENTS.overallDot.className = 'status-dot loading';
    ELEMENTS.grid.innerHTML = '';
}

// Initializers
setInterval(updateCountdown, 1000);
updateCountdown();

fetchStatus();
setInterval(fetchStatus, CONFIG.REFRESH_INTERVAL);
