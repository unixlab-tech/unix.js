import {
  ActivityType,
  ApplicationCommandDataResolvable,
  BitFieldResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentsString,
  IntentsBitField,
  Partials,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { log } from ".";
import { CLIENT_COMMANDS_PATH, CLIENT_EVENTS_PATH } from "../constants";
import {
  CommandType,
  ComponentsButton,
  ComponentsModal,
  ComponentsSelect,
  EventType,
} from "../types";
dotenv.config();

const fileCondition = (dirent: fs.Dirent) =>
  dirent.isFile() &&
  (dirent.name.endsWith(".ts") || dirent.name.endsWith(".js"));
export class DiscordClient extends Client {
  public commands: Collection<string, CommandType> = new Collection();
  public buttons: ComponentsButton = new Collection();
  public selects: ComponentsSelect = new Collection();
  public modals: ComponentsModal = new Collection();

  public developer = this.users.cache.get("1064162067919163485");

  constructor() {
    super({
      intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<
        GatewayIntentsString,
        number
      >,
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User,
      ],
      presence: {
        status: "idle",
        activities: [
          {
            name: "Studying something...",
            state: "Come study with me!",
            type: ActivityType.Playing,
          },
        ],
      },
    });

    this.once("ready", (c) => {
      log.info(
        false,
        `Aplicação iniciada e conectada à ${c.user.displayName}.`
      );
      log.info(
        false,
        `Commands loaded: ${this.commands.size}\n   ↪️ Buttons loaded: ${this.buttons.size}\n   ↪️ Select Menus loaded: ${this.selects.size}\n   ↪️ Modals loaded: ${this.modals.size}`
      );
    });
  }

  public async start(token: string) {
    this.registerModules();
    this.registerEvents();
    this.login(process.env.BOT_TOKEN);
  }

  private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
    this.application?.commands
      .set(commands)
      .then(() => {
        log.info(false, "Comandos de barra (/) definidos");
      })
      .catch((error) => {
        log.error(
          true,
          `Ocorreu um erro ao tentar definir os comandos de barra (/): \n${error}`
        );
      });
  }

  private registerModules() {
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];

    fs.readdirSync(CLIENT_COMMANDS_PATH, {
      encoding: "utf-8",
      withFileTypes: true,
      recursive: true,
    })
      .filter(fileCondition)
      .forEach(async (file) => {
        const command: CommandType = (
          await import(path.join(file.path, file.name))
        )?.default;
        const { name, buttons, selects, modals } = command;

        if (name) {
          this.commands.set(name, command);
          slashCommands.push(command);

          if (buttons)
            buttons.forEach((run, key) => this.buttons.set(key, run));
          if (selects)
            selects.forEach((run, key) => this.selects.set(key, run));
          if (modals) modals.forEach((run, key) => this.modals.set(key, run));
        }
      });

    this.once("ready", () => this.registerCommands(slashCommands));
  }

  private registerEvents() {
    fs.readdirSync(CLIENT_EVENTS_PATH, {
      encoding: "utf-8",
      recursive: true,
      withFileTypes: true,
    })
      .filter(fileCondition)
      .forEach(async (file) => {
        const { name, once, run }: EventType<keyof ClientEvents> = (
          await import(path.join(file.path, file.name))
        )?.default;

        try {
          if (name) once ? this.once(name, run) : this.on(name, run);
        } catch (error) {
          log.error(true, `An error occurred on event: ${name} \n${error}`);
        }
      });
  }
}
