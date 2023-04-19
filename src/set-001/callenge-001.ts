////////////////////////////////////////////////////////////////////////
//////////       Convert hex to base64
////////////////////////////////////////////////////////////////////////

const base64IndexMap: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function start() {
  // str to byte funcs
  console.assert( strToBytes('Sun').toString() === new Uint8Array(Buffer.from('Sun')).toString(), 'Converting %s to bytes failed', 'Sun' )
  console.assert( hexToBytes('49276d').toString() === new Uint8Array(Buffer.from('49276d', 'hex')).toString(), 'Converting %s to bytes failed', '49276d' )

  // base64 encoding
  console.assert( 'Uw==' === toBase64(strToBytes('S')), 'Encoding did not work for %s', 'S' )
  console.assert( 'U3U=' === toBase64(strToBytes('Su')), 'Encoding did not work for %s', 'Su' )
  console.assert( 'U3Vu' === toBase64(strToBytes('Sun')), 'Encoding did not work for %s', 'Sun' )
  console.assert( 'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t' === toBase64(hexToBytes('49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d')), 'Encoding did not work for %s', '49276d206b696c6c696e6...' )
  console.assert( 'TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu' === toBase64(strToBytes('Many hands make light work.')), 'Encoding did not work for %s', 'Many ha...' )
}

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
function hexToBytes(hexStr: string): Uint8Array {
  const bytes: Uint8Array = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i+=2) {
    bytes[i/2] = (16 * hexValueLookup[hexStr[i]]) + hexValueLookup[hexStr[i+1]]
  }
  return bytes
}

/**
 * Maps a string to its bytes
 */
function strToBytes(str: string): Uint8Array {
  const bytes: Uint8Array = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str[i].charCodeAt(0)
  }
  return bytes
}

/**
 * encodes a byte array into base64 string
 */
function toBase64(bytes: Uint8Array): string {
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

start()
