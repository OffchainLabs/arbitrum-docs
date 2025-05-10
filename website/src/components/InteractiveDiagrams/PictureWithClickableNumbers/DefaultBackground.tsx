import * as React from 'react';

/**
 * Default background SVG for the PictureWithClickableNumbers component.
 *
 * @remarks
 * This component contains the default SVG background elements used when no custom
 * SVG file path is provided. Extracted from the main component for better organization.
 *
 * @param props - Props for the SVG component, including viewBox and style
 * @returns An SVG element containing the background elements
 */
export const DefaultBackground: React.FC<{
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ viewBox = '0 0 1600 900', className, style }) => {
  return (
    <>
      <defs id="defs3">
        <linearGradient
          id="linear-gradient"
          x1={800}
          x2={800}
          y1={905.32}
          y2={-3.69}
          gradientUnits="userSpaceOnUse"
        >
          <stop id="stop1" offset={0} stopColor="#12aaff" />
          <stop id="stop2" offset={0.3} stopColor="#1b4add" />
          <stop id="stop3" offset={0.75} stopColor="#152c4e" />
        </linearGradient>
        <style id="style1">
          {
            '.cls-1,.cls-2,.cls-4{fill:none}.cls-5{fill:#e30663}.cls-5-light{fill:#e30663}.cls-7{fill:#12aaff}.cls-8,.cls-9{fill:#e5e5e5}.cls-2,.cls-4{stroke-miterlimit:10}.cls-2{stroke-width:.86px;stroke:#fff}.cls-4{stroke-width:1.09px}.cls-10{fill:#fff}.cls-10-light{fill:#000}.cls-11,.cls-9{opacity:.1}.cls-4{stroke:#e5e5e5}.cls-13{fill:#213147}'
          }
        </style>
      </defs>
      <g id="bkgd">
        <g id="g140">
          <path
            id="rect3"
            d="M0 0h1600v900H0z"
            style={{
              fill: 'url(#linear-gradient)',
            }}
          />
          <g id="g139">
            <g id="g69">
              <g id="g35" className="cls-11">
                {/* Network lines */}
                <g id="g6">
                  <path id="polyline6" d="M179.16 360.12H80.85l-22.63 15.47H0" className="cls-2" />
                  <path
                    id="path6"
                    d="M178.97 356.42c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7Z"
                    className="cls-10"
                  />
                </g>
                <g id="g7">
                  <path
                    id="polyline7"
                    d="M0 358.76h58.22l22.63-15.46h101.83l14.86-14.86h51.08l14.09 14.08h50.84"
                    className="cls-2"
                  />
                  <path
                    id="path7"
                    d="M313.37 346.23c2.04 0 3.7-1.66 3.7-3.7s-1.66-3.7-3.7-3.7-3.7 1.66-3.7 3.7 1.66 3.7 3.7 3.7Z"
                    className="cls-10"
                  />
                </g>
                <g id="g10">
                  <path id="polyline9" d="M240.22 443.59H119.08l-22.63-15.47H0" className="cls-2" />
                  <path
                    id="path9"
                    d="M240.04 439.88c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7Z"
                    className="cls-10"
                  />
                </g>
                <g id="g11">
                  <path id="path10" d="M0 227.1h163.21l23.67 34.9" className="cls-2" />
                  <path
                    id="path11"
                    d="M184.12 263.67a3.218 3.218 0 1 0 5.33-3.61 3.218 3.218 0 1 0-5.33 3.61Z"
                    className="cls-10"
                  />
                </g>
                <g id="g12">
                  <path id="polyline11" d="M0 214.44h175.62l31.72 49.48h54.06" className="cls-2" />
                  <path
                    id="path12"
                    d="M261.24 267.14c1.78 0 3.22-1.44 3.22-3.22s-1.44-3.22-3.22-3.22-3.22 1.44-3.22 3.22 1.44 3.22 3.22 3.22Z"
                    className="cls-10"
                  />
                </g>
                <g id="g15">
                  <path
                    id="polyline14"
                    d="M0 94.72h80.47l31.51 31.51h88.56l21.01 21.01h87.37"
                    className="cls-2"
                  />
                  <path
                    id="path14"
                    d="M308.76 150.46c1.78 0 3.22-1.44 3.22-3.22s-1.44-3.22-3.22-3.22-3.22 1.44-3.22 3.22 1.44 3.22 3.22 3.22Z"
                    className="cls-10"
                  />
                </g>
                <g id="g20">
                  <path id="line19" d="M109.69 187.83h135.87" className="cls-2" />
                  <path
                    id="path19"
                    d="M245.4 191.05c1.78 0 3.22-1.44 3.22-3.22s-1.44-3.22-3.22-3.22-3.22 1.44-3.22 3.22 1.44 3.22 3.22 3.22Z"
                    className="cls-10"
                  />
                </g>
              </g>

              {/* Main diagram elements */}
              <g id="main-diagram">
                {/* User icon */}
                <circle cx="420" cy="400" r="50" className="cls-8" />
                <text
                  x="420"
                  y="410"
                  textAnchor="middle"
                  className="cls-10"
                  style={{ fontSize: '16px' }}
                >
                  User
                </text>

                {/* Auction contract */}
                <rect x="580" y="600" width="120" height="80" rx="5" className="cls-7" />
                <text
                  x="640"
                  y="640"
                  textAnchor="middle"
                  className="cls-10"
                  style={{ fontSize: '14px' }}
                >
                  Auction Contract
                </text>

                {/* Sequencer */}
                <rect x="580" y="750" width="120" height="80" rx="5" className="cls-13" />
                <text
                  x="640"
                  y="790"
                  textAnchor="middle"
                  className="cls-10"
                  style={{ fontSize: '14px' }}
                >
                  Sequencer
                </text>

                {/* Express Lane */}
                <rect x="1000" y="600" width="120" height="80" rx="5" className="cls-5" />
                <text
                  x="1060"
                  y="640"
                  textAnchor="middle"
                  className="cls-10"
                  style={{ fontSize: '14px' }}
                >
                  Express Lane
                </text>

                {/* Reward Distributor */}
                <rect x="1000" y="250" width="120" height="80" rx="5" className="cls-7" />
                <text
                  x="1060"
                  y="290"
                  textAnchor="middle"
                  className="cls-10"
                  style={{ fontSize: '14px' }}
                >
                  Reward Distributor
                </text>
              </g>
            </g>
          </g>
        </g>
      </g>
    </>
  );
};

export default DefaultBackground;
