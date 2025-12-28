
import React from 'react';
import { UserProfile } from '../types';
import { INITIAL_SOUND_CARDS } from '../constants';

interface ProfileProps {
  user: UserProfile;
  exposedAtomsCount: number;
  totalAtomsCount: number;
  exposedSoundsCount: number;
  onLogout: () => void;
  onUpdateSetting: (key: 'theme' | 'language', value: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  exposedAtomsCount, 
  totalAtomsCount,
  exposedSoundsCount, 
  onLogout, 
  onUpdateSetting
}) => {
  const isCn = user.language === 'cn';
  const isDark = user.theme === 'dark';

  return (
    <div className={`w-full max-w-md py-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      {/* Header Info */}
      <div className="flex items-center gap-6 px-4">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 border-4 ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-center shadow-2xl relative`}>
          <span className="text-3xl font-black text-white">{user.username.charAt(0).toUpperCase()}</span>
          {!user.isRegistered && (
            <div className="absolute -bottom-1 -right-1 bg-zinc-800 text-zinc-400 text-[8px] font-bold px-2 py-1 rounded-full border border-white/5 uppercase">Guest</div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black tracking-tighter">{user.username}</h2>
          <div className="flex flex-col gap-1 mt-1">
            <div className={`flex items-center gap-2 text-[9px] font-bold ${isDark ? 'text-zinc-500' : 'text-slate-400'} uppercase tracking-widest`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-103.18,0L26.34,218.34a8,8,0,0,0,11.32,11.32L128,139.31l80.34,80.35a8,8,0,0,0,11.32,0A8,8,0,0,0,229.66,218.34ZM128,120a56,56,0,1,1,56-56A56.06,56.06,0,0,1,128,120Z"></path></svg>
              {user.isRegistered ? (user.email || user.phone) : (isCn ? '尚未锁定身份' : 'IDENTITY NOT LOCKED')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-[2rem] space-y-1`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{isCn ? '母句积累' : 'Matrix Progress'}</p>
          <p className="text-3xl font-black">{exposedAtomsCount}<span className={`text-xs ml-1 ${isDark ? 'text-zinc-600' : 'text-slate-300'}`}>/{totalAtomsCount}</span></p>
        </div>
        <div className={`${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-[2rem] space-y-1`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{isCn ? '发声节点' : 'Sound Nodes'}</p>
          <p className="text-3xl font-black">{exposedSoundsCount}<span className={`text-xs ml-1 ${isDark ? 'text-zinc-600' : 'text-slate-300'}`}>/{INITIAL_SOUND_CARDS.length}</span></p>
        </div>
      </div>

      {/* Settings Section */}
      <section className="space-y-4 px-2">
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] ml-2 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>{isCn ? '偏好设置' : 'Preferences'}</h3>
        <div className={`${isDark ? 'bg-zinc-900/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border p-6 rounded-[2.5rem] space-y-6`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">{isCn ? '色彩模式' : 'Theme'}</span>
            <div className={`p-1 rounded-full flex gap-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
              <button 
                onClick={() => onUpdateSetting('theme', 'light')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${!isDark ? 'bg-white shadow-sm text-blue-600' : 'text-zinc-500'}`}
              >
                {isCn ? '浅色' : 'Light'}
              </button>
              <button 
                onClick={() => onUpdateSetting('theme', 'dark')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${isDark ? 'bg-zinc-900 text-blue-500' : 'text-slate-400'}`}
              >
                {isCn ? '深色' : 'Dark'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">{isCn ? '系统语言' : 'Language'}</span>
            <div className={`p-1 rounded-full flex gap-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
              <button 
                onClick={() => onUpdateSetting('language', 'cn')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${user.language === 'cn' ? (isDark ? 'bg-zinc-900 text-blue-500' : 'bg-white shadow-sm text-blue-600') : (isDark ? 'text-zinc-500' : 'text-slate-400')}`}
              >
                中英
              </button>
              <button 
                onClick={() => onUpdateSetting('language', 'en')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${user.language === 'en' ? (isDark ? 'bg-zinc-900 text-blue-500' : 'bg-white shadow-sm text-blue-600') : (isDark ? 'text-zinc-500' : 'text-slate-400')}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* McKee Quote Section */}
      <section className="px-4 pt-10">
        <div className={`p-8 rounded-[3rem] border border-dashed transition-all ${isDark ? 'border-zinc-800 bg-zinc-900/10' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex flex-col gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={isDark ? "#3f3f46" : "#cbd5e1"} viewBox="0 0 256 256"><path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72Zm116,0v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H156a16,16,0,0,1-16-16V72a16,16,0,0,1,16-16h60A16,16,0,0,1,232,72Z"></path></svg>
            <p className={`text-sm leading-relaxed font-serif italic ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Dialogue is not about what characters say, but what they do to get what they want.
            </p>
            <p className={`text-xs leading-relaxed font-bold ${isDark ? 'text-blue-400/80' : 'text-blue-600/80'}`}>
              对白不是表达思想，而是争夺行动结果。
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent"></div>
              <span className={`px-4 text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                —— Dialogue  McKee
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pt-4 pb-12">
        <button 
          onClick={onLogout}
          className={`w-full py-5 border rounded-3xl text-sm font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-900 border-red-900/20 text-red-500 hover:bg-red-900/10' : 'bg-white border-red-100 text-red-500 hover:bg-red-50'}`}
        >
          {isCn ? '退出并重置' : 'Reset Account'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
