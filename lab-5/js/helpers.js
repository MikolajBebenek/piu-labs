// losowy kolor
export function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70;
    const lightness = 65;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// unikalny id
export function createId(prefix = 'shape') {
    const ts = Date.now().toString(36);
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${ts}-${rnd}`;
}
