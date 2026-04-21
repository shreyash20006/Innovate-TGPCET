const fs = require('fs');
const path = require('path');

function wrapWithTheme(filePath, transformations) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${absolutePath}`);
    return;
  }
  let content = fs.readFileSync(absolutePath, 'utf8');
  let originalContent = content;
  
  for (const t of transformations) {
    content = content.replace(t.target, t.replacement);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`No changes made to ${filePath} (targets not found or identical)`);
  }
}

// 1. Layout.tsx
wrapWithTheme('src/components/Layout.tsx', [
  {
    target: "const location = useLocation();",
    replacement: `const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);`
  },
  {
    target: '<nav className="sticky top-0 z-40 bg-cyber-bg/80 backdrop-blur-[24px] border-b border-cyber-border print:hidden h-[68px]">',
    replacement: '<nav className={`sticky top-0 z-40 transition-all duration-300 print:hidden h-[68px] ${scrolled ? "bg-cyber-bg/90 backdrop-blur-[24px] border-b border-cyber-border shadow-lg" : "bg-transparent border-transparent"}`}>'
  },
  {
    target: "import { motion, AnimatePresence } from 'framer-motion';",
    replacement: "import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';"
  },
  {
    target: 'animate={{ y: 0, opacity: 1, rotate: 0 }}',
    replacement: 'animate={{ y: 0, opacity: 1, rotate: 360 }}'
  },
  {
    target: 'animate={{ y: 0, opacity: 1, rotate: 0 }}',
    replacement: 'animate={{ y: 0, opacity: 1, rotate: 360 }}'
  },
  {
    target: '<Outlet />',
    replacement: `<AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.15, type: "tween" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>`
  },
  {
    target: `const { scrollYProgress } = useScroll();`,
    replacement: ``
  },
  {
    target: `<div className="min-h-screen text-cyber-white font-body flex flex-col relative z-20">
      <CustomCursor />`,
    replacement: `  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return (
    <div className="min-h-screen text-cyber-white font-body flex flex-col relative z-20">
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-cyber-pink z-50 origin-left" style={{ scaleX }} />
      <CustomCursor />`
  },
  {
    target: `  return (
    <div className="min-h-screen text-cyber-white font-body flex flex-col relative z-20">`,
    replacement: ``
  }
]);

// 2. AIChatbot.tsx
wrapWithTheme('src/components/AIChatbot.tsx', [
  {
    target: `className="relative w-14 h-14 bg-cyber-bg border border-cyber-pink/50 text-cyber-pink hover:bg-cyber-pink hover:text-black hover:border-transparent transition-all duration-300 shadow-[0_0_15px_rgba(255,0,102,0.3)] hover:shadow-[0_0_25px_rgba(255,0,102,0.6)] cursor-none z-10 flex items-center justify-center p-0"`,
    replacement: `className="relative w-14 h-14 bg-cyber-bg border border-cyber-pink/50 text-cyber-pink hover:bg-cyber-pink hover:text-black hover:border-transparent transition-all duration-300 shadow-[0_0_15px_rgba(255,0,102,0.3)] hover:shadow-[0_0_25px_rgba(255,0,102,0.6)] cursor-none z-10 flex items-center justify-center p-0 group"`
  },
  {
    target: `<Hexagon className="absolute inset-0 w-full h-full stroke-[1] fill-current" />`,
    replacement: `<Hexagon className="absolute inset-0 w-full h-full stroke-[1] fill-current" />
        <div className="absolute inset-0 w-full h-full rounded-full border-[2px] border-cyber-pink opacity-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>`
  }
]);

// 3. HeroCanvas.tsx
wrapWithTheme('src/components/HeroCanvas.tsx', [
  {
    target: `const width = 480;`,
    replacement: `const [isLightMode, setIsLightMode] = React.useState(document.body.classList.contains('theme-light'));
    
    React.useEffect(() => {
      const observer = new MutationObserver(() => {
        setIsLightMode(document.body.classList.contains('theme-light'));
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }, []);
    
    const width = 480;`
  },
  {
    target: `const line = new THREE.LineSegments(
      wireframe, 
      new THREE.LineBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.7 })
    );`,
    replacement: `const materialWire = new THREE.LineBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.7 });
    const line = new THREE.LineSegments(wireframe, materialWire);`
  },
  {
    target: `const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.03, 8, 80), 
      new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 })
    );`,
    replacement: `const materialRing = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.03, 8, 80), materialRing);`
  },
  {
    target: `    animate();`,
    replacement: `    const applyTheme = () => {
      const isLight = document.body.classList.contains('theme-light');
      materialWire.color.setHex(isLight ? 0xCC0033 : 0xff0066);
      materialWire.opacity = isLight ? 0.9 : 0.7;
      
      materialRing.color.setHex(isLight ? 0x005577 : 0x00cfff);
    };
    
    animate();`
  },
  {
    target: `      renderer.render(scene, camera);
    };`,
    replacement: `      applyTheme();
      renderer.render(scene, camera);
    };`
  }
]);

