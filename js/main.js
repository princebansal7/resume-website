/* ============================================================
   main.js — small, dependency-free behaviors:
   · sticky nav state on scroll
   · scrollspy (active nav link)
   · scroll-reveal via IntersectionObserver
   · mobile drawer toggle
   · subtle parallax on hero glow
   Respects prefers-reduced-motion.
   ============================================================ */

(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* -------- Sticky nav state -------- */
    const nav = document.querySelector(".nav");
    if (nav) {
        const onScroll = () => {
            if (window.scrollY > 8) nav.classList.add("nav--scrolled");
            else nav.classList.remove("nav--scrolled");
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* -------- Mobile drawer -------- */
    const menuBtn = document.querySelector(".nav__menu-btn");
    const drawer = document.querySelector(".nav__drawer");
    if (menuBtn && drawer) {
        const close = () => {
            drawer.classList.remove("is-open");
            menuBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        };
        const toggle = () => {
            const open = !drawer.classList.contains("is-open");
            drawer.classList.toggle("is-open", open);
            menuBtn.setAttribute("aria-expanded", String(open));
            document.body.style.overflow = open ? "hidden" : "";
        };
        menuBtn.addEventListener("click", toggle);
        drawer.addEventListener("click", (e) => {
            if (e.target.tagName === "A") close();
        });
        // Close on Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("is-open"))
                close();
        });
    }

    /* -------- Scrollspy (active nav link) -------- */
    const navLinks = Array.from(
        document.querySelectorAll(".nav__links a[href^='#'], .nav__drawer a[href^='#']")
    );
    const sections = navLinks
        .map((a) => {
            const id = a.getAttribute("href").slice(1);
            const el = document.getElementById(id);
            return el ? { id, el, links: [] } : null;
        })
        .filter(Boolean);

    // Group links by target id
    navLinks.forEach((link) => {
        const id = link.getAttribute("href").slice(1);
        const entry = sections.find((s) => s.id === id);
        if (entry) entry.links.push(link);
    });

    if (sections.length && "IntersectionObserver" in window) {
        const setActive = (id) => {
            navLinks.forEach((a) => {
                const match = a.getAttribute("href") === `#${id}`;
                a.classList.toggle("is-active", match);
            });
        };

        const spy = new IntersectionObserver(
            (entries) => {
                // Pick the entry closest to the top among intersecting
                let best = null;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (
                            !best ||
                            entry.boundingClientRect.top <
                                best.boundingClientRect.top
                        )
                            best = entry;
                    }
                });
                if (best) setActive(best.target.id);
            },
            {
                rootMargin: "-40% 0px -50% 0px",
                threshold: 0,
            }
        );

        sections.forEach((s) => spy.observe(s.el));
    }

    /* -------- Scroll-reveal -------- */
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealEls.forEach((el) => el.classList.add("is-visible"));
        } else {
            const io = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
            );
            revealEls.forEach((el) => io.observe(el));
        }
    }

    /* -------- Subtle parallax on hero glow (very light) -------- */
    if (!prefersReducedMotion) {
        const glow = document.querySelector(".bg-glow");
        if (glow) {
            let ticking = false;
            const onMove = (e) => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    const x = (e.clientX / window.innerWidth - 0.5) * 12;
                    const y = (e.clientY / window.innerHeight - 0.5) * 12;
                    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                    ticking = false;
                });
            };
            window.addEventListener("pointermove", onMove, { passive: true });
        }
    }

    /* -------- Star field -------- */
    (() => {
        const canvas = document.getElementById("bg-stars");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const TOTAL = 180;
        const CLUSTER_N = 3;
        let stars = [], W, H, scrollY = 0;

        function gauss(mean, std) {
            let u = 0, v = 0;
            while (!u) u = Math.random();
            while (!v) v = Math.random();
            return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        }

        function build() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            const spread = Math.min(W, H) * 0.18;

            const clusters = Array.from({ length: CLUSTER_N }, () => ({
                x: W * (0.1 + Math.random() * 0.8),
                y: H * (0.05 + Math.random() * 0.55),
            }));

            stars = [];

            // Clustered stars
            for (let i = 0; i < TOTAL * 0.55; i++) {
                const c = clusters[Math.floor(Math.random() * CLUSTER_N)];
                const isCyan = Math.random() < 0.18;
                const isBlue = !isCyan && Math.random() < 0.1;
                stars.push({
                    x: gauss(c.x, spread),
                    y: gauss(c.y, spread),
                    r: Math.random() * 1.1 + 0.25,
                    base: Math.random() * 0.3 + 0.08,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.4 + 0.15,
                    color: isCyan ? "34,211,238" : isBlue ? "96,165,250" : "255,255,255",
                    depth: Math.random() * 0.25 + 0.05,
                });
            }

            // Scattered field stars
            for (let i = 0; i < TOTAL * 0.45; i++) {
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 0.5 + 0.1,
                    base: Math.random() * 0.15 + 0.04,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.12 + 0.04,
                    color: Math.random() < 0.08 ? "34,211,238" : "255,255,255",
                    depth: Math.random() * 0.08 + 0.01,
                });
            }

            // Bright accent stars
            for (let i = 0; i < 7; i++) {
                const c = clusters[Math.floor(Math.random() * CLUSTER_N)];
                stars.push({
                    x: gauss(c.x, spread * 0.5),
                    y: gauss(c.y, spread * 0.5),
                    r: Math.random() * 1.0 + 1.4,
                    base: Math.random() * 0.3 + 0.3,
                    phase: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.25 + 0.1,
                    color: Math.random() < 0.55 ? "34,211,238" : "255,255,255",
                    depth: Math.random() * 0.2 + 0.1,
                    glow: true,
                });
            }
        }

        function draw(t) {
            ctx.clearRect(0, 0, W, H);
            const time = t * 0.001;

            for (const s of stars) {
                const py = ((s.y - scrollY * s.depth) % H + H) % H;
                const a = prefersReducedMotion
                    ? s.base
                    : s.base * (0.55 + 0.45 * Math.sin(time * s.speed + s.phase));

                if (s.glow) {
                    const gr = ctx.createRadialGradient(s.x, py, 0, s.x, py, s.r * 5);
                    gr.addColorStop(0, `rgba(${s.color},${a * 0.5})`);
                    gr.addColorStop(1, `rgba(${s.color},0)`);
                    ctx.beginPath();
                    ctx.arc(s.x, py, s.r * 5, 0, Math.PI * 2);
                    ctx.fillStyle = gr;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.color},${a})`;
                ctx.fill();
            }

            if (!prefersReducedMotion) requestAnimationFrame(draw);
        }

        window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
        window.addEventListener("resize", () => { build(); if (prefersReducedMotion) draw(0); }, { passive: true });
        build();
        requestAnimationFrame(draw);
    })();

    /* -------- Easter eggs -------- */
    (() => {
        // Shared toast helper
        function showToast(msg, duration = 3200) {
            const el = document.createElement("div");
            el.className = "easter-toast";
            el.textContent = msg;
            document.body.appendChild(el);
            requestAnimationFrame(() => el.classList.add("is-visible"));
            setTimeout(() => {
                el.classList.remove("is-visible");
                el.addEventListener("transitionend", () => el.remove(), { once: true });
            }, duration);
        }

        // 1. Console message — for fellow devs who inspect the page
        console.log(
            "%c\n██████╗ ██████╗\n██╔══██╗██╔══██╗\n██████╔╝██████╔╝\n██╔═══╝ ██╔══██╗\n██║     ██████╔╝\n╚═╝     ╚═════╝ \n",
            "color:#22d3ee;font-family:monospace;font-size:10px;line-height:1.2;"
        );
        console.log(
            "%cHey, you found the console 👀\n%c$ kubectl get secrets --namespace=princebansal\n%c  coffee-level     →  ∞\n  uptime           →  99.9%%\n  birthday         →  19/03/1998\n  open-to-work     →  true",
            "color:#e4e4e7;font-size:13px;font-weight:600;",
            "color:#71717a;font-family:monospace;font-size:11px;",
            "color:#4ade80;font-family:monospace;font-size:11px;"
        );

        // 2. Type "hire" anywhere → ACCESS GRANTED overlay
        let hireBuf = "";
        document.addEventListener("keydown", (e) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                hireBuf = (hireBuf + e.key).slice(-4);
                if (hireBuf.toLowerCase() === "hire") {
                    hireBuf = "";
                    const ov = document.createElement("div");
                    ov.className = "easter-konami";
                    ov.innerHTML = `<div class="easter-konami__inner">
                        <div class="easter-konami__title">ACCESS GRANTED</div>
                        <div class="easter-konami__sub">sudo su - prince_bansal · Welcome to prod 🚀</div>
                    </div>`;
                    document.body.appendChild(ov);
                    requestAnimationFrame(() => ov.classList.add("is-visible"));
                    setTimeout(() => {
                        ov.classList.add("is-leaving");
                        ov.addEventListener("transitionend", () => ov.remove(), { once: true });
                    }, 2800);
                }
            }
        });

        // 3. Type "sudo" anywhere → toast
        let sudoBuf = "";
        document.addEventListener("keydown", (e) => {
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                sudoBuf = (sudoBuf + e.key).slice(-4);
                if (sudoBuf.toLowerCase() === "sudo") {
                    showToast("sudo: permission denied — need to hire me first 😏");
                    sudoBuf = "";
                }
            }
        });

        // 4. Click terminal status dot → last incident toast
        const statusDot = document.querySelector(".hero__terminal-status");
        if (statusDot) {
            statusDot.style.cursor = "pointer";
            statusDot.title = "click me";
            statusDot.addEventListener("click", () =>
                showToast("Last incident: never 🤞 (knock on wood)", 3500)
            );
        }

        // 5. Idle terminal — auto-types a command after 14s
        const termBody = document.querySelector(".hero__terminal-body");
        if (termBody && !prefersReducedMotion) {
            const idleTimer = setTimeout(() => {
                const lastLine = termBody.querySelector("div:last-child");
                const cmdRow = document.createElement("div");
                cmdRow.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd"> <span class="t-idle-type"></span></span>`;
                termBody.insertBefore(cmdRow, lastLine);
                const typeEl = cmdRow.querySelector(".t-idle-type");
                const text = "uptime --pretty";
                let i = 0;
                const ticker = setInterval(() => {
                    typeEl.textContent = text.slice(0, ++i);
                    if (i >= text.length) {
                        clearInterval(ticker);
                        typeEl.classList.remove("t-idle-type");
                        setTimeout(() => {
                            const out = document.createElement("div");
                            out.className = "t-out";
                            out.innerHTML = `up <span class="t-cyan">69 days</span>, load avg: 0.01 🟢`;
                            const spacer = document.createElement("div");
                            spacer.className = "t-spacer";
                            termBody.insertBefore(out, lastLine);
                            termBody.insertBefore(spacer, lastLine);
                        }, 280);
                    }
                }, 75);
            }, 7000);
            // cancel if user scrolls away
            window.addEventListener("scroll", () => clearTimeout(idleTimer), { once: true, passive: true });
        }

        // 6. Click footer year → days shipping infra
        const yearSpan = document.getElementById("year");
        if (yearSpan) {
            yearSpan.style.cursor = "pointer";
            yearSpan.title = "🤫";
            yearSpan.addEventListener("click", () => {
                const days = Math.floor((Date.now() - new Date("2023-01-16")) / 86400000);
                showToast(`${days} days shipping infra — and counting 🚀`);
            });
        }
    })();

    /* -------- Update copyright year -------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* -------- Initialize Feather icons (if available) -------- */
    const initFeather = () => {
        if (window.feather) window.feather.replace({ "stroke-width": 1.6 });
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFeather);
    } else {
        initFeather();
    }
})();
