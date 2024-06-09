import VFork from './index'
import { listeners } from './enums'

const vFork = new VFork()
const scripts = `
const aa = 101;
aa;
`

vFork.createFork()

vFork.on(listeners.forkMessage, (message) => {
  console.log('cevap geldi ->', message)
})
vFork.on(listeners.closingFork, () => {
  console.log('closing')
})
vFork.on(listeners.closedFork, () => {
  console.log('closed')
})
vFork.on(listeners.errorFork, (error: Error) => {
  console.log('error ->', error)
})

vFork.runScript(scripts)

setTimeout(() => {
  vFork.killFork()
}, 1000)
