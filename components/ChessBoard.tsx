import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { DEFAULT_THEME, PIECE_IMAGES } from '../constants';
import PromotionModal from './PromotionModal';
import { PromotionPiece } from '../types';

interface ChessBoardProps {
  game: Chess;
  onMove: (move: { from: Square; to: Square; promotion?: string }) => boolean;
  disabled: boolean;
  boardOrientation?: 'white' | 'black';
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  game, 
  onMove, 
  disabled, 
  boardOrientation = 'white' 
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);

  // Reset selection when game state changes externally (e.g. AI move)
  useEffect(() => {
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, [game.fen()]);

  const getPieceAt = (square: Square) => {
    return game.get(square);
  };

  const isPromotion = (from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (piece?.type !== 'p') return false;
    if (piece.color !== game.turn()) return false;
    const rank = to[1];
    return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
  };

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    // If currently asking for promotion, ignore board clicks
    if (promotionMove) return;

    // If a square is already selected
    if (selectedSquare) {
      // If clicking the same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Check if the clicked square is a valid move for the selected piece
      const move = possibleMoves.find((m) => m.to === square);

      if (move) {
        // Execute move
        if (isPromotion(selectedSquare, square)) {
          setPromotionMove({ from: selectedSquare, to: square });
        } else {
          onMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
        return;
      }
    }

    // Select new piece
    const piece = getPieceAt(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      // Get legal moves for this piece
      // verbose: true gives us the 'to' squares
      const moves = game.moves({ square, verbose: true }) as Move[];
      setPossibleMoves(moves);
    } else {
      // Clicked empty square or opponent piece without a valid move
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotionSelect = (piece: PromotionPiece) => {
    if (promotionMove) {
      onMove({ ...promotionMove, promotion: piece });
      setPromotionMove(null);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Orientation handling
  const ranks = boardOrientation === 'white' ? RANKS : [...RANKS].reverse();
  const files = boardOrientation === 'white' ? FILES : [...FILES].reverse();

  // Highlight logic
  const lastMove = game.history({ verbose: true }).pop();

  return (
    <div className="relative select-none touch-manipulation">
      <div className="grid grid-cols-8 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-slate-800">
        {ranks.map((rank) => (
          files.map((file) => {
            const square = `${file}${rank}` as Square;
            const isLight = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 !== 0;
            const piece = getPieceAt(square);
            const isSelected = selectedSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isPossibleMove = possibleMoves.some(m => m.to === square);
            const isCapture = isPossibleMove && piece;

            let bgClass = isLight ? DEFAULT_THEME.light : DEFAULT_THEME.dark;
            if (isSelected) bgClass = DEFAULT_THEME.highlight;
            else if (isLastMove) bgClass = DEFAULT_THEME.moveHighlight;

            return (
              <div
                key={square}
                className={`w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center relative ${bgClass} cursor-pointer`}
                onClick={() => handleSquareClick(square)}
              >
                 {/* Rank/File Indicators */}
                 {file === files[0] && (
                  <span className={`absolute top-0.5 left-0.5 text-[8px] sm:text-[10px] font-bold ${isLight ? 'text-green-800' : 'text-[#ebecd0]'}`}>
                    {rank}
                  </span>
                )}
                {rank === ranks[7] && (
                   <span className={`absolute bottom-0 right-1 text-[8px] sm:text-[10px] font-bold ${isLight ? 'text-green-800' : 'text-[#ebecd0]'}`}>
                   {file}
                 </span>
                )}

                {/* Move Hints */}
                {isPossibleMove && !isCapture && (
                   <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-black/20" />
                )}
                {isPossibleMove && isCapture && (
                   <div className="absolute w-full h-full border-[4px] sm:border-[6px] border-black/20 rounded-full" />
                )}

                {/* Piece */}
                {piece && (
                  <img
                    src={PIECE_IMAGES[`${piece.color}-${piece.type}`]}
                    alt={`${piece.color} ${piece.type}`}
                    className="w-4/5 h-4/5 object-contain z-10 transition-transform duration-100 hover:scale-110"
                  />
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <PromotionModal 
        isOpen={!!promotionMove} 
        color={game.turn()} 
        onSelect={handlePromotionSelect} 
      />
    </div>
  );
};

export default ChessBoard;