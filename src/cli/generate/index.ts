import yargs, { BuilderCallback, CommandModule } from 'yargs';
import { InputConfig } from '../../config';
import { Environment } from '../../config/Environment';
import { Styling } from '../../config/Styling';
import { run } from '../../run';
import { pascalCase } from '../../utils';

const builder = async (yargs: yargs.Argv) =>
  yargs.positional('name', {
    desc: 'The name of the component to be generated',
    type: 'string',
    demandOption: true
  })
    .options({
      typescript: {
        type: 'boolean',
        alias: 'ts',
        desc: 'Whether to use Typescript'
      },
      environment: {
        type: 'string',
        desc: 'Which environment to generate the components for'
      },
      styling: {
        type: 'string',
        desc: 'Which styling solution to use'
      },
      'styling-module': {
        alias: 'stylingModule',
        type: 'boolean',
        desc: 'Whether to generate a scoped `module` stylesheet. Relevant only for `css` or `scss` styling options.'
      },
      'import-react': {
        alias: 'importReact',
        type: 'boolean',
        desc: 'Whether to import React. Relevant only for `react` or `react-native` environments.'
      },
      overwrite: {
        type: 'boolean'
      },
      'base-dir': {
        alias: 'baseDir',
        type: 'string',
        desc: 'Path to a base directory which components should be genenrated in or relative to.',
      },
      destination: {
        alias: 'dest',
        type: 'string',
        desc: 'The path in which the component folder/files should be generated, relative to baseDir.',
      },
      'allow-outside-base': {
        alias: 'allowOutsideBase',
        type: 'boolean',
        desc: 'If true, allows components to be generated outside the resolved baseDir.',
      },
      'export-type': {
        alias: 'exportType',
        choices: ['named', 'default'] as const,
        desc: 'Whether to use a named export or a default export for the component.',
      },
      'declaration': {
        choices: ['const', 'function'] as const,
        desc: 'Whether to declare the component as a const with an arrow function or a function declaration.',
      },
      'debug': {
        type: 'boolean'
      },
      '$schema': {
        type: 'string'
      }
    });

type GenerateCommand = (typeof builder) extends BuilderCallback<{}, infer R> ? CommandModule<{}, R> : never

export const generateCommand: GenerateCommand = {
  command: 'generate <name> [options]',
  aliases: ['gen'],
  describe: 'Generate a component',
  builder,
  handler: async argv => {
    const environment = Environment.fromString(argv.environment!) ?? argv.environment;
    const styling = Styling.fromString(argv.styling!) ?? argv.styling;
    const name = pascalCase(argv.name);

    const inputConfig: InputConfig = {
      name,
      environment,

      typescript: argv.typescript,

      componentOptions: {
        exportType: argv.exportType,
        declaration: argv.declaration
      },

      styling,
      styleFileOptions: {
        module: argv.stylingModule
      },

      baseDir: argv.baseDir,
      destination: argv.destination,
      allowOutsideBase: argv.allowOutsideBase,

      debug: argv.debug,
      overwrite: argv.overwrite,
      pure: false,
    };

    await run(inputConfig);
  }
};