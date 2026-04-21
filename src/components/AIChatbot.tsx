import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "System initialized. How can I assist your computation today?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Command received. Processing request... [SIMULATED RESPONSE]",
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-[30px] sm:right-[30px] z-[999] w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] flex items-center justify-center border-none cursor-none bg-gradient-to-br from-[#ff0066] to-[#880033] shadow-[0_0_30px_rgba(255,0,102,0.6)] animate-pulse hover:scale-110 transition-transform"
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      >
        <Bot className="w-6 h-6 text-cyber-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[100px] right-4 sm:right-[30px] w-[calc(100vw-32px)] sm:w-[360px] h-[65vh] max-h-[500px] z-[998] bg-[#04000f] border border-cyber-pink/30 flex flex-col overflow-hidden shadow-[0_0_40px_rgba(255,0,102,0.2)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}
          >
            {/* Header */}
            <div className="p-[14px_20px] border-b border-cyber-pink/30 flex justify-between items-center bg-cyber-pink/5">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyber-pink" />
                <span className="font-mono text-cyber-white text-[14px] uppercase tracking-widest font-bold">Nexus AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyber-muted hover:text-cyber-pink transition-colors cursor-none p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-[13px] scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 ${
                    msg.isBot 
                      ? 'bg-[rgba(255,0,102,0.1)] border border-[rgba(255,0,102,0.3)] text-cyber-pink' 
                      : 'bg-[rgba(170,255,0,0.1)] border border-[rgba(170,255,0,0.3)] text-cyber-lime'
                  }`}
                  style={{
                    clipPath: msg.isBot 
                      ? 'polygon(0 10px, 10px 0, 100% 0, 100% 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
                  }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-cyber-pink/30 bg-cyber-bg2 flex gap-2 mt-auto">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="INPUT COMMAND..."
                className="flex-1 w-full bg-transparent border border-cyber-border text-cyber-white px-3 py-2 font-mono text-[12px] focus:outline-none focus:border-cyber-pink placeholder:text-cyber-muted cursor-none transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
              />
              <button 
                type="submit"
                className="bg-cyber-pink text-black px-4 flex items-center justify-center hover:bg-cyber-white transition-colors cursor-none"
                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
