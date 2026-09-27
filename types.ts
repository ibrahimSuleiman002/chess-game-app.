import { Square as ChessSquare, PieceSymbol, Color, Move } from 'chess.js';

export type Square = ChessSquare;
export type { PieceSymbol, Color, Move };

export interface GameState {
  fen: string;
  turn: Color;
  inCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isGameOver: boolean;
  history: string[];
}

export interface BoardTheme {
  light: string;
  dark: string;
  highlight: string;
  moveHighlight: string;
}

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';