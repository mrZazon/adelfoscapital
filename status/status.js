/**
 * Adelfos Capital - Redesigned Status Page Logic
 * Integrates with UptimeRobot API v2 & Landing Page Theme
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
 * Sync Landing Page Countdown
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
        const cd = document.getElementById('countdown');
        if (cd) cd.innerHTML = "TERMINAL LIVE";
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
        showError(`NETWORK INTERRUPTION: ${err.message}`);
    }
}

/**
 * Generate Uptime Bars Visualization
 */
function generateBars(isUp) {
    let barsHtml = '';
    const totalBars = 60;
    
    for (let i = 0; i < totalBars; i++) {
        const isRecent = i > totalBars - 10;
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

    monitors.forEach(monitor => {
        // Filter out the current website as it's redundant
        const name = monitor.friendly_name.toLowerCase();
        const url = monitor.url?.toLowerCase() || '';
        
        if (name.includes('adelfoscapital.onrender.com') || url.includes('adelfoscapital.onrender.com')) {
            return;
        }

        // Simplify names
        let displayName = monitor.friendly_name;
        if (name.includes('adelfos-api')) displayName = 'API';
        else if (name.includes('adelfos.onrender.com')) displayName = 'Terminal';

        const isUp = monitor.status === 2;
        if (!isUp) allUp = false;

        const row = document.createElement('div');
        row.className = 'status-row';
        row.innerHTML = `
            <div class="service-meta">
                <div class="service-name" title="${monitor.friendly_name}">${displayName}</div>
                <div class="service-uptime">${Math.round(monitor.all_time_uptime_ratio)}%</div>
            </div>
            <div class="uptime-bars">
                ${generateBars(isUp)}
            </div>
            <div class="service-status ${isUp ? 'is-up' : 'is-down'}">
                <span class="status-dot-static"></span>
                <span>${isUp ? 'Up' : 'Down'}</span>
            </div>
        `;
        ELEMENTS.grid.appendChild(row);
    });

    // Update overall status if elements exist (vibe check)
    if (ELEMENTS.overallText && ELEMENTS.overallDot) {
        if (allUp) {
            ELEMENTS.overallText.innerText = 'Infrastructure Operational';
            ELEMENTS.overallText.style.color = 'var(--pitch-white)';
            ELEMENTS.overallDot.className = 'status-dot up';
            ELEMENTS.overallDot.style.animation = 'none';
            ELEMENTS.overallDot.style.background = 'var(--pitch-white)';
        } else {
            ELEMENTS.overallText.innerText = 'Service Degradation Detected';
            ELEMENTS.overallText.style.color = 'var(--granate-red)';
            ELEMENTS.overallDot.className = 'status-dot down';
            ELEMENTS.overallDot.style.background = 'var(--granate-red)';
        }
    }
}

function showError(msg) {
    if (ELEMENTS.error) {
        ELEMENTS.error.innerText = msg;
        ELEMENTS.error.style.display = 'block';
    }
    if (ELEMENTS.overallText) ELEMENTS.overallText.innerText = 'Reality Sync Failed';
    if (ELEMENTS.grid) ELEMENTS.grid.innerHTML = '';
}

// Initializers
setInterval(updateCountdown, 1000);
updateCountdown();

fetchStatus();
setInterval(fetchStatus, CONFIG.REFRESH_INTERVAL);
