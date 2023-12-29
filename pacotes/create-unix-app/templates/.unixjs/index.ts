import { CommandInteractionOptionResolver } from "discord.js";
import { DiscordClient } from "./classes/DiscordClient";
import { CommandType } from "./types";

const client = new DiscordClient();
client.start();

client.on("interactionCreate", (interaction) => {
  let command: CommandType | undefined;
  if (interaction.isCommand())
    command = client.commands.get(interaction.commandName);
  if (!command) return;

  if (interaction.isAutocomplete() && command.autoComplete) {
    command.autoComplete(interaction);
    return;
  }

  if (interaction.isChatInputCommand()) {
    const options = interaction.options as CommandInteractionOptionResolver;
    command.run({ client, interaction, options });
  }

  if (interaction.isModalSubmit())
    client.modals.get(interaction.customId)?.(interaction);
  if (interaction.isButton())
    client.buttons.get(interaction.customId)?.(interaction);
  if (interaction.isStringSelectMenu())
    client.selects.get(interaction.customId)?.(interaction);
});
