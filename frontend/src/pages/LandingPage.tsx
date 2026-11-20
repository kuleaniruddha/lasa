import React, { useEffect, useState, useRef } from 'react';
import {
  ShieldAlert, Activity, Pill, Search, AlertTriangle, Zap,
  ChevronRight, Sparkles, ArrowRight, Heart, Brain, Eye,
  Lock, BarChart3, Scan, Star, CheckCircle2, Shield,
  Cpu, Database, Network, Clock, TrendingUp
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LandingPageProps {
  onGetStarted: () => void;
}

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 2000, startDelay = 600) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start - startDelay;
            if (elapsed < 0) { requestAnimationFrame(step); return; }
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startDelay]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Floating Particle Background                                       */
/* ------------------------------------------------------------------ */
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 12 + 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `rgba(12, 135, 235, ${p.opacity})`,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  DNA Helix Animation                                                */
/* ------------------------------------------------------------------ */
const DNAHelix: React.FC = () => {
  const strands = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-[500px] opacity-[0.07] pointer-events-none hidden lg:block">
      {strands.map((i) => (
        <div key={i} className="absolute w-full" style={{ top: `${(i / 16) * 100}%` }}>
          <div
            className="absolute w-3 h-3 rounded-full bg-health-400"
            style={{
              left: `${50 + 40 * Math.sin((i / 16) * Math.PI * 4)}%`,
              animation: `dnaRotate 4s ease-in-out ${i * 0.25}s infinite`,
            }}
          />
          <div
            className="absolute w-3 h-3 rounded-full bg-cyan-400"
            style={{
              left: `${50 - 40 * Math.sin((i / 16) * Math.PI * 4)}%`,
              animation: `dnaRotate 4s ease-in-out ${i * 0.25 + 2}s infinite`,
            }}
          />
          <div
            className="absolute h-[1px] bg-gradient-to-r from-health-400/30 via-cyan-400/20 to-health-400/30"
            style={{
              left: `${Math.min(50 + 40 * Math.sin((i / 16) * Math.PI * 4), 50 - 40 * Math.sin((i / 16) * Math.PI * 4))}%`,
              right: `${100 - Math.max(50 + 40 * Math.sin((i / 16) * Math.PI * 4), 50 - 40 * Math.sin((i / 16) * Math.PI * 4))}%`,
              top: '50%',
            }}
          />
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Orbit Ring                                                         */
/* ------------------------------------------------------------------ */
const OrbitRing: React.FC<{ size: number; duration: number; delay: number; children: React.ReactNode }> = ({ size, duration, delay, children }) => (
  <div
    className="absolute rounded-full border border-health-200/20 dark:border-health-700/20"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      animation: `orbitSpin ${duration}s linear ${delay}s infinite`,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Feature Card                                                       */
/* ------------------------------------------------------------------ */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
        style={{ backgroundImage: gradient }}
      />
      <div className="relative h-full p-6 rounded-2xl bg-white/60 dark:bg-surface-900/60 backdrop-blur-xl border border-surface-200/50 dark:border-surface-700/30 shadow-card hover:shadow-hover transition-all duration-500 group-hover:-translate-y-2 group-hover:border-health-300/50 dark:group-hover:border-health-600/30 overflow-hidden">
        {/* Shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ backgroundImage: gradient }}
          >
            {icon}
          </div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">{title}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
const StatCard: React.FC<{ value: number; suffix: string; label: string; icon: React.ReactNode; delay: number }> = ({ value, suffix, label, icon, delay }) => {
  const { count, ref } = useCountUp(value, 2000, delay * 1000);
  return (
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
        {count}{suffix}
      </div>
      <div className="text-sm text-health-200/80 mt-1 font-medium">{label}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Trusted Badge Ticker                                               */
/* ------------------------------------------------------------------ */
const TrustBadge: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm border border-surface-200/50 dark:border-surface-700/30 text-xs font-semibold text-surface-600 dark:text-surface-300 whitespace-nowrap shadow-sm">
    {icon}
    {text}
  </div>
);

/* ================================================================== */
/*  MAIN LANDING PAGE COMPONENT                                        */
/* ================================================================== */
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden" onMouseMove={handleMouseMove}>
      {/* ────────── CSS ANIMATIONS ────────── */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          25% { transform: translateY(-30px) translateX(15px) scale(1.2); }
          50% { transform: translateY(-10px) translateX(-10px) scale(0.8); }
          75% { transform: translateY(-40px) translateX(20px) scale(1.1); }
        }
        @keyframes dnaRotate {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        @keyframes orbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(12, 135, 235, 0.3), 0 0 60px rgba(12, 135, 235, 0.1); }
          50% { box-shadow: 0 0 40px rgba(12, 135, 235, 0.5), 0 0 80px rgba(12, 135, 235, 0.2); }
        }
        @keyframes slideInFromBottom {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-shimmer {
          background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 37%, transparent 63%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #0c87eb, #06b6d4, #8b5cf6, #0c87eb);
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-gradient {
          background: radial-gradient(ellipse 120% 80% at 50% 0%, rgba(12,135,235,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse 80% 50% at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse 60% 40% at 10% 60%, rgba(139,92,246,0.06) 0%, transparent 50%);
        }
        html.dark .hero-gradient {
          background: radial-gradient(ellipse 120% 80% at 50% 0%, rgba(12,135,235,0.15) 0%, transparent 60%),
                      radial-gradient(ellipse 80% 50% at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%),
                      radial-gradient(ellipse 60% 40% at 10% 60%, rgba(139,92,246,0.08) 0%, transparent 50%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        html.dark .glass-card {
          background: rgba(15, 23, 42, 0.6);
        }
      `}</style>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center hero-gradient">
        <FloatingParticles />
        <DNAHelix />

        {/* Interactive radial glow that follows cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(12,135,235,0.06), transparent 60%)`,
            opacity: loaded ? 1 : 0,
          }}
        />

        {/* Orbit Rings (decorative) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <OrbitRing size={700} duration={30} delay={0}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-health-400/40" />
          </OrbitRing>
          <OrbitRing size={500} duration={20} delay={2}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400/30" />
          </OrbitRing>
        </div>

        {/* Top Navigation Bar */}
        <nav
          className="absolute top-0 left-0 right-0 z-50"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-health-500 to-health-700 flex items-center justify-center text-white shadow-lg animate-breathe">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">LASA-GUARD</h1>
                <p className="text-[10px] font-semibold text-health-600 dark:text-health-400 tracking-[0.2em] uppercase -mt-0.5">Clinical Safety</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-health-600 dark:hover:text-health-400 transition-colors">Features</a>
              <a href="#stats" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-health-600 dark:hover:text-health-400 transition-colors">Impact</a>
              <a href="#how-it-works" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-health-600 dark:hover:text-health-400 transition-colors">How It Works</a>
              <button
                onClick={onGetStarted}
                className="px-5 py-2.5 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-semibold hover:bg-surface-800 dark:hover:bg-surface-100 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Launch App
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-health-50 dark:bg-health-950/40 border border-health-200/60 dark:border-health-700/30 mb-8"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              }}
            >
              <Sparkles className="w-4 h-4 text-health-600 dark:text-health-400" />
              <span className="text-xs font-bold text-health-700 dark:text-health-300 tracking-wide uppercase">
                AI-Powered Clinical Safety
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-risk-clear animate-pulse" />
            </div>

            {/* Main Heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
              }}
            >
              <span className="text-surface-900 dark:text-white">Protect Patients </span>
              <br />
              <span className="text-surface-900 dark:text-white">From </span>
              <span className="gradient-text">LASA Errors</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg md:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
              }}
            >
              Enterprise-grade AI surveillance that intercepts{' '}
              <strong className="text-surface-700 dark:text-surface-300">Look-Alike Sound-Alike</strong>{' '}
              medication errors in real-time — combining{' '}
              <strong className="text-surface-700 dark:text-surface-300">NLP, ML Ensembles &amp; Big Data</strong>{' '}
              to safeguard every prescription.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 1s',
              }}
            >
              {/* ★ PRIMARY "GET STARTED" BUTTON ★ */}
              <button
                id="landing-get-started"
                onClick={onGetStarted}
                className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-[0_20px_60px_-12px_rgba(12,135,235,0.5)] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0c87eb 0%, #016ac9 50%, #0254a2 100%)',
                  animation: 'pulseGlow 3s ease-in-out infinite',
                }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 animate-shimmer" />
                {/* Ripple circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full border border-white/20" style={{ animation: 'ripple 2s ease-out infinite' }} />
                  <div className="absolute w-8 h-8 rounded-full border border-white/10" style={{ animation: 'ripple 2s ease-out 0.6s infinite' }} />
                </div>
                <span className="relative z-10 flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-surface-700 dark:text-surface-300 font-semibold text-base border-2 border-surface-200 dark:border-surface-700 hover:border-health-300 dark:hover:border-health-600 hover:bg-health-50/50 dark:hover:bg-health-950/20 transition-all duration-300"
              >
                Explore Features
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className="mt-14 flex flex-wrap items-center justify-center gap-3"
              style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 1s ease 1.4s',
              }}
            >
              <TrustBadge text="FDA POCA Aligned" icon={<Shield className="w-3.5 h-3.5 text-health-600" />} />
              <TrustBadge text="ISMP Certified Data" icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />} />
              <TrustBadge text="HIPAA Compatible" icon={<Lock className="w-3.5 h-3.5 text-purple-600" />} />
              <TrustBadge text="761+ Drug Catalog" icon={<Database className="w-3.5 h-3.5 text-amber-600" />} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease 1.6s',
          }}
        >
          <span className="text-xs text-surface-400 dark:text-surface-500 font-medium">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-surface-300 dark:border-surface-600 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-surface-400 dark:bg-surface-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST MARQUEE ═══════════════ */}
      <section className="py-6 border-y border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 overflow-hidden">
        <div className="flex" style={{ animation: 'marquee 30s linear infinite' }}>
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12 px-6 shrink-0">
              {[
                'Real-Time Detection', '6-Metric NLP Analysis', 'ML Ensemble Scoring',
                'Bloom Filter Pre-Check', 'Tall Man Lettering', 'Prescription OCR',
                'Voice Dictation', 'Audit Trail', 'Override Management', 'Big Data Analytics'
              ].map((item) => (
                <span key={item} className="text-sm font-semibold text-surface-400 dark:text-surface-500 whitespace-nowrap flex items-center gap-2">
                  <Star className="w-3 h-3 text-health-400" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-health-50 dark:bg-health-950/30 border border-health-200/50 dark:border-health-800/30 mb-5">
              <Cpu className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              <span className="text-xs font-bold text-health-700 dark:text-health-300 uppercase tracking-wider">Core Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-4">
              Powered by <span className="gradient-text">Advanced AI</span>
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              A multi-engine intelligence platform combining NLP, Machine Learning, and Big Data to prevent medication errors.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="6-Metric NLP Engine"
              description="Levenshtein, BiSim, Soundex, Sorensen-Dice, Metaphone, and BERT Cosine similarity — every angle of linguistic confusion analyzed."
              gradient="linear-gradient(135deg, #0c87eb, #06b6d4)"
              delay={0}
            />
            <FeatureCard
              icon={<Cpu className="w-6 h-6" />}
              title="ML Classification Ensemble"
              description="Random Forest, XGBoost, Logistic Regression with KMeans TF-IDF clustering — soft-voting for superior accuracy."
              gradient="linear-gradient(135deg, #8b5cf6, #a855f7)"
              delay={0.1}
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="FDA POCA Composite Score"
              description="Orthographic, phonetic, and pharmacological classification combined into a single authoritative safety score."
              gradient="linear-gradient(135deg, #f59e0b, #ea580c)"
              delay={0.2}
            />
            <FeatureCard
              icon={<Scan className="w-6 h-6" />}
              title="Prescription OCR Scanner"
              description="Multi-drug prescription scanning with combinatorial safety screening and instant LASA collision detection."
              gradient="linear-gradient(135deg, #10b981, #059669)"
              delay={0.3}
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Big Data Analytics"
              description="Bloom Filter pre-checks, DGIM sliding-window tracking, Flajolet-Martin cardinality estimation, and Kafka streaming."
              gradient="linear-gradient(135deg, #ec4899, #be185d)"
              delay={0.4}
            />
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Tall Man Lettering"
              description="Interactive Tall Man letter generation highlighting confusable character segments for clinical staff awareness."
              gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS SECTION ═══════════════ */}
      <section id="stats" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-health-700 via-health-800 to-surface-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNHYySDE0djRoLTJ2Mkg4VjhoLTJ2NEg0djJIMnYySDB2MmgyVjZoMlY0aDJWMmgyVjBoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Measurable Clinical Impact
            </h2>
            <p className="text-health-200/70 text-lg">Numbers that speak for patient safety</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={761} suffix="+" label="Verified Drugs" icon={<Pill className="w-6 h-6 text-health-300" />} delay={0} />
            <StatCard value={123} suffix="" label="LASA Collision Pairs" icon={<AlertTriangle className="w-6 h-6 text-amber-300" />} delay={0.2} />
            <StatCard value={6} suffix="" label="NLP Metrics" icon={<Network className="w-6 h-6 text-cyan-300" />} delay={0.4} />
            <StatCard value={99} suffix="%" label="Detection Accuracy" icon={<TrendingUp className="w-6 h-6 text-emerald-300" />} delay={0.6} />
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 to-white dark:from-surface-950 dark:to-surface-900" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-health-50 dark:bg-health-950/30 border border-health-200/50 dark:border-health-800/30 mb-5">
              <Clock className="w-3.5 h-3.5 text-health-600 dark:text-health-400" />
              <span className="text-xs font-bold text-health-700 dark:text-health-300 uppercase tracking-wider">Workflow</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
              From prescription entry to clinical decision — in milliseconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Search className="w-7 h-7" />,
                title: 'Input & Scan',
                description: 'Type, paste, voice-dictate, or OCR-scan any prescription. Our system captures every medication name instantly.',
                gradient: 'from-health-500 to-cyan-500',
              },
              {
                step: '02',
                icon: <Brain className="w-7 h-7" />,
                title: 'AI Analysis',
                description: 'Six NLP similarity metrics + ML ensemble scoring + POCA composite — multi-dimensional risk analysis in real-time.',
                gradient: 'from-purple-500 to-indigo-500',
              },
              {
                step: '03',
                icon: <ShieldAlert className="w-7 h-7" />,
                title: 'Alert & Protect',
                description: 'Instant risk alerts with Tall Man lettering, clinical override workflows, and complete audit trail documentation.',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((item, idx) => {
              const cardRef = useRef<HTMLDivElement>(null);
              const [vis, setVis] = useState(false);
              useEffect(() => {
                const obs = new IntersectionObserver(
                  ([entry]) => { if (entry.isIntersecting) setVis(true); },
                  { threshold: 0.2 }
                );
                if (cardRef.current) obs.observe(cardRef.current);
                return () => obs.disconnect();
              }, []);

              return (
                <div
                  key={idx}
                  ref={cardRef}
                  className="relative group"
                  style={{
                    opacity: vis ? 1 : 0,
                    transform: vis ? 'translateY(0)' : 'translateY(50px)',
                    transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.15}s`,
                  }}
                >
                  {/* Connector line */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-[2px] bg-gradient-to-r from-surface-300 to-surface-200 dark:from-surface-600 dark:to-surface-700 z-20" />
                  )}
                  <div className="glass-card rounded-2xl p-8 border border-surface-200/50 dark:border-surface-700/30 shadow-card hover:shadow-hover transition-all duration-500 group-hover:-translate-y-2 text-center h-full flex flex-col items-center">
                    <div className="text-xs font-black text-surface-300 dark:text-surface-600 mb-4 tracking-[0.3em]">STEP {item.step}</div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      style={{ animation: `float ${3 + idx}s ease-in-out infinite` }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-health-900 to-surface-900" />
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-health-400/5"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out ${Math.random() * 5}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Every Second Counts</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Ready to Safeguard
            <br />
            <span className="bg-gradient-to-r from-health-300 via-cyan-300 to-health-300 bg-clip-text text-transparent" style={{ backgroundSize: '200%', animation: 'gradientShift 4s ease infinite' }}>
              Patient Lives?
            </span>
          </h2>
          <p className="text-lg text-health-200/60 max-w-xl mx-auto mb-10">
            Join the clinical safety revolution. Start intercepting LASA medication errors with AI-powered precision today.
          </p>

          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-3 px-12 py-6 rounded-2xl text-health-900 font-bold text-xl shadow-2xl hover:shadow-[0_20px_60px_-12px_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-1 overflow-hidden bg-white"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-health-100 via-white to-health-100 animate-shimmer" />
            <span className="relative z-10 flex items-center gap-3">
              <Zap className="w-6 h-6 text-health-600" />
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </button>

          <p className="mt-6 text-xs text-health-200/40">
            No setup required · 1-Click demo access · Enterprise-ready
          </p>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-8 border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-health-600" />
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">LASA-GUARD</span>
            <span className="text-xs text-surface-400">— Clinical Decision Support Platform</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-surface-400 dark:text-surface-500">
            <span>FDA POCA · ISMP · WHO INN</span>
            <span>HIPAA & FHIR Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
