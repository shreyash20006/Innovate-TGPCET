import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroCanvas from '../components/HeroCanvas';
import { OPPORTUNITIES } from './Opportunities';

const Counter = ({ target, suffix }: { target: number, suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let observer: IntersectionObserver;
    if (ref.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 50);
          const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setCount(start);
            if (start >= target) clearInterval(timer);
          }, 28);
          observer.disconnect();
        }
      }, { threshold: 0.5 });
      observer.observe(ref.current);
    }
    return () => observer?.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-display text-[48px] font-black text-cyber-pink leading-none tracking-[-0.04em]">
      {count}<span className="text-cyber-lime">{suffix}</span>
    </div>
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [transform, setTransform] = useState('');
  const [boxShadow, setBoxShadow] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx2 = ((e.clientY - cy) / rect.height) * 18;
    const ry2 = ((e.clientX - cx) / rect.width) * 18;
    setTransform(`perspective(600px) rotateX(${-rx2}deg) rotateY(${ry2}deg) translateY(-10px)`);
    setBoxShadow('0 30px 60px rgba(255,0,102,0.25)');
  };

  const handleMouseLeave = () => {
    setTransform('perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)');
    setBoxShadow('');
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cat-tile flex-shrink-0 w-[280px] h-[320px] bg-cyber-bg/70 border border-cyber-border flex flex-col justify-end p-[32px_28px] relative overflow-hidden cursor-none transition-shadow duration-300 ${className}`}
      style={{ 
        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', 
        transformStyle: 'preserve-3d', 
        willChange: 'transform',
        transform,
        boxShadow 
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,0,102,0.3)] to-transparent opacity-0 transition-opacity duration-400 hover:opacity-100" />
      {children}
    </div>
  );
};

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if(name && email) {
      alert(`Subscribed ${name} with ${email}`);
      setName('');
      setEmail('');
    }
  };

    const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 150]);

  const upcomingOpportunities = OPPORTUNITIES
    .filter(opp => new Date(opp.deadline).getTime() > Date.now())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative z-[2] min-h-[calc(100vh-68px)] flex flex-col md:grid md:grid-cols-2 items-center px-4 sm:px-5 md:px-[60px] gap-8 md:gap-10 overflow-hidden after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-cyber-pink after:to-transparent pt-16 md:pt-0">
        

<motion.div style={{ y: yParallax }} className="relative z-[2] text-center md:text-left flex-1 flex flex-col justify-center">
          <div className="font-mono text-[12px] text-cyber-pink tracking-[0.25em] uppercase flex items-center justify-center md:justify-start gap-[12px] mb-[20px] after:content-[''] after:flex-1 after:h-[1px] after:bg-cyber-border after:max-w-[80px] hidden md:flex">
            <span className="w-[7px] h-[7px] rounded-full bg-cyber-lime animate-blink"></span>
            Student Tech Hub — Live
          </div>

          <h1 className="font-display text-[clamp(48px,11vw,90px)] font-[900] leading-[0.92] tracking-[-0.04em] text-cyber-white relative">
            <span className="block text-cyber-white">Your</span>
            <span className="block text-cyber-white">Gateway to</span>
            <span className="block text-transparent relative" style={{ WebkitTextStroke: '2px var(--color-cyber-pink)', animation: 'glitchText 6s ease-in-out infinite' }}>Tech</span>
            <span className="block bg-gradient-to-r from-cyber-pink via-cyber-lime to-cyber-blue bg-clip-text text-transparent break-words w-full px-2" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite' }}>Opportunities</span>
          </h1>

          <p className="mt-[28px] text-[16px] leading-[1.75] text-cyber-muted max-w-[480px] font-[400] tracking-[0.02em] mx-auto md:mx-0">
            Discover <strong className="text-cyber-white font-[600]">internships, hackathons, free courses</strong> &amp; the latest AI updates — curated exclusively for TGPCET students aiming for excellence.
          </p>

          <div className="flex gap-[16px] mt-[40px] flex-wrap justify-center md:justify-start">
            <a href="#opportunities" className="relative overflow-hidden px-[36px] py-[14px] bg-cyber-pink text-white font-display text-[14px] font-[700] tracking-[0.1em] uppercase border-none cursor-none no-underline inline-flex items-center gap-[10px] transition-all duration-300 hover:bg-cyber-lime hover:text-black hover:-translate-x-[2px] hover:-translate-y-[2px]" style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', boxShadow: '0 0 30px rgba(255,0,102,0.5), 4px 4px 0 rgba(170,255,0,0.4)' }}>
              Explore Now ↗
            </a>
            <a href="#ai" className="px-[32px] py-[13px] bg-transparent text-cyber-white font-display text-[14px] font-[700] tracking-[0.1em] uppercase border border-white/20 cursor-none no-underline inline-flex items-center gap-[10px] transition-all duration-300 hover:border-cyber-blue hover:text-cyber-blue hover:shadow-[0_0_25px_rgba(0,207,255,0.3)]" style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}>
              AI Updates ✦
            </a>
          </div>
        </motion.div>

        <div className="relative z-[2] flex justify-center items-center h-[40vh] sm:h-[50vh] min-h-[300px] md:min-h-0 md:h-auto w-full md:flex-1">
          <HeroCanvas />
        </div>

        <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-[8px] font-mono text-[10px] text-cyber-muted tracking-[0.15em] uppercase hidden md:flex">
          <span>Scroll</span>
          <div className="w-[1px] h-[50px] bg-gradient-to-b from-cyber-pink to-transparent" style={{ animation: 'scrollPulse 2s ease-in-out infinite' }}></div>
        </div>
      </section>

      {/* STATS */}
        <div className="relative z-[2] grid grid-cols-2 md:grid-cols-4 border-y border-cyber-border bg-cyber-pink/5">
        <div className="p-[24px_16px] sm:p-[36px_20px] text-center border-r md:border-b-0 border-b border-cyber-border relative overflow-hidden transition-colors hover:bg-[#ff00660f] group">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400"></div>
          <Counter target={120} suffix="+" />
          <div className="font-mono text-[9px] sm:text-[10px] text-cyber-muted tracking-[0.2em] uppercase mt-[8px]">Opportunities Listed</div>
        </div>
        <div className="p-[24px_16px] sm:p-[36px_20px] text-center border-r md:border-b-0 border-b border-cyber-border relative overflow-hidden transition-colors hover:bg-[#ff00660f] group">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400"></div>
          <Counter target={50} suffix="+" />
          <div className="font-mono text-[9px] sm:text-[10px] text-cyber-muted tracking-[0.2em] uppercase mt-[8px]">AI Tools Curated</div>
        </div>
        <div className="p-[24px_16px] sm:p-[36px_20px] text-center border-r border-cyber-border relative overflow-hidden transition-colors hover:bg-cyber-pink/10 group">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400"></div>
          <Counter target={200} suffix="+" />
          <div className="font-mono text-[9px] sm:text-[10px] text-cyber-muted tracking-[0.2em] uppercase mt-[8px]">Free Courses</div>
        </div>
        <div className="p-[24px_16px] sm:p-[36px_20px] text-center relative overflow-hidden transition-colors hover:bg-cyber-pink/10 group">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400"></div>
          <Counter target={15} suffix="+" />
          <div className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase mt-[8px]">Live Hackathons</div>
        </div>
      </div>

      {/* CATEGORIES */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-[2] py-[100px] px-5 xl:px-[60px] max-w-[1400px] mx-auto" 
        id="categories"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink">Quick Access</div>
        <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[56px]">
          Browse by <em className="not-italic text-cyber-pink">Category</em>
        </h2>
        
        <div className="flex gap-[24px] overflow-x-auto pb-[20px] snap-x snap-mandatory webkit-scrollbar flex-nowrap" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ff0066 transparent' }}>
          <TiltCard className="snap-start group">
            <span className="font-mono text-[11px] text-cyber-muted tracking-[0.2em] mb-auto">01</span>
            <div className="absolute top-[16px] right-[16px] w-[8px] h-[8px] rounded-full bg-cyber-blue animate-blink"></div>
            <span className="text-[48px] mb-[16px] block">🤖</span>
            <div className="font-display text-[24px] font-[900] text-cyber-white tracking-[-0.02em] mb-[6px] group-hover:text-cyber-pink transition-colors">AI Tools</div>
            <div className="font-mono text-[11px] text-cyber-muted">50+ tools listed</div>
          </TiltCard>
          
          <TiltCard className="snap-start group">
            <span className="font-mono text-[11px] text-cyber-muted tracking-[0.2em] mb-auto">02</span>
            <div className="absolute top-[16px] right-[16px] w-[8px] h-[8px] rounded-full bg-cyber-lime animate-blink" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-[48px] mb-[16px] block">💼</span>
            <div className="font-display text-[24px] font-[900] text-cyber-white tracking-[-0.02em] mb-[6px] group-hover:text-cyber-lime transition-colors">Internships</div>
            <div className="font-mono text-[11px] text-cyber-muted">120+ opportunities</div>
          </TiltCard>
          
          <TiltCard className="snap-start group">
            <span className="font-mono text-[11px] text-cyber-muted tracking-[0.2em] mb-auto">03</span>
            <div className="absolute top-[16px] right-[16px] w-[8px] h-[8px] rounded-full bg-cyber-pink animate-blink" style={{ animationDelay: '1s' }}></div>
            <span className="text-[48px] mb-[16px] block">⚡</span>
            <div className="font-display text-[24px] font-[900] text-cyber-white tracking-[-0.02em] mb-[6px] group-hover:text-cyber-pink transition-colors">Hackathons</div>
            <div className="font-mono text-[11px] text-cyber-muted">15 live events</div>
          </TiltCard>
          
          <TiltCard className="snap-start group">
            <span className="font-mono text-[11px] text-cyber-muted tracking-[0.2em] mb-auto">04</span>
            <div className="absolute top-[16px] right-[16px] w-[8px] h-[8px] rounded-full bg-[#ffaa00] animate-blink" style={{ animationDelay: '1.5s' }}></div>
            <span className="text-[48px] mb-[16px] block">📘</span>
            <div className="font-display text-[24px] font-[900] text-cyber-white tracking-[-0.02em] mb-[6px] group-hover:text-[#ffaa00] transition-colors">Free Courses</div>
            <div className="font-mono text-[11px] text-cyber-muted">200+ courses</div>
          </TiltCard>
        </div>
      </motion.section>

      {/* FEATURED OPPORTUNITY */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-[2] py-[100px] px-5 xl:px-[60px] max-w-[1400px] mx-auto" 
        id="opportunities"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink">Featured</div>
        <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[56px]">
          <span className="text-transparent" style={{ WebkitTextStroke: '1.5px var(--color-cyber-lime)' }}>Prime</span> <em className="not-italic text-cyber-pink">Opportunity</em>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-cyber-border overflow-hidden min-h-[420px]">
          <div className="p-8 md:p-[56px_48px] bg-gradient-to-br from-[#ff00661f] to-[#000014e6] sm:border-right border-b md:border-b-0 border-cyber-border flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 font-mono text-[9px] tracking-[0.3em] bg-cyber-pink text-black px-[20px] py-[6px] font-[700]">FEATURED</div>
            <div className="absolute -bottom-[80px] -right-[80px] w-[250px] h-[250px] rounded-full bg-[#ff006614] blur-[40px]"></div>
            
            <div className="relative z-10 pt-4 md:pt-0">
              <span className="inline-block mt-[20px] md:mt-[32px] px-[14px] py-[4px] border border-cyber-pink text-cyber-pink font-mono text-[10px] tracking-[0.2em] uppercase">Internship</span>
              <div className="font-display text-[28px] md:text-[36px] font-[900] leading-[1.0] tracking-[-0.03em] text-cyber-white mt-[20px]">Industrial Training &amp; Internship Program</div>
              <div className="text-[15px] text-cyber-muted leading-[1.7] mt-[16px]">Powered by AWS and Wipro. Gain hands-on industry experience with certified training. Approved by AICTE, MSME &amp; NSDC.</div>
              <div className="flex gap-[10px] flex-wrap mt-[24px]">
                <span className="p-[5px_14px] border border-white/10 font-mono text-[10px] text-cyber-muted tracking-[0.08em] uppercase">AICTE Approved</span>
                <span className="p-[5px_14px] border border-white/10 font-mono text-[10px] text-cyber-muted tracking-[0.08em] uppercase">MSME</span>
                <span className="p-[5px_14px] border border-white/10 font-mono text-[10px] text-cyber-muted tracking-[0.08em] uppercase">NSDC</span>
                <span className="p-[5px_14px] border border-white/10 font-mono text-[10px] text-cyber-muted tracking-[0.08em] uppercase">Remote / Hybrid</span>
              </div>
            </div>
            
            <div className="mt-[40px] relative z-10">
              <Link to="/opportunities" className="relative overflow-hidden px-[36px] py-[14px] bg-cyber-pink text-white font-display text-[14px] font-[700] tracking-[0.1em] uppercase border-none cursor-none no-underline inline-flex items-center gap-[10px] transition-all duration-300 hover:bg-cyber-lime hover:text-black hover:-translate-x-[2px] hover:-translate-y-[2px]" style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', boxShadow: '0 0 30px rgba(255,0,102,0.5), 4px 4px 0 rgba(170,255,0,0.4)' }}>
                Learn More ↗
              </Link>
            </div>
          </div>
          
          <div className="p-8 md:p-[56px_48px] flex flex-col gap-[32px] bg-cyber-bg2/90">
            <div className="flex flex-col gap-[4px]">
              <div className="font-display text-[52px] font-[900] text-cyber-lime tracking-[-0.04em] leading-[1]">AWS</div>
              <div className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase">Powered by Amazon Web Services</div>
            </div>
            <div className="h-[1px] bg-cyber-border"></div>
            <div className="flex flex-col gap-[4px]">
              <div className="font-display text-[52px] font-[900] text-cyber-lime tracking-[-0.04em] leading-[1]">Wipro</div>
              <div className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase">Industry Partner</div>
            </div>
            <div className="h-[1px] bg-cyber-border"></div>
            <div className="flex flex-col gap-[4px]">
              <div className="font-display text-[52px] font-[900] text-cyber-lime tracking-[-0.04em] leading-[1]">3×</div>
              <div className="font-mono text-[10px] text-cyber-muted tracking-[0.2em] uppercase">Govt. Certifications Included</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CLOSING SOON */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-[2] py-[100px] px-5 xl:px-[60px] max-w-[1400px] mx-auto"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink">Act Fast</div>
        <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[56px]">
          ⏰ Closing <em className="not-italic text-cyber-pink">Soon</em>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {upcomingOpportunities.map((item, i) => {
            const diff = new Date(item.deadline).getTime() - Date.now();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            const timerClass = days <= 7 ? 'bg-[#ff00421f] text-[#ff4466] border-[#ff00424d]' : days <= 14 ? 'bg-[#ffaa001f] text-[#ffaa00] border-[#ffaa004d]' : 'bg-[#00ff881f] text-[#00ff88] border-[#00ff884d]';
            
            return (
              <div key={i} className="border border-cyber-border p-[32px_28px] bg-cyber-bg2/60 relative overflow-hidden flex flex-col gap-[16px] transition-all duration-300 hover:-translate-y-[6px] hover:border-cyber-pink/40 hover:shadow-[0_20px_60px_rgba(255,0,102,0.15)] group" style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyber-pink scale-y-0 origin-top transition-transform duration-400 group-hover:scale-y-100"></div>
                <div className="font-display text-[18px] font-[700] text-cyber-white leading-[1.3] tracking-[-0.01em]">{item.title}</div>
                <div className={`inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.1em] uppercase p-[5px_14px] w-fit border ${timerClass}`}>
                  <span className={days <= 14 ? "animate-blink" : ""}>◉</span> {days} Days Left
                </div>
                <div className="text-[13px] text-cyber-muted leading-[1.6] flex-1 line-clamp-3">
                  {item.description}
                </div>
                <Link to="/opportunities" className="p-[11px_0] bg-transparent border border-cyber-border text-cyber-pink font-display text-[12px] font-[700] tracking-[0.15em] uppercase cursor-none text-center transition-all duration-250 hover:bg-cyber-pink hover:text-black hover:border-cyber-pink mt-4">
                  View Details →
                </Link>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* NEWSLETTER TERMINAL */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="border border-[#aaff0040] p-0 bg-cyber-bg2/90 relative overflow-hidden mx-5 xl:mx-[60px] max-w-[1400px] xl:mx-auto mb-20"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent,transparent 2px,rgba(170,255,0,0.015) 2px,rgba(170,255,0,0.015) 4px)' }}></div>
        <div className="flex items-center gap-[8px] p-[14px_24px] border-b border-[#aaff0026] bg-[#aaff000d]">
          <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-[#28ca41]"></div>
          <span className="font-mono text-[11px] text-[#aaff0080] ml-[10px] tracking-[0.1em]">innovate.tgpcet — subscribe.sh</span>
        </div>
        <div className="p-8 md:p-[40px_48px] grid grid-cols-1 md:grid-cols-2 gap-[32px] md:gap-[60px] align-center z-10 relative">
          <div>
            <div className="font-mono text-[22px] text-cyber-lime leading-[1.5] mb-[24px]">
              $ stay --updated<br/>
              &gt; Never Miss an<br/>
              <span className="after:content-['_'] after:animate-blink">&gt; Opportunity</span>
            </div>
            <div className="text-[14px] text-[#aaff0099] leading-[1.7] font-mono">
              // Weekly curated drops directly<br/>
              // to your inbox — internships,<br/>
              // hackathons &amp; AI tools.
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="font-mono text-[10px] text-[#aaff0080] tracking-[0.2em] uppercase">$ name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="bg-transparent border-none border-b border-[#aaff004d] text-cyber-lime font-mono text-[14px] p-[10px_0] outline-none transition-colors duration-200 focus:border-cyber-lime cursor-none placeholder:text-[#aaff0033]" type="text" placeholder="your_name" />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="font-mono text-[10px] text-[#aaff0080] tracking-[0.2em] uppercase">$ email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required className="bg-transparent border-none border-b border-[#aaff004d] text-cyber-lime font-mono text-[14px] p-[10px_0] outline-none transition-colors duration-200 focus:border-cyber-lime cursor-none placeholder:text-[#aaff0033]" type="email" placeholder="college@email.com" />
            </div>
            <button type="submit" className="mt-[10px] p-[14px_0] bg-cyber-lime text-black font-mono text-[13px] font-[700] tracking-[0.2em] uppercase border-none cursor-none transition-all duration-250 hover:bg-transparent hover:text-cyber-lime border hover:border-cyber-lime">
              ./subscribe →
            </button>
          </form>
        </div>
      </motion.div>
      {/* AI UPDATES */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-[2] py-[50px] px-5 xl:px-[60px] max-w-[1400px] mx-auto mb-20"
        id="ai"
      >
        <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink">Tech Intelligence</div>
        <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[56px]">
          🔮 Latest <em className="not-italic text-cyber-pink">AI Updates</em>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          <div className="border border-cyber-border p-[28px] bg-cyber-bg2/80 relative overflow-hidden flex flex-col gap-[12px] transition-all duration-300 hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] hover:-translate-y-[4px] md:col-span-2 after:content-[''] after:absolute after:top-0 after:right-0 after:w-[60px] after:h-[60px] after:bg-gradient-to-bl after:from-cyber-pink/20 after:to-transparent after:pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase p-[3px_10px] w-fit bg-[#10b98126] border border-[#10b9814d] text-[#10b981]">OpenAI</span>
            <div className="font-display text-[24px] font-[800] text-cyber-white leading-[1.3] tracking-[-0.01em]">OpenAI announces new GPT-4.5 model with enhanced reasoning capabilities</div>
            <div className="text-[13px] text-cyber-muted leading-[1.7] flex-1 mt-2">The new model demonstrates significant improvements in logical reasoning, coding, and mathematics compared to its predecessors. Benchmarks show 40% better performance on complex multi-step problems.</div>
            <div className="flex justify-between items-center mt-[8px]">
              <span className="font-mono text-[10px] text-cyber-muted tracking-[0.1em]">Apr 18, 2026</span>
              <a href="#" className="font-mono text-[10px] text-cyber-pink no-underline tracking-[0.15em] uppercase transition-opacity duration-200 hover:opacity-60 cursor-none">Read More →</a>
            </div>
          </div>
          
          <div className="border border-cyber-border p-[28px] bg-cyber-bg2/80 relative overflow-hidden flex flex-col gap-[12px] transition-all duration-300 hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] hover:-translate-y-[4px] after:content-[''] after:absolute after:top-0 after:right-0 after:w-[60px] after:h-[60px] after:bg-gradient-to-bl after:from-cyber-pink/20 after:to-transparent after:pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase p-[3px_10px] w-fit bg-[#ffaa0026] border border-[#ffaa004d] text-[#ffaa00]">Curated List</span>
            <div className="font-display text-[18px] font-[800] text-cyber-white leading-[1.3] tracking-[-0.01em]">Top 10 AI Internships for Summer 2026</div>
            <div className="text-[13px] text-cyber-muted leading-[1.7] flex-1 mt-2">Best AI/ML internships available for undergrads this summer season.</div>
            <div className="flex justify-between items-center mt-[8px]">
              <span className="font-mono text-[10px] text-cyber-muted tracking-[0.1em]">Apr 16, 2026</span>
              <a href="#" className="font-mono text-[10px] text-cyber-pink no-underline tracking-[0.15em] uppercase transition-opacity duration-200 hover:opacity-60 cursor-none">Read More →</a>
            </div>
          </div>
          
          <div className="border border-cyber-border p-[28px] bg-cyber-bg2/80 relative overflow-hidden flex flex-col gap-[12px] transition-all duration-300 hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] hover:-translate-y-[4px] after:content-[''] after:absolute after:top-0 after:right-0 after:w-[60px] after:h-[60px] after:bg-gradient-to-bl after:from-cyber-pink/20 after:to-transparent after:pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase p-[3px_10px] w-fit bg-[#4285f426] border border-[#4285f44d] text-[#4285f4]">Google DeepMind</span>
            <div className="font-display text-[18px] font-[800] text-cyber-white leading-[1.3] tracking-[-0.01em]">AlphaFold 3 predicts molecular structures</div>
            <div className="text-[13px] text-cyber-muted leading-[1.7] flex-1 mt-2">AlphaFold 3 can predict the structure and interactions of all life's molecules with unprecedented accuracy.</div>
            <div className="flex justify-between items-center mt-[8px]">
              <span className="font-mono text-[10px] text-cyber-muted tracking-[0.1em]">Apr 17, 2026</span>
              <a href="#" className="font-mono text-[10px] text-cyber-pink no-underline tracking-[0.15em] uppercase transition-opacity duration-200 hover:opacity-60 cursor-none">Read More →</a>
            </div>
          </div>
          
          <div className="border border-cyber-border p-[28px] bg-cyber-bg2/80 relative overflow-hidden flex flex-col gap-[12px] transition-all duration-300 hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] hover:-translate-y-[4px] after:content-[''] after:absolute after:top-0 after:right-0 after:w-[60px] after:h-[60px] after:bg-gradient-to-bl after:from-cyber-pink/20 after:to-transparent after:pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase p-[3px_10px] w-fit bg-[#10b98126] border border-[#10b9814d] text-[#10b981]">OpenAI</span>
            <div className="font-display text-[18px] font-[800] text-cyber-white leading-[1.3] tracking-[-0.01em]">Sora 2.0 now available</div>
            <div className="text-[13px] text-cyber-muted leading-[1.7] flex-1 mt-2">New version supports up to 4K resolution and 2-minute clips.</div>
            <div className="flex justify-between items-center mt-[8px]">
              <span className="font-mono text-[10px] text-cyber-muted tracking-[0.1em]">Apr 14, 2026</span>
              <a href="#" className="font-mono text-[10px] text-cyber-pink no-underline tracking-[0.15em] uppercase transition-opacity duration-200 hover:opacity-60 cursor-none">Read More →</a>
            </div>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
