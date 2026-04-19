/**
 * Adelfos Capital - Status Page Logic
 * Integrates with UptimeRobot API v2
 */

const CONFIG = {
    API_URL: 'https://api.uptimerobot.com/v2/getMonitors',
    // Use Vite env variable for the API key
    API_KEY: import.meta.env.VITE_UPTIMEROBOT_API_KEY,
    REFRESH_INTERVAL: 60000, // 1 minute
};

const ELEMENTS = {
    grid: document.getElementById('monitorsGrid'),
    overallText: document.getElementById('overallStatusText'),
    overallDot: document.getElementById('overallStatusDot'),
    error: document.getElementById('errorMessage'),
};

/**
 * Fetch data from UptimeRobot
 */
async function fetchStatus() {
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_UPTIMEROBOT_READ_ONLY_API_KEY') {
        showError('API Key missing. Please set VITE_UPTIMEROBOT_API_KEY in .env');
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.stat === 'fail') {
            throw new Error(data.error.message || 'API request failed');
        }

        renderMonitors(data.monitors);
    } catch (err) {
        console.error('Fetch error:', err);
        showError(`Failed to fetch status: ${err.message}. This might be a CORS issue if calling directly from browser.`);
    }
}

/**
 * Render monitor cards
 */
function renderMonitors(monitors) {
    ELEMENTS.grid.innerHTML = '';
    let allUp = true;
    let anyDown = false;

    monitors.forEach(monitor => {
        const isUp = monitor.status === 2;
        if (!isUp) allUp = false;
        if (monitor.status === 9) anyDown = true;

        const card = document.createElement('div');
        card.className = 'monitor-card';
        
        card.innerHTML = `
            <div class="monitor-info">
                <div class="monitor-name">${monitor.friendly_name}</div>
                <div class="monitor-uptime">${monitor.all_time_uptime_ratio}% overall uptime</div>
            </div>
            <div class="monitor-status-text">
                <span class="status-dot ${isUp ? 'up' : 'down'}"></span>
                ${isUp ? 'Operational' : 'Degraded Performance'}
            </div>
        `;
        ELEMENTS.grid.appendChild(card);
    });

    // Update overall status
    if (allUp) {
        ELEMENTS.overallText.innerText = 'All Systems Operational';
        ELEMENTS.overallDot.className = 'status-dot up';
    } else if (anyDown) {
        ELEMENTS.overallText.innerText = 'Service Interruption Detected';
        ELEMENTS.overallDot.className = 'status-dot down';
    } else {
        ELEMENTS.overallText.innerText = 'Partial System Degradation';
        ELEMENTS.overallDot.className = 'status-dot down';
    }
}

function showError(msg) {
    ELEMENTS.error.innerText = msg;
    ELEMENTS.error.style.display = 'block';
    ELEMENTS.overallText.innerText = 'Status Unavailable';
    ELEMENTS.overallDot.className = 'status-dot';
    ELEMENTS.grid.innerHTML = '';
}

// Initial fetch
fetchStatus();

// Refresh periodically
setInterval(fetchStatus, CONFIG.REFRESH_INTERVAL);
