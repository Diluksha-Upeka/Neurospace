"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
      const response = await fetch('http://localhost:8000/chat', {
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
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* MESSAGE HISTORY AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10 text-sm font-medium">
            Ask NeuroSpace a question about your documents.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
            }`}>
              
              {/* RENDER MARKDOWN */}
              {msg.role === 'assistant' ? (
                <div className="prose prose-slate prose-sm max-w-none text-slate-700">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>

            {/* RENDER CITATIONS (Only for assistant) */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                {msg.sources.map((source, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => onCitationClick(source.filename)}
                    className="text-[11px] font-medium bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-2.5 py-1 rounded-md transition-all shadow-sm"
                  >
                    📄 {source.filename}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
             <div className="max-w-[85%] rounded-2xl p-4 shadow-sm bg-white border border-slate-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex gap-2 relative shadow-sm rounded-xl bg-white border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent text-slate-800 px-4 py-2 text-sm focus:outline-none placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
