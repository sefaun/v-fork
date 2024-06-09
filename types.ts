export type TVForkCreateOptions = {
  restartOnKill?: boolean
  killOnError?: boolean
  listenerCount?: number
}

export type TVForkRunScriptOptions = {
  timeout?: number
  restartFork?: boolean
}

export type TVForkParentMessages = {
  eval: boolean
  sourceScript: string
  healthCheck?: boolean
}

export type TVForkMessages = {
  status: boolean
  message?: any
  finishScript?: boolean
  error?: Error
}
