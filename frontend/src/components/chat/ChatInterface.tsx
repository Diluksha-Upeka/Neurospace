"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiUrl } from '@/lib/api';

// Define the shape of our messages based on the backend schema
interface SourceItem {
  filename: string;
  text_snippet: string;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceItem[];
}

interface ChatInterfaceProps {
  onCitationClick: (filename: string) => void;
}

export default function ChatInterface({ onCitationClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Hit your FastAPI backend
      const response = await fetch(apiUrl('/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();

      // Add AI response to UI
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: data.answer, sources: data.sources }
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "⚠️ Connection to NeuroSpace backend failed." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* MESSAGE HISTORY AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-12 h-12 bg-indigo-50/50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-indigo-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p className="text-[14px] font-medium tracking-tight">How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] text-[14px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-4 rounded-3xl rounded-tr-sm shadow-[0_8px_20px_-6px_rgba(79,70,229,0.3)] ring-1 ring-indigo-500/20' 
                : 'text-slate-700 w-full'
            }`}>
              
              {/* RENDER ASSISTANT WITH AVATAR */}
              {msg.role === 'assistant' ? (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-xl border border-indigo-100/60 bg-gradient-to-b from-white to-slate-50 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="prose prose-slate prose-sm text-[14px] leading-relaxed max-w-none prose-p:my-1 prose-pre:bg-slate-50/50 prose-pre:border prose-pre:border-slate-200/60 prose-pre:text-slate-800 prose-pre:rounded-2xl">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {/* RENDER CITATIONS */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200/50 mt-4">
                        {msg.sources.map((source, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onCitationClick(source.filename)}
                            className="group/cite flex items-center gap-2 text-[11px] font-medium bg-white border border-slate-200/60 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm text-slate-500 hover:text-indigo-700 px-3 py-2 rounded-xl transition-all duration-300"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-400 group-hover/cite:text-indigo-500 transition-colors"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <span className="truncate max-w-[160px] tracking-tight">{source.filename}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
             <div className="w-8 h-8 rounded-xl border border-indigo-100/60 bg-gradient-to-b from-white to-slate-50 shadow-sm flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             </div>
             <div className="flex items-center gap-1.5 h-8">
                <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-5 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 relative before:absolute before:inset-x-0 before:top-[-20px] before:h-[20px] before:bg-gradient-to-t before:from-white before:to-transparent before:pointer-events-none">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={sendMessage} className="flex gap-2 relative bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-indigo-400/50 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all rounded-2xl p-1.5 ring-1 ring-black/[0.01]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent text-slate-800 px-4 py-2.5 text-[14px] focus:outline-none placeholder:text-slate-400"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:border-slate-200/60 disabled:border disabled:text-slate-400 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all flex items-center gap-2 shadow-sm disabled:shadow-none"
            >
              <span className="hidden sm:inline-block">Send</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[11px] text-slate-400/80 tracking-tight">NeuroSpace Assistant can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
