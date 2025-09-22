import { atom } from "nanostores"

// Total aggregated score/lines (kept for game over and legacy use)
export const $score = atom<number>(0)
export const $lines = atom<number>(0)

// Split scoreboards
export const $scorePlayer = atom<number>(0)
export const $linesPlayer = atom<number>(0)

export const $scoreAI = atom<number>(0)
export const $linesAI = atom<number>(0)

// Turn counter: 1-based. Odd = Player, Even = AI
export const $turn = atom<number>(1)
