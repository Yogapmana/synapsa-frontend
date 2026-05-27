import React, { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function CountUp({ value, duration = 1 }) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }
    
    const controls = animate(0, value, {
      duration,
      onUpdate(val) {
        setCount(Math.round(val));
      }
    });
    return () => controls.stop();
  }, [value, duration, shouldReduceMotion]);

  return <span className="tabular-nums">{count}</span>;
}
