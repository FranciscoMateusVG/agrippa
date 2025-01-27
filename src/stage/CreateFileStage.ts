import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { basename } from 'path';
import { bold, italic, Logger, styles } from '../logger';
import { isSubDirectory } from '../utils/isSubDirectory';
import { joinLines } from '../utils';
import { AgrippaFile } from './AgrippaFile';
import { Stage } from './Stage';
import { Context } from './Context';
import { StageResult, StageStatus } from './StageResult';

export interface CreateFileOptions {
  file: AgrippaFile;
  varKey?: string;
}

export class CreateFileStage extends Stage {

  protected file: AgrippaFile;
  /** 
   * If passed, stores the new directory's path under the context's `variables` 
   * record with the passed value as key. Only stores the value if the stage succeeds.
   */
  protected varKey?: string;

  constructor({
    file,
    varKey
  }: CreateFileOptions) {
    super();

    this.file = file;
    this.varKey = varKey;
  }

  async execute(context: Context, logger: Logger): Promise<StageResult> {
    const { options } = context;
    const { pure, baseDir, allowOutsideBase, overwrite } = options;
    const { data, path } = this.file;

    const successContext = {
      ...context,
      createdFiles: [...context.createdFiles, this.file],
      variables: this.varKey ? { ...context.variables, [this.varKey]: path } : context.variables
    };

    if (pure) {
      return new StageResult(
        StageStatus.NA,
        'No file created (pure mode)',
        successContext
      );
    }

    const filename = basename(path);

    if (baseDir && !isSubDirectory(baseDir, path) && !allowOutsideBase) {
      logger.error(joinLines(
        `The resolved path for the directory ${italic(filename)} falls outside the base directory.`,
        `Base directory: ${italic(baseDir)}`,
        `Resolved directory: ${italic(path)}`,
        "To allow this behaviour, pass the '--allow-outside-base' flag or set 'allowOutsideBase: true' in .agripparc.json"
      ));

      return new StageResult(StageStatus.ERROR, 'Directory path outside baseDir');
    }

    logger.info(`path: ${styles.path(path)}`);

    if (existsSync(path)) {
      if (!overwrite) {
        logger.info(`To allow overwriting, pass ${bold('--overwrite')} to the command.`);
        return new StageResult(StageStatus.ERROR, `File ${italic(filename)} already exists.`);
      }

      // File exists, but --overwrite was passed; log for info and continue.
      logger.info('File exists, and was overwritten.');
    }

    try {
      await writeFile(path, data);

      return new StageResult(
        StageStatus.SUCCESS,
        `File ${italic(filename)} created successfully.`,
        successContext
      );
    }
    catch (e) {
      logger.error(e);

      return new StageResult(
        StageStatus.ERROR,
        `Creation of file ${filename} failed.`
      );
    }
  };
};