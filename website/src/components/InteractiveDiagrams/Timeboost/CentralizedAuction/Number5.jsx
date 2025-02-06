import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';

export const Number5 = ({ cx = 1003.46, cy = 253.19 }) => {
  const props = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 1 },
    config: { duration: 800 },
    loop: { reverse: true },
  });

  return (
    <animated.g id="g414" style={props}>
      <circle id="circle413" cx={cx} cy={cy} r={20.95} className="cls-5" />
      <path
        id="path414"
        d={`M${cx + 0.07} ${
          cy + 4.24
        }c1.01 0 1.7-.97 1.7-2.18s-.67-2.05-1.75-2.05c-.82 0-1.36.52-1.7 1.31l-4.27-.3.86-8.73h10.43v3.3h-4.42c-.78 0-1.75-.02-2.52-.11-.09.8-.15 1.96-.45 2.76h.17c.69-.78 1.77-1.16 3.12-1.16 2.93 0 5.08 2.11 5.08 4.96 0 3.21-2.46 5.34-6.23 5.34s-6.18-1.92-6.31-4.8h4.52c.06 1.01.73 1.66 1.75 1.66Z`}
        className="cls-10"
      />
    </animated.g>
  );
};
