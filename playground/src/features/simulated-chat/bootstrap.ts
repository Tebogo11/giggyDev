import { simulatedSource } from './source';
import { mountWidget } from '../../../../src/runtime/mount-widget';
import { simulateReply } from './replies';

// This explicit entry belongs only to the hosted playground, never the npm runtime.
const dispose = mountWidget({ mode: 'demo', simulateReply, resolveSource: simulatedSource });
if (import.meta.hot) import.meta.hot.dispose(dispose);
