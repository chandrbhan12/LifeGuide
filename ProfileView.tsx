import React, { useState } from 'react';
import { UserProfile, UserRole, Language, Gender } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const honorific = formData.gender === Gender.MALE ? 'Sir' : 'Ma\'am';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-500 h-full">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-800">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-40 sm:h-40 bg-blue-500/10 border-2 border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 text-4xl sm:text-6xl shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user-astronaut"></i>
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-white"></i>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({ ...formData, avatarUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1 sm:space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter">
                  {isEditing ? (
                    <input 
                      className="bg-slate-800 border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 w-full max-w-xs"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : `${formData.name}`}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 text-blue-500 font-mono text-[8px] sm:text-xs uppercase tracking-widest mt-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Active Designation: {honorific}
                </div>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-5 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {isEditing ? 'Sync Changes' : 'Modify Access'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
            <h3 className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-id-card"></i> Identity Metrics
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-slate-800/50">
                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Gender</span>
                {isEditing ? (
                  <select 
                    className="bg-slate-800 text-[10px] sm:text-xs rounded px-1"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                  >
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                ) : <span className="text-xs sm:text-sm text-white font-mono">{formData.gender} Designation</span>}
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-slate-800/50">
                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Age</span>
                {isEditing ? (
                  <input 
                    type="number"
                    className="bg-slate-800 text-right w-16 sm:w-20 rounded px-1 text-sm"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  />
                ) : <span className="text-xs sm:text-sm text-white font-mono">{formData.age} Solar Cycles</span>}
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2 border-b border-slate-800/50">
                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Role</span>
                {isEditing ? (
                  <select 
                    className="bg-slate-800 text-[10px] sm:text-xs rounded px-1"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : <span className="text-xs sm:text-sm text-white font-mono">{formData.role}</span>}
              </div>
              <div className="flex justify-between items-center py-1 sm:py-2">
                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">Language</span>
                {isEditing ? (
                  <select 
                    className="bg-slate-800 text-[10px] sm:text-xs rounded px-1"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value as Language})}
                  >
                    {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                ) : <span className="text-xs sm:text-sm text-white font-mono">{formData.language}</span>}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
            <h3 className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-truck-fast"></i> Logistics Protocol
            </h3>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold block mb-1">Shipping Designation</label>
              {isEditing ? (
                <textarea 
                  className="w-full bg-slate-800 border-none outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs min-h-[80px] sm:min-h-[100px]"
                  placeholder="Enter address..."
                  value={formData.shippingAddress || ''}
                  onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 italic min-h-[60px] sm:min-h-[80px]">
                  {formData.shippingAddress || 'No protocol established.'}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
            <h3 className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-brain"></i> Psychological Bio
            </h3>
            {isEditing ? (
              <textarea 
                className="w-full bg-slate-800 border-none outline-none focus:ring-1 focus:ring-blue-500 rounded p-3 sm:p-4 text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
                placeholder="Detail your personal mission..."
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            ) : (
              <div className="p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-white/5">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  {formData.bio || 'Data not synthesized. Update dossier to improve mapping.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center py-4 sm:py-6">
          <p className="text-[7px] sm:text-[8px] text-slate-600 font-mono uppercase tracking-[0.3em] sm:tracking-[0.4em]">
            Quantum ledger status: Synced
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;