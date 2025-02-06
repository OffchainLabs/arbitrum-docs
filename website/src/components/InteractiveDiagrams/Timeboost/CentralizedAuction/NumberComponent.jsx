import * as React from 'react';
import { useSpring, animated } from '@react-spring/web';

const numberPaths = {
  1: 'M583.04 633.46c.8-1.14 1.46-1.64 3.86-2.91 2.09-1.12 2.61-1.64 2.61-2.61 0-.84-.54-1.36-1.38-1.36-1.06 0-1.57.67-1.64 2.11h-4.42c0-3.25 2.35-5.21 6.25-5.21 3.36 0 5.62 1.68 5.62 4.18 0 2.11-.99 3.55-3.34 4.78l-.78.41c-2.05 1.08-2.67 1.55-2.84 2.48.73-.06 1.42-.11 2.2-.11h5.17v3.3h-12.52c0-2.46.37-3.86 1.21-5.06Z',
  2: 'M586.28 781.21c1.06 0 1.72-.62 1.72-1.53 0-1.03-.67-1.59-2.15-1.59h-.6v-3.21h.47c1.49 0 2.05-.52 2.05-1.57 0-.82-.67-1.42-1.62-1.42-1.12 0-1.75.78-1.77 2.05h-4.29c.09-3.19 2.31-5.11 6.14-5.11s5.88 1.57 5.88 4.07c0 1.7-.91 2.93-2.76 3.34v.11c2 .39 3.02 1.64 3.02 3.51 0 2.71-2.28 4.42-6.23 4.42-3.51 0-6.23-1.42-6.23-5.3h4.35c.06 1.42.78 2.24 2 2.24Z',
  3: 'M586.28 781.21c1.06 0 1.72-.62 1.72-1.53 0-1.03-.67-1.59-2.15-1.59h-.6v-3.21h.47c1.49 0 2.05-.52 2.05-1.57 0-.82-.67-1.42-1.62-1.42-1.12 0-1.75.78-1.77 2.05h-4.29c.09-3.19 2.31-5.11 6.14-5.11s5.88 1.57 5.88 4.07c0 1.7-.91 2.93-2.76 3.34v.11c2 .39 3.02 1.64 3.02 3.51 0 2.71-2.28 4.42-6.23 4.42-3.51 0-6.23-1.42-6.23-5.3h4.35c.06 1.42.78 2.24 2 2.24Z',
  4: 'M1048.97 602.13v-3.3l5.49-8.55h5.54v8.66h2.13v3.19H1060V605h-4.24v-2.87h-6.79Zm3.53-3.19h3.45c0-1.7 0-3.38.22-5.52l-.19-.06-3.47 5.58Z',
  5: 'M1003.53 257.43c1.01 0 1.7-.97 1.7-2.18s-.67-2.05-1.75-2.05c-.82 0-1.36.52-1.7 1.31l-4.27-.3.86-8.73h10.43v3.3h-4.42c-.78 0-1.75-.02-2.52-.11-.09.8-.15 1.96-.45 2.76h.17c.69-.78 1.77-1.16 3.12-1.16 2.93 0 5.08 2.11 5.08 4.96 0 3.21-2.46 5.34-6.23 5.34s-6.18-1.92-6.31-4.8h4.52c.06 1.01.73 1.66 1.75 1.66Z'
};

export const NumberComponent = ({ number, cx = 1003.46, cy = 253.19 }) => {
  const props = useSpring({
    from: { opacity: 0.1 },
    to: { opacity: 1 },
    config: { duration: 800 },
    loop: { reverse: true },
  });

  // Calculate the offset based on the original position of the number's path
  const getPathOffset = (number) => {
    switch (number) {
      case 1:
        return { x: cx - 583.04, y: cy - 633.46 };
      case 2:
        return { x: cx - 586.28, y: cy - 781.21 };
      case 3:
        return { x: cx - 586.28, y: cy - 781.21 };
      case 4:
        return { x: cx - 1048.97, y: cy - 602.13 };
      case 5:
        return { x: cx - 1003.53, y: cy - 257.43 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getPathOffset(number);
  const pathData = numberPaths[number];

  if (!pathData) {
    console.warn(`No path data found for number ${number}`);
    return null;
  }

  return (
    <animated.g id={`number${number}`} style={props}>
      <circle id={`circle${number}`} cx={cx} cy={cy} r={20.95} className={`cls-${number}`} />
      <path
        id={`path${number}`}
        d={pathData}
        className="cls-10"
        transform={`translate(${offset.x}, ${offset.y})`}
      />
    </animated.g>
  );
}; 