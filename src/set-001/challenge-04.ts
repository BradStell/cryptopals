////////////////////////////////////////////////////////////////////////
//////////       Detect single-character XOR
////////////////////////////////////////////////////////////////////////

/// One of the 60-character hex encoded strings in the file 4.txt has been encrypted by single-character XOR.
/// Find it

import { FileHandle, constants, open } from 'node:fs/promises'

import { hexToBytes, plainTextScore, xor } from '../crypto'

interface Phrase {
  score: number
  val: Uint8Array
  ascii: string
}

async function start() {
  const fh: FileHandle = await open(`${__dirname}/../resources/4.txt`, constants.O_RDONLY)

  const highPhrase: Phrase = {
    score: -Infinity,
    val: new Uint8Array(),
    ascii: ''
  }

  for await (const line of fh.readLines()) {
    for (let i = 0; i <= 255; i++) {
      const key: Uint8Array = new Uint8Array(line.length / 2).fill(i)
      const res: Uint8Array = xor(hexToBytes(line), key)
      const score: number = plainTextScore(res)
  
      if (score > highPhrase.score) {
        highPhrase.score = score
        highPhrase.val = res
        highPhrase.ascii = Buffer.from(res).toString('ascii')
      }
    }
  }

  console.log(highPhrase.ascii)
}

start()
