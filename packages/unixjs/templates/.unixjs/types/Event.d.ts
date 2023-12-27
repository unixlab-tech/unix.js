import { ClientEvents } from 'discord.js'

export type EventType<Key extends keyof ClientEvents> = {
  name: Key
  once?: boolean
  run(...args: ClientEvents[Key]): void
}
