const usb = require('usb')

const vendorID = 7476
const productID = 4

const init = [0x1F, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x03]

/* Try one of these if the above one does not work */
//const init = [0x00, 0x02, 0x00, 0x5F, 0x00, 0x00, 0x1F, 0x04]
//const init = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1F, 0x05]
//const init = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]

const colors = {
  pink:   [0xFF, 0x00, 0xFF],
  red:    [0xFF, 0x00, 0x00],
  orange: [0xFF, 0xA5, 0x00],
  yellow: [0xFF, 0xFF, 0x00],
  green:  [0x00, 0xFF, 0x00],
  blue:   [0x00, 0x00, 0xFF],
  purple: [0x80, 0x00, 0x80]
}

let webmailNotifier = usb.findByIds(vendorID, productID)
if (webmailNotifier) initiate()

function initiate() {
  const buff = new Buffer(init)

  webmailNotifier.open()
  
  changeColor([0,0,0]) // reset in case old color is stuck

  webmailNotifier.controlTransfer(0x21, 0x9, 0x200, 0x0, buff, function(error, data) {
    if (error) console.log(error)
  })
  
}

function changeColor(arr) {
  if (!webmailNotifier) 
    return console.log('Device not connected')

  const buff = new Buffer(arr.concat([0xFF,0xFF,0xFF,0x1F,0x05]))

  webmailNotifier.controlTransfer(0x21, 0x9, 0x200, 0x0, buff, function(error, data){
    if (error) console.log(error)
  })
}

usb.on('attach', device => {
  if (device.deviceDescriptor.idVendor == vendorID && device.deviceDescriptor.idProduct == productID) {
    webmailNotifier = device
    initiate()
  }
})

usb.on('detach', device => {
  if (device.deviceDescriptor.idVendor == vendorID && device.deviceDescriptor.idProduct == productID) {
    device.close()
    webmailNotifier = undefined
  }
})

module.exports = {
  setColor: async color => { 
    if (!colors[color])
      throw new Error('Color is not defined')
    
    changeColor(colors[color])
  },

  setRGB: async (rgb) => {
    if (rgb.length != 3) throw new Error('Missing paramaters')
    
    rgb = rgb.map(string => parseInt(string))

    if(rgb.reduce((a, b) => a+b) > 255+255+255) throw new Error('RGB value is too high')
    if(rgb.reduce((a, b) => a+b) < 0) throw new Error('RGB value is too low')

    changeColor(rgb.map(value => `0x${value.toString(16)}`))
  },

  off: async () => {
    changeColor([0x00, 0x00, 0x00])
  }
}