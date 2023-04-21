////////////////////////////////////////////////////////////////////////
//////////       Convert hex to base64
////////////////////////////////////////////////////////////////////////

import { hexToBytes, toBase64 } from "../crypto"


function start() {
  // input hex encoded string
  const input: string = '49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d'
  // expected output base64 encoded string
  const output: string = 'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t'

  console.assert(
    toBase64(hexToBytes(input)) === output,
    'the conversion for set-01 failed'
  )
}

start()
