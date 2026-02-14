import React, { useState } from 'react';
import { UserRole, Language, UserProfile, Reminder, Gender } from '../types';

interface ProfileFormProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [medTask, setMedTask] = useState('');
  const [medTime, setMedTime] = useState('08:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const reminders: Reminder[] = [];
      if (medTask.trim()) {
        reminders.push({ id: `med-${Date.now()}`, task: medTask, time: medTime, completed: false });
      }
      onComplete({ name, age, gender, role, language, reminders });
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto glass rounded-[2.5rem] sm:rounded-[3rem] border border-white/10 p-6 sm:p-14 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-sky-600/5 blur-[80px] sm:blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-600/5 blur-[80px] sm:blur-[100px] pointer-events-none"></div>
      
      <div className="relative">
        <div className="text-center space-y-6 sm:space-y-8 mb-10 sm:mb-14">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto border border-sky-500/20 text-sky-400 text-xl sm:text-2xl shadow-xl">
            <i className="fas fa-id-badge"></i>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight text-glow">Identity Creation</h2>
            <div className="max-w-xs mx-auto space-y-3">
              <div className="h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent"></div>
              <p className="text-[10px] sm:text-xs font-mono text-sky-500 uppercase tracking-[0.4em]">
                Initialize Protocol LG-2025
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 sm:ml-2">User Identification</label>
            <input
              required
              type="text"
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-5 text-sm text-white outline-none focus:border-sky-500/50 transition-all shadow-inner placeholder-slate-700"
              placeholder="Designate Full Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 sm:ml-2">Gender Designation</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Gender).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3.5 px-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    gender === g
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-950/50 text-slate-500 border-white/5 hover:border-white/20'
                  }`}
                >
                  <i className={`fas ${g === Gender.MALE ? 'fa-mars' : 'fa-venus'}`}></i>
                  {g} Mode
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 sm:ml-2">Bios Age</label>
              <input
                required
                type="number"
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-5 text-sm text-white outline-none focus:border-sky-500/50 transition-all shadow-inner"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 sm:ml-2">Interface Lang</label>
              <select
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-5 text-sm text-white outline-none focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value={Language.ENGLISH}>English Mode</option>
                <option value={Language.HINDI}>Hindi Mode</option>
                <option value={Language.HINGLISH}>Hinglish Mode</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 sm:ml-2">Occupational Designation</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {Object.values(UserRole).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 sm:py-4 px-2 rounded-lg sm:rounded-xl border text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${
                    role === r
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-950/50 text-slate-500 border-white/5 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {age > 50 && (
            <div className="p-4 sm:p-6 bg-sky-500/5 border border-sky-500/20 rounded-[1.5rem] sm:rounded-[2rem] space-y-4 sm:space-y-5 animate-in slide-in-from-top-4">
              <h3 className="text-[9px] sm:text-[10px] font-black text-sky-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center gap-2 sm:gap-3">
                <i className="fas fa-heart-pulse"></i> Maintenance Sub-Protocol
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Medicine / Task"
                  className="bg-black/40 border border-white/5 p-3.5 sm:p-4 rounded-xl text-[10px] sm:text-xs text-white outline-none focus:border-sky-500/40"
                  value={medTask}
                  onChange={(e) => setMedTask(e.target.value)}
                />
                <input
                  type="time"
                  className="bg-black/40 border border-white/5 p-3.5 sm:p-4 rounded-xl text-[10px] sm:text-xs text-white outline-none focus:border-sky-500/40"
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white font-black py-4 sm:py-6 rounded-xl sm:rounded-[1.5rem] shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all active:scale-[0.98] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-sm border-t border-white/10"
          >
            Authorize Life Protocol
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;