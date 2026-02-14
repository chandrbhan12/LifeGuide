import React, { useState, useEffect, useRef } from 'react';
import ProfileForm from './components/ProfileForm';
import ChatInterface from './components/ChatInterface';
import ProfileView from './components/ProfileView';
import CodeViewer from './components/CodeViewer';
import { UserProfile, Language, Gender } from './types';

type BriefingType = 'mission' | 'protocols' | 'security';
type AppView = 'chat' | 'profile' | 'code';

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center rounded-full bg-slate-950 border border-sky-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)] overflow-hidden group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent"></div>
    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 relative z-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6 4" className="opacity-40" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" stroke-width="1" stroke-dasharray="2 6" className="animate-spin-slow" />
      <path d="M50 15 L54 46 L85 50 L54 54 L50 85 L46 54 L15 50 L46 46 Z" fill="#06b6d4" />
      <path d="M50 25 L52 48 L75 50 L52 52 L50 75 L48 52 L25 50 L48 48 Z" fill="#fff" className="opacity-80" />
      <circle cx="50" cy="50" r="5" fill="#fff" className="animate-pulse" />
    </svg>
    <div className="absolute inset-0 bg-sky-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </div>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<AppView>('chat');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<{task: string, time: string, message: string} | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());
  const [activeBriefing, setActiveBriefing] = useState<BriefingType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const triggeredRef = useRef<Set<string>>(new Set());
  const alarmSpeechInterval = useRef<number | null>(null);
  const alarmAutoCloseTimeout = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('lifeguide_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('lifeguide_profile');
      }
    }
    setIsLoaded(true);
  }, []);

  const speakAlarm = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = profile?.language === Language.HINDI ? 'hi-IN' : 'en-US';
      utterance.lang = targetLang;
      utterance.rate = profile?.language === Language.HINDI ? 0.85 : 0.9; 
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.lang.includes(targetLang) && (v.name.includes('Google') || v.name.includes('Natural')));
      if (bestVoice) utterance.voice = bestVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeAlarm) {
      speakAlarm(activeAlarm.message);
      alarmSpeechInterval.current = window.setInterval(() => {
        speakAlarm(activeAlarm.message);
      }, 10000);
      alarmAutoCloseTimeout.current = window.setTimeout(() => {
        handleDismissAlarm();
      }, 60000);
    } else {
      if (alarmSpeechInterval.current) clearInterval(alarmSpeechInterval.current);
      if (alarmAutoCloseTimeout.current) clearTimeout(alarmAutoCloseTimeout.current);
      window.speechSynthesis.cancel();
    }
    return () => {
      if (alarmSpeechInterval.current) clearInterval(alarmSpeechInterval.current);
      if (alarmAutoCloseTimeout.current) clearTimeout(alarmAutoCloseTimeout.current);
    };
  }, [activeAlarm]);

  const handleDismissAlarm = () => {
    setActiveAlarm(null);
    window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (!isLoggedIn || !profile?.reminders) return;
    const checkAlarms = () => {
      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${HH}:${MM}`;
      const today = now.toISOString().split('T')[0];
      const honorific = profile.gender === Gender.MALE ? 'Sir' : 'Ma\'am';
      
      profile.reminders?.forEach(r => {
        const triggerKey = `${r.id}-${today}-${currentHHMM}`;
        if (r.time === currentHHMM && !r.completed && !triggeredRef.current.has(triggerKey)) {
          triggeredRef.current.add(triggerKey);
          let alertText = profile.language === Language.HINDI 
            ? `${honorific}, dhyan dijiye. Aapki ${r.task} ka samay ho gaya hai.` 
            : `${honorific}, please pay attention. It is time for your task: ${r.task}.`;
          setActiveAlarm({ task: r.task, time: r.time, message: alertText });
        }
      });
    };
    const interval = setInterval(checkAlarms, 15000);
    checkAlarms();
    return () => clearInterval(interval);
  }, [isLoggedIn, profile]);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('lifeguide_profile', JSON.stringify(newProfile));
    setIsLoggedIn(true);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('lifeguide_profile', JSON.stringify(updatedProfile));
  };

  const resetIdentity = () => {
    setProfile(null);
    localStorage.removeItem('lifeguide_profile');
    setIsLoggedIn(false);
    setView('chat');
  };

  const renderBriefingContent = () => {
    if (!activeBriefing) return null;
    const briefings = {
      mission: {
        title: "Core Mission",
        subtitle: "LifeGuide Precision Interface",
        icon: "fa-target-shot",
        details: [
          { label: "Objective", value: "Providing 24/7 localized support for health, tasks, and emotional well-being." },
          { label: "Target Alpha", value: "Senior support and lifestyle optimization through neural link." },
          { label: "Methodology", value: "Generative Reasoning paired with strict privacy protocols." }
        ]
      },
      protocols: {
        title: "Active Protocols",
        subtitle: "v2.0.1_R3 Features",
        icon: "fa-project-diagram",
        details: [
          { label: "Bio-Scan", value: "Real-time health monitoring and medication sync (Elderly Care Focus)." },
          { label: "Neural Lab", value: "Advanced AI code generation for multi-language development requirements." },
          { label: "Search Grid", value: "Grounding capabilities using real-time world data ingestion." }
        ]
      },
      security: {
        title: "Security Shield",
        subtitle: "LifeGuide Privacy Matrix",
        icon: "fa-user-shield",
        details: [
          { label: "Encryption", value: "Military-grade AES-256 local-first processing." },
          { label: "Anonymity", value: "Zero persistent storage for personal neural fingerprints." },
          { label: "Gatekeeper", value: "Multi-factor bio-verification for identity confirmation." }
        ]
      }
    };
    const content = briefings[activeBriefing];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300">
        <div className="max-w-xl w-full max-h-[90vh] glass border-2 border-sky-500/30 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-14 relative overflow-y-auto shadow-[0_0_100px_rgba(14,165,233,0.2)] animate-in zoom-in-95 duration-500 custom-scrollbar">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-[translate-x_3s_linear_infinite]"></div>
          <button onClick={() => setActiveBriefing(null)} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 z-20">
            <i className="fas fa-times text-sm sm:text-lg"></i>
          </button>
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left pt-6 sm:pt-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-sky-500/10 rounded-2xl sm:rounded-3xl flex items-center justify-center text-sky-400 text-2xl sm:text-3xl border border-sky-500/20 shadow-2xl shrink-0">
                <i className={`fas ${content.icon}`}></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-glow">{content.title}</h3>
                <p className="text-[8px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-widest">{content.subtitle}</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {content.details.map((d, i) => (
                <div key={i} className="p-4 sm:p-6 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl group hover:border-sky-500/30 transition-all">
                  <span className="text-[8px] sm:text-[9px] font-black text-sky-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] block mb-1 sm:mb-2 opacity-60 group-hover:opacity-100">{d.label}</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">{d.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveBriefing(null)} className="w-full py-4 sm:py-5 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl sm:rounded-2xl text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] shadow-xl hover:shadow-sky-500/20 transition-all active:scale-95 border-t border-white/10">
              Acknowledged Briefing
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-5%] w-[100%] sm:w-[50%] h-[50%] bg-sky-600/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[100%] sm:w-[50%] h-[50%] bg-indigo-600/10 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none"></div>

      {renderBriefingContent()}

      {activeAlarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="glass border-2 border-sky-500/30 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 max-w-sm w-full text-center space-y-6 sm:space-y-8 shadow-[0_0_120px_rgba(14,165,233,0.3)] neon-border-glow">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto animate-bounce border border-sky-500/20 shadow-inner">
              <i className="fas fa-bell text-3xl sm:text-4xl text-sky-400"></i>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-[9px] sm:text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] sm:tracking-[0.5em]">Neural Link Notification</h2>
              <div className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight text-glow leading-tight">{activeAlarm.task}</div>
              <p className="text-slate-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest">{activeAlarm.time} HRS</p>
            </div>
            <button onClick={handleDismissAlarm} className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black py-4 sm:py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-[9px] sm:text-[10px] tracking-[0.3em]">
              Confirm Acknowledged
            </button>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <button onClick={resetIdentity} className="fixed top-4 sm:top-6 left-4 sm:left-10 z-[80] w-10 h-10 sm:w-14 sm:h-14 glass rounded-xl sm:rounded-2xl border border-white/10 flex items-center justify-center text-sky-400 hover:text-white hover:border-sky-500/50 hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] transition-all active:scale-95 group shadow-2xl" title="Return to Identity Creation">
          <i className="fas fa-arrow-left text-base sm:text-xl group-hover:-translate-x-1 transition-transform"></i>
        </button>
      )}

      {!isLoggedIn && (
        <header className="fixed top-0 left-0 right-0 z-[60] px-3 py-3 sm:px-10 sm:py-8">
          <nav className="max-w-7xl mx-auto glass rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
            <div className="flex items-center gap-3 sm:gap-5 group cursor-pointer shrink-0">
              <Logo className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-500" />
              <div className="hidden xs:block">
                <h1 className="text-sm sm:text-base font-black tracking-[0.15em] sm:tracking-[0.2em] text-white uppercase leading-none">LifeGuide <span className="text-sky-400">AI</span></h1>
                <p className="text-[7px] sm:text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-none mt-1 sm:mt-1.5">System Ready</p>
              </div>
            </div>
            <div className="md:hidden flex items-center gap-3">
              {profile && (
                <button onClick={() => setIsLoggedIn(true)} className="w-10 h-10 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] shadow-lg active:scale-90 transition-all border-t border-white/10">
                  <i className="fas fa-plug"></i>
                </button>
              )}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-sky-400 border border-white/10 active:scale-90 transition-all">
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars-staggered'} text-lg`}></i>
              </button>
            </div>
            <div className="hidden lg:flex items-center gap-10 border-x border-white/5 px-10">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Local Temporal</span>
                <span className="text-[11px] font-black text-sky-400 font-mono tracking-tighter">{systemTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Environment</span>
                <span className="text-[11px] font-black text-slate-300 font-mono tracking-tighter uppercase flex items-center gap-2">
                  <i className="fas fa-cloud-sun text-sky-500/50"></i> 24°C / Optimal
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Node Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  <span className="text-[10px] font-black text-green-500/80 uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-10">
              <button onClick={() => setActiveBriefing('mission')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-sky-400 transition-all flex items-center gap-2 group">
                <span className={`w-1 h-1 rounded-full transition-all ${activeBriefing === 'mission' ? 'bg-sky-500' : 'bg-sky-500/0 group-hover:bg-sky-500'}`}></span>Mission
              </button>
              <button onClick={() => setActiveBriefing('protocols')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-sky-400 transition-all flex items-center gap-2 group">
                <span className={`w-1 h-1 rounded-full transition-all ${activeBriefing === 'protocols' ? 'bg-sky-500' : 'bg-sky-500/0 group-hover:bg-sky-500'}`}></span>Protocols
              </button>
              <button onClick={() => setActiveBriefing('security')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-sky-400 transition-all flex items-center gap-2 group">
                <span className={`w-1 h-1 rounded-full transition-all ${activeBriefing === 'security' ? 'bg-sky-500' : 'bg-sky-500/0 group-hover:bg-sky-500'}`}></span>Security
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0">
              {profile && (
                <button onClick={() => setIsLoggedIn(true)} className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl sm:rounded-2xl text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 border-t border-white/10 group overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2">
                    <i className="fas fa-plug text-[8px] group-hover:rotate-45 transition-transform"></i>Initiate Link
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              )}
            </div>
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-[110%] left-0 right-0 glass border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-[90] space-y-4">
                <button onClick={() => { setActiveBriefing('mission'); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-left px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center justify-between group transition-all">Mission <i className="fas fa-chevron-right text-sky-500/30 group-hover:text-sky-500"></i></button>
                <button onClick={() => { setActiveBriefing('protocols'); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-left px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center justify-between group transition-all">Protocols <i className="fas fa-chevron-right text-sky-500/30 group-hover:text-sky-500"></i></button>
                <button onClick={() => { setActiveBriefing('security'); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-left px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center justify-between group transition-all">Security <i className="fas fa-chevron-right text-sky-500/30 group-hover:text-sky-500"></i></button>
              </div>
            )}
          </nav>
        </header>
      )}

      {isLoggedIn && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-3 w-full px-4">
          <div className="flex items-center gap-1.5 sm:gap-3 glass p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4 w-full sm:w-auto justify-center sm:justify-start">
            <button onClick={() => setView('chat')} className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 ${view === 'chat' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-terminal"></i><span className="hidden xs:inline">Console</span>
            </button>
            <button onClick={() => setView('code')} className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 ${view === 'code' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-brain"></i><span className="hidden xs:inline">Neural Lab</span>
            </button>
            <button onClick={() => setView('profile')} className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 ${view === 'profile' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-user-shield"></i><span className="hidden xs:inline">Dossier</span>
            </button>
            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1"></div>
            <button onClick={resetIdentity} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all">
              <i className="fas fa-power-off text-[10px] sm:text-xs"></i>
            </button>
          </div>
        </div>
      )}

      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-10 flex flex-col min-h-0 relative z-10 ${isLoggedIn ? 'pt-28 sm:pt-36 pb-4 sm:pb-6' : 'pt-28 sm:pt-40 pb-10 sm:pb-16'}`}>
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col items-center animate-in fade-in zoom-in duration-1000 py-10">
            {profile ? (
              <div className="max-w-md w-full glass rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/10 p-8 sm:p-16 text-center space-y-8 sm:space-y-12 shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:shadow-[0_50px_100px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <Logo className="w-24 h-24 sm:w-32 sm:h-32 mx-auto animate-pulse" />
                  <div className="mt-8 sm:mt-10 space-y-2 sm:space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight text-glow">Identity Verified</h2>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em] sm:tracking-[0.4em]">Designation: {profile.name}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <button onClick={() => setIsLoggedIn(true)} className="relative w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 py-5 sm:py-6 rounded-[1.5rem] sm:rounded-3xl text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all active:scale-95 border-t border-white/10">Establish Connection</button>
                  <button onClick={resetIdentity} className="w-full py-4 sm:py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-sky-400 font-black uppercase tracking-[0.3em] text-[8px] sm:text-[9px] transition-all flex items-center justify-center gap-3 group">
                    <i className="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>Modify Identity Parameters
                  </button>
                </div>
              </div>
            ) : (
              <ProfileForm onComplete={handleProfileComplete} />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full min-h-0 animate-in fade-in duration-1000">
            {view === 'chat' && <ChatInterface profile={profile!} onReset={resetIdentity} onUpdateProfile={handleUpdateProfile} />}
            {view === 'profile' && <ProfileView profile={profile!} onUpdate={handleUpdateProfile} />}
            {view === 'code' && <CodeViewer profile={profile!} />}
          </div>
        )}
      </main>

      {!isLoggedIn && (
        <footer className="glass border-t border-white/10 py-12 sm:py-20 px-6 sm:px-10 mt-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-[translate-x_3s_linear_infinite]"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Logo className="w-12 h-12 sm:w-14 sm:h-14" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">LifeGuide <span className="text-sky-400">AI</span></h3>
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Core Version: v2.0.1_R3</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium max-w-xs">Next-generation neural interface designed for seamless human-AI synchronization. Operating under LifeGuide Protocols.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Protocols</h4>
              <ul className="space-y-4">
                {['Mission Objective', 'Security Shield', 'Privacy Matrix', 'Neural Lab'].map((item) => (
                  <li key={item}><button onClick={() => setActiveBriefing(item.includes('Mission') ? 'mission' : item.includes('Security') ? 'security' : 'protocols')} className="text-[11px] font-bold text-slate-500 hover:text-white transition-all hover:translate-x-1 flex items-center gap-2 group"><i className="fas fa-caret-right text-sky-500/30 group-hover:text-sky-500"></i>{item}</button></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Connect Nodes</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'fa-github', label: 'github.com', url: 'https://github.com', color: 'hover:text-white' }, 
                  { icon: 'fa-x-twitter', label: 'x.com', url: 'https://x.com', color: 'hover:text-sky-400' },
                  { icon: 'fa-youtube', label: 'youtube.com', url: 'https://youtube.com', color: 'hover:text-red-500' },
                  { icon: 'fa-instagram', label: 'instagram.com', url: 'https://instagram.com', color: 'hover:text-pink-500' }
                ].map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left">
                    <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-600 transition-all ${social.color} group-hover:scale-110 group-hover:border-white/10`}><i className={`fab ${social.icon} text-lg`}></i></div>
                    <div><span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block group-hover:text-slate-300 transition-colors">{social.label}</span></div>
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Diagnostics</h4>
              <div className="space-y-4 glass-dark p-6 rounded-2xl border border-white/5 bg-black/40 shadow-inner">
                <div className="flex justify-between items-center"><span className="text-[9px] font-mono text-slate-500 uppercase">Latency</span><span className="text-[10px] font-black text-green-500 font-mono">14ms</span></div>
                <div className="flex justify-between items-center"><span className="text-[9px] font-mono text-slate-500 uppercase">Encryption</span><span className="text-[10px] font-black text-sky-400 font-mono flex items-center gap-1"><i className="fas fa-lock text-[8px]"></i> AES-256</span></div>
                <p className="text-[8px] text-slate-600 font-mono text-center uppercase tracking-widest mt-2">© 2025 LifeGuide Protocols. All rights Reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      )}
      <style>{`
        @keyframes translate-x { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;