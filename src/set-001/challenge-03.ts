////////////////////////////////////////////////////////////////////////
//////////       Single-byte XOR cipher
////////////////////////////////////////////////////////////////////////

import { bytesToHex, hexToBytes, strToBytes, xor } from '../crypto'

interface Phrase {
  score: number
  hex: string
}

function start() {
  // input hex encoded string
  const input: string = '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736'
  const inbytes = hexToBytes(input)

  const highPhrase: Phrase = {
    score: 0,
    hex: '',
  }

  for (let i = 0; i < 255; i++) {
    const key = new Uint8Array(input.length / 2).fill(i)
    const res = xor(input, bytesToHex(key))
    const score: number = scoreText(res)

    if (res === "Cooking MC's like a pound of bacon") {
      console.log('woah')
    }

    if (score > highPhrase.score) {
      highPhrase.score = score
      highPhrase.hex = res
    }
  }

  console.log({
    score: highPhrase.score,
    phrase: Buffer.from(highPhrase.hex, 'hex').toString('ascii')
  })
}

/**
 * Things to score:
 *  • needs to have spaces
 *    - ratio of spaces to phrase length
 *  • probably not too many numbers
 *    - more letters than numbers
 *  • only ascii characters
 *    - only printable characters
 *  • avg word length
 * 
 * extra things we could look into
 *  • check for repeating same chars
 *  • check character frequency map
 */
function scoreText(str: string): number {
  // const bytes: Uint8Array = strToBytes(str)
  const bytes: Uint8Array = hexToBytes(str)
  let score: number = 1

  // only printable ascii characters
  // The first 32 characters in the ASCII-table are unprintable control codes and are used to control peripherals such as printers. 
  // 0 -31 are non printable
  //  - most likely not a real sentence (return 0)
  // 32-127 are printable (127 is delete)
  //  - very high score
  // 128-255 are extended ascii (mostly symbols but there are quotes and other commonly seen characters)
  //  - small score but not a total reject
  let characterMult: number = 0
  for (const byte of bytes) {
    // non printable characters
    if (0 <= byte && byte <= 31) {
      characterMult += -100
    }

    // printable characters (keyboard chars)
    if (32 <= byte && byte <= 126) {
      characterMult += 0.5
    }

    if (127 <= byte && byte <= 255) {
      characterMult += 0.01
    }
  }
  score *= characterMult

  // ratio of spaces to phrase size
  // 6 / 34 = 0.17647058823529413
  // 69 / 405 = 0.17037037037037037
  // 104 / 585 = 0.17777777777777778
  // 2,697 / 14,966 = 0.18020847253775224
  // 1.65 - 1.85
  let numSpaces: number = 0
  for (const byte of bytes) {
    if (byte === 32) {
      numSpaces++
    }
  }

  const spaceToSizeRatio = numSpaces / bytes.length
  if (.165 <= spaceToSizeRatio && spaceToSizeRatio <= .185) {
    // in the golden ratio
    score *= 10
  } else {
    score *= 0.85
  }

  return score
}

start()
