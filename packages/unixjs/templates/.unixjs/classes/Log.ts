import * as fs from "fs-extra";
import { DATE, ERROR, GOLD, GRAY, INFO, WARN } from "../constants";
import path from "path";

export enum LoggerDesign {
  PRETTY,
  MODERN,
  MINIMAL,
}

export interface LoggerOptions {
  design: LoggerDesign;
  directory: string;
}

export class Logger {
  private config: LoggerOptions | undefined;

  constructor(options?: LoggerOptions) {
    this.config = options;
  }

  /**
   * Logs an information message.
   *
   * @param args - The log message or messages to be logged.
   * @returns void
   *
   * @example
   * ```ts
   * const logger = new Logger({ design: LoggerDesign.PRETTY, directory: "./logs" });
   * logger.info("This is an information message");
   * ```
   *
   * This example initializes a new Logger object with the PRETTY design option and specifies the log directory as "./logs". It then calls the info method with the message "This is an information message". The formatted log message will be displayed in the console and saved to a file in the specified directory.
   */
  public info(...args: unknown[]) {
    const now = new Date();

    switch (this.config?.design) {
      case LoggerDesign.MINIMAL:
        console.log(
          `${INFO("INFO")} - ${DATE(
            now.toLocaleTimeString("pt-BR")
          )} | ${args.join(", ")}`
        );
        break;
      case LoggerDesign.MODERN:
        console.log(`${GOLD("Unix.js")} | ${INFO("INFO")} - ${DATE(
          now.toLocaleString("pt-BR")
        )}\n   ↪️ ${args.join(", ")}
              `);
        break;
      case LoggerDesign.PRETTY:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${INFO.bold("INFO")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
      default:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${INFO.bold("INFO")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
    }

    this.file("info", args);
  }
  /**
   * Logs an warn message.
   *
   * @param args - The log message or messages to be logged.
   * @returns void
   *
   * @example
   * ```ts
   * const logger = new Logger({ design: LoggerDesign.PRETTY, directory: "./logs" });
   * logger.info("This is an information message");
   * ```
   *
   * This example initializes a new Logger object with the PRETTY design option and specifies the log directory as "./logs". It then calls the info method with the message "This is an information message". The formatted log message will be displayed in the console and saved to a file in the specified directory.
   */
  public warn(...args: unknown[]) {
    const now = new Date();

    switch (this.config?.design) {
      case LoggerDesign.MINIMAL:
        console.log(
          `${WARN("WARN")} - ${DATE(
            now.toLocaleTimeString("pt-BR")
          )} | ${args.join(", ")}`
        );
        break;
      case LoggerDesign.MODERN:
        console.log(`${GOLD("Unix.js")} | ${WARN("WARN")} - ${DATE(
          now.toLocaleString("pt-BR")
        )}\n   ↪️ ${args.join(", ")}
            `);
        break;
      case LoggerDesign.PRETTY:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${WARN.bold("WARN")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
      default:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${WARN.bold("WARN")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
    }

    this.file("warn", args);
  }
  /**
   * Logs an error message.
   *
   * @param args - The log message or messages to be logged.
   * @returns void
   *
   * @example
   * ```ts
   * const logger = new Logger({ design: LoggerDesign.PRETTY, directory: "./logs" });
   * logger.info("This is an information message");
   * ```
   *
   * This example initializes a new Logger object with the PRETTY design option and specifies the log directory as "./logs". It then calls the info method with the message "This is an information message". The formatted log message will be displayed in the console and saved to a file in the specified directory.
   */
  public error(...args: unknown[]) {
    const now = new Date();

    switch (this.config?.design) {
      case LoggerDesign.MINIMAL:
        console.log(
          `${ERROR("ERROR")} - ${DATE(
            now.toLocaleTimeString("pt-BR")
          )} | ${args.join(", ")}`
        );
        break;
      case LoggerDesign.MODERN:
        console.log(`${GOLD("Unix.js")} | ${ERROR("ERROR")} - ${DATE(
          now.toLocaleString("pt-BR")
        )}\n   ↪️ ${args.join(", ")}
            `);
        break;
      case LoggerDesign.PRETTY:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${ERROR.bold("ERROR")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
      default:
        console.log(
          `[${GOLD.bold("Unix.js")}] ${GRAY("-")} ${ERROR.bold("ERROR")} ${GRAY(
            "|"
          )} ${DATE.underline(now.toLocaleDateString("pt-BR"))} ${GRAY(
            "ás"
          )} ${DATE.underline(now.toLocaleTimeString("pt-BR"))} ${GRAY(
            ":"
          )} ${args.join(", ")}`
        );
        break;
    }

    this.file("error", args);
  }

  /**
   * Saves log messages to a file.
   *
   * @param {string} level - The log level, which can be "info", "warn", or "error".
   * @param {Array<unknown>} args - The log message or messages to be logged.
   * @returns void
   * @throws Error if the log messages cannot be saved to the file.
   */
  public file(level: "info" | "warn" | "error", ...args: unknown[]): void {
    const now = new Date();
    const filePath = this.config
      ? path.resolve(
          this.config.directory,
          `REGISTRO-${level.toUpperCase()}-${now
            .toLocaleDateString("pt-BR")
            .replaceAll("/", ".")}-${now
            .toLocaleTimeString("pt-BR")
            .replaceAll(":", ".")}.log`
        )
      : path.resolve(
          process.cwd(),
          "logs",
          `REGISTRO-${level.toUpperCase()}-${now
            .toLocaleDateString("pt-BR")
            .replaceAll("/", ".")}-${now
            .toLocaleTimeString("pt-BR")
            .replaceAll(":", ".")}.log`
        );

    fs.ensureFileSync(path.resolve(filePath));
    try {
      fs.writeFileSync(filePath, args.join("\n"), { encoding: "utf-8" });
    } catch (error: any) {
      throw new Error(
        `Não foi possível salvar as logs no arquivo em: ${filePath}`,
        { cause: error.message }
      );
    }
  }
}
