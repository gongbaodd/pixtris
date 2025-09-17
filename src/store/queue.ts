import { atom, computed } from "nanostores"

export const $queue = atom<string[]>([])

export const $current = computed($queue, queue => {
    return queue[queue.length - 1]
})

export const $next = computed($queue, queue => {
    return queue[queue.length - 2]
})

