// Adelfos Capital - Landing Page Logic
const targetDate = new Date('2028-10-11T15:00:00Z');

function updateCountdown() {
    const now = new Date();
    let years = targetDate.getFullYear() - now.getFullYear();
    let months = targetDate.getMonth() - now.getMonth();
    let days = targetDate.getDate() - now.getDate();
    let hours = targetDate.getHours() - now.getHours();
    let minutes = targetDate.getMinutes() - now.getMinutes();
    let seconds = targetDate.getSeconds() - now.getSeconds();

    // Adjust for negative values
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    if (new Date() >= targetDate) {
        document.getElementById('countdown').innerHTML = "TERMINAL LIVE";
        return;
    }

    document.getElementById('years').innerText = years.toString().padStart(2, '0');
    document.getElementById('months').innerText = months.toString().padStart(2, '0');
    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

function setupCalendarButtons() {
    const title = 'Adelfos Capital Terminal Launch';
    const description = 'Official launch of the Adelfos Financial Terminal. Join us for the next generation of financial simulation.';
    const location = 'adelfos.app';
    const startDate = '20281011T150000Z';
    const endDate = '20281011T170000Z'; // 2 hours event

    // Google Calendar Link
    const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    document.getElementById('btn-google').href = googleLink;
}

function setupScrollEffects() {
    const countdown = document.getElementById('countdown');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const infoSection = document.getElementById('infoSection');

    const scrollProgress = document.getElementById('scrollProgress');
    const sideNav = document.getElementById('sideNav');
    const navDots = document.querySelectorAll('.nav-dot');

    // Smooth scroll for nav dots and slide hints
    document.querySelectorAll('.nav-dot, .slide-scroll-hint, .section-scroll-hint').forEach(item => {
        item.addEventListener('click', () => {
             // For section-scroll-hint in features, we manually find next section instead of data-target if missing
            const targetId = item.getAttribute('data-target');
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            } else if (item.classList.contains('section-scroll-hint')) {
                 // Info section hint -> Features section, Features section hint -> Engines section
                 const parentSection = item.closest('section');
                 if (parentSection && parentSection.id === 'infoSection') {
                     document.getElementById('featuresSection').scrollIntoView({ behavior: 'smooth' });
                 } else if (parentSection && parentSection.id === 'featuresSection') {
                     document.getElementById('enginesSection').scrollIntoView({ behavior: 'smooth' });
                 }
            }
        });
    });

    // Sticky Countdown & Progress Bar handling
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Scroll Progress
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0 && scrollProgress) {
            const scrollPercent = (scrollY / docHeight) * 100;
            scrollProgress.style.width = `${scrollPercent}%`;
        }
        
        // Show side nav after scrolling past hero section halfway
        if (scrollY > window.innerHeight * 0.4 && sideNav) {
            sideNav.classList.add('visible');
        } else if (sideNav) {
            sideNav.classList.remove('visible');
        }

        if (scrollY > 100) {
            countdown.classList.add('scrolled');
            scrollIndicator.classList.add('hidden');
        } else {
            countdown.classList.remove('scrolled');
            scrollIndicator.classList.remove('hidden');
        }
    });

    // Observer for Side Navigation Dots Highlight
    const sectionsToObserve = ['heroSection', 'infoSection', 'featuresSection', 'engine-hermes', 'engine-kronos', 'engine-afrodita', 'engine-tartaros'];
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navDots.forEach(dot => {
                    if (dot.getAttribute('data-target') === entry.target.id) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 }); // Trigger when 30% of the section is visible

    sectionsToObserve.forEach(id => {
        const el = document.getElementById(id);
        if (el) navObserver.observe(el);
    });

    // Reveal Sections and Model Slides
    const observerOptions = {
        threshold: 0.6 // Trigger when more than half of the slide is visible
    };

    // Engine Canvas Implementation
    class EngineCanvas {
        constructor() {
            this.canvas = document.getElementById('engineCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.prevEngine = 'none';
            this.currentEngine = 'none';
            this.engineParticles = {}; // Persistent particle states for each engine
            this.transitionScale = 1;
            this.time = 0;

            window.addEventListener('resize', () => this.resize());
            this.resize();
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth || 1;
            this.canvas.height = window.innerHeight || 1;
            // Force all engines to re-init on window size change
            this.engineParticles = {};
            if (this.currentEngine !== 'none') this.initEngine(this.currentEngine);
        }

        setEngine(engine) {
            if (!engine) engine = 'none';
            if (this.currentEngine === engine) return;

            // Optional: If we quickly switch mid-transition, force old to jump out so we don't pop brightly on restart
            if (this.transitionScale < 1 && this.currentEngine !== 'none') {
                 // Let the new transition start fresh without inheriting a broken state
            }

            this.prevEngine = this.currentEngine;
            this.currentEngine = engine;
            this.transitionScale = 0;

            // Ensure engine is initialized and valid
            if (engine && engine !== 'none') {
                if (!this.engineParticles[engine] || !this.engineParticles[engine].parts || this.engineParticles[engine].parts.length === 0) {
                    this.initEngine(engine);
                }
            }

            // Mantenemos la opacidad a 1.0 siempre para todas las animaciones de fondo
            this.canvas.style.opacity = engine === 'none' ? '0' : '1.0';
        }

        initEngine(engine) {
            this.time = 0;
            const w = this.canvas.width;
            const h = this.canvas.height;
            const newParticles = [];
            let metadata = {};

            switch (engine) {
                case 'hermes':
                    for (let i = 0; i < 30; i++) {
                        let path = [{ x: Math.random() * w, y: Math.random() * h }];
                        for (let j = 0; j < 20; j++) {
                            path.push({ x: path[j].x + 5, y: path[j].y + (Math.random() - 0.5) * 30 });
                        }
                        newParticles.push({ points: path, speed: 1 + Math.random() * 2, vol: 1 });
                    }
                    break;
                case 'afrodita':
                    for (let i = 0; i < 40; i++) {
                        newParticles.push({
                            x: Math.random() * w, y: Math.random() * h,
                            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                            size: 1.5
                        });
                    }
                    break;
                case 'kronos':
                    for (let i = 0; i < 300; i++) {
                        newParticles.push({
                            angle: Math.random() * Math.PI * 2,
                            radius: 100 + Math.random() * 450,
                            size: 1.2,
                            speed: 0.0005 + Math.random() * 0.0015
                        });
                    }
                    break;
                case 'tartaros':
                    const step = 80;
                    let rows = 0;
                    let cols = 0;
                    for (let x = 0; x <= w + step; x += step) {
                        cols++;
                        rows = 0;
                        for (let y = 0; y <= h + step; y += step) {
                            rows++;
                            newParticles.push({ ox: x, oy: y, x: x, y: y });
                        }
                    }
                    metadata = { rows, cols, step };
                    break;
            }
            this.engineParticles[engine] = { parts: newParticles, meta: metadata };
        }

        drawEngine(engine, opacity) {
            const state = this.engineParticles[engine];
            if (!state || !state.parts || state.parts.length === 0 || opacity <= 0) return;

            const parts = state.parts;
            this.ctx.globalAlpha = opacity;

            if (engine === 'hermes') {
                this.ctx.lineWidth = 1.5;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                parts.forEach(p => {
                    const last = p.points[p.points.length - 1];
                    const next = {
                        x: last.x + p.speed,
                        y: last.y + (Math.random() - 0.5) * 20 * p.vol
                    };
                    if (next.x > this.canvas.width) {
                        next.x = 0;
                        p.points = [next];
                    } else {
                        p.points.push(next);
                        if (p.points.length > 50) p.points.shift();
                    }
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.points[0].x, p.points[0].y);
                    p.points.forEach(pt => this.ctx.lineTo(pt.x, pt.y));
                    this.ctx.stroke();
                });
            }

            if (engine === 'kronos') {
                const centerX = this.canvas.width * 0.5;
                const centerY = this.canvas.height * 0.5;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                parts.forEach(p => {
                    p.angle += p.speed;
                    const x = centerX + Math.cos(p.angle) * p.radius;
                    const y = centerY + Math.sin(p.angle) * p.radius;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            if (engine === 'afrodita') {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                parts.forEach((p, i) => {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    for (let j = i + 1; j < parts.length; j++) {
                        const dist = Math.hypot(p.x - parts[j].x, p.y - parts[j].y);
                        if (dist < 250) {
                            this.ctx.lineWidth = 1 - dist / 250;
                            this.ctx.beginPath();
                            this.ctx.moveTo(p.x, p.y);
                            this.ctx.lineTo(parts[j].x, parts[j].y);
                            this.ctx.stroke();
                        }
                    }
                });
            }

            if (engine === 'tartaros' && state.meta) {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                parts.forEach(p => {
                    const noise = Math.sin(p.ox * 0.01 + this.time * 0.5) * 20;
                    const stress = (Math.random() > 0.99) ? -80 : 0;
                    p.y = p.oy + noise + stress;
                });

                this.ctx.beginPath();
                const { rows, cols } = state.meta;
                for (let c = 0; c < cols; c++) {
                    for (let r = 0; r < rows; r++) {
                        const idx = c * rows + r;
                        const p = parts[idx];
                        if (!p) continue;

                        // Connect right
                        if (c < cols - 1) {
                            const right = parts[(c + 1) * rows + r];
                            if (right) {
                                this.ctx.moveTo(p.x || p.ox, p.y);
                                this.ctx.lineTo(right.x || right.ox, right.y);
                            }
                        }
                        // Connect down
                        if (r < rows - 1) {
                            const down = parts[idx + 1];
                            if (down) {
                                this.ctx.moveTo(p.x || p.ox, p.y);
                                this.ctx.lineTo(down.x || down.ox, down.y);
                            }
                        }
                    }
                }
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.time += 0.01;

            if (this.currentEngine !== 'none' || this.prevEngine !== 'none') {
                if (this.transitionScale < 1) {
                    this.transitionScale += 0.06; // Fast cross-fade to maintain brightness
                }

                try {
                    if (this.prevEngine !== 'none') {
                        // Math.max guarantees it zeroes out properly
                        this.drawEngine(this.prevEngine, Math.max(0, 1 - this.transitionScale));
                    }
                    if (this.currentEngine !== 'none') {
                        this.drawEngine(this.currentEngine, Math.min(1, this.transitionScale));
                    }
                } catch (e) {
                    console.error("Engine drawing failed:", e);
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    const engineCanvas = new EngineCanvas();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // If it's a model slide, update canvas engine
                if (entry.target.classList.contains('model-slide')) {
                    const engineName = entry.target.dataset.engine;
                    if (engineName) {
                        engineCanvas.setEngine(engineName);
                    }
                } else if (entry.target.id === 'infoSection' || entry.target.id === 'heroSection' || entry.target.id === 'featuresSection') {
                    // Hide engine canvas on hero, info and features sections
                    engineCanvas.setEngine('none');
                }
            }
        });
    }, observerOptions);

    observer.observe(infoSection);
    observer.observe(document.getElementById('heroSection'));
    document.querySelectorAll('.model-slide').forEach(slide => observer.observe(slide));

    // Features & Engines section observers (lower threshold for larger sections)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    const featuresSection = document.getElementById('featuresSection');
    if (featuresSection) sectionObserver.observe(featuresSection);

    const enginesHeader = document.querySelector('.engines-header');
    if (enginesHeader) sectionObserver.observe(enginesHeader);

    // Scroll to info section on indicator click
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            infoSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Waitlist Form Handling
    const waitlistForm = document.getElementById('waitlistForm');
    const waitlistEmail = document.getElementById('waitlistEmail');
    const waitlistSubmitBtn = document.getElementById('waitlistSubmitBtn');
    const footerWaitlistBtn = document.getElementById('footerWaitlistBtn');

    // Initialize Firebase Waitlist Database
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    let db;
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
    }

    let currentStep = 1;

    if (waitlistForm && db) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const waitlistReason = document.getElementById('waitlistReason');
            const btnSpan = waitlistSubmitBtn.querySelector('span');

            if (currentStep === 1) {
                if (waitlistEmail && waitlistEmail.value) {
                    currentStep = 2;
                    waitlistEmail.style.opacity = '0';
                    waitlistSubmitBtn.style.opacity = '0';
                    waitlistSubmitBtn.style.pointerEvents = "none";

                    setTimeout(() => {
                        waitlistEmail.style.display = 'none';
                        waitlistReason.style.display = 'block';
                        void waitlistReason.offsetWidth; // Force reflow

                        waitlistForm.classList.add('expanded-pill'); // Expand pill
                        btnSpan.innerText = "SUBMIT APPLICATION";
                        waitlistReason.style.opacity = '1';
                        waitlistSubmitBtn.style.opacity = '1';
                        waitlistSubmitBtn.style.pointerEvents = "auto";
                        waitlistReason.required = true;
                        waitlistReason.focus();
                    }, 300);
                }
            } else if (currentStep === 2) {
                if (waitlistReason && waitlistReason.value) {
                    const originalText = btnSpan.innerText;
                    btnSpan.innerText = "PROCESSING...";
                    waitlistSubmitBtn.style.pointerEvents = "none";
                    waitlistSubmitBtn.style.opacity = "0.7";
                    
                    try {
                        await db.collection("waitlist").add({
                            email: waitlistEmail.value.trim(),
                            reason: waitlistReason.value.trim(),
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            source: 'landing_page'
                        });

                        btnSpan.innerText = "ACCESS SECURED";
                        waitlistSubmitBtn.style.opacity = "1";
                        waitlistSubmitBtn.classList.add('success');

                        const hintDiv = document.querySelector('.waitlist-hint');
                        if (hintDiv) {
                            hintDiv.innerHTML = "Application received securely. You will be notified via email.";
                            hintDiv.style.color = "#cccccc";
                        }
                    } catch (error) {
                        console.error("Firebase Error:", error);
                        btnSpan.innerText = "ERROR - TRY AGAIN";
                        waitlistSubmitBtn.style.pointerEvents = "auto";
                        waitlistSubmitBtn.style.opacity = "1";
                        
                        setTimeout(() => {
                            if (!waitlistSubmitBtn.classList.contains('success')) {
                                btnSpan.innerText = originalText;
                            }
                        }, 4000);
                    }
                }
            }
        });
    }

    if (footerWaitlistBtn) {
        footerWaitlistBtn.addEventListener('click', () => {
            // Scroll back to top request form automatically
            document.getElementById('heroSection').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                if (waitlistEmail) waitlistEmail.focus();
            }, 800);
        });
    }
}

