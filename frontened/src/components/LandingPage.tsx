import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Shield,
  Check,
  ArrowRight,
  Zap,
  Globe,
  Lightbulb,
  Box,
  BarChart3,
  Network,
  ChevronRight,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CircuitBoardDecoration = ({ side }: { side: 'left' | 'right' }) => {
  const isLeft = side === 'left';
  const circuitLines = isLeft ? [
    { d: "M-10,100 h50 l30,30 v80 l20,20 h40", cx: 130, cy: 230, delay: 0, dur: 3 },
    { d: "M-10,250 h30 l20,-20 v-50 l30,-30 h40", cx: 110, cy: 150, delay: 1, dur: 4 },
    { d: "M-10,400 h60 l40,40 v60 l20,20 h30", cx: 140, cy: 520, delay: 0.5, dur: 3.5 },
    { d: "M-10,500 h20 l30,-30 v-80 l20,-20 h50", cx: 110, cy: 370, delay: 2, dur: 3 }
  ] : [
    { d: "M210,100 h-50 l-30,30 v80 l-20,20 h-40", cx: 70, cy: 230, delay: 0, dur: 3 },
    { d: "M210,250 h-30 l-20,-20 v-50 l-30,-30 h-40", cx: 90, cy: 150, delay: 1, dur: 4 },
    { d: "M210,400 h-60 l-40,40 v60 l-20,20 h-30", cx: 60, cy: 520, delay: 0.5, dur: 3.5 },
    { d: "M210,500 h-20 l-30,-30 v-80 l-20,-20 h-50", cx: 90, cy: 370, delay: 2, dur: 3 }
  ];

  return (
    <div className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} w-64 md:w-96 h-full overflow-hidden pointer-events-none opacity-40 z-0 hidden md:block`}>
      <svg width="100%" height="100%" viewBox="0 0 200 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {circuitLines.map((line, i) => (
          <g key={i}>
            <motion.path
              d={line.d}
              stroke="#00a3a3"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0.5] }}
              transition={{ duration: line.dur, delay: line.delay, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
            />
            <motion.circle
              cx={line.cx}
              cy={line.cy}
              r="4"
              fill="#00a3a3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 1.2, 1], opacity: [0, 1, 1, 0.5] }}
              transition={{ duration: line.dur, delay: line.delay, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

const AnimatedRoleText = () => {
  const [index, setIndex] = useState(0);
  const roles = ["an Entrepreneur", "a Supplier", "an Investor"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex justify-center text-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`inline-block whitespace-nowrap ${
            index === 0 ? 'text-blue-600' : index === 1 ? 'text-teal-600' : 'text-indigo-600'
          }`}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const AnimatedCounter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime: number;
          let animationFrame: number;

          const updateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);

            if (progress < 1) {
              setCount(Math.min(Math.floor(end * easeOut), end));
              animationFrame = requestAnimationFrame(updateCount);
            } else {
              setCount(end);
            }
          };

          animationFrame = requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [end, duration]);

  return <div ref={nodeRef} className="text-5xl md:text-6xl font-light text-slate-900 mb-2">{count}{suffix}</div>;
};

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-[#008b8b] selection:text-white overflow-hidden">
      {/* Navigation */}
      <header className="absolute w-full top-0 z-50 py-6 bg-transparent">
        <nav className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-white tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Startup LaunchPad
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('rules')} className="hover:text-white transition-colors">Rules</button>
            <button onClick={onGetStarted} className="bg-[#00a3a3] hover:bg-teal-500 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Login/Signup
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-56 bg-gradient-aurora-base text-center overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <CircuitBoardDecoration side="left" />
        <CircuitBoardDecoration side="right" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold !text-white mb-6 leading-tight"
          >
            A Global Ecosystem for<br/>
            <span className="aurora-text">
              Startup Innovation
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-200 max-w-3xl mx-auto mb-10 text-lg leading-relaxed glass-dark p-6 rounded-2xl"
          >
            Connecting verified entrepreneurs, suppliers, and investors on our<br/>
            powerful collaboration platform. Gain insights and find opportunities.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="glass hover:bg-white/20 text-white px-8 py-3.5 rounded text-lg font-medium transition-colors shadow-lg"
          >
            Explore Opportunities
          </motion.button>
        </div>
      </section>

      {/* Everything you need to scale (Preserved Section) */}
      <section className="py-24 bg-white relative" id="features">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Everything you need to scale
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-lg text-slate-600">
              A comprehensive suite of tools designed specifically for the modern startup ecosystem.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 - Large */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2 bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#0066cc]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered Validation</h3>
                <p className="text-slate-600 max-w-md mb-8">
                  Submit your startup ideas and instantly receive comprehensive feedback, market analysis, and risk assessments powered by advanced AI models.
                </p>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm inline-flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">Analysis complete: High market potential detected</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-[#008b8b]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Global Marketplace</h3>
                <p className="text-slate-600 mb-6 flex-1">
                  Connect with verified suppliers and access the tools, software, and services you need to build faster.
                </p>
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-50 bg-white flex items-center justify-center shadow-sm">
                       <ShoppingBag className="w-3 h-3 text-slate-400" />
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Network</h3>
                <p className="text-slate-600">
                  Every user goes through our verification process, ensuring a high-quality, trustworthy environment for investment and collaboration.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 - Large */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-2 bg-slate-900 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              {/* Background Glow */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center mb-6">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold !text-white mb-3">Real-time Collaboration</h3>
                  <p className="!text-slate-400">
                    Built-in chat, threaded discussions, and document sharing. Connect directly with investors or suppliers without leaving the platform.
                  </p>
                </div>
                <div className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"></div>
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-200">
                      I reviewed the pitch deck. Let's schedule a call tomorrow.
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex-shrink-0"></div>
                     <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-3 text-sm text-white">
                      Perfect. I'll send over the calendar invite now.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <AnimatedCounter end={500} suffix="+" />
              <div className="text-slate-600 font-medium text-lg">Active Startups</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <AnimatedCounter end={200} suffix="+" duration={2.5} />
              <div className="text-slate-600 font-medium text-lg">Verified Suppliers</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <AnimatedCounter end={150} suffix="+" duration={2.2} />
              <div className="text-slate-600 font-medium text-lg">Active Investors</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section className="py-24 bg-[#f8fafc]" id="how-it-works">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">How It Works</h2>
            <p className="text-slate-500 mb-20">Create an account to start scaling your business today.</p>
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-[2px] bg-slate-300 -z-10"></div>
            
            <div className="grid md:grid-cols-3 gap-12">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#f8fafc] px-4">
                 <div className="w-20 h-20 mx-auto bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-2xl text-slate-700 mb-6">1</div>
                 <h4 className="font-semibold mb-2 text-xl">Select Your Role</h4>
                 <p className="text-slate-600 text-sm">Choose from entrepreneur,<br/> supplier, or investor.</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#f8fafc] px-4">
                 <div className="w-20 h-20 mx-auto bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-indigo-600 mb-6">
                   <Network className="w-8 h-8" strokeWidth={1.5} />
                 </div>
                 <h4 className="font-semibold mb-2 text-xl">Network & Showcase</h4>
                 <p className="text-slate-600 text-sm">Complete your profile and showcase<br/> your offerings.</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-[#f8fafc] px-4">
                 <div className="w-20 h-20 mx-auto bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-2xl text-slate-700 mb-6">3</div>
                 <h4 className="font-semibold mb-2 text-xl">Find & Scale</h4>
                 <p className="text-slate-600 text-sm">Discover opportunities and<br/> scale your impact.</p>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Join As... Pricing Cards Redesigned */}
      <section className="py-24 bg-[#f8fafc] border-t border-slate-100" id="rules">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight flex flex-col md:flex-row items-center justify-center gap-2">
               <span>Join as</span>
               <AnimatedRoleText />
             </h2>
             <p className="text-lg text-slate-500 max-w-2xl mx-auto">Choose the role that best aligns with your goals and start building your future today.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Entrepreneurs Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.1 }} 
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col relative pt-12 pb-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="text-center mb-8 px-8">
                 <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:rotate-6 transition-transform">
                   <Target className="w-10 h-10" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900">Entrepreneurs</h3>
              </div>
              <ul className="px-10 space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-blue-500 flex-shrink-0" /> <span className="text-sm font-medium">Verified Status</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-blue-500 flex-shrink-0" /> <span className="text-sm">Get VC Feedback</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-blue-500 flex-shrink-0" /> <span className="text-sm">Access Mentorship</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-blue-500 flex-shrink-0" /> <span className="text-sm">Connect with Investors</span></li>
              </ul>
              <div className="bg-slate-50 mx-8 p-4 text-center rounded-xl mb-8 border border-slate-100">
                 <div className="text-sm font-bold text-slate-900 mb-1">$5 <span className="text-slate-500 font-normal">/ lifetime</span></div>
                 <div className="text-xs text-slate-500">Verified Entrepreneur Status</div>
              </div>
              <div className="px-8">
                <button onClick={onGetStarted} className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300">Join as Entrepreneur</button>
              </div>
            </motion.div>

            {/* Suppliers Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.2 }} 
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-teal-100 overflow-hidden flex flex-col relative pt-12 pb-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group scale-105 z-10"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-400 to-teal-600"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="absolute top-4 left-4 bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>

              <div className="text-center mb-8 px-8">
                 <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 flex items-center justify-center mb-6 shadow-sm border border-teal-100 group-hover:rotate-6 transition-transform">
                   <Box className="w-10 h-10" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900">Suppliers</h3>
              </div>
              <ul className="px-10 space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-teal-500 flex-shrink-0" /> <span className="text-sm font-medium">Sell Software/Solutions</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-teal-500 flex-shrink-0" /> <span className="text-sm">Manage Orders</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-teal-500 flex-shrink-0" /> <span className="text-sm">Track Your Sales</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-teal-500 flex-shrink-0" /> <span className="text-sm">Direct Access to Startups</span></li>
              </ul>
              <div className="bg-slate-50 mx-8 p-4 text-center rounded-xl mb-8 border border-slate-100">
                 <div className="text-sm font-bold text-slate-900 mb-1">$25 <span className="text-slate-500 font-normal">/ lifetime</span></div>
                 <div className="text-xs text-slate-500">Premium Supplier Access</div>
              </div>
              <div className="px-8">
                <button onClick={onGetStarted} className="w-full py-3 bg-teal-600 border-2 border-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 hover:border-teal-700 shadow-md shadow-teal-500/30 transition-all duration-300">Join as Supplier</button>
              </div>
            </motion.div>

            {/* Investors Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: 0.3 }} 
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col relative pt-12 pb-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="text-center mb-8 px-8">
                 <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm border border-indigo-100 group-hover:rotate-6 transition-transform">
                   <TrendingUp className="w-10 h-10" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900">Investors</h3>
              </div>
              <ul className="px-10 space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0" /> <span className="text-sm font-medium">Review Pitches</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0" /> <span className="text-sm">Verify Details</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0" /> <span className="text-sm">Analyze Financials</span></li>
                <li className="flex items-center gap-3 text-slate-700"><Check className="w-5 h-5 text-indigo-500 flex-shrink-0" /> <span className="text-sm">Find Opportunities</span></li>
              </ul>
              <div className="bg-slate-50 mx-8 p-4 text-center rounded-xl mb-8 border border-slate-100">
                 <div className="text-sm font-bold text-slate-900 mb-1">$25 <span className="text-slate-500 font-normal">/ lifetime</span></div>
                 <div className="text-xs text-slate-500">Full Investment Access</div>
              </div>
              <div className="px-8">
                <button onClick={onGetStarted} className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-colors duration-300">Join as Investor</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Shield Banner */}
      <section className="py-12 bg-[#f8fafc] pb-32">
        <div className="container mx-auto px-6">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto rounded-xl bg-gradient-to-r from-[#eef2f6] to-white border border-slate-200 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-sm">
             <div className="w-32 h-32 flex-shrink-0 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center">
                <Shield className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
             </div>
             <div className="text-center md:text-left">
               <h3 className="text-2xl font-bold mb-3 text-slate-900">Academic-Grade, Trustworthy Platform</h3>
               <p className="text-slate-600 leading-relaxed text-sm">Connect with industry leaders, secure transactions, and access risk-assessed opportunities with confidence.</p>
             </div>
           </motion.div>
        </div>
      </section>

      {/* Bottom CTA Redesigned */}
      <section className="py-20 relative overflow-hidden bg-white border-b border-slate-200">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto bg-white/60 border border-slate-200 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden"
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-50"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                Ready to Scale <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Your Journey?</span>
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-slate-600 mb-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed relative z-10"
            >
              Join thousands of entrepreneurs, suppliers, and investors already building the future. Take your business to the next level today.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
            >
              <button 
                onClick={onGetStarted} 
                className="w-full sm:w-auto bg-gradient-to-r from-[#00a3a3] to-teal-500 hover:from-teal-400 hover:to-teal-400 text-white px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(0,163,163,0.4)] hover:shadow-[0_12px_25px_-8px_rgba(0,163,163,0.6)] flex items-center justify-center gap-2 group transform hover:-translate-y-1"
              >
                Create Your Account 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-base font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center bg-white"
              >
                Explore Features
              </button>
            </motion.div>

            {/* User Avatars / Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-8 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-center gap-4 relative z-10"
            >
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=33" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=47" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=12" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=5" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-700 font-medium shadow-sm">
                  +2k
                </div>
              </div>
              <div className="text-slate-500 text-sm">
                Trusted by <strong className="text-slate-900">2,000+</strong> innovators worldwide
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] pt-16 pb-8">
        <div className="container mx-auto px-6">
          {/* Newsletter Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-12 border-b border-slate-800 mb-12">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-slate-400 text-sm">Subscribe to the latest updates, tips, and insights for growing your business.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative w-full md:w-80">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" placeholder="Enter your email" className="w-full bg-[#1e293b] border border-slate-700 text-white rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-teal-500" />
              </div>
              <button className="bg-[#008b8b] hover:bg-teal-600 text-white px-6 py-2.5 rounded font-medium transition-colors flex items-center gap-2 flex-shrink-0">
                <Send className="w-4 h-4" /> Subscribe
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 pb-12 border-b border-slate-800">
            <div className="lg:col-span-2">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#0066cc] to-[#008b8b] flex items-center justify-center text-white font-bold text-sm">SL</div>
                  <span className="text-lg font-bold text-white">Startup LaunchPad</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                  A modern platform connecting entrepreneurs, investors, and suppliers. Build your network, secure funding, and scale your vision.
                </p>
                <div className="flex gap-4">
                  {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 h-8 rounded border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-[#008b8b] hover:text-white hover:border-[#008b8b] transition-all">
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-sm">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Features</button></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> For Entrepreneurs</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> For Suppliers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> For Investors</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-sm">Resources</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Marketplace</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Idea Validation</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Community</a></li>
              </ul>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-6 text-sm">Company</h4>
                  <ul className="space-y-4 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> About Us</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Careers</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Blog</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-6 text-sm">Legal</h4>
                  <ul className="space-y-4 text-sm text-slate-400">
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Terms of Service</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Cookie Policy</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Security Details</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-[#1e293b] flex items-center justify-center flex-shrink-0 text-teal-400"><Mail className="w-5 h-5" /></div>
              <div>
                <div className="text-white text-sm font-medium mb-1">Email Us</div>
                <div className="text-slate-400 text-sm">support@startuplaunchpad.com</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-[#1e293b] flex items-center justify-center flex-shrink-0 text-blue-400"><Phone className="w-5 h-5" /></div>
              <div>
                <div className="text-white text-sm font-medium mb-1">Call Us</div>
                <div className="text-slate-400 text-sm">+34 50 33976</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-[#1e293b] flex items-center justify-center flex-shrink-0 text-purple-400"><MapPin className="w-5 h-5" /></div>
              <div>
                <div className="text-white text-sm font-medium mb-1">Visit Us</div>
                <div className="text-slate-400 text-sm">123 Innovation Ave, Tech City, TC 10010</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative">
             <p>© Copyright. All. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};