// 4. Opportunities.tsx
wrapWithTheme('src/pages/Opportunities.tsx', [
  {
    target: `className="p-8 md:p-[64px_48px] bg-cyber-bg2 border border-cyber-border rounded-lg relative overflow-hidden group hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] transition-all duration-300"`,
    replacement: `className="p-8 md:p-[64px_48px] bg-[#1E2A3A] border border-cyber-border rounded-lg relative overflow-hidden group hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)] transition-all duration-300 text-white"` 
  },
  {
    target: `text-cyber-muted line-clamp-3`,
    replacement: `text-[#CCCCCC] line-clamp-3`
  },
  {
    target: `text-cyber-white leading-[1.3]`,
    replacement: `text-white leading-[1.3]`
  },
  {
    target: `bg-cyber-bg2/80`,
    replacement: `bg-[#1E2A3A]`
  },
  {
    target: `text-cyber-white lg:sticky`,
    replacement: `text-white lg:sticky`
  },
  {
    target: `transition-all duration-300 hover:border-[#ff006659] hover:shadow-[0_0_40px_rgba(255,0,102,0.1)]`,
    replacement: `transition-all duration-300 hover:border-cyber-pink hover:shadow-[0_4px_20px_var(--color-cyber-pink)] hover:-translate-y-[4px]`
  },
  {
    target: `{filtered.map((opportunity)`,
    replacement: `{filtered.map((opportunity, i)`
  },
  {
    target: `key={opportunity.id}`,
    replacement: `key={opportunity.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}`
  },
  {
    target: `div key={opportunity.id}`,
    replacement: `motion.div key={opportunity.id}`
  }
]);

// 5. CgpaCalculator.tsx
wrapWithTheme('src/pages/CgpaCalculator.tsx', [
  {
    target: `bg-cyber-bg2/60`,
    replacement: `bg-[#1E2A3A]`
  },
  {
    target: `text-cyber-white font-display`,
    replacement: `text-white font-display`
  },
  {
    target: `text-cyber-muted text-sm`,
    replacement: `text-[#CCCCCC] text-sm`
  },
  {
    target: `bg-cyber-bg/50 border border-cyber-border text-cyber-white`,
    replacement: `bg-[#0A0A0F] border border-cyber-border text-white focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink`
  }
]);

// 6. Resources.tsx
wrapWithTheme('src/pages/Resources.tsx', [
  {
    target: `bg-cyber-bg2/40`,
    replacement: `bg-[#1E2A3A]`
  },
  {
    target: `{filteredResources.map((resource) =>`,
    replacement: `{filteredResources.map((resource, i) =>`
  },
  {
    target: `<div key={resource.id}`,
    replacement: `<motion.div key={resource.id} initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}`
  },
  {
    target: `hover:bg-cyber-pink/5 hover:border-cyber-pink/50`,
    replacement: `hover:bg-[#1E2A3A] hover:border-cyber-cyan hover:shadow-[0_0_20px_var(--color-cyber-cyan)]`
  },
  {
    target: `text-cyber-white leading-[1.3]`,
    replacement: `text-white leading-[1.3]`
  },
  {
    target: `text-[13px] text-cyber-muted line-clamp-2`,
    replacement: `text-[13px] text-[#CCCCCC] line-clamp-2`
  },
  {
    target: `className="w-10 h-10 mb-4 text-cyber-pink"`,
    replacement: `className="w-10 h-10 mb-4 text-cyber-pink group-hover:scale-110 transition-transform duration-300"`
  }
]);

// 7. AiUpdates.tsx
wrapWithTheme('src/pages/AiUpdates.tsx', [
  {
    target: `bg-cyber-bg2/60`,
    replacement: `bg-[#1E2A3A]`
  },
  {
    target: `bg-cyber-bg2/80`,
    replacement: `bg-[#1E2A3A]`
  },
  {
    target: `text-cyber-white leading-[1.3]`,
    replacement: `text-white leading-[1.3]`
  },
  {
    target: `hover:-translate-y-1`,
    replacement: `hover:scale-[1.02] hover:-translate-y-1`
  }
]);

