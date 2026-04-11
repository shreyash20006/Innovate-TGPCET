import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, BookOpen, Search, Plus, X, Play, Loader2, CheckCircle2,
  AlertCircle, Download, ChevronDown, ChevronUp, Sparkles, Radio,
  BrainCircuit, FileQuestion, Layers, FileText, RotateCcw, ExternalLink,
  Headphones, GraduationCap, Telescope, Zap, Clock, ArrowRight,
  Upload, File, Link, Type, Trash2
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Job {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: string;
  title: string;
  progress: number;
  result?: any;
  error?: string;
  created_at: string;
}

interface UploadedFile {
  file_id: string;
  filename: string;
  size: number;
  type: string;
}

interface SourceItem {
  id: string;
  kind: 'url' | 'text' | 'file';
  value: string;          // URL or text content
  label: string;          // Display name
  file_id?: string;       // For uploaded files
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function apiPost(path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Request failed');
  }
  return res.json();
}

async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function uploadFile(file: globalThis.File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/nlm/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Upload failed');
  }
  return res.json();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── GlowCard ────────────────────────────────────────────────────────────────
const GlowCard = ({ children, className = '', glow = 'amber' }: { children: React.ReactNode; className?: string; glow?: string }) => {
  const glowColors: Record<string, string> = {
    amber: 'hover:shadow-[0_0_40px_rgba(245,166,35,0.15)]',
    purple: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]',
    emerald: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
  };
  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl transition-all duration-300 ${glowColors[glow] || glowColors.amber} ${className}`}>
      {children}
    </div>
  );
};

// ─── Multi-Source Input (URLs + Text + PDF Upload) ───────────────────────────
const SourceManager = ({
  sources, setSources, accentColor = 'amber'
}: {
  sources: SourceItem[];
  setSources: (s: SourceItem[]) => void;
  accentColor?: string;
}) => {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [draft, setDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addUrlOrText = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const isUrl = /^https?:\/\//i.test(trimmed);
    const newItem: SourceItem = {
      id: generateId(),
      kind: isUrl ? 'url' : 'text',
      value: trimmed,
      label: isUrl ? new URL(trimmed).hostname + (trimmed.length > 50 ? '...' : '') : trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : ''),
    };
    setSources([...sources, newItem]);
    setDraft('');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFile(file);
        const newItem: SourceItem = {
          id: generateId(),
          kind: 'file',
          value: result.file_id,
          label: result.filename,
          file_id: result.file_id,
        };
        setSources(prev => [...prev, newItem]);
      }
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const borderColor = accentColor === 'purple' ? 'border-purple-500/50' : accentColor === 'cyan' ? 'border-cyan-500/50' : 'border-amber-500/50';
  const focusBorder = accentColor === 'purple' ? 'focus:border-purple-500/50' : accentColor === 'cyan' ? 'focus:border-cyan-500/50' : 'focus:border-amber-500/50';
  const buttonBg = accentColor === 'purple' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' : accentColor === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20';
  const dragBorder = accentColor === 'purple' ? 'border-purple-500/40 bg-purple-500/5' : accentColor === 'cyan' ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-amber-500/40 bg-amber-500/5';

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Sources</label>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 w-fit">
        <button
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            inputMode === 'url' ? `${buttonBg} border` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Link className="w-3 h-3" /> URL / YouTube
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            inputMode === 'text' ? `${buttonBg} border` : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Type className="w-3 h-3" /> Text
        </button>
      </div>

      {/* Input */}
      {inputMode === 'url' ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrlOrText())}
            placeholder="https://example.com or YouTube link…"
            className={`flex-1 bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ${focusBorder} focus:bg-white/[0.07] transition-colors`}
          />
          <button onClick={addUrlOrText} aria-label="Add source" className={`border rounded-xl px-4 transition-colors ${buttonBg}`}>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Paste your study material, notes, or any text content here…"
            rows={4}
            className={`w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ${focusBorder} transition-colors resize-none`}
          />
          <button
            onClick={addUrlOrText}
            disabled={!draft.trim()}
            className={`border rounded-xl px-4 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${buttonBg}`}
          >
            <Plus className="w-4 h-4 inline mr-1.5" /> Add Text Source
          </button>
        </div>
      )}

      {/* File Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          dragOver ? dragBorder : 'border-slate-700/60 hover:border-slate-600 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.epub,.docx"
          multiple
          onChange={e => handleFileUpload(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Uploading…</span>
          </div>
        ) : (
          <>
            <Upload className="w-6 h-6 mx-auto text-slate-500 mb-2" />
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Drop files here</span> or click to browse
            </p>
            <p className="text-[10px] text-slate-600 mt-1">PDF, TXT, Markdown, EPUB, DOCX supported</p>
          </>
        )}
      </div>

      {/* Sources List */}
      {sources.length > 0 && (
        <div className="space-y-1.5">
          {sources.map(s => (
            <div key={s.id} className="flex items-center gap-2 bg-white/[0.04] border border-slate-700/60 rounded-lg px-3 py-2 group">
              <div className="flex-shrink-0">
                {s.kind === 'url' && <Link className="w-3.5 h-3.5 text-blue-400" />}
                {s.kind === 'text' && <Type className="w-3.5 h-3.5 text-green-400" />}
                {s.kind === 'file' && <File className="w-3.5 h-3.5 text-orange-400" />}
              </div>
              <span className="flex-1 text-xs text-slate-300 truncate">{s.label}</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider flex-shrink-0">{s.kind}</span>
              <button
                onClick={() => removeSource(s.id)}
                className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${s.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <p className="text-[10px] text-slate-600 text-right">{sources.length} source{sources.length !== 1 ? 's' : ''} added</p>
        </div>
      )}
    </div>
  );
};

// ─── Progress Ring ───────────────────────────────────────────────────────────
const ProgressRing = ({ progress, size = 56 }: { progress: number; size?: number }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#progressGrad)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        className="transition-all duration-500"
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="fill-white text-xs font-bold rotate-90 origin-center">
        {progress}%
      </text>
    </svg>
  );
};

// ─── Job Card ────────────────────────────────────────────────────────────────
const JobCard = ({ job }: { job: Job }) => {
  const [expanded, setExpanded] = useState(job.status === 'completed');
  const icons: Record<string, React.ReactNode> = {
    podcast: <Headphones className="w-5 h-5 text-amber-400" />,
    study_kit: <GraduationCap className="w-5 h-5 text-purple-400" />,
    research: <Telescope className="w-5 h-5 text-cyan-400" />,
  };
  const statusColors: Record<string, string> = {
    pending: 'text-slate-400',
    running: 'text-amber-400',
    completed: 'text-emerald-400',
    failed: 'text-red-400',
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors" aria-label={`Toggle ${job.title} details`}>
        {icons[job.type] || <Zap className="w-5 h-5 text-amber-400" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{job.title}</span>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${statusColors[job.status]}`}>{job.status}</span>
          </div>
          <span className="text-[11px] text-slate-500">{new Date(job.created_at).toLocaleString()}</span>
        </div>
        {job.status === 'running' && <ProgressRing progress={job.progress} size={40} />}
        {job.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        {job.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-400" />}
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-800">
            <div className="p-4 space-y-3 text-sm">
              {job.error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs">{job.error}</div>}
              {job.result && (
                <div className="space-y-3">
                  {job.result.demo && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-400 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Demo mode — Install <code className="bg-white/10 px-1 rounded">notebooklm-py</code> and run <code className="bg-white/10 px-1 rounded">notebooklm login</code> for real content</span>
                    </div>
                  )}

                  {/* Podcast results */}
                  {job.type === 'podcast' && job.result.audio_file && (
                    <a href={`${API_BASE}/api/nlm/download/${job.result.audio_file}`} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium">
                      <Download className="w-4 h-4" /> Download Podcast Audio
                    </a>
                  )}

                  {/* Study kit results */}
                  {job.type === 'study_kit' && (
                    <>
                      {job.result.quiz && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                            <FileQuestion className="w-3.5 h-3.5 text-purple-400" /> Quiz ({job.result.quiz.length} questions)
                          </h4>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {job.result.quiz.map((q: any, i: number) => (
                              <div key={i} className="bg-white/[0.03] rounded-lg p-3 text-xs text-slate-300">
                                <span className="text-amber-400 font-bold mr-1">Q{i + 1}.</span> {q.question}
                                {q.answerOptions && (
                                  <div className="mt-2 space-y-1 pl-4">
                                    {q.answerOptions.map((opt: any, j: number) => (
                                      <div key={j} className={`flex items-center gap-1.5 ${opt.isCorrect ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                                        <span>{opt.isCorrect ? '✓' : '○'}</span> {opt.text}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.result.flashcards && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Flashcards ({job.result.flashcards.length} cards)
                          </h4>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {job.result.flashcards.map((fc: any, i: number) => (
                              <div key={i} className="bg-white/[0.03] rounded-lg p-3 text-xs">
                                <div className="text-white font-medium">{fc.front}</div>
                                <div className="text-slate-400 mt-1 text-[11px]">{fc.back}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.result.study_guide && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Study Guide
                          </h4>
                          <div className="bg-white/[0.03] rounded-lg p-3 max-h-48 overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap custom-scrollbar">
                            {job.result.study_guide.slice(0, 800)}
                            {job.result.study_guide.length > 800 && '…'}
                          </div>
                        </div>
                      )}
                      {/* Download buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.result.quiz_file && (
                          <a href={`${API_BASE}/api/nlm/download/${job.result.quiz_file}`} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-purple-400 hover:bg-purple-500/20 text-xs font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Quiz JSON
                          </a>
                        )}
                        {job.result.flashcards_file && (
                          <a href={`${API_BASE}/api/nlm/download/${job.result.flashcards_file}`} className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Flashcards JSON
                          </a>
                        )}
                        {job.result.study_guide_file && (
                          <a href={`${API_BASE}/api/nlm/download/${job.result.study_guide_file}`} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Study Guide MD
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  {/* Research results */}
                  {job.type === 'research' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Search className="w-3.5 h-3.5" /> Query: <span className="text-white font-medium">{job.result.query}</span>
                        {job.result.sources_found != null && (
                          <span className="ml-auto text-emerald-400">{job.result.sources_found} sources found</span>
                        )}
                      </div>
                      {job.result.report && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-cyan-400" /> Research Report
                          </h4>
                          <div className="bg-white/[0.03] rounded-lg p-3 max-h-60 overflow-y-auto text-xs text-slate-300 whitespace-pre-wrap custom-scrollbar">
                            {job.result.report.slice(0, 1500)}
                            {job.result.report.length > 1500 && '…'}
                          </div>
                        </div>
                      )}
                      {job.result.mind_map && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> Mind Map
                          </h4>
                          <MindMapViz data={job.result.mind_map} />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.result.report_file && (
                          <a href={`${API_BASE}/api/nlm/download/${job.result.report_file}`} className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Report MD
                          </a>
                        )}
                        {job.result.mind_map_file && (
                          <a href={`${API_BASE}/api/nlm/download/${job.result.mind_map_file}`} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-purple-400 hover:bg-purple-500/20 text-xs font-medium transition-colors">
                            <Download className="w-3.5 h-3.5" /> Mind Map JSON
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Mind Map Visualizer ─────────────────────────────────────────────────────
const MindMapViz = ({ data }: { data: any }) => {
  if (!data) return null;
  const renderNode = (node: any, depth: number = 0): React.ReactNode => {
    const label = node.root || node.label || node.name || 'Node';
    const children = node.children || [];
    const colors = ['text-amber-400', 'text-cyan-400', 'text-purple-400', 'text-emerald-400', 'text-pink-400'];
    return (
      <div key={`${label}-${depth}`} className="relative" style={{ paddingLeft: depth * 20 }}>
        <div className="flex items-center gap-2 py-1">
          {depth > 0 && (
            <div className="flex items-center">
              <div className="w-3 border-t border-slate-700" />
              <div className={`w-2 h-2 rounded-full ${colors[depth % colors.length].replace('text-', 'bg-')}`} />
            </div>
          )}
          <span className={`text-xs font-medium ${depth === 0 ? 'text-white text-sm font-bold' : colors[depth % colors.length]}`}>{label}</span>
        </div>
        {children.map((child: any, i: number) => renderNode(child, depth + 1))}
      </div>
    );
  };
  return <div className="bg-white/[0.03] rounded-lg p-3 max-h-60 overflow-y-auto custom-scrollbar">{renderNode(data)}</div>;
};

// ─── Feature Panels ──────────────────────────────────────────────────────────
const PodcastPanel = ({ onSubmit }: { onSubmit: (job_id: string) => void }) => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('deep-dive');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!sources.length) return;
    setLoading(true);
    try {
      const urlAndTextSources = sources.filter(s => s.kind !== 'file').map(s => s.value);
      const fileIds = sources.filter(s => s.kind === 'file').map(s => s.file_id!);
      const data = await apiPost('/api/nlm/podcast', {
        sources: urlAndTextSources,
        files: fileIds,
        title: title || 'AI Podcast',
        style,
      });
      onSubmit(data.job_id);
      setSources([]); setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard glow="amber" className="p-6 space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20">
          <Headphones className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Podcast Generator</h3>
          <p className="text-xs text-slate-400">Auto-generate audio overviews from any source</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Podcast Title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="My awesome research podcast…"
          className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      <SourceManager sources={sources} setSources={setSources} accentColor="amber" />

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Style</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['deep-dive', 'brief', 'critique', 'debate'].map(s => (
            <button
              key={s} onClick={() => setStyle(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                style === s ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/[0.03] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >{s.replace('-', ' ')}</button>
          ))}
        </div>
      </div>

      <button
        onClick={submit} disabled={loading || !sources.length}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(245,166,35,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
        {loading ? 'Starting…' : 'Generate Podcast'}
      </button>
    </GlowCard>
  );
};

const StudyKitPanel = ({ onSubmit }: { onSubmit: (job_id: string) => void }) => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!sources.length) return;
    setLoading(true);
    try {
      const urlAndTextSources = sources.filter(s => s.kind !== 'file').map(s => s.value);
      const fileIds = sources.filter(s => s.kind === 'file').map(s => s.file_id!);
      const data = await apiPost('/api/nlm/study-kit', {
        sources: urlAndTextSources,
        files: fileIds,
        title: title || 'Study Kit',
        difficulty,
      });
      onSubmit(data.job_id);
      setSources([]); setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard glow="purple" className="p-6 space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20">
          <GraduationCap className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Study Kit Creator</h3>
          <p className="text-xs text-slate-400">Auto-generate quizzes, flashcards & study guides</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Kit Title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Machine Learning Fundamentals…"
          className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      <SourceManager sources={sources} setSources={setSources} accentColor="purple" />

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Difficulty</label>
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                difficulty === d ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-white/[0.03] border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >{d}</button>
          ))}
        </div>
      </div>

      <button
        onClick={submit} disabled={loading || !sources.length}
        className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Starting…' : 'Generate Study Kit'}
      </button>
    </GlowCard>
  );
};

const ResearchPanel = ({ onSubmit }: { onSubmit: (job_id: string) => void }) => {
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('deep');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await apiPost('/api/nlm/research', {
        query, title: title || 'Research', mode,
      });
      onSubmit(data.job_id);
      setQuery(''); setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard glow="cyan" className="p-6 space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/20">
          <Telescope className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Research Assistant</h3>
          <p className="text-xs text-slate-400">Auto-research any topic with reports & mind maps</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Project Title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="AI in Healthcare…"
          className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Research Query</label>
        <textarea
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="What are the latest breakthroughs in quantum computing and their practical applications?"
          rows={3}
          className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Research Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'fast', label: '⚡ Fast', desc: 'Quick overview' },
            { id: 'deep', label: '🔬 Deep', desc: 'Comprehensive analysis' },
          ].map(m => (
            <button
              key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-3 rounded-lg text-left border transition-all ${
                mode === m.id ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/[0.03] border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className={`text-xs font-bold ${mode === m.id ? 'text-cyan-400' : 'text-slate-300'}`}>{m.label}</div>
              <div className="text-[10px] text-slate-500">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit} disabled={loading || !query.trim()}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        {loading ? 'Starting Research…' : 'Start Research'}
      </button>
    </GlowCard>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function NotebookLMPage() {
  const [activeTab, setActiveTab] = useState<'podcast' | 'study' | 'research'>('podcast');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiGet('/api/nlm/health');
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    
    checkHealth();
    const intervalId = setInterval(checkHealth, 3000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const running = jobs.filter(j => j.status === 'pending' || j.status === 'running');
      if (!running.length) return;
      try {
        const updated = await apiGet('/api/nlm/jobs');
        setJobs(updated);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [jobs]);

  const handleNewJob = useCallback(async (job_id: string) => {
    try {
      const job = await apiGet(`/api/nlm/jobs/${job_id}`);
      setJobs(prev => [job, ...prev]);
    } catch {}
  }, []);

  const tabs = [
    { id: 'podcast' as const, label: 'Podcast', icon: Headphones, color: 'amber' },
    { id: 'study' as const, label: 'Study Kit', icon: GraduationCap, color: 'purple' },
    { id: 'research' as const, label: 'Research', icon: Telescope, color: 'cyan' },
  ];

  const tabColorMap: Record<string, string> = {
    amber: 'border-amber-500 text-amber-400 bg-amber-500/10',
    purple: 'border-purple-500 text-purple-400 bg-purple-500/10',
    cyan: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero */}
      <section className="relative pt-16 pb-6 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-amber-500/85 bg-amber-500/10 border border-amber-500/25 rounded-full px-5 py-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Powered by NotebookLM
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Learning Hub
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Generate podcasts, study kits, and deep research reports — automatically.
            Drop PDFs, paste URLs or text, and let AI do the rest.
          </p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${
            backendOnline === true ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            backendOnline === false ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            'bg-slate-500/10 border-slate-500/30 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              backendOnline === true ? 'bg-emerald-400 animate-pulse' :
              backendOnline === false ? 'bg-red-400' : 'bg-slate-400'
            }`} />
            {backendOnline === true ? 'Backend connected' : backendOnline === false ? 'Backend offline — start the Python server' : 'Checking…'}
          </div>
        </motion.div>
      </section>

      {/* Tab navigation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-900/50 border border-slate-800 rounded-2xl p-1.5 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id ? tabColorMap[tab.color] + ' border' : 'text-slate-400 border border-transparent hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active panel */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'podcast' && <PodcastPanel onSubmit={handleNewJob} />}
            {activeTab === 'study' && <StudyKitPanel onSubmit={handleNewJob} />}
            {activeTab === 'research' && <ResearchPanel onSubmit={handleNewJob} />}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Jobs list */}
      {jobs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Active Jobs
            </h2>
            <button onClick={() => apiGet('/api/nlm/jobs').then(setJobs).catch(() => {})} className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="space-y-3">
            {jobs.map(job => <JobCard key={job.job_id} job={job} />)}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Add Sources', desc: 'Drop PDFs, paste URLs/YouTube links, or type text. Supports PDF, DOCX, EPUB, TXT & Markdown.', icon: Upload, gradient: 'from-amber-500/20 to-orange-600/10', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
            { step: '02', title: 'Choose Format', desc: 'Pick between podcast, study kit, or research report. Each has customizable options.', icon: Layers, gradient: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
            { step: '03', title: 'Get Results', desc: 'AI processes everything automatically. Download MP3s, JSON quizzes, Markdown reports, and more.', icon: Download, gradient: 'from-cyan-500/20 to-blue-600/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center group hover:border-slate-700 transition-colors"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400">
                {item.step}
              </div>
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mt-2 bg-gradient-to-br ${item.gradient} border ${item.border}`}>
                <item.icon className={`w-7 h-7 ${item.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Setup instructions */}
      {backendOnline === false && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlowCard className="p-6 space-y-4" glow="amber">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Quick Setup
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold tracking-wider uppercase text-slate-400">1. Install dependencies</p>
                <code className="block bg-black/40 rounded-lg p-3 text-amber-400 text-xs font-mono">
                  pip install notebooklm-py[browser] fastapi uvicorn python-multipart aiofiles
                </code>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold tracking-wider uppercase text-slate-400">2. Authenticate (one-time)</p>
                <code className="block bg-black/40 rounded-lg p-3 text-amber-400 text-xs font-mono">
                  notebooklm login
                </code>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold tracking-wider uppercase text-slate-400">3. Start the backend</p>
                <code className="block bg-black/40 rounded-lg p-3 text-amber-400 text-xs font-mono">
                  cd backend && python main.py
                </code>
              </div>
            </div>
          </GlowCard>
        </section>
      )}
    </div>
  );
}
