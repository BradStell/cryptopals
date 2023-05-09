import { fromBase64 } from "../crypto"
import { readFile } from "fs/promises"

const KEY: string = 'YELLOW SUBMARINE'

async function start() {
  // read cipher text in from file and get bytes
  const message_as_base64: string = await readFile("src/resources/7.txt", 'ascii')
  const message: Uint8Array = linesToBytes(message_as_base64)
}

function linesToBytes(message: string): Uint8Array {
  const lines = message.split('\n')
  const newlineCount: number = lines.length
  const out: Uint8Array = new Uint8Array(((message.length - newlineCount) / 4) * 3)
  let msg_index: number = 0
  for (const line of lines) {
    const line_bytes: Uint8Array = fromBase64(line)
    for (let i = 0; i < line_bytes.length; i++) {
      out[msg_index++] = line_bytes[i]
    }
  }
  return out
}

start()
