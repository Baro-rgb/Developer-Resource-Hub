// src/pages/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Settings,
  ArrowRight,
  Bolt,
  ShieldCheck,
  Sparkles,
  Cpu,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  Network,
  Lock,
  Archive,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';

const Navbar = () => (
  <nav className="welcome-nav">
    <div className="welcome-nav-left">
      <span className="welcome-brand">CommandCenter</span>
      <div className="welcome-nav-links">
        {['Docs', 'Support', 'API'].map((item) => (
          <a key={item} href="/" onClick={(e) => e.preventDefault()} className="welcome-nav-link">
            {item}
          </a>
        ))}
      </div>
    </div>
    <div className="welcome-nav-right">
      <button className="welcome-nav-lang">Language</button>
      <Bell className="welcome-nav-icon" />
      <Settings className="welcome-nav-icon" />
      <div className="welcome-avatar">
        <img
          alt="User Profile"
          className="h-full w-full object-cover"
          src="https://picsum.photos/seed/avatar/100/100"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="welcome-hero">
    <div className="welcome-hero-glow-right" />
    <div className="welcome-hero-glow-left" />

    <div className="welcome-hero-grid">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-10"
      >
        <div className="welcome-chip">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-300" />
          <span className="welcome-chip-text">Enterprise Command v4.2</span>
        </div>

        <div className="space-y-6">
          <h1 className="welcome-hero-title">
            Master Your <br />
            <span className="welcome-hero-title-accent">Digital Domain.</span>
          </h1>
          <p className="welcome-hero-subtitle">
            Orchestrate complex global workflows with architectural precision and high-density
            data intelligence. The definitive authority for modern enterprise operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/login" className="welcome-btn-primary group">
            Login to Console
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/register" className="welcome-btn-secondary">
            Register Authority
          </Link>
        </div>

        <div className="welcome-benefits">
          <div className="welcome-benefit-item">
            <Bolt className="h-5 w-5 text-blue-300" />
            <div>
              <h4 className="welcome-benefit-title">Zero Latency</h4>
              <p className="welcome-benefit-desc">Real-time global syncing across all nodes.</p>
            </div>
          </div>
          <div className="welcome-benefit-item">
            <ShieldCheck className="h-5 w-5 text-blue-300" />
            <div>
              <h4 className="welcome-benefit-title">Military Grade</h4>
              <p className="welcome-benefit-desc">Biometric-ready authority protocols.</p>
            </div>
          </div>
          <div className="welcome-benefit-item">
            <Sparkles className="h-5 w-5 text-blue-300" />
            <div>
              <h4 className="welcome-benefit-title">Neural Logic</h4>
              <p className="welcome-benefit-desc">Predictive workflow optimization engine.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="hidden lg:block"
      >
        <div className="welcome-visual-wrapper">
          <div className="welcome-glass-panel relative aspect-square rounded-[2rem] p-8">
            <img
              alt="Enterprise Infrastructure"
              className="h-full w-full rounded-2xl object-cover opacity-40"
              src="https://picsum.photos/seed/tech/800/800"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-blue-300">
                  System Core
                </span>
                <h3 className="text-2xl font-extrabold text-white">Authority Node 01</h3>
              </div>
              <div className="rounded-full bg-blue-400/20 p-3">
                <Cpu className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="welcome-float-card top"
          >
            <div className="rounded-lg bg-blue-400/10 p-2">
              <TrendingUp className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Efficiency
              </div>
              <div className="text-xl font-extrabold text-white">+42.8%</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="welcome-float-card bottom"
          >
            <div className="rounded-full bg-blue-400/20 p-2">
              <Shield className="h-5 w-5 text-blue-300" />
            </div>
            <div className="text-sm font-bold text-white">99.9% Compliance</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Features = () => (
  <section className="welcome-features">
    <div className="welcome-section-inner">
      <div className="mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Tactical Precision <span className="text-blue-300 italic">Capabilities.</span>
          </h2>
          <p className="text-lg text-slate-300">
            Deep integration and atmospheric design tokens engineered for technical decision
            makers.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="welcome-round-btn" aria-label="Previous feature">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="welcome-round-btn" aria-label="Next feature">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Architectural Logic',
            desc: 'Map complex data structures across multi-tenant environments with real-time syncing and authority overrides.',
            icon: Network,
          },
          {
            title: 'System Authority',
            desc: 'Granular access control logic with biometric-ready authentication layers and comprehensive audit trails.',
            icon: Lock,
          },
          {
            title: 'Resource Vault',
            desc: 'Secured metadata repository with automated versioning and cold-storage failover protocols.',
            icon: Archive,
          },
        ].map((feature) => (
          <motion.div key={feature.title} whileHover={{ y: -5 }} className="welcome-glass-panel p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-slate-700/60 p-3">
              <feature.icon className="h-7 w-7 text-blue-300" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">{feature.title}</h3>
            <p className="leading-relaxed text-slate-300">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-28">
    <div className="welcome-section-inner text-center">
      <h2 className="mb-8 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
        Ready to Take <span className="text-blue-300">Command?</span>
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
        Deploy the most advanced enterprise shell. Your command center is ready for initialization.
      </p>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-2 rounded-[2rem] border border-slate-700 bg-slate-800/60 p-2 md:flex-row">
        <div className="flex w-full items-center px-4">
          <Search className="mr-2 h-5 w-5 text-slate-400" />
          <input
            className="w-full bg-transparent py-3 text-white placeholder:text-slate-500 focus:outline-none"
            placeholder="enterprise@company.com"
            type="email"
          />
        </div>
        <button className="welcome-btn-primary w-full md:w-auto">Request Access</button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-slate-800 px-8 py-10">
    <div className="welcome-section-inner flex flex-col items-center justify-between gap-5 md:flex-row">
      <div>
        <span className="text-lg font-bold text-blue-300">CommandCenter</span>
        <p className="text-xs text-slate-500">
          © 2024 Digital Command Authority. All rights reserved.
        </p>
      </div>
      <div className="flex gap-6">
        {['Privacy Policy', 'Terms of Service', 'Security'].map((item) => (
          <a key={item} href="/" onClick={(e) => e.preventDefault()} className="welcome-footer-link">
            {item}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

const Welcome = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <Navbar />
    <Hero />
    <Features />
    <CTA />
    <Footer />
  </div>
);

export default Welcome;
