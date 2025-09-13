
import { controls as controlsConfig } from '../config';

// handled keys - using key codes for compatibility
const KEY_MAP = {
    27: 'escape',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
} as const;

type KeyCode = keyof typeof KEY_MAP;
type KeyName = typeof KEY_MAP[KeyCode];

/**
 * Represents key control and handle custom repeat delay
 */
class Key {
    code: KeyCode;
    name: KeyName;
    pressed: boolean;
    repeatsCount: number;
    repeatTimer: number;

    constructor(code: KeyCode) {
        this.code = code;
        this.name = KEY_MAP[code];
        this.pressed = false;
        
        this.repeatsCount = 0;
        this.repeatTimer = 0;
    }
    
    /**
     * Update repeat counters and check if action should be triggered
     * @returns {boolean} true if action should be triggered
     */
    trigger(): boolean {
        if (this.pressed) {
            --this.repeatTimer;
            if (this.repeatTimer <= 0) {
                this.repeatTimer = (this.repeatsCount > 0)
                    ? controlsConfig.repeatDelay
                    : controlsConfig.initialRepeatDelay;
                ++this.repeatsCount;
                return true;
            }
        }
        return false;
    }
    
    onPress(): void {
        this.pressed = true;
    }
    
    onRelease(): void {
        this.pressed = false;
        this.repeatTimer = 0;
        this.repeatsCount = 0;
    }
}


/**
 * Handles keyboard controls for known keys
 * 
 * This class could be more generic, but its not needed for this game.
 */
export default class Keyboard {
    keys: Record<KeyCode, Key> = {} as Record<KeyCode, Key>;
    escape: Key;
    space: Key;
    left: Key;
    up: Key;
    right: Key;
    down: Key;

    constructor() {
        // Initialize all keys
        (Object.keys(KEY_MAP) as unknown as KeyCode[]).forEach((keyCode) => {
            let key = new Key(keyCode);
            this.keys[keyCode] = key;
        });
        
        // Explicitly assign properties for TypeScript
        this.escape = this.keys[27];
        this.space = this.keys[32];
        this.left = this.keys[37];
        this.up = this.keys[38];
        this.right = this.keys[39];
        this.down = this.keys[40];
        
        window.addEventListener('keydown', (evt) => {
            // Use keyCode instead of key for numeric compatibility
            let key = this.keys[evt.keyCode as KeyCode];
            if (key) {
                key.onPress();
            }
        });
        window.addEventListener('keyup', (evt) => {
            // Use keyCode instead of key for numeric compatibility
            let key = this.keys[evt.keyCode as KeyCode];
            if (key) {
                key.onRelease();
            }
        });
    }
}
