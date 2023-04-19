import { isNil } from 'ramda'

import { Maybe } from './utils'

////////////////////////////////////////////////////////////////////////////////
////////////     Publicly Exposed Functions
////////////////////////////////////////////////////////////////////////////////

const getNodeEnv = (): string => <string> get('NODE_ENV', 'dev')

////////////////////////////////////////////////////////////////////////////////
////////////     Private Functions
////////////////////////////////////////////////////////////////////////////////

function getOrThrow(name: string): string {
  const val: Maybe<string> = process.env[name]
  if (isNil(val)) {
    throw new Error(`missing required environment variable ${name}`)
  }
  return val
}

function get(name: string, defaultValue?: string): Maybe<string> {
  const val: Maybe<string> = process.env[name]
  if (isNil(val)) {
    return defaultValue
  }
  return val
}

export default {
  getNodeEnv,
}
