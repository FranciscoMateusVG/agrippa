import yargs, { BuilderCallback, CommandModule } from 'yargs';
import { pick } from 'rhax';

import { logger } from '../logger';
import { Config } from '../Config';
import { CommonConfig } from '../utils/types';

import { run } from './run';

const builder = (yargs: yargs.Argv<CommonConfig>) =>
  yargs.positional('name', {
    desc: 'The name of the component to be generated',
    type: 'string',
    demandOption: true
  })
    .config({} /* rc */)
    .options({
      props: {
        choices: ['ts', 'jsdoc', 'prop-types', 'none'],
      },
      children: {
        type: 'boolean',
        desc: 'Whether the component is meant to have children (FC) or not (VFC)',
        default: false
      },
      typescript: {
        type: 'boolean',
        alias: 'ts',
        desc: 'Whether to use Typescript',
        default: true //!!tsConfig
      },
      flat: {
        type: 'boolean',
        desc: 'Whether to apply in current dir (true) or create a new dir (false)',
        default: false
      },
      styling: {
        choices: ['none', 'css', 'scss', 'jss', 'mui'],
        desc: 'Which styling to generate',
        default: 'none'
      },
      stylingModule: {
        type: 'boolean',
        default: true,
        desc: 'Relevant for `css` or `scss` styling. If true, generates a scoped `module` stylesheet'
      },
      importReact: {
        type: 'boolean',
        default: true, //!/^react-jsx/.test(tsConfig.config?.compilerOptions?.jsx) ?? true,
        desc: 'Whether to import React.'
      },

      overwrite: {
        type: 'boolean',
        default: false
      }
    } as const);

type GenerateCommand = (typeof builder) extends BuilderCallback<CommonConfig, infer R> ? CommandModule<CommonConfig, R> : never

export const generateCommand: GenerateCommand = {
  command: 'generate <name> [options]',
  aliases: ['gen'],
  describe: 'Generate a component',
  builder,
  handler: async (argv) => {

    const config: Config = {
      ...pick(['children', 'typescript', 'flat', 'styling', 'stylingModule', 'importReact', 'debug', 'overwrite'], argv),
      name: argv.name as string,
      props: (argv.props ?? 'ts') /** @todo */,
    }

    logger.debug('Generating component...')
    logger.debug('config:', config)
    run(config, logger);
  }
}