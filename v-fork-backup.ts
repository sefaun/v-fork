import type { ChildProcess } from 'child_process'
import { fork } from 'child_process'
import { EventEmitter } from 'events'
import { listeners } from './enums'
import { TVForkCreateOptions, TVForkMessages, TVForkParentMessages, TVForkRunScriptOptions } from './types'

export class VFork extends EventEmitter {
  private result: ChildProcess
  private timeout: NodeJS.Timeout
  private options: TVForkCreateOptions

  constructor(opts = { restartOnKill: true, killOnError: false, listenerCount: 100 } as TVForkCreateOptions) {
    super()
    this.options = opts
    this.setMaxListeners(this.options.listenerCount)
    this.createFork()
  }

  public createFork = (): void => {
    if (this.result) {
      this.killFork()
    }

    this.result = fork('./child.js')
    this.forkOn()
    this.emit(listeners.ready)
  }

  public runScript = (sourceScript: string, opts = {} as TVForkRunScriptOptions): void => {
    if (opts.restartFork) {
      this.restartFork()
    } else {
      if (this.result.killed) {
        if (this.options.restartOnKill) {
          this.restartFork()
        } else {
          throw new Error('fork ölmüş')
        }
      }
    }

    this.sendDataToChild({
      eval: true,
      sourceScript,
    })

    // if (opts.timeout) {
    //   this.timeout = setTimeout(() => {
    //     this.killFork()
    //   }, opts.timeout)
    // }
  }

  public restartFork = (): void => {
    this.emit(listeners.restartingFork)
    this.createFork()
  }

  public killFork = (): boolean => {
    if (!this.result) {
      console.log('fork açılmadı')
      return false
    }

    this.removeAllForkListeners()
    const status = this.result ? this.result?.kill() : true
    if (this.result.killed) {
      this.emit(listeners.killedFork)
    } else {
      console.log('fork kapatılamadı')
    }
    return status
  }

  private sendDataToChild = (message: TVForkParentMessages): void => {
    this.result.send(message)
  }

  private forkOn = (): void => {
    //Get Process Messages
    this.result.on('message', (message: TVForkMessages) => {
      this.emit(listeners.forkMessage, message)
    })
    //https://nodejs.org/api/child_process.html#event-error
    this.result.on('error', this.forkOnError)
    this.result.on('exit', this.forkOnExit)
    this.result.on('close', this.forkOnClose)
  }

  private removeAllForkListeners = (): void => {
    this.result.removeAllListeners()
  }

  private forkOnError = (error: Error): void => {
    this.emit(listeners.errorFork, error)

    if (this.options.killOnError) {
      this.killFork()
      if (this.options.restartOnKill) {
        this.restartFork()
      }
    }
  }

  private forkOnExit = (code: number, signal: NodeJS.Signals): void => {
    this.emit(listeners.exitFork, { code, signal })
  }

  private forkOnClose = (code: number, signal: NodeJS.Signals): void => {
    this.emit(listeners.closedFork, { code, signal })
    if (this.options.restartOnKill) {
      this.restartFork()
    }
  }

}
