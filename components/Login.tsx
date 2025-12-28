
import React, { useState } from 'react';
import { PROFESSION_TO_VECTOR } from '../constants';

interface LoginProps {
  onLogin: (username: string, profession: string, vector: any, email?: string, phone?: string, isRegistered?: boolean) => void;
  mode?: 'initial' | 'milestone';
  currentUsername?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, mode = 'initial', currentUsername = '' }) => {
  const [username, setUsername] = useState(currentUsername);
  const [phone, setPhone] = useState('');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [linkedEmail, setLinkedEmail] = useState('');

  const handleStart = () => {
    if (mode === 'initial') {
      if (username) {
        onLogin(username, '探索者', PROFESSION_TO_VECTOR['Student'], undefined, undefined, false);
      }
    } else {
      if (isGoogleLinked || phone.length >= 8) {
        onLogin(username, '探索者', PROFESSION_TO_VECTOR['Student'], linkedEmail || undefined, phone || undefined, true);
      }
    }
  };

  const simulateGoogleLogin = () => {
    setIsGoogleLinked(true);
    setLinkedEmail(`${username.toLowerCase().replace(/\s/g, '') || 'user'}@gmail.com`);
  };

  const isInitialReady = username.length > 0;
  const isMilestoneReady = isGoogleLinked || phone.length >= 8;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-600/20 mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm36.44-92.66-48-32a8,8,0,0,0-12.44,6.66v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32Z"></path></svg>
        </div>
        <h1 className="text-5xl font-black tracking-tighter italic uppercase">
          DIAL<span className="text-blue-600">OGUE</span>
        </h1>
        <p className="text-zinc-500 font-bold tracking-[0.2em] uppercase text-[10px]">
          {mode === 'initial' ? 'Speak. Now.' : 'Identity Milestone Unlocked'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-8">
        {mode === 'initial' ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">你的代号 (Nickname)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如: Alan"
                className="w-full bg-zinc-900 border border-white/5 rounded-3xl px-8 py-5 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
              />
            </div>
            <button 
              onClick={handleStart}
              disabled={!isInitialReady}
              className="w-full py-6 bg-white text-black rounded-full font-black text-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 shadow-2xl"
            >
              即刻开启
            </button>
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-medium">3秒入场 · 300母句发声</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-1000">
            <div className="text-center space-y-2">
              <p className="text-blue-400 font-bold text-sm">恭喜！你已坚持开口 3 天</p>
              <p className="text-zinc-500 text-[11px] leading-relaxed">为了确保你的 300 母句进度不丢失，<br/>请锁定你的发声身份。</p>
            </div>
            
            <div className="space-y-4 pt-4">
              {!isGoogleLinked ? (
                <button 
                  onClick={simulateGoogleLogin}
                  className="w-full py-5 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="#EA4335" d="M128 128l-8 32-32 8-8-32 32-8z"/><path fill="#FBBC05" d="M128 128l32-8 8 32-32 8-8-32z"/><path fill="#34A853" d="M128 128l-32-8-8-32 32-8 8 32z"/><path fill="#4285F4" d="M128 128l8-32 32-8-8 32-32 8z"/><path d="M228 128c0-9-1-17-2-25H128v48h56c-2 13-10 24-21 32v26h34c20-19 31-46 31-81z" fill="#4285F4"/><path d="M128 230c28 0 51-9 68-25l-34-26c-9 6-21 10-34 10-26 0-48-18-56-42H37v27c17 35 54 56 91 56z" fill="#34A853"/><path d="M72 147c-2-6-3-12-3-19s1-13 3-19V82H37c-8 15-12 31-12 46s4 31 12 46l35-27z" fill="#FBBC05"/><path d="M128 74c15 0 29 5 40 16l30-30c-19-17-44-28-70-28-37 0-74 21-91 56l35 27c8-24 30-41 56-41z" fill="#EA4335"/></svg>
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Google 邮箱锁定</span>
                </button>
              ) : (
                <div className="w-full py-5 bg-blue-600/10 border border-blue-600/30 rounded-3xl flex items-center justify-center gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#60a5fa" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{linkedEmail}</span>
                </div>
              )}

              <div className="relative group">
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="手机号码"
                  disabled={isGoogleLinked}
                  className={`w-full bg-zinc-900 border border-white/5 rounded-3xl px-6 py-5 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700 ${isGoogleLinked ? 'opacity-20 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={!isMilestoneReady}
              className="w-full py-6 bg-blue-600 text-white rounded-full font-black text-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 shadow-2xl mt-4"
            >
              锁定并继续
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
