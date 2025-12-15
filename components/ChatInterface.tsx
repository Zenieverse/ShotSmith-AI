import React, { useState, useEffect, useRef } from 'react';
import { createDirectorChat, ensureApiKey } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Content } from '@google/genai';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Chat
    // We don't await ensureApiKey here to avoid blocking mount, 
    // but handleSend will check it.
    chatRef.current = createDirectorChat();
    // Welcome message
    setMessages([{ id: '0', role: 'model', text: "Hello Director. I can help you plan shots, search for locations, or analyze technical requirements." }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const performSend = async (retry = false): Promise<void> => {
       if (!chatRef.current) return;
       try {
          const response = await chatRef.current.sendMessage({ message: userMsg.text });
          const text = response.text;
          const grounding = response.candidates?.[0]?.groundingMetadata;
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text || "I'm thinking...",
            groundingMetadata: grounding
          }]);
       } catch (e: any) {
          // Handle 403 Permission Denied
          if (!retry && (e.status === 403 || e.message?.includes('403') || e.message?.includes('permission'))) {
             console.warn("403 detected, attempting to select API key and retry...");
             await ensureApiKey(true);
             
             // Reconstruct history to restore context
             // Note: 'messages' state contains the current userMsg appended above. 
             // We need to pass everything EXCEPT the one we are about to retry sending.
             const history: Content[] = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
             }));
             
             // Recreate chat with new key context and history
             chatRef.current = createDirectorChat(history);
             return performSend(true);
          }

          console.error(e);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `System Error: ${e.message || "Could not connect to Director AI."}` }]);
       }
    };

    await performSend();
    setLoading(false);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderGrounding = (grounding: any) => {
    if (!grounding?.groundingChunks) return null;
    return (
       <div className="mt-2 text-[10px] bg-slate-800 p-2 rounded border border-slate-700">
         <strong className="text-cyan-400">Sources:</strong>
         <ul className="list-disc pl-4 mt-1 space-y-1">
           {grounding.groundingChunks.map((chunk: any, i: number) => {
             if (chunk.web) return <li key={i}><a href={chunk.web.uri} target="_blank" className="text-blue-400 hover:underline">{chunk.web.title}</a></li>;
             if (chunk.maps) return <li key={i}><a href={chunk.maps.uri} target="_blank" className="text-green-400 hover:underline">{chunk.maps.title}</a></li>; // Maps support? groundingChunks might differ
             return null;
           })}
         </ul>
       </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
       <div className="p-3 border-b border-slate-800 bg-slate-950">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Director's Assistant</h3>
          <p className="text-[9px] text-slate-500">Gemini 3 Pro • Thinking • Search • Maps</p>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               <div className={`max-w-[85%] p-3 rounded-lg text-xs ${msg.role === 'user' ? 'bg-cyan-900/50 text-cyan-100 border border-cyan-800' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                 {msg.text}
                 {msg.groundingMetadata && renderGrounding(msg.groundingMetadata)}
               </div>
            </div>
          ))}
          {loading && <div className="text-xs text-slate-500 italic ml-2">Thinking...</div>}
          <div ref={endRef} />
       </div>
       <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input 
            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            placeholder="Ask about lighting, locations..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
       </div>
    </div>
  );
};