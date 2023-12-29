export interface DiscordBotOptions {
    appName: string;
    appPath: string;
}
export declare class DiscordBot {
    private _name;
    private _path;
    private library;
    private database;
    private packageManager;
    constructor(options: DiscordBotOptions);
    create(): Promise<void>;
    private getData;
    private getLibrary;
    private getDatabase;
    private getPackageManager;
    private createPackageJson;
    private createTSConfigJson;
    private createESLintJson;
    private createProjectFolders;
    private copyTemplates;
}
