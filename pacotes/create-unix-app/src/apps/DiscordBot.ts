import { checkCancel } from '@/functions/verification'
import { cancel, confirm, note, select, spinner } from '@clack/prompts'
import { spawn } from 'cross-spawn'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'

export interface DiscordBotOptions {
  appName: string
  appPath: string
}

type Libraries = 'aoijs' | 'djs' | null

type Databases =
  | 'postgres'
  | 'mysql'
  | 'sqlite'
  | 'sqlserver'
  | 'mongdb'
  | 'cockroachdb'
  | null

type PackageManagers = 'npm' | 'yarn' | 'pnpm' | 'bun' | undefined
type PackageManagersAoiOnly = 'npm' | 'yarn' | 'pnpm' | undefined

export class DiscordBot {
  private _name: string
  private _path: string
  private library: Libraries = null
  private database: Databases = null
  private packageManager: PackageManagers | PackageManagersAoiOnly

  constructor(options: DiscordBotOptions) {
    this._name = options.appName
    this._path = options.appPath
  }

  public async create() {
    const messages: string[] = []

    try {
      await this.getData()
    } catch (error) {
      throw new Error(
        'Ocorreu um erro durante a captura de informações para o projeto.',
        {
          cause: error,
        },
      )
    }

    const spin = spinner()

    try {
      spin.start('Iniciando a criação de seu projeto')
      await this.createPackageJson()
      await this.createTSConfigJson()
      await this.createESLintJson()
      await this.createProjectFolders()
      await this.copyTemplates()

      if (process.cwd() !== this._path) messages.push(`◌ cd ${this._name}`)
    } finally {
      spin.stop('Arquivos criados com sucesso!')
    }

    try {
      spin.start('Instalando dependências')
      const child = spawn(this.packageManager ?? 'npm', ['install'], {
        cwd: this._path,
        stdio: 'ignore',
      })
      child.on('error', (error) => {
        throw new Error(
          'Não foi possível instalar as dependências do projeto!',
          {
            cause: error,
          },
        )
      })
      child.once('exit', () => {
        spin.stop('Dependências instaladas com sucesso!')
        note(messages.join('\n'), 'Seu projeto foi criado usando Unix.js!')
        cancel('👋 Adeus...')
      })

      messages.push('◌ unix dev')
    } catch (error) {
      throw new Error('Não foi possível instalar as dependências do projeto!', {
        cause: error,
      })
    }
  }

  private async getData() {
    await this.getLibrary().catch((error) => {
      throw new Error(
        'Um erro ocorreu durante a configuração da biblioteca: ',
        { cause: error },
      )
    })
    if (this.library !== 'aoijs')
      await this.getDatabase().catch((error) => {
        throw new Error(
          'Um erro ocorreu durante a configuração do banco de dados: ',
          { cause: error },
        )
      })
    await this.getPackageManager().catch((error) => {
      throw new Error(
        'Um erro ocorreu durante a configuração do gerenciador de pacotes: ',
        { cause: error },
      )
    })
  }

  private async getLibrary() {
    this.library = checkCancel(
      await select({
        message: 'Qual biblioteca será usada em seu bot?',
        maxItems: 1,
        options: [
          {
            label: 'Discord.js',
            hint: 'Typescript',
            value: 'djs',
          },
          {
            label: 'Aoi.js',
            hint: 'Javascript String-Based',
            value: 'aoijs',
          },
        ],
      }),
    )
  }

  private async getDatabase() {
    const wantDb = checkCancel(
      await confirm({
        message: 'Você deseja usar banco de dados em seu projeto?',
        active: 'Sim',
        inactive: 'Não',
      }),
    )

    if (wantDb)
      this.database = checkCancel(
        await select({
          message: 'Qual banco de dados você deseja usar?',
          maxItems: 1,
          options: [
            {
              label: 'PostgreSQL',
              hint: 'Prisma ORM',
              value: 'postgres',
            },
            {
              label: 'MySQL',
              hint: 'Prisma ORM',
              value: 'mysql',
            },
            {
              label: 'SQLite',
              hint: 'Prisma ORM',
              value: 'sqlite',
            },
            {
              label: 'SQL Server',
              hint: 'Prisma ORM',
              value: 'sqlserver',
            },
            {
              label: 'MongoDB',
              hint: 'Prisma ORM',
              value: 'mongdb',
            },
            {
              label: 'CockroachDB',
              hint: 'Prisma ORM',
              value: 'cockroachdb',
            },
          ],
        }),
      )
  }

