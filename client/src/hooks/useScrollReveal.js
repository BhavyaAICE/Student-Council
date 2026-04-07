import { useEffect, useRef, useCallback } from 'react';

export function useScrollReveal(selector = '.reveal') {
    const observerRef = useRef(null);

    useEffect(() => {
        // Delay to ensure DOM is ready after data loads
        const timer = setTimeout(() => {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;

            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observerRef.current.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

            elements.forEach(el => observerRef.current.observe(el));
        }, 300);

        return () => {
            clearTimeout(timer);
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [selector]);
}

export function useBentoReveal() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const items = document.querySelectorAll('.bento-item');
            if (!items.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const allItems = document.querySelectorAll('.bento-item');
                        const index = Array.from(allItems).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.08}s`;
                        entry.target.classList.add('bento-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

            items.forEach(item => observer.observe(item));
        }, 500);

        return () => clearTimeout(timer);
    }, []);
}

export function useKineticReveal() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const items = document.querySelectorAll('.kinetic-item');
            if (!items.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const allItems = document.querySelectorAll('.kinetic-item');
                        const index = Array.from(allItems).indexOf(entry.target);
                        setTimeout(() => {
                            entry.target.classList.add('kinetic-visible');
                        }, index * 150);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            items.forEach(item => observer.observe(item));
        }, 500);

        return () => clearTimeout(timer);
    }, []);
}

export function useCounterAnimation() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const counters = document.querySelectorAll('.stat-number');
            if (!counters.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.getAttribute('data-count'));
                        const duration = 1500;
                        const increment = target / (duration / 16);
                        let current = 0;

                        const update = () => {
                            current += increment;
                            if (current < target) {
                                entry.target.textContent = Math.ceil(current);
                                requestAnimationFrame(update);
                            } else {
                                entry.target.textContent = target + '+';
                            }
                        };

                        update();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(c => observer.observe(c));
        }, 500);

        return () => clearTimeout(timer);
    }, []);
}

export function useParallax() {
    useEffect(() => {
        const onScroll = () => {
            const heroBgImg = document.querySelector('.hero-bg-img');
            if (!heroBgImg) return;
            const rate = window.scrollY * 0.3;
            heroBgImg.style.transform = `scale(1.1) translateY(${rate}px)`;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
}
