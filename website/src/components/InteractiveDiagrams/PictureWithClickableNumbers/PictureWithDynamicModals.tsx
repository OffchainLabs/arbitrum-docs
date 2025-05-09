import * as React from 'react';
import { FlowChartWithDynamicModals } from './FlowChartWithDynamicModals';
import { PictureWithClickableNumbersProps } from './types';

/**
 * Main export for the PictureWithClickableNumbers diagram component
 * that supports dynamic modal content loading.
 */
export default function PictureWithDynamicModals(
  props: PictureWithClickableNumbersProps & { diagramId?: string },
): JSX.Element {
  return <FlowChartWithDynamicModals {...props} />;
}
