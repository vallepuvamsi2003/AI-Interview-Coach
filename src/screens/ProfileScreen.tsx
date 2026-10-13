import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Layers,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level || '1-2 years');
  const [preferredRole, setPreferredRole] = useState(profile?.preferred_role || 'Full Stack Developer');
  const [skillsString, setSkillsString] = useState(profile?.skills?.join(', ') || 'React Native, TypeScript, Node.js');

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const skillsArr = skillsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateProfile({
        name,
        college,
        experience_level: experienceLevel as any,
        preferred_role: preferredRole,
        skills: skillsArr,
      });

      await refreshProfile();
      setMsg('Profile settings updated successfully!');
    } catch (err: any) {
      setMsg('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 px-4 py-5 space-y-4 pb-24 overflow-y-auto bg-[#F8F9FC]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Profile</h1>
        <p className="text-xs text-slate-500">Configure your professional preferences & skills</p>
      </div>

      {msg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{msg}</span>
        </div>
      )}

      {/* User Info Avatar Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] p-0.5 shadow-md shadow-indigo-200">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-[#6C63FF] text-xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[#6C63FF] font-semibold text-[10px]">
            {experienceLevel}
          </span>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3.5 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">College / University</label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. UC Berkeley, Stanford"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            >
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Preferred Role</label>
            <input
              type="text"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Skills (Comma-separated)</label>
          <input
            type="text"
            value={skillsString}
            onChange={(e) => setSkillsString(e.target.value)}
            placeholder="e.g. React Native, TypeScript, Node.js, MySQL"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full mt-2 bg-[#6C63FF] hover:bg-indigo-600 active:scale-[0.98] text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-indigo-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* Logout Action Card */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of AI Interview Coach</span>
        </button>
      </div>
    </div>
  );
};
