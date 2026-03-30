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

    // Sticky Countdown handling
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            countdown.classList.add('scrolled');
            scrollIndicator.classList.add('hidden');
        } else {
            countdown.classList.remove('scrolled');
            scrollIndicator.classList.remove('hidden');
        }
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
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Force all engines to re-init on window size change
            this.engineParticles = {};
            if (this.currentEngine !== 'none') this.initEngine(this.currentEngine);
        }

        setEngine(engine) {
            if (this.currentEngine === engine) return;

            this.prevEngine = this.currentEngine;
            this.currentEngine = engine;
            this.transitionScale = 0;

            // Ensure engine is initialized
            if (engine !== 'none' && (!this.engineParticles[engine] || this.engineParticles[engine].parts.length === 0)) {
                this.initEngine(engine);
            }

            // Tartaros gets full opacity, others stay at 0.8 for atmosphere
            this.canvas.style.opacity = engine === 'none' ? '0' : (engine === 'tartaros' ? '1.0' : '0.8');
        }

        initEngine(engine) {
            this.time = 0;
            const w = this.canvas.width;
            const h = this.canvas.height;
            const newParticles = [];
            let metadata = {};

            switch (engine) {
                case 'hero':
                    for (let i = 0; i < 60; i++) {
                        newParticles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            vx: (Math.random() - 0.5) * 0.2,
                            vy: (Math.random() - 0.5) * 0.2,
                            size: 1 + Math.random()
                        });
                    }
                    break;
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

            if (engine === 'hero') {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
                this.ctx.lineWidth = 1;
                parts.forEach((p, i) => {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Network connections
                    for (let j = i + 1; j < parts.length; j++) {
                        const dist = Math.hypot(p.x - parts[j].x, p.y - parts[j].y);
                        if (dist < 200) {
                            this.ctx.globalAlpha = opacity * (1 - dist / 200) * 0.1;
                            this.ctx.beginPath();
                            this.ctx.moveTo(p.x, p.y);
                            this.ctx.lineTo(parts[j].x, parts[j].y);
                            this.ctx.stroke();
                        }
                    }
                    this.ctx.globalAlpha = opacity;
                });
            }

            if (engine === 'hermes') {
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
                    this.transitionScale += 0.02; // Smooth cross-fade
                }

                try {
                    if (this.prevEngine !== 'none') {
                        this.drawEngine(this.prevEngine, 1 - this.transitionScale);
                    }
                    if (this.currentEngine !== 'none') {
                        this.drawEngine(this.currentEngine, this.transitionScale);
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

                // If it's a model slide or hero, update canvas engine and set active class
                if (entry.target.classList.contains('model-slide') || entry.target.classList.contains('hero-section')) {
                    const engineName = entry.target.dataset.engine;
                    engineCanvas.setEngine(engineName);
                } else if (entry.target.id === 'infoSection') {
                    // Hide engine canvas when scrolling back to info section
                    engineCanvas.setEngine('none');
                }
            }
        });
    }, observerOptions);

    observer.observe(infoSection);
    observer.observe(document.getElementById('heroSection'));
    document.querySelectorAll('.model-slide').forEach(slide => observer.observe(slide));

    // Scroll to info section on indicator click
    scrollIndicator.addEventListener('click', () => {
        infoSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Update every second to show seconds counting down
setInterval(updateCountdown, 1000);
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setupCalendarButtons();
    setupScrollEffects();
});
