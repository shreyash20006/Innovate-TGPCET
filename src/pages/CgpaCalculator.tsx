import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Save, Download, RefreshCw, AlertCircle, ChevronDown, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [university, setUniversity] = useState<'RTMNU' | 'DBATU'>('RTMNU');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState<number>(1);
  const [marks, setMarks] = useState<Record<string, string>>({});
  
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
  }, [university]);

  // Reset marks when semester changes
  useEffect(() => {
    setMarks({});
  }, [semester]);

  const currentSubjects = UNIVERSITY_DATA[university].semesters[semester as keyof typeof UNIVERSITY_DATA[typeof university]['semesters']] || [];

  const handleMarkChange = (subjectName: string, value: string) => {
    // Allow empty or numbers between 0-100
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
      setMarks(prev => ({ ...prev, [subjectName]: value }));
    }
  };

  // Calculate current SGPA
  let totalCredits = 0;
  let earnedPoints = 0;
  
  currentSubjects.forEach(sub => {
    totalCredits += sub.credits;
    const grade = getGradeInfo(marks[sub.name]);
    earnedPoints += grade.point * sub.credits;
  });

  const currentSgpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : '0.00';

  // Calculate Overall CGPA
  let cumulativePoints = 0;
  let cumulativeCredits = 0;
  
  Object.values(savedSemesters).forEach(sem => {
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

  const downloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { 
        scale: 2, 
        backgroundColor: '#020617',
        useCORS: true, 
        allowTaint: true 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CGPA_Report_${university}_Sem${semester}.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF", error);
      alert(`Failed to generate PDF. Error: ${error.message || 'Unknown error'}`);
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
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-2">
            <Calculator className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
            CGPA Calculator
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Track your academic progress with precision. Enter your marks to instantly calculate your SGPA and overall CGPA.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Input (Takes up 8 columns on large screens) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Sleek Selectors Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">University</label>
                  <div className="relative group">
                    <select 
                      value={university}
                      onChange={(e) => setUniversity(e.target.value as 'RTMNU' | 'DBATU')}
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 rounded-2xl px-5 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer group-hover:border-slate-700"
                    >
                      <option value="RTMNU">RTMNU (B.Tech)</option>
                      <option value="DBATU">DBATU (B.Pharma)</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Branch</label>
                  <div className="relative group">
                    <select 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 rounded-2xl px-5 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer group-hover:border-slate-700"
                    >
                      {UNIVERSITY_DATA[university].branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Semester</label>
                  <div className="relative group">
                    <select 
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 rounded-2xl px-5 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer group-hover:border-slate-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Input Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl" ref={printRef}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Semester {semester}</h2>
                  <p className="text-sm text-slate-400 mt-1">Enter your marks out of 100</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                  <span className="text-sm text-amber-500/80 font-medium">Total Credits:</span>
                  <span className="text-lg text-amber-500 font-bold">{totalCredits}</span>
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
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-300"
                    >
                      <div className="flex-grow">
                        <h3 className="text-slate-200 font-semibold text-base leading-tight group-hover:text-white transition-colors">{subject.name}</h3>
                        <p className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-2">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{subject.credits} Credits</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="relative w-24">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            placeholder="Marks"
                            value={marks[subject.name] || ''}
                            onChange={(e) => handleMarkChange(subject.name, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-600 [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        
                        <div className={`w-14 h-12 flex items-center justify-center rounded-xl border font-bold text-lg transition-all duration-300 ${gradeStyle}`}>
                          {grade.letter}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* SGPA Result Area */}
              <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 text-center sm:text-left">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Current SGPA</p>
                  <div className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
                    {currentSgpa} <span className="text-xl text-slate-500 font-medium">/ 10</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
                  <button 
                    onClick={handleSaveSemester}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
                  >
                    <Save className="w-5 h-5" /> Save SGPA
                  </button>
                  <button 
                    onClick={downloadPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600"
                  >
                    <Download className="w-5 h-5" /> PDF
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Dashboard & CGPA (Takes up 4 columns, sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Premium CGPA Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-[length:200%_100%] animate-gradient"></div>
              
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Overall CGPA</h2>
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] mb-6">
                {currentCgpa}
              </div>
              
              <div className="inline-flex items-center gap-2 bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <p className="text-xs font-medium text-slate-400">
                  Based on <span className="text-white font-bold">{Object.keys(savedSemesters).length}</span> saved semester(s)
                </p>
              </div>
            </div>

            {/* Saved Semesters List */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Save className="w-4 h-4 text-amber-500" /> Saved Progress
                </h3>
                {Object.keys(savedSemesters).length > 0 && (
                  <button onClick={clearSavedData} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg" title="Clear All">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {Object.keys(savedSemesters).length === 0 ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-3 bg-slate-950/50 rounded-2xl border border-slate-800/50 border-dashed">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-medium px-4">No semesters saved yet. Calculate and save your SGPA to track CGPA.</p>
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
                        className="flex justify-between items-center p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors group"
                      >
                        <span className="text-slate-300 font-semibold text-sm">Semester {sem}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{savedSemesters[sem].totalCredits} Cr</span>
                          <span className="text-amber-500 font-black text-base">{savedSemesters[sem].sgpa.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grading Scale Info */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest text-center">Grading Scale</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">90-100</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">O (10)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">80-89</span>
                  <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">A+ (9)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">70-79</span>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">A (8)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">60-69</span>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">B+ (7)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">50-59</span>
                  <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">B (6)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">45-49</span>
                  <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded">C (5)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">40-44</span>
                  <span className="text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded">D (4)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                  <span className="text-slate-400">&lt; 40</span>
                  <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">F (0)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
