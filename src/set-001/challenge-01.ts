////////////////////////////////////////////////////////////////////////
//////////       Convert hex to base64
////////////////////////////////////////////////////////////////////////

import { hexToBytes, strToBytes, toBase64 } from "../crypto"


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

start()
