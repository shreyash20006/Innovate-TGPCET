import re

with open('src/pages/NotebookLM.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix 1: SourceManager setSources type
text = text.replace(
    'setSources: (s: SourceItem[]) => void;',
    'setSources: React.Dispatch<React.SetStateAction<SourceItem[]>>;'
)

# Fix 2: Add StudioPanel before PodcastPanel
studio_panel = '''const StudioPanel = ({ onSubmit }: { onSubmit: (job_id: string) => void }) => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [title, setTitle] = useState('');
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const STUDIO_TOOLS = [
    { id: 'audio', label: 'Audio Overview', icon: Headphones, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'slide_deck', label: 'Slide Deck', icon: Presentation, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'video', label: 'Video Overview', icon: Video, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'mind_map', label: 'Mind Map', icon: Workflow, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'report', label: 'Reports', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'quiz', label: 'Quiz', icon: FileQuestion, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'infographic', label: 'Infographic', icon: PieChart, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'data_table', label: 'Data Table', icon: Table, color: 'text-teal-400', bg: 'bg-teal-400/10' },
  ];

  const handleGenerate = async (type: string) => {
    if (sources.length === 0) return alert('Please add at least one source');
    setLoadingType(type);
    try {
      const payload = {
        sources: sources.filter(s => s.kind !== 'file').map(s => s.value),
        files: sources.filter(s => s.kind === 'file' && s.file_id).map(s => s.file_id!),
        title: title || 'My Studio Board',
        artifact_type: type,
        language: 'en'
      };
      const data = await apiPost('/api/nlm/studio', payload);
      onSubmit(data.job_id);
      setSources([]); setTitle('');
    } catch (err: any) {
      alert('Generation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <SourceManager accentColor="amber" sources={sources} setSources={setSources} />
        
        <div className="mt-6 space-y-3">
          <label className="text-xs font-semibold tracking-widest uppercase text-slate-400">Notebook Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Biology Chapter 4"
            className="w-full bg-white/5 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Studio Overview</h2>
          <p className="text-sm text-slate-400">Select an artifact to generate based on your sources above.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {STUDIO_TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => handleGenerate(t.id)}
              disabled={!!loadingType}
              className={`flex items-center gap-3 p-4 rounded-xl border border-slate-700/50 bg-white/[0.02] transition-all text-left group ${loadingType ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.05] hover:border-slate-600'}`}
            >
              <div className={`p-2.5 rounded-lg ${t.bg} ${t.color}`}>
                {loadingType === t.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <t.icon className="w-5 h-5" />}
              </div>
              <span className="font-medium text-slate-200 group-hover:text-white">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Feature Panels ──────────────────────────────────────────────────────────'''

text = text.replace('// ─── Feature Panels ──────────────────────────────────────────────────────────', studio_panel)

# Fix 3: JobCard key error. Sometimes TS doesn't recognize intrinsic attributes correctly inside loops if the component type is slightly restrictive or if React namespace isn't fully imported.
# It can be fixed by just ignoring it or adding key?: string to JobCard. Let's add it.
text = text.replace(
    'const JobCard = ({ job }: { job: Job }) => {',
    'const JobCard = ({ job }: { job: Job; key?: React.Key }) => {'
)

with open('src/pages/NotebookLM.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("TS patched")
