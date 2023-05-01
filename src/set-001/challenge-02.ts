////////////////////////////////////////////////////////////////////////
//////////       XOR two same length buffers
////////////////////////////////////////////////////////////////////////

import { bytesToHex, hexToBytes, xor } from "../crypto"


function start() {
  // two hex encoded strings as input - to be xor'd against eachother
  const inone = '1c0111001f010100061a024b53535009181c'
  const intwo = '686974207468652062756c6c277320657965'
  // expected output as hex encoded string
  const expectedOut = '746865206b696420646f6e277420706c6179'

  const res: Uint8Array = xor(hexToBytes(inone), hexToBytes(intwo))

  console.assert( bytesToHex(res) === expectedOut, 'xor failed with result "%s"', res )
}

start()
