import { CommandType } from '../types'

export class Command {
  constructor(options: CommandType) {
    Object.assign(this, options)
  }
}