import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/functions'
import { deployContext } from './env'

type StoreName = 'owners' | 'stickers' | 'messages' | 'ratelimit'

// Blobs stores are shared by every deploy of the project, so anything but production gets its own
// suffixed store. Otherwise a deploy preview could read or overwrite real owners' data.
export function store(context: Context, name: StoreName) {
  const ctx = deployContext(context)
  return getStore({ name: ctx === 'production' ? name : `${name}-${ctx}`, consistency: 'strong' })
}

export type Lang = 'de' | 'en' | 'it'

export interface Owner {
  created: number
  stickers: string[]
  lang?: Lang // language for bot messages, taken from the account page
}

export interface Sticker {
  owner: number // Telegram ID; never sent to scanners
  plate: string
  country?: string
  note?: string
  active: boolean
  created: number
}

export type Preset = 'blocking' | 'lights' | 'other'
export type Reply = 'coming' | 'soon' | 'cant'

export interface Message {
  sticker: string
  preset: Preset
  created: number
  reply?: Reply
}

export const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000
export const MAX_STICKERS = 5
