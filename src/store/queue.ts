import { atom } from "nanostores"
import type { ShapeType } from "../play/TetronimoSpawner"

export const $queue = atom<string[]>([])

export const $current = atom<ShapeType | undefined>(undefined)

export const $next = atom<ShapeType | undefined>(undefined)
