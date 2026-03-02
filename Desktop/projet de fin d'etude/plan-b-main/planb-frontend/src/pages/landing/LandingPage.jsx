import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

/* ─── Counter animation hook ─── */
function useCounter(target, duration = 2000, start = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!start || target === 0) return;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [start, target, duration]);
    return value;
}

/* ─── Scroll-reveal hook ─── */
function useReveal() {
    useEffect(() => {
        const reveals = document.querySelectorAll('.lp-reveal');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add('visible'), i * 80);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        reveals.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

/* ─── Hero parallax mouse effect ─── */
function useHeroParallax(heroRef) {
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const layers = [
            { selector: '.lp-hero-badge', strength: 0.015 },
            { selector: '.lp-hero-title', strength: 0.03 },
            { selector: '.lp-hero-subtitle', strength: 0.02 },
            { selector: '.lp-search-box', strength: 0.012 },
            { selector: '.lp-hero-bg-img', strength: -0.02 },
            { selector: '.lp-hero-pattern', strength: -0.01 },
        ];

        let raf;
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        const handleMove = (e) => {
            const rect = hero.getBoundingClientRect();
            // Normalize -1 to +1 from center
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };

        const handleLeave = () => {
            mouseX = 0;
            mouseY = 0;
        };

        const animate = () => {
            // Smooth lerp toward mouse
            targetX += (mouseX - targetX) * 0.07;
            targetY += (mouseY - targetY) * 0.07;

            layers.forEach(({ selector, strength }) => {
                const el = hero.querySelector(selector);
                if (!el) return;
                const ox = targetX * strength * 100;
                const oy = targetY * strength * 100;
                el.style.transform = `translate(${ox}px, ${oy}px)`;
            });

            raf = requestAnimationFrame(animate);
        };

        hero.addEventListener('mousemove', handleMove, { passive: true });
        hero.addEventListener('mouseleave', handleLeave);
        raf = requestAnimationFrame(animate);

        return () => {
            hero.removeEventListener('mousemove', handleMove);
            hero.removeEventListener('mouseleave', handleLeave);
            cancelAnimationFrame(raf);
            // Reset transforms on cleanup
            layers.forEach(({ selector }) => {
                const el = hero.querySelector(selector);
                if (el) el.style.transform = '';
            });
        };
    }, [heroRef]);
}