// =========================================================
//  FEATURE CARD CANVAS ANIMATIONS
//  Each card gets a unique abstract animation drawn on a
//  small canvas, representing its terminal module visually.
// =========================================================

class FeatureAnimations {
    constructor() {
        this.canvases = [];
        this.time = 0;
        this.running = false;
    }

    init() {
        const cards = document.querySelectorAll('.feature-card');
        const animTypes = [
            'bars',       // Markets
            'wave',       // Chart+
            'network',    // Supply Chain
            'radar',      // Flights
            'ripple',     // Oil Tankers
            'alert',      // Crisis Map
            'monte',      // Simulation
            'layers',     // Portfolio
            'scan',       // Fundamentals
            'ring',       // Alerts
            'coins',      // Paper Trading
        ];

        cards.forEach((card, i) => {
            const canvas = document.createElement('canvas');
            canvas.className = 'feature-canvas';
            card.insertBefore(canvas, card.firstChild);

            const type = animTypes[i] || 'bars';
            const state = this.initState(type);
            this.canvases.push({ canvas, ctx: canvas.getContext('2d'), type, state, card });
        });

        window.addEventListener('resize', () => this.resizeAll());
        this.resizeAll();
        this.running = true;
        this.animate();
    }

    resizeAll() {
        this.canvases.forEach(({ canvas, card }) => {
            canvas.width = card.offsetWidth * (window.devicePixelRatio || 1);
            canvas.height = card.offsetHeight * (window.devicePixelRatio || 1);
        });
    }

