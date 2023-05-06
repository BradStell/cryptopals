import { toBase64, fromBase64, strToBytes, bytesToStr } from "../crypto"

function start() {
  // console.log(`message: ${bytesToStr(fromBase64(toBase64(strToBytes(msg))))}`)

  console.log('-----------------')
  const msg2 = 'S'
  console.log(`message: ${msg2}`)
  console.log(`bytes: ${strToBytes(msg2)}`)
  console.log(`base64: ${toBase64(strToBytes(msg2))}`)
  console.log(`bytes: ${fromBase64(toBase64(strToBytes(msg2)))}`)
  console.log(`message: ${bytesToStr(fromBase64(toBase64(strToBytes(msg2))))}`)

  console.log('-----------------')
  const msg3 = 'Su'
  console.log(`message: ${msg3}`)
  console.log(`bytes: ${strToBytes(msg3)}`)
  console.log(`base64: ${toBase64(strToBytes(msg3))}`)
  console.log(`bytes: ${fromBase64(toBase64(strToBytes(msg3)))}`)
  console.log(`message: ${bytesToStr(fromBase64(toBase64(strToBytes(msg3))))}`)

  console.log('-----------------')
  const msg = 'Sun'
  console.log(`message: ${msg}`)
  console.log(`bytes: ${strToBytes(msg)}`)
  console.log(`base64: ${toBase64(strToBytes(msg))}`)
  console.log(`bytes: ${fromBase64(toBase64(strToBytes(msg)))}`)
  console.log(`message: ${bytesToStr(fromBase64(toBase64(strToBytes(msg))))}`)
}

start()
