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
