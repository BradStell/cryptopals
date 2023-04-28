import { strToBytes } from "../crypto"

function start() {
  const hamming_distance: number = hammingdist(strToBytes('this is a test'), strToBytes('wokka wokka!!!'))
  console.log(`hamming distance: ${hamming_distance}`)

  for (let i = 0; i < 40; i++) {
    const key = new Uint8Array(i)
  }
}

function hammingdist(left: Uint8Array, right: Uint8Array): number {
  let dist: number = 0
  for (let i = 0; i < left.length; i++) {
    const diffBits = left[i] ^ right[i]
    for (let b = 0; b < 8; b++) {
      dist += ((diffBits >> b) & 0x01)
    }
  }
  return dist
}

start()
