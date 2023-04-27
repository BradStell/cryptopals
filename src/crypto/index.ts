/**
 * Maps a hex digit to it's decimal counterpart
 */
const hexValueLookup: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'A': 10,
  'B': 11,
  'C': 12,
  'D': 13,
  'E': 14,
  'F': 15,
  'a': 10,
  'b': 11,
  'c': 12,
  'd': 13,
  'e': 14,
  'f': 15,
}

/**
 * Maps a hex string into its bytes
 */
export function hexToBytes(hexStr: string): Uint8Array {
  const bytes: Uint8Array = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i+=2) {
    bytes[i/2] = (16 * hexValueLookup[hexStr[i]]) + hexValueLookup[hexStr[i+1]]
  }
  return bytes
}

/**
 * Maps a decimal digit to it's hex digit
 */
const hexValueReverseLookup: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: 'a',
  11: 'b',
  12: 'c',
  13: 'd',
  14: 'e',
  15: 'f',
}

/**
 * Encodes a byte array into a hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  let str: string = ''
  for (let i = 0; i < bytes.length; i++) {
    const a = hexValueReverseLookup[Math.floor(bytes[i] / 16)]
    const b = hexValueReverseLookup[bytes[i] % 16]
    str += (a + b)
  }
  return str
}

/**
 * Decodes a ascii string to a byte array
 */
export function strToBytes(str: string): Uint8Array {
  const bytes: Uint8Array = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str[i].charCodeAt(0)
  }
  return bytes
}

/**
 * base64 characters in index locations
 */
const base64IndexMap: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Encodes a byte array into base64 string
 */
export function toBase64(bytes: Uint8Array): string {
  let outString: string = ''
  const divBy3Len = Math.floor((bytes.length / 3)) * 3

  let i: number
  for (i = 0; i < divBy3Len; i+=3) {
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4) | ((bytes[i+1] & 0xF0) >> 4)]
    outString += base64IndexMap[((bytes[i+1] & 0x0F) << 2) | ((bytes[i+2] & 0xC0) >> 6)]
    outString += base64IndexMap[bytes[i+2] & 0x3F]
  }

  const remBytes = bytes.length - divBy3Len
  if (remBytes === 2) {
    i = bytes.length - 2
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4) | ((bytes[i+1] & 0xF0) >> 4)]
    outString += base64IndexMap[((bytes[i+1] & 0x0F) << 2)]
    outString += '='
  } else if (remBytes === 1) {
    i = bytes.length - 1
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4)]
    outString += '=='
  }

  return outString
}

export function xor(left: string, right: string): string {
  const lbytes: Uint8Array = hexToBytes(left)
  const rbytes: Uint8Array = hexToBytes(right)

  const out = new Uint8Array(lbytes.length)
  for (let i = 0; i < lbytes.length; i++) {
    out[i] = lbytes[i] ^ rbytes[i]
  }

  return bytesToHex(out)
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
export function plainTextScore(bytes: Uint8Array): number {
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
    // 9 10 and 13 should be excluded
    if (0 <= byte && byte <= 31 && byte !== 9 && byte !== 10 && byte !== 13) {
      characterMult += -100
    }

    // 48 - 57 are numbers
    if (48 <= byte && byte <= 57) {
      characterMult += 0.3
    }

    // 65 - 90 are cap letters
    if (65 <= byte && byte <= 90) {
      characterMult += 0.4
    }

    // 97 - 122 low letters
    if (97 <= byte && byte <= 122) {
      characterMult += 0.5
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

export function repeatingKeyXor(phrase: string, key: string): string {
  const bytes: Uint8Array = strToBytes(phrase)
  const keyBytes: Uint8Array = strToBytes(key)

  const out = new Uint8Array(bytes.length)
  for (let i = 0; i < phrase.length; i++) {
    out[i] = bytes[i] ^ keyBytes[i % 3]
  }

  return bytesToHex(out)
}