  private async getPackageManager() {
    const userPackageManagers =
      process.env.npm_config_user_agent?.match(/npm|yarn|pnpm|bun/gim)
    const actualPackageManager = userPackageManagers?.[0] as PackageManagers

    this.packageManager = checkCancel(
      await select({
        message: 'Qual gerenciador de pacotes você deseja usar?',
        initialValue: actualPackageManager,
        options:
          this.library === 'djs'
            ? [
                {
                  label: 'Node Package Manager',
                  hint: actualPackageManager === 'npm' ? 'Atual' : undefined,
                  value: 'npm',
                },
                {
                  label: 'Yarn',
                  hint: actualPackageManager === 'yarn' ? 'Atual' : undefined,
                  value: 'yarn',
                },
                {
                  label: 'PNPM',
                  hint: actualPackageManager === 'pnpm' ? 'Atual' : undefined,
                  value: 'pnpm',
                },
                {
                  label: 'Bun',
                  hint: actualPackageManager === 'bun' ? 'Atual' : undefined,
                  value: 'bun',
                },
              ]
            : [
                {
                  label: 'Node Package Manager',
                  hint: actualPackageManager === 'npm' ? 'Atual' : undefined,
                  value: 'npm',
                },
                {
                  label: 'Yarn',
                  hint: actualPackageManager === 'yarn' ? 'Atual' : undefined,
                  value: 'yarn',
                },
                {
                  label: 'PNPM',
                  hint: actualPackageManager === 'pnpm' ? 'Atual' : undefined,
                  value: 'pnpm',
                },
              ],
      }),
    )
  }

  private async createPackageJson() {
    const platform = os.platform()

    try {
      await fs.ensureFile(path.join(this._path, 'package.json'))
      await fs.writeJson(path.join(this._path, 'package.json'), {
        name: this._name,
        description: 'A project create with Unix.js framework',
        version: '0.0.1',
        main: '.unixjs/dist/index.js',
        scripts: {
          dev:
            platform === 'win32'
              ? '.unixjs/scripts/run-dev.ps1'
              : '.unixjs/scripts/run-dev.sh',
          build:
            platform === 'win32'
              ? '.unixjs/scripts/build.ps1'
              : '.unixjs/scripts/build.sh',
        },
        license: 'MIT',
        dependencies: {
          'discord.js': '^14.14.1',
          'unix.js': '^0.1.0',
          prisma: '^5.7.1',
          '@prisma/client': '^5.7.1',
        },
        devDependencies: {
          eslint: '^8.52.0',
          sucrase: '^3.34.0',
          'tsconfig-paths': '^4.2.0',
          typescript: '^4.9.5',
        },
      })
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  private async createTSConfigJson() {
    try {
      await fs.ensureFile(path.join(this._path, 'tsconfig.json'))
      await fs.writeJson(path.join(this._path, 'tsconfig.json'), {
        compilerOptions: {
          lib: ['ESNext'],
          rootDir: 'src',
          outDir: 'dist',
          target: 'ESNext',
          module: 'CommonJS',
          moduleResolution: 'Node',
          sourceMap: false,
          emitDecoratorMetadata: true,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          strict: true,
          skipLibCheck: true,
          skipDefaultLibCheck: true,
          declaration: false,
          resolveJsonModule: true,
          importHelpers: true,
          experimentalDecorators: true,
          baseUrl: './',
          paths: {
            '@/*': ['src/*'],
          },
        },
        include: ['src'],
        exclude: ['node_modules', '**/*.spec.ts', 'dist', '.unixjs/**/*'],
      })
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  private async createESLintJson() {
    try {
      await fs.ensureFile(path.join(this._path, '.eslintrc.json'))
      await fs.writeJson(path.join(this._path, '.eslintrc.json'), {
        extends: ['@unixjs/eslint/discord'],
      })
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  private async createProjectFolders() {
    try {
      await fs.ensureDir(path.join(this._path, 'src/commands'))
      await fs.ensureDir(path.join(this._path, 'src/events'))
    } catch (error) {
      throw new Error(`${error}`)
    }
  }

  private async copyTemplates() {
    const dotUnixjsPath = path.resolve(
      __dirname,
      '../..',
      'templates',
      '.unixjs',
    )
    const dotVSCodePath = path.resolve(
      __dirname,
      '../..',
      'templates',
      '.vscode',
    )

    try {
      await fs.copy(dotUnixjsPath, path.join(this._path, '.unixjs'))
      await fs.copy(dotVSCodePath, path.join(this._path, `.vscode`))
    } catch (error) {
      throw new Error(`${error}`)
    }
  }
}