/* ─── Carrousel BD ─── */
function BDCarousel({ scenes }) {
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(true);
    const [hovered, setHovered] = useState(false);
    const timerRef = useRef(null);

    const goTo = (idx) => {
        if (idx === current) return;
        setVisible(false);
        setTimeout(() => {
            setCurrent(idx);
            setVisible(true);
        }, 300);
    };

    const prev = () => goTo((current - 1 + scenes.length) % scenes.length);
    const next = () => goTo((current + 1) % scenes.length);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (current === scenes.length - 1) {
                clearInterval(timerRef.current);
                document.querySelector('.lp-cta')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                next();
            }
        }, 5500);
        return () => clearInterval(timerRef.current);

    }, [current]);

    const scene = scenes[current];
    const isBefore = scene.phase === 'before';

    const arrowBase = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(0,0,0,.55)',
        border: '1px solid rgba(255,255,255,.15)',
        borderRadius: '50%',
        width: 42,
        height: 42,
        color: '#fff',
        fontSize: 22,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        zIndex: 10,
        transition: 'opacity .35s ease, background .2s',
        opacity: hovered ? 1 : 0,
    };

    return (
        <section id="bd" style={{ background: 'linear-gradient(180deg,#0f172a 0%,#111827 100%)', padding: '72px 0' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

                {/* ── Bannière couverture ── */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <span style={{ display: 'inline-block', padding: '4px 16px', background: '#f97316', color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 999, textTransform: 'uppercase', letterSpacing: 3 }}>🎬 Notre Histoire</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                        src="/bd_scene0.png"
                        alt="La révolution commence — PlanB"
                        style={{ maxWidth: '78%', width: '100%', height: 'auto', display: 'block', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                </div>
                <p style={{ color: '#4b5563', fontSize: '.85rem', textAlign: 'center', marginBottom: 28 }}>
                    10 scènes — l'histoire d'une transformation
                </p>

                {/* Phase label — UN seul badge dynamique */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                        padding: '7px 22px',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        background: isBefore ? 'rgba(127,29,29,.6)' : 'rgba(120,53,15,.6)',
                        color: isBefore ? '#fca5a5' : '#fcd34d',
                        border: `1px solid ${isBefore ? 'rgba(239,68,68,.3)' : 'rgba(251,191,36,.3)'}`,
                        backdropFilter: 'blur(8px)',
                        transition: 'all .5s ease',
                        letterSpacing: 1,
                    }}>
                        {isBefore ? '😩 Avant PlanB' : '✨ Avec PlanB'}
                    </div>
                </div>

                {/* Slide */}
                <div
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        background: isBefore
                            ? 'linear-gradient(135deg,#1e2942,#1f2937)'
                            : 'linear-gradient(135deg,#1a2535,#1e3a2f)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: isBefore
                            ? '0 12px 48px rgba(239,68,68,.1)'
                            : '0 12px 48px rgba(251,191,36,.1)',
                        border: `1px solid ${isBefore ? 'rgba(239,68,68,.1)' : 'rgba(251,191,36,.12)'}`,
                        minHeight: 300,
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'scale(1)' : 'scale(.985)',
                        transition: 'opacity .35s cubic-bezier(.4,0,.2,1), transform .35s cubic-bezier(.4,0,.2,1)',
                    }}>
                        {/* Image */}
                        <div style={{ width: '45%', minWidth: 180, position: 'relative', flexShrink: 0, minHeight: 280 }}>
                            <img
                                src={scene.img}
                                alt={scene.tag}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', position: 'absolute', inset: 0 }}
                            />
                            <div style={{
                                position: 'absolute', inset: 0, background: isBefore
                                    ? 'linear-gradient(to right, rgba(0,0,0,.1) 50%, #1e2942)'
                                    : 'linear-gradient(to right, rgba(0,0,0,.1) 50%, #1a2535)'
                            }} />
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '36px 36px 36px 28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: 26 }}>{scene.emoji}</span>
                                <span className={scene.tagCls} style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2.5 }}>{scene.tag}</span>
                            </div>
                            <h3 style={{ color: '#f9fafb', fontSize: 'clamp(1rem,2.5vw,1.35rem)', fontWeight: 900, marginBottom: 14, lineHeight: 1.35, margin: '0 0 14px' }}>{scene.title}</h3>
                            <p style={{ color: isBefore ? '#9ca3af' : '#94a3b8', fontSize: '0.93rem', lineHeight: 1.75, margin: 0 }}>{scene.desc}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
                                {scene.chips.map(([label, cls]) => (
                                    <span key={label} className={cls} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Flèches — visibles au survol */}
                    <button onClick={prev} style={{ ...arrowBase, left: 12 }} aria-label="Précédent">‹</button>
                    <button onClick={next} style={{ ...arrowBase, right: 12 }} aria-label="Suivant">›</button>
                </div>

                {/* Dots seulement — pas de compteur */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                    {scenes.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            style={{
                                width: i === current ? 28 : 8,
                                height: 8,
                                borderRadius: 999,
                                border: 'none',
                                cursor: 'pointer',
                                background: i === current
                                    ? (isBefore ? '#ef4444' : '#f59e0b')
                                    : '#1f2937',
                                boxShadow: i === current ? `0 0 8px ${isBefore ? 'rgba(239,68,68,.5)' : 'rgba(245,158,11,.5)'}` : 'none',
                                transition: 'all .4s cubic-bezier(.4,0,.2,1)',
                                padding: 0,
                            }}
                            aria-label={`Scène ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Barre de progression */}
                <div style={{ height: 2, background: '#1f2937', borderRadius: 999, marginTop: 14, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        background: isBefore
                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                            : 'linear-gradient(90deg,#f97316,#f59e0b)',
                        borderRadius: 999,
                        width: `${((current + 1) / scenes.length) * 100}%`,
                        transition: 'width .4s ease, background .5s ease',
                    }} />
                </div>

                {/* Scroll-down hint sur la dernière slide */}
                {current === scenes.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 20, opacity: 0.85 }}>
                        <span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>Découvrir la suite</span>
                        <a
                            href="#cta"
                            onClick={e => { e.preventDefault(); document.querySelector('.lp-cta')?.scrollIntoView({ behavior: 'smooth' }); }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: '#f97316', cursor: 'pointer' }}
                            aria-label="Section suivante"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ animation: 'bdBounce 1.4s ease-in-out infinite' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </a>
                        <style>{`@keyframes bdBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }`}</style>
                    </div>
                )}
            </div>
        </section>
    );
}

export default function LandingPage() {

    const navigate = useNavigate();
    const heroRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [statsStarted, setStatsStarted] = useState(false);
    const [countriesOpen, setCountriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCountry, setSearchCountry] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Stats from API
    const [targetAnnonces, setTargetAnnonces] = useState(0);
    const [targetUsers, setTargetUsers] = useState(0);
    const [targetCertif, setTargetCertif] = useState(0);

    // Fetch real stats from backend
    useEffect(() => {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        fetch(`${API}/listings/stats`)
            .then(r => r.json())
            .then(data => {
                const s = data.stats || {};
                setTargetAnnonces(s.activeListings || 0);
                setTargetUsers(s.totalUsers || 0);
                // certifiedSellers not yet in API, fallback to 0
                setTargetCertif(s.certifiedSellers || 0);
            })
            .catch(() => { }); // silently fail - stays at 0
    }, []);

    // Counters animate once stats are loaded and visible
    const annonces = useCounter(targetAnnonces, 2000, statsStarted);
    const users = useCounter(targetUsers, 2000, statsStarted);
    const certif = useCounter(targetCertif, 2000, statsStarted);

    useReveal();
    useHeroParallax(heroRef);

    // Start counters after mount
    useEffect(() => {
        const t = setTimeout(() => setStatsStarted(true), 800);
        return () => clearTimeout(t);
    }, []);

    // Scroll progress calculation - like HomePage Header
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const progress = Math.min(window.scrollY / 100, 1);
                    setScrollProgress(progress);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Computed styles based on scroll progress - like HomePage Header
    const isScrolled = useMemo(() => scrollProgress > 0.5, [scrollProgress]);
    const bgOpacity = scrollProgress;
    const navBgColor = isScrolled ? 'white' : `rgba(244, 98, 31, ${0.15 + bgOpacity * 0.85})`;
    const textColorClass = isScrolled ? 'text-gray-900' : 'text-white';
    const linkColorClass = isScrolled ? 'text-gray-600' : 'text-white';
    const buttonBorderClass = isScrolled ? 'border-orange-600 text-orange-600' : 'border-white text-white';

    // Handle search submit → navigate to /home with params
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (searchCountry) params.set('country', searchCountry);
        if (searchCategory) params.set('category', searchCategory);
        navigate(`/annonces?${params.toString()}`);
    };

    return (
        <div className="lp">
            {/* ===== NAVBAR ===== */}
            <nav 
                className={`lp-nav${isScrolled ? ' scrolled' : ''}`}
                style={{
                    backgroundColor: navBgColor,
                    boxShadow: bgOpacity > 0.5 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    backdropFilter: isScrolled ? 'none' : 'blur(8px)',
                    transition: 'all 0.3s ease'
                }}
            >
                <a href="#hero" className="lp-nav-logo">
                    <img src="/logofinal.png" alt="PlanB" style={{ height: isScrolled ? 56 : 64, width: 'auto', transition: 'all 0.3s ease' }} />
                    <div className="lp-logo-text" style={{ color: isScrolled ? '#1a1a1a' : 'white', transition: 'all 0.3s ease' }}>Plan <span style={{ color: isScrolled ? '#F4621F' : '#1a1a1a', transition: 'all 0.3s ease' }}>B</span></div>
                </a>

                <ul className="lp-nav-links">
                    <li><a href="#hero" style={{ color: isScrolled ? '#4b5563' : 'white', transition: 'all 0.3s ease' }}>Accueil</a></li>
                    <li><a href="#categories" style={{ color: isScrolled ? '#4b5563' : 'white', transition: 'all 0.3s ease' }}>Catégories</a></li>
                    <li><a href="#how" style={{ color: isScrolled ? '#4b5563' : 'white', transition: 'all 0.3s ease' }}>Comment ça marche</a></li>
                    <li><a href="#trust" style={{ color: isScrolled ? '#4b5563' : 'white', transition: 'all 0.3s ease' }}>Sécurité</a></li>
                    <li><a href="#pricing" style={{ color: isScrolled ? '#4b5563' : 'white', transition: 'all 0.3s ease' }}>Tarifs</a></li>
                </ul>

                <div className="lp-nav-actions">
                    <Link to="/login" className="lp-btn-outline" style={{ borderColor: isScrolled ? '#F4621F' : 'white', color: isScrolled ? '#F4621F' : 'white', transition: 'all 0.3s ease' }}>Connexion</Link>
                    <Link to="/home" className="lp-btn-primary" style={{ backgroundColor: isScrolled ? '#F4621F' : 'white', color: isScrolled ? 'white' : '#F4621F', transition: 'all 0.3s ease' }}>🚀 Accéder au site</Link>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="lp-hero" id="hero" ref={heroRef}>
                <div className="lp-hero-bg">
                    <div className="lp-hero-bg-img" />
                    <div className="lp-hero-pattern" />
                </div>

                <div className="lp-hero-content">
                    <div className="lp-hero-badge">
                        <div className="dot" />
                        Plateforme #1 en Afrique de l'Ouest
                    </div>

                    <h1 className="lp-hero-title">
                        Trouvez votre bonheur<br />
                        <span className="highlight">partout en Afrique</span>
                    </h1>

                    <p className="lp-hero-subtitle">
                        Immobilier, Vacances, Véhicules — Des milliers d'annonces vérifiées<br />
                        avec paiement Wave & Orange Money intégré
                    </p>

                    {/* Search bar */}
                    <form className="lp-search-box" onSubmit={handleSearch} id="search">
                        <span style={{ color: '#aaa', fontSize: 18 }}>🔍</span>
                        <input
                            className="lp-search-input"
                            type="text"
                            placeholder="Que recherchez-vous ? (villa, voiture, hôtel...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="lp-search-divider" />
                        <div className="lp-search-location">
                            <span>📍</span>
                            <select value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)}>
                                <option value="">Tous les pays</option>
                                <option value="CI">🇨🇮 Côte d'Ivoire</option>
                                <option value="BJ">🇧🇯 Bénin</option>
                                <option value="SN">🇸🇳 Sénégal</option>
                                <option value="ML">🇲🇱 Mali</option>
                            </select>
                        </div>
                        <div className="lp-search-divider" />
                        <div className="lp-search-cat">
                            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                <option value="">Catégorie</option>
                                <option value="immobilier">🏠 Immobilier</option>
                                <option value="vacances">🏨 Vacances</option>
                                <option value="vehicules">🚗 Véhicules</option>
                            </select>
                        </div>
                        <button type="submit" className="lp-search-btn">🔍 Chercher</button>
                    </form>
                </div>

                {/* Stats */}
                <div className="lp-hero-stats">
                    <div className="lp-stat-item">
                        <div className="lp-stat-number">{annonces.toLocaleString()}</div>
                        <div className="lp-stat-label">Annonces actives</div>
                    </div>
                    <div className="lp-stat-item">
                        <div className="lp-stat-number">{users.toLocaleString()}</div>
                        <div className="lp-stat-label">Utilisateurs</div>
                    </div>
                    <div className="lp-stat-item">
                        <div className="lp-stat-number">4</div>
                        <div className="lp-stat-label">Pays couverts</div>
                    </div>
                    <div className="lp-stat-item">
                        <div className="lp-stat-number">{certif.toLocaleString()}</div>
                        <div className="lp-stat-label">Vendeurs certifiés</div>
                    </div>
                </div>

                {/* Country drawer */}
                <div className="lp-country-drawer">
                    <button
                        className={`lp-flag-trigger${countriesOpen ? ' open' : ''}`}
                        onClick={() => setCountriesOpen(v => !v)}
                    >
                        <span className="lp-flag-trigger-icon">{countriesOpen ? '✕' : '🌍'}</span>
                        <span>Pays</span>
                        <span className="lp-flag-trigger-arrow">{countriesOpen ? '◀' : '▶'}</span>
                    </button>

                    <div className={`lp-flag-panel${countriesOpen ? ' open' : ''}`}>
                        <div className="lp-flag-chip">🇨🇮 Côte d'Ivoire</div>
                        <div className="lp-flag-chip">🇧🇯 Bénin</div>
                        <div className="lp-flag-chip">🇸🇳 Sénégal</div>
                        <div className="lp-flag-chip">🇲🇱 Mali</div>
                    </div>
                </div>

                {/* Wave */}
                <svg className="lp-wave-divider" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="white" />
                </svg>
            </section>

            {/* ===== CATEGORIES ===== */}
            <section className="lp-categories" id="categories">
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="lp-section-tag lp-reveal">✦ Explorez</div>
                    <h2 className="lp-section-title lp-reveal">Toutes les catégories</h2>
                    <p className="lp-section-sub lp-reveal">Des annonces vérifiées dans tout l'Ouest africain</p>

                    <div className="lp-categories-grid">
                        <Link to="/category/immobilier" className="lp-cat-card lp-cat-immo lp-reveal">
                            <div>
                                <div className="lp-cat-icon">🏠</div>
                                <div className="lp-cat-name">Immobilier</div>
                                <div className="lp-cat-desc">Maisons, appartements, terrains, bureaux</div>
                                <div className="lp-cat-subs">
                                    <span className="lp-cat-sub-chip">À vendre</span>
                                    <span className="lp-cat-sub-chip">À louer</span>
                                    <span className="lp-cat-sub-chip">Terrain</span>
                                    <span className="lp-cat-sub-chip">Bureau</span>
                                    <span className="lp-cat-sub-chip">Local commercial</span>
                                </div>
                            </div>
                            <div className="lp-cat-cta">Voir les annonces →</div>
                        </Link>

                        <Link to="/category/vacances" className="lp-cat-card lp-cat-vacances lp-reveal">
                            <div>
                                <div className="lp-cat-icon">🏨</div>
                                <div className="lp-cat-name">Vacances</div>
                                <div className="lp-cat-desc">Hôtels, villas, résidences meublées</div>
                                <div className="lp-cat-subs">
                                    <span className="lp-cat-sub-chip">Hôtel</span>
                                    <span className="lp-cat-sub-chip">Villa meublée</span>
                                    <span className="lp-cat-sub-chip">Appartement</span>
                                    <span className="lp-cat-sub-chip">Résidence</span>
                                </div>
                            </div>
                            <div className="lp-cat-cta">Voir les annonces →</div>
                        </Link>

                        <Link to="/category/vehicules" className="lp-cat-card lp-cat-vehicules lp-reveal">
                            <div>
                                <div className="lp-cat-icon">🚗</div>
                                <div className="lp-cat-name">Véhicules</div>
                                <div className="lp-cat-desc">Voitures, motos, camions et engins</div>
                                <div className="lp-cat-subs">
                                    <span className="lp-cat-sub-chip">Voiture vente</span>
                                    <span className="lp-cat-sub-chip">Voiture location</span>
                                    <span className="lp-cat-sub-chip">Moto</span>
                                    <span className="lp-cat-sub-chip">Camion</span>
                                    <span className="lp-cat-sub-chip">Engin</span>
                                </div>
                            </div>
                            <div className="lp-cat-cta">Voir les annonces →</div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== TRUST ===== */}
            <section className="lp-trust" id="trust">
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <div className="lp-section-tag lp-reveal" style={{ justifyContent: 'center' }}>✦ Pourquoi PlanB</div>
                    <h2 className="lp-section-title lp-reveal">La confiance avant tout</h2>
                    <p className="lp-section-sub lp-reveal">Chaque vendeur passe par notre processus de vérification</p>

                    <div className="lp-trust-grid">
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">✅</div>
                            <div className="lp-trust-title">Vendeurs certifiés</div>
                            <div className="lp-trust-desc">Tous nos bailleurs passent par une vérification stricte de documents. Chaque annonce affiche un badge de certification visible.</div>
                        </div>
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">📱</div>
                            <div className="lp-trust-title">Paiement mobile intégré</div>
                            <div className="lp-trust-desc">Payez directement via Wave ou Orange Money. Transactions sécurisées, confirmées en quelques secondes.</div>
                        </div>
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">💬</div>
                            <div className="lp-trust-title">Contact WhatsApp direct</div>
                            <div className="lp-trust-desc">Contactez les vendeurs directement via WhatsApp. Communication rapide et locale, sans friction.</div>
                        </div>
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">⭐</div>
                            <div className="lp-trust-title">Avis vérifiés</div>
                            <div className="lp-trust-desc">Seuls les acheteurs ayant réellement effectué une transaction peuvent laisser un avis. Authenticité garantie.</div>
                        </div>
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">🔒</div>
                            <div className="lp-trust-title">Données sécurisées</div>
                            <div className="lp-trust-desc">Documents supprimés après vérification. Vos données personnelles ne sont jamais revendues ni exposées.</div>
                        </div>
                        <div className="lp-trust-card lp-reveal">
                            <div className="lp-trust-icon">🌍</div>
                            <div className="lp-trust-title">Support local</div>
                            <div className="lp-trust-desc">Une équipe basée en Afrique de l'Ouest, qui comprend vos besoins et parle votre langue.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="lp-how" id="how">
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <div className="lp-section-tag lp-reveal" style={{ justifyContent: 'center' }}>✦ Simple & rapide</div>
                    <h2 className="lp-section-title lp-reveal">Comment ça marche ?</h2>
                    <p className="lp-section-sub lp-reveal">Publiez ou trouvez une annonce en 4 étapes</p>

                    <div className="lp-how-steps">
                        <div className="lp-step-card lp-step-1 lp-reveal">
                            <div className="lp-step-num">1</div>
                            <div className="lp-step-title">Créez votre compte</div>
                            <div className="lp-step-desc">Inscription gratuite en 2 minutes avec votre email ou numéro de téléphone</div>
                        </div>
                        <div className="lp-step-card lp-step-2 lp-reveal">
                            <div className="lp-step-num">2</div>
                            <div className="lp-step-title">Vérifiez votre identité</div>
                            <div className="lp-step-desc">Uploadez vos documents. Notre équipe certifie votre profil sous 24-72h</div>
                        </div>
                        <div className="lp-step-card lp-step-3 lp-reveal">
                            <div className="lp-step-num">3</div>
                            <div className="lp-step-title">Publiez votre annonce</div>
                            <div className="lp-step-desc">Ajoutez photos, prix en XOF et coordonnées WhatsApp</div>
                        </div>
                        <div className="lp-step-card lp-step-4 lp-reveal">
                            <div className="lp-step-num">4</div>
                            <div className="lp-step-title">Recevez des contacts</div>
                            <div className="lp-step-desc">Les acheteurs vous contactent directement via WhatsApp, appel ou SMS</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section className="lp-pricing" id="pricing">
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <div className="lp-section-tag lp-reveal" style={{ justifyContent: 'center' }}>✦ Tarifs</div>
                    <h2 className="lp-section-title lp-reveal">Choisissez votre formule</h2>
                    <p className="lp-section-sub lp-reveal">Commencez gratuitement, passez Pro quand vous êtes prêt</p>

                    <div className="lp-pricing-grid lp-reveal">
                        {/* ===== GRATUIT ===== */}
                        <div className="lp-price-card">
                            <div className="lp-plan-name">Gratuit</div>
                            <div className="lp-plan-price">0 <span>XOF / mois</span></div>
                            <div className="lp-plan-desc">Parfait pour les particuliers qui veulent tester la plateforme</div>
                            <ul className="lp-plan-features">
                                <li><span className="lp-check yes">✓</span> 4 annonces actives</li>
                                <li><span className="lp-check yes">✓</span> Badge identité vérifiée</li>
                                <li><span className="lp-check yes">✓</span> Contact WhatsApp</li>
                                <li><span className="lp-check no">✗</span> Annonces en vedette</li>
                                <li><span className="lp-check no">✗</span> Badge PRO certifié</li>
                                <li><span className="lp-check no">✗</span> Statistiques avancées</li>
                                <li><span className="lp-check no">✗</span> Annonces illimitées</li>
                            </ul>
                            <Link to="/register">
                                <button className="lp-plan-btn free">Commencer gratuitement</button>
                            </Link>
                        </div>

                        {/* ===== PRO ===== */}
                        <div className="lp-price-card pro">
                            <div className="lp-pro-badge">⭐ RECOMMANDÉ</div>
                            <div className="lp-plan-name">Pro</div>
                            <div className="lp-plan-price">5&nbsp;000 <span>XOF / mois</span></div>
                            <div className="lp-plan-desc">Pour les professionnels et agents immobiliers actifs</div>
                            <ul className="lp-plan-features">
                                <li><span className="lp-check yes">✓</span> Annonces illimitées</li>
                                <li><span className="lp-check yes">✓</span> Badge PRO certifié 💎</li>
                                <li><span className="lp-check yes">✓</span> Annonces en vedette</li>
                                <li><span className="lp-check yes">✓</span> Statistiques & performances</li>
                                <li><span className="lp-check yes">✓</span> Priorité dans les résultats</li>
                                <li><span className="lp-check yes">✓</span> Support prioritaire</li>
                                <li><span className="lp-check yes">✓</span> Visite virtuelle 360°</li>
                            </ul>
                            <Link to="/register?next=/upgrade">
                                <button className="lp-plan-btn pro-btn">Passer au Pro →</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PAYMENTS ===== */}
            <section className="lp-payments">
                <div className="lp-section-tag lp-reveal" style={{ justifyContent: 'center' }}>✦ Paiements locaux</div>
                <h2 className="lp-section-title lp-reveal">Payez comme vous voulez</h2>
                <p className="lp-section-sub lp-reveal">Solutions de paiement intégrées pour toute l'Afrique de l'Ouest</p>
                <div className="lp-payment-logos lp-reveal">
                    <div className="lp-payment-chip"><span className="emoji">📱</span><span>Wave</span></div>
                    <div className="lp-payment-chip"><span className="emoji">🟠</span><span>Orange Money</span></div>
                    <div className="lp-payment-chip"><span className="emoji">💛</span><span>MTN MoMo</span></div>
                    <div className="lp-payment-chip"><span className="emoji">💳</span><span>Carte bancaire</span></div>
                    <div className="lp-payment-chip"><span className="emoji">🤝</span><span>Paiement en main propre</span></div>
                </div>
            </section>

            {/* ===== COMIC STRIP BD — CARROUSEL ===== */}
            {(() => {
                const scenes = [
                    { n: 1, img: '/bd_scene1.png', phase: 'before', emoji: '😩', tag: 'Avant PlanB', tagCls: 'text-orange-400', badgeBg: 'bg-orange-500', title: '« Chercher un logement, un vrai parcours du combattant »', desc: 'Avant, trouver un logement ou une location était un vrai calvaire. Des heures dans les rues, à interroger des inconnus, avec des directions qui ne mènent nulle part.', chips: [['Désordre', 'bg-red-900/40 text-red-300'], ['Frustration', 'bg-red-900/40 text-red-300'], ['Bouche-à-oreille', 'bg-red-900/40 text-red-300']] },
                    { n: 2, img: '/bd_scene2.png', phase: 'before', emoji: '🤫', tag: 'Le bouche-à-oreille', tagCls: 'text-orange-400', badgeBg: 'bg-orange-500', title: '« On te promet tout… mais rien de concret »', desc: 'Le bouche-à-oreille, les fausses promesses, les informations floues… Personne ne peut garantir quoi que ce soit, et on repart les mains vides.', chips: [['Fausses infos', 'bg-red-900/40 text-red-300'], ['Incertitude', 'bg-red-900/40 text-red-300'], ['Perte de temps', 'bg-red-900/40 text-red-300']] },
                    { n: 3, img: '/bd_scene3.png', phase: 'before', emoji: '📱', tag: 'Les réseaux sociaux', tagCls: 'text-orange-400', badgeBg: 'bg-orange-500', title: '« Des heures à scroller pour rien »', desc: 'Scroller pendant des heures sur Facebook ou TikTok… Les annonces défilent sans fin, minuit arrive, et toujours aucune bonne adresse trouvée.', chips: [['Facebook', 'bg-red-900/40 text-red-300'], ['TikTok', 'bg-red-900/40 text-red-300'], ['Nuits perdues', 'bg-red-900/40 text-red-300']] },
                    { n: 4, img: '/bd_scene4.png', phase: 'before', emoji: '🚨', tag: 'Les arnaques', tagCls: 'text-red-400', badgeBg: 'bg-red-600', title: '« Les fausses annonces et les arnaques »', desc: "Payer des cautions, des frais de visite… et se faire arnaquer. Le faux agent disparaît avec l'argent, et le vrai propriétaire n'était même pas au courant.", chips: [['Arnaque', 'bg-red-900/60 text-red-300'], ['Caution perdue', 'bg-red-900/60 text-red-300'], ['Faux agents', 'bg-red-900/60 text-red-300']] },
                    { n: 5, img: '/bd_scene5.png', phase: 'before', emoji: '💔', tag: 'La déception totale', tagCls: 'text-red-400', badgeBg: 'bg-red-600', title: "« Ce n'est même pas le vrai propriétaire »", desc: "Ce n'était même pas le vrai propriétaire… Colère, désespoir, argent perdu. Ce sentiment d'injustice que trop de gens ont vécu.", chips: [['Désespoir', 'bg-red-900/60 text-red-300'], ['Injustice', 'bg-red-900/60 text-red-300'], ['Échec', 'bg-red-900/60 text-red-300']] },
                    { n: 6, img: '/bd_scene6.png', phase: 'after', emoji: '🌟', tag: 'La solution arrive', tagCls: 'text-amber-400', badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-400', title: '« Puis… PLANB arrive »', desc: "Puis une solution est arrivée. Une rupture totale avec l'ancien système — PlanB, une plateforme pensée pour l'Afrique.", chips: [['Nouvelle ère', 'bg-orange-900/40 text-orange-300'], ['Espoir', 'bg-orange-900/40 text-orange-300'], ['Innovation', 'bg-orange-900/40 text-orange-300']] },
                    { n: 7, img: '/bd_scene7.png', phase: 'after', emoji: '🔍', tag: 'Simple & rapide', tagCls: 'text-amber-400', badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-400', title: '« Tu cherches, tu trouves »', desc: 'Tu vas sur PlanB, tu cherches ce que tu veux. Maisons, Voitures, Vacances — tout est là, clair et accessible en quelques secondes.', chips: [['Maisons', 'bg-green-900/40 text-green-300'], ['Voitures', 'bg-green-900/40 text-green-300'], ['Vacances', 'bg-green-900/40 text-green-300']] },
                    { n: 8, img: '/bd_scene8.png', phase: 'after', emoji: '✅', tag: 'Confiance & sécurité', tagCls: 'text-green-400', badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-400', title: '« Des vendeurs vérifiés »', desc: "Tous les vendeurs sont vérifiés pour garantir leur légitimité. Fini les faux agents, les arnaques et les mauvaises surprises.", chips: [['Badge vérifié', 'bg-green-900/40 text-green-300'], ['Documents validés', 'bg-green-900/40 text-green-300'], ['Sécurité', 'bg-green-900/40 text-green-300']] },
                    { n: 9, img: '/bd_scene9.png', phase: 'after', emoji: '💬', tag: 'Sans intermédiaire', tagCls: 'text-cyan-400', badgeBg: 'bg-gradient-to-r from-orange-500 to-amber-400', title: '« Contact direct, sans stress »', desc: 'Tu contactes directement le vendeur. Simple. Rapide. Sans intermédiaires, sans confusion, et avec des sourires des deux côtés.', chips: [['Direct', 'bg-cyan-900/40 text-cyan-300'], ['Rapide', 'bg-cyan-900/40 text-cyan-300'], ['Zéro intermédiaire', 'bg-cyan-900/40 text-cyan-300']] },
                    { n: 10, img: '/bd_scene10.png', phase: 'after', emoji: '🏡', tag: 'La nouvelle vie', tagCls: 'text-amber-400', badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500', title: '« Fini les galères »', desc: "Plus de bouche-à-oreille. Plus d'arnaques. Une maison, une voiture garée devant, le soleil qui brille. Bienvenue sur PlanB.", chips: [['Réussite', 'bg-amber-900/40 text-amber-300'], ['Sérénité', 'bg-amber-900/40 text-amber-300'], ['Nouvelle vie', 'bg-amber-900/40 text-amber-300']] },
                ];
                return (
                    <BDCarousel scenes={scenes} />
                );
            })()}
            {/* ===== CTA ===== */}

            <section className="lp-cta">
                <div className="lp-cta-content">
                    <h2 className="lp-cta-title">Prêt à publier<br />votre première annonce ?</h2>
                    <p className="lp-cta-sub">Rejoignez des milliers de vendeurs certifiés en Afrique de l'Ouest</p>
                    <div className="lp-cta-btns">
                        <Link to="/register" className="lp-btn-white">🚀 Créer un compte gratuit</Link>
                        <Link to="/annonces" className="lp-btn-ghost">Voir les annonces →</Link>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="lp-footer">
                <div className="lp-footer-grid">
                    <div className="lp-footer-brand">
                        <a href="#hero" className="lp-nav-logo">
                            <img src="/logofinal.png" alt="PlanB" style={{ height: 96, width: 'auto' }} />
                            <div className="lp-logo-text" style={{ color: 'white' }}>Plan<span>B</span></div>
                        </a>
                        <p>La plateforme de petites annonces conçue pour l'Afrique de l'Ouest. Simple, sécurisée, locale.</p>
                        <div className="lp-footer-countries">
                            <span className="lp-footer-flag" title="Côte d'Ivoire">🇨🇮</span>
                            <span className="lp-footer-flag" title="Bénin">🇧🇯</span>
                            <span className="lp-footer-flag" title="Sénégal">🇸🇳</span>
                            <span className="lp-footer-flag" title="Mali">🇲🇱</span>
                        </div>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Catégories</h4>
                        <ul>
                            <li><Link to="/category/immobilier">🏠 Immobilier</Link></li>
                            <li><Link to="/category/vacances">🏨 Vacances</Link></li>
                            <li><Link to="/category/vehicules">🚗 Véhicules</Link></li>
                            <li><Link to="/annonces">⭐ Annonces Pro</Link></li>
                        </ul>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Plateforme</h4>
                        <ul>
                            <li><a href="#how">Comment ça marche</a></li>
                            <li><Link to="/verification">Vérification vendeur</Link></li>
                            <li><Link to="/upgrade">Tarifs Pro</Link></li>
                            <li><a href="#trust">Sécurité</a></li>
                        </ul>
                    </div>

                    <div className="lp-footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/contact">Centre d'aide</Link></li>
                            <li><Link to="/contact">Nous contacter</Link></li>
                            <li><Link to="/annonces">Signaler une annonce</Link></li>
                            <li><Link to="/terms">CGU & Confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="lp-footer-bottom">
                    <div>© 2025 PlanB. Tous droits réservés.</div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span>Monnaie : XOF</span>
                        <span>🇨🇮 🇧🇯 🇸🇳 🇲🇱</span>
                    </div>
                </div>
            </footer>
        </div >
    );
}
