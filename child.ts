import { TVForkParentMessages, TVForkMessages } from './types'

function sendMessage(value: TVForkMessages) {
  process.send(value)
}

process.on('message', (message: TVForkParentMessages): void => {
  console.log('Message from parent:', message)

  if (message.healthCheck) {
    sendMessage({ status: true })
    return
  }

  if (message.eval) {
    const data = {
      message: null,
      finishScript: true,
      status: true,
      error: undefined,
    }

    try {
      data.message = eval(message.sourceScript)
    } catch (error) {
      data.status = false
      data.error = error
    }

    sendMessage(data)
    return
  }
})
