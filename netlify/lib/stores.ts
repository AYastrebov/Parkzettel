import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/functions'
import { deployContext } from './env'

// Blobs stores are shared by every deploy of the project, so anything but production gets its own
// suffixed store. Otherwise a deploy preview could read or overwrite real owners' data.
export function store(context: Context, name: 'owners') {
  const ctx = deployContext(context)
  return getStore({ name: ctx === 'production' ? name : `${name}-${ctx}`, consistency: 'strong' })
}

export interface Owner {
  created: number
  stickers: string[]
}
