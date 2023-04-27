import { FileHandle, constants, open } from 'node:fs/promises'

import { bytesToHex, hexToBytes, plainTextScore, xor } from '../crypto'

interface Phrase {
  score: number
  hex: string
  ascii: string
}

async function start() {
  const fh: FileHandle = await open(`${__dirname}/../resources/4.txt`, constants.O_RDONLY)

  const highPhrase: Phrase = {
    score: -Infinity,
    hex: '',
    ascii: ''
  }

  for await (const line of fh.readLines()) {
    for (let i = 0; i <= 255; i++) {
      const key: Uint8Array = new Uint8Array(line.length / 2).fill(i)
      const res: string = xor(line, bytesToHex(key))
      const score: number = plainTextScore(hexToBytes(res))
  
      if (score > highPhrase.score) {
        highPhrase.score = score
        highPhrase.hex = res
        highPhrase.ascii = Buffer.from(hexToBytes(res)).toString('ascii')
      }
    }
  }

  console.log(highPhrase)
}

start()
