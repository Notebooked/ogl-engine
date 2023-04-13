var now = 0.0;

export function start() {
    now = performance.now() * 0.001;
}

export function mark() {
    console.log(performance.now() * 0.001 - now);
}