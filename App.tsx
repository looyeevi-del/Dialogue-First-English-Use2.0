
// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, VerbalAtom, SoundCard, AppView, GenerationSlot } from './types';
import { MOTHER_ATOMS, INITIAL_SOUND_CARDS, BOUNDARY_THEMES, GENERATION_SLOTS } from './constants';
import { DialogueSession, createPcmBlob, playTTS, generateAtomForSlot } from './services/geminiService';
import Navigation from './components/Navigation';
import MicButton from './components/MicButton';
import Login from './components/Login';
import Profile from './components/Profile';

const FREE_SOUND_CARD_LIMIT = 3;

/**
 * 辅助函数：将母句列表重新排序为“日常、对白、日常、对白”交替模式
 */
const alternateAtoms = (list: VerbalAtom[]) => {
  const daily = list.filter(a => a.sample_pool === '日常生活');
  const dialogue = list.filter(a => a.sample_pool === '对白·行动原子');
  const result: VerbalAtom[] = [];
  const maxLen = Math.max(daily.length, dialogue.length);
  for (let i = 0; i < maxLen; i++) {
    if (daily[i]) result.push(daily[i]);
    if (dialogue[i]) result.push(dialogue[i]);
  }
  return result;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>('login');
  // 初始母句即应用交替逻辑
  const [atoms, setAtoms] = useState<VerbalAtom[]>(alternateAtoms(MOTHER_ATOMS));
  const [currentAtomIndex, setCurrentAtomIndex] = useState(0);
  const [responseLog, setResponseLog] = useState<string[]>([]);
  const [exposedSounds, setExposedSounds] = useState<string[]>([]);
  const [exposedAtoms, setExposedAtoms] = useState<string[]>([]);
  const [practicingSound, setPracticingSound] = useState<SoundCard | null>(null);
  const [isSecretMode, setIsSecretMode] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 单句发声累积状态
  const [atomSpeakCount, setAtomSpeakCount] = useState(0);

  // 练习状态
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const sessionRef = useRef<DialogueSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dialogue_user');
    const savedAtoms = localStorage.getItem('generated_atoms');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as UserProfile;
      setUser(parsedUser);
      setView('home');
      
      if (savedAtoms) {
        setAtoms(alternateAtoms(JSON.parse(savedAtoms)));
      }

      const savedExposedAtoms = localStorage.getItem('exposed_atoms');
      const savedExposedSounds = localStorage.getItem('exposed_sounds');
      if (savedExposedAtoms) setExposedAtoms(JSON.parse(savedExposedAtoms));
      if (savedExposedSounds) setExposedSounds(JSON.parse(savedExposedSounds));
    } else {
      setView('login');
    }
  }, []);

  // Intelligence Trigger: Generate content when a new user enters
  const triggerMatrixGeneration = async (profession: string) => {
    setIsGenerating(true);
    // 保持基础 300 句，但利用 Gemini 为特定 Slot 生成更符合该职业的变体
    const newAtoms: VerbalAtom[] = [...MOTHER_ATOMS];
    
    // 优先为前 10 个压力位生成职业定制句
    const prioritySlots = GENERATION_SLOTS.slice(0, 10); 
    
    for (const slot of prioritySlots) {
      const atom = await generateAtomForSlot(profession, slot);
      if (atom) {
        const idx = newAtoms.findIndex(a => a.slotId === slot.id);
        if (idx !== -1) newAtoms[idx] = atom;
      }
    }
    
    // 生成完毕后再次应用交替排序逻辑
    const finalAtoms = alternateAtoms(newAtoms);
    setAtoms(finalAtoms);
    localStorage.setItem('generated_atoms', JSON.stringify(finalAtoms));
    setIsGenerating(false);
  };

  useEffect(() => {
    if (exposedAtoms.length > 0) {
      localStorage.setItem('exposed_atoms', JSON.stringify(exposedAtoms));
    }
    if (exposedSounds.length > 0) {
      localStorage.setItem('exposed_sounds', JSON.stringify(exposedSounds));
    }
  }, [exposedAtoms, exposedSounds]);

  useEffect(() => {
    if (user) {
      sessionRef.current = new DialogueSession("AI Partner");
      sessionRef.current.connect(
        (text) => {
          setResponseLog(prev => [...prev.slice(-3), text]);
          handleCaught();
        },
        () => setResponseLog(prev => [...prev, "[Interrupted]"])
      );
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      document.body.style.backgroundColor = user.theme === 'dark' ? '#0a0a0a' : '#f8fafc';
    }
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, [user]);

  const handleCaught = () => {
    setIsCaught(true);
    setAtomSpeakCount(prev => Math.min(10, prev + 1));
    setTimeout(() => {
      setIsCaught(false);
      // 如果达到10次，也可以自动切下一句，但目前由用户决定
      if (view === 'dialogue' && !practicingSound) {
        // nextAtom(); // 注释掉，让用户多说几次累积
      }
    }, 1500);
  };

  useEffect(() => {
    if (practicingSound && isRecording && !isSecretMode) {
      const pacePerSentence = Math.max(3, practicingSound.practiceLine.split(' ').length * 0.5); 
      setTimer(pacePerSentence);
      
      timerRef.current = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 0.1) {
            handleRepComplete();
            return pacePerSentence;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [practicingSound, isRecording, isSecretMode]);

  const handleRepComplete = () => {
    setCurrentRep(prev => {
      if (prev >= 5) {
        setCurrentSet(s => Math.min(10, s + 1));
        return 1;
      }
      return prev + 1;
    });
  };

  const handleUpdateSetting = (key: 'theme' | 'language', value: string) => {
    if (user) {
      const updatedUser = { ...user, [key]: value };
      setUser(updatedUser);
      localStorage.setItem('dialogue_user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dialogue_user');
    localStorage.removeItem('exposed_atoms');
    localStorage.removeItem('exposed_sounds');
    localStorage.removeItem('generated_atoms');
    setUser(null);
    setExposedSounds([]);
    setExposedAtoms([]);
    setAtoms(alternateAtoms(MOTHER_ATOMS));
    setView('login');
  };

  const handlePlayExample = async (text: string) => {
    if (!audioContextRef.current) return;
    setIsPlayingTTS(true);
    await playTTS(text, audioContextRef.current);
    setIsPlayingTTS(false);
  };

  const nextAtom = () => {
    setCurrentAtomIndex((prev) => (prev + 1) % atoms.length);
    setResponseLog([]);
    setAtomSpeakCount(0); // 切换句子时重置计数器
  };

  const handleAudioData = (data: Float32Array) => {
    sessionRef.current?.sendAudio(createPcmBlob(data));
    if (practicingSound) {
      if (!exposedSounds.includes(practicingSound.id)) {
        setExposedSounds(prev => [...prev, practicingSound.id]);
      }
    } else {
      const currentAtom = atoms[currentAtomIndex];
      if (!exposedAtoms.includes(currentAtom.id)) {
        setExposedAtoms(prev => [...prev, currentAtom.id]);
      }
    }
  };

  const startPractice = (card: SoundCard, secret: boolean) => {
    setPracticingSound(card);
    setIsSecretMode(secret);
    setCurrentSet(1);
    setCurrentRep(1);
  };

  const renderHighlightedText = (text: string, keywords: string[], isMcKee: boolean) => {
    if (!keywords || keywords.length === 0) return text;
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return <span key={i} className={isMcKee ? 'text-violet-400' : 'text-blue-500'}>{part}</span>;
      }
      return part;
    });
  };

  // 获取开口状态文字
  const getSpeakStatusText = (count: number) => {
    if (count === 0) return "没开口";
    if (count <= 2) return "开始了";
    if (count <= 5) return "开口了";
    if (count <= 9) return "还不错";
    return "很好了";
  };

  if (view === 'login' || !user) return <Login onLogin={(u, p, v, e, ph, r) => {
    const newUser: UserProfile = {
      username: u, profession: p || 'Explorer', vector: v, exposedSounds: [], exposedAtoms: [],
      theme: 'dark', language: 'cn', email: e, phone: ph, isRegistered: r || false, createdAt: Date.now()
    };
    setUser(newUser);
    localStorage.setItem('dialogue_user', JSON.stringify(newUser));
    setView('home');
    triggerMatrixGeneration(p || 'Explorer');
  }} mode="initial" />;

  if (view === 'milestone') return <Login onLogin={(u, p, v, e, ph, r) => {
    const newUser: UserProfile = {
      ...user, email: e, phone: ph, isRegistered: r || true
    };
    setUser(newUser);
    localStorage.setItem('dialogue_user', JSON.stringify(newUser));
    setView('sound-cards');
  }} mode="milestone" currentUsername={user.username} />;

  const isCn = user.language === 'cn';
  const isDark = user.theme === 'dark';
  const currentAtom = atoms[currentAtomIndex];
  // 此时 atoms 已经是交替顺序，sample_pool 会在 '日常生活' 和 '对白·行动原子' 之间切换
  const isCurrentMcKee = currentAtom.sample_pool === '对白·行动原子';
  const daysActive = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <main className={`min-h-screen pb-24 flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {!practicingSound && (
        <header className={`p-6 flex justify-between items-center border-b animate-in fade-in slide-in-from-top-4 duration-500 ${isDark ? 'border-white/5' : 'border-slate-200 bg-white/50 backdrop-blur-md'}`}>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter italic uppercase">DIAL<span className="text-blue-500">OGUE</span></h1>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                {isCn ? `开口第 ${daysActive} 天` : `DAY ${daysActive} OF SPEAKING`}
              </span>
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500">
                  Matrix Mapping...
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                  {isCn ? '发声占比' : 'Exposure'}
                </p>
                <p className="text-sm font-black text-blue-400">{Math.round((exposedAtoms.length / atoms.length) * 100)}%</p>
              </div>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center relative ${isDark ? 'border-zinc-800' : 'border-slate-200 bg-white'}`}>
                 <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="3" />
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#3b82f6" strokeWidth="3" 
                            strokeDasharray={113} 
                            strokeDashoffset={113 - (exposedAtoms.length / atoms.length) * 113} />
                 </svg>
                 <span className={`text-[10px] font-bold z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{exposedAtoms.length}</span>
              </div>
            </div>
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {isCaught && (
          <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 text-white px-12 py-6 rounded-full font-black text-4xl shadow-2xl flex items-center gap-4 shadow-blue-500/50">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>
               {isCn ? '已接住！' : 'CAUGHT!'}
            </div>
          </div>
        )}

        {practicingSound ? (
            <div className="w-full max-w-md py-6 flex flex-col items-center justify-between min-h-[70vh] animate-in zoom-in-95 duration-500">
                <div className="w-full flex justify-between items-center px-4">
                  <button onClick={() => setPracticingSound(null)} className={`${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} transition-colors flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest`}>
                    ← {isCn ? '中断' : 'Quit'}
                  </button>
                  {!isSecretMode && (
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className={`text-[8px] font-black uppercase tracking-tighter ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Sets</p>
                        <p className="text-lg font-black">{currentSet}/10</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-[8px] font-black uppercase tracking-tighter ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Reps</p>
                        <p className="text-lg font-black text-blue-500">{currentRep}/5</p>
                      </div>
                    </div>
                  )}
                  {isSecretMode && (
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{isCn ? '偷偷练模式' : 'SECRET MODE'}</span>
                  )}
                </div>

                <div className="text-center space-y-8 px-4">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">
                        {isCn && practicingSound.targetCn ? practicingSound.targetCn : practicingSound.target}
                      </span>
                      <h1 className="text-4xl font-black leading-[1.1] tracking-tighter">{practicingSound.practiceLine}</h1>
                      <button 
                          onClick={() => handlePlayExample(practicingSound.practiceLine)}
                          disabled={isPlayingTTS}
                          className={`mx-auto p-4 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'} ${isPlayingTTS ? 'opacity-50' : ''}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm45.64-118a8,8,0,0,1,11.31,0,40,40,0,0,1,0,56.57,8,8,0,1,1-11.31-11.31,24,24,0,0,0,0-33.94A8,8,0,0,1,189.64,89.64Zm33.94-33.94a8,8,0,0,1,11.32,0,88,88,0,0,1,0,124.45,8,8,0,0,1-11.32-11.32,72,72,0,0,0,0-101.81A8,8,0,0,1,223.58,55.7Z"></path></svg>
                      </button>
                    </div>
                    
                    <div className={`p-8 rounded-[3rem] border text-center space-y-6 shadow-2xl relative overflow-hidden ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-200'}`}>
                      {isSecretMode ? (
                        <div className="space-y-3">
                          <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {isCn ? '秘密发声提示' : 'Secret Mode Tip'}
                          </p>
                          <p className={`text-sm leading-relaxed italic ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {isCn ? practicingNote(practicingSound) : practicingSound.accentNote}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                            {isCn ? '模糊发射器 (Fuzzy Launcher)' : 'Fuzzy Launcher'}
                          </p>
                          <p className={`text-xl font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{practicingSound.commMode}</p>
                        </div>
                      )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="relative">
                      {isRecording && !isSecretMode && (
                        <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90">
                          <circle cx="56" cy="56" r="50" fill="none" stroke="#ef4444" strokeWidth="4" 
                                  strokeDasharray={314} 
                                  strokeDashoffset={314 - (timer / (Math.max(3, practicingSound.practiceLine.split(' ').length * 0.5))) * 314} />
                        </svg>
                      )}
                      <MicButton onAudioData={handleAudioData} isSessionActive={true} onRecordingStateChange={setIsRecording} />
                    </div>
                    <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : (isDark ? 'text-zinc-600' : 'text-slate-400')}`}>
                          {isRecording 
                            ? (isSecretMode ? (isCn ? '正在秘密发声...' : 'SECRET PRACTICING...') : (isCn ? '跟随倒计时节奏发声' : 'FOLLOW THE PACE'))
                            : (isCn ? '点击开始发声' : 'TAP TO START')}
                        </p>
                    </div>
                </div>
            </div>
        ) : (
            <>
            {view === 'dialogue' && (
            <div className="w-full max-w-md py-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-6">
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    <span className={`text-[9px] px-3 py-1 border rounded-full font-bold uppercase tracking-wider ${isCurrentMcKee ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {isCurrentMcKee ? '对白' : (isCn ? currentAtom.sample_pool : currentAtom.sample_pool.replace('型', ''))}
                    </span>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-200 text-slate-500'}`}>
                      {currentAtom.role}
                    </span>
                    {/* 新增：开口计数反馈 */}
                    <div className="flex items-center gap-1.5 ml-1">
                      <div className={`text-[9px] font-black px-2 py-1 rounded-full border transition-all duration-300 ${atomSpeakCount > 0 ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : (isDark ? 'bg-white/5 border-white/5 text-zinc-600' : 'bg-slate-100 border-slate-100 text-slate-400')}`}>
                        {getSpeakStatusText(atomSpeakCount)}
                      </div>
                      <span className={`text-[10px] font-black italic ${isDark ? 'text-zinc-700' : 'text-slate-300'}`}>
                        {atomSpeakCount}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <p className={`text-sm italic ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {isCn ? currentAtom.intent : currentAtom.intent_en}
                    </p>
                    <button onClick={() => handlePlayExample(currentAtom.native)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full hover:bg-blue-500/20 transition-all">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{isCn ? '示范' : 'Model'}</span>
                    </button>
                    <h1 className="text-5xl font-black tracking-tighter px-2 leading-[1.1] text-center">
                      {renderHighlightedText(currentAtom.native, currentAtom.keywords, isCurrentMcKee)}
                    </h1>
                  </div>
                  
                  <div className="pt-4">
                    <div className={`px-6 py-4 rounded-3xl border backdrop-blur-xl shadow-2xl relative overflow-hidden group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                      <p className={`text-3xl font-mono tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentAtom.fuzzy}</p>
                      <p className={`text-[9px] mt-2 font-bold uppercase tracking-[0.2em] relative z-10 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                        {isCn ? '模糊发射器 (Fuzzy Launcher)' : 'Fuzzy Launcher'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                    <MicButton onAudioData={handleAudioData} isSessionActive={true} />
                    <div className="w-full h-16 flex items-center justify-center">
                        {responseLog.length > 0 ? (
                            <div className="text-center bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl w-full animate-in zoom-in-95 duration-300">
                                <p className={`text-lg font-medium ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{responseLog[responseLog.length - 1]}</p>
                            </div>
                        ) : (
                          <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>)}
                          </div>
                        )}
                    </div>
                    <div className="flex gap-4 w-full">
                        <button onClick={nextAtom} className={`flex-1 py-5 rounded-3xl font-bold border text-sm uppercase tracking-widest ${isDark ? 'bg-zinc-900 text-zinc-600 border-white/5' : 'bg-white text-slate-400 border-slate-200'}`}>{isCn ? '跳过' : 'Skip'}</button>
                        <button onClick={nextAtom} className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20">{isCn ? '下一句' : 'Next'}</button>
                    </div>
                </div>
            </div>
            )}

            {view === 'sound-cards' && (
                <div className="w-full max-w-md py-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="px-4 space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter">
                          {isCn ? '发声解冻练习' : 'Vocal Exposure'}
                        </h2>
                    </div>
                    
                    {INITIAL_SOUND_CARDS.map((card, idx) => {
                        const isLocked = !user.isRegistered && idx >= FREE_SOUND_CARD_LIMIT;
                        
                        return (
                          <div key={card.id} className={`p-8 rounded-[2.5rem] border space-y-8 group transition-all relative overflow-hidden ${isDark ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900 glow-card' : 'bg-white border-slate-200 hover:shadow-md'} ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                              <div className="flex justify-between items-start">
                                  <div className="flex-1 pr-6">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest text-blue-500`}>
                                        {isCn && card.targetCn ? card.targetCn : card.target}
                                      </span>
                                      <h3 className={`text-2xl font-bold mt-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.practiceLine}</h3>
                                  </div>
                                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${exposedSounds.includes(card.id) ? 'bg-blue-600 border-blue-500' : (isDark ? 'border-zinc-800' : 'border-slate-100')}`}>
                                      {exposedSounds.includes(card.id) && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path></svg>}
                                      {isLocked && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="opacity-40"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,80a12,12,0,1,1-12-12A12,12,0,0,1,128,160ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg>}
                                  </div>
                              </div>
                              <div className="flex gap-4">
                                  {isLocked ? (
                                    <button onClick={() => setView('milestone')} className="flex-1 py-4 bg-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2">
                                      {isCn ? '注册以解锁' : 'Sign in to unlock'}
                                    </button>
                                  ) : (
                                    <>
                                      <button onClick={() => startPractice(card, false)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg">
                                        {isCn ? '正式练习' : 'Practice'}
                                      </button>
                                      <button onClick={() => startPractice(card, true)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-slate-100 text-slate-500'}`}>
                                        {isCn ? '偷偷练' : 'Secret'}
                                      </button>
                                    </>
                                  )}
                              </div>
                          </div>
                        );
                    })}

                    <div className="pt-8 pb-12 text-center">
                      <button 
                        onClick={() => {
                          if (!user.isRegistered) {
                            setView('milestone');
                          } else {
                            setView('secret-chamber');
                          }
                        }}
                        className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all opacity-40 hover:opacity-100 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}
                      >
                        {isCn ? '· 秘密入口 ·' : '· SECRET ENTRANCE ·'}
                      </button>
                    </div>
                </div>
            )}

            {view === 'secret-chamber' && (
                <div className="w-full max-w-md py-8 space-y-16 animate-in slide-in-from-bottom-4 duration-500 mb-20">
                    <div className="px-4 text-center space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter italic uppercase text-violet-400">
                          {isCn ? '秘密对白' : 'Secret Dialogue'}
                        </h2>
                        <p className={`text-xs font-medium leading-relaxed max-w-[280px] mx-auto opacity-60 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                          “你不需要马上成为一个更好的人，有些反应，先留着也没关系。”
                        </p>
                    </div>

                    <div className="space-y-24">
                      {BOUNDARY_THEMES.map((theme, tIdx) => (
                        <div key={tIdx} className="space-y-10">
                          <div className="px-4 border-l-2 border-violet-500/30 ml-4 py-2">
                             <h3 className="text-xl font-black tracking-tight">{theme.title}</h3>
                             <p className="text-[10px] font-bold text-violet-500/60 uppercase tracking-widest mt-1">{theme.titleEn}</p>
                             <p className={`text-xs mt-3 italic opacity-50 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{theme.description}</p>
                          </div>

                          <div className="grid gap-12 px-4">
                            {theme.quotes.map((quote) => (
                              <div key={quote.id} className="group relative">
                                <div className="space-y-4">
                                   <blockquote className="text-2xl font-serif italic font-medium leading-[1.3] group-hover:text-violet-400 transition-colors">
                                      “{quote.practiceLine}”
                                   </blockquote>
                                   <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">—— {isCn && quote.targetCn ? quote.targetCn : quote.target}</span>
                                      <button 
                                        onClick={() => startPractice(quote, true)}
                                        className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-violet-500/20 text-violet-400 hover:bg-violet-500/10 transition-all"
                                      >
                                        {isCn ? '秘密发声' : 'Secret Practice'}
                                      </button>
                                   </div>
                                   <p className="text-xs font-bold text-violet-500 opacity-60 mt-2">{quote.accentNote}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 pb-12 text-center">
                      <button 
                        onClick={() => setView('sound-cards')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                      >
                        ← {isCn ? '返回常规发声练习' : 'BACK TO REGULAR PRACTICE'}
                      </button>
                    </div>
                </div>
            )}

            {view === 'map' && (
              <div className="w-full max-w-md py-8 space-y-12 animate-in zoom-in-95 duration-500">
                <div className="text-center px-4 space-y-8">
                  <h2 className="text-4xl font-black tracking-tighter">{isCn ? '发音汇总' : 'Vocal Summary'}</h2>
                  
                  {/* Summary Dashboard */}
                  <div className={`grid grid-cols-2 gap-4`}>
                    <div className={`p-6 rounded-[2.5rem] border text-left flex flex-col justify-between h-40 ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                        {isCn ? '母句积累' : 'Mother Sentences'}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-blue-500">{exposedAtoms.length}</span>
                        <span className={`text-sm font-bold ${isDark ? 'text-zinc-700' : 'text-slate-300'}`}>/{atoms.length}</span>
                      </div>
                      <div className="w-full bg-zinc-800/20 rounded-full h-1 overflow-hidden mt-4">
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(exposedAtoms.length / atoms.length) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-[2.5rem] border text-left flex flex-col justify-between h-40 ${isDark ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                        {isCn ? '音素节点' : 'Sound Nodes'}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-violet-400">{exposedSounds.length}</span>
                        <span className={`text-sm font-bold ${isDark ? 'text-zinc-700' : 'text-slate-300'}`}>/{INITIAL_SOUND_CARDS.length}</span>
                      </div>
                      <div className="w-full bg-zinc-800/20 rounded-full h-1 overflow-hidden mt-4">
                        <div className="bg-violet-400 h-full transition-all duration-1000" style={{ width: `${(exposedSounds.length / INITIAL_SOUND_CARDS.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl border text-left ${isDark ? 'bg-zinc-900/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                      {isCn ? '当前暴露状态' : 'Linguistic Exposure'}
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {isCn ? `你已在 ${daysActive} 天内发声 ${exposedAtoms.length + exposedSounds.length} 次，语言版图正在扩张。` : `You've vocalized ${exposedAtoms.length + exposedSounds.length} times over ${daysActive} days.`}
                    </p>
                  </div>
                </div>

                <section className="space-y-6 px-4 pb-12">
                   {/* 音素/顺口溜矩阵 - 移至流利度矩阵上方 */}
                   <div className="flex justify-between items-center px-2">
                    <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                      {isCn ? '音素版图' : 'Sound Map'}
                    </h3>
                   </div>
                   <div className={`flex flex-wrap gap-3 p-6 rounded-[3rem] border ${isDark ? 'bg-zinc-900/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                     {INITIAL_SOUND_CARDS.map((card) => (
                       <div 
                        key={card.id} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-black transition-all duration-700 ${
                          exposedSounds.includes(card.id) 
                          ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border-transparent' 
                          : (isDark ? 'bg-white/5 border border-white/5 text-zinc-700' : 'bg-slate-100 border border-slate-200 text-slate-400')
                        }`}
                       >
                         {card.id.split('-')[0].toUpperCase()}
                       </div>
                     ))}
                   </div>

                   {/* 母句矩阵 */}
                   <div className="flex justify-between items-center px-2 pt-4">
                    <h3 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                      {isCn ? '流利度矩阵' : 'Fluency Matrix'}
                    </h3>
                   </div>
                   <div className={`grid grid-cols-10 gap-2 p-6 rounded-[3rem] border ${isDark ? 'bg-zinc-900/20 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                     {atoms.map((atom) => (
                       <div 
                        key={atom.id} 
                        className={`aspect-square rounded-[4px] transition-all duration-700 ${
                          exposedAtoms.includes(atom.id) 
                          ? (atom.sample_pool.includes('对白') ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]') 
                          : (isDark ? 'bg-white/5' : 'bg-slate-100')
                        }`}
                       ></div>
                     ))}
                   </div>
                   
                   <p className={`text-[9px] text-center font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-slate-400'}`}>
                    {isCn ? '你的每一次发声，世界都会改变。' : 'Every time you speak, the world changes.'}
                   </p>
                </section>
              </div>
            )}

            {view === 'profile' && (
                <Profile user={user} exposedAtomsCount={exposedAtoms.length} totalAtomsCount={atoms.length} exposedSoundsCount={exposedSounds.length} onLogout={handleLogout} onUpdateSetting={handleUpdateSetting} />
            )}

            {view === 'home' && (
                <div className="text-center space-y-24 py-24 animate-in zoom-in duration-700">
                    <h1 className="text-8xl font-black tracking-tighter leading-none uppercase">
                      {isCn ? <>开口。<br/><span className="text-blue-600">就现在。</span></> : <>SPEAK.<br/><span className="text-blue-600">NOW.</span></>}
                    </h1>
                    <button onClick={() => setView('dialogue')} className="px-16 py-8 bg-blue-600 text-white rounded-full font-black text-2xl active:scale-95 shadow-2xl transition-all">
                      {isCn ? '开启发声' : 'Start'}
                    </button>
                </div>
            )}
            </>
        )}
      </div>
      {!practicingSound && <Navigation currentView={view} setView={setView} />}
    </main>
  );
};

// Helper for practicing notes
function practicingNote(card: SoundCard): string {
  if (card.id.startsWith('deep')) return card.accentNote;
  return card.accentNote;
}

export default App;
