////////////////////////////////////////////////////////////////////////
//////////       XOR two same length buffers
////////////////////////////////////////////////////////////////////////

import { bytesToHex, hexToBytes } from "../crypto"


function start() {
  const inone = '1c0111001f010100061a024b53535009181c'
  const intwo = '686974207468652062756c6c277320657965'
  const expectedOut = '746865206b696420646f6e277420706c6179'

  const res: string = xor(inone, intwo)

  console.assert( res === expectedOut, 'xor failed with result "%s"', res )
}

function xor(left: string, right: string): string {
  if (left.length !== right.length) {
    throw new Error('strings must be of same length')
  }

  const lbytes: Uint8Array = hexToBytes(left)
  const rbytes: Uint8Array = hexToBytes(right)

  const out = new Uint8Array(lbytes.length)
  for (let i = 0; i < lbytes.length; i++) {
    out[i] = lbytes[i] ^ rbytes[i]
  }

  return bytesToHex(out)
}

start()
