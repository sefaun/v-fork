import type { ChildProcess } from 'child_process'
import { fork } from 'child_process'
import { EventEmitter } from 'events'
import { TVForkMessages, TVForkParentMessages } from './types'


export class VFork extends EventEmitter {

  vFork: ChildProcess
  public forkEvents = {
    ready: 'ready',
    restart: 'restart',
    message: 'message',
    unexpected: 'unexpected'
  } as const
  private childProcessUnexpectedEvents = {
    error: 'error',
    exit: 'exit',
    close: 'close',
    disconnect: 'disconnect',
  } as const
  private childProcessEvents = {
    message: 'message',
    ...this.childProcessUnexpectedEvents
  } as const

  constructor(private readonly options = { maxListeners: 100 }) {
    super()
    this.setMaxListeners(this.options.maxListeners)
  }

  public createFork = (): void => {
    this.vFork = fork('./child.js')
    this.onFork()
    this.emit(this.forkEvents.ready)
  }

  private onFork = (): void => {
    // https://nodejs.org/api/child_process.html
    this.vFork.on(this.childProcessEvents.message, this.forkOnMessage)
    this.vFork.on(this.childProcessUnexpectedEvents.error, (err: Error) => this.forkUnexpected(this.childProcessUnexpectedEvents.error, err))
    this.vFork.on(this.childProcessUnexpectedEvents.exit, (code: number, signal: NodeJS.Signals) => this.forkUnexpected(this.childProcessUnexpectedEvents.exit, { code, signal }))
    this.vFork.on(this.childProcessUnexpectedEvents.close, (code: number, signal: NodeJS.Signals) => this.forkUnexpected(this.childProcessUnexpectedEvents.close, { code, signal }))
    this.vFork.on(this.childProcessUnexpectedEvents.disconnect, () => this.forkUnexpected(this.childProcessUnexpectedEvents.disconnect))
  }

  public runScript = (sourceScript: string): void => {
    this.sendDataToFork({
      sourceScript,
    })
  }

  private sendDataToFork = (message: TVForkParentMessages): void => {
    this.vFork.send(message)
  }

  public killFork = (): boolean => {
    const isKilled = this.vFork.kill()
    this.removeExistAllListeners()
    return isKilled
  }

  public restartFork = (): void => {
    this.killFork()
    this.emit(this.forkEvents.restart)
    this.createFork()
  }

  private removeExistAllListeners = (): void => {
    this.removeForkListeners()
  }

  private removeForkListeners = (): void => {
    this.vFork.removeAllListeners()
  }

  private forkOnMessage = (message: TVForkMessages): void => {
    if (!message.status) {
      this.emit(this.forkEvents.unexpected, message)
      return
    }
    this.emit(this.forkEvents.message, message)
  }

  private forkUnexpected = (_event: keyof typeof this.childProcessUnexpectedEvents, data?: any): void => {
    this.emit(this.forkEvents.unexpected,
      Object.assign(
        {
          status: false
        },
        data && toString.call(data) === '[object Object]' ? data : {}
      ) as TVForkMessages
    )
  }
}