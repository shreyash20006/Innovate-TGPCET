import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Save, Download, RefreshCw, AlertCircle, ChevronDown, Trash2 } from 'lucide-react';
import domtoimage from 'dom-to-image-more';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import CustomLogo from '../components/Logo';

// --- DATA STRUCTURES ---
const UNIVERSITY_DATA = {
  RTMNU: {
    branches: ['CSE', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Electronics'],
    semesters: {
      1: [
        { name: 'Engineering Mathematics-I', credits: 4 },
        { name: 'Engineering Physics', credits: 3 },
        { name: 'Engineering Chemistry', credits: 3 },
        { name: 'Basic Electrical Engineering', credits: 3 },
        { name: 'Programming for Problem Solving', credits: 4 },
        { name: 'Engineering Mechanics', credits: 3 }
      ],
      2: [
        { name: 'Engineering Mathematics-II', credits: 4 },
        { name: 'English for Communication', credits: 2 },
        { name: 'Environmental Science', credits: 3 },
        { name: 'Object Oriented Programming C++', credits: 4 },
        { name: 'Engineering Graphics & Design', credits: 3 },
        { name: 'Workshop Technology', credits: 3 }
      ],
      3: [
        { name: 'Engineering Mathematics-III', credits: 4 },
        { name: 'Data Structures & Algorithms', credits: 4 },
        { name: 'Digital Electronics', credits: 3 },
        { name: 'Discrete Mathematics', credits: 3 },
        { name: 'Database Management Systems', credits: 4 },
        { name: 'Computer Organization & Architecture', credits: 3 }
      ],
      4: [
        { name: 'Probability & Statistics', credits: 3 },
        { name: 'Operating Systems', credits: 4 },
        { name: 'Software Engineering', credits: 3 },
        { name: 'Theory of Computation', credits: 3 },
        { name: 'Object Oriented Modeling & Design', credits: 3 },
        { name: 'Microprocessor & Interfacing', credits: 3 }
      ],
      5: [
        { name: 'Computer Networks', credits: 4 },
        { name: 'Design & Analysis of Algorithms', credits: 4 },
        { name: 'Web Technologies', credits: 3 },
        { name: 'Management Information Systems', credits: 3 },
        { name: 'Elective-I', credits: 3 },
        { name: 'Open Elective-I', credits: 3 }
      ],
      6: [
        { name: 'Artificial Intelligence', credits: 4 },
        { name: 'Cryptography & Network Security', credits: 4 },
        { name: 'Compiler Design', credits: 3 },
        { name: 'Elective-II', credits: 3 },
        { name: 'Elective-III', credits: 3 },
        { name: 'Open Elective-II', credits: 3 }
      ],
      7: [
        { name: 'Big Data Analytics', credits: 3 },
        { name: 'Elective-IV', credits: 3 },
        { name: 'Project Phase-I', credits: 4 },
        { name: 'Industrial Training', credits: 2 },
        { name: 'Seminar', credits: 1 }
      ],
      8: [
        { name: 'Project Phase-II', credits: 8 },
        { name: 'Comprehensive Viva', credits: 2 }
      ]
    }
  },
  DBATU: {
    branches: ['B.Pharma'],
    semesters: {
      1: [
        { name: 'Human Anatomy and Physiology-I', credits: 4 },
        { name: 'Pharmaceutical Analysis-I', credits: 4 },
        { name: 'Pharmaceutics-I', credits: 4 },
        { name: 'Pharmaceutical Inorganic Chemistry', credits: 4 },
        { name: 'Communication Skills', credits: 3 }
      ],
      2: [
        { name: 'Human Anatomy and Physiology-II', credits: 4 },
        { name: 'Pharmaceutical Organic Chemistry-I', credits: 4 },
        { name: 'Biochemistry', credits: 4 },
        { name: 'Pathophysiology', credits: 4 },
        { name: 'Computer Applications in Pharmacy', credits: 3 }
      ],
      3: [
        { name: 'Pharmaceutical Organic Chemistry-II', credits: 4 },
        { name: 'Physical Pharmaceutics-I', credits: 4 },
        { name: 'Pharmaceutical Microbiology', credits: 4 },
        { name: 'Pharmaceutical Engineering', credits: 4 }
      ],
      4: [
        { name: 'Pharmaceutical Organic Chemistry-III', credits: 4 },
        { name: 'Physical Pharmaceutics-II', credits: 4 },
        { name: 'Pharmacology-I', credits: 4 },
        { name: 'Pharmacognosy & Phytochemistry-I', credits: 4 }
      ],
      5: [
        { name: 'Medicinal Chemistry-I', credits: 4 },
        { name: 'Industrial Pharmacy-I', credits: 4 },
        { name: 'Pharmacology-II', credits: 4 },
        { name: 'Pharmacognosy & Phytochemistry-II', credits: 4 },
        { name: 'Pharmaceutical Jurisprudence', credits: 3 }
      ],
      6: [
        { name: 'Medicinal Chemistry-II', credits: 4 },
        { name: 'Industrial Pharmacy-II', credits: 4 },
        { name: 'Pharmacology-III', credits: 4 },
        { name: 'Herbal Drug Technology', credits: 4 },
        { name: 'Biopharmaceutics & Pharmacokinetics', credits: 3 }
      ],
      7: [
        { name: 'Quality Assurance', credits: 4 },
        { name: 'Pharmaceutical Marketing Management', credits: 3 },
        { name: 'Pharmaceutical Biotechnology', credits: 4 },
        { name: 'Novel Drug Delivery Systems', credits: 4 }
      ],
      8: [
        { name: 'Social Pharmacy', credits: 3 },
        { name: 'Pharmacy Practice', credits: 4 },
        { name: 'Project Work', credits: 8 }
      ]
    }
  }
};

// --- HELPER FUNCTIONS ---
const getGradeInfo = (marks: number | string) => {
  if (marks === '' || marks === null || marks === undefined) return { point: 0, letter: '-' };
  const m = Number(marks);
  if (m >= 90) return { point: 10, letter: 'O' };
  if (m >= 80) return { point: 9, letter: 'A+' };
  if (m >= 70) return { point: 8, letter: 'A' };
  if (m >= 60) return { point: 7, letter: 'B+' };
  if (m >= 50) return { point: 6, letter: 'B' };
  if (m >= 45) return { point: 5, letter: 'C' };
  if (m >= 40) return { point: 4, letter: 'D' };
  return { point: 0, letter: 'F' };
};

const GRADE_COLORS: Record<string, string> = {
  'O': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  'A+': 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  'A': 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  'B+': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  'B': 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  'C': 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  'D': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
  'F': 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  '-': 'bg-slate-800/50 text-slate-500 border-slate-700/50'
};

export default function CgpaCalculator() {
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState<'RTMNU' | 'DBATU'>('RTMNU');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState<number>(1);
  const [marks, setMarks] = useState<Record<string, string>>({});
  
  // Custom credits state
  const [customCredits, setCustomCredits] = useState<Record<string, string>>({});
  const [creditErrors, setCreditErrors] = useState<Record<string, string>>({});

  // savedSemesters: { semNumber: { sgpa, totalCredits } }
  const [savedSemesters, setSavedSemesters] = useState<Record<number, { sgpa: number, totalCredits: number }>>({});
  
  const printRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cgpa_saved_semesters');
    if (saved) {
      try {
        setSavedSemesters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved semesters");
      }
    }
  }, []);

  // Save to LocalStorage when savedSemesters change
  useEffect(() => {
    localStorage.setItem('cgpa_saved_semesters', JSON.stringify(savedSemesters));
  }, [savedSemesters]);

  // Reset branch when university changes
  useEffect(() => {
    setBranch(UNIVERSITY_DATA[university].branches[0]);
    setSemester(1);
    setMarks({});
    setCustomCredits({});
    setCreditErrors({});
  }, [university]);

  // Reset marks when semester changes
  useEffect(() => {
    setMarks({});
    setCustomCredits({});
    setCreditErrors({});
  }, [semester]);

  const currentSubjects = (UNIVERSITY_DATA[university] as any).semesters[semester as keyof typeof UNIVERSITY_DATA['RTMNU']['semesters']] || [];

  const handleMarkChange = (subjectName: string, value: string) => {
    if (value === '') {
      setMarks(prev => ({ ...prev, [subjectName]: '' }));
      return;
    }

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue === '') {
      return; // Ignore non-numeric input, reverting to last valid value
    }

    const numericValue = parseInt(cleanValue, 10);
    
    if (numericValue >= 0 && numericValue <= 100) {
      setMarks(prev => ({ ...prev, [subjectName]: numericValue.toString() }));
    }
    // If outside range (>100), we don't update state. 
    // Since it's a controlled component, it will automatically snap back to the last valid value.
  };

  const handleCreditChange = (subjectName: string, value: string) => {
    // Allow empty value (backspace)
    if (value === '') {
      setCustomCredits(prev => ({ ...prev, [subjectName]: '' }));
      setCreditErrors(prev => ({ ...prev, [subjectName]: 'Required' }));
      return;
    }

    // Only allow positive integers
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue !== value) {
      return; // Revert non-numeric characters automatically
    }

    const numericValue = parseInt(cleanValue, 10);
    setCustomCredits(prev => ({ ...prev, [subjectName]: numericValue.toString() }));

    if (numericValue > 0) {
      setCreditErrors(prev => {
        const newErr = { ...prev };
        delete newErr[subjectName];
        return newErr;
      });
    } else {
      setCreditErrors(prev => ({ ...prev, [subjectName]: 'Must be > 0' }));
    }
  };

  // Calculate current SGPA
  let totalCredits = 0;
  let earnedPoints = 0;
  
  currentSubjects.forEach(sub => {
    const credStr = customCredits[sub.name] !== undefined ? customCredits[sub.name] : sub.credits.toString();
    const creds = parseInt(credStr, 10);

    if (!isNaN(creds) && creds > 0 && !creditErrors[sub.name]) {
      totalCredits += creds;
      const grade = getGradeInfo(marks[sub.name]);
      earnedPoints += grade.point * creds;
    }
  });

  const currentSgpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : '0.00';

  // Calculate Overall CGPA
  let cumulativePoints = 0;
  let cumulativeCredits = 0;
  
  Object.values(savedSemesters).forEach((sem: any) => {
    cumulativeCredits += sem.totalCredits;
    cumulativePoints += sem.sgpa * sem.totalCredits;
  });

  const currentCgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits).toFixed(2) : '0.00';

  const handleSaveSemester = () => {
    setSavedSemesters(prev => ({
      ...prev,
      [semester]: {
        sgpa: Number(currentSgpa),
        totalCredits
      }
    }));
  };

  const clearSavedData = () => {
    if(window.confirm("Are you sure you want to clear all saved semester data?")) {
      setSavedSemesters({});
      setMarks({});
    }
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printTemplateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!printTemplateRef.current) return;
    setIsGeneratingPDF(true);
    try {
      // Use fixed positioning so it doesn't affect document scroll/flow on mobile at all
      printTemplateRef.current.style.display = 'block';
      printTemplateRef.current.style.position = 'fixed';
      printTemplateRef.current.style.left = '-200vw'; // push completely offscreen horizontally
      printTemplateRef.current.style.top = '0';
      printTemplateRef.current.style.zIndex = '-9999';
      
      // Small delay to ensure state and DOM are stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await htmlToImage.toPng(printTemplateRef.current, {
        quality: 1,
        backgroundColor: 'var(--color-cyber-bg2)', 
        pixelRatio: 2, // High resolution
        style: {
          margin: '0',
          padding: '24px', // Add some padding for the PDF output
          border: 'none',
          boxShadow: 'none',
        }
      });
      
      printTemplateRef.current.style.display = 'none';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = dataUrl;
      
      img.onload = () => {
        const pdfHeight = (img.height * pdfWidth) / img.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = studentName 
            ? `${studentName.replace(/\s+/g, '_')}_CGPA_Report_${university}_Sem${semester}.pdf`
            : `CGPA_Report_${university}_Sem${semester}.pdf`;
            
        pdf.save(fileName);
        setIsGeneratingPDF(false);
      };
    } catch (error: any) {
      console.error("Error generating PDF", error);
      alert(`Failed to generate PDF. Error: ${error.message || 'Unknown error'}`);
      if (printTemplateRef.current) printTemplateRef.current.style.display = 'none';
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        {/* Header Section */}
        <div className="text-center flex flex-col items-center mb-12 print:hidden">
          <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink after:content-[''] after:w-[40px] after:h-[1px] after:bg-cyber-pink">
            Computation Engine
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white mb-[24px]">
            CGPA <em className="not-italic text-cyber-pink">Calculator</em>
          </h1>
          <p className="text-cyber-muted max-w-[480px] text-[16px] leading-[1.7] mx-auto font-body">
            Track your academic progress with precision. Enter your data packets to compute your SGPA and overall CGPA.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Input (Takes up 8 columns on large screens) */}
          <div className="lg:col-span-8 space-y-6 print:w-full print:block">
            
            {/* Sleek Selectors Card */}
            <div className="bg-cyber-bg2/80 border border-cyber-border p-6 shadow-[0_0_30px_rgba(170,255,0,0.05)] print:hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2 lg:col-span-1">
                  <label className="font-mono text-[10px] text-cyber-lime uppercase tracking-widest ml-1">Student Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-transparent border-b border-cyber-border text-cyber-white px-3 py-2.5 focus:outline-none focus:border-cyber-lime transition-all placeholder:text-[#aaff004d] font-mono text-[13px] cursor-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-cyber-lime uppercase tracking-widest ml-1">University</label>
                  <div className="relative group">
                    <select 
                      value={university}
                      onChange={(e) => setUniversity(e.target.value as 'RTMNU' | 'DBATU')}
                      className="w-full bg-transparent border-b border-cyber-border text-cyber-white px-3 py-2.5 appearance-none focus:outline-none focus:border-cyber-lime transition-all cursor-none font-mono text-[13px]"
                    >
                      <option value="RTMNU">RTMNU (B.Tech)</option>
                      <option value="DBATU">DBATU (B.Pharma)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-border pointer-events-none group-hover:text-cyber-lime transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-cyber-lime uppercase tracking-widest ml-1">Branch</label>
                  <div className="relative group">
                    <select 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-transparent border-b border-cyber-border text-cyber-white px-3 py-2.5 appearance-none focus:outline-none focus:border-cyber-lime transition-all cursor-none font-mono text-[13px]"
                    >
                      {UNIVERSITY_DATA[university].branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-border pointer-events-none group-hover:text-cyber-lime transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-cyber-lime uppercase tracking-widest ml-1">Semester</label>
                  <div className="relative group">
                    <select 
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full bg-transparent border-b border-cyber-border text-cyber-white px-3 py-2.5 appearance-none focus:outline-none focus:border-cyber-lime transition-all cursor-none font-mono text-[13px]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-border pointer-events-none group-hover:text-cyber-lime transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Input Card */}
            <div className="bg-cyber-bg2/80 border border-cyber-border p-4 sm:p-6 shadow-[0_0_30px_rgba(170,255,0,0.05)] print:shadow-none print:border-none print:bg-transparent" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="font-display text-[18px] sm:text-[20px] font-[800] text-cyber-white flex items-center gap-2 uppercase tracking-wide">
                    Semester {semester}
                  </h2>
                  <p className="font-mono text-cyber-muted text-[10px] sm:text-[11px] mt-1 uppercase tracking-widest">Enter marks out of 100</p>
                </div>
                <div className="flex items-center gap-2 bg-cyber-pink/10 border border-cyber-pink/30 px-3 py-1.5">
                  <span className="font-mono text-[10px] text-cyber-pink uppercase tracking-widest">Total Credits:</span>
                  <span className="font-display text-[16px] text-cyber-pink font-[700]">{totalCredits}</span>
                </div>
              </div>

              <div className="space-y-3">
                {currentSubjects.map((subject, idx) => {
                  const grade = getGradeInfo(marks[subject.name]);
                  const gradeStyle = GRADE_COLORS[grade.letter] || GRADE_COLORS['-'];
                  
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-all duration-300"
                    >
                      <div className="flex-grow">
                        <h3 className="font-mono text-[11px] sm:text-[12px] text-cyber-white uppercase tracking-wider group-hover:text-cyber-lime transition-colors">{subject.name}</h3>
                        <div className="mt-1.5 flex sm:items-center gap-2">
                          <div className="flex items-center">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="1"
                              value={customCredits[subject.name] !== undefined ? customCredits[subject.name] : subject.credits}
                              onChange={(e) => handleCreditChange(subject.name, e.target.value)}
                              className={`w-10 sm:w-12 bg-transparent text-cyber-white font-mono text-[11px] px-1 py-1 border-b ${creditErrors[subject.name] ? 'border-[#ff0042]' : 'border-cyber-border'} focus:outline-none focus:border-cyber-lime transition-all text-center cursor-none`}
                            />
                            <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest ml-1 sm:ml-2">Credits</span>
                          </div>
                          {creditErrors[subject.name] && (
                            <span className="text-[#ff0042] text-[9px] font-mono tracking-widest mt-1">
                              {creditErrors[subject.name]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-0">
                        <div className="relative flex-1 sm:flex-none sm:w-24">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0" 
                            max="100"
                            placeholder="Marks"
                            value={marks[subject.name] || ''}
                            onChange={(e) => handleMarkChange(subject.name, e.target.value)}
                            className="w-full bg-cyber-bg2/80 border-b border-cyber-border text-cyber-white px-2 sm:px-3 py-2 text-center font-mono text-[12px] sm:text-[13px] focus:outline-none focus:border-cyber-lime transition-all placeholder:text-cyber-muted/50 cursor-none"
                          />
                        </div>
                        
                        <div className={`w-[40px] sm:w-[48px] h-[36px] flex-shrink-0 flex items-center justify-center font-mono text-[13px] sm:text-[14px] font-bold border transition-all duration-300 ${gradeStyle}`}>
                          {grade.letter}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* SGPA Result Area */}
              <div className="mt-8 p-6 sm:p-8 bg-[#1E2A3A] border border-cyber-border flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-white" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-cyber-pink/20 blur-[60px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 text-center sm:text-left">
                  <p className="font-mono text-cyber-muted text-[12px] uppercase tracking-widest mb-2">Current SGPA Output</p>
                  <div className="text-5xl font-display font-[900] text-cyber-white tracking-[-0.03em] drop-shadow-[0_0_15px_rgba(255,0,102,0.3)]">
                    {currentSgpa} <span className="text-2xl text-cyber-pink font-[700]">/ 10</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10 print:hidden">
                  <button 
                    onClick={handleSaveSemester}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyber-pink text-black px-8 py-3.5 font-mono text-[13px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,0,102,0.4)] hover:shadow-[0_0_30px_rgba(255,0,102,0.6)] hover:-translate-y-0.5 cursor-none"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                  >
                    <Save className="w-5 h-5" /> Execute Save
                  </button>
                  <button 
                    onClick={downloadPDF}
                    disabled={isGeneratingPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-transparent text-cyber-lime border border-cyber-lime hover:bg-cyber-lime hover:text-black px-6 py-3.5 font-mono text-[13px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-none"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                  >
                    {isGeneratingPDF ? (
                      <div className="w-5 h-5 border-2 border-cyber-muted border-t-cyber-lime rounded-full animate-spin"></div>
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {isGeneratingPDF ? 'Compiling...' : 'Export PDF'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Dashboard & CGPA (Takes up 4 columns, sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 print:hidden">
            
            {/* Premium CGPA Card */}
            <div className="bg-[#1E2A3A] border border-cyber-border p-8 text-center shadow-[0_0_30px_rgba(170,255,0,0.05)] relative overflow-hidden group text-white" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="absolute inset-0 bg-cyber-lime/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-lime to-transparent"></div>
              
              <h2 className="font-mono text-[13px] text-cyber-muted uppercase tracking-[0.2em] mb-4">Overall CGPA</h2>
              <div className="text-7xl font-display font-[900] text-cyber-white drop-shadow-[0_0_20px_rgba(170,255,0,0.4)] tracking-[-0.03em] mb-6">
                {currentCgpa}
              </div>
              
              <div className="inline-flex items-center gap-2 bg-cyber-bg2 border border-cyber-border px-4 py-2" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
                <div className="w-2 h-2 bg-cyber-lime animate-pulse"></div>
                <p className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest">
                  Based on <span className="text-cyber-lime font-bold">{Object.keys(savedSemesters).length}</span> system block(s)
                </p>
              </div>
            </div>

            {/* Saved Semesters List */}
            <div className="bg-[#1E2A3A] border border-cyber-border p-6 shadow-[0_0_30px_rgba(255,0,102,0.05)] text-white" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-[16px] font-[800] text-cyber-white flex items-center gap-2 uppercase tracking-wide">
                  <Save className="w-4 h-4 text-cyber-pink" /> Data Archives
                </h3>
                {Object.keys(savedSemesters).length > 0 && (
                  <button onClick={clearSavedData} className="text-cyber-muted hover:text-[#ff0042] transition-colors p-1.5 cursor-none" title="Clear All">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {Object.keys(savedSemesters).length === 0 ? (
                <div className="text-center py-10 text-cyber-muted flex flex-col items-center gap-3 bg-[rgba(255,0,102,0.02)] border border-cyber-border border-dashed font-mono uppercase tracking-widest">
                  <AlertCircle className="w-8 h-8 opacity-40 text-[#ff0042]" />
                  <p className="text-[10px] px-4">No archives found. Execute SGPA compilation to save.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                    if (!savedSemesters[sem]) return null;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={sem} 
                        className="flex justify-between items-center p-3.5 bg-[rgba(170,255,0,0.02)] border border-cyber-border hover:border-cyber-lime/50 transition-colors group"
                        style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                      >
                        <span className="text-cyber-white font-mono text-[12px] uppercase">Sys_BLK {sem}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] text-cyber-muted uppercase tracking-widest bg-cyber-bg2 border border-cyber-border px-2 py-1">{savedSemesters[sem].totalCredits} Cr</span>
                          <span className="text-cyber-lime font-display font-[700] text-[16px]">{savedSemesters[sem].sgpa.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grading Scale Info */}
            <div className="bg-[#1E2A3A] border border-cyber-border p-6 shadow-[0_0_30px_rgba(255,0,102,0.05)] text-white" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
              <h3 className="font-mono text-[10px] font-bold text-cyber-muted mb-4 uppercase tracking-[0.3em] text-center">Grading Matrix Limiters</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">90-100</span>
                  <span className="text-[#aaff00] font-bold bg-[#aaff001a] px-2 py-0.5 rounded-sm">O (10)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">80-89</span>
                  <span className="text-[#88ff00] font-bold bg-[#88ff001a] px-2 py-0.5 rounded-sm">A+ (9)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">70-79</span>
                  <span className="text-[#00ffff] font-bold bg-[#00ffff1a] px-2 py-0.5 rounded-sm">A (8)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">60-69</span>
                  <span className="text-[#0099ff] font-bold bg-[#0099ff1a] px-2 py-0.5 rounded-sm">B+ (7)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">50-59</span>
                  <span className="text-[#aa00ff] font-bold bg-[#aa00ff1a] px-2 py-0.5 rounded-sm">B (6)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">45-49</span>
                  <span className="text-[#ff00ff] font-bold bg-[#ff00ff1a] px-2 py-0.5 rounded-sm">C (5)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">40-44</span>
                  <span className="text-[#ff0066] font-bold bg-[#ff00661a] px-2 py-0.5 rounded-sm">D (4)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-transparent border-b border-cyber-border hover:border-cyber-lime/50 transition-colors">
                  <span className="text-cyber-muted">&lt; 40</span>
                  <span className="text-[#ff0042] font-bold bg-[#ff00421a] px-2 py-0.5 rounded-sm">F (0)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* HIDDEN PRINT TEMPLATE */}
        <div className="fixed overflow-hidden w-0 h-0 pointer-events-none opacity-0 z-[-1]">
          <div style={{ display: 'none' }} ref={printTemplateRef}>
            <div className="w-[800px] bg-cyber-bg2 p-10 text-white font-sans flex flex-col items-center">
            {/* Header & Mission (Top) */}
            <div className="flex flex-col items-center w-full mb-8 border-b border-slate-800 pb-8">
              <CustomLogo className="w-16 h-16 mb-4 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
              <h1 className="text-3xl font-black text-white tracking-tight mb-1">innovate.tgpcet</h1>
              <p className="text-sm text-slate-400 uppercase tracking-widest mb-6">Official CGPA Report</p>
              
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 max-w-2xl text-center w-full">
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight uppercase">Our Mission</h3>
                <p className="text-amber-500 font-semibold text-sm mb-3">"Helping students access free resources and opportunities."</p>
                <p className="text-slate-400/90 text-[11px] leading-relaxed mx-auto">
                  We believe that education and career growth should not be hindered by paywalls. This platform was built to centralize high-quality notes, legitimate internship opportunities, and the latest tech updates—all completely free for students.
                </p>
              </div>
            </div>

            {/* Student & Course Details */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Student Name</p>
                <p className="text-lg font-bold text-slate-200">{studentName || 'Not Provided'}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Semester</p>
                <p className="text-lg font-bold text-amber-500">Semester {semester}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">University</p>
                <p className="text-lg font-bold text-slate-200">{university}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Branch</p>
                <p className="text-lg font-bold text-slate-200">{branch}</p>
              </div>
            </div>

            {/* Performance Scores */}
            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              {/* SGPA Score */}
              <div className="flex flex-col justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-700 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 text-center mb-2">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Current SGPA</p>
                  <p className="text-xs text-slate-500 mt-1">Semester {semester}</p>
                </div>
                <div className="text-5xl font-black text-white tracking-tight drop-shadow-md relative z-10">
                  {currentSgpa} <span className="text-xl text-amber-500 font-medium">/ 10</span>
                </div>
              </div>

              {/* CGPA Score */}
              <div className="flex flex-col justify-between items-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-amber-500/20 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-50"></div>
                <div className="relative z-10 text-center mb-2">
                  <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">Overall CGPA</p>
                  <p className="text-xs text-slate-500 mt-1">Cumulative score</p>
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 drop-shadow-md relative z-10">
                  {currentCgpa} <span className="text-xl text-amber-500/60 font-medium whitespace-nowrap">/ 10</span>
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="w-full mb-8">
              <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2 flex justify-between">
                <span>Academic Performance</span>
                <span className="text-sm text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{totalCredits} Credits</span>
              </h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-3 rounded-tl-xl border-b border-slate-800">Subject</th>
                    <th className="p-3 text-center border-b border-slate-800">Credits</th>
                    <th className="p-3 text-center border-b border-slate-800">Marks</th>
                    <th className="p-3 text-center rounded-tr-xl border-b border-slate-800">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {currentSubjects.map((sub, idx) => {
                    const grade = getGradeInfo(marks[sub.name]);
                    return (
                      <tr key={idx} className="bg-slate-950/20">
                        <td className="p-3 text-sm text-slate-300 font-medium">{sub.name}</td>
                        <td className="p-3 text-sm text-slate-500 text-center">
                          {customCredits[sub.name] !== undefined ? customCredits[sub.name] : sub.credits}
                        </td>
                        <td className="p-3 text-sm font-semibold text-slate-200 text-center">{marks[sub.name] || '0'} / 100</td>
                        <td className="p-3 text-center font-bold text-amber-500">{grade.letter}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Links Footer */}
            <div className="w-full text-center border-t border-slate-800 pt-6">
              <div className="flex justify-center items-center gap-8 text-xs font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  innovate-tgpcet.web.app
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  WhatsApp
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  Telegram
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
