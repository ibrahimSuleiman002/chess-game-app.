import React from 'react';
import { PromotionPiece } from '../types';
import { PIECE_IMAGES } from '../constants';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PromotionPiece) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, color, onSelect }) => {
  if (!isOpen) return null;

  const pieces: PromotionPiece[] = ['q', 'r', 'b', 'n'];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
      <div className="bg-white p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-gray-900 font-bold text-center mb-4">Promote Pawn</h3>
        <div className="flex gap-4">
          {pieces.map((p) => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
            >
              <img 
                src={PIECE_IMAGES[`${color}-${p}`]} 
                alt={p} 
                className="w-12 h-12"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;