import type { WheelNormalizer } from '../types';

const LINE_HEIGHT = 16;
const PIXEL_THRESHOLD = 90;
const STEP_CAP = 2;

const normalizeDeltaY = (event: WheelEvent): number => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
};

export const createWheelNormalizer = (): WheelNormalizer => {
  let accumulator = 0;

  return {
    consume(event: WheelEvent) {
      accumulator += normalizeDeltaY(event);
      let steps = 0;

      while (Math.abs(accumulator) >= PIXEL_THRESHOLD && Math.abs(steps) < STEP_CAP) {
        const direction = Math.sign(accumulator);
        steps += direction;
        accumulator -= direction * PIXEL_THRESHOLD;
      }

      return steps;
    },
    reset() {
      accumulator = 0;
    }
  };
};
