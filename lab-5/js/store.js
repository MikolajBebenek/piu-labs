import { randomColor, createId } from './helpers.js';

const STORAGE_KEY = 'lab5-shapes-store';

class Store {
    #state = {
        shapes: [],
    };

    #subscribers = new Set();

    constructor() {
        this.#loadFromStorage();
    }

    // gettery

    getShapes() {
        return [...this.#state.shapes];
    }

    getCounts() {
        let squares = 0;
        let circles = 0;

        for (const shape of this.#state.shapes) {
            if (shape.type === 'square') squares++;
            if (shape.type === 'circle') circles++;
        }

        return {
            squares,
            circles,
            total: squares + circles,
        };
    }

    #getSnapshot() {
        return {
            shapes: this.getShapes(),
            counts: this.getCounts(),
        };
    }

    // subskrypcje

    subscribe(callback) {
        this.#subscribers.add(callback);
        callback(this.#getSnapshot(), { type: 'init' });
        return () => this.#subscribers.delete(callback);
    }

    #notify(change) {
        const snapshot = this.#getSnapshot();
        for (const cb of this.#subscribers) {
            cb(snapshot, change);
        }
    }

    // API stanu

    addShape(type) {
        if (type !== 'square' && type !== 'circle') return;

        const newShape = {
            id: createId(),
            type,
            color: randomColor(),
        };

        this.#state.shapes.push(newShape);
        this.#saveAndNotify({ type: 'add', shape: newShape });
    }

    removeShape(id) {
        const index = this.#state.shapes.findIndex((shape) => shape.id === id);
        if (index === -1) return;

        this.#state.shapes.splice(index, 1);
        this.#saveAndNotify({ type: 'remove', id });
    }

    recolorType(type) {
        if (type !== 'square' && type !== 'circle') return;

        let changed = false;

        for (const shape of this.#state.shapes) {
            if (shape.type === type) {
                shape.color = randomColor();
                changed = true;
            }
        }

        if (!changed) return;

        this.#saveAndNotify({ type: 'recolorType', shapeType: type });
    }

    #saveAndNotify(change) {
        this.#saveToStorage();
        this.#notify(change);
    }

    // localStorage

    #saveToStorage() {
        try {
            const json = JSON.stringify(this.#state);
            localStorage.setItem(STORAGE_KEY, json);
        } catch (err) {
            console.warn('Błąd zapisu do localStorage:', err);
        }
    }

    #loadFromStorage() {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return;

            const data = JSON.parse(json);
            if (data && Array.isArray(data.shapes)) {
                this.#state.shapes = data.shapes.map((shape) => ({
                    id: shape.id || createId(),
                    type: shape.type === 'circle' ? 'circle' : 'square',
                    color: shape.color || randomColor(),
                }));
            }
        } catch (err) {
            console.warn('Błąd odczytu z localStorage:', err);
        }
    }
}

export const store = new Store();
