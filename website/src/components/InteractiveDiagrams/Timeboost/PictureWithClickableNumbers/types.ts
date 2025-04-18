export interface Coordinates {
  circle: {
    x: number;
    y: number;
  };
  path: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

export interface NumberComponentProps {
  number: 1 | 2 | 3 | 4 | 5;
}

export interface ButtonComponentProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SyntaxHighlighterProps {
  language: string;
  style: any;
  customStyle?: React.CSSProperties;
  children: string;
}
