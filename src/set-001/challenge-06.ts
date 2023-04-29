import { readFile } from "node:fs/promises"

import { bytesToHex, hexToBytes, plainTextScore, strToBytes, xor } from "../crypto"

interface Phrase {
  score: number
  hex: string
  ascii: string
  key: Uint8Array
}

async function start() {
  // Write a function to compute the edit distance/Hamming distance between two strings. The Hamming distance is just the number of differing bits. The distance between
  const hamming_distance: number = hammingdist(strToBytes("this is a test"), strToBytes("wokka wokka!!!"))
  console.log(`hamming distance: ${hamming_distance}`)

  const message: Uint8Array = await readFile("src/resources/6.txt")

  let smallest_edit_dist: number = Infinity
  let block_len: number = 2

  // You could proceed perhaps with the smallest 2-3 KEYSIZE values
  const block_lens: number[] = []

  // Let KEYSIZE be the guessed length of the key; try values from 2 to (say) 40. 
  // For each KEYSIZE, take the first KEYSIZE worth of bytes, and the second KEYSIZE worth of bytes.
  for (let key_size = 2; key_size < 40; key_size++) {
    const left = new Uint8Array(key_size)
    const right = new Uint8Array(key_size)

    for (let i = 0; i < key_size; i++) {
      left[i] = message[i]
      right[i] = message[i+key_size]
    }

    // Find the edit distance between them. Normalize this result by dividing by KEYSIZE
    const normalized_edit_dist: number = hammingdist(left, right) / key_size

    // The KEYSIZE with the smallest normalized edit distance is probably the key
    if (normalized_edit_dist < smallest_edit_dist) {
      block_len = key_size
      block_lens.push(key_size)
      smallest_edit_dist = normalized_edit_dist
    }
  }

  // You could proceed perhaps with the smallest 2-3 KEYSIZE values
  const first_keysize_block_lens: number[] =  block_lens.reverse().slice(0, 3)


  console.log(`The smallest edit dist had a normalized value of: ${block_len}`)
  console.log(`The first sorted key sizes are: ${first_keysize_block_lens}`)

  // Now that you probably know the KEYSIZE: break the ciphertext into blocks of KEYSIZE length.
  const cipher_text_blocked: Uint8Array[] = []
  for (let i = 0; i < message.length; i+= block_len) {
    const block = new Uint8Array(block_len)
    for (let j = 0; j < block_len; j++) {
      block[j] = message[i+j]
    }
    cipher_text_blocked.push(block)
  }

  // Now transpose the blocks: make a block that is the first byte of every block, and a block that is the second byte of every block, and so on. 
  const transposed: Uint8Array[] = new Array(block_len)
  for (let i = 0; i < block_len; i++) {
    transposed[i] = new Uint8Array(cipher_text_blocked.length)
  }
  for (let i = 0; i < cipher_text_blocked.length; i++) {
    for (let j = 0; j < block_len; j++) {
      transposed[j][i] = cipher_text_blocked[i][j]
    }
  }

  // Solve each block as if it was single-character XOR. You already have code to do this. 
  const highPhrasse: Phrase[] = []
  let highPhrase: Phrase = {
    score: -Infinity,
    hex: '',
    ascii: '',
    key: new Uint8Array()
  }

  for (const block of transposed) {
    for (let i = 0; i < 255; i++) {
      const key: Uint8Array = new Uint8Array(block.length).fill(i)
      const res = xor(bytesToHex(block), bytesToHex(key))
      const score: number = plainTextScore(hexToBytes(res))
  
      if (score > highPhrase.score) {
        highPhrase.score = score
        highPhrase.hex = res
        highPhrase.ascii = Buffer.from(hexToBytes(res)).toString('ascii')
        highPhrase.key = key
      }
    }
    highPhrasse.push({ ...highPhrase })
    highPhrase.score = -Infinity
  }

  const the_key = new Uint8Array(highPhrase.key.length * transposed.length)
  const decrypted_base64: string = xor(bytesToHex(message), bytesToHex(the_key))
  console.log(`the decrypted message is: ${Buffer.from(decrypted_base64, 'base64').toString('ascii')}`)
}

function hammingdist(left: Uint8Array, right: Uint8Array): number {
  let num_diff_bits: number = 0
  for (let i = 0; i < left.length; i++) {
    const diffBits = left[i] ^ right[i]
    for (let b = 0; b < 8; b++) {
      num_diff_bits += ((diffBits >> b) & 0x01)
    }
  }
  return num_diff_bits
}

start()
