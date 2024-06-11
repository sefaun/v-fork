import { TForkEvents, TForkUnexpectedEvents } from "./types"

export const listeners = {
  ready: 'ready',
  forkMessage: 'forkMessage',
  restartingFork: 'restartingFork',
  killingFork: 'killingFork',
  killedFork: 'killedFork',
  disconnectFork: 'disconnectFork',
  errorFork: 'errorFork',
  exitFork: 'exitFork',
  closedFork: 'closedFork',
} as const

export const forkUnexpectedEvents = {
  error: 'error',
  exit: 'exit',
  close: 'close',
  disconnect: 'disconnect',
} as Record<TForkUnexpectedEvents, TForkUnexpectedEvents>

export const forkEvents = Object.assign(
  {
    message: 'message'
  },
  forkUnexpectedEvents
) as Record<TForkEvents, TForkEvents>