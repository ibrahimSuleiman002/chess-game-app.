import { BoardTheme } from './types';

export const DEFAULT_THEME: BoardTheme = {
  light: 'bg-[#ebecd0]',
  dark: 'bg-[#779556]',
  highlight: 'bg-yellow-200/50', // Selected piece
  moveHighlight: 'bg-yellow-400/50', // Last move
};

// Using Lichess (cburnett) pieces hosted on GitHub for maximum reliability
const BASE_URL = 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett';

export const PIECE_IMAGES: Record<string, string> = {
  'w-p': `${BASE_URL}/wP.svg`,
  'w-n': `${BASE_URL}/wN.svg`,
  'w-b': `${BASE_URL}/wB.svg`,
  'w-r': `${BASE_URL}/wR.svg`,
  'w-q': `${BASE_URL}/wQ.svg`,
  'w-k': `${BASE_URL}/wK.svg`,
  'b-p': `${BASE_URL}/bP.svg`,
  'b-n': `${BASE_URL}/bN.svg`,
  'b-b': `${BASE_URL}/bB.svg`,
  'b-r': `${BASE_URL}/bR.svg`,
  'b-q': `${BASE_URL}/bQ.svg`,
  'b-k': `${BASE_URL}/bK.svg`,
};

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';