
import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile, Language, Reminder, Gender } from '../types';
import { generateLifeGuidance } from '../services/geminiService';

interface ChatInterfaceProps {
  profile: UserProfile;
  onReset: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, onReset, onUpdateProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('08:00');

  const honorific = profile.gender === Gender.MALE ? 'Sir' : 'Ma\'am';

  useEffect(() => {
    const greeting = profile.language === Language.HINDI 
      ? `Namaste ${honorific}, main LifeGuide hoon, aapka vyaktigat sahayak. Aaj main aapki kaise sahayata kar sakta hoon?` 
      : `Hello ${honorific}, I’m LifeGuide, your personal assistant. How can I help you today?`;

    setMessages([{ id: '1', role: 'assistant', content: greeting, timestamp: new Date() }]);
    
    setTimeout(() => {
      setIsBooting(false);
      speakText(greeting);
    }, 2000);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = profile.language === Language.HINDI ? 'hi-IN' : 'en-US';
      utterance.rate = profile.age > 55 ? 0.85 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (manualInput?: string) => {
    const text = manualInput || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await generateLifeGuidance(text, profile, history);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        links: response.links,
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(response.text);
    } catch (err) {
      const errTxt = `Link compromised, ${honorific}. Re-initializing communication channel...`;
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: errTxt, timestamp: new Date() }]);
      speakText(errTxt);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) return alert("System Mic Protocol Unrecognized.");
    const recognition = new SpeechRecognition();
    recognition.lang = profile.language === Language.HINDI ? 'hi-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.start();
  };

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const rem: Reminder = { id: `rem-${Date.now()}`, task: newTask, time: newTime, completed: false };
    onUpdateProfile({ ...profile, reminders: [...(profile.reminders || []), rem] });
    setNewTask('');
    setShowAddReminder(false);
    speakText(`Protocol ${newTask} synchronized for ${newTime} HRS, ${honorific}.`);
  };

  if (isBooting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center glass rounded-[2.5rem] lg:rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-[400px] lg:min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 to-indigo-600/10 animate-pulse"></div>
        <div className="relative flex flex-col items-center p-6 text-center">
          <div className="w-24 h-24 lg:w-32 lg:h-32 border-[4px] lg:border-[6px] border-sky-500/10 border-t-sky-500 rounded-full animate-spin shadow-[0_0_40px_rgba(14,165,233,0.3)]"></div>
          <div className="mt-8 lg:mt-12 text-[11px] lg:text-[14px] font-black text-sky-400 uppercase tracking-[0.4em] lg:tracking-[0.7em] animate-pulse text-glow">Syncing Neural Core...</div>
          <div className="mt-2 lg:mt-4 text-[7px] lg:text-[8px] font-mono text-slate-600 uppercase tracking-widest">LifeGuide Protocol-V2</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row glass rounded-[2rem] lg:rounded-[3.5rem] border border-white/10 overflow-hidden min-h-0 relative shadow-[0_30px_60px_rgba(0,0,0,0.6)] lg:shadow-[0_60px_120px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute bottom-24 right-6 z-[70] w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all border-t border-white/20"
      >
        <i className={`fas ${isSidebarOpen ? 'fa-xmark' : 'fa-list-check'} text-xl`}></i>
      </button>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20 relative z-10">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-10 lg:p-14 space-y-8 lg:space-y-12 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`} style={{ animationDelay: `${idx * 150}ms` }}>
              <div className={`group relative max-w-[95%] sm:max-w-[85%] lg:max-w-[70%] p-5 sm:p-8 lg:p-10 rounded-[1.75rem] lg:rounded-[2.75rem] border transition-all duration-500 ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-700 border-sky-400/30 text-white rounded-tr-none shadow-xl lg:shadow-2xl' 
                  : 'glass border-white/10 text-slate-100 rounded-tl-none shadow-xl lg:shadow-2xl'
              }`}>
                {m.role === 'assistant' && (
                  <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-white text-[10px] sm:text-sm shadow-2xl border-2 border-slate-900">
                    <i className="fas fa-heart text-sky-400 text-[10px] sm:text-sm"></i>
                  </div>
                )}
                <p className={`${profile.age > 55 ? 'text-lg lg:text-2xl' : 'text-sm lg:text-lg'} leading-relaxed font-semibold`}>{m.content}</p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-6 lg:mt-8 pt-5 lg:pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <span className="col-span-full text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] text-sky-400">Knowledge Ingestion:</span>
                    {m.links.map((l, i) => (
                      <a key={i} href={l.uri} target="_blank" className="flex items-center justify-between p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] lg:text-xs text-sky-300 transition-all truncate group/link">
                        <span className="truncate flex items-center gap-3">
                          <i className="fas fa-satellite text-[10px] opacity-50"></i>
                          {l.title}
                        </span>
                        <i className="fas fa-chevron-right text-[10px] -translate-x-3 opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all"></i>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-4 sm:gap-6 text-[11px] lg:text-[13px] text-sky-400 animate-pulse font-black uppercase tracking-[0.4em] ml-4 lg:ml-6">
              <div className="flex gap-1.5 sm:gap-2.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-500 rounded-full animate-bounce shadow-[0_0_10px_rgba(14,165,233,1)]"></span>
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-[0_0_10px_rgba(14,165,233,1)]"></span>
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s] shadow-[0_0_10px_rgba(14,165,233,1)]"></span>
              </div>
              LifeGuide is Thinking...
            </div>
          )}
        </div>

        <footer className="p-4 sm:p-8 lg:p-12 bg-black/40 border-t border-white/5 backdrop-blur-3xl relative z-20">
          <div className="max-w-5xl mx-auto flex gap-3 sm:gap-6 items-center">
            <button 
              onClick={startListening} 
              className={`w-12 h-12 sm:w-16 lg:w-20 sm:h-16 lg:h-20 rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex items-center justify-center transition-all shadow-2xl relative group shrink-0 ${
                isListening ? 'bg-red-600 text-white animate-pulse' : 'glass border border-white/10 text-sky-400 hover:border-sky-400/50 hover:bg-slate-800'
              }`}
            >
              {isListening && <span className="absolute inset-0 rounded-xl lg:rounded-[2rem] animate-ping bg-red-600/30"></span>}
              <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'} text-lg sm:text-2xl group-hover:scale-110 transition-transform`}></i>
            </button>
            <div className="flex-1 relative group min-w-0">
              <input 
                className={`w-full bg-slate-900/50 border border-white/10 rounded-2xl sm:rounded-[1.5rem] lg:rounded-[2.5rem] px-5 sm:px-8 lg:px-12 py-3.5 sm:py-5 lg:py-7 outline-none focus:border-sky-500/50 transition-all text-white placeholder-slate-700 shadow-inner ${
                  profile.age > 55 ? 'text-lg lg:text-2xl' : 'text-sm lg:text-lg'
                }`}
                placeholder={isListening ? "Listening..." : `Designate command, ${honorific}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              {!input && !isListening && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-4 pointer-events-none opacity-20">
                  <span className="text-[10px] font-black text-slate-500 border border-slate-700 px-4 py-1.5 rounded-xl uppercase tracking-[0.3em]">Transmit</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 sm:w-16 lg:w-20 sm:h-16 lg:h-20 bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 rounded-xl sm:rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 disabled:opacity-20 border-t border-white/10 shrink-0"
            >
              <i className="fas fa-location-arrow text-lg sm:text-2xl"></i>
            </button>
          </div>
        </footer>
      </div>

      <aside className={`
        fixed md:relative inset-y-0 right-0 w-[85%] md:w-72 lg:w-80 bg-[#0a0d14]/98 md:bg-[#0a0d14]/40 border-l border-white/10 p-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:gap-8 backdrop-blur-3xl z-50 transition-all duration-700 ease-out transform
        ${isSidebarOpen ? 'translate-x-0 shadow-[-50px_0_100px_rgba(0,0,0,0.8)]' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between border-b border-white/10 pb-6 lg:pb-8">
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <h3 className="text-[10px] lg:text-[11px] font-black text-sky-400 uppercase tracking-[0.3em] lg:tracking-[0.5em] flex items-center gap-3">
              <i className="fas fa-radar animate-pulse"></i> LifeLink Watch
            </h3>
            <span className="text-[7px] lg:text-[9px] font-mono text-slate-600 uppercase tracking-widest">Neural Stream</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <i className="fas fa-chevron-right text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 lg:space-y-8 pr-1 custom-scrollbar">
          <button 
            onClick={() => setShowAddReminder(!showAddReminder)} 
            className={`w-full py-4 lg:py-5 rounded-2xl lg:rounded-3xl border transition-all flex items-center justify-center gap-3 lg:gap-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl ${
              showAddReminder 
                ? 'bg-red-500/10 border-red-500/40 text-red-400' 
                : 'bg-gradient-to-r from-sky-600/10 to-indigo-600/10 border-sky-500/20 text-sky-400 hover:bg-sky-600/20'
            }`}
          >
            <i className={`fas ${showAddReminder ? 'fa-minus' : 'fa-plus'} text-xs`}></i>
            {showAddReminder ? 'Abort Protocol' : 'Sync New Task'}
          </button>

          {showAddReminder && (
            <form onSubmit={addReminder} className="space-y-4 lg:space-y-5 p-5 lg:p-6 glass border border-sky-500/30 rounded-[1.5rem] lg:rounded-[2rem] animate-in slide-in-from-top-6 duration-500">
              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Designation</label>
                <input type="text" placeholder="Task ID..." className="w-full bg-black/60 p-3 lg:p-4 text-xs lg:text-sm rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-800" value={newTask} onChange={e => setNewTask(e.target.value)} required />
              </div>
              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Time Phase</label>
                <input type="time" className="w-full bg-black/60 p-3 lg:p-4 text-xs lg:text-sm rounded-xl border border-white/5 outline-none focus:ring-1 focus:ring-sky-500" value={newTime} onChange={e => setNewTime(e.target.value)} required />
              </div>
              <button className="w-full py-3 lg:py-4 bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-white rounded-xl shadow-xl transition-all active:scale-95">Establish Link</button>
            </form>
          )}

          <div className="space-y-4 lg:space-y-6">
            {profile.reminders && profile.reminders.length > 0 ? (
              profile.reminders.map(r => (
                <div key={r.id} className="group p-5 lg:p-6 glass border border-white/10 rounded-[1.5rem] lg:rounded-[2rem] flex flex-col gap-3 lg:gap-4 hover:border-sky-500/50 transition-all hover:bg-white/[0.04] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="text-xs lg:text-sm font-black text-slate-200 uppercase tracking-tight truncate max-w-[80%]">{r.task}</div>
                    <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-sky-500 rounded-full group-hover:animate-ping shadow-[0_0_100px_rgba(14,165,233,1)]"></div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] lg:text-[11px] font-mono text-slate-500 border-t border-white/5 pt-3 lg:pt-4 relative z-10">
                    <span className="flex items-center gap-2 lg:gap-3"><i className="far fa-clock text-sky-500/40"></i> {r.time} HRS</span>
                    <span className="text-[8px] lg:text-[9px] font-black text-sky-500/30 group-hover:text-sky-400 uppercase tracking-widest transition-colors">Operational</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 lg:py-24 px-6 space-y-4 lg:space-y-6 opacity-20">
                <i className="fas fa-satellite-dish text-4xl lg:text-5xl mb-2 block animate-pulse"></i>
                <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] leading-relaxed">System scan complete.<br/>Zero active tasks.</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 lg:pt-8 border-t border-white/10 text-center">
          <p className="text-[8px] lg:text-[9px] font-mono text-slate-700 uppercase tracking-[0.3em] lg:tracking-[0.4em]">Neural Encryption active</p>
          <p className="text-[7px] lg:text-[8px] text-slate-800 font-mono mt-2 tracking-widest uppercase">NODE: LIFEGUIDE-CORE-V2</p>
        </div>
      </aside>
    </div>
  );
};

export default ChatInterface;
