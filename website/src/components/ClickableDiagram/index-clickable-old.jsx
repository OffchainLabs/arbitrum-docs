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
            xmlSpace="preserve"
            id="svg42"
            width={1026.711}
            height={1450.403}
            viewBox="0 0 513.356 725.202"
            {...props}
          >
            <symbol id="image-18b770b7c6937675a91cdd055e730fa471270f88">
              <image
                id="image1"
                width="100%"
                height="100%"
                href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSI2IiByPSI0IiBmaWxsPSIjMUMyNzRDIi8+CjxwYXRoIG9wYWNpdHk9IjAuNSIgZD0iTTIwIDE3LjVDMjAgMTkuOTg1MyAyMCAyMiAxMiAyMkM0IDIyIDQgMTkuOTg1MyA0IDE3LjVDNCAxNS4wMTQ3IDcuNTgxNzIgMTMgMTIgMTNDMTYuNDE4MyAxMyAyMCAxNS4wMTQ3IDIwIDE3LjVaIiBmaWxsPSIjMUMyNzRDIi8+Cjwvc3ZnPg=="
                preserveAspectRatio="none"
              />
            </symbol>
            {
              'eyJ2ZXJzaW9uIjoiMSIsImVuY29kaW5nIjoiYnN0cmluZyIsImNvbXByZXNzZWQiOnRydWUsImVuY29kZWQiOiJ4nO1cXGtz2khcdTAwMTb9nl9BeT5OrOn3I1vzXHUwMDAxXHUwMDFix8YxxDE2jj3Zclx0XHUwMDEwWDYggsTLU/nve1x1MDAxYlx1MDAxYiQh8Vx1MDAxY3Cc3SXlxJFarX7cc+65t7v5+10ms1x1MDAxN4w6zt6HzJ4zrNpNt9a1XHUwMDA3e+/N9b7T9V2vXHK3yPj/vtfrVscl74Og8+GPP5pcdTAwMWU8cO/5wVx1MDAwN4pcdTAwMTB+fshpOi2nXHUwMDFk+FDsL/h/JvP3+O/Ia9yW3XDGhceXw7dgxejs5aLXXHUwMDFlv1x1MDAxMjOJXHUwMDExxVKQaVx0t11zhqZCXHUwMDFih7W5flx1MDAwZVpcdTAwMTA4NbhRt5u+XHUwMDEz3jGX9lx1MDAwZTquo77u39Tcu0G7LMR15VFfh4/X3WazXHUwMDE0jJrjhvpcdTAwMWWMRnjPXHUwMDBmut6jc+3WgvvJkESuz3uq6/VcdTAwMWH3bcc3XHUwMDAzgqdXvY5ddYORuYbQ9KrdbozrXGKvmP5xqSzEOCeMSclcdTAwMTmX07vmeWnuYio0kURJguhMu1x1MDAwZb2m1zXtXG66dtvv2F2YnLB1XHUwMDE1u/rYgCa2a4vLXHJees2ZxYWQnEuOXHUwMDEx0UKLaZF7x23cXHUwMDA3i8v4znhiXGJiXGZTLkV4xzSik6+Nzebf4XR07ZaTN4+0e81mdEzbtZcxjd2omFx1MDAxYkezXHUwMDE2XHUwMDE4tcKIKVxcl6UqXVx1MDAwZm5ur++8i881JHv8s5x2OWaydrfrXHL2pnd+vF9UL5JZu3WAveHd3Z26fuRcdTAwMGb3p2hcdTAwMWL1dq4+ee3Ds1x1MDAwN1T9lC1cdTAwMGb0/uCroo3V6n35LVx1MDAxY9hep2Y/g1x1MDAwNIPZaKa5ppqE09F024+zg1x1MDAwYmh/TMGVXHUwMDFm2EHPXHUwMDFmW77dd2oxLD3P3Vx1MDAxZVZcdTAwMTUpUUVWhaZcdTAwMTIsw9a4Wqshzlx1MDAxZElR3Vx1MDAwNmhcdTAwMTOJ6kpFsFx1MDAwNsTixCZcdTAwMTCHXHUwMDFkxZPuvItcZlqCZp7HIIVmXHUwMDE4xmL28pRmXHUwMDA04lhhSkNcYoY0Q1anmcW2tVx1MDAwNs3gmeur0EzY9nVoRiBmYUpcdTAwMDQlMFx1MDAwMlx1MDAxYXE1QzOAak1cYtzVMJezzZqyx2/YMX82Z1x1MDAxOGJJXHUwMDBlVoEowUIzyUhIdyHDXGJpXHUwMDExXHUwMDA17oJQITUlbJZgOFNYYIbDPmzMLyFcdTAwMTAnlkVervxcYvu4XHUwMDFh7UwsM3CGQVx1MDAxY7fPRiNPL5qlQuX4a7PpuddcdTAwMWavRqWbh/brobhcdTAwMWJcdTAwMWOArbvtRrzXL1x1MDAwZT2/gvs0I+pVx2Swj8BnaSSlYIRJTlx1MDAxNFx1MDAxNzRSrGF3oFx1MDAxMLVcdTAwMTjBTID7wlxig1x1MDAwM6MsWpM7dGrnnttcdTAwMGVeupBcdTAwMTh2p11b3mJ/0D8r1dunhU/fXHUwMDBmPotcdTAwMGU+ffhy+TWtxchcdTAwMDKFQcBtXHRBXHUwMDE5x1LLRHuFJVx1MDAxMKVcXGm4KVx1MDAxNFdireY2bT849FotN1xi4iXjk5A1vHXv2Fx0q4TuRu/NXHUwMDEyXFzH1Fx1MDAxOLe+v1wiNoaiXHUwMDA2h6a///t9aun5KDSf/Vx1MDAwNFx1MDAwMMP6XHUwMDEyRuo0K94gtLiFnFx1MDAxZENGVFx1MDAxOUo2ezVkbJg2uE/ShCFdnbHTwfe2hSFmllx1MDAwMFx1MDAwMGmCJFVcdTAwMTSHbzbPM64trCXX5qZEWs1Vhv+Ys6FcdIBcZvMmRIjmNFwiQqecTaVcdTAwMDXAXHUwMDEyXHUwMDFhdFx1MDAxZlx1MDAwMmbQOKFcbjVcdTAwMThcdTAwMTS0MzKRO1x1MDAxMoVcdTAwMGJcYpRgymQ4ymtcdTAwMTBo3WtcdTAwMDcl92lsktxCgjNcdD9cdTAwMTBcdTAwMTZpLWSs1Ee75TbNXGbx6eWx3cMol1x1MDAwMqeTwd/aV77TzdScjue7gZ+pQ/v9vVjhbNNtXHUwMDE4YOxVoVNON4aZwFx1MDAwNfE0LdBya7VmZG6r0Fx1MDAwMtttO938KkLF67pccrdtNy/XaaDdXHUwMDBivFx1MDAwYsd/XHUwMDFljKDbc6Lj6ZxMLFx1MDAwMluEL2SDrlNccp4tP4VcdTAwMTJcYpDwXFxOMHZcdTAwMGbUhUPWXGI5QazOXHSfyv3hYX14p7+eVfOl0UlcdTAwMWKz2/PX4oRcclWc1lx1MDAxNlx1MDAwMznNXHUwMDExuFxccFVxXHUwMDE1xzWYJkSJXHUwMDE4OFx1MDAxYkmIpndGXHRcdTAwMTRAXHUwMDAwXHUwMDAxXHUwMDFlg7dhRTBcdTAwMGbnaspcYlxmQ+BKXGLgXHUwMDBlacwgUpwlXHUwMDA0XHTMRbRCWyCEpIqju1Jx5LF6VVx1MDAxY2RtfntGXHUwMDFmbr0uy172+z87dlx1MDAxNF/y9TJufqyd+P5d/jo4b95W8m8+JuVaRLzWcjJOZZNFs1x1MDAxMnJqqlx1MDAwMFx1MDAxOY5cdTAwMDNcdTAwMWZcdTAwMDBcdTAwMTRcdTAwMDKJQVx1MDAwNJFK8LiTXHUwMDA1r1x1MDAwN2FcdTAwMTGFjzRcIleqXHUwMDA0XHUwMDEwMDcltFJcZqQjQVEvPUVcdTAwMDJZhOptIfPnxpxrITdC1uW9VDzHZfMzXWBtsmSCRvhcIqIguZqbW4RcdTAwMTBcdTAwMDUkktLh5M13XGazJFx1MDAxMWtIulx1MDAwNbM1LDihXGKyvWpcdTAwMDBNdcDdXHUwMDFhz921q9EpjWhcdTAwMGVcdTAwMTG7OkdjbE02LPGMs7JhYS+2JVx1MDAxN+YmfDiJSLqZuVx1MDAwN/lcZtDFOozlXCLWp1aXXG6LifttJnwohLxSKeAtwjlX4ZvHXHRcdTAwMWZcdTAwMDG8xZBJzXFcdTAwMDJhL5tp11x1MDAxNqNcdTAwMDdKLYmQXHUwMDEwmGIpXHUwMDA1iqi2KUOCorOYYEDAUmHBNIsoqlx1MDAxN/RcdTAwMGLBKGZcItLQX1wi55NrXlx1MDAxZNWvPtpBtnjFRdb96jrH6+d8ZFx1MDAxNDM/MecjmZRcdTAwMTD7XHUwMDEwXHUwMDA2ulxyoKVcIqWeUyiYWExcdTAwMWHtrqXAXHUwMDE4yDGaZdlSymcxOWWiKVx1MDAxZlx1MDAwNmExXHUwMDA1+FONXHUwMDE1gj880WBtQUuhV5JhpKHJeq32/ko5XHUwMDFmjJSFOVKUXHTJXHUwMDE4w9HByGT2XHUwMDE5t1x1MDAwNJdcdTAwMWEh8sxcdTAwMDdsaX1zcT2uL1x06bDChNVvI4lE5jpcdTAwMDFJgOm4YmkpJMXWyCGlgvltO1x1MDAwMVx0gFx1MDAwNNMmSlx1MDAxMLDyUCON1a1cdTAwMDSEMFx1MDAwZZqVzzRom+xPwEpAfoFdgX6jOnxVXHUwMDE4KUbU8MtcblwiXHUwMDA18qBsXHUwMDFioeHmuVwiSlx1MDAxOVx0NeOGuaKVdNveJPVCXlIvfq/SMpmXg6g1bFXhLVx1MDAxMTSpiaGFrdu5zFx1MDAwM1x1MDAxMc9nL08lPkRvnFx0nLasV1hcdTAwMWTgi8PdN1x0cC2B1TXHXHUwMDEy+Fx1MDAxN0v4iSOcSVx1MDAwYpiZi1x1MDAxZFwiXHUwMDFjgmOYUymmLUjJXHUwMDBlY1x1MDAwMdqBQvSGoJCASC5cdTAwMTQ0L4hcdTAwMTdcXHNcdTAwMDS92MKWgVeUd6fZVuHQP3ZcXDS4XHUwMDFj3Vxcn1x1MDAxNL6gL+dvS96trJZA3ilcdTAwMDTKjUHEIJngoJqS8lx1MDAwZVtcdTAwMWOZxCsxs00wwtGKtiPvVtaj4LxAs1x1MDAxMSFgIJXWlOhke4lFQc9gXHIxICOMM7pWe38lebdcdTAwMGaOVmhMXHUwMDA0VTpcdTAwMGVD85HMXCJMIE0lX17RXFxAm09cdTAwMTLKO9Z1dP46gJJcdTAwMTRzQmTaOkBxddpPR/FcdTAwMDa0/3prg9BzQKJgQktcImL0PpqoPil2SvuYS1x1MDAwYjQ+NFx1MDAwNDGh5EqyXHUwMDBlwlx1MDAwZsFBVG2D5TfXdSb+XHRH/VV0XHUwMDFk/daO5Mi6jt/xdrfmt0TFpEq7ZVxy3Ja6q7l2XHUwMDBiak7dXHUwMDA0XHUwMDAwszNcdTAwMTfpXHUwMDFjcZNPXHUwMDEwaWm8qzX2bdEj/8ix/ZG4/d6/OLrL3d98LL9cdTAwMTbSN13x41x1MDAxNsTQOFxuMfMklcLaoagjXHUwMDEw3Jt3oudPiJcpvEVcdTAwMTLeXHUwMDEyI1x1MDAwZXxEN1xcXHUwMDE3+ElcIs4+PVatk9p9N3etjjymWlx1MDAwM3o9+9krb3f10kn5bHRcdTAwMWJo77j11L85XHUwMDA3rq1va+WNQUSgSFx1MDAxNMKbrLwt3dWD6NyUjFFcdTAwMTVcdTAwMDIznbpcdTAwMTGzvDqg0+fubbturE3eTIHnxkJqoeOw1ruENXBcdTAwMDbWXHUwMDEwLppdcFxmReVB2mLlXHUwMDA01kRyXHSt5VvYbrmx117bZP+h13a+91x1MDAxYzDV7o589Fx1MDAxMkeU8NHJ5uw830J5JEqfgS8j2uz9T0Xv7eroXUyebzLfoji4Y0AtI0hxxkX8tFx1MDAwNuDEbNlcdTAwMWLHWbtT3lx1MDAxNuVKUI2FXHRoKU47pIEpt0DmXHUwMDEyxKiQkpDEbjxcYt2FwVx1MDAxNN05qDdzym3RKPNOufz0eIzOnuzH795cdTAwMWS5WX97yUaL8zvIrCBMXHUwMDAxM5pjLFx1MDAxOZM8tlx1MDAxM/olVcEtJlx1MDAwNCacy/HWrXCfZGZrqZXFrJOJplZcdTAwMTDiSDGluCZcdTAwMTRcdTAwMDH162RyRVpMIanBXHUwMDE2lVk7k+vt7v6VcivzXHUwMDExZz77JiOiiTZR8PKaXHUwMDAwmUxhplx1MDAwMH0wvixeU1x1MDAwMrZhfVx0g99GbkXP33dNKGGSReghZHh7dYZPh/Gb1mdSgmFcdTAwMWJcdTAwMDZcdTAwMDdcdTAwMDfHiUYz266FwYaiiGlcZlx1MDAwMpewXHUwMDFkbpxcdTAwMTDY0lorOTGuJM2rpFjDYD3wXHUwMDE03sI+ic1TLFxuoUj251VSLCyWwZhsQ8p8a5deVqtcdTAwMDKvkyGZilvzv7UvPZPj8Jp9J2OPn9mRzFtcInBSUzFzOrJmN3a/XHUwMDFjx+ZHd5pcdTAwMDOBmURbXG551Fcnj8Ux8Fx1MDAxYpWHzOJcZmNOzYZcdTAwMTOi41x1MDAwYu5UQHDHMWCDKFx1MDAxM1Xtbn82Nlx1MDAwNzakoIib/Vx1MDAxZVx1MDAwMqOUY3ZcdTAwMTjaioWQXHUwMDA0XHUwMDExJKC4Stl0XHUwMDA1nl9JvHsy2Uwk1lx1MDAxZVx1MDAwZVipk32ij4efy539XuWWlc/WXHUwMDEyiYLiXHKTwSuKxJUl11gkXG5tYovxmTktYzJjolx1MDAxMpFFXHUwMDA1MflAyVx1MDAxOfzNd6BcdTAwMTJXPlJcdTAwMDdNpphcIiNYXHUwMDAw62DPKfurMFhcIihcdTAwMTmlXHUwMDE0XHUwMDE0XHUwMDEx0d3+/3Uqcbw/jlx1MDAxMameoU+Eji2c7Vx1MDAwYmVcdTAwMTFqdjCaXeJcdTAwMDB+sqxCZCmwXHUwMDA1UIlSciwpm91hlcDvrtXi/HxcdTAwMDCjxCxcYqfx/Vx1MDAxYdm8dDy/acKXkoJcdTAwMWUkZlx1MDAxOVJcdTAwMTPCI7G4eVx1MDAxZVx1MDAxNPxzPkBcdTAwMDBEXHUwMDE041LONGy7anHZQYRod6Z60ShLSbexr3ZjvUg14CXMg76KXuSgXGYnWbVMp+uCXHUwMDE2XHUwMDBioFwiUFX2s/pcbqVcdTAwMTdcYr7mt3bgZZy23+uC1nouXHUwMDAwRVx1MDAxYk4wUWC72qi1RFx1MDAwNKVKyFx1MDAxZPbtn+pKd1x1MDAwNVx1MDAxN7PohOD4YCzVXHUwMDE2RF4ksSZcdTAwMDa0alGpdCyzPVx1MDAwMVxiU8RcdTAwMDIypWlxXHUwMDE0gJhcdTAwMWFJxlx1MDAxN6D9f/qgjpt+TmeVc3fTtX9BXHUwMDA0g5BZRaEw8Sx0rmtcdTAwMDGBwSGildFgYuXjO1x1MDAxYurKu4NcdTAwMTb5nKv0/XP/vlxcKV7psv+9sOrK3a6+d2anK4JcdTAwMWOUXHUwMDA2XWez61x1MDAwMnCnj15cdTAwMDLcybN4Qlx1MDAwMa6RSTtpyUFMxlfGjNxBbCZcdTAwMTMy9X5cdTAwMDBublx1MDAwZfBcdTAwMTHOQGqq/1x1MDAxZsNbXHUwMDA33Vx1MDAwZunoTjuFR2H8jdJLfMWOYVGdwPZUIHKzZlx1MDAwMjHLXHUwMDA2IF5yXHUwMDA2b13LTciB7KxPhN/PXCJfXHUwMDA29POO4S1xk3OO4c3tyNq++91cdTAwMGJn7NmdTimAcZ9S/l7fdVx1MDAwNlx1MDAwN0lM/FZXdV23XHL3jMlh/C1RoadY/auiQt9cdTAwMDKD1HIuo18u94ffb/w+bDUjgcV4uNb/XHUwMDFlKrAl++ribFx1MDAxY3vAr1x1MDAxZmLV/6ti+45g789PiuR2dMAq18Ne9Vx0ufbJXHUwMDA1qua8/lx1MDAxOa3R2ojTwoj3q61qv/CQXHUwMDFkXHUwMDE0XHUwMDBl9VOtVXXzJ7XO7cmFd17Ks0LuYOBcdTAwMWPmXHUwMDFi9nG5c0vuUfRardVs1tBp38kht3CYXHUwMDFk5HN5NP5xXHUwMDBmWvb10D8vnfYqhDfzXHUwMDBm7NP5cbFTbVx1MDAxNf3b0sHDuPxl3s1cdTAwMWZcdTAwMTc51Eeg/Fxi/o08l38oXFxcdTAwMTVGxaeLXFzeVb9cdTAwMWY+XGZcdTAwMDc3Xy+8/LFcdTAwMWXcXFxcdTAwMTc7tZNHnX/I9oqlfONcdTAwMTbqurzMw7uP6NlDOVx1MDAwN/1oXHUwMDE0Llx1MDAxZnufL1x1MDAxYrgwyo6gXaOCm1x1MDAxZMLPqPBYMO1cdTAwMWLlc1+iZdDk2eJhdlgssUHh8lx1MDAwYs3nqr3iZWNYfMpD2Vx1MDAwMvyYf4u5wuVNr5g7YvDc8KX+yDPTdtjz+zLoV+lt+7zx559cdTAwMTHodJ1cdTAwMTgxcMQpjYRjJpNw4Vx1MDAwNF3X6UdKQfhGQFx1MDAxMk7N/ce7XHUwMDFm/1x1MDAwMevfIYAifQ=='
            }
            <defs id="defs1">
              <style id="style1">
                {
                  '@font-face{font-family:Excalifont;src:url(data:font/woff2;base64,d09GMgABAAAAABasAA4AAAAAJpwAABZWAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhwbhlgcgXAGYAB0EQgKumCrPQtKAAE2AiQDgRAEIAWDGAcgG74do6KOslp2yf7qwDamPfQzoYQYYxuHja6yWrzskvdqmT34hNZrv+GK12WUUUaKqeH5c72PAagheEELV4Ozl3BrQcdOCgepEzuKEX3sp/vuJ+PJJ8LFmEw8kAIqoHF1pkrUd+pMeT6dfkmt1A7IduDtGsNN/GkByLBQZfegaaVWamc0AtshgTHJXgyBDxw8Hmn6H8C//+WcqQ24EZPd3cNA9fy8nVJJC8/bbldvHakIIfz6XuWfnY0gCFHIuvG/36/lt4kqmpmfSISqoTFMp5TlrZ5//0pi5qJWVZuIhMhQVZtrt7SNkDxUYmdodUujhI5FdIuYSxt87QOsCgIIAGRwAliEgCMFcRLQfQFA5CcKOp7EpgLhqc1eA4TX9tJqIHwoaqwDQigAQO5R6f5irwN44CYQCgbUZzgV3VcCwO/pQcMGBt6G6BrYU5mBQvNttlKo808WnayO3di+4yinbebr/sPfBvAbDNwM3RrYbLvOvbWhryO2g82hx/4lqU6v1iKywE1BWFB4BEQkZBRUdAxMbBx8AkIikpjNOA5dJgF8ELuAGcAIIFygqsCUAncL7HZRPCoyAho6MAN0wyKQCk8EyiSAJXAETJZIICGpMcJGIRs+TUU1QKwuW4AfbsuLAPvZXlIHqA8E7QE4lYYI4Y6oBzw7jwwhE5D3SyJwKPiShSC5GLAAgMeCGBwSAMIkcJsA4VNjwlcE6yNgglU7sPrJraBKrgrZ23IB6OWjSa0uH6yUifkZADE0aWgrwO/Qq411dXNjPOgHUu1N858Jsy9QzUMAFn1EL/qQ1LcJtl0CAGw7SvJGFRI9bLYlFUwjVppylZq1/w8AdexP/cIzRZGu5msYeOSS4/bbab111lgZBASFjAQ594Wppj9AeANI03C2MC2iPwy5OOC9gCwvjBeLEMiDg0ab1Py6NI6Gy4pISkgNZLvygiOpHv2UdKHYJVYrcPSk+XaCVTkxxpgACZE74BiLJiJzZnllDIw7Enn5x8lKcEC95w4xE2XmYwbXUy1SV5JqNa3mVoJ6MO3jvvjMOodN9mRwvLj//IEZjIOu5gBCCDGJTWwQnGUP3nty89WFconSnjtq7845R//pVoYcJNFJUgyvNFoxxwrRFKUBFB5umWn0elp6WWK+gX+ocJjARPnv3HZ655rsyLaRt19mQqT960ak8HnpYMW/yy5mMJwkp1cjzRl2LwMOwurkG/rIHbW1nRr3A4SQtyjLkc8hJW3Znu0Z2/IpVpqDak/jB94g2tMqXYKUEkm1mKX6mRWrI8OC/fNiPNKoRsCR5mi9eX0ICiZQHEdyMpBCvVIvTdH0ga3kAfKOixak8HRSDS8GKyvn6bv9qBRsBptjhVI/f9jMG4xhHxk5A8tshWGrCBPl3fJsKWxreiEAHwfp65jUMB1AanNEkwic3b2YW5NHo7VRMseB/0xkryN7HxlZWxkCXggUkEIePgTkFpjysdF8EfaZODw+zhnbaFDGVk+rkR0H7O5wiaqGlFJICSD3CCCJRNuuA8jv1iyexTHGebkhEw6GHBC6ZTbMFEVRH+2VY9VPvlA7DSNNwzzDJcU0Tdu2USSXYDhZhskr55oJ7PIaITB5JoMjXuMcxxfx+WEupeh1WjM3SQJ1kHxY1QpDfBGuzxsH6Z3XlOCWmQJ+S2fR88W9DcHbImcYNtrGM9UMz+xwQJw2oNVQtSzulIU0hDSkVJKcwh+cInQm9wGeLdGl00+sRNSfZL0UpTTtL3t5/y1rprZBfB7fYHZzE//sPnUdaVgyIyWDAAQc8IrkniYwwT/nWnzz0g/WbYGMFBv7RtZG6aRGwMnmddrOibtgNouxFYZlSzSpeNWkLoGEgMgsmGOlAgpE2SBJJJrMS6RCCCFb5p1097jRETlDYOb7mMWQjjRy1GoBwp3dzOhRMVTFzO+dbNDPxb7AbHhyP2t05P7WbImOANnVNZ2vEqdLTsBTIPUgXbYjsBUPtvnkLYafqNZpSAEMIa3TBI6gjTi4YzO2QshrcEtW+Wb/Im9sR5d5boer3bXe1ktKRX6+6Yt8KjsaU51vcY3j4O6F8otJMucedSucRNl/XhqW+5oQSKhO4fbhK8PYnKL0dNDcfvHeE1GNT3tLrqs5wAxs1EH2FIz/s6q3XOh+ESblJu1J+r1x3Vy2kZfmZBHiJMngxeYi2/e3sS/kvUxPoftGTa85XJMy/u4ogS4gCqXHjacV/nhJrUeqWDCJlP/CeU98JBjH8JUr7vKPA4UvS460m3w2+aocfxZnpIebBT7jlHKorjS0LPV+kvO/LJkn3YpWt30uFaVebq8z7w2KbIIbneb2T4O32AzXJ5BSF+quA5yS3UfRphmgKa/xYmb13K6atFsgCimaKhQkDbSSjE6Cv15TFPWznfJAFdJnvaKF42OBfZF7Kfn0LF3YF2+dq36gA10B2Z9GJ8MKAYT45C2FquLfaTFXwzWI2lzj0DpaHRbIbyS6RlEn558XKaM4KqTv0Bb4OVjuIztNY17Or9KM3nZ3od5yJIIHVzeRfdDx9uRLLO6JN33VJZ3COpV2OBdu0m5nKCD1cdb25LKr9mDGeeNFfpA9L4Zr0kDkDsuTpT/rTrsNXY0EKPqoVMfek7uydJEKwNuANiMgiJAtl5qAA9kyLBelJbtD8X2FexfimlN6V/YFNrK2HANoZVxJb0ns8BCzwQAP7rJwRDOJqOttyQUkqL/+nx0sNG0DnzfPVZMPkgEHMg5eNy0h8rbn2X2USkAASBecaMRpS3QEw18IyYIeWEpGaohtkdv//1exajHB/0KLfzpO31V0LnF0te5v1oag/uuPT2ru/dNq+Ndg3TOEyMn/gZeS5WvqHJ+/JZThFaRwGeC0WqBd40h1RyIk+nUmNhjD2PaUDy7RPf3t+K0nn10se5IOugoRUsaVyhCQIdjJUJc4BBCFx9lGp9HJ+WUWQkolvd5kPn61pZNJeKFaZj6KsqgV7b6HOm99J9gKreC9vnbFfEnGQQCIA0+TpUTotZfBaro1Xbb/0cmlZX/BQwEwxyhtH9vexm/NPsPyoNrL0AQW44u4Wp3MdUEw5sDcBAmwhL5GwzIDMH+bfpHRTGYHDLu3n5PxlhlFyPbsQHZ+cNlW336MvD1PyE0umWcDzCaqQzcDQ2lnjYZUdUXw4naGcTK10RD25nTQ0pP5doXUTRv1n6+nOe/DTs6kYw7K7FEmwYzr9iDF7Ak7ZAMf+4vHK6xI1WxBnYsvald4AUK2a5r1SE7m43OxsjKQs0ZejtHZYi1kO1SdZ0LUw3norAb/4RFycpKItqM6uymLK52EkFYIBwpRyujj1Myx+ffIy5ITcCn5nxwrg7gcz9RHjQxt8U0yDiIbMxzP4nKk2V5NbwOnWxuX+tj/iql+otIZ1PBb09OceySaIoWMx7/ptKda/irPvy+DUcrGv1VH6rulbTiqgSFXmt+0RNaIyfm3IMEZyAzVtZmJOEC+pBfjj3JczZOKh0u7haCk5EX/moKdeWgl8cWsLJq9o81PTRNEhUCZnCIG6w2kg/od4XQ3EtarfIpO4TWqAd+0eOevkVHeKVtSin+X9GKIwX49uHu4JDSBhBwzt6FgCn7m+wzOhhDDDnh617LxYPqkv+opzz+KlqxccKon1wniQi5QoDRZrQra6+JbZI+4nC4Ne7j91bHvpVlDiyL3eH64/VGtbKnDdM/McWQ9pwXUdaG9GPrxqT0GdjElFrYnAR8Y0aPW9EruIyvigo1OH2/tzJQ/SWKbBX4nC5SaC0vNuCJ98sTwJeVke43I4nxHXGdCrALLxijFoy+DCl/1PvrMNpOXkrOJlXsqIpR6vrWfZH+jb3ncXIn3StfqhWCyU8CNwIHHmOxNqolesTiBfa6pK1uIA9DIkJLc8asnPz40OUC1Nzo2D7OERk7bXNzVAEMQRMcivj/QBsySBjdpATaB6ShPuc5R7nBmlwjMszatoi/qvwbT4SmurtyJXl5Yrj94J2OtLObrdiDLr4eVLC5iDPzb8x689Aq1PiVFjE93at3/UW/52drCE5y4khZJU/9C+Z5wMYkch6Jwft8NBnnW0niiSVNR/WOMIDmF/cZdvivJjHGjo6UUzC23SJraRrcQBNbGOTFbZHetnSkcYH3mm5kmSXYAgkDK9jeNZvIlMXFmGjRdN547h00iP8EG7CkpWUVf7cRKvJKf8b1pydeFPnrtL3Yu1AkNtm1m7wW4SpqTIxaCYKtwDhVmdh8Z5wKRoDXP/QLjGGYMPpU199QK7DesTappuLGtxE8BMhS/ZNq7flm2BUALNKpYHRanx6hkTbbY0wcjuYTJbchhaj8JmQIMaF2JhHOViDDxD7uPan0wgfB9dQyUGGCntGWzjJJvNalY3ShzrtqR7srQMPcoU+ftsuk0mEQKPX9kj/t75wAOXVvGbmsxInLCPAF9rlLMLkE6LD9Gwr3JfkeTBdHjOIamnPDf0Y0Ekgm+BX7SCWOpfaX4bhOqeGf2c84ObuVY/L3yvfHYAujVLB8SaxnFsvJt5lePPDGLkFX32lkGZWMzFidPSh4KGKKyYQSkWgEEcAMcL1+1NseJrnjkOssfWvvVVQVZCK+7ZqXo/dNq3ToiaTcWbK5P9IM6kF0PJ40wAnvPb82hGdaxKhKmayycCyWyKvw2DgnaHicmYg/Ni5E0dAVHx4/J/6aOrC0FfQJtYCkUj2GhpxTUXL9EHT0BGlbvONBZ5tAiHX5bPWal8HJxKkzpGGSxjY6xEU3QIwvqhTXIJHhoDt22xEZeQWZhVE9UmNe4DHARTyTMXYrwh8v30o8BBVZ8OJ4vPsjKLsROrEVcbK6IR0jgxA/935v9OZqf9wg4YqLEMtal7tUZD/nLXnJIXWtZ2X2Pacuchlp4cIIniwH3I7M90PoJHgJqmqLQ231a05Rv5ROo2i3NvO3gMPaJmu86pepmQhrHE/LU7/YukXebaAk4RuVc5dncnKm8eJ48hz+FmoD+ARgv62rDEeegNVy1m7Y+VZPHuAENKTUhrbggCxrYm7nVhlYKAZFUYvSwKAi5UMpQbKqI857CqbrLmEUUf8TQxolpk5HEEc4vHU1zJYpEudI2YVZskH9WOv1E+8kTqQzj19cLvZ0TCAcN99POMLJBLqVfmPS5mH7nN9ZQN62TW+D2UnVCVnYp2uVEP3L5W9jlGa+6P7kH7YU1Ecu/BPyJg7ZUY+xBOH5rHljJ9D91e+MvbNIgHCFhVHs8+ZHFPQrBIW04rB+3JJ5Jz4cjd31MFs0KAoku5GpnSZyzqsg3QyxSWRzfBOPYte8FdXU0o/nIiaDltu0y3o8M70EzOEtgIyG1NBC4pR91LquKSorlfy7ur0+KdkWTshAuJ7Dm/inqKmvsKNbIE3e0dhc5+/HYRG5SAqrx0Dllv27BNHxTEx3glKeBU+s57DMB5UtAH7H757hOj3YOUzuifVUWZ7iThN4VvhWq5gqSJvKDtjb02hPhjpWj1v5gYmr8+x5+KDrqvDgFavYLD7ZT4vGmy8fNQ1g/rsyK8gJfOCItZ7ErT9CMx+CV4uEk3N04wG5mGUKza+epBPFFPOZeXc8POQJudxLi8ploEjw1xD9iXLiJGJxZ8SM+1AgwJD8SpmWHPvHf52qDXBcRYV5btodxx1mqYRdI8M0LkFVjnYFIOT9BUkltkZbMu+v9Ekw79PiXg5S4srOIxUhMnqEaH9Du1AaFMTIY4/hnlwOKgwiXiMvECR1euR67wKkdfMUHL/eFYF+PKjCSxTtxHxrKp+CIpJNCmHTeu40rlsDDMYiRSPGh7MbNMEOIXrppGaX9BGgHywudF8Jfwrnk7pyC4Pl/nmR67PrGDm1gDUp5dHPTdEs/PgvKOOgwz5Xccjh1oG440WcIXEzwT9G1MhYkLAiMfdcL343OIDXA/iAkNrBgEtgKEwXMsnKmOtd1o4knx+Jl6tDgZJYivn6Jbp/ETJrhgIlDCHTtR+mRKi9qKKTdcs0pfbDTbZVsWVVX9RZHYxozCTkECV9LK8Bd1LPygPkPWlnlWblR7T472jI++kSgYUN07VDxt1KbnzTGPZ1rVhpI6sXlkDxV4S05toeR2q3Du3mRIGLtxy3VYL7dZrudvp/hZiSuwoMyIZScS9AN/3iKpafgepsc/Uz/yMPe10XJbycHLUAJ8FgZriq8pGdOyMwDkSKO2WRI3ejynRRDWzSU2g7mWl/GbM8hZ1MakIRj8bztsLt9L1SU0irBJCnbGS/gzsD7GbE4FgtLgnGDCWPhbWGCKLzyKThz61G65h8kQtHIP7ABHewFk80hvWCaUy9Vx8b0ycm8QDkFWraYt2JyTmcBG0MQTjGxyauNQycQWS4TgZ1LmRwWseLRpUFUxIxwYR1Q61nXXJQBbxyW96lI4tO9wc0+C+M0aUJ1sMF6WYStfZHrnIKBZcgn/626ZhMneQwm6eO2pj83ro758WFr2qfMUE3+YxyjXjZsGGArL+W4XN7hQupwZZvStYdvEhz6rHceasNYmeR+ZfmuCu5yhRtiK3Pxv92nvrRiHRhZ9MNA7+PlGWhKYsIm4f/SIL8viVvVo/UtlUOMaBN7Y/+le0mqwo7QuMR66TBwm4zFhasnvBxeyk+GozraJNLlW8YGB67u5kN6UhoFq/jOkvuPNCJSBezsEu6bfMHqfoTgsM9SJra4K89twCFo4TKqzNfLVYkOohg//2Vmgfs4xpHdp5R5gsRNLTyHkUAOyYBz4jcQgGgF1ePG7Vr45clfOT9j8QLh9Zyrz1Ows/ukaH8sDfdQqW7VperzJofeU69klMi0fmosDqh5XwMJ4X2hg8eO/1OxkjinTDzyfNrH1CLjWU3XIaRrbQGlmfT1eS8U+d2nU69+OztP9F9vRiDen+Usu+NHumsWPzz/moFwFJHCVxAp8jQK/4UJtNuTf7o0BNVf4biM9ZC3aOd1yu6JOmH/SQfprGBVppXxgIBbR6lrXBp2JIOEFFOaiR+I3Mm3lzHmrnXgmb7w2D8wXS8uFy5eaj2S9ahsRA+30K3rpA5iY701LFEm1jqZAR5s21YchpAyYsbgLtCYoxljnYGN8UGcxfEwqqct0eRM6R+lvjHj3Lwt3ngDh5hI43DMw9ffCSH1gP338je7LPd8ib6rlBjObdjWDdXknBMda33UgHOm5JgHn7KpE6sHXfbjJYnYlA/Ki32spK6HW78KATRoe4/CdWpdAS3yG56EvAwFAPCozVMHAACPl77pGBj9DvR1KwwAeLAK47doZ5sp8dhf+VAX7sO5sdJXFwC94mYfbgoJYuaUKtIsB+DPSJGgpA6hyQLlNkVUXOMluH4mTR6PCIjqk19Z4eUrukcgKLNEhgrCkskvAqERcav5/CPhHg9QnPmHAiiJJKuVxNuEmf//bRfk7AbAOuD/B3EqKIuTDQG1CBffGpcVCNsBBUa1WUF4GqugnFkVjCjOwI6OCoBeq2JFalQqM1idRj6SlSrX9CKviF36Dds1SOVIfpNPUPATHMEoz2tjU9HXvxSBCCC4j0XA0KE8dA9FWle3qeukMIoXoaruqGEptMQ2bRJUsqjCJLgz4EEcwG+LoBNbte3rqEUJO69IC8UI6gfUUC311HCDUhKlaB4VKKGAQEwD/2EAAAA=)}'
                }
              </style>
            </defs>
            <g id="g1" transform="translate(57.337 660.635)">
              <use
                id="use1"
                width={55}
                height={55}
                href="#image-18b770b7c6937675a91cdd055e730fa471270f88"
                opacity={1}
              />
            </g>
            <g id="g5" strokeLinecap="round" mask="url(#mask-WV78SWwYZW_oROd07u5O7)">
              <g id="g2" transform="translate(83.424 657.213)">
                <path
                  id="path1"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="m0 0 2.76-567.28M0 0l2.76-567.28"
                />
              </g>
              <g id="g3" transform="translate(83.424 657.213)">
                <path
                  id="path2"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M11.19-543.75c-2.59-7.23-5.18-14.47-8.43-23.53m8.43 23.53c-2.2-6.15-4.41-12.3-8.43-23.53"
                />
              </g>
              <g id="g4" transform="translate(83.424 657.213)">
                <path
                  id="path3"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M-5.91-543.83c2.67-7.21 5.33-14.42 8.67-23.45m-8.67 23.45c2.27-6.13 4.53-12.26 8.67-23.45"
                />
              </g>
            </g>
            <mask id="mask-WV78SWwYZW_oROd07u5O7">
              <path id="rect5" fill="#fff" d="M0 0h186.182v1324.495H0z" />
              <path id="rect6" fill="#000" d="M10 354.741h149.606v37.664H10z" opacity={1} />
            </mask>
            <g id="g8" strokeLinecap="round" transform="translate(178.704 477.708)">
              <path
                id="path7"
                fill="none"
                stroke="#1e1e1e"
                strokeWidth={2}
                d="M10.25 0h295.07M10.25 0h295.07m0 0c6.84 0 10.26 3.42 10.26 10.25M305.32 0c6.84 0 10.26 3.42 10.26 10.25m0 0v20.51m0-20.51v20.51m0 0c0 6.83-3.42 10.25-10.26 10.25m10.26-10.25c0 6.83-3.42 10.25-10.26 10.25m0 0H10.25m295.07 0H10.25m0 0C3.42 41.01 0 37.59 0 30.76m10.25 10.25C3.42 41.01 0 37.59 0 30.76m0 0V10.25m0 20.51V10.25m0 0C0 3.42 3.42 0 10.25 0M0 10.25C0 3.42 3.42 0 10.25 0"
              />
            </g>
            <g id="g13" strokeLinecap="round" mask="url(#mask-07AamB1ox___8Wk5jhJ07)">
              <g id="g10" transform="translate(110.07 648.162)">
                <path
                  id="path9"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M0 0c18.03-7.61 85.87-25.75 108.15-45.66 22.28-19.91 21.29-61.5 25.55-73.8M0 0c18.03-7.61 85.87-25.75 108.15-45.66 22.28-19.91 21.29-61.5 25.55-73.8"
                />
              </g>
              <g id="g11" transform="translate(110.07 648.162)">
                <path
                  id="path10"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M137.93-94.83c-1.15-6.69-2.3-13.38-4.23-24.63m4.23 24.63c-1.32-7.71-2.65-15.42-4.23-24.63"
                />
              </g>
              <g id="g12" transform="translate(110.07 648.162)">
                <path
                  id="path11"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M121.1-97.87c3.42-5.86 6.85-11.73 12.6-21.59m-12.6 21.59c3.95-6.76 7.89-13.52 12.6-21.59"
                />
              </g>
            </g>
            <mask id="mask-07AamB1ox___8Wk5jhJ07">
              <path id="rect13" fill="#fff" d="M0 0h343.771v867.627H0z" />
              <path id="rect14" fill="#000" d="M151.869 582.504h132.704v40H151.869z" opacity={1} />
            </mask>
            <g id="g19" strokeLinecap="round" mask="url(#mask-pUKonCLj0cKAVw9-wX83g)">
              <g id="g16" transform="translate(457.487 530.223)">
                <path
                  id="path15"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M0 0c-5.45 12.37 22.85 47.46-32.69 74.25s-250.47 72.07-300.57 86.49M0 0c-5.45 12.37 22.85 47.46-32.69 74.25s-250.47 72.07-300.57 86.49"
                />
              </g>
              <g id="g17" transform="translate(457.487 530.223)">
                <path
                  id="path16"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M-312.69 146.53c-5.09 3.51-10.18 7.03-20.57 14.21m20.57-14.21c-5.51 3.81-11.03 7.62-20.57 14.21"
                />
              </g>
              <g id="g18" transform="translate(457.487 530.223)">
                <path
                  id="path17"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M-308.37 163.07c-6.16-.57-12.31-1.15-24.89-2.33m24.89 2.33c-6.67-.62-13.35-1.25-24.89-2.33"
                />
              </g>
            </g>
            <mask id="mask-pUKonCLj0cKAVw9-wX83g">
              <path id="rect19" fill="#fff" d="M0 0h890.745v790.958H0z" />
              <path id="rect20" fill="#000" d="M346.236 584.469h157.12v40h-157.12z" opacity={1} />
            </mask>
            <g id="g22" strokeLinecap="round" transform="translate(175.159 259.121)">
              <path
                id="path21"
                fill="none"
                stroke="#1e1e1e"
                strokeWidth={2}
                d="M202.5 7.75c18.44 3.54 36.88 7.08 80.72 15.5M202.5 7.75c29.48 5.66 58.96 11.32 80.72 15.5m0 0c40.5 7.75 40.5 7.75 0 15.5m0-15.5c40.5 7.75 40.5 7.75 0 15.5m0 0c-26.91 4.5-53.82 9-80.72 13.5m80.72-13.5-80.72 13.5m0 0c-40.5 7.75-40.5 7.75-81 0m81 0c-40.5 7.75-40.5 7.75-81 0m0 0c-27.48-4.58-54.97-9.16-81-13.5m81 13.5c-24.89-4.15-49.78-8.3-81-13.5m0 0C0 31 0 31 40.5 23.25m0 15.5C0 31 0 31 40.5 23.25m0 0c19.68-3.77 39.36-7.53 81-15.5m-81 15.5c17.98-3.44 35.96-6.88 81-15.5m0 0C162 0 162 0 202.5 7.75m-81 0C162 0 162 0 202.5 7.75"
              />
            </g>
            <g id="g23" transform="translate(298.993 279.121)">
              <text
                id="text22"
                x={38.096}
                y={14.096}
                fill="#1e1e1e"
                direction="ltr"
                dominantBaseline="alphabetic"
                fontFamily="Excalifont, Segoe UI Emoji"
                fontSize={16}
                style={{
                  whiteSpace: 'pre',
                }}
                textAnchor="middle"
              >
                {'Sequencer'}
              </text>
            </g>
            <g id="g27" strokeLinecap="round" mask="url(#mask-6QIfV1lFdHss_IWtPlZbI)">
              <g id="g24" transform="translate(335.171 462.242)">
                <path
                  id="path23"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M0 0c.52-23.41 1.05-46.83 1.36-60.79M0 0c.29-12.98.58-25.97 1.36-60.79m0 0c-.08-27.92-.17-55.83-.22-74.88m.22 74.88c-.05-16.63-.1-33.25-.22-74.88"
                />
              </g>
              <g id="g25" transform="translate(335.171 462.242)">
                <path
                  id="path24"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M9.76-112.21c-3.32-9.04-6.64-18.07-8.62-23.46m8.62 23.46c-1.85-5.01-3.69-10.02-8.62-23.46"
                />
              </g>
              <g id="g26" transform="translate(335.171 462.242)">
                <path
                  id="path25"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M-7.34-112.16c3.26-9.05 6.53-18.11 8.48-23.51m-8.48 23.51c1.81-5.02 3.62-10.04 8.48-23.51"
                />
              </g>
            </g>
            <mask id="mask-6QIfV1lFdHss_IWtPlZbI">
              <path id="rect27" fill="#fff" d="M0 0h436.53v697.916H0z" />
              <path id="rect28" fill="#000" d="M255.53 361.449h162v80h-162z" opacity={1} />
            </mask>
            <g id="g35" strokeLinecap="round" mask="url(#mask-_fSHVLyZt9oGmzvYP119f)">
              <g id="g32" transform="translate(333.833 249.172)">
                <path
                  id="path31"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M0 0c-.24-21.65-.47-43.3-.74-68.23M0 0c-.23-21.09-.46-42.19-.74-68.23m0 0c.56-30.01 1.12-60.02 1.6-85.94m-1.6 85.94c.59-31.92 1.19-63.84 1.6-85.94"
                />
              </g>
              <g id="g33" transform="translate(333.833 249.172)">
                <path
                  id="path32"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M8.97-130.52c-2.57-7.5-5.15-15.01-8.11-23.65m8.11 23.65c-2.51-7.31-5.01-14.62-8.11-23.65"
                />
              </g>
              <g id="g34" transform="translate(333.833 249.172)">
                <path
                  id="path33"
                  fill="none"
                  stroke="#1e1e1e"
                  strokeWidth={1}
                  d="M-8.13-130.84c2.86-7.4 5.71-14.8 8.99-23.33m-8.99 23.33c2.78-7.21 5.56-14.42 8.99-23.33"
                />
              </g>
            </g>
            <mask id="mask-_fSHVLyZt9oGmzvYP119f">
              <path id="rect35" fill="#fff" d="M0 0h435.439v503.339H0z" />
              <path id="rect36" fill="#000" d="M252.289 130.938h161.6v100h-161.6z" opacity={1} />
            </mask>
            <g
              id="g42"
              style={{
                fill: 'none',
                strokeWidth: 2.40581,
              }}
              transform="matrix(19.9955 0 0 2.40017 262.19 232.072)"
            >
              <path
                id="path1-0"
                d="M-.255-67.821c-4.714 0-7.071 0-8.535-1.465-1.465-1.464-1.465-3.821-1.465-8.535s0-7.071 1.465-8.536C-7.326-87.82-4.97-87.82-.255-87.82s7.071 0 8.536 1.464c1.464 1.465 1.464 3.822 1.464 8.536 0 4.714 0 7.07-1.464 8.535C6.816-67.82 4.459-67.82-.255-67.82z"
                opacity={0.5}
                fill={determineElementFill(isHovered)}
                stroke="#1e1e1e"
                strokeWidth={1}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
              {determineElementText(isHovered)}
            </g>
          </svg>

        </div>
      )}
    </BrowserOnly>
  );
};
