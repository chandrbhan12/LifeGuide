import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Language, Gender } from '../types';

interface CodeViewerProps {
  profile: UserProfile;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ profile }) => {
  const [mode, setMode] = useState<'source' | 'generator'>('generator');
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [selectedLang, setSelectedLang] = useState('JavaScript');
  const [requirement, setRequirement] = useState('');
  const [generatedCode, setGeneratedCode] = useState('// Your neural code will appear here...');
  const [isGenerating, setIsGenerating] = useState(false);

  const honorific = profile.gender === Gender.MALE ? 'Sir' : 'Ma\'am';

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Rust', 'Go', 'PHP', 'Swift', 'Ruby'
  ];

  const sourceFiles = {
    'App.tsx': `// Core application logic and layout
const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col...">
      {/* HUD & Navigation Logic */}
    </div>
  );
};`,
    'ChatInterface.tsx': `// LifeGuide Neural Conversation Interface
const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const handleSend = async () => {
    // Neural Link Activation
    const response = await generateLifeGuidance(input, profile, history);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row glass...">
      {/* Terminal Console Rendering */}
    </div>
  );
};`,
    'geminiService.ts': `// Google GenAI Integration
export const generateLifeGuidance = async (userInput, profile, history) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    // System Instruction Injection
  });
};`,
  };

  const handleGenerateCode = async () => {
    if (!requirement.trim()) return;
    setIsGenerating(true);
    setGeneratedCode('// Initializing Neural Lab... Gathering logic fragments...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a clean, efficient, and well-documented code snippet in ${selectedLang} for the following requirement: ${requirement}`,
        config: {
          systemInstruction: `You are a world-class senior software engineer at LifeGuide AI Labs. 
          Provide ONLY the code block without extra conversational text. 
          Address the user as ${honorific} in the code comments if appropriate.`,
        },
      });

      const text = response.text || `// Error: Could not synthesize logic, ${honorific}.`;
      setGeneratedCode(text.replace(/```[a-z]*\n|```/gi, ''));
    } catch (error) {
      setGeneratedCode(`// Link compromised, ${honorific}. Generation failed.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row glass rounded-[2rem] lg:rounded-[3.5rem] border border-white/10 overflow-hidden min-h-0 relative shadow-[0_60px_120px_rgba(0,0,0,0.7)] animate-in fade-in duration-700">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/10 p-6 sm:p-8 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]">Neural Lab</h3>
            <p className="text-[8px] font-mono text-slate-600 uppercase">LG-PROTOCOL-V2 / internal-dev</p>
          </div>
          
          <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5">
            <button 
              onClick={() => setMode('generator')}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'generator' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setMode('source')}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'source' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Source
            </button>
          </div>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
          {mode === 'source' ? (
            <div className="space-y-2">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">System Core Files</span>
              {Object.keys(sourceFiles).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl text-[10px] sm:text-xs font-mono transition-all flex items-center gap-3 ${
                    activeFile === fileName 
                      ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <i className={`fas ${fileName.endsWith('.ts') ? 'fa-bolt text-indigo-400' : 'fa-react text-sky-400'} text-[10px]`}></i>
                  {fileName}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Language Matrix</label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`py-2.5 rounded-xl text-[9px] font-mono transition-all border ${
                        selectedLang === lang 
                        ? 'bg-sky-500/20 border-sky-500/50 text-white shadow-inner' 
                        : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Neural Prompt</label>
                <textarea 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-[11px] text-white outline-none focus:border-sky-500/50 transition-all min-h-[120px] placeholder-slate-700"
                  placeholder={`Designate your requirement, ${honorific}... e.g., "Build a weather API fetcher"`}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                />
                <button 
                  onClick={handleGenerateCode}
                  disabled={isGenerating || !requirement.trim()}
                  className="w-full py-4 bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 rounded-xl text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-xl transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-brain'}`}></i>
                  {isGenerating ? 'Synthesizing...' : 'Generate Protocol'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Lab Uptime</span>
            <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest font-mono">100% Stable</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 w-full animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* Editor Area */}
      <main className="flex-1 flex flex-col bg-slate-950/40 relative overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 bg-black/20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              {mode === 'source' ? `Editor — System/${activeFile}` : `Neural Outpost — Generated/${selectedLang}`}
            </span>
          </div>
          {mode === 'generator' && !isGenerating && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                alert(`${honorific}, code copied to local clipboard.`);
              }}
              className="text-[9px] font-black text-sky-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              <i className="fas fa-copy mr-2"></i>Copy Link
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-auto p-6 sm:p-10 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-300">
            <code className="block whitespace-pre-wrap">
              {(mode === 'source' ? sourceFiles[activeFile as keyof typeof sourceFiles] : generatedCode)
                .split('\n').map((line, i) => (
                <div key={i} className="flex gap-6 group hover:bg-white/[0.02] transition-colors">
                  <span className="w-8 text-right text-slate-700 select-none group-hover:text-slate-500">{i + 1}</span>
                  <span className="text-glow-sm">
                    {line.includes('//') ? (
                      <span className="text-slate-600 italic">{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
        
        <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span>UTF-8</span>
            <span>{mode === 'source' ? 'TypeScript React' : selectedLang}</span>
            <span className="flex items-center gap-2">
              <i className="fas fa-code-branch"></i> {mode === 'source' ? 'System Core' : 'Synthesized Snippet'}
            </span>
          </div>
          <div className="text-sky-500/50">
            Node ID: {Math.random().toString(16).substring(2, 8).toUpperCase()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeViewer;