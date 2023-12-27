import {
  BitFieldResolvable,
  ClientEvents,
  Collection,
  Client as DiscordJSClient,
  GatewayIntentsString,
  IntentsBitField
} from "discord.js";
import fs from "fs-extra";
import { CLIENT_COMMANDS_PATH, CLIENT_EVENTS_PATH } from "../constants/dirs";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsSelect,
  EventType
} from "../types";

export interface DiscordClientOptions {
  token: string;
}

export class Client extends DiscordJSClient {
  public commands: Collection<string, CommandType> = new Collection();
  public events: Collection<string, EventType<keyof ClientEvents>> = new Collection()
  public buttons: ComponentsButton = new Collection();
  public selects: ComponentsSelect = new Collection();
  public modals: ComponentsModal = new Collection();

  constructor({ token }: DiscordClientOptions) {
    super({
      intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<
        GatewayIntentsString,
        number
      >,
    });
    this.start(token);
  }

  private start(token: string) {
    this.getCommands();
    this.getEvents();

    this.login(token);
  }

  private async getCommands() {
    const commandsDirents = await fs.readdir(CLIENT_COMMANDS_PATH, {
      recursive: true,
      withFileTypes: true,
    });
    const commandsFiles = commandsDirents.filter(
      (d) => d.isFile() && (d.path.endsWith(".ts") || d.path.endsWith(".js"))
    );

    for (const commandFile of commandsFiles) {
      const command: CommandType = (await import(commandFile.path))
        ?.default;
      const { name, buttons, selects, modals } = command;

      if (name) {
        this.commands.set(name, command);

        if (buttons) buttons.forEach((run, key) => this.buttons.set(key, run));
        if (selects) selects.forEach((run, key) => this.selects.set(key, run));
        if (modals) modals.forEach((run, key) => this.modals.set(key, run));
      }
    }
  }
  private async getEvents() {
    const eventsDirents = await fs.readdir(CLIENT_EVENTS_PATH, {
      recursive: true,
      withFileTypes: true,
    });
    const eventsFiles = eventsDirents.filter(
      (d) => d.isFile() && (d.path.endsWith(".ts") || d.path.endsWith(".js"))
    );

    for(const eventFile of eventsFiles) {
      const event: EventType<keyof ClientEvents> = (await import(eventFile.path))?.default
      
      this.events.set(event.name, event)
    }
  }
}
