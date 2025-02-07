import React, { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { createPortal } from 'react-dom';
import { NumberComponent } from './NumberComponent';
import modalContent from './modalContent.json';

type StepNumber = '1' | '2' | '3' | '4' | '5';

interface ModalProps {
  number: number;
  cx: number;
  cy: number;
}

interface ModalContent {
  title: string;
  content: {
    description: string;
    steps: string[];
  };
}

export function Modal({ number, cx, cy }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content: ModalContent = modalContent[number.toString() as StepNumber];

  const handleDialogChange = (isOpen: boolean) => setIsOpen(isOpen);

  const transition = useTransition(isOpen, {
    from: {
      scale: 0,
      opacity: 0,
    },
    enter: {
      scale: 1,
      opacity: 1,
    },
    leave: {
      scale: 0,
      opacity: 0,
    },
  });

  return (
    <>
      <g
        onClick={() => setIsOpen(true)}
        style={{
          cursor: 'pointer',
          pointerEvents: 'all',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <NumberComponent number={number} cx={cx} cy={cy} />
      </g>
      {typeof document !== 'undefined' &&
        createPortal(
          <Dialog.Root open={isOpen} onOpenChange={handleDialogChange}>
            <Dialog.Portal forceMount>
              {transition((style, isOpen) => (
                <>
                  {isOpen ? <OverlayBackground style={{ opacity: style.opacity }} /> : null}
                  {isOpen ? (
                    <Content forceMount style={style}>
                      <DialogHeader>
                        <CloseButton>
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15.9574 14.1689L8.59651 6.75098L6.73232 8.59598L14.1313 16.071L6.71338 23.4129L8.5964 25.2769L15.9574 17.8779L23.3943 25.2769L25.2392 23.4129L17.8213 16.071L25.2202 8.59598L23.3752 6.75098L15.9574 14.1689Z"
                              fill="currentColor"
                            />
                          </svg>
                        </CloseButton>
                      </DialogHeader>
                      <Title>{content.title}</Title>
                      <DialogBody>
                        <div>
                          <p>{content.content.description}</p>
                          <ul>
                            {content.content.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </DialogBody>
                    </Content>
                  ) : null}
                </>
              ))}
            </Dialog.Portal>
          </Dialog.Root>,
          document.body,
        )}
    </>
  );
}

const OverlayBackground = styled(animated(Dialog.Overlay))`
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: all;
  position: fixed;
  inset: 0;
  z-index: 9999;
`;

const Content = styled(animated(Dialog.Content))`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30vw;
  height: 40vh;
  background-color: rgb(135, 157, 187);
  border-radius: 4px;
  padding: 24px 24px 32px;
  z-index: 10000;
`;

const DialogHeader = styled.header`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const DialogBody = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const CloseButton = styled(Dialog.Close)`
  background-color: transparent;
  border: none;
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: #9dcced;
`;

const Title = styled(Dialog.Title)`
  font-size: 20px;
`;
