
import React from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  // We don't have user object here to check theme, so we check document body class or a global convention
  // But since we want it perfect, we'll assume dark/light based on background-color of body for simplicity if we had more context, 
  // however, for this task, let's keep it glassmorphic and elegant.
  
  // Note: Since Navigation is inside App, it inherits theme colors via text inheritance or explicit theme prop could be added.
  // For now, using standard gray/blue that works on both.

  return (
    <nav className="fixed bottom-0 left-0 w-full backdrop-blur-xl border-t flex justify-around items-stretch h-24 z-50 transition-all border-zinc-500/10">
      <button 
        onClick={() => setView('home')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5 ${currentView === 'home' ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${currentView === 'home' ? 'bg-blue-500/10' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a16,16,0,0,0,16,16h64a8,8,0,0,0,8-8V160h16v56a8,8,0,0,0,8,8h64a16,16,0,0,0,16-16V120A15.87,15.87,0,0,0,219.31,108.68Z"></path></svg>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase">Home</span>
      </button>
      
      <button 
        onClick={() => setView('dialogue')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5 ${currentView === 'dialogue' ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${currentView === 'dialogue' ? 'bg-blue-500/10' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Zm172,12A104.11,104.11,0,0,1,128,232a103.14,103.14,0,0,1-50.53-13.16L31.33,232.55a12,12,0,0,1-13.88-13.88l13.71-46.14A104,104,0,1,1,232,128Z"></path></svg>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase">Talk</span>
      </button>
      
      <button 
        onClick={() => setView('sound-cards')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5 ${currentView === 'sound-cards' ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${currentView === 'sound-cards' ? 'bg-blue-500/10' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M152,120a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,120Zm-8,24H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm72-88V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Zm-16,0H56V200H200V56Zm-40,64a40,40,0,1,1-40-40A40,40,0,0,1,160,120Z"></path></svg>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase">Vocal</span>
      </button>
      
      <button 
        onClick={() => setView('map')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5 ${currentView === 'map' ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${currentView === 'map' ? 'bg-blue-500/10' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.41,95.07,30.48a8,8,0,0,0-7.14,0L27.08,60.92a8,8,0,0,0-4.7,7.24V200.31a8,8,0,0,0,9.14,7.92l61.13-15.28,65.86,32.93a8.07,8.07,0,0,0,3.57.85,8,8,0,0,0,3.57-.85l60.85-30.43a8,8,0,0,0,4.71-7.15V55.69A8,8,0,0,0,228.92,49.69ZM160,195.14l-64-32V60.86l64,32Z"></path></svg>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase">Map</span>
      </button>

      <button 
        onClick={() => setView('profile')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5 ${currentView === 'profile' ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-400'}`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${currentView === 'profile' ? 'bg-blue-500/10' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Z"></path></svg>
        </div>
        <span className="text-[9px] font-bold tracking-widest uppercase">Me</span>
      </button>
    </nav>
  );
};

export default Navigation;
