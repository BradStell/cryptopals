const hexValueLookup: string = '0123456789abcdef'

/**
 * Maps a hex string into its bytes
 */
export function hexToBytes(hexStr: string): Uint8Array {
  const bytes: Uint8Array = new Uint8Array(hexStr.length / 2)
  for (let i = 0; i < hexStr.length; i+=2) {
    bytes[i/2] = (16 * hexValueLookup.indexOf(hexStr[i])) + hexValueLookup.indexOf(hexStr[i+1])
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
 * Encodes a series of bytes into their ascii code characters as a string
 */
export function bytesToStr(bytes: Uint8Array): string {
  let out: string = ''
  for (let i = 0; i < bytes.length; i++) {
    out += String.fromCharCode(bytes[i])
  }
  return out
}

// base64 characters in index locations
const base64IndexMap: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Encodes a byte array into base64 string
 */
export function toBase64(bytes: Uint8Array): string {
  let outString: string = ''
  const divBy3Len = Math.floor(bytes.length / 3) * 3

  let i: number
  for (i = 0; i < divBy3Len; i+=3) {
    // no padding bytes
    //
    // ascii            |   S           u           n
    // decimal          |   83          117         110
    // 8 bit parts      |   010100|11   0111|0101   01|101110
    // 6 bit parts      |   010100      110111      010101      101110
    // decimal          |   20          55          21          46
    // base64 chars     |   U           3           V           u
    //
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4) | ((bytes[i+1] & 0xF0) >> 4)]
    outString += base64IndexMap[((bytes[i+1] & 0x0F) << 2) | ((bytes[i+2] & 0xC0) >> 6)]
    outString += base64IndexMap[bytes[i+2] & 0x3F]
  }

  const num_padding_bytes = 3 - (bytes.length - divBy3Len)

  // double padding bytes `= =`
  //
  // ascii            |   S
  // decimal          |   83
  // 8 bit parts      |   010100|11
  // 6 bit parts      |   010100      11|0000     000000      000000
  // decimal          |   20          48          0           0
  // base64 chars     |   U           w           =           =
  //
  if (num_padding_bytes === 2) {
    i = bytes.length - 1
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4)]
    outString += '=='
  }

  // single padding byte `=`
  //
  // ascii            |   S            u
  // decimal          |   83           117
  // 8 bit parts      |   010100|11    0111|0101
  // 6 bit parts      |   010100       11|0111       0101|00       000000
  // base64 chars     |   U            3             U             =
  // decimal          |   20           55            20            0
  //
  else if (num_padding_bytes === 1) {
    i = bytes.length - 2
    outString += base64IndexMap[bytes[i] >> 2]
    outString += base64IndexMap[((bytes[i] & 0x03) << 4) | ((bytes[i+1] & 0xF0) >> 4)]
    outString += base64IndexMap[((bytes[i+1] & 0x0F) << 2)]
    outString += '='
  }

  return outString
}

export function fromBase64(str: string): Uint8Array {
  // bytes -> base64 | 3 bytes -> 4 chars
  // base64 -> bytes | 4 chars -> 3 bytes
  const out = new Uint8Array((str.length / 4) * 3)
  let out_index: number = 0
  for (let i = 0; i < str.length; i+=4) {
    const a: number = base64IndexMap.indexOf(str[i])
    const b: number = base64IndexMap.indexOf(str[i+1])
    const c: number = base64IndexMap.indexOf(str[i+2])
    const d: number = base64IndexMap.indexOf(str[i+3])

    // double padding bytes `= =`
    //
    // base64 chars     |   U           w           =           =
    // decimal          |   20          48          0           0
    // 6 bit parts      |   010100      11|0000     000000      000000
    // 8 bit parts      |   010100|11
    // decimal          |   83
    // ascii            |   S
    //
    if (c === -1 && d === -1) {
      out[out_index] = (a << 2) | ((b & 0x30)  >> 4)

      return out.slice(0, out.length - 2)
    }

    // single padding byte `=`
    //
    // base64 chars     |   U            3             U             =
    // decimal          |   20           55            20            0
    // 6 bit parts      |   010100       11|0111       0101|00       000000
    // 8 bit parts      |   010100|11    0111|0101
    // decimal          |   83           117
    // ascii            |   S            u
    //
    else if (d === -1) {
      out[out_index] = (a << 2) | ((b & 0x30)  >> 4)
      out[out_index+1] = ((b & 0x0f) << 4) | ((c & 0x3c) >> 2)

      return out.slice(0, out.length - 1)
    }

    // no padding bytes
    //
    // base64 chars     |   U           3           V           u
    // decimal          |   20          55          21          46
    // 6 bit parts      |   010100      110111      010101      101110
    // 8 bit parts      |   010100|11   0111|0101   01|101110
    // decimal          |   83          117         110
    // ascii            |   S           u           n
    //
    else {
      out[out_index] = (a << 2) | ((b & 0x30)  >> 4)
      out[out_index+1] = ((b & 0x0f) << 4) | ((c & 0x3c) >> 2)
      out[out_index+2] = ((c & 0x03) << 6) | d
    }

    out_index += 3
  }
  return out
}

