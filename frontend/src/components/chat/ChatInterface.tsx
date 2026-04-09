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
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 mb-3 text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p className="text-[13px] font-medium">How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] text-[13px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white p-3 rounded-xl rounded-tr-sm shadow-sm' 
                : 'text-slate-700 w-full'
            }`}>
              
              {/* RENDER ASSISTANT WITH AVATAR */}
              {msg.role === 'assistant' ? (
                <div className="flex gap-4 w-full">
                  <div className="w-7 h-7 rounded border border-[#EAEAEA] bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="prose prose-slate prose-sm text-[13px] leading-relaxed max-w-none prose-p:my-1 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-[#EAEAEA] prose-pre:text-slate-800">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {/* RENDER CITATIONS */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#EAEAEA]/60 mt-3">
                        {msg.sources.map((source, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onCitationClick(source.filename)}
                            className="group flex items-center gap-1.5 text-[10px] font-medium bg-slate-50 border border-[#EAEAEA] hover:border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <span className="truncate max-w-[150px]">{source.filename}</span>
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
          <div className="flex items-start gap-4">
             <div className="w-7 h-7 rounded border border-[#EAEAEA] bg-slate-50 flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             </div>
             <div className="flex items-center gap-1.5 h-7">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-[#EAEAEA]">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={sendMessage} className="flex gap-2 relative bg-white border border-[#EAEAEA] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-50 transition-all rounded-xl p-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent text-slate-800 px-3 py-1.5 text-[13px] focus:outline-none placeholder:text-slate-400"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="hidden sm:inline-block">Send</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div className="text-center mt-2.5">
            <p className="text-[10px] text-slate-400">NeuroSpace Assistant can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
