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
