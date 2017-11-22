const usbwn = require('./usbwn.js')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let siren

console.log(`
  Dream Cheeky USB WebMail Notifier
  What do you want to do with it?
  ----------------------------------
  Set color type "color <color>"
    available colors pink, red, orange, yellow, green, blue, purple
  
  Set RGB type "rgb <red> <green> <blue>"
    For example "rgb 200 6 35"

  To start a siren type "siren <color1> <color2>"
    For example "siren blue red"

  To turn the notifier off type "off"

  To quit type "quit" or "exit"

`)

// Log unhandled rejections
process.on('unhandledRejection', rej => console.log(rej, 'Promise Rejection'))

rl.on('line', input => {
  const options = input.split(' ')
  const cmd = options[0]
  options.shift()

  switch (cmd) {
    case 'color':
      usbwn.setColor(options[0])
      break

    case 'rgb':
      usbwn.setRGB(options)
      break

    case 'siren':
      if (options.length < 2) return console.log('Missing parameters, use "siren <color1> <color2>"')
      if (siren) clearInterval(siren)

      siren = setInterval(() => {
        usbwn.setColor(options[0])
        setTimeout(() => {
          if (siren) return usbwn.setColor(options[1])
          usbwn.off()
        }, 500)
      }, 1000)
      break

    case 'off':
      if (siren) {
        clearInterval(siren)
        setTimeout(() => usbwn.off(), 1000)
      }

      usbwn.off()
      break

    case 'exit':
    case 'quit':
      process.exit(0)
      break

    default:
      console.log('Invalid command')
      break
  }
})