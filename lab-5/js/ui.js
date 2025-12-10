import { store } from './store.js';

// DOM
const canvas = document.querySelector('[data-shapes]');

const btnAddSquare = document.querySelector('[data-action="add-square"]');
const btnAddCircle = document.querySelector('[data-action="add-circle"]');
const btnRecolorSquare = document.querySelector(
    '[data-action="recolor-square"]'
);
const btnRecolorCircle = document.querySelector(
    '[data-action="recolor-circle"]'
);

const counterSquare = document.querySelector('[data-counter="square"]');
const counterCircle = document.querySelector('[data-counter="circle"]');
const counterTotal = document.querySelector('[data-counter="total"]');

// map id -> element
const shapeElements = new Map();

function createShapeElement(shape) {
    const el = document.createElement('div');
    el.classList.add('shape');
    if (shape.type === 'square') {
        el.classList.add('shape-square');
    } else if (shape.type === 'circle') {
        el.classList.add('shape-circle');
    }
    el.dataset.shapeId = shape.id;
    el.dataset.shapeType = shape.type;
    el.style.backgroundColor = shape.color;
    return el;
}

function renderAllShapes(shapes) {
    canvas.innerHTML = '';
    shapeElements.clear();

    for (const shape of shapes) {
        const el = createShapeElement(shape);
        canvas.appendChild(el);
        shapeElements.set(shape.id, el);
    }
}

function renderCounters(counts) {
    if (counterSquare) counterSquare.textContent = counts.squares;
    if (counterCircle) counterCircle.textContent = counts.circles;
    if (counterTotal) counterTotal.textContent = counts.total;
}

// subskrypcja
store.subscribe((state, change) => {
    renderCounters(state.counts);

    switch (change.type) {
        case 'init': {
            renderAllShapes(state.shapes);
            break;
        }
        case 'add': {
            const { shape } = change;
            if (shapeElements.has(shape.id)) break;
            const el = createShapeElement(shape);
            canvas.appendChild(el);
            shapeElements.set(shape.id, el);
            break;
        }
        case 'remove': {
            const { id } = change;
            const el = shapeElements.get(id);
            if (el) {
                el.remove();
                shapeElements.delete(id);
            }
            break;
        }
        case 'recolorType': {
            const { shapeType } = change;
            for (const shape of state.shapes) {
                if (shape.type === shapeType) {
                    const el = shapeElements.get(shape.id);
                    if (el) {
                        el.style.backgroundColor = shape.color;
                    }
                }
            }
            break;
        }
    }
});

// zdarzenia

if (btnAddSquare) {
    btnAddSquare.addEventListener('click', () => {
        store.addShape('square');
    });
}

if (btnAddCircle) {
    btnAddCircle.addEventListener('click', () => {
        store.addShape('circle');
    });
}

if (btnRecolorSquare) {
    btnRecolorSquare.addEventListener('click', () => {
        store.recolorType('square');
    });
}

if (btnRecolorCircle) {
    btnRecolorCircle.addEventListener('click', () => {
        store.recolorType('circle');
    });
}

if (canvas) {
    canvas.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const shapeEl = target.closest('[data-shape-id]');
        if (!shapeEl) return;

        const id = shapeEl.dataset.shapeId;
        if (!id) return;

        store.removeShape(id);
    });
}
