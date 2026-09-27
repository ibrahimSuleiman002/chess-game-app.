import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';
import { GameState } from './types';
import { getGeminiMove } from './services/geminiService';
import { STARTING_FEN, PIECE_IMAGES } from './constants';
import { BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  // Main game state
  // We use a ref for the Chess instance to maintain mutability where needed for libraries, 
  // but we trigger re-renders using the 'fen' state.
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(STARTING_FEN);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Derived state
  const game = chessRef.current;
  const gameState: GameState = {
    fen: fen,
    turn: game.turn(),
    inCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
    isStalemate: game.isStalemate(),
    isThreefoldRepetition: game.isThreefoldRepetition(),
    isInsufficientMaterial: game.isInsufficientMaterial(),
    isGameOver: game.isGameOver(),
    history: history,
  };

  const safeGameMutate = (modify: (g: Chess) => void) => {
    modify(game);
    setFen(game.fen());
    setHistory(game.history());
  };

  const handlePlayerMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    // Attempt move
    try {
      const result = game.move(move);
      if (result) {
        setFen(game.fen());
        setHistory(game.history());
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  const handleReset = () => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setHistory([]);
    setIsAiThinking(false);
  };

  // AI Turn Effect
  useEffect(() => {
    const aiTurn = async () => {
      if (game.turn() === 'b' && !game.isGameOver()) {
        setIsAiThinking(true);
        
        // Small delay for realism and UI update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get move from Gemini
        const moveSan = await getGeminiMove(game.fen(), game.history());
        
        if (moveSan) {
           safeGameMutate((g) => {
             try {
               g.move(moveSan);
             } catch (e) {
               console.error("AI attempted illegal move:", moveSan);
               // Last resort fallback
               const moves = g.moves();
               if(moves.length > 0) g.move(moves[0]);
             }
           });
        }
        
        setIsAiThinking(false);
      }
    };

    aiTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]); // Run whenever board updates

  // Scroll history to bottom
  useEffect(() => {
    const el = document.getElementById('history-end');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 py-4 shadow-md z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                 Gemini Chess
               </h1>
               <p className="text-xs text-slate-400 font-medium">Grandmaster Level AI</p>
             </div>
          </div>
          <div className="hidden sm:block">
            {isAiThinking && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/50 rounded-full border border-blue-500/30 text-blue-300 text-sm animate-pulse">
                <BrainCircuit className="w-4 h-4" />
                Gemini is thinking...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        
        {/* Left: Board */}
        <div className="flex flex-col items-center gap-4">
           {/* Mobile Thinking Indicator */}
           <div className="sm:hidden w-full h-8 flex items-center justify-center">
              {isAiThinking && <span className="text-blue-400 text-sm animate-pulse font-medium">Gemini is thinking...</span>}
           </div>

           <div className="relative">
             <ChessBoard 
               game={game} 
               onMove={handlePlayerMove} 
               disabled={game.turn() === 'b' || game.isGameOver()} 
               boardOrientation="white"
             />
             
             {/* Game Over Overlay */}
             {gameState.isGameOver && (
               <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-[2px]">
                 <div className="bg-white text-slate-900 p-6 rounded-xl shadow-2xl text-center transform scale-110">
                   <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">
                     {gameState.isCheckmate ? (gameState.turn === 'w' ? 'You Lost' : 'You Won!') : 'Draw'}
                   </h2>
                   <p className="text-slate-600 font-medium mb-6">
                     {gameState.isCheckmate 
                       ? 'Checkmate' 
                       : gameState.isStalemate 
                         ? 'Stalemate' 
                         : gameState.isThreefoldRepetition
                           ? 'Threefold Repetition'
                           : 'Insufficient Material'
                     }
                   </p>
                   <button 
                     onClick={handleReset}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-blue-500/30"
                   >
                     Play Again
                   </button>
                 </div>
               </div>
             )}
           </div>

           {/* Player Info Cards */}
           <div className="w-full grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${gameState.turn === 'w' ? 'bg-slate-700 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-slate-800 border-slate-700 opacity-70'}`}>
                 <img src={PIECE_IMAGES['w-k']} className="w-8 h-8" alt="White King" />
                 <div>
                   <p className="font-bold text-sm">You</p>
                   <p className="text-xs text-slate-400">White</p>
                 </div>
              </div>
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${gameState.turn === 'b' ? 'bg-slate-700 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-800 border-slate-700 opacity-70'}`}>
                 <img src={PIECE_IMAGES['b-k']} className="w-8 h-8" alt="Black King" />
                 <div>
                   <p className="font-bold text-sm">Gemini</p>
                   <p className="text-xs text-slate-400">Black</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Info Panel */}
        <GameInfo 
          state={gameState} 
          onReset={handleReset} 
          gameHistory={history}
        />

      </main>
    </div>
  );
};

export default App;