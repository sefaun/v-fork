import VFork from './index'
import { listeners } from './enums'

const vFork = new VFork()
const scripts = `
const aa = 101;
process.exit();
aa;
`

async function test() {
  return new Promise((resolve, reject) => {
    vFork.on(listeners.ready, () => {
      console.log('ready')
    })
    vFork.on(listeners.forkMessage, (message) => {
      setTimeout(() => {
        return resolve(message)
      }, 2000)
    })
    vFork.on(listeners.restartingFork, () => {
      console.log('restarting')
    })
    vFork.on(listeners.killingFork, () => {
      console.log('killing')
    })
    vFork.on(listeners.killedFork, () => {
      console.log('killed')
    })
    vFork.on(listeners.errorFork, (error: Error) => {
      console.log('error ->', error)
      return reject(error)
    })

    vFork.runScript(scripts, { restartFork: true })
  })
}

async function main() {
  try {
    vFork.createFork()

    const result = await test()
    // vFork.killFork()
    console.log(result, 'cevap1')
  } catch (error) {
    console.log(error, 'hata !')
  }
}

main()
