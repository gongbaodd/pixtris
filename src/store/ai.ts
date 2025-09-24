import { atom } from 'nanostores'

// Stores the immediate best move for the AI as [startCol, rotationTimes]
export const $bestMove = atom<[number, number] | null>(null)


