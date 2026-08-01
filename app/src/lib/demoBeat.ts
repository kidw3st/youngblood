export interface BeatStep {
  isKick: boolean;
  isHat: boolean;
}

export function classifyStep(step: number): BeatStep {
  return { isKick: step % 4 === 0, isHat: step % 2 === 1 };
}

function playKick(ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function playHat(ctx: AudioContext): void {
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.value = 0.18;
  source.connect(highpass).connect(gain).connect(ctx.destination);
  source.start();
}

const STEP_TIME_MS = 130;
const STEPS_PER_LOOP = 16;

export function startDemoBeat(ctx: AudioContext): number {
  let step = 0;
  return window.setInterval(() => {
    const { isKick, isHat } = classifyStep(step);
    if (isKick) playKick(ctx);
    if (isHat) playHat(ctx);
    step = (step + 1) % STEPS_PER_LOOP;
  }, STEP_TIME_MS);
}

export function stopDemoBeat(timerId: number): void {
  window.clearInterval(timerId);
}
