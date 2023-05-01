////////////////////////////////////////////////////////////////////////
//////////       Break repeating-key XOR
////////////////////////////////////////////////////////////////////////

import { readFile } from "node:fs/promises"

import { bytesToHex, chunk, chunk_ints, hammingDist, hexToBytes, plainTextScore, repeatingKeyXor, strToBytes, transpose, transpose_ints, xor } from "../crypto"

interface Phrase {
  score: number
  hex: string
  ascii: string
  key: Uint8Array
}

async function start() {
  // Write a function to compute the edit distance/Hamming distance between two strings. The Hamming distance is just the number of differing bits. The distance between
  const hamming_distance: number = hammingDist(strToBytes("this is a test"), strToBytes("wokka wokka!!!"))
  console.log(`hamming distance: ${hamming_distance}`)

  // // TODO need to write a fromBase64 method
  const message_as_base64: string = await readFile("src/resources/6.txt", 'ascii')
  const message: Uint8Array = Buffer.from(message_as_base64, 'base64')

  
  // Let KEYSIZE be the guessed length of the key; try values from 2 to (say) 40.
  // For each KEYSIZE, take the first KEYSIZE worth of bytes, and the second KEYSIZE worth of bytes.
  let smallest_edit_dist: number = Infinity
  // let block_len: number = 2
  const block_lens: number[] = []
  for (let key_size = 2; key_size < 40; key_size++) {
    const first = new Uint8Array(key_size)
    const second = new Uint8Array(key_size)

    // grab first key_size and second key_size worth of bytes of the cipher text bytes
    for (let i = 0; i < key_size; i++) {
      first[i] = message[i]
      second[i] = message[i+key_size]
    }

    // Find the edit distance between them. Normalize this result by dividing by KEYSIZE
    const normalized_edit_dist: number = hammingDist(first, second) / key_size

    // The KEYSIZE with the smallest normalized edit distance is probably the key
    if (normalized_edit_dist < smallest_edit_dist) {
      smallest_edit_dist = normalized_edit_dist
      // block_len = key_size
      block_lens.push(key_size)
    }
  }

  const top_block_lengths: number[] = block_lens.reverse().slice(0, 10)

  for (const block_len of top_block_lengths) {
    console.log(`block size: ${block_len}`)

    // Now that you probably know the KEYSIZE: break the ciphertext into blocks of KEYSIZE length.
    const cipher_text_blocked: Uint8Array[] = chunk(block_len, message)

    // Now transpose the blocks: make a block that is the first byte of every block, and a block that is the second byte of every block, and so on. 
    const transposed: Uint8Array[] = transpose(cipher_text_blocked)

    let highPhrase = {
      score: -Infinity,
      value: '',
      key_byte: 0x00,
    }

    const repeating_key_xor_key = new Uint8Array(block_len)
    let pos: number = 0
    for (const block of transposed) {
      for (let i = 0; i <= 255; i++) {
        const key: Uint8Array = new Uint8Array(block.length).fill(i)
        const xored: Uint8Array = xor(block, key)
        const score: number = plainTextScore(xored)

        if (score > highPhrase.score) {
          highPhrase.score = score
          highPhrase.value = bytesToHex(xored)
          highPhrase.key_byte = i
        }
      }
      // console.log(highPhrase)
      repeating_key_xor_key[pos++] = highPhrase.key_byte
      highPhrase = { score: -Infinity, value: '', key_byte: 0x00 }
    }

    console.log(repeating_key_xor_key)
    console.log(Buffer.from(repeating_key_xor_key).toString('ascii'))

    const decrypted: Uint8Array = repeatingKeyXor(message, repeating_key_xor_key)
    console.log(Buffer.from(decrypted).toString('ascii'))
  }

  // // Solve each block as if it was single-character XOR. You already have code to do this. 
  // const high_phrases: Phrase[] = []
  // let highPhrase: Phrase = {
  //   score: -Infinity,
  //   hex: '',
  //   ascii: '',
  //   key: new Uint8Array()
  // }

  // for (const block of transposed) {
  //   console.log()
  //   console.log()
  //   for (let i = 0; i < 255; i++) {
  //     const key = new Uint8Array(block.length).fill(i)
  //     const res = xor(bytesToHex(block), bytesToHex(key))

  //     const score: number = plainTextScore(hexToBytes(res))

  //     if (score > highPhrase.score) {
  //       highPhrase.score = score
  //       highPhrase.hex = res
  //       highPhrase.ascii = Buffer.from(hexToBytes(res)).toString('ascii')
  //       highPhrase.key = key
  //       console.log(`key: ${key}`)
  //     }
  //   }
  //   high_phrases.push({ ...highPhrase })
  //   highPhrase.score = -Infinity
  // }
}

start()
