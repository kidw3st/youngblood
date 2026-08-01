export function pingPongIndex(step: number, length: number): number {
  if (length <= 1) return 0;
  const cycle = 2 * (length - 1);
  const pos = step % cycle;
  return pos < length ? pos : cycle - pos;
}
