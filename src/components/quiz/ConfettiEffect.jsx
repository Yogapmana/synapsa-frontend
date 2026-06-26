import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function ConfettiEffect({ active = true, duration = 2500 }) {
  useEffect(() => {
    if (!active) return;
    
    const end = Date.now() + duration;
    const colors = ['#C4251C', '#A16207', '#166534', '#1D4ED8'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, [active, duration]);

  return null;
}