// 8. Courses.tsx
wrapWithTheme('src/pages/Courses.tsx', [
  {
    target: `bg-cyber-bg/50 border border-cyber-border text-cyber-white`,
    replacement: `bg-[#1E2A3A] border border-cyber-border text-white placeholder-white/70`
  },
  {
    target: `bg-cyber-bg2/60`,
    replacement: `bg-[#1E2A3A]` // keep dark mostly
  },
  {
    target: `text-cyber-white leading-[1.3]`,
    replacement: `text-white leading-[1.3]`
  },
  {
    target: `{filteredCourses.map((course)`,
    replacement: `{filteredCourses.map((course, i)`
  },
  {
    target: `<div key={course.id}`,
    replacement: `<motion.div key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}`
  },
  {
    target: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">`,
    replacement: `<AnimatePresence mode="popLayout">\n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">`
  },
  {
    target: `</div>\n      </motion.section>`,
    replacement: `</div>\n        </AnimatePresence>\n      </motion.section>`
  }
]);

// 9. About.tsx
wrapWithTheme('src/pages/About.tsx', [
  {
    target: `bg-cyber-bg2/60 border border-cyber-border/50`,
    replacement: `bg-[#1E2A3A] border border-cyber-border/50 text-white always-dark`
  },
  {
    target: `text-cyber-white leading-[1.2]`,
    replacement: `text-white leading-[1.2]`
  },
  {
    target: `text-cyber-muted leading-[1.7]`,
    replacement: `text-[#CCCCCC] leading-[1.7]`
  },
  {
    target: `text-cyber-white mt-[8px]`,
    replacement: `text-white mt-[8px]`
  },
  {
    target: `<span className="font-display text-[22px] font-bold text-cyber-lime">500+</span>`,
    replacement: `<Counter target={500} suffix="+" className="font-display text-[22px] font-bold text-cyber-lime inline-block" />`
  },
  {
    target: `const About = () => {`,
    replacement: `const Counter = ({ target, suffix, className }: { target: number, suffix: string, className: string }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    let observer;
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
  }, [target]);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
};\n\nconst About = () => {`
  }
]);

// 10. Home.tsx
wrapWithTheme('src/pages/Home.tsx', [
  {
    target: `<h1 className="font-display text-[clamp(48px,11vw,90px)] font-[900] leading-[0.92] tracking-[-0.04em] text-cyber-white relative">
            <span className="block text-cyber-white">Your</span>
            <span className="block text-cyber-white">Gateway to</span>
            <span className="block text-transparent relative" style={{ WebkitTextStroke: '2px var(--color-cyber-pink)', animation: 'glitchText 6s ease-in-out infinite' }}>Tech</span>
            <span className="block bg-gradient-to-r from-cyber-pink via-cyber-lime to-cyber-blue bg-clip-text text-transparent break-words w-full px-2" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite' }}>Opportunities</span>
          </h1>`,
    replacement: `          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.15 }}
            className="font-display text-[clamp(48px,11vw,90px)] font-[900] leading-[0.92] tracking-[-0.04em] text-cyber-white relative">
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="block text-cyber-white">Your</motion.span>
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="block text-cyber-white">Gateway to</motion.span>
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="block text-transparent relative" style={{ WebkitTextStroke: '2px var(--color-cyber-pink)', animation: 'glitchText 6s ease-in-out infinite' }}>Tech</motion.span>
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="block bg-gradient-to-r from-cyber-pink via-cyber-lime to-cyber-blue bg-clip-text text-transparent break-words w-full px-2" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite' }}>Opportunities</motion.span>
          </motion.h1>`
  },
  {
    target: `import { motion } from 'framer-motion';`,
    replacement: `import { motion, useScroll, useTransform } from 'framer-motion';`
  },
  {
    target: `const upcomingOpportunities = OPPORTUNITIES`,
    replacement: `  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 150]);\n\n  const upcomingOpportunities = OPPORTUNITIES`
  },
  {
    target: `<div className="relative z-[2] text-center md:text-left flex-1 flex flex-col justify-center">`,
    replacement: `<motion.div style={{ y: yParallax }} className="relative z-[2] text-center md:text-left flex-1 flex flex-col justify-center">`
  },
  {
    target: `</div>\n\n        <div className="relative z-[2] flex justify-center items-center h-[40vh] sm:h-[50vh] min-h-[300px] md:min-h-0 md:h-auto w-full md:flex-1">`,
    replacement: `</motion.div>\n\n        <div className="relative z-[2] flex justify-center items-center h-[40vh] sm:h-[50vh] min-h-[300px] md:min-h-0 md:h-auto w-full md:flex-1">`
  }
]);

console.log('Script completed.');
