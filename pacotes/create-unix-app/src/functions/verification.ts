import * as clack from '@clack/prompts'
import { style } from '@opentf/cli-styles'

export function checkCancel<T>(result: T | symbol): T {
  if (clack.isCancel(result)) {
    clack.cancel(style('$hex(#6D83D1){http://discord.gg/cwgKPNYpTM}'))
    process.exit(0)
  }
  return result as T
}