export function xor(left: Uint8Array, right: Uint8Array): Uint8Array {
  const out = new Uint8Array(left.length)
  for (let i = 0; i < left.length; i++) {
    out[i] = left[i] ^ right[i]
  }

  return out
}

const avg_word_char_map: Record<number, number> = {
  10: 0,
  20: 0,
  28: 0,
  29: 0,
  32: 0.16906326262436644,
  33: 0.00003754458419373005,
  36: 0.0004880795945184907,
  39: 0.0010512483574244415,
  40: 0.00026281208935611036,
  41: 0.00026281208935611036,
  44: 0.01302797071522433,
  45: 0.0016519617045241224,
  46: 0.00788436268068331,
  48: 0.001989862962267693,
  49: 0.0012389712783930917,
  50: 0.0006382579312934109,
  51: 0.0009761591890369814,
  52: 0.0006007133470996808,
  53: 0.0006007133470996808,
  54: 0.0005256241787122207,
  55: 0.0004129904261310306,
  56: 0.0007884362680683311,
  57: 0.0005256241787122207,
  58: 0.0000750891683874601,
  59: 0.0008259808522620612,
  65: 0.0018772292096865028,
  66: 0.000713347099680871,
  67: 0.0023653088042049934,
  68: 0.0006007133470996808,
  69: 0.00045053501032476064,
  70: 0.00045053501032476064,
  71: 0.0004129904261310306,
  72: 0.0016895062887178525,
  73: 0.0009386146048432514,
  74: 0.0004129904261310306,
  75: 0.00011263375258119016,
  76: 0.000675802515487141,
  77: 0.0016895062887178525,
  78: 0.00037544584193730055,
  79: 0.0006007133470996808,
  80: 0.0011263375258119017,
  81: 0.00003754458419373005,
  82: 0.0005256241787122207,
  83: 0.0030411113196921343,
  84: 0.004317627182278956,
  85: 0.0000750891683874601,
  86: 0.00022526750516238032,
  87: 0.0012389712783930917,
  89: 0.00003754458419373005,
  97: 0.0622113760090107,
  98: 0.010662661911019335,
  99: 0.02256429510043176,
  100: 0.02752018021400413,
  101: 0.1045616669795382,
  102: 0.01978599587009574,
  103: 0.01441712033039234,
  104: 0.04824479068894312,
  105: 0.0549652712596208,
  106: 0.0008259808522620612,
  107: 0.003491646330016895,
  108: 0.02782053688755397,
  109: 0.017270508729115824,
  110: 0.051060634503472875,
  111: 0.060146423878355545,
  112: 0.014079219072648771,
  113: 0.0010512483574244415,
  114: 0.05203679369250985,
  115: 0.05008447531443589,
  116: 0.07846818096489581,
  117: 0.019635817533320818,
  118: 0.006570302233902759,
  119: 0.011788999436831238,
  120: 0.0011263375258119017,
  121: 0.012089356110381078,
  122: 0.0006007133470996808,
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
  // const char_map = buildCharFreqMap(bytes)
  // const df = compareCharFreqMaps(char_map, avg_word_char_map)
  // return df

  let score: number = 0

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
      characterMult -= 100
    }

    // 48 - 57 are numbers
    else if (48 <= byte && byte <= 57) {
      characterMult += 0.2
    }

    // 65 - 90 are cap letters
    else if (65 <= byte && byte <= 90) {
      characterMult += 1
    }

    // 97 - 122 low letters
    else if (97 <= byte && byte <= 122) {
      characterMult += 2
    }

    // space
    else if (byte === 32) {
      characterMult += 1
    }

    // printable characters (keyboard chars)
    else if (33 <= byte && byte <= 126) {
      characterMult -= 1
    }

    else if (127 <= byte && byte <= 255) {
      characterMult -= 10
    }
  }
  score += characterMult

  // ratio of spaces to phrase size
  // 6 / 34 = 0.17647058823529413
  // 69 / 405 = 0.17037037037037037
  // 104 / 585 = 0.17777777777777778
  // 2,697 / 14,966 = 0.18020847253775224
  // 1.65 - 1.85
  // let numSpaces: number = 0
  // for (const byte of bytes) {
  //   if (byte === 32) {
  //     numSpaces++
  //   }
  // }

  // const spaceToSizeRatio = numSpaces / bytes.length
  // if (.165 <= spaceToSizeRatio && spaceToSizeRatio <= .185) {
  //   // in the golden ratio
  //   score *= 10
  // } else {
  //   // score *= 0.85
  // }

  return score
}

