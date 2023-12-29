#!/usr/bin/env node

import { intro, select, text } from '@clack/prompts'
import { style } from '@opentf/cli-styles'
import { Command } from 'commander'
import path from 'path'
import validateNpmPackageName from 'validate-npm-package-name'
import { DiscordBot } from './apps/DiscordBot'
import { checkCancel } from './functions/verification'

async function main() {
  new Command('create-unix-app').version('0.2.0').parse()

  checkCancel(intro('🐧 Unix.js Framework'))
  const projectName = checkCancel(
    await text({
      message: 'Qual será o nome do seu projeto?',
      defaultValue: '.',
      placeholder: 'Utilize . para criar nessa pasta',
      validate(value) {
        const name = path.basename(path.resolve(value))
        const { validForNewPackages, errors, warnings } =
          validateNpmPackageName(name)

        if (!validForNewPackages) {
          const problems: string[] = []
          errors?.forEach((e) => problems.push(e))
          warnings?.forEach((w) => problems.push(w))

          return style(`$r{${problems.join('\n')}}`)
        }
      },
    }),
  )
  const projectType = checkCancel(
    await select({
      message: 'Que tipo de aplicação você deseja criar?',
      initialValue: 'discordbot',
      options: [
        {
          label: 'Bot de Discord',
          value: 'discordbot',
        },
      ],
    }),
  )

  if (projectType === 'discordbot') {
    const bot = new DiscordBot({
      appName: path.basename(path.resolve(projectName)),
      appPath: path.resolve(projectName),
    })
    await bot.create()
  }
}

main()
