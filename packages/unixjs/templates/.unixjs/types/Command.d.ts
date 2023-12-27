import { ExtendedClient } from '@/controllers'
import {
  ApplicationCommandData,
  AutocompleteInteraction,
  ButtonInteraction,
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from 'discord.js'

interface CommandProps {
  client: ExtendedClient
  interaction: CommandInteraction
  options: CommandInteractionOptionResolver
}

export type ComponentsButton = Collection<
  string,
  (interaction: ButtonInteraction) => void
>
export type ComponentsSelect = Collection<
  string,
  (interaction: StringSelectMenuInteraction) => void
>
export type ComponentsModal = Collection<
  string,
  (interaction: ModalSubmitInteraction) => void
>

interface CommandComponents {
  buttons?: ComponentsButton
  selects?: ComponentsSelect
  modals?: ComponentsModal
}

export type CommandType = ApplicationCommandData &
  CommandComponents & {
    run(props: CommandProps): void
    autoComplete?: (interaction: AutocompleteInteraction) => void
  }
