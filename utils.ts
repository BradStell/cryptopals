export type Nullish = null | undefined

export type Maybe<T> = T | Nullish

export const isNotNil = <T>(val: T): val is Exclude<T, Nullish> => {
  return val !== undefined && val !== null
}