    initState(type) {
        switch (type) {
            case 'bars':
                return { bars: Array.from({ length: 12 }, () => ({ h: Math.random(), v: 0.002 + Math.random() * 0.005 })) };
            case 'wave':
                return { phase: 0 };
            case 'network':
                return { nodes: Array.from({ length: 8 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.002, vy: (Math.random() - 0.5) * 0.002 })) };
            case 'radar':
                return { angle: 0 };
            case 'ripple':
                return { rings: [0, 0.33, 0.66] };
            case 'alert':
                return { pulse: 0 };
            case 'monte':
                return { paths: Array.from({ length: 6 }, () => ({ pts: [], seed: Math.random() * 100 })) };
            case 'layers':
                return { offsets: [0, 0, 0, 0] };
            case 'scan':
                return { y: 0 };
            case 'ring':
                return { scale: 0 };
            case 'coins':
                return { particles: Array.from({ length: 5 }, () => ({ x: Math.random(), y: Math.random(), vy: 0.003 + Math.random() * 0.003 })) };
            default:
                return {};
        }
    }

    draw(item, time) {
        const { canvas, ctx, type, state } = item;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;

        switch (type) {
            case 'bars': {
                // Pulsing bar chart
                const barW = w / (state.bars.length * 2.5);
                state.bars.forEach((bar, i) => {
                    bar.h += bar.v;
                    if (bar.h > 1 || bar.h < 0.1) bar.v *= -1;
                    const bh = bar.h * h * 0.6;
                    const x = w * 0.15 + i * (barW + barW * 0.8);
                    ctx.fillStyle = `rgba(255,255,255,${0.3 + bar.h * 0.4})`;
                    ctx.fillRect(x, h - bh - h * 0.1, barW, bh);
                });
                break;
            }
            case 'wave': {
                // Candlestick-like oscillating wave
                state.phase += 0.015;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                for (let x = 0; x < w; x += 2) {
                    const y = h * 0.5 + Math.sin(x * 0.015 + state.phase) * h * 0.2
                        + Math.sin(x * 0.04 + state.phase * 1.5) * h * 0.08;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
                // Second harmonic
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                for (let x = 0; x < w; x += 2) {
                    const y = h * 0.5 + Math.cos(x * 0.02 + state.phase * 0.7) * h * 0.15;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
                break;
            }
            case 'network': {
                // Flowing connected nodes
                state.nodes.forEach(n => {
                    n.x += n.vx; n.y += n.vy;
                    if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
                    if (n.y < 0.05 || n.y > 0.95) n.vy *= -1;
                });
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                state.nodes.forEach((n, i) => {
                    ctx.beginPath();
                    ctx.arc(n.x * w, n.y * h, 3, 0, Math.PI * 2);
                    ctx.fill();
                    state.nodes.forEach((m, j) => {
                        if (j > i) {
                            const d = Math.hypot((n.x - m.x) * w, (n.y - m.y) * h);
                            if (d < w * 0.4) {
                                ctx.strokeStyle = `rgba(255,255,255,${0.4 * (1 - d / (w * 0.4))})`;
                                ctx.beginPath();
                                ctx.moveTo(n.x * w, n.y * h);
                                ctx.lineTo(m.x * w, m.y * h);
                                ctx.stroke();
                            }
                        }
                    });
                });
                break;
            }
            case 'radar': {
                // Rotating radar sweep
                state.angle += 0.012;
                const cx = w * 0.65; const cy = h * 0.5;
                const r = Math.min(w, h) * 0.35;
                // Rings
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                [0.33, 0.66, 1].forEach(s => {
                    ctx.beginPath();
                    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
                    ctx.stroke();
                });
                // Sweep
                const grad = ctx.createConicalGradient ? null : null;
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r, state.angle - 0.5, state.angle);
                ctx.closePath();
                ctx.fill();
                // Sweep line
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(state.angle) * r, cy + Math.sin(state.angle) * r);
                ctx.stroke();
                // Blips
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                [0.3, 0.6, 0.8].forEach((d, i) => {
                    const a = state.angle - 0.2 - i * 0.1;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(a) * r * d, cy + Math.sin(a) * r * d, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
                break;
            }
            case 'ripple': {
                // Expanding concentric ripples
                const rcx = w * 0.6; const rcy = h * 0.5;
                const maxR = Math.min(w, h) * 0.4;
                state.rings = state.rings.map(r => {
                    r += 0.004;
                    return r > 1 ? 0 : r;
                });
                state.rings.forEach(r => {
                    ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - r)})`;
                    ctx.beginPath();
                    ctx.arc(rcx, rcy, maxR * r, 0, Math.PI * 2);
                    ctx.stroke();
                });
                // Center dot
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(rcx, rcy, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'alert': {
                // Pulsing warning triangle
                state.pulse += 0.02;
                const acx = w * 0.6; const acy = h * 0.45;
                const sz = Math.min(w, h) * 0.25;
                const pulse = 0.8 + Math.sin(state.pulse) * 0.2;
                ctx.strokeStyle = `rgba(255,255,255,${0.3 + Math.sin(state.pulse) * 0.2})`;
                ctx.lineWidth = 1.5;
                // Triangle
                ctx.beginPath();
                ctx.moveTo(acx, acy - sz * pulse);
                ctx.lineTo(acx - sz * pulse * 0.9, acy + sz * pulse * 0.6);
                ctx.lineTo(acx + sz * pulse * 0.9, acy + sz * pulse * 0.6);
                ctx.closePath();
                ctx.stroke();
                // Exclamation
                ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(state.pulse * 2) * 0.2})`;
                ctx.fillRect(acx - 1.5, acy - sz * 0.15, 3, sz * 0.25);
                ctx.beginPath();
                ctx.arc(acx, acy + sz * 0.25, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.lineWidth = 1;
                break;
            }
            case 'monte': {
                // Monte Carlo spreading paths
                state.paths.forEach((path, pi) => {
                    if (path.pts.length === 0 || path.pts.length > 80) {
                        path.pts = [{ x: w * 0.08, y: h * (0.3 + pi * 0.07) }];
                    }
                    const last = path.pts[path.pts.length - 1];
                    path.pts.push({
                        x: last.x + w * 0.012,
                        y: last.y + (Math.sin(time * 3 + path.seed + path.pts.length * 0.1) + (Math.random() - 0.5)) * h * 0.025
                    });
                    ctx.strokeStyle = `rgba(255,255,255,${0.15 + pi * 0.06})`;
                    ctx.beginPath();
                    path.pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
                    ctx.stroke();
                });
                break;
            }
            case 'layers': {
                // Stacking/floating layers
                const lw = w * 0.4; const lh = h * 0.08;
                const lcx = w * 0.55;
                state.offsets = state.offsets.map((o, i) => Math.sin(time * 0.8 + i * 1.2) * 8);
                [0, 1, 2, 3].forEach((i) => {
                    const ly = h * 0.25 + i * (lh + 12) + state.offsets[i];
                    ctx.strokeStyle = `rgba(255,255,255,${0.2 + i * 0.08})`;
                    ctx.fillStyle = `rgba(255,255,255,${0.03 + i * 0.01})`;
                    // Parallelogram
                    ctx.beginPath();
                    ctx.moveTo(lcx - lw / 2 + i * 5, ly);
                    ctx.lineTo(lcx + lw / 2 + i * 5, ly);
                    ctx.lineTo(lcx + lw / 2 - i * 5, ly + lh);
                    ctx.lineTo(lcx - lw / 2 - i * 5, ly + lh);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                });
                break;
            }
            case 'scan': {
                // Scrolling scan lines (data)
                state.y = (state.y + 0.003) % 1;
                const lineCount = 10;
                for (let i = 0; i < lineCount; i++) {
                    const ly = ((state.y + i / lineCount) % 1) * h;
                    const alpha = 0.1 + Math.sin((state.y + i / lineCount) * Math.PI) * 0.15;
                    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                    ctx.beginPath();
                    // Random width segments like data streams
                    let x = w * 0.1;
                    while (x < w * 0.9) {
                        const segW = 10 + Math.sin(i * 7 + x * 0.1 + time) * 30 + 30;
                        ctx.moveTo(x, ly);
                        ctx.lineTo(x + segW * 0.7, ly);
                        x += segW;
                    }
                    ctx.stroke();
                }
                break;
            }
            case 'ring': {
                // Radiating ring pulse
                state.scale += 0.015;
                const ringCx = w * 0.6; const ringCy = h * 0.5;
                const maxRing = Math.min(w, h) * 0.35;
                // Multiple rings at different phases
                for (let i = 0; i < 3; i++) {
                    const phase = (state.scale + i * 0.33) % 1;
                    ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - phase)})`;
                    ctx.lineWidth = 1 + (1 - phase);
                    ctx.beginPath();
                    ctx.arc(ringCx, ringCy, maxRing * phase, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.lineWidth = 1;
                // Center bell shape
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(ringCx, ringCy - 5, 6, Math.PI, 0);
                ctx.lineTo(ringCx + 8, ringCy + 3);
                ctx.lineTo(ringCx - 8, ringCy + 3);
                ctx.closePath();
                ctx.stroke();
                break;
            }
            case 'coins': {
                // Floating coin particles
                state.particles.forEach(p => {
                    p.y -= p.vy;
                    if (p.y < -0.05) { p.y = 1.05; p.x = 0.2 + Math.random() * 0.6; }
                    const px = p.x * w; const py = p.y * h;
                    const sz = 5 + Math.sin(time * 2 + p.x * 10) * 2;
                    ctx.strokeStyle = `rgba(255,255,255,${0.3 + p.y * 0.3})`;
                    ctx.beginPath();
                    ctx.ellipse(px, py, sz, sz * 0.5, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    // Dollar sign
                    ctx.fillStyle = `rgba(255,255,255,${0.2 + p.y * 0.2})`;
                    ctx.font = `${sz}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText('$', px, py + sz * 0.35);
                });
                break;
            }
        }
    }

    animate() {
        if (!this.running) return;
        this.time += 0.016;
        this.canvases.forEach(item => {
            this.draw(item, this.time);
        });
        requestAnimationFrame(() => this.animate());
    }
}

// Update every second to show seconds counting down
setInterval(updateCountdown, 1000);
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setupCalendarButtons();
    setupScrollEffects();

    // Initialize feature card canvas animations
    const featureAnims = new FeatureAnimations();
    featureAnims.init();
});

