////////////////////////////////////////////////////////////////////////
//////////       Break repeating-key XOR
////////////////////////////////////////////////////////////////////////

import { readFile } from "node:fs/promises"

import { chunk, hammingDist, plainTextScore, repeatingKeyXor, strToBytes, transpose, xor } from "../crypto"

async function start() {
  // Write a function to compute the edit distance/Hamming distance between two strings. The Hamming distance is just the number of differing bits. The distance between
  const hamming_distance: number = hammingDist(strToBytes("this is a test"), strToBytes("wokka wokka!!!"))
  console.log(`hamming distance: ${hamming_distance}`)

  // TODO need to write a fromBase64 method
  const message_as_base64: string = await readFile("src/resources/6.txt", 'ascii')
  const message: Uint8Array = Buffer.from(message_as_base64, 'base64')

  // Let KEYSIZE be the guessed length of the key; try values from 2 to (say) 40.
  // For each KEYSIZE, take the first KEYSIZE worth of bytes, and the second KEYSIZE worth of bytes.
  let smallest_edit_dist: number = Infinity
  let block_len: number = 2
  for (let key_size = 2; key_size < 40; key_size++) {
    // only go up to an even number of keysizes
    const evenStopPoint: number = (message.length - (message.length % key_size))
    const edit_distances: number[] = []

    for (let b = 0; b < evenStopPoint; b += (key_size*2)) {
      const first = new Uint8Array(key_size)
      const second = new Uint8Array(key_size)

      // grab first key_size and second key_size worth of bytes of the cipher text bytes
      for (let m = b, i = 0; m < (b+key_size); m++, i++) {
        first[i] = message[m]
        second[i] = message[m+key_size]
      }

      // Find the edit distance between them. Normalize this result by dividing by KEYSIZE
      const normalized_edit_dist: number = hammingDist(first, second) / key_size
      edit_distances.push(normalized_edit_dist)
    }

    // average all normalized edit distances
    const avg_normalized_edit_dist = edit_distances.reduce((total, dist) => total + dist, 0) / edit_distances.length

    // The KEYSIZE with the smallest normalized edit distance is probably the key
    if (avg_normalized_edit_dist < smallest_edit_dist) {
      smallest_edit_dist = avg_normalized_edit_dist
      block_len = key_size
    }
  }

  console.log(`block size: ${block_len}`)

  // Now that you probably know the KEYSIZE: break the ciphertext into blocks of KEYSIZE length.
  const cipher_text_blocked: Uint8Array[] = chunk(block_len, message)

  // Now transpose the blocks: make a block that is the first byte of every block, and a block that is the second byte of every block, and so on. 
  const transposed: Uint8Array[] = transpose(cipher_text_blocked)

  let pos: number = 0
  let highScore: number = -Infinity
  let keyByte: number = 0x00
  const repeating_key_xor_key = new Uint8Array(block_len)

  for (const block of transposed) {
    for (let i = 0; i <= 255; i++) {
      const key: Uint8Array = new Uint8Array(block.length).fill(i)
      const xored: Uint8Array = xor(block, key)
      const score: number = plainTextScore(xored)

      if (score > highScore) {
        highScore = score
        keyByte = i
      }
    }
    repeating_key_xor_key[pos++] = keyByte
    highScore = -Infinity
    keyByte = 0x00
  }

  console.log(`key bytes: ${repeating_key_xor_key}`)
  console.log(`key ascii: ${Buffer.from(repeating_key_xor_key).toString('ascii')}`)

  const decrypted: Uint8Array = repeatingKeyXor(message, repeating_key_xor_key)
  console.log(Buffer.from(decrypted).toString('ascii'))
}

start()
