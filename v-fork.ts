import type { ChildProcess } from 'child_process'
import { fork } from 'child_process'
import { EventEmitter } from 'events'
import { listeners } from './enums'
import { TVForkCreateOptions, TVForkMessages, TVForkParentMessages, TVForkRunScriptOptions } from './types'

export class VFork extends EventEmitter {
  private result: ChildProcess
  private timeout: NodeJS.Timeout
  private options: TVForkCreateOptions

  constructor(opts = { killOnError: false, listenerCount: 100 } as TVForkCreateOptions) {
    super()
    this.options = opts
    this.setMaxListeners(this.options.listenerCount)
    this.createFork()
  }

  public createFork(): void {
    // this.killFork()
    this.result = fork('./child.js')
    this.forkOn()
  }

  public runScript(sourceScript: string, opts = {} as TVForkRunScriptOptions): void {
    if (this.result.killed) {
      throw new Error('fork ölmüş')
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

  public resetFork(): void {
    this.createFork()
  }

  public killFork(): boolean {
    this.emit(listeners.closingFork)
    this.removeAllForkListeners()
    const status = this.result ? this.result?.kill() : true
    this.emit(listeners.closedFork)
    return status
  }

  private sendDataToChild(message: TVForkParentMessages): void {
    this.result.send(message)
  }

  private forkOn(): void {
    //Get Process Messages
    this.result.on('message', (message: TVForkMessages) => {
      this.emit(listeners.forkMessage, message)
    })
    //Catch Process Stop
    this.result.on('disconnect', this.forkOnDisconnect)
    //Catch Process Error
    this.result.on('error', this.forkOnError)
  }

  private removeAllForkListeners(): void {
    this.result.removeAllListeners()
  }

  private forkOnError(error: Error): void {
    this.emit(listeners.errorFork, error)
    clearTimeout(this.timeout)

    if (this.options.killOnError) {
      // this.killFork()
    }
  }

  private forkOnDisconnect(): void {
    clearTimeout(this.timeout)

    if (this.options.killOnError) {
      // this.killFork()
    }
  }
}
