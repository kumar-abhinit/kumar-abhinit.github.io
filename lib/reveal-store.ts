/**
 * Tiny external store that carries the outer-strip reveal progress (0 to 1)
 * from ScrollStage to GridCanvas without going through React state.
 */

type Listener = () => void;

let reveal = 0;
const listeners = new Set<Listener>();

export function getReveal(): number {
  return reveal;
}

export function setReveal(next: number): void {
  if (next === reveal) return;
  reveal = next;
  listeners.forEach((listener) => listener());
}

export function subscribeReveal(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
