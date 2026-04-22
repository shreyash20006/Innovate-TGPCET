import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendToWebhook } from '../utils/webhookService';

interface Submission {
  id: string;
  name: string;
  email: string;
  type: 'Registration' | 'Newsletter' | 'Feedback';
  date: string;
  status: 'New' | 'Processed';
}

const MOCK_SUBMISSIONS: Submission[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', type: 'Registration', date: '2026-04-22', status: 'New' },
  { id: '2', name: 'Sneha Patil', email: 'sneha@example.com', type: 'Newsletter', date: '2026-04-21', status: 'Processed' },
  { id: '3', name: 'Amit Verma', email: 'amit@example.com', type: 'Registration', date: '2026-04-20', status: 'New' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'bulk'>('submissions');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMsg('Initiating bulk broadcast via Zapier...');
    
    try {
      await sendToWebhook('BULK_EMAIL', {
        subject: bulkSubject,
        message: bulkMessage,
        recipientCount: 500, // In a real app, this would be dynamic
      });
      setStatusMsg('Success! Bulk email process started.');
      setBulkSubject('');
      setBulkMessage('');
    } catch (error) {
      setStatusMsg('Error: Failed to trigger bulk automation.');
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg pt-[100px] px-5 xl:px-[60px]">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-[11px] text-cyber-pink tracking-[0.3em] uppercase flex items-center gap-[16px] mb-[16px] before:content-[''] before:w-[40px] before:h-[1px] before:bg-cyber-pink">
              Admin Control
            </div>
            <h1 className="font-display text-[clamp(32px,5vw,56px)] font-[900] leading-[0.95] tracking-[-0.03em] text-cyber-white">
              Forms <em className="not-italic text-cyber-pink">Dashboard</em>
            </h1>
          </div>
          
          <div className="flex bg-cyber-bg2 border border-cyber-border p-1 rounded-sm">
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-2 font-mono text-[12px] tracking-[0.1em] uppercase transition-all ${activeTab === 'submissions' ? 'bg-cyber-pink text-white shadow-[0_0_20px_rgba(255,0,102,0.3)]' : 'text-cyber-muted hover:text-white'}`}
            >
              Submissions
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-2 font-mono text-[12px] tracking-[0.1em] uppercase transition-all ${activeTab === 'bulk' ? 'bg-cyber-pink text-white shadow-[0_0_20px_rgba(255,0,102,0.3)]' : 'text-cyber-muted hover:text-white'}`}
            >
              Bulk Email
            </button>
          </div>
        </header>

        {activeTab === 'submissions' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="border border-cyber-border bg-cyber-bg2/50 backdrop-blur-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[13px]">
                  <thead>
                    <tr className="border-b border-cyber-border bg-cyber-pink/5">
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">ID</th>
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">Name</th>
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">Email</th>
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">Type</th>
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">Date</th>
                      <th className="p-4 text-cyber-pink uppercase tracking-widest text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SUBMISSIONS.map((sub) => (
                      <tr key={sub.id} className="border-b border-cyber-border hover:bg-white/5 transition-colors">
                        <td className="p-4 text-cyber-muted">#{sub.id}</td>
                        <td className="p-4 text-cyber-white font-bold">{sub.name}</td>
                        <td className="p-4 text-cyber-blue">{sub.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] uppercase border ${sub.type === 'Registration' ? 'border-cyber-lime text-cyber-lime' : 'border-cyber-pink text-cyber-pink'}`}>
                            {sub.type}
                          </span>
                        </td>
                        <td className="p-4 text-cyber-muted">{sub.date}</td>
                        <td className="p-4">
                          <span className={sub.status === 'New' ? 'text-cyber-lime animate-pulse' : 'text-cyber-muted'}>
                            ● {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-cyber-muted text-[12px] font-mono">// Total entries: {MOCK_SUBMISSIONS.length}</p>
              <button className="text-cyber-pink font-mono text-[12px] uppercase tracking-widest hover:underline">
                Export to CSV ⤓
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[800px]"
          >
            <div className="border border-[#aaff0040] bg-cyber-bg2/90 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent,transparent 2px,rgba(170,255,0,0.015) 2px,rgba(170,255,0,0.015) 4px)' }}></div>
              <div className="flex items-center gap-[8px] p-[14px_24px] border-b border-[#aaff0026] bg-[#aaff000d]">
                <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]"></div>
                <div className="w-[11px] h-[11px] rounded-full bg-[#ffbd2e]"></div>
                <div className="w-[11px] h-[11px] rounded-full bg-[#28ca41]"></div>
                <span className="font-mono text-[11px] text-[#aaff0080] ml-[10px] tracking-[0.1em]">innovate.tgpcet — bulk-mailer.sh</span>
              </div>
              
              <form onSubmit={handleSendBulk} className="p-8 flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-[#aaff0080] tracking-[0.2em] uppercase">$ subject</label>
                  <input 
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    required
                    className="bg-transparent border-none border-b border-[#aaff004d] text-cyber-lime font-mono text-[16px] p-2 outline-none focus:border-cyber-lime transition-all"
                    placeholder="E.g. New Hackathon Opportunity!"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] text-[#aaff0080] tracking-[0.2em] uppercase">$ message_content (markdown supported)</label>
                  <textarea 
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    required
                    rows={8}
                    className="bg-transparent border border-[#aaff004d] text-cyber-lime font-mono text-[14px] p-4 outline-none focus:border-cyber-lime transition-all resize-none"
                    placeholder="Write your announcement here..."
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="font-mono text-[12px] text-cyber-muted">
                    {statusMsg && <span className="text-cyber-lime">{statusMsg}</span>}
                  </div>
                  <button 
                    disabled={isSending}
                    type="submit" 
                    className="px-10 py-4 bg-cyber-lime text-black font-mono text-[14px] font-[900] tracking-[0.2em] uppercase hover:bg-transparent hover:text-cyber-lime border border-cyber-lime transition-all disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : './broadcast --now'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-8 p-6 border border-cyber-pink/20 bg-cyber-pink/5 rounded-sm">
              <h3 className="font-display text-[18px] font-bold text-cyber-white mb-2">Automation Sync</h3>
              <p className="text-cyber-muted text-[13px] leading-relaxed mb-4">
                This dashboard triggers your <strong>Zap 3 (Bulk Email)</strong>. It will automatically fetch the latest subscriber list from <strong>Zapier Tables</strong> and send the content you provide above.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-lime"></span>
                  <span className="font-mono text-[10px] text-cyber-muted uppercase">Zapier Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-lime"></span>
                  <span className="font-mono text-[10px] text-cyber-muted uppercase">MailerSend Ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
