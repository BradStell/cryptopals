////////////////////////////////////////////////////////////////////////
//////////       Single-byte XOR cipher
////////////////////////////////////////////////////////////////////////

import { bytesToHex, hexToBytes, plainTextScore, xor } from '../crypto'

interface Phrase {
  score: number
  val: Uint8Array
}

function start() {
  // input hex encoded string
  const input: string = '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736'

  const highPhrase: Phrase = {
    score: 0,
    val: new Uint8Array()
  }

  for (let i = 0; i <= 255; i++) {
    const key: Uint8Array = new Uint8Array(input.length / 2).fill(i)
    const res: Uint8Array = xor(hexToBytes(input), key)
    const score: number = plainTextScore(res)

    if (score > highPhrase.score) {
      highPhrase.score = score
      highPhrase.val = res
    }
  }

  console.log({
    score: highPhrase.score,
    phrase: Buffer.from(highPhrase.val).toString('ascii')
  })
}

start()
