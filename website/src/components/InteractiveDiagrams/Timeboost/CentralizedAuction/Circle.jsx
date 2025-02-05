import React from 'react';
import { useSpring, animated } from '@react-spring/web';

export function Circle({ cx = 1170, cy = 490, r = 10, fill = '#c60' }) {
  const props = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 1 },
    config: { duration: 800 },
    loop: { reverse: true },
  });

  return (
    <animated.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      style={props}
      data-cell-id="tykxDlpcZX9cg9i9ZL_u-31"
      pointerEvents="all"
    />
  );
}
