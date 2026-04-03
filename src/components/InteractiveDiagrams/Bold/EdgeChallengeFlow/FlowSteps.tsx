import React from 'react';
import { FLOW_STEPS } from './constants';

interface FlowStepsProps {
  currentStepIndex: number;
}

export default function FlowSteps({ currentStepIndex }: FlowStepsProps) {
  return (
    <div className="ecf-flow">
      <div className="ecf-flow-steps">
        {FLOW_STEPS.map((step, index) => {
          let className = 'ecf-step';
          if (index === currentStepIndex) className += ' ecf-step--active';
          else if (index < currentStepIndex) className += ' ecf-step--done';
          return (
            <div key={step.id} className={className}>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
