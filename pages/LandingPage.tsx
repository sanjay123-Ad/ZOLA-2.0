import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';

const Header: React.FC<{ onLogoClick?: () => void; onStart: () => void }> = ({ onLogoClick, onStart }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto bg-white/90 backdrop-blur-lg rounded-full px-3 pl-8 py-4 shadow-2xl shadow-sky-200/40 border border-sky-100 transition-all duration-300 flex items-center gap-6 md:gap-12 ${
          scrolled ? 'scale-[0.98] opacity-95' : 'scale-100'
        }`}
      >
        <button onClick={onLogoClick} className="flex items-center focus:outline-none group" aria-label="Go to homepage">
          <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/20 group-hover:opacity-90 transition-opacity">
            <img src="https://i.postimg.cc/BQ63Y0dw/Frame-13.png" alt="ZOLA AI" className="w-8 h-8 object-contain" />
          </div>
        </button>
        <div className="hidden md:flex items-center space-x-2">
          {['Features', 'Studio', 'Pricing', 'Enterprise'].map((item) => (
            <a key={item} href="#" className="px-5 py-2.5 text-base font-bold text-slate-600 hover:text-sky-600 rounded-full hover:bg-sky-50 transition-all">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onStart} className="hidden sm:block px-5 py-2.5 text-base font-bold text-slate-600 hover:text-sky-600 transition-colors">
            Sign In
          </button>
          <button
            onClick={onStart}
            className="relative overflow-hidden group bg-sky-500 text-white px-8 py-3.5 rounded-full font-bold text-base shadow-xl shadow-sky-200/50 hover:shadow-sky-300/50 hover:-translate-y-0.5 transition-all"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center space-x-2">
              <span>Get Started</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

const travelCards = [
  {
    imageUrlBefore: 'https://i.postimg.cc/XNkVfYJN/M1.png',
    imageUrlAfter: 'https://i.postimg.cc/rFhMHZ5M/M2.png',
    title: "Men's Collection",
    tag: 'Streetwear',
  },
  {
    imageUrlBefore: 'https://i.postimg.cc/QtNw8DTR/women-image-1.png',
    imageUrlAfter: 'https://i.postimg.cc/FKNnpvDb/women-image-2.png',
    title: "Women’s Collection",
    tag: 'Casual Chic',
  },
] as const;

const PillarWipeAnimation: React.FC<{ imageBefore: string; imageAfter: string; badge: string }> = ({ imageBefore, imageAfter, badge }) => {
  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-50 to-white">
      {/* After image - base layer */}
      <img src={imageAfter} alt="After" className="absolute inset-0 w-full h-full object-contain" draggable="false" />
      
      {/* Before image - animated wipe layer */}
      <div className="absolute inset-0 w-full h-full animate-clip-loop">
        <img src={imageBefore} alt="Before" className="absolute inset-0 w-full h-full object-contain" draggable="false" />
      </div>
      
      {/* Badge */}
      <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur text-xs font-bold text-slate-900 px-4 py-2 rounded-full border border-sky-100 shadow-sm z-30">
        {badge}
      </div>
    </div>
  );
};

const ImageComparisonCard: React.FC<{ card: (typeof travelCards)[number]; className?: string }> = ({ card, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setSliderPosition(50);
  };
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`relative aspect-[3/4] w-full rounded-3xl overflow-hidden group cursor-ew-resize border border-white shadow-2xl shadow-sky-200/50 ${className}`}
    >
      <img src={card.imageUrlAfter} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-xs font-medium text-slate-900 z-30 shadow-sm">
        {card.tag}
      </div>
      <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img src={card.imageUrlBefore} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-20 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-sky-600">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
      <h3 className="absolute bottom-6 left-6 text-white font-heading text-2xl font-bold z-20 pointer-events-none">{card.title}</h3>
    </div>
  );
};

const FashionStudio: React.FC = () => (
  <section className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="container mx-auto max-w-7xl bg-white rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden shadow-2xl shadow-sky-200/40 border border-sky-100">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-100 via-sky-50/20 to-transparent pointer-events-none" />
      <div className="text-center max-w-4xl mx-auto mb-20 relative z-10">
        <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">AI Fashion</span> Studio
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">Everything you need to create stunning fashion campaigns, all in one place.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          {
            title: 'Virtual Photoshoot',
            desc: 'Swap garments on your models with perfect fit and lighting instantly.',
            icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
            btn: 'Seamless Swap',
          },
          {
            title: 'Model Transform',
            desc: 'Change models, ethnicities, and poses while keeping your product perfect.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            btn: 'AI Casting',
          },
          {
            title: 'Background Magic',
            desc: 'Transport your products to any setting. Beach, studio, or lifestyle scenes.',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            btn: 'Scene Creator',
          },
          {
            title: 'Product Perfection',
            desc: 'Ghost mannequin, flat-lays, and perfected shots. E-commerce ready.',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            btn: 'Auto Enhance',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-sky-50/30 rounded-[2.5rem] p-10 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.1)] border border-sky-100 text-center hover:-translate-y-3 transition-all duration-500 flex flex-col items-center group hover:shadow-[0_30px_60px_-15px_rgba(14,165,233,0.3)] hover:border-sky-300 hover:bg-white"
          >
            <div className="w-20 h-20 rounded-3xl bg-white text-sky-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-md border border-sky-50">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-4">{item.title}</h3>
            <p className="text-base text-slate-600 font-medium leading-relaxed mb-10 flex-grow">{item.desc}</p>
            <button className="px-8 py-3.5 bg-sky-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-500/30 w-full">
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const WhyChooseZola: React.FC<{ onGuideClick: () => void }> = ({ onGuideClick }) => (
  <section className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900">Why do I need it?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            title: 'Accelerated Time-to-Market',
            desc: 'Launch collections in days, not months. Skip the logistics of booking models, studios, and photographers. Get campaign-ready assets instantly.',
          },
          {
            title: 'Drastic Cost Reduction',
            desc: 'Traditional photoshoots cost thousands per day. ZOLA reduces your visual production costs by up to 90%, allowing you to invest more in growth.',
          },
          {
            title: 'Infinite Creative Scale',
            desc: 'Need 50 variations for A/B testing ads? Generate endless combinations of models, backgrounds, and poses without reshooting a single frame.',
          },
        ].map((card) => (
          <div key={card.title} className="bg-sky-500 rounded-3xl p-8 text-white shadow-xl shadow-sky-200 hover:scale-[1.03] hover:shadow-sky-300 transition-all duration-300">
            <h3 className="font-heading text-2xl font-bold mb-4">{card.title}</h3>
            <p className="text-sky-50 leading-relaxed font-medium">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="font-heading text-3xl font-bold text-slate-900 mb-4">Fashion photography made easy</h3>
        <p className="text-lg text-slate-600 mb-8">
          ZOLA AI lets you create professional studio-quality fashion assets to capture your audience&apos;s attention and stand out from the generic catalog content your competitors put out.
        </p>
        <button
          onClick={onGuideClick}
          className="px-8 py-4 bg-sky-500 text-white text-lg font-bold rounded-full hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 flex items-center mx-auto group transform hover:-translate-y-1"
        >
          <span>Ultimate Guide to AI Fashion</span>
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  </section>
);

const sceneImages = ['https://i.postimg.cc/CL65q5rV/A6.jpg', 'https://i.postimg.cc/3J6rw6WJ/A10.jpg', 'https://i.postimg.cc/QtXhPZYw/A13.jpg', 'https://i.postimg.cc/9QZ2QQvL/A1.jpg'];

const colorClassMap: Record<'sky' | 'cyan' | 'blue', { bg: string; text: string }> = {
  sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

const traditionalPainPoints = [
  {
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    title: 'Complex Prompt Engineering',
    desc: 'Hours of writing & refining advanced prompts just to get one decent outfit swap.',
    pain: 'Pain Point: Trial & Error Hell',
  },
  {
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    title: 'Manual Masking & Editing',
    desc: 'Using complex software to manually cut out garments, requiring professional skills.',
    pain: 'Pain Point: Skill Barrier',
  },
  {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    title: 'Physical Logistics',
    desc: 'Steaming clothes, booking studio time, setting up lighting rigs.',
    pain: 'Pain Point: Slow & Expensive',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Expensive Productions',
    desc: 'Hiring models, photographers, and makeup artists. Inaccessible costs.',
    pain: 'Pain Point: High Barrier to Entry',
  },
];

const zolaWins = [
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'Zero-Prompt Swap',
    desc: 'Visual-first AI handles physics, lighting, and draping instantly from two uploads.',
    badge: 'Visual Intelligence',
    color: 'sky' as const,
  },
  {
    icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
    title: '1-Click Smart Extraction',
    desc: 'Auto-detects garments and generates clean, isolated assets instantly.',
    badge: 'Precision Cutout',
    color: 'cyan' as const,
  },
  {
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    title: 'Instant Digital Press',
    desc: 'Simply snap a photo with your phone. ZOLA removes wrinkles and standardizes lighting.',
    badge: '95% Cost Savings',
    color: 'sky' as const,
  },
  {
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    title: 'Virtual Studio Forge',
    desc: 'Generate infinite high-fashion editorials without booking a single human.',
    badge: 'Democratized High Fashion',
    color: 'blue' as const,
  },
];

const pillarData = [
  {
    title: 'Zero-Prompt Virtual Photoshoot',
    subtitle: 'Virtual Photoshoot',
    features: ['No Prompt Engineering', 'Physics-Based Draping', 'Identity Preservation'],
    badge: 'Before / After',
    imageBefore: 'https://i.postimg.cc/bJDHV6sq/person1.png',
    imageAfter: 'https://i.postimg.cc/Rh1t22m2/person2.jpg',
    desc: 'Stop wrestling with complex prompts. Our visual-first AI handles physics, lighting, and draping instantly.',
    reverse: false,
  },
  {
    title: 'Intelligent Outfit Extraction',
    subtitle: 'Smart Isolation Engine',
    features: ['Ghost Mannequin Generation', 'Texture Preservation', 'Messy Backgrounds? No Problem'],
    badge: 'Raw / Extracted',
    imageBefore: 'https://i.postimg.cc/KcDsVhhQ/women-image-1.png',
    imageAfter: 'https://i.postimg.cc/NM5fnk5p/White-Romper.png',
    desc: 'Extract retail-ready assets from messy lifestyle shots with surgical precision.',
    reverse: true,
  },
  {
    title: 'The Digital Forge',
    subtitle: 'The Digital Forge',
    features: ['Instant De-wrinkling', 'Standardized Lighting', 'Factory Fresh Look'],
    badge: 'Wrinkled / Forged',
    imageBefore: 'https://i.postimg.cc/1XcQ6r0p/not-ironed.png',
    imageAfter: 'https://i.postimg.cc/W4FcSv6t/ironed.png',
    desc: 'Turn wrinkled samples into e-commerce ready assets instantly.',
    reverse: false,
  },
  {
    title: 'AI Scene Director',
    subtitle: 'Scene Director',
    features: ['Infinite Locations', 'Model Variety', 'Cost Cutter'],
    badge: 'Infinite Poses',
    imageSequence: sceneImages,
    desc: 'Create global, multi-channel campaigns from a single image. Produce high-end editorials without leaving your desk.',
    reverse: true,
  },
];

const LandingPage: React.FC = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % sceneImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleStart = () => navigate(PATHS.AUTH);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 antialiased overflow-hidden relative">
      <Header onLogoClick={handleScrollTop} onStart={handleStart} />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-cyan-200/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <main className="relative z-10 pt-32">
        {/* Hero */}
        <section className="pt-8 pb-20 lg:pt-24 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* hero content */}
              <div className="lg:col-span-5 text-left lg:pr-8">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-sky-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                  </span>
                  <span className="text-xs font-bold text-sky-700 tracking-wide uppercase">Powered by Gemini 2.5</span>
                </div>

                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-8">
                  Define your style <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 animate-shimmer bg-[length:200%_100%]">with Intelligence.</span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">The world&apos;s most powerful AI fashion engine. From virtual photoshoots to campaign generation, streamline your entire creative workflow.</p>
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                  <button
                    onClick={handleStart}
                    className="w-full sm:w-auto px-10 py-4 bg-sky-500 text-white rounded-full font-bold text-lg transition-all duration-300 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-1 flex items-center justify-center group"
                  >
                    <span>Launch Studio</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <button className="w-full sm:w-auto px-10 py-4 bg-white border border-sky-200 text-sky-700 rounded-full font-bold text-lg transition-all duration-300 hover:border-sky-400 hover:text-sky-900 flex items-center justify-center shadow-lg shadow-sky-100/50">
                    <svg className="w-5 h-5 mr-2 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Demo
            </button>
                </div>
                <div className="flex items-center space-x-6 text-sm font-bold text-slate-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    No Credit Card
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Free 7-Day Trial
                  </div>
                </div>
              </div>
              {/* hero visuals */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="mt-12 sm:mt-24 group perspective">
                    <div className="bg-white p-2 sm:p-3 rounded-[2rem] border border-sky-100 shadow-2xl shadow-sky-200/50 transition-transform duration-500 hover:-translate-y-2 hover:rotate-1">
                      <ImageComparisonCard card={travelCards[0]} className="rounded-[1.5rem]" />
                    </div>
                  </div>
                  <div className="group perspective relative">
                    <div className="bg-white p-2 sm:p-3 rounded-[2rem] border border-sky-100 shadow-2xl shadow-sky-200/50 transition-transform duration-500 hover:-translate-y-2 hover:-rotate-1">
                      <ImageComparisonCard card={travelCards[1]} className="rounded-[1.5rem]" />
                    </div>
                    <div className="hidden sm:block absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-sky-100 animate-float z-30">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-sky-500 font-bold uppercase">Status</p>
                          <p className="text-sm font-bold text-slate-900">Ready to Render</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FashionStudio />
        <WhyChooseZola onGuideClick={handleStart} />

        {/* Testimonial */}
        <section className="relative w-full bg-sky-950 py-24 overflow-hidden border-y border-sky-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-900 via-sky-950 to-slate-950 opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-overlay" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h4 className="text-sky-300 text-xs font-bold tracking-[0.3em] uppercase mb-10">Trusted by Modern E-Commerce Brands</h4>
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-relaxed max-w-5xl mx-auto mb-12 italic opacity-90">
              &quot;ZOLA AI redefined our creative velocity. We transformed a single garment sample into a global, multi-channel campaign in 48 hours—zero studio time required.&quot;
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-sky-800 rounded-full mb-4 border-2 border-sky-700 shadow-lg overflow-hidden">
                <img src="https://i.postimg.cc/6p5ZgV2c/model.jpg" className="w-full h-full object-cover opacity-80 grayscale" alt="Elena Rossi" />
              </div>
              <div className="text-white font-bold text-lg">Elena Rossi</div>
              <div className="text-sky-400 text-sm">Global Brand Director, AURA &amp; THREAD</div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="relative py-24 overflow-hidden bg-sky-200">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Upgrade to ZOLA?</h2>
              <p className="text-lg text-slate-700 font-medium">Stop wrestling with complex tools. Start creating.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="perspective-[2000px]">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-8 lg:p-12 shadow-xl shadow-slate-500/10 transform transition-all duration-700 hover:shadow-2xl hover:[transform:rotateY(-8deg)_rotateX(2deg)_scale(1.02)] h-full">
                  <div className="flex items-center space-x-3 mb-10">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 font-heading">The Traditional Way</h3>
                  </div>
                  <div className="space-y-10">
                    {traditionalPainPoints.map((item) => (
                      <div key={item.title} className="flex items-start space-x-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="mt-1 text-slate-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                          <div className="text-xs text-red-500 font-semibold mt-2">{item.pain}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="perspective-[2000px]">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/60 p-8 lg:p-12 shadow-2xl shadow-sky-300/40 relative h/full transform transition-all duration-700 hover:shadow-sky-400/60 hover:[transform:rotateY(8deg)_rotateX(2deg)_scale(1.02)]">
                  <div className="flex items-center space-x-3 mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-sky-900 font-heading">The ZOLA AI Way</h3>
                  </div>
                  <div className="space-y-10 relative z-10">
                    {zolaWins.map((win) => {
                      const colors = colorClassMap[win.color];
                      return (
                        <div key={win.title} className="flex items-start space-x-4">
                          <div className={`mt-1 w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={win.icon} />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-sky-900 text-lg mb-1">{win.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{win.desc}</p>
                            <div className={`text-xs font-bold mt-2 flex items-center ${colors.text}`}>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {win.badge}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-10 relative z-10">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 shadow-lg flex items-center justify-between text-white">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Traditional Cost</span>
                        <span className="text-xl font-bold line-through opacity-70">
                          $500+ <span className="text-xs font-normal">/ SKU</span>
                        </span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/30 mx-4" />
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-300">ZOLA Cost</span>
                        <span className="text-2xl font-extrabold">
                          $2 <span className="text-xs font-normal">/ SKU</span>
                        </span>
            </div>
              </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="relative py-32 overflow-hidden bg-sky-200">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-sky-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob" />
            <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-2000" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="inline-block px-4 py-1 rounded-full bg-white/50 backdrop-blur-sm text-sky-700 text-xs font-bold tracking-widest uppercase mb-6 border border-sky-200 shadow-sm">
                The Zola Engine
              </div>
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                4 Pillars of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Perfection</span>
              </h2>
              <p className="text-xl text-slate-700 font-medium">Our Gemini-powered architecture delivers standard-setting quality across every asset type.</p>
            </div>
            <div className="space-y-16">
              {pillarData.map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className={`group relative bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-sky-100 shadow-xl shadow-sky-500/10 transition-all duration-500 hover:shadow-sky-500/30 hover:-translate-y-2 flex flex-col ${
                    pillar.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  } items-center gap-12 lg:gap-20`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / 20;
                    const rotateY = (centerX - x) / 20;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                  }}
                >
                  <div className="w-full lg:w-1/2 perspective-1000 relative z-10">
                    <div className="bg-white rounded-[2rem] border border-sky-50 shadow-2xl shadow-sky-200/40 relative overflow-hidden group-hover:shadow-3xl transition-all duration-500 h-[500px]">
                      {pillar.imageSequence ? (
                        <div className="w-full h-full relative bg-slate-50">
                          {pillar.imageSequence.map((img, imgIdx) => (
                            <img
                              key={img}
                              src={img}
                              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
                                imgIdx === currentSceneIndex ? 'opacity-100' : 'opacity-0'
                              }`}
                              alt={`Pose ${imgIdx + 1}`}
                            />
                          ))}
                          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur text-xs font-bold text-sky-700 px-4 py-2 rounded-full border border-sky-100 shadow-sm flex items-center">
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse mr-2" />
                            {pillar.badge}
                          </div>
                        </div>
                      ) : (
                        <PillarWipeAnimation imageBefore={pillar.imageBefore} imageAfter={pillar.imageAfter} badge={pillar.badge} />
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 relative z-10">
                    <div className="text-sky-600 font-bold tracking-wide uppercase text-sm mb-4">{pillar.subtitle}</div>
                    <h3 className="font-heading text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">{pillar.title}</h3>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed">{pillar.desc}</p>
                    <div className="space-y-6">
                      {pillar.features.map((feature) => (
                        <div key={feature} className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-sky-600 shrink-0 mr-5 mt-1 border border-sky-100 shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 pt-2">{feature}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-white pointer-events-none" />
          <div className="relative z-10 container mx-auto max-w-4xl text-center">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to revolutionize <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">your workflow?</span>
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join the thousands of designers and brands building the future of fashion with ZOLA. Experience the power of AI-driven studio photography today.
            </p>
            <div className="flex flex-col items-center space-y-4">
            <button
                onClick={handleStart}
                className="px-10 py-5 bg-sky-600 text-white text-xl font-bold rounded-full shadow-2xl shadow-sky-400/50 hover:shadow-sky-500/60 hover:-translate-y-1 transition-all duration-300 flex items-center group"
            >
                <span>Create Your Free Account</span>
                <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
              <p className="text-slate-500 text-sm font-medium">No credit card required. Cancel anytime.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { title: 'Lightning Fast', desc: 'Render results in < 5 seconds', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'Enterprise Quality', desc: '4K Ultra-HD exports standard', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Secure & Private', desc: 'Your assets are never shared', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              ].map((point) => (
                <div key={point.title} className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={point.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{point.title}</div>
                    <div className="text-xs text-slate-500">{point.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ZOLA AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

