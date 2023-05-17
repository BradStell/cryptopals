////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///
///   AES (Advanced Encryption Standard)
///     • Rijndael
///     • Family of ciphers each with a block size of 128 bits,
///       but three different key lengths: 128, 192 and 256 bits.
///
///
////////////////////////////////////////////////////////////////////////////////////
////////////////////      Decrypt AES in ECB mode       ////////////////////////////


import { createDecipheriv, Decipher } from "node:crypto"
import { readFile } from "node:fs/promises"

import { bytesToStr, fromBase64 } from "../crypto"

const KEY: string = 'YELLOW SUBMARINE'

async function start() {
  // read cipher text in from file and get bytes
  const message_as_base64: string = await readFile("src/resources/7.txt", 'ascii')
  const message: Uint8Array = fromBase64(message_as_base64.replaceAll('\n', ''))

  const decipher: Decipher = createDecipheriv('aes-128-ecb', KEY, "")
  decipher.setAutoPadding(true)

  const decrypted_bytes = Buffer.concat([
    decipher.update(message),
    decipher.final(),
  ])
  console.log( bytesToStr(decrypted_bytes) )
}

start()