import {
  AnySelectMenuInteraction,
  ApplicationCommandData,
  AutocompleteInteraction,
  ButtonInteraction,
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ModalSubmitInteraction
} from 'discord.js'
import { Client } from '../classes'

interface CommandProps {
  client: Client
  interaction: CommandInteraction
  options: CommandInteractionOptionResolver
}

export type ComponentsButton = Collection<
  string,
  (interaction: ButtonInteraction) => void
>
export type ComponentsSelect = Collection<
  string,
  (interaction: AnySelectMenuInteraction) => void
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
