import VFork from './index'
import { TVForkMessages } from './types'

const vFork = new VFork()
vFork.createFork()
const scripts = `
const aa = 101;
//while(true){};
//process.exit();
//bb.xx.dd;
aa;
`

async function main() {
  const result = await test().catch((err) => {
    console.log(err, 'hata !')
    vFork.restartFork()
    return err
  }) as TVForkMessages
  vFork.removeAllListeners()
  console.log(result, 'cevap1')
}

function test() {
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout

    vFork.on('restart', () => console.log('restart'))
    vFork.on('message', (message: any) => {
      clearTimeout(timeout)
      return resolve(message)
    })
    vFork.on('unexpected', (error: any) => {
      clearTimeout(timeout)
      return reject(error)
    })

    // Çalıştır
    vFork.runScript(scripts)

    // En fazla belirtilen süre kadar cevap gelmezse hata fırlat.
    timeout = setTimeout(() => {
      return reject({ status: false, error: true })
    }, 1500)
  })
}

main()