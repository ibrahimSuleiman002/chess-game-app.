import { GoogleGenAI } from "@google/genai";
import { Chess } from "chess.js";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to format prompt
const createChessPrompt = (fen: string, legalMoves: string[], history: string[]) => `
You are a Chess Grandmaster playing Black. 
Current board state (FEN): ${fen}
Game History: ${history.slice(-10).join(' ')}
Your available legal moves are: ${legalMoves.join(', ')}.

Instructions:
1. Analyze the position carefully.
2. Select the absolute best move from the list of legal moves to win the game or force a draw if losing.
3. Think strategically about control of the center, piece safety, and king safety.
4. Output ONLY the SAN (Standard Algebraic Notation) of the chosen move. Do not add any explanation, numbering, or punctuation.
Example Output: Nf3
`;

export const getGeminiMove = async (fen: string, history: string[]): Promise<string | null> => {
  try {
    const game = new Chess(fen);
    const legalMoves = game.moves();
    
    // Game over check
    if (game.isGameOver() || legalMoves.length === 0) return null;

    if (!process.env.API_KEY) {
      console.warn("No API Key found. Falling back to random move.");
      // Fallback: Pick a random legal move if no API key
      const randomIdx = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[randomIdx];
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: createChessPrompt(fen, legalMoves, history),
      config: {
        temperature: 0.1, // Low temperature for more deterministic/logical play
        maxOutputTokens: 10,
      }
    });

    const moveSan = response.text?.trim();

    if (moveSan && legalMoves.includes(moveSan)) {
      return moveSan;
    }

    // Fallback if Gemini hallucinates an illegal move (rare with this prompt)
    console.warn("Gemini returned invalid or empty move:", moveSan);
    const randomIdx = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIdx];

  } catch (error) {
    console.error("Error fetching Gemini move:", error);
    // Fallback to random move on error to keep game playable
    const game = new Chess(fen);
    const moves = game.moves();
    if (moves.length > 0) {
       return moves[Math.floor(Math.random() * moves.length)];
    }
    return null;
  }
};