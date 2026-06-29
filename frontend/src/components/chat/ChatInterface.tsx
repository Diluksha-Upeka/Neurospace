"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiUrl } from '@/lib/api';

// Define the shape of our messages based on the backend schema
interface SourceItem {
  filename: string;
  text_snippet: string;
  score: number;
  page?: number;
  timestamp?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceItem[];
}

interface ChatInterfaceProps {
  onCitationClick: (filename: string, page?: number, timestamp?: string) => void;
}

export default function ChatInterface({ onCitationClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* MESSAGE HISTORY AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-12 h-12 bg-card border border-border flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-foreground"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p className="text-[14px] font-semibold tracking-tight text-foreground">How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] text-[14px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground p-4 border border-border' 
                : 'text-foreground w-full'
            }`}>
              
              {/* RENDER ASSISTANT WITH AVATAR */}
              {msg.role === 'assistant' ? (
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 border border-border bg-card flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-foreground"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="prose prose-slate prose-sm text-[14px] leading-relaxed max-w-none prose-p:my-1 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-foreground prose-pre:rounded-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {/* RENDER CITATIONS */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-border mt-4">
                        {msg.sources.map((source, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onCitationClick(source.filename, source.page, source.timestamp)}
                            className="group/cite flex items-center gap-2 text-[11px] font-bold bg-card border border-border hover:bg-primary text-foreground hover:text-primary-foreground px-3 py-2 transition-all duration-150 uppercase tracking-wide"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-foreground group-hover/cite:text-primary-foreground transition-colors"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <span className="truncate max-w-[220px]">
                              {source.filename}
                              {source.page !== undefined && source.page !== null && ` (p. ${source.page})`}
                              {source.timestamp && ` (${source.timestamp})`}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="font-medium">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
             <div className="w-8 h-8 border border-border bg-card flex items-center justify-center shrink-0 mt-0.5">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-foreground"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             </div>
             <div className="flex items-center gap-1.5 h-8">
                <div className="w-1.5 h-1.5 bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-5 bg-card border-t border-border relative">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={sendMessage} className="flex gap-2 relative bg-card border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent text-foreground px-4 py-2.5 text-[14px] font-medium focus:outline-none placeholder:text-muted-foreground"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:border-border disabled:text-muted-foreground text-primary-foreground px-4 py-2.5 text-[14px] font-bold transition-all flex items-center gap-2 border border-border"
            >
              <span className="hidden sm:inline-block uppercase tracking-wider text-[11px]">Send</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">NeuroSpace Assistant can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
