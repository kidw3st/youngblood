export interface BeatStep {
  isKick: boolean;
  isHat: boolean;
}

export function classifyStep(step: number): BeatStep {
  return { isKick: step % 4 === 0, isHat: step % 2 === 1 };
}
