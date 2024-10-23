import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './ClickableDiagram.module.css';

export const ClickableDiagram = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const determineElementFill = (isHovered) => {
    return isHovered ? '#ff0000' : '#1e1e1e'; // Red on hover, default color otherwise
  };
  const determineElementText = (isHovered) => {
    return isHovered ? (
      <text
        id="text22"
        x={38.096}
        y={14.096}
        fill="#1e1e1e"
        direction="ltr"
        dominantBaseline="alphabetic"
        fontFamily="Excalifont, Segoe UI Emoji"
        fontSize={8}
        style={{
          whiteSpace: 'pre',
        }}
        textAnchor="middle"
      >
        {'teste'}
      </text>
    ) : (
      <text
        id="text22"
        x={38.096}
        y={14.096}
        fill="#1e1e1e"
        direction="ltr"
        dominantBaseline="alphabetic"
        fontFamily="Excalifont, Segoe UI Emoji"
        fontSize={8}
        style={{
          whiteSpace: 'pre',
        }}
        textAnchor="middle"
      >
        {'Sequencer'}
      </text>
    );
  };

  return (
    <BrowserOnly>
      {() => (
        <div
          style={{ position: 'relative' }} // Ensure the container is positioned relatively
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            id="svg42"
            width={1026.711}
            height={1450.403}
            viewBox="0 0 513.356 725.202"
            {...props}
          >
            <g
              id="bkgd"
              style={{
                strokeWidth: 0.918537,
              }}
              transform="matrix(.40376 0 0 .73388 -327.416 130.183)"
            >
              <g
                id="g140"
                style={{
                  strokeWidth: 0.9833,
                }}
                transform="matrix(.79579 0 0 1.09654 810.16 -176.908)"
              >
                <path
                  id="rect3"
                  d="M0 0h1600v900H0z"
                  className="cls-12"
                  style={{
                    fill: 'url(#linear-gradient)',
                    strokeWidth: 0.9833,
                  }}
                />
                <g
                  id="g139"
                  style={{
                    strokeWidth: 0.9833,
                  }}
                >
                  <g
                    id="g69"
                    style={{
                      strokeWidth: 0.9833,
                    }}
                  >
                    <g
                      id="g35-8"
                      className="cls-18"
                      style={{
                        opacity: 0.1,
                        strokeWidth: 0.9833,
                      }}
                    >
                      <g
                        id="g3-4"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline3"
                          d="M0 260.61h94.31l26.14-17.13h37.72l19.61 30.93h107.79l22.63-15.47h64.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle3"
                          cx={372.11}
                          cy={258.94}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g4-8"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline4"
                          d="M0 279.81h94.75l26.58-17.44 33.75.32 20.37 30.92h110.12l22.63-15.46h98.76"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle4"
                          cx={406.8}
                          cy={278.15}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g5-0"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline5"
                          d="M0 299.31h94.75l26.58-17.45 33.75.32 20.37 30.92h107.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle5"
                          cx={282.35}
                          cy={313.1}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g6"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline6"
                          d="M179.16 360.12H80.85l-22.63 15.47H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path6"
                          d="M178.97 356.42c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g7"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline7"
                          d="M0 358.76h58.22l22.63-15.46h101.83l14.86-14.86h51.08l14.09 14.08h50.84"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path7-4"
                          d="M313.37 346.23c2.04 0 3.7-1.66 3.7-3.7s-1.66-3.7-3.7-3.7-3.7 1.66-3.7 3.7 1.66 3.7 3.7 3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g8-6"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line7"
                          d="M0 309.46h137.88"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle7"
                          cx={137.72}
                          cy={309.46}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g9"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline8"
                          d="M217.38 428.12h-98.3l-22.63-15.46H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle8"
                          cx={217.2}
                          cy={428.12}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g10-0"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline9"
                          d="M240.22 443.59H119.08l-22.63-15.47H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path9-3"
                          d="M240.04 439.88c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g11-2"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="path10-6"
                          d="M0 227.1h163.21l23.67 34.9"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path11-9"
                          d="M184.12 263.67a3.218 3.218 0 1 0 5.33-3.61 3.218 3.218 0 1 0-5.33 3.61z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g12-4"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline11"
                          d="M0 214.44h175.62l31.72 49.48h54.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path12"
                          d="M261.24 267.14c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g13-1"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline12"
                          d="M0 201.24h206.12l17.02 25.86h59.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle12"
                          cx={282.35}
                          cy={227.1}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g14"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline13"
                          d="M0 76.95h80.47l31.51 31.52h108.1"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle13"
                          cx={219.92}
                          cy={108.47}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g15"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline14"
                          d="M0 94.72h80.47l31.51 31.51h88.56l21.01 21.01h87.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path14"
                          d="M308.76 150.46c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g16"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline15"
                          d="M0 110.48h75.32l30.72 30.72h80.92l27.28 27.28 73.18-.52"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle15"
                          cx={287.26}
                          cy={167.96}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g17-3"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line16"
                          d="M0 125.84h65.86"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle16"
                          cx={65.7}
                          cy={125.84}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g18"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line17"
                          d="M0 143.06h82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle17"
                          cx={82.83}
                          cy={143.06}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g19"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line18"
                          d="M0 241.55h82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle18"
                          cx={82.83}
                          cy={241.55}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g20"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line19"
                          d="M109.69 187.83h135.87"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path19"
                          d="M245.4 191.05c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g21"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline20"
                          d="M250.65 244.73H216.1l-20.84-33.46"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle20"
                          cx={250.49}
                          cy={244.73}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g22-7"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline21"
                          d="M0 189.34h85.83l18.29-18.29h79.78"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle21"
                          cx={183.74}
                          cy={171.05}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g23"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline22"
                          d="M0 174.87h71.61l19.37-19.37 35.77.8"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path22"
                          d="M126.52 159.51c1.78.04 3.25-1.37 3.29-3.15a3.219 3.219 0 0 0-3.15-3.29 3.219 3.219 0 0 0-3.29 3.15 3.219 3.219 0 0 0 3.15 3.29z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g24-8"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line23"
                          d="M0 158.41h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle23"
                          cx={52.66}
                          cy={158.41}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g25-8"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line24"
                          d="M0 339.86h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle24"
                          cx={52.66}
                          cy={339.86}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g26-3"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line25"
                          d="M0 443.59h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle25"
                          cx={52.66}
                          cy={443.59}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g27-8"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line26"
                          d="M134.85 393.49h32.81"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path26"
                          d="M167.5 396.71c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g28"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line27"
                          d="M0 324.95h125.55"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle27"
                          cx={125.39}
                          cy={324.95}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g29"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline28"
                          d="M0 399.91h116.96l9.25 9.25h140.28"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle28"
                          cx={266.33}
                          cy={409.16}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g30"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline29"
                          d="M0 389.35h86.05l17.43-11.48h101.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path29"
                          d="M204.39 381.09c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g31"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline30"
                          d="M0 60.8h44.46V26.86h188.09"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle30"
                          cx={232.39}
                          cy={26.86}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g32-1"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline31"
                          d="M0 39.87h29.13V13.85h72.11"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path31-5"
                          d="M101.08 17.07c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g33-3"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline32"
                          d="M261.33 39.87H122.47l21.62 21.62h85.62"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path32-5"
                          d="M261.16 36.65c1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <circle
                          id="circle32"
                          cx={229.54}
                          cy={61.49}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g34-4"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline33"
                          d="M252.92 93.8H121.38L86.05 58.47l-23.9-1.1v-17.5h30.34l37.2 37.2h82.26"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle33"
                          cx={252.75}
                          cy={93.8}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <circle
                          id="circle34"
                          cx={211.79}
                          cy={77.07}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                    </g>
                    <g
                      id="g68"
                      className="cls-18"
                      style={{
                        opacity: 0.1,
                        strokeWidth: 0.9833,
                      }}
                    >
                      <g
                        id="g36"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline35"
                          d="M0 703.18h94.31l26.14-17.13h37.72l19.61 30.92h107.79l22.63-15.46h64.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path35"
                          d="M372.11 704.73c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g37"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline36"
                          d="M0 722.38h94.75l26.58-17.44 33.75.31 20.37 30.93h110.12l22.63-15.46h98.76"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path36"
                          d="M406.8 723.94c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g38"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline37"
                          d="M0 741.87h94.75l26.58-17.44 33.75.32 20.37 30.92h107.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path37"
                          d="M282.35 758.89c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g39"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline38"
                          d="M179.16 802.69H80.85l-22.63 15.46H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path38"
                          d="M178.97 798.99c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g40"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline39"
                          d="M0 801.33h58.22l22.63-15.46h101.83L197.54 771h51.08l14.09 14.09h50.84"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path39"
                          d="M313.37 788.79c2.04 0 3.7-1.66 3.7-3.7s-1.66-3.7-3.7-3.7-3.7 1.66-3.7 3.7 1.66 3.7 3.7 3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g41-3"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line40"
                          d="M0 752.03h137.88"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path40-6"
                          d="M137.72 755.25c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g42"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline41"
                          d="M217.38 870.69h-98.3l-22.63-15.46H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path41"
                          d="M217.2 866.99c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g43"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline42"
                          d="M240.22 886.15H119.08l-22.63-15.46H0"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path42"
                          d="M240.04 882.45c2.04 0 3.7 1.66 3.7 3.7s-1.66 3.7-3.7 3.7-3.7-1.66-3.7-3.7 1.66-3.7 3.7-3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g44-5"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="path43"
                          d="M0 669.67h163.21l23.67 34.9"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path44"
                          d="M184.12 706.24a3.218 3.218 0 1 0 5.33-3.61 3.218 3.218 0 1 0-5.33 3.61z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g45"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline44"
                          d="M0 657.01h175.62l31.72 49.48h54.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path45"
                          d="M261.24 709.71c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g46-9"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline45"
                          d="M0 643.8h206.12l17.02 25.87h59.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle45"
                          cx={282.35}
                          cy={669.67}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g47"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline46"
                          d="M0 519.52h80.47l31.51 31.51h108.1"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle46"
                          cx={219.92}
                          cy={551.03}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g48-5"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline47"
                          d="M0 537.29h80.47l31.51 31.51h88.56l21.01 21.01h87.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path47"
                          d="M308.76 593.03c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g49"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline48"
                          d="M0 553.04h75.32l30.72 30.72h80.92l27.28 27.29 73.18-.52"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle48"
                          cx={287.26}
                          cy={610.53}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g50"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line49"
                          d="M0 568.4h65.86"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle49"
                          cx={65.7}
                          cy={568.4}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g51"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line50"
                          d="M0 585.62h82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path50"
                          d="M82.83 588.84c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g52"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line51"
                          d="M0 684.12h82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path51"
                          d="M82.83 687.34c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g53"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line52"
                          d="M109.69 630.4h135.87"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path52"
                          d="M245.4 633.62c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g54"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline53"
                          d="M250.65 687.3H216.1l-20.84-33.46"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle53"
                          cx={250.49}
                          cy={687.3}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g55"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline54"
                          d="M0 631.9h85.83l18.29-18.28h79.78"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle54"
                          cx={183.74}
                          cy={613.62}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g56"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline55"
                          d="M0 617.44h71.61l19.37-19.37 35.77.8"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path55"
                          d="M126.52 602.08c1.78.04 3.25-1.37 3.29-3.15a3.219 3.219 0 0 0-3.15-3.29 3.219 3.219 0 0 0-3.29 3.15 3.219 3.219 0 0 0 3.15 3.29z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g57"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line56"
                          d="M0 600.98h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle56"
                          cx={52.66}
                          cy={600.98}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g58"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line57"
                          d="M0 782.43h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle57"
                          cx={52.66}
                          cy={782.43}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g59"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line58"
                          d="M0 886.15h52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle58"
                          cx={52.66}
                          cy={886.15}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g60"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line59"
                          d="M134.85 836.06h32.81"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path59"
                          d="M167.5 839.28c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g61"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line60"
                          d="M0 767.52h125.55"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path60"
                          d="M125.39 770.74c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g62"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline61"
                          d="M0 842.48h116.96l9.25 9.25h140.28"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path61"
                          d="M266.33 854.95c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g63"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline62"
                          d="M0 831.92h86.05l17.43-11.48h101.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path62"
                          d="M204.39 823.66c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g64"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline63"
                          d="M0 503.37h44.46v-33.95h188.09"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle63"
                          cx={232.39}
                          cy={469.42}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g65"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline64"
                          d="M0 482.44h29.13v-26.03h72.11"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path64"
                          d="M101.08 459.63c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g66"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline65"
                          d="M261.33 482.44H122.47l21.62 21.61h85.62"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path65"
                          d="M261.16 479.22c1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <circle
                          id="circle65"
                          cx={229.54}
                          cy={504.05}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g67"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline66"
                          d="M252.92 536.37H121.38l-35.33-35.33-23.9-1.1v-17.5h30.34l37.2 37.2h82.26"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle66"
                          cx={252.75}
                          cy={536.37}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <path
                          id="path66"
                          d="M211.79 522.86c1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                    </g>
                  </g>
                  <g
                    id="g138"
                    style={{
                      strokeWidth: 0.9833,
                    }}
                  >
                    <g
                      id="g103"
                      className="cls-18"
                      style={{
                        opacity: 0.1,
                        strokeWidth: 0.9833,
                      }}
                    >
                      <g
                        id="g70"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline69"
                          d="M1600 260.61h-94.31l-26.14-17.13h-37.72l-19.61 30.93h-107.79l-22.63-15.47h-64.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path69"
                          d="M1227.89 255.72c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g71"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline70"
                          d="M1600 279.81h-94.75l-26.58-17.44-33.75.32-20.37 30.92h-110.12l-22.63-15.46h-98.76"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path70"
                          d="M1193.2 274.93c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g72"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline71"
                          d="M1600 299.31h-94.75l-26.58-17.45-33.75.32-20.37 30.92h-107.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path71"
                          d="M1317.65 309.88c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g73"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline72"
                          d="M1420.84 360.12h98.31l22.63 15.47H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle72"
                          cx={1421.03}
                          cy={360.12}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g74"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline73"
                          d="M1600 358.76h-58.22l-22.63-15.46h-101.83l-14.86-14.86h-51.08l-14.09 14.08h-50.84"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle73"
                          cx={1286.63}
                          cy={342.52}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g75"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line74"
                          d="M1600 309.46h-137.88"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle74"
                          cx={1462.28}
                          cy={309.46}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g76"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline75"
                          d="M1382.62 428.12h98.3l22.63-15.46H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle75"
                          cx={1382.8}
                          cy={428.12}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g77"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline76"
                          d="M1359.78 443.59h121.14l22.63-15.47H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle76"
                          cx={1359.96}
                          cy={443.59}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g78"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="path77"
                          d="M1600 227.1h-163.21l-23.67 34.9"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path78"
                          d="M1410.55 260.06a3.218 3.218 0 1 0 5.33 3.61 3.218 3.218 0 1 0-5.33-3.61z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g79"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline78"
                          d="M1600 214.44h-175.62l-31.72 49.48h-54.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path79"
                          d="M1338.76 260.7c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g80"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline79"
                          d="M1600 201.24h-206.12l-17.02 25.86h-59.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path80"
                          d="M1317.65 223.88c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g81"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline80"
                          d="M1600 76.95h-80.47l-31.51 31.52h-108.1"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path81"
                          d="M1380.08 105.25c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g82"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline81"
                          d="M1600 94.72h-80.47l-31.51 31.51h-88.56l-21.01 21.01h-87.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path82"
                          d="M1291.24 144.02c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g83"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline82"
                          d="M1600 110.48h-75.31l-30.73 30.72h-80.92l-27.28 27.28-73.18-.52"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path83"
                          d="M1312.76 164.74a3.218 3.218 0 0 0-3.24 3.2 3.218 3.218 0 0 0 3.2 3.24c1.78.01 3.23-1.42 3.24-3.2a3.218 3.218 0 0 0-3.2-3.24z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g84"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line83"
                          d="M1600 125.84h-65.86"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path84"
                          d="M1534.3 122.62c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g85"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line84"
                          d="M1600 143.06h-82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path85"
                          d="M1517.17 139.84c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g86"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line85"
                          d="M1600 241.55h-82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path86"
                          d="M1517.17 238.33c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g87"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line86"
                          d="M1490.31 187.83h-135.87"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path87"
                          d="M1354.6 184.61c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g88"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline87"
                          d="M1349.35 244.73h34.55l20.84-33.46"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle87"
                          cx={1349.51}
                          cy={244.73}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g89"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline88"
                          d="M1600 189.34h-85.83l-18.29-18.29h-79.78"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path88"
                          d="M1416.26 167.83c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g90"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline89"
                          d="M1600 174.87h-71.61l-19.37-19.37-35.77.8"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path89"
                          d="M1473.34 153.08a3.219 3.219 0 0 0-3.15 3.29 3.219 3.219 0 0 0 3.29 3.15 3.219 3.219 0 0 0 3.15-3.29 3.219 3.219 0 0 0-3.29-3.15z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g91"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line90"
                          d="M1600 158.41h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path90"
                          d="M1547.34 155.19c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g92"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line91"
                          d="M1600 339.86h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path91"
                          d="M1547.34 336.64c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g93"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line92"
                          d="M1600 443.59h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path92"
                          d="M1547.34 440.37c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g94"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line93"
                          d="M1465.15 393.49h-32.81"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path93"
                          d="M1432.5 390.27c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g95"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line94"
                          d="M1600 324.95h-125.55"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path94"
                          d="M1474.61 321.73c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g96"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline95"
                          d="M1600 399.91h-116.96l-9.25 9.25h-140.28"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path95"
                          d="M1333.67 405.94c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g97"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline96"
                          d="M1600 389.35h-86.05l-17.43-11.48h-101.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path96"
                          d="M1395.61 374.65c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g98"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline97"
                          d="M1600 60.8h-44.46V26.86h-188.09"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path97"
                          d="M1367.61 23.64c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g99"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline98"
                          d="M1600 39.87h-29.13V13.85h-72.11"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path98"
                          d="M1498.92 10.63c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g100"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline99"
                          d="M1338.67 39.87H1477.53l-21.62 21.62h-85.62"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path99"
                          d="M1338.84 43.09c-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22 1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <path
                          id="path100"
                          d="M1370.46 58.27c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g102"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline100"
                          d="M1347.08 93.8h131.54l35.33-35.33 23.9-1.1v-17.5h-30.34l-37.2 37.2h-82.26"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path101"
                          d="M1347.25 97.02c-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22 1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <path
                          id="path102"
                          d="M1388.21 73.85c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                    </g>
                    <g
                      id="g137"
                      className="cls-18"
                      style={{
                        opacity: 0.1,
                        strokeWidth: 0.9833,
                      }}
                    >
                      <g
                        id="g104"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline103"
                          d="M1600 703.18h-94.31l-26.14-17.13h-37.72l-19.61 30.92h-107.79l-22.63-15.46h-64.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path103"
                          d="M1227.89 698.29c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g105"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline104"
                          d="M1600 722.38h-94.75l-26.58-17.44-33.75.31-20.37 30.93h-110.12l-22.63-15.46h-98.76"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path104"
                          d="M1193.2 717.5c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g106"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline105"
                          d="M1600 741.87h-94.75l-26.58-17.44-33.75.32-20.37 30.92h-107.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path105"
                          d="M1317.65 752.45c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g107"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline106"
                          d="M1420.84 802.69h98.31l22.63 15.46H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path106"
                          d="M1421.03 806.39c-2.04 0-3.7-1.66-3.7-3.7s1.66-3.7 3.7-3.7 3.7 1.66 3.7 3.7-1.66 3.7-3.7 3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g108"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline107"
                          d="M1600 801.33h-58.22l-22.63-15.46h-101.83L1402.46 771h-51.08l-14.09 14.09h-50.84"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle107"
                          cx={1286.63}
                          cy={785.09}
                          r={3.7}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g109"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line108"
                          d="M1600 752.03h-137.88"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path108"
                          d="M1462.28 748.81c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g110"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline109"
                          d="M1382.62 870.69h98.3l22.63-15.46H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path109"
                          d="M1382.8 874.39c-2.04 0-3.7-1.66-3.7-3.7s1.66-3.7 3.7-3.7 3.7 1.66 3.7 3.7-1.66 3.7-3.7 3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g111"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline110"
                          d="M1359.78 886.15h121.14l22.63-15.46H1600"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path110"
                          d="M1359.96 889.86c-2.04 0-3.7-1.66-3.7-3.7s1.66-3.7 3.7-3.7 3.7 1.66 3.7 3.7-1.66 3.7-3.7 3.7z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g112"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="path111"
                          d="M1600 669.67h-163.21l-23.67 34.9"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path112"
                          d="M1410.55 702.63a3.218 3.218 0 1 0 5.33 3.61 3.218 3.218 0 1 0-5.33-3.61z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g113"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline112"
                          d="M1600 657.01h-175.62l-31.72 49.48h-54.06"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path113"
                          d="M1338.76 703.27c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g114"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline113"
                          d="M1600 643.8h-206.12l-17.02 25.87h-59.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path114"
                          d="M1317.65 666.45c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g115"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline114"
                          d="M1600 519.52h-80.47l-31.51 31.51h-108.1"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path115"
                          d="M1380.08 547.81c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g116"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline115"
                          d="M1600 537.29h-80.47l-31.51 31.51h-88.56l-21.01 21.01h-87.37"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path116"
                          d="M1291.24 586.59c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g117"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline116"
                          d="M1600 553.04h-75.31l-30.73 30.72h-80.92l-27.28 27.29-73.18-.52"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path117"
                          d="M1312.76 607.31a3.218 3.218 0 0 0-3.24 3.2 3.218 3.218 0 0 0 3.2 3.24c1.78.01 3.23-1.42 3.24-3.2a3.218 3.218 0 0 0-3.2-3.24z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g118"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line117"
                          d="M1600 568.4h-65.86"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path118"
                          d="M1534.3 565.18c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g119"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line118"
                          d="M1600 585.62h-82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path119"
                          d="M1517.17 582.4c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g120"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line119"
                          d="M1600 684.12h-82.99"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path120"
                          d="M1517.17 680.9c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g121"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line120"
                          d="M1490.31 630.4h-135.87"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path121"
                          d="M1354.6 627.18c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g122"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline121"
                          d="M1349.35 687.3h34.55l20.84-33.46"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <circle
                          id="circle121"
                          cx={1349.51}
                          cy={687.3}
                          r={3.22}
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g123"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline122"
                          d="M1600 631.9h-85.83l-18.29-18.28h-79.78"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path122"
                          d="M1416.26 610.4c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g124"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline123"
                          d="M1600 617.44h-71.61l-19.37-19.37-35.77.8"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path123"
                          d="M1473.34 595.64a3.219 3.219 0 0 0-3.15 3.29 3.219 3.219 0 0 0 3.29 3.15 3.219 3.219 0 0 0 3.15-3.29 3.219 3.219 0 0 0-3.29-3.15z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g125"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line124"
                          d="M1600 600.98h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path124"
                          d="M1547.34 597.76c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g126"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line125"
                          d="M1600 782.43h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path125"
                          d="M1547.34 779.21c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g127"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line126"
                          d="M1600 886.15h-52.82"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path126"
                          d="M1547.34 882.93c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g128"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line127"
                          d="M1465.15 836.06h-32.81"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path127"
                          d="M1432.5 832.84c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g129"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="line128"
                          d="M1600 767.52h-125.55"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path128"
                          d="M1474.61 764.3c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g130"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline129"
                          d="M1600 842.48h-116.96l-9.25 9.25h-140.28"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path129"
                          d="M1333.67 848.51c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g131"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline130"
                          d="M1600 831.92h-86.05l-17.43-11.48h-101.07"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path130"
                          d="M1395.61 817.22c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g132"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline131"
                          d="M1600 503.37h-44.46v-33.95h-188.09"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path131"
                          d="M1367.61 466.2c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g133"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline132"
                          d="M1600 482.44h-29.13v-26.03h-72.11"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path132"
                          d="M1498.92 453.19c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g134"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline133"
                          d="M1338.67 482.44H1477.53l-21.62 21.61h-85.62"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path133"
                          d="M1338.84 485.66c-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22 1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <path
                          id="path134"
                          d="M1370.46 500.83c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                      <g
                        id="g136"
                        style={{
                          strokeWidth: 0.9833,
                        }}
                      >
                        <path
                          id="polyline134"
                          d="M1347.08 536.37h131.54l35.33-35.33 23.9-1.1v-17.5h-30.34l-37.2 37.2h-82.26"
                          className="cls-6"
                          style={{
                            fill: 'none',
                            stroke: '#fff',
                            strokeWidth: '.845638px',
                            strokeMiterlimit: 10,
                          }}
                        />
                        <path
                          id="path135"
                          d="M1347.25 539.59c-1.78 0-3.22-1.44-3.22-3.22 0-1.78 1.44-3.22 3.22-3.22 1.78 0 3.22 1.44 3.22 3.22 0 1.78-1.44 3.22-3.22 3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                        <path
                          id="path136"
                          d="M1388.21 516.42c-1.78 0-3.22 1.44-3.22 3.22 0 1.78 1.44 3.22 3.22 3.22 1.78 0 3.22-1.44 3.22-3.22 0-1.78-1.44-3.22-3.22-3.22z"
                          className="cls-17"
                          style={{
                            fill: '#fff',
                            strokeWidth: 0.9833,
                          }}
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g
                id="g154"
                style={{
                  strokeWidth: 1.08129,
                }}
                transform="matrix(1.07072 0 0 .67396 839.799 175.632)"
              >
                <g
                  id="g146"
                  style={{
                    strokeWidth: 1.08129,
                  }}
                >
                  <path
                    id="path140"
                    d="M41.81 842.29v18.89c0 1.2.64 2.32 1.68 2.92l16.35 9.44c1.04.6 2.33.6 3.37 0l16.35-9.44c1.04-.6 1.68-1.71 1.68-2.92v-18.89c0-1.2-.64-2.32-1.68-2.92l-16.35-9.44a3.38 3.38 0 0 0-3.37 0l-16.35 9.44c-1.03.6-1.68 1.71-1.68 2.92z"
                    className="cls-20"
                    style={{
                      fill: '#213147',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <g
                    id="g142"
                    style={{
                      strokeWidth: 1.08129,
                    }}
                  >
                    <path
                      id="path141"
                      d="m65.11 855.39-2.33 6.39c-.07.18-.07.37 0 .55l4.01 11 4.64-2.68-5.57-15.27a.4.4 0 0 0-.75 0z"
                      className="cls-13"
                      style={{
                        fill: '#12aaff',
                        strokeWidth: 1.08129,
                      }}
                    />
                    <path
                      id="path142"
                      d="M69.78 844.63a.4.4 0 0 0-.75 0l-2.33 6.39c-.07.18-.07.37 0 .55l6.57 18.02 4.64-2.68z"
                      className="cls-13"
                      style={{
                        fill: '#12aaff',
                        strokeWidth: 1.08129,
                      }}
                    />
                  </g>
                  <path
                    id="path143"
                    d="M61.54 830.63c.12 0 .23.03.33.09l17.69 10.22c.21.12.33.33.33.57v20.43c0 .24-.13.45-.33.57l-17.69 10.23a.656.656 0 0 1-.66 0l-17.68-10.22a.643.643 0 0 1-.33-.57v-20.44c0-.24.13-.45.33-.57l17.69-10.22c.1-.06.22-.09.33-.09m-.01-2.98c-.63 0-1.26.17-1.82.49l-17.69 10.22a3.65 3.65 0 0 0-1.82 3.15v20.43c0 1.3.7 2.51 1.82 3.16l17.69 10.22c.56.33 1.19.49 1.82.49.63 0 1.26-.17 1.82-.49l17.69-10.22a3.633 3.633 0 0 0 1.82-3.16v-20.43c0-1.3-.7-2.51-1.82-3.16l-17.68-10.21c-.57-.33-1.2-.49-1.83-.49z"
                    className="cls-19"
                    style={{
                      fill: '#9dcced',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="polygon143"
                    d="m54.74 867.88-3.05 2.8-1.85-1.06 1.63-4.46z"
                    className="cls-20"
                    style={{
                      fill: '#213147',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <g
                    id="g145"
                    style={{
                      strokeWidth: 1.08129,
                    }}
                  >
                    <path
                      id="path144"
                      d="M60.05 840.05h-4.48c-.33 0-.64.21-.75.52l-9.62 26.36 4.64 2.68 10.59-29.03c.09-.26-.1-.53-.38-.53z"
                      className="cls-17"
                      style={{
                        fill: '#fff',
                        strokeWidth: 1.08129,
                      }}
                    />
                    <path
                      id="path145"
                      d="M67.9 840.05h-4.48c-.33 0-.64.21-.75.52l-10.98 30.11 4.64 2.68 11.95-32.77c.1-.27-.1-.54-.37-.54z"
                      className="cls-17"
                      style={{
                        fill: '#fff',
                        strokeWidth: 1.08129,
                      }}
                    />
                  </g>
                </g>
                <g
                  id="g153"
                  style={{
                    strokeWidth: 1.08129,
                  }}
                >
                  <path
                    id="path146"
                    d="M101.98 845.54c.44 0 .83.09 1.13.28.31.19.61.54.91 1.07l5.85 10.62c.06.12.07.22.04.3-.03.08-.12.12-.26.12h-2.25c-.2 0-.33-.08-.4-.23l-1.25-2.28h-8.3l-1.22 2.28c-.08.16-.22.23-.4.23h-2.3c-.16 0-.25-.04-.28-.12-.03-.08-.02-.18.04-.3l5.8-10.62c.3-.53.58-.89.87-1.07.29-.19.61-.28.99-.28zm-3.44 7.81h6.09l-2.81-5.18c-.05-.08-.11-.13-.2-.13h-.11c-.08 0-.15.04-.2.13l-2.78 5.18z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path147"
                    d="M122.73 845.54c1.36 0 2.32.31 2.92.92.6.61.89 1.52.89 2.72v1c0 1.01-.21 1.81-.62 2.4-.41.59-1.08.97-2.02 1.13l3.02 3.74c.06.06.08.15.05.27-.02.12-.12.18-.29.18h-2.28c-.16 0-.26-.02-.32-.05a.764.764 0 0 1-.18-.18l-2.8-3.67h-5.71v3.52c0 .26-.13.38-.38.38h-1.91c-.28 0-.4-.13-.4-.38v-11.45c0-.35.18-.53.53-.53zm-7.32 6.31h6.77c.6 0 1.02-.13 1.27-.38.25-.26.37-.65.37-1.18v-.74c0-.53-.13-.93-.37-1.18-.24-.25-.67-.38-1.27-.38h-6.54c-.16 0-.23.07-.23.22v3.65z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path148"
                    d="M141.32 845.54c1.21 0 2.08.25 2.59.73.51.48.77 1.21.77 2.19v.85c0 .99-.37 1.73-1.13 2.25.81.47 1.22 1.23 1.22 2.28v1.02c0 .47-.05.9-.16 1.27s-.28.7-.52.97c-.25.27-.56.47-.97.61-.4.14-.9.22-1.49.22h-10.5c-.35 0-.53-.18-.53-.53v-11.31c0-.35.18-.53.53-.53h10.19zm-8.01 5.14h7.25c.59 0 .99-.09 1.2-.27.21-.18.32-.43.32-.78v-.6c0-.36-.1-.63-.31-.81-.21-.17-.54-.26-1-.26h-7.23c-.16 0-.23.08-.23.23v2.48zm0 1.93v2.63c0 .16.08.23.23.23h7.25c.47 0 .81-.09 1-.26.19-.17.31-.44.31-.82v-.67c0-.36-.11-.64-.33-.83-.22-.19-.62-.29-1.21-.29h-7.25z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path149"
                    d="M151.36 845.54c.26 0 .38.13.38.38v11.6c0 .26-.13.38-.38.38h-1.91c-.28 0-.4-.13-.4-.38v-11.59c0-.26.14-.38.4-.38h1.91z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path150"
                    d="M169.88 845.54c.28 0 .4.13.4.38v1.73c0 .28-.14.4-.4.4h-5.55v9.46c0 .26-.13.38-.38.38h-1.93c-.26 0-.38-.13-.38-.38v-9.46h-5.55c-.28 0-.4-.14-.4-.4v-1.73c0-.26.14-.38.4-.38z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path151"
                    d="M183.86 845.54c1.36 0 2.32.31 2.92.92.6.61.89 1.52.89 2.72v1c0 1.01-.21 1.81-.62 2.4-.41.59-1.08.97-2.02 1.13l3.02 3.74c.06.06.08.15.05.27-.02.12-.12.18-.29.18h-2.28c-.16 0-.26-.02-.32-.05a.764.764 0 0 1-.18-.18l-2.8-3.67h-5.71v3.52c0 .26-.13.38-.38.38h-1.91c-.28 0-.4-.13-.4-.38v-11.45c0-.35.18-.53.53-.53zm-7.31 6.31h6.77c.6 0 1.02-.13 1.27-.38.25-.26.37-.65.37-1.18v-.74c0-.53-.13-.93-.37-1.18-.24-.25-.67-.38-1.27-.38h-6.54c-.16 0-.23.07-.23.22v3.65z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path152"
                    d="M193.8 845.54c.26 0 .38.13.38.38v7.05c0 .47.04.87.12 1.17.08.32.21.56.38.74.18.19.41.32.72.38.31.08.68.12 1.14.12h4.9c.46 0 .84-.04 1.14-.12.31-.08.54-.21.72-.38.18-.19.31-.43.37-.74.07-.32.11-.7.11-1.17v-7.05c0-.26.13-.38.38-.38h1.93c.26 0 .38.13.38.38v7.32c0 .85-.09 1.57-.27 2.17-.18.59-.46 1.07-.86 1.45-.39.37-.91.64-1.54.81-.63.17-1.39.25-2.29.25h-5.09c-.9 0-1.66-.08-2.28-.25-.62-.17-1.13-.43-1.53-.81-.39-.37-.68-.86-.87-1.45-.19-.59-.28-1.32-.28-2.17v-7.32c0-.26.14-.38.4-.38h1.89z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                  <path
                    id="path153"
                    d="M214.08 845.54c.26 0 .48.02.67.05.19.04.35.1.49.21.14.1.27.24.38.4.11.17.23.39.34.68l3.67 8.48c.05.11.13.16.25.16h.22c.12 0 .2-.05.25-.16l3.67-8.48c.12-.29.24-.51.34-.68.1-.17.24-.31.38-.4.14-.1.31-.17.48-.21.19-.04.4-.05.66-.05h1.89c.61 0 1.02.14 1.24.41.22.27.32.75.32 1.42v10.15c0 .26-.14.38-.4.38h-1.8c-.26 0-.38-.13-.38-.38v-9.23c0-.12-.05-.18-.14-.18h-.16c-.12 0-.2.05-.23.14l-3.57 7.92c-.14.32-.29.59-.43.81-.14.22-.31.39-.47.54-.17.14-.36.25-.58.31-.22.06-.47.09-.77.09h-.85c-.3 0-.55-.03-.77-.09a1.42 1.42 0 0 1-.58-.31 2.5 2.5 0 0 1-.47-.54c-.15-.22-.3-.48-.43-.81l-3.57-7.92c-.04-.1-.11-.14-.23-.14h-.16c-.1 0-.14.06-.14.18v9.23c0 .26-.13.38-.38.38h-1.8c-.28 0-.4-.13-.4-.38v-10.15c0-.67.11-1.14.32-1.42.22-.28.63-.41 1.25-.41h1.88z"
                    className="cls-17"
                    style={{
                      fill: '#fff',
                      strokeWidth: 1.08129,
                    }}
                  />
                </g>
              </g>
            </g>
            {
              'eyJ2ZXJzaW9uIjoiMSIsImVuY29kaW5nIjoiYnN0cmluZyIsImNvbXByZXNzZWQiOnRydWUsImVuY29kZWQiOiJ4nO1cXGtz2khcdTAwMTb9nl9BeT5OrOn3I1vzXHUwMDAxXHUwMDFix8YxxDE2jj3Zclx0XHUwMDEwWDYggsTLU/nve1x1MDAxYlx1MDAxYiQh8Vx1MDAxY3Cc3SXlxJFarX7cc+65t7v5+10ms1x1MDAxN4w6zt6HzJ4zrNpNt9a1XHUwMDA3e+/N9b7T9V2vXHK3yPj/vtfrVscl74Og8+GPP5pcdTAwMWU8cO/5wVx1MDAwN4pcdTAwMTB+fshpOi2nXHUwMDFk+FDsL/h/JvP3+O/Ia9yW3XDGhceXw7dgxejs5aLXXHUwMDFlv1x1MDAxMjOJXHUwMDExxVKQaVx0t11zhqZCXHUwMDFih7W5flx1MDAwZVpcdTAwMTA4NbhRt5u+XHUwMDEz3jGX9lx1MDAwZTquo77u39Tcu0G7LMR15VFfh4/X3WazXHUwMDE0jJrjhvpcdTAwMWWMRnjPXHUwMDBmut6jc+3WgvvJkESuz3uq6/VcdTAwMWH3bcc3XHUwMDAzgqdXvY5ddYORuYbQ9KrdbozrXGKvmP5xqSzEOCeMSclcdTAwMTmX07vmeWnuYio0kURJguhMu1x1MDAwZb2m1zXtXG66dtvv2F2YnLB1XHUwMDE1u/rYgCa2a4vLXHJees2ZxYWQnEuOXHUwMDEx0UKLaZF7x23cXHUwMDA3i8v4znhiXGJiXGZTLkV4xzSik6+Nzebf4XR07ZaTN4+0e81mdEzbtZcxjd2omFx1MDAxYkezXHUwMDE2XHUwMDE4tcKIKVxcl6UqXVx1MDAwZm5ur++8i881JHv8s5x2OWaydrfrXHL2pnd+vF9UL5JZu3WAveHd3Z26fuRcdTAwMGb3p2hcdTAwMWL1dq4+ee3Ds1x1MDAwN1T9lC1cdTAwMGb0/uCroo3V6n35LVx1MDAxY9hep2Y/g1x1MDAwNIPZaKa5ppqE09F024+zg1x1MDAwYmh/TMGVXHUwMDFm2EHPXHUwMDFmW77dd2oxLD3P3Vx1MDAxZVZcdTAwMTUpUUVWhaZcdTAwMTIsw9a4Wqshzlx1MDAxZElR3Vx1MDAwNmhcdTAwMTOJ6kpFsFx1MDAwNsTixCZcdTAwMTCHXHUwMDFkxZPuvItcZlqCZp7HIIVmXHUwMDE4xmL28pRmXHUwMDA04lhhSkNcYoY0Q1anmcW2tVx1MDAwNs3gmeur0EzY9nVoRiBmYUpcdTAwMDQlMFx1MDAwMlx1MDAxYXE1QzOAak1cYtzVMJezzZqyx2/YMX82Z1x1MDAxOGJJXHUwMDBlVoEowUIzyUhIdyHDXGJpXHUwMDExXHUwMDA17oJQITUlbJZgOFNYYIbDPmzMLyFcdTAwMTAnlkVervxcYvu4XHUwMDFh7UwsM3CGQVx1MDAxY7fPRiNPL5qlQuX4a7PpuddcdTAwMWavRqWbh/brobhcdTAwMWJcdTAwMWOArbvtRrzXL1x1MDAwZT2/gvs0I+pVx2Swj8BnaSSlYIRJTlx1MDAxNFx1MDAxNzRSrGF3oFx1MDAxMLVcdTAwMTjBTID7wlxig1x1MDAwM6MsWpM7dGrnnttcdTAwMGVeupBcdTAwMTh2p11b3mJ/0D8r1dunhU/fXHUwMDBmPotcdTAwMGU+ffhy+TWtxchcdTAwMDKFQcBtXHRBXHUwMDE5x1LLRHuFJVx1MDAxMKVcXGm4KVx1MDAxNFdireY2bT849FotN1xi4iXjk5A1vHXv2Fx0q4TuRu/NXHUwMDEyXFzH1Fx1MDAxOLe+v1wiNoaiXHUwMDA2h6a///t9aun5KDSf/Vx1MDAwNFx1MDAwMMP6XHUwMDEyRuo0K94gtLiFnFx1MDAxZENGVFx1MDAxOUo2ezVkbJg2uE/ShCFdnbHTwfe2hSFmllx1MDAwMFx1MDAwMGmCJFVcdTAwMTSHbzbPM64trCXX5qZEWs1Vhv+Ys6FcdIBcZvMmRIjmNFwiQqecTaVcdTAwMDXAXHUwMDEyXHUwMDFhdFx1MDAxZlx1MDAwMmbQOKFcbjVcdTAwMThcdTAwMTS0MzKRO1x1MDAxMoVcdTAwMGJcYpRgymQ4ymtcdTAwMTBo3WtcdTAwMDcl92lsktxCgjNcdD9cdTAwMTBcdTAwMTZpLWSs1Ee75TbNXGbx6eWx3cMol1x1MDAwMqeTwd/aV77TzdScjue7gZ+pQ/v9vVjhbNNtXHUwMDE4YOxVoVNON4aZwFx1MDAwNfE0LdBya7VmZG6r0Fx1MDAwMtttO938KkLF67pccrdtNy/XaaDdXHUwMDBivFx1MDAwYsd/XHUwMDFljKDbc6Lj6ZxMLFx1MDAwMluEL2SDrlNccp4tP4VcdTAwMTJcYpDwXFxOMHZcdTAwMGbUhUPWXGI5QazOXHSfyv3hYX14p7+eVfOl0UlcdTAwMWKz2/PX4oRcclWc1lx1MDAxNlx1MDAwMznNXHUwMDExuFxccFVxXHUwMDE1xzWYJkSJXHUwMDE4OFx1MDAxYkmIpndGXHRcdTAwMTRAXHUwMDAwXHUwMDAxXHUwMDFlg7dhRTBcdTAwMGbnaspcYlxmQ+BKXGLgXHUwMDBlacwgUpwlXHUwMDA0XHTMRbRCWyCEpIqju1Jx5LF6VVx1MDAxY2RtfntGXHUwMDFmbr0uy172+z87dlx1MDAxNF/y9TJufqyd+P5d/jo4b95W8m8+JuVaRLzWcjJOZZNFs1x1MDAxMnJqqlx1MDAwMFx1MDAxOY5cdTAwMDNcdTAwMWZcdTAwMDBcdTAwMTRcdTAwMDKJQVx1MDAwNJFK8LiTXHUwMDA1r1x1MDAwN2FcdTAwMTGFjzRcIleqXHUwMDA0XHUwMDEwMDcltFJcZqQjQVEvPUVcdTAwMDJZhOptIfPnxpxrITdC1uW9VDzHZfMzXWBtsmSCRvhcIqIguZqbW4RcdTAwMTBcdTAwMDUkktLh5M13XGazJFx1MDAxMWtIulx1MDAwNbM1LDihXGKyvWpcdTAwMDBNdcDdXHUwMDFhz921q9EpjWhcdTAwMGVcdTAwMTG7OkdjbE02LPGMs7JhYS+2JVx1MDAxN+YmfDiJSLqZuVx1MDAwN/lcZtDFOozlXCLWp1aXXG6LifttJnwohLxSKeAtwjlX4ZvHXHRcdTAwMWZcdTAwMDG8xZBJzXFcdTAwMDJhL5tp11x1MDAxNqNcdTAwMDdKLYmQXHUwMDEwmGIpXHUwMDA1iqi2KUOCorOYYEDAUmHBNIsoqlx1MDAxN/RcdTAwMGLBKGZcItLQX1wi55NrXlx1MDAxZNWvPtpBtnjFRdb96jrH6+d8ZFx1MDAxNDM/MecjmZRcdTAwMTD7XHUwMDEwXHUwMDA2ulxyoKVcIqWeUyiYWExcdTAwMWHtrqXAXHUwMDE4yDGaZdlSymcxOWWiKVx1MDAxZlx1MDAwNmExXHUwMDA1+FONXHUwMDE1gj880WBtQUuhV5JhpKHJeq32/ko5XHUwMDFmjJSFOVKUXHTJXHUwMDE4w9HByGT2XHUwMDE5t1x1MDAwNJdcdTAwMWEh8sxcdTAwMDdsaX1zcT2uL1x06bDChNVvI4lE5jpcdTAwMDFJgOm4YmkpJMXWyCGlgvltO1x1MDAwMVx0gFx1MDAwNNMmSlx1MDAxMLDyUCON1a1cdTAwMDSEMFx1MDAwZZqVzzRom+xPwEpAfoFdgX6jOnxVXHUwMDE4KUbU8MtcblwiXHUwMDA18qBsXHUwMDFioeHmuVwiSlx1MDAxOVx0NeOGuaKVdNveJPVCXlIvfq/SMpmXg6g1bFXhLVx1MDAxMTSpiaGFrdu5zFx1MDAwM1x1MDAxMc9nL08lPkRvnFx0nLasV1hcdTAwMWTgi8PdN1x0cC2B1TXHXHUwMDEy+Fx1MDAxN0v4iSOcSVx1MDAwYpiZi1x1MDAxZFwiXHUwMDFjgmOYUymmLUjJXHUwMDBlY1x1MDAwMdqBQvSGoJCASC5cdTAwMTQ0L4hcdTAwMTdcXHNcdTAwMDS92MKWgVeUd6fZVuHQP3ZcXDS4XHUwMDFj3Vxcn1x1MDAxNL6gL+dvS96trJZA3ilcdTAwMDTKjUHEIJngoJqS8lx1MDAwZVtcdTAwMWOZxCsxs00wwtGKtiPvVtaj4LxAs1x1MDAxMSFgIJXWlOhke4lFQc9gXHIxICOMM7pWe38lebdcdTAwMGaOVmhMXHUwMDA0VTpcdTAwMGVD85HMXCJMIE0lX17RXFxAm09cdTAwMTLKO9Z1dP46gJJcdTAwMTRzQmTaOkBxddpPR/FcdTAwMDa0/3prg9BzQKJgQktcImL0PpqoPil2SvuYS1x1MDAwYjQ+NFx1MDAwNDGh5EqyXHUwMDBlwlx1MDAwZsFBVG2D5TfXdSb+XHRH/VV0XHUwMDFk/daO5Mi6jt/xdrfmt0TFpEq7ZVxy3Ja6q7l2XHUwMDBiak7dXHUwMDA0XHUwMDAwszNcdTAwMTfpXHUwMDFjcZNPXHUwMDEwaWm8qzX2bdEj/8ix/ZG4/d6/OLrL3d98LL9cdTAwMTbSN13x41x1MDAxNsTQOFxuMfMklcLaoagjXHUwMDEw3Jt3oudPiJcpvEVcdTAwMTLeXHUwMDEyI1x1MDAwZXxEN1xcXHUwMDE3+ElcIs4+PVatk9p9N3etjjymWlx1MDAwM1o9+9krb3f10kn5bHRcdTAwMWJo77j11L85XHUwMDA3rq1va+WNQUSgSFx1MDAxNMKbrLwt3dWD6NyUjFFcdTAwMTVcdTAwMDIznbpcdTAwMTGzvDqg0+fubbturE3eTIHnxkJqoeOw1ruENXBcdTAwMDbWXHUwMDEwLppdcFxmReVB2mLlXHUwMDA01kRyXHSt5VvYbrmx117bZP+h13a+91x1MDAxYzDV7o589Fx1MDAxMkeU8NHJ5uw830J5JEqfgS8j2uz9T0Xv7eroXUyebzLfoji4Y0AtI0hxxkX8tFx1MDAwNuDEbNlcdTAwMWLHWbtT3lx1MDAxNuVKUI2FXHRoKU47pIEpt0DmXHUwMDEyxKiQkpDEbjxcYt2FwVx1MDAxNN05qDdzym3RKPNOufz0eIzOnuzH795cdTAwMWS5WX97yUaL8zvIrCBMXHUwMDAxM5pjLFx1MDAxOZM8tlx1MDAxM/olVcEtJlx1MDAwNCacy/HWrXCfZGZrqZXFrJOJplZcdTAwMTDiSDGluCZcdTAwMTRcdTAwMDH162RyRVpMIanBXHUwMDE2lVk7k+vt7v6VcivzXHUwMDExZz77JiOiiTZR8PKaXHUwMDAwmUxhplx1MDAwMH0wvixeU1x1MDAwMrZhfVx0g99GbkXP33dNKGGSReghZHh7dYZPh/Gb1mdSgmFcdTAwMWJcdTAwMDZcdTAwMDdcdTAwMDfHiUYz266FwYaiiGlcZlx1MDAwMpewXHUwMDFkbpxcdTAwMTDY0lorOTGuJM2rpFjDYD3wXHUwMDE03sI+ic1TLFxuoUj251VSLCyWwZhsQ8p8a5deVqtcdTAwMDKvkyGZilvzv7UvPZPj8Jp9J2OPn9mRzFtcInBSUzFzOrJmN3a/XHUwMDFjx+ZHd5pcdTAwMDOBmURbXG551Fcnj8Ux8Fx1MDAxYpWHzOJcZmNOzYZcdTAwMTOi41x1MDAwYu5UQHDHMWCDKFx1MDAxM1Xtbn82Nlx1MDAwNzakoIib/Vx1MDAxZVx1MDAwMqOUY3ZcdTAwMTjaioWQXHUwMDA0XHUwMDExJKC4Stl0XHUwMDA1nl9JvHsy2Uwk1lx1MDAxZVx1MDAwZVipk32ij4efy539XuWWlc/WXHUwMDEyiYLiXHKTwSuKxJUl11gkXG5tYovxmTktYzJjolx1MDAxMpFFXHUwMDA1MflAyVx1MDAxOfzNd6BcdTAwMTJXPlJcdTAwMDdNpphcIiNYXHUwMDAw62DPKfurMFhcIihcdTAwMTmlXHUwMDE0XHUwMDE0XHUwMDEx0d3+/3Uqcbw/jlx1MDAxMameoU+Eji2c7Vx1MDAwYmVcdTAwMTFqdjCaXeJcdTAwMDB+sqxCZCmwXHUwMDA1UIlSciwpm91hlcDvrtXi/HxcdTAwMDCjxCxcYqfx/Vx1MDAxYdm8dDy/acKXkoJcdTAwMWUkZlx1MDAxOVJcdTAwMTPCI7G4eVx1MDAxZVx1MDAxNPxzPkBcdTAwMDBEXHUwMDE041LONGy7anHZQYRod6Z60ShLSbexr3ZjvUg14CXMg76KXuSgXGYnWbVMp+uCXHUwMDE2XHUwMDBioFwiUFX2s/pcbqVcdTAwMTdcYr7mt3bgZZy23+uC1nouXHUwMDAwRVx1MDAxYk4wUWC72qi1RFx1MDAwNKVKyFx1MDAxZPbtn+pKd1x1MDAwNVx1MDAxN7PohOD4YCzVXHUwMDE2RF4ksSZcdTAwMDa0alGpdCyzPVx1MDAwMVxiU8RcdTAwMDIypWlxXHUwMDE0gJhcdTAwMWFJxlx1MDAxN6D9f/qgjpt+TmeVc3fTtX9BXHUwMDA0g5BZRaEw8Sx0rmtcdTAwMDGBwSGildFgYuXjO1x1MDAxYurKu4NcdTAwMTb5nKv0/XP/vlxcKV7psv+9sOrK3a6+d2anK4JcdTAwMWOUXHUwMDA2XWez61x1MDAwMnCnj15cdTAwMDLcybN4Qlx1MDAwMa6RSTtpyUFMxlfGjNxBbCZcdTAwMTMy9X5cdTAwMDBublx1MDAwZfBcdTAwMTHOQGqq/1x1MDAxZsNbXHUwMDA33Vx1MDAwZunoTjuFR2H8jdJLfMWOYVGdwPZUIHKzZlx1MDAwMjHLXHUwMDA2IF5yXHUwMDA2b13LTciB7KxPhN/PXCJfXHUwMDA29POO4S1xk3OO4c3tyNq++91cdTAwMGJn7NmdTimAcZ9S/l7fdVx1MDAwNlx1MDAwN0lM/FZXdV23XHL3jMlh/C1RoadY/auiQt9cdTAwMDKD1HIuo18u94ffb/w+bDUjgcV4uNb/XHUwMDFlKrAl++ribFx1MDAxY3vAr1x1MDAxZmLV/6ti+45g789PiuR2dMAq18Ne9Vx0ufbJXHUwMDA1qua8/lx1MDAxOa3R2ojTwoj3q61qv/CQXHUwMDFkXHUwMDE0XHUwMDBl9VOtVXXzJ7XO7cmFd17Ks0LuYOBcdTAwMWPmXHUwMDFi9nG5c0vuUfRardVs1tBp38kht3CYXHUwMDFk5HN5NP5xXHUwMDBmWvb10D8vnfYqhDfzXHUwMDBm7NP5cbFTbVx1MDAxNf3b0sHDuPxl3s1cdTAwMWZcdTAwMTc51Eeg/Fxi/o08l38oXFxcdTAwMTVGxaeLXFzeVb9cdTAwMWY+XGZcdTAwMDc3Xy+8/LFcdTAwMWXcXFxcdTAwMTc7tZNHnX/I9oqlfONcdTAwMTbqurzMw7uP6NlDOVx1MDAwN/1oXHUwMDE0Llx1MDAxZnufL1x1MDAxYrgwyo6gXaOCm1x1MDAxZMLPqPBYMO1cdTAwMWLlc1+iZdDk2eJhdlgssUHh8lx1MDAwYs3nqr3iZWNYfMpD2Vx1MDAwMvyYf4u5wuVNr5g7YvDc8KX+yDPTdtjz+zLoV+lt+7zx559cdTAwMTHodJ1cdTAwMTgxcMQpjYRjJpNw4Vx1MDAwNF3X6UdKQfhGQFx1MDAxMk7N/ce7XHUwMDFm/1x1MDAwMevfIYAifQ=='
            }
            <defs id="defs1">
              <mask id="mask43" maskUnits="userSpaceOnUse">
                <g
                  id="g44"
                  style={{
                    strokeWidth: 1,
                  }}
                  transform="translate(-457.487 -530.223)"
                >
                  <path
                    id="rect43"
                    fill="#fff"
                    d="M0 0h890.745v790.958H0z"
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                  <path
                    id="rect44"
                    fill="#000"
                    d="M346.236 584.469h157.12v40h-157.12z"
                    opacity={1}
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                </g>
              </mask>
              <mask id="mask44" maskUnits="userSpaceOnUse">
                <g
                  id="g46"
                  style={{
                    strokeWidth: 1,
                  }}
                  transform="translate(-457.487 -530.223)"
                >
                  <path
                    id="rect45"
                    fill="#fff"
                    d="M0 0h890.745v790.958H0z"
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                  <path
                    id="rect46"
                    fill="#000"
                    d="M346.236 584.469h157.12v40h-157.12z"
                    opacity={1}
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                </g>
              </mask>
              <mask id="mask46" maskUnits="userSpaceOnUse">
                <g
                  id="g48"
                  style={{
                    strokeWidth: 1,
                  }}
                >
                  <path
                    id="rect47"
                    fill="#fff"
                    d="M0 0h890.745v790.958H0z"
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                  <path
                    id="rect48"
                    fill="#000"
                    d="M346.236 584.469h157.12v40h-157.12z"
                    opacity={1}
                    style={{
                      strokeWidth: 1,
                    }}
                  />
                </g>
              </mask>
              <mask id="mask-07AamB1ox___8Wk5jhJ07-5">
                <path id="rect13-5" fill="#fff" d="M0 0h343.771v867.627H0z" />
                <path
                  id="rect14-5"
                  fill="#000"
                  d="M151.869 582.504h132.704v40H151.869z"
                  opacity={1}
                />
              </mask>
              <linearGradient id="swatch4">
                <stop
                  id="stop4"
                  offset={0}
                  style={{
                    stopColor: '#f78400',
                    stopOpacity: 1,
                  }}
                />
              </linearGradient>
              <linearGradient
                id="linear-gradient"
                x1={800}
                x2={800}
                y1={905.32}
                y2={-3.69}
                gradientTransform="matrix(1.55615 0 0 .62133 .957 -.44)"
                gradientUnits="userSpaceOnUse"
              >
                <stop id="stop1" offset={0} stopColor="#12aaff" />
                <stop id="stop2" offset={0.3} stopColor="#1b4add" />
                <stop id="stop3" offset={0.75} stopColor="#152c4e" />
              </linearGradient>
              <style id="style1">
                {
                  '@font-face{font-family:Excalifont;src:url(data:font/woff2;base64,d09GMgABAAAAABasAA4AAAAAJpwAABZWAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhwbhlgcgXAGYAB0EQgKumCrPQtKAAE2AiQDgRAEIAWDGAcgG74do6KOslp2yf7qwDamPfQzoYQYYxuHja6yWrzskvdqmT34hNZrv+GK12WUUUaKqeH5c72PAagheEELV4Ozl3BrQcdOCgepEzuKEX3sp/vuJ+PJJ8LFmEw8kAIqoHF1pkrUd+pMeT6dfkmt1A7IduDtGsNN/GkByLBQZfegaaVWamc0AtshgTHJXgyBDxw8Hmn6H8C//+WcqQ24EZPd3cNA9fy8nVJJC8/bbldvHakIIfz6XuWfnY0gCFHIuvG/36/lt4kqmpmfSISqoTFMp5TlrZ5//0pi5qJWVZuIhMhQVZtrt7SNkDxUYmdodUujhI5FdIuYSxt87QOsCgIIAGRwAliEgCMFcRLQfQFA5CcKOp7EpgLhqc1eA4TX9tJqIHwoaqwDQigAQO5R6f5irwN44CYQCgbUZzgV3VcCwO/pQcMGBt6G6BrYU5mBQvNttlKo808WnayO3di+4yinbebr/sPfBvAbDNwM3RrYbLvOvbWhryO2g82hx/4lqU6v1iKywE1BWFB4BEQkZBRUdAxMbBx8AkIikpjNOA5dJgF8ELuAGcAIIFygqsCUAncL7HZRPCoyAho6MAN0wyKQCk8EyiSAJXAETJZIICGpMcJGIRs+TUU1QKwuW4AfbsuLAPvZXlIHqA8E7QE4lYYI4Y6oBzw7jwwhE5D3SyJwKPiShSC5GLAAgMeCGBwSAMIkcJsA4VNjwlcE6yNgglU7sPrJraBKrgrZ23IB6OWjSa0uH6yUifkZADE0aWgrwO/Qq411dXNjPOgHUu1N858Jsy9QzUMAFn1EL/qQ1LcJtl0CAGw7SvJGFRI9bLYlFUwjVppylZq1/w8AdexP/cIzRZGu5msYeOSS4/bbab111lgZBASFjAQ594Wppj9AeANI03C2MC2iPwy5OOC9gCwvjBeLEMiDg0ab1Py6NI6Gy4pISkgNZLvygiOpHv2UdKHYJVYrcPSk+XaCVTkxxpgACZE74BiLJiJzZnllDIw7Enn5x8lKcEC95w4xE2XmYwbXUy1SV5JqNa3mVoJ6MO3jvvjMOodN9mRwvLj//IEZjIOu5gBCCDGJTWwQnGUP3nty89WFconSnjtq7845R//pVoYcJNFJUgyvNFoxxwrRFKUBFB5umWn0elp6WWK+gX+ocJjARPnv3HZ655rsyLaRt19mQqT960ak8HnpYMW/yy5mMJwkp1cjzRl2LwMOwurkG/rIHbW1nRr3A4SQtyjLkc8hJW3Znu0Z2/IpVpqDak/jB94g2tMqXYKUEkm1mKX6mRWrI8OC/fNiPNKoRsCR5mi9eX0ICiZQHEdyMpBCvVIvTdH0ga3kAfKOixak8HRSDS8GKyvn6bv9qBRsBptjhVI/f9jMG4xhHxk5A8tshWGrCBPl3fJsKWxreiEAHwfp65jUMB1AanNEkwic3b2YW5NHo7VRMseB/0xkryN7HxlZWxkCXggUkEIePgTkFpjysdF8EfaZODw+zhnbaFDGVk+rkR0H7O5wiaqGlFJICSD3CCCJRNuuA8jv1iyexTHGebkhEw6GHBC6ZTbMFEVRH+2VY9VPvlA7DSNNwzzDJcU0Tdu2USSXYDhZhskr55oJ7PIaITB5JoMjXuMcxxfx+WEupeh1WjM3SQJ1kHxY1QpDfBGuzxsH6Z3XlOCWmQJ+S2fR88W9DcHbImcYNtrGM9UMz+xwQJw2oNVQtSzulIU0hDSkVJKcwh+cInQm9wGeLdGl00+sRNSfZL0UpTTtL3t5/y1rprZBfB7fYHZzE//sPnUdaVgyIyWDAAQc8IrkniYwwT/nWnzz0g/WbYGMFBv7RtZG6aRGwMnmddrOibtgNouxFYZlSzSpeNWkLoGEgMgsmGOlAgpE2SBJJJrMS6RCCCFb5p1097jRETlDYOb7mMWQjjRy1GoBwp3dzOhRMVTFzO+dbNDPxb7AbHhyP2t05P7WbImOANnVNZ2vEqdLTsBTIPUgXbYjsBUPtvnkLYafqNZpSAEMIa3TBI6gjTi4YzO2QshrcEtW+Wb/Im9sR5d5boer3bXe1ktKRX6+6Yt8KjsaU51vcY3j4O6F8otJMucedSucRNl/XhqW+5oQSKhO4fbhK8PYnKL0dNDcfvHeE1GNT3tLrqs5wAxs1EH2FIz/s6q3XOh+ESblJu1J+r1x3Vy2kZfmZBHiJMngxeYi2/e3sS/kvUxPoftGTa85XJMy/u4ogS4gCqXHjacV/nhJrUeqWDCJlP/CeU98JBjH8JUr7vKPA4UvS460m3w2+aocfxZnpIebBT7jlHKorjS0LPV+kvO/LJkn3YpWt30uFaVebq8z7w2KbIIbneb2T4O32AzXJ5BSF+quA5yS3UfRphmgKa/xYmb13K6atFsgCimaKhQkDbSSjE6Cv15TFPWznfJAFdJnvaKF42OBfZF7Kfn0LF3YF2+dq36gA10B2Z9GJ8MKAYT45C2FquLfaTFXwzWI2lzj0DpaHRbIbyS6RlEn558XKaM4KqTv0Bb4OVjuIztNY17Or9KM3nZ3od5yJIIHVzeRfdDx9uRLLO6JN33VJZ3COpV2OBdu0m5nKCD1cdb25LKr9mDGeeNFfpA9L4Zr0kDkDsuTpT/rTrsNXY0EKPqoVMfek7uydJEKwNuANiMgiJAtl5qAA9kyLBelJbtD8X2FexfimlN6V/YFNrK2HANoZVxJb0ns8BCzwQAP7rJwRDOJqOttyQUkqL/+nx0sNG0DnzfPVZMPkgEHMg5eNy0h8rbn2X2USkAASBecaMRpS3QEw18IyYIeWEpGaohtkdv//1exajHB/0KLfzpO31V0LnF0te5v1oag/uuPT2ru/dNq+Ndg3TOEyMn/gZeS5WvqHJ+/JZThFaRwGeC0WqBd40h1RyIk+nUmNhjD2PaUDy7RPf3t+K0nn10se5IOugoRUsaVyhCQIdjJUJc4BBCFx9lGp9HJ+WUWQkolvd5kPn61pZNJeKFaZj6KsqgV7b6HOm99J9gKreC9vnbFfEnGQQCIA0+TpUTotZfBaro1Xbb/0cmlZX/BQwEwxyhtH9vexm/NPsPyoNrL0AQW44u4Wp3MdUEw5sDcBAmwhL5GwzIDMH+bfpHRTGYHDLu3n5PxlhlFyPbsQHZ+cNlW336MvD1PyE0umWcDzCaqQzcDQ2lnjYZUdUXw4naGcTK10RD25nTQ0pP5doXUTRv1n6+nOe/DTs6kYw7K7FEmwYzr9iDF7Ak7ZAMf+4vHK6xI1WxBnYsvald4AUK2a5r1SE7m43OxsjKQs0ZejtHZYi1kO1SdZ0LUw3norAb/4RFycpKItqM6uymLK52EkFYIBwpRyujj1Myx+ffIy5ITcCn5nxwrg7gcz9RHjQxt8U0yDiIbMxzP4nKk2V5NbwOnWxuX+tj/iql+otIZ1PBb09OceySaIoWMx7/ptKda/irPvy+DUcrGv1VH6rulbTiqgSFXmt+0RNaIyfm3IMEZyAzVtZmJOEC+pBfjj3JczZOKh0u7haCk5EX/moKdeWgl8cWsLJq9o81PTRNEhUCZnCIG6w2kg/od4XQ3EtarfIpO4TWqAd+0eOevkVHeKVtSin+X9GKIwX49uHu4JDSBhBwzt6FgCn7m+wzOhhDDDnh617LxYPqkv+opzz+KlqxccKon1wniQi5QoDRZrQra6+JbZI+4nC4Ne7j91bHvpVlDiyL3eH64/VGtbKnDdM/McWQ9pwXUdaG9GPrxqT0GdjElFrYnAR8Y0aPW9EruIyvigo1OH2/tzJQ/SWKbBX4nC5SaC0vNuCJ98sTwJeVke43I4nxHXGdCrALLxijFoy+DCl/1PvrMNpOXkrOJlXsqIpR6vrWfZH+jb3ncXIn3StfqhWCyU8CNwIHHmOxNqolesTiBfa6pK1uIA9DIkJLc8asnPz40OUC1Nzo2D7OERk7bXNzVAEMQRMcivj/QBsySBjdpATaB6ShPuc5R7nBmlwjMszatoi/qvwbT4SmurtyJXl5Yrj94J2OtLObrdiDLr4eVLC5iDPzb8x689Aq1PiVFjE93at3/UW/52drCE5y4khZJU/9C+Z5wMYkch6Jwft8NBnnW0niiSVNR/WOMIDmF/cZdvivJjHGjo6UUzC23SJraRrcQBNbGOTFbZHetnSkcYH3mm5kmSXYAgkDK9jeNZvIlMXFmGjRdN547h00iP8EG7CkpWUVf7cRKvJKf8b1pydeFPnrtL3Yu1AkNtm1m7wW4SpqTIxaCYKtwDhVmdh8Z5wKRoDXP/QLjGGYMPpU199QK7DesTappuLGtxE8BMhS/ZNq7flm2BUALNKpYHRanx6hkTbbY0wcjuYTJbchhaj8JmQIMaF2JhHOViDDxD7uPan0wgfB9dQyUGGCntGWzjJJvNalY3ShzrtqR7srQMPcoU+ftsuk0mEQKPX9kj/t75wAOXVvGbmsxInLCPAF9rlLMLkE6LD9Gwr3JfkeTBdHjOIamnPDf0Y0Ekgm+BX7SCWOpfaX4bhOqeGf2c84ObuVY/L3yvfHYAujVLB8SaxnFsvJt5lePPDGLkFX32lkGZWMzFidPSh4KGKKyYQSkWgEEcAMcL1+1NseJrnjkOssfWvvVVQVZCK+7ZqXo/dNq3ToiaTcWbK5P9IM6kF0PJ40wAnvPb82hGdaxKhKmayycCyWyKvw2DgnaHicmYg/Ni5E0dAVHx4/J/6aOrC0FfQJtYCkUj2GhpxTUXL9EHT0BGlbvONBZ5tAiHX5bPWal8HJxKkzpGGSxjY6xEU3QIwvqhTXIJHhoDt22xEZeQWZhVE9UmNe4DHARTyTMXYrwh8v30o8BBVZ8OJ4vPsjKLsROrEVcbK6IR0jgxA/935v9OZqf9wg4YqLEMtal7tUZD/nLXnJIXWtZ2X2Pacuchlp4cIIniwH3I7M90PoJHgJqmqLQ231a05Rv5ROo2i3NvO3gMPaJmu86pepmQhrHE/LU7/YukXebaAk4RuVc5dncnKm8eJ48hz+FmoD+ARgv62rDEeegNVy1m7Y+VZPHuAENKTUhrbggCxrYm7nVhlYKAZFUYvSwKAi5UMpQbKqI857CqbrLmEUUf8TQxolpk5HEEc4vHU1zJYpEudI2YVZskH9WOv1E+8kTqQzj19cLvZ0TCAcN99POMLJBLqVfmPS5mH7nN9ZQN62TW+D2UnVCVnYp2uVEP3L5W9jlGa+6P7kH7YU1Ecu/BPyJg7ZUY+xBOH5rHljJ9D91e+MvbNIgHCFhVHs8+ZHFPQrBIW04rB+3JJ5Jz4cjd31MFs0KAoku5GpnSZyzqsg3QyxSWRzfBOPYte8FdXU0o/nIiaDltu0y3o8M70EzOEtgIyG1NBC4pR91LquKSorlfy7ur0+KdkWTshAuJ7Dm/inqKmvsKNbIE3e0dhc5+/HYRG5SAqrx0Dllv27BNHxTEx3glKeBU+s57DMB5UtAH7H757hOj3YOUzuifVUWZ7iThN4VvhWq5gqSJvKDtjb02hPhjpWj1v5gYmr8+x5+KDrqvDgFavYLD7ZT4vGmy8fNQ1g/rsyK8gJfOCItZ7ErT9CMx+CV4uEk3N04wG5mGUKza+epBPFFPOZeXc8POQJudxLi8ploEjw1xD9iXLiJGJxZ8SM+1AgwJD8SpmWHPvHf52qDXBcRYV5btodxx1mqYRdI8M0LkFVjnYFIOT9BUkltkZbMu+v9Ekw79PiXg5S4srOIxUhMnqEaH9Du1AaFMTIY4/hnlwOKgwiXiMvECR1euR67wKkdfMUHL/eFYF+PKjCSxTtxHxrKp+CIpJNCmHTeu40rlsDDMYiRSPGh7MbNMEOIXrppGaX9BGgHywudF8Jfwrnk7pyC4Pl/nmR67PrGDm1gDUp5dHPTdEs/PgvKOOgwz5Xccjh1oG440WcIXEzwT9G1MhYkLAiMfdcL343OIDXA/iAkNrBgEtgKEwXMsnKmOtd1o4knx+Jl6tDgZJYivn6Jbp/ETJrhgIlDCHTtR+mRKi9qKKTdcs0pfbDTbZVsWVVX9RZHYxozCTkECV9LK8Bd1LPygPkPWlnlWblR7T472jI++kSgYUN07VDxt1KbnzTGPZ1rVhpI6sXlkDxV4S05toeR2q3Du3mRIGLtxy3VYL7dZrudvp/hZiSuwoMyIZScS9AN/3iKpafgepsc/Uz/yMPe10XJbycHLUAJ8FgZriq8pGdOyMwDkSKO2WRI3ejynRRDWzSU2g7mWl/GbM8hZ1MakIRj8bztsLt9L1SU0irBJCnbGS/gzsD7GbE4FgtLgnGDCWPhbWGCKLzyKThz61G65h8kQtHIP7ABHewFk80hvWCaUy9Vx8b0ycm8QDkFWraYt2JyTmcBG0MQTjGxyauNQycQWS4TgZ1LmRwWseLRpUFUxIxwYR1Q61nXXJQBbxyW96lI4tO9wc0+C+M0aUJ1sMF6WYStfZHrnIKBZcgn/626ZhMneQwm6eO2pj83ro758WFr2qfMUE3+YxyjXjZsGGArL+W4XN7hQupwZZvStYdvEhz6rHceasNYmeR+ZfmuCu5yhRtiK3Pxv92nvrRiHRhZ9MNA7+PlGWhKYsIm4f/SIL8viVvVo/UtlUOMaBN7Y/+le0mqwo7QuMR66TBwm4zFhasnvBxeyk+GozraJNLlW8YGB67u5kN6UhoFq/jOkvuPNCJSBezsEu6bfMHqfoTgsM9SJra4K89twCFo4TKqzNfLVYkOohg//2Vmgfs4xpHdp5R5gsRNLTyHkUAOyYBz4jcQgGgF1ePG7Vr45clfOT9j8QLh9Zyrz1Ows/ukaH8sDfdQqW7VperzJofeU69klMi0fmosDqh5XwMJ4X2hg8eO/1OxkjinTDzyfNrH1CLjWU3XIaRrbQGlmfT1eS8U+d2nU69+OztP9F9vRiDen+Usu+NHumsWPzz/moFwFJHCVxAp8jQK/4UJtNuTf7o0BNVf4biM9ZC3aOd1yu6JOmH/SQfprGBVppXxgIBbR6lrXBp2JIOEFFOaiR+I3Mm3lzHmrnXgmb7w2D8wXS8uFy5eaj2S9ahsRA+30K3rpA5iY701LFEm1jqZAR5s21YchpAyYsbgLtCYoxljnYGN8UGcxfEwqqct0eRM6R+lvjHj3Lwt3ngDh5hI43DMw9ffCSH1gP338je7LPd8ib6rlBjObdjWDdXknBMda33UgHOm5JgHn7KpE6sHXfbjJYnYlA/Ki32spK6HW78KATRoe4/CdWpdAS3yG56EvAwFAPCozVMHAACPl77pGBj9DvR1KwwAeLAK47doZ5sp8dhf+VAX7sO5sdJXFwC94mYfbgoJYuaUKtIsB+DPSJGgpA6hyQLlNkVUXOMluH4mTR6PCIjqk19Z4eUrukcgKLNEhgrCkskvAqERcav5/CPhHg9QnPmHAiiJJKuVxNuEmf//bRfk7AbAOuD/B3EqKIuTDQG1CBffGpcVCNsBBUa1WUF4GqugnFkVjCjOwI6OCoBeq2JFalQqM1idRj6SlSrX9CKviF36Dds1SOVIfpNPUPATHMEoz2tjU9HXvxSBCCC4j0XA0KE8dA9FWle3qeukMIoXoaruqGEptMQ2bRJUsqjCJLgz4EEcwG+LoBNbte3rqEUJO69IC8UI6gfUUC311HCDUhKlaB4VKKGAQEwD/2EAAAA=)}'
                }
              </style>
              <path id="rect49" d="M453.251 279.633h433.277V436.35H453.251z" />
            </defs>
            <mask id="mask-WV78SWwYZW_oROd07u5O7">
              <path id="rect5" fill="#fff" d="M0 0h186.182v1324.495H0z" />
              <path id="rect6" fill="#000" d="M10 354.741h149.606v37.664H10z" opacity={1} />
            </mask>
            <mask id="mask-07AamB1ox___8Wk5jhJ07">
              <path id="rect13" fill="#fff" d="M0 0h343.771v867.627H0z" />
              <path id="rect14" fill="#000" d="M151.869 582.504h132.704v40H151.869z" opacity={1} />
            </mask>
            <mask id="mask-6QIfV1lFdHss_IWtPlZbI">
              <path id="rect27" fill="#fff" d="M0 0h436.53v697.916H0z" />
              <path id="rect28" fill="#000" d="M255.53 361.449h162v80h-162z" opacity={1} />
            </mask>
            <mask id="mask-_fSHVLyZt9oGmzvYP119f">
              <path id="rect35" fill="#fff" d="M0 0h435.439v503.339H0z" />
              <path id="rect36" fill="#000" d="M252.289 130.938h161.6v100h-161.6z" opacity={1} />
            </mask>
            <g id="g471" transform="matrix(.5 0 0 .5 -293 208.58)">
              <path
                id="path470"
                d="M814.1 758.8c-.71-1.91-2.62-2.98-4.57-2.98-.97 0-1.06.02-1.64.02h-17.38c-2.22 0-3.86 1.05-4.57 2.96l-8.4 25.55c-.8 2.16.28 4.56 2.42 5.37 2.13.81 4.51-.28 5.32-2.44l2.23-6.01s.16-.61.16 2.04v35.47c0 3.1 2.49 5.61 5.56 5.61 3.07 0 5.56-2.51 5.56-5.61v-23.17s-.03-.2.19-.2h2.09c.21 0 .19.2.19.2v23.17c0 3.1 2.49 5.61 5.56 5.61 3.07 0 5.56-2.51 5.56-5.61v-35.47c0-2.69.23-1.84.23-1.84l2.16 5.82c.8 2.16 3.18 3.25 5.32 2.44 2.13-.81 3.22-3.21 2.42-5.37l-8.4-25.55z"
                className="cls-14"
                style={{
                  fill: '#e5e5e5',
                }}
              />
              <ellipse
                id="ellipse470"
                cx={800.13}
                cy={741.19}
                className="cls-14"
                rx={11.94}
                ry={11.81}
                style={{
                  fill: '#e5e5e5',
                }}
              />
            </g>
            <g
              id="g503"
              style={{
                fill: '#f95',
                strokeWidth: 1.10238,
                strokeDasharray: 'none',
              }}
              transform="matrix(1.29877 0 0 4.28304 -932.256 -2505.122)"
            >
              <ellipse
                id="circle502-5"
                cx={799.89}
                cy={609.248}
                className="cls-11"
                rx={3.85}
                ry={1.167}
                style={{
                  fill: '#f70',
                  strokeWidth: 0.5,
                  strokeDasharray: 'none',
                }}
              />
              <ellipse
                id="circle502-5-0"
                cx={1009.901}
                cy={705.762}
                className="cls-11"
                rx={3.85}
                ry={1.167}
                style={{
                  fill: '#f70',
                  strokeWidth: 0.5,
                  strokeDasharray: 'none',
                }}
              />
              <ellipse
                id="circle502-5-0-1"
                cx={935.588}
                cy={705.858}
                className="cls-11"
                rx={3.85}
                ry={1.167}
                style={{
                  fill: '#f70',
                  strokeWidth: 0.5,
                  strokeDasharray: 'none',
                }}
              />
              <ellipse
                id="circle502-5-8"
                cx={971.344}
                cy={663.599}
                className="cls-11"
                rx={3.85}
                ry={1.167}
                style={{
                  fill: '#f70',
                  strokeWidth: 0.5,
                  strokeDasharray: 'none',
                }}
              />
              <ellipse
                id="circle502-5-1"
                cx={971.048}
                cy={609.073}
                className="cls-11"
                rx={3.85}
                ry={1.167}
                style={{
                  fill: '#f70',
                  strokeWidth: 0.5,
                  strokeDasharray: 'none',
                }}
              />
              <path
                id="line503"
                d="M800.02 717.57V610.45"
                className="cls-9"
                style={{
                  fill: '#f95',
                  stroke: '#f70',
                  strokeWidth: 1.10238,
                  strokeMiterlimit: 10,
                  strokeDasharray: 'none',
                  strokeOpacity: 1,
                }}
              />
            </g>
            <g
              id="g503-6"
              style={{
                fill: '#f95',
                strokeWidth: 4.2179,
                strokeDasharray: 'none',
              }}
              transform="matrix(.33944 0 0 1.1194 58.124 -347.852)"
            >
              <path
                id="line503-4"
                d="M799.62 718.541v-107.12"
                className="cls-9"
                style={{
                  fill: '#f95',
                  stroke: '#f70',
                  strokeWidth: 4.2179,
                  strokeMiterlimit: 10,
                  strokeDasharray: 'none',
                  strokeOpacity: 1,
                }}
              />
            </g>
            <path
              id="line503-4-7"
              d="M282.973 582.322v-60.807"
              className="cls-9"
              style={{
                fill: '#f95',
                stroke: '#f70',
                strokeWidth: 1.15,
                strokeMiterlimit: 10,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
            />
            <path
              id="line503-4-7-8"
              d="M129.688 581.867h153.017"
              className="cls-9"
              style={{
                fill: '#f95',
                stroke: '#f70',
                strokeWidth: 1.14999999,
                strokeMiterlimit: 10,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
            />
            <path
              id="line503-4-7-2"
              d="M379.31 596.998v-76.017"
              className="cls-9"
              style={{
                fill: '#f95',
                stroke: '#f70',
                strokeWidth: 1.15,
                strokeMiterlimit: 10,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
            />
            <path
              id="line503-4-7-8-5"
              d="M129.875 597.63h249.846"
              className="cls-9"
              style={{
                fill: '#f95',
                stroke: '#f70',
                strokeWidth: 1.14999999,
                strokeMiterlimit: 10,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
            />
            <rect
              id="rect503"
              width={416.92}
              height={66.916}
              x={49.547}
              y={35.994}
              className="cls-15"
              rx={7.978}
              ry={6.758}
              style={{
                opacity: 0.1,
                fill: '#e5e5e5',
                strokeWidth: 0.500001,
              }}
            />
            <g
              id="g503-6-5"
              style={{
                fill: '#f70',
                fillOpacity: 1,
                strokeWidth: 4.21790424,
                strokeDasharray: 'none',
              }}
              transform="matrix(.33944 0 0 1.1194 285.586 -402.134)"
            >
              <path
                id="line503-4-3"
                d="M127.853 576.197V450.622"
                className="cls-9"
                style={{
                  fill: '#f70',
                  fillOpacity: 1,
                  stroke: '#f70',
                  strokeWidth: 4.21790424,
                  strokeMiterlimit: 10,
                  strokeDasharray: 'none',
                  strokeOpacity: 1,
                }}
              />
            </g>
            <g
              id="g530"
              style={{
                strokeWidth: 0.575,
              }}
              transform="matrix(.88727 0 0 .85222 -26.227 -186.873)"
            >
              <path
                id="path503"
                d="m140.21 287.07 6.91 18.66h-3.44l-1.77-5.04h-7.43l-1.72 5.04h-3.37l6.86-18.66zm-.2 7.99c-.59-1.72-1.23-3.57-1.7-5.32h-.15c-.54 1.72-1.05 3.57-1.7 5.32l-1.08 2.93h5.65l-1.03-2.93Z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path504"
                d="M153.12 305.98c-1.72 0-2.93-.67-3.75-1.8-.64-.9-.77-2.29-.77-4.19v-7.53h3.06v7.43c0 1.95.31 3.75 2.44 3.75.92 0 1.67-.33 2.18-1.03.51-.7.82-1.8.82-3.42v-6.73h3.08v13.26h-2.88V304c-1.03 1.39-2.67 1.98-4.19 1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path505"
                d="M169.25 306.11c-3.96 0-6.35-2.83-6.35-7.01s2.42-7.02 6.35-7.02c3.52 0 5.65 1.98 5.83 4.98h-3.19c-.21-1.67-1.16-2.6-2.67-2.6-1.98 0-3.13 1.82-3.13 4.57s1.21 4.68 3.13 4.68c1.52 0 2.52-.98 2.75-2.67h3.13c-.23 3.16-2.42 5.06-5.86 5.06z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path506"
                d="M178.3 289.18h3.08v3.29H184v2.36h-2.62v6.24c0 1.62.36 2.39 1.59 2.39.26 0 .57 0 1.05-.1v2.36c-.69.18-1.29.23-1.98.23-2.62 0-3.75-1.26-3.75-4.27v-6.86h-2.13v-2.36h2.13v-3.29z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path507"
                d="M189.45 287.07v3.11h-3.08v-3.11zm0 5.4v13.26h-3.08v-13.26z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path508"
                d="M205.38 299.1c0 4.19-2.57 6.99-6.66 6.99s-6.58-2.8-6.58-6.99 2.57-6.99 6.6-6.99c4.03 0 6.63 2.83 6.63 6.99zm-10.02 0c0 2.8 1.23 4.62 3.37 4.62s3.44-1.8 3.44-4.62c0-2.82-1.26-4.63-3.42-4.63s-3.39 1.8-3.39 4.63z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path509"
                d="M215.14 292.21c1.93 0 3.03.69 3.73 1.82.62 1.03.8 2.44.8 4.09v7.61h-3.08v-7.4c0-2-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71h-3.08v-13.26h2.85v1.72c1.05-1.39 2.67-1.98 4.21-1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path510"
                d="M233.72 306.11c-3.96 0-6.35-2.83-6.35-7.01s2.42-7.02 6.35-7.02c3.52 0 5.65 1.98 5.83 4.98h-3.19c-.21-1.67-1.16-2.6-2.67-2.6-1.98 0-3.13 1.82-3.13 4.57s1.21 4.68 3.13 4.68c1.52 0 2.52-.98 2.75-2.67h3.13c-.23 3.16-2.42 5.06-5.86 5.06z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path511"
                d="M254.46 299.1c0 4.19-2.57 6.99-6.66 6.99s-6.58-2.8-6.58-6.99 2.57-6.99 6.6-6.99c4.03 0 6.63 2.83 6.63 6.99zm-10.02 0c0 2.8 1.23 4.62 3.37 4.62s3.44-1.8 3.44-4.62c0-2.82-1.26-4.63-3.42-4.63s-3.39 1.8-3.39 4.63z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path512"
                d="M264.22 292.21c1.93 0 3.03.69 3.73 1.82.62 1.03.8 2.44.8 4.09v7.61h-3.08v-7.4c0-2-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71h-3.08v-13.26h2.85v1.72c1.05-1.39 2.67-1.98 4.21-1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path513"
                d="M272.65 289.18h3.08v3.29h2.62v2.36h-2.62v6.24c0 1.62.36 2.39 1.59 2.39.26 0 .57 0 1.05-.1v2.36c-.69.18-1.29.23-1.98.23-2.62 0-3.75-1.26-3.75-4.27v-6.86h-2.13v-2.36h2.13v-3.29z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path514"
                d="M283.62 292.47v1.98c.82-1.39 2-2.11 3.52-2.11.44 0 1.03.03 1.46.13v2.67c-.46-.1-.93-.13-1.34-.13-2.54 0-3.47 1.67-3.47 4.91v5.81h-3.08v-13.26h2.9z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path515"
                d="M298.58 304c-1.11 1.34-2.36 1.98-4.45 1.98-2.93 0-4.6-1.46-4.6-3.93 0-4.24 5.32-4.29 8.68-4.68v-.57c0-1.62-.8-2.52-2.42-2.52-1.62 0-2.6.82-2.62 2.24h-3.16c.1-2.77 2.34-4.42 5.78-4.42 4.21 0 5.42 2.21 5.42 5.76v3.7c0 1.46.05 2.75.28 4.16h-2.8c-.08-.51-.1-1.05-.13-1.72zm-5.86-2c0 1.13.8 1.85 2.21 1.85 1.9 0 3.29-.92 3.29-3.8v-.57c-2.31.31-5.5.26-5.5 2.52z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path516"
                d="M310.09 306.11c-3.96 0-6.35-2.83-6.35-7.01s2.42-7.02 6.35-7.02c3.52 0 5.65 1.98 5.83 4.98h-3.19c-.21-1.67-1.16-2.6-2.67-2.6-1.98 0-3.13 1.82-3.13 4.57s1.21 4.68 3.13 4.68c1.52 0 2.52-.98 2.75-2.67h3.13c-.23 3.16-2.42 5.06-5.86 5.06z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path517"
                d="M319.14 289.18h3.08v3.29h2.62v2.36h-2.62v6.24c0 1.62.36 2.39 1.59 2.39.26 0 .57 0 1.05-.1v2.36c-.69.18-1.29.23-1.98.23-2.62 0-3.75-1.26-3.75-4.27v-6.86H317v-2.36h2.13v-3.29z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path518"
                d="M344.73 299.1c0 4.19-2.57 6.99-6.66 6.99s-6.58-2.8-6.58-6.99 2.57-6.99 6.6-6.99c4.03 0 6.63 2.83 6.63 6.99zm-10.02 0c0 2.8 1.23 4.62 3.37 4.62s3.44-1.8 3.44-4.62c0-2.82-1.26-4.63-3.42-4.63s-3.39 1.8-3.39 4.63z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path519"
                d="M354.49 292.21c1.93 0 3.03.69 3.73 1.82.62 1.03.8 2.44.8 4.09v7.61h-3.08v-7.4c0-2-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71h-3.08v-13.26h2.85v1.72c1.05-1.39 2.67-1.98 4.21-1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path520"
                d="M367.83 289.18h3.08v3.29h2.62v2.36h-2.62v6.24c0 1.62.36 2.39 1.59 2.39.26 0 .57 0 1.05-.1v2.36c-.69.18-1.29.23-1.98.23-2.62 0-3.75-1.26-3.75-4.27v-6.86h-2.13v-2.36h2.13v-3.29z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path521"
                d="M384.04 304c-1.11 1.34-2.36 1.98-4.45 1.98-2.93 0-4.6-1.46-4.6-3.93 0-4.24 5.32-4.29 8.68-4.68v-.57c0-1.62-.8-2.52-2.42-2.52-1.62 0-2.6.82-2.62 2.24h-3.16c.1-2.77 2.34-4.42 5.78-4.42 4.21 0 5.42 2.21 5.42 5.76v3.7c0 1.46.05 2.75.28 4.16h-2.8c-.08-.51-.1-1.05-.13-1.72zm-5.85-2c0 1.13.8 1.85 2.21 1.85 1.9 0 3.29-.92 3.29-3.8v-.57c-2.31.31-5.5.26-5.5 2.52z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path522"
                d="M392.94 292.47v1.98c.82-1.39 2-2.11 3.52-2.11.44 0 1.03.03 1.46.13v2.67c-.46-.1-.92-.13-1.34-.13-2.54 0-3.47 1.67-3.47 4.91v5.81h-3.08v-13.26h2.9z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path523"
                d="M404.55 292.21c1.77 0 3.14.59 4.06 1.98v-1.72h2.83v11.36c0 4.37-1.26 7.17-6.14 7.17-3.39 0-5.42-1.49-5.68-4.24h3.19c.08 1.28.98 2.03 2.54 2.03 2.06 0 3.11-1.18 3.11-4.06v-1.36c-1.13 1.46-2.49 1.98-4.06 1.98-3.14 0-5.4-2.49-5.4-6.42 0-3.67 2.21-6.71 5.55-6.71zm.72 10.72c1.85 0 3.13-1.59 3.13-4.09s-1.18-4.27-3.13-4.27-3.08 1.77-3.08 4.19c0 2.6 1.21 4.16 3.08 4.16z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path524"
                d="M420.61 292.11c2.44 0 4.14 1.1 5.06 2.72.8 1.39 1.05 3.11 1.05 5.17h-9.43c.05 2.24 1.18 3.83 3.34 3.83 1.41 0 2.39-.72 2.8-2.06h3.26c-.72 2.88-2.88 4.32-6.09 4.32-4.27 0-6.5-2.7-6.5-7.04 0-4.01 2.52-6.94 6.5-6.94zm-.15 2.23c-1.7 0-3.03 1.16-3.21 3.39h6.35c-.15-2.24-1.46-3.39-3.14-3.39z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path525"
                d="M429.91 289.18h3.08v3.29h2.62v2.36h-2.62v6.24c0 1.62.36 2.39 1.59 2.39.26 0 .57 0 1.05-.1v2.36c-.69.18-1.29.23-1.98.23-2.62 0-3.75-1.26-3.75-4.27v-6.86h-2.13v-2.36h2.13v-3.29z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path526"
                d="M448.64 306.11c-3.96 0-6.35-2.83-6.35-7.01s2.42-7.02 6.35-7.02c3.52 0 5.65 1.98 5.83 4.98h-3.19c-.21-1.67-1.16-2.6-2.67-2.6-1.98 0-3.13 1.82-3.13 4.57s1.21 4.68 3.13 4.68c1.52 0 2.52-.98 2.75-2.67h3.13c-.23 3.16-2.42 5.06-5.86 5.06z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path527"
                d="M460.08 287.07v7.04c.92-1.36 2.39-1.9 3.98-1.9 1.7 0 2.98.64 3.78 1.8.64.92.75 2.18.75 4.11v7.61h-3.08v-7.4c0-1.98-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71H457v-18.66h3.08z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path528"
                d="M480.12 304c-1.11 1.34-2.36 1.98-4.45 1.98-2.93 0-4.6-1.46-4.6-3.93 0-4.24 5.32-4.29 8.68-4.68v-.57c0-1.62-.8-2.52-2.42-2.52-1.62 0-2.6.82-2.62 2.24h-3.16c.1-2.77 2.34-4.42 5.78-4.42 4.21 0 5.42 2.21 5.42 5.76v3.7c0 1.46.05 2.75.28 4.16h-2.8c-.08-.51-.1-1.05-.13-1.72zm-5.86-2c0 1.13.8 1.85 2.21 1.85 1.9 0 3.29-.92 3.29-3.8v-.57c-2.31.31-5.5.26-5.5 2.52z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path529"
                d="M489.19 287.07v3.11h-3.08v-3.11zm0 5.4v13.26h-3.08v-13.26z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
              <path
                id="path530"
                d="M499.8 292.21c1.93 0 3.03.69 3.73 1.82.62 1.03.8 2.44.8 4.09v7.61h-3.08v-7.4c0-2-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71h-3.08v-13.26h2.85v1.72c1.05-1.39 2.67-1.98 4.21-1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                  strokeWidth: 0.575,
                }}
              />
            </g>
            <rect
              id="rect294"
              width={151.176}
              height={151.176}
              x={545.137}
              y={196.749}
              className="cls-15"
              rx={6.647}
              ry={6.647}
              style={{
                opacity: 0.185,
                fill: '#e5e5e5',
                stroke: '#c900e8',
                strokeWidth: 5.10154,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
              transform="scale(1.33742 .45967) rotate(45)"
            />
            <g id="g303" transform="matrix(.5 0 0 .5 -46.517 26.506)">
              <path
                id="path295"
                d="M690.76 531.52c2.21 0 3.6-1.05 3.6-2.67 0-1.93-2-2.57-4.26-3.24-2.96-.87-6.37-1.8-6.37-5.58 0-3.19 2.72-5.34 6.86-5.34 4.14 0 6.68 2.31 6.76 6.09h-3.32c0-2.18-1.59-3.52-3.6-3.52-1.75 0-3.29.92-3.29 2.49 0 1.77 1.7 2.47 4.91 3.37 2.98.85 5.76 2.03 5.76 5.32 0 3.29-2.83 5.68-7.04 5.68-4.55 0-7.38-2.47-7.38-6.63h3.37c0 2.54 1.49 4.03 4.01 4.03z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path296"
                d="M706.1 520.11c2.44 0 4.14 1.11 5.06 2.72.8 1.39 1.05 3.11 1.05 5.16h-9.43c.05 2.24 1.18 3.83 3.34 3.83 1.41 0 2.39-.72 2.8-2.06h3.26c-.72 2.88-2.88 4.32-6.09 4.32-4.27 0-6.5-2.7-6.5-7.04 0-4.01 2.52-6.94 6.5-6.94zm-.15 2.24c-1.7 0-3.03 1.16-3.21 3.39h6.35c-.15-2.24-1.46-3.39-3.14-3.39z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path297"
                d="M719.72 520.21c1.67 0 3.16.67 4.06 1.98v-1.72h2.9v18.42h-3.08v-6.68c-.9 1.21-2.29 1.77-3.88 1.77-3.42 0-5.6-2.49-5.6-6.89 0-4.14 2.26-6.89 5.6-6.89zm.77 11.41c1.93 0 3.16-1.77 3.16-4.52 0-2.75-1.26-4.5-3.21-4.5s-3.13 1.75-3.13 4.5 1.21 4.52 3.19 4.52z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path298"
                d="M734.6 533.99c-1.72 0-2.93-.67-3.75-1.8-.64-.9-.77-2.29-.77-4.19v-7.53h3.06v7.43c0 1.95.31 3.75 2.44 3.75.92 0 1.67-.33 2.18-1.03.51-.69.82-1.8.82-3.42v-6.73h3.08v13.26h-2.88v-1.72c-1.03 1.39-2.67 1.98-4.19 1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path299"
                d="M750.86 520.11c2.44 0 4.14 1.11 5.06 2.72.8 1.39 1.05 3.11 1.05 5.16h-9.43c.05 2.24 1.18 3.83 3.34 3.83 1.41 0 2.39-.72 2.8-2.06h3.26c-.72 2.88-2.88 4.32-6.09 4.32-4.27 0-6.5-2.7-6.5-7.04 0-4.01 2.52-6.94 6.5-6.94zm-.15 2.24c-1.7 0-3.03 1.16-3.21 3.39h6.35c-.15-2.24-1.46-3.39-3.14-3.39z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path300"
                d="M766.77 520.21c1.93 0 3.03.69 3.73 1.82.62 1.03.8 2.44.8 4.09v7.61h-3.08v-7.4c0-2-.31-3.75-2.42-3.75-1.93 0-3.01 1.31-3.01 4.45v6.71h-3.08v-13.26h2.85v1.72c1.05-1.39 2.67-1.98 4.21-1.98z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path301"
                d="M780.21 534.12c-3.96 0-6.35-2.83-6.35-7.02 0-4.19 2.42-7.01 6.35-7.01 3.52 0 5.65 1.98 5.83 4.99h-3.19c-.21-1.67-1.16-2.6-2.67-2.6-1.98 0-3.13 1.82-3.13 4.57s1.21 4.68 3.13 4.68c1.52 0 2.52-.98 2.75-2.67h3.13c-.23 3.16-2.42 5.06-5.86 5.06z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path302"
                d="M794.21 520.11c2.44 0 4.14 1.11 5.06 2.72.8 1.39 1.05 3.11 1.05 5.16h-9.43c.05 2.24 1.18 3.83 3.34 3.83 1.41 0 2.39-.72 2.8-2.06h3.26c-.72 2.88-2.88 4.32-6.09 4.32-4.27 0-6.5-2.7-6.5-7.04 0-4.01 2.52-6.94 6.5-6.94zm-.15 2.24c-1.7 0-3.03 1.16-3.21 3.39h6.35c-.15-2.24-1.46-3.39-3.14-3.39z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path303"
                d="M805.96 520.47v1.98c.82-1.39 2-2.11 3.52-2.11.44 0 1.03.03 1.46.13v2.67c-.46-.1-.92-.13-1.34-.13-2.54 0-3.47 1.67-3.47 4.91v5.81h-3.08v-13.26h2.9z"
                className="cls-17"
                style={{
                  fill: '#fff',
                }}
              />
            </g>
            <g id="g269" transform="matrix(.5 0 0 .5 -224.329 139.97)">
              <path
                id="path260"
                d="m1047.43 681.78 7.1 19.17h-3.54l-1.82-5.17h-7.63l-1.77 5.17h-3.46l7.05-19.17h4.06zm-.21 8.21c-.61-1.77-1.27-3.67-1.74-5.46h-.16c-.55 1.77-1.08 3.67-1.74 5.46l-1.11 3.01h5.81z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path261"
                d="M1060.68 701.21c-1.77 0-3.01-.69-3.85-1.85-.66-.92-.79-2.35-.79-4.3v-7.73h3.14v7.63c0 2.01.32 3.85 2.51 3.85.95 0 1.72-.34 2.24-1.06.53-.71.84-1.85.84-3.51v-6.92h3.17v13.62h-2.96v-1.77c-1.06 1.43-2.75 2.03-4.3 2.03z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path262"
                d="M1077.26 701.34c-4.07 0-6.52-2.9-6.52-7.21 0-4.31 2.48-7.21 6.52-7.21 3.62 0 5.81 2.03 5.99 5.12h-3.27c-.21-1.72-1.19-2.67-2.75-2.67-2.03 0-3.22 1.88-3.22 4.7 0 2.82 1.24 4.8 3.22 4.8 1.56 0 2.59-1 2.82-2.75h3.22c-.24 3.25-2.48 5.2-6.02 5.2z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path263"
                d="M1086.55 683.94h3.17v3.38h2.69v2.43h-2.69v6.41c0 1.66.37 2.46 1.64 2.46.26 0 .58 0 1.08-.11v2.43c-.71.18-1.32.24-2.03.24-2.69 0-3.85-1.29-3.85-4.38v-7.05h-2.19v-2.43h2.19v-3.38z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path264"
                d="M1098.01 681.78v3.19h-3.17v-3.19zm0 5.54v13.62h-3.17v-13.62z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path265"
                d="M1114.38 694.13c0 4.3-2.64 7.18-6.84 7.18-4.2 0-6.76-2.88-6.76-7.18s2.64-7.18 6.78-7.18c4.14 0 6.81 2.9 6.81 7.18zm-10.3 0c0 2.88 1.27 4.75 3.46 4.75s3.54-1.85 3.54-4.75-1.29-4.75-3.51-4.75c-2.22 0-3.48 1.85-3.48 4.75z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path266"
                d="M1124.41 687.06c1.98 0 3.12.71 3.83 1.87.63 1.06.82 2.51.82 4.2v7.81h-3.17v-7.6c0-2.06-.32-3.85-2.48-3.85-1.98 0-3.09 1.35-3.09 4.57v6.89h-3.17v-13.62h2.93v1.77c1.08-1.43 2.75-2.03 4.33-2.03z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path267"
                d="M1138.35 686.95c2.51 0 4.25 1.14 5.2 2.8.82 1.42 1.08 3.19 1.08 5.31h-9.69c.05 2.3 1.21 3.93 3.43 3.93 1.45 0 2.46-.74 2.88-2.11h3.35c-.74 2.96-2.96 4.43-6.26 4.43-4.38 0-6.68-2.77-6.68-7.23 0-4.12 2.59-7.13 6.68-7.13zm-.16 2.3c-1.74 0-3.12 1.19-3.3 3.48h6.52c-.16-2.3-1.5-3.48-3.22-3.48z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path268"
                d="M1153.24 686.95c2.51 0 4.25 1.14 5.2 2.8.82 1.42 1.08 3.19 1.08 5.31h-9.69c.05 2.3 1.21 3.93 3.43 3.93 1.45 0 2.46-.74 2.88-2.11h3.35c-.74 2.96-2.96 4.43-6.26 4.43-4.38 0-6.68-2.77-6.68-7.23 0-4.12 2.59-7.13 6.68-7.13zm-.16 2.3c-1.74 0-3.12 1.19-3.3 3.48h6.52c-.16-2.3-1.5-3.48-3.22-3.48z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
              <path
                id="path269"
                d="M1165.3 687.32v2.03c.84-1.42 2.06-2.16 3.62-2.16.45 0 1.06.03 1.5.13v2.75a6.09 6.09 0 0 0-1.37-.13c-2.61 0-3.56 1.72-3.56 5.04v5.97h-3.17v-13.62h2.98z"
                className="cls-10"
                style={{
                  fill: '#fff',
                }}
              />
            </g>
            <rect
              id="rect259"
              width={195.837}
              height={58.276}
              x={232.434}
              y={457.375}
              className="cls-9"
              rx={6.946}
              ry={5.301}
              style={{
                opacity: 0.2825,
                fill: '#53c1f3',
                fillOpacity: 1,
                stroke: '#c900e8',
                strokeWidth: 4.15,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
            />
          </svg>
          ;
        </div>
      )}
    </BrowserOnly>
  );
};