function compareCharFreqMaps(compare: Record<number, number>, toBase: Record<number, number>): number {
  // get sum to base the percentages off of
  const compare_sum: number = Object.keys(compare).reduce((total: number, key: string): number => (
    total + compare[+key]
  ), 0)
  const base_sum: number = Object.keys(toBase).reduce((total: number, key: string): number => (
    total + toBase[+key]
  ), 0)

  // convert to percentages
  const compare_percents: Record<number, number> = {}
  for (const byte in compare) {
    compare_percents[byte] = compare[+byte] / compare_sum
  }
  const base_percents: Record<number, number> = {}
  for (const byte in toBase) {
    base_percents[byte] = toBase[+byte] / base_sum
  }

  const diffs: number[] = []
  for (const key in compare_percents) {
    // diffs.push(1 - Math.abs((compare_percents[+key] ?? 0) - (base_percents[+key] ?? 0)))
    const left = compare_percents[+key] ?? 0
    const right = base_percents[+key] ?? 0
    const largest = left > right ? left : right
    const smallest = left < right ? left : right
    diffs.push(smallest / largest)
  }
  return diffs.reduce((total, num) => total + num, 0) / diffs.length
}

// TODO need to take percentage of whole for each byte data point
export function buildCharFreqMap(bytes: Uint8Array): Record<number, number> {
  const freq_map: Record<number, number> = {}

  // total all byte occurances
  for (const byte of bytes) {
    if (freq_map[byte]) {
      freq_map[byte] += 1
    } else {
      freq_map[byte] = 1
    }
  }

  return freq_map

  // // get sum to base the percentages off of
  // const sum: number = Object.keys(freq_map).reduce((total: number, key: string): number => (
  //   total + freq_map[+key]
  // ), 0)

  // // convert to percentages
  // for (const byte in freq_map) {
  //   freq_map[byte] = freq_map[byte] / sum
  // }

  // return freq_map
}

export function repeatingKeyXor(phrase: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(phrase.length)
  for (let i = 0; i < phrase.length; i++) {
    out[i] = phrase[i] ^ key[i % key.length]
  }

  return out
}

export function hammingDist(left: Uint8Array, right: Uint8Array): number {
  let num_diff_bits: number = 0
  for (let i = 0; i < left.length; i++) {
    const diffBits = left[i] ^ right[i]
    for (let b = 0; b < 8; b++) {
      num_diff_bits += ((diffBits >> b) & 0x01)
    }
  }
  return num_diff_bits
}

export function chunk(chuck_size: number, data: Uint8Array): Uint8Array[] {
  const chunked: Uint8Array[] = []
  const remaining = data.length % chuck_size

  for (let i = 0; i < (data.length - remaining); i+= chuck_size) {
    const block: Uint8Array = new Uint8Array(chuck_size)
    for (let j = 0; j < chuck_size; j++) {
      block[j] = data[i+j]
    }
    chunked.push(block)
  }

  for (let i = data.length - remaining; i < data.length; i++) {
    const block: Uint8Array = new Uint8Array(remaining)
    for (let j = 0; j < remaining; j++) {
      block[j] = data[i+j]
    }
    chunked.push(block)
  }

  return chunked
}

export function chunk_ints(chuck_size: number, data: number[]): number[][] {
  const chunked: number[][] = []
  const remaining = data.length % chuck_size
  for (let i = 0; i < (data.length - remaining); i+= chuck_size) {
    const block: number[] = new Array(chuck_size).fill(0)
    for (let j = 0; j < chuck_size; j++) {
      block[j] = data[i+j]
    }
    chunked.push(block)
  }

  for (let i = data.length - remaining; i < data.length; i++) {
    const block: number[] = new Array(remaining)
    for (let j = 0; j < remaining; j++) {
      block[j] = data[i+j]
    }
    chunked.push(block)
  }

  return chunked
}

export function transpose(matrix: Uint8Array[]): Uint8Array[] {
  const rowLength: number = matrix[0].length
  const transposed: Uint8Array[] = new Array(rowLength)

  // fill up an empty shell to put results
  for (let i = 0; i < rowLength; i++) {
    transposed[i] = new Uint8Array(matrix.length)
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < rowLength; j++) {
      transposed[j][i] = matrix[i][j]
    }
  }
  return transposed
}

export function transpose_ints(matrix: number[][]): number[][] {
  const rowLength: number = matrix[0].length
  const transposed: number[][] = new Array(rowLength)

  // fill up an empty shell to put results
  for (let i = 0; i < rowLength; i++) {
    transposed[i] = new Array(matrix.length)
  }

  // transpose matrix into new shell
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < rowLength; j++) {
      transposed[j][i] = matrix[i][j]
    }
  }

  return transposed
}
