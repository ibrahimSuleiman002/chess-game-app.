import React from 'react';
import { GameState } from '../types';
import { RefreshCw, Play, Circle } from 'lucide-react';

interface GameInfoProps {
  state: GameState;
  onReset: () => void;
  gameHistory: string[];
}

const GameInfo: React.FC<GameInfoProps> = ({ state, onReset, gameHistory }) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md lg:w-80">
      
      {/* Status Card */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-400" />
          Game Status
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <span className="text-slate-400">Turn</span>
            <span className={`font-bold flex items-center gap-2 ${state.turn === 'w' ? 'text-white' : 'text-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full ${state.turn === 'w' ? 'bg-white' : 'bg-black border border-slate-500'}`} />
              {state.turn === 'w' ? 'White (You)' : 'Black (Gemini)'}
            </span>
          </div>

          {(state.inCheck || state.isGameOver) && (
             <div className={`p-3 rounded-lg font-bold text-center animate-pulse ${state.isCheckmate ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
               {state.isCheckmate ? 'CHECKMATE' : state.inCheck ? 'CHECK' : state.isStalemate ? 'STALEMATE' : 'DRAW'}
             </div>
          )}
          
          {state.isGameOver && (
            <div className="text-center text-sm text-slate-400 mt-2">
              {state.isCheckmate ? `Winner: ${state.turn === 'w' ? 'Black' : 'White'}` : 'Draw Game'}
            </div>
          )}
        </div>

        <button 
          onClick={onReset}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          New Game
        </button>
      </div>

      {/* Move History */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex-1 min-h-[300px] flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-slate-200">Move History</h3>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-700/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 rounded-tl-md">#</th>
                <th className="px-3 py-2">White</th>
                <th className="px-3 py-2 rounded-tr-md">Black</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(gameHistory.length / 2) }).map((_, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-3 py-2 text-slate-500">{i + 1}.</td>
                  <td className="px-3 py-2 font-mono text-blue-200">{gameHistory[i * 2]}</td>
                  <td className="px-3 py-2 font-mono text-red-200">{gameHistory[i * 2 + 1] || ''}</td>
                </tr>
              ))}
              {gameHistory.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-slate-500 italic">
                    Game hasn't started yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Dummy div to scroll to bottom */}
          <div id="history-end" />
        </div>
      </div>
    </div>
  );
};

export default GameInfo;