import { PKG_ROOT } from '@/consts';
import { PackageManager } from '@/utils/getUserPkgManager';
import { logger } from '@/utils/logger';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import inquirer from 'inquirer';

interface InstallerOptions {
    projectDir: string;
    pkgManager: PackageManager;
    noInstall: boolean;
    projectName?: string;
}

export const scaffoldProject = async ({ projectName, projectDir, pkgManager, noInstall }: InstallerOptions) => {
    const srcDir = path.join(PKG_ROOT, 'template');

    if (!noInstall) {
        logger.info(`\nUsing ${chalk.cyan.bold(pkgManager)} to install dependencies...\n`);
    } else {
        logger.info('');
    }

    const spinner = ora(`Scaffolding project in ${chalk.cyan.bold(projectDir)}...`).start();

    if (fs.existsSync(projectDir)) {
        if (fs.readdirSync(projectDir).length === 0) {
            if (projectName !== '.') {
                spinner.info(`${chalk.cyan.bold(projectName)} exists, but is empty. Continuing...\n`);
            }
        } else {
            spinner.stopAndPersist();
            const { overwrite } = await inquirer.prompt<{
                overwrite: 'abort' | 'clear' | 'overwrite';
            }>({
                name: 'overwrite',
                type: 'list',
                message: `The directory ${chalk.cyan.bold(projectName)} already exists. What would you like to do?`,
                choices: [
                    {
                        name: 'Abort installation (recommended)',
                        value: 'abort',
                        short: 'Abort',
                    },
                    {
                        name: 'Clear the directory and continue installation',
                        value: 'clear',
                        short: 'Clear',
                    },
                    {
                        name: 'Continue installation and overwrite conflicting files',
                        value: 'overwrite',
                        short: 'Overwrite',
                    },
                ],
                default: 'abort',
            });

            if (overwrite === 'abort') {
                spinner.fail(`Aborting installation. ${chalk.cyan.bold(projectName)} was not modified.`);
                process.exit(1);
            }

            const overwriteAction = overwrite === 'clear' ? 'clear the directory' : 'overwrite the conflicting files';
            const { confirmOverwrite } = await inquirer.prompt<{ confirmOverwrite: boolean }>({
                name: 'confirmOverwrite',
                type: 'confirm',
                message: `Are you sure you want to ${overwriteAction}?`,
                default: false,
            });

            if (!confirmOverwrite) {
                spinner.fail(`Aborting installation. ${chalk.cyan.bold(projectName)} was not modified.`);
                process.exit(1);
            }

            if (overwrite === 'clear') {
                spinner.info(`Clearing ${chalk.cyan.bold(projectName)}...`);
                fs.emptyDirSync(projectDir);
            }
        }
    }

    spinner.start();

    fs.copySync(srcDir, projectDir);
    fs.renameSync(path.join(projectDir, '_gitignore'), path.join(projectDir, '.gitignore'));

    const scaffoldedName = projectName === '.' ? 'App' : chalk.cyan.bold(projectName);

    spinner.succeed(`${scaffoldedName} ${chalk.green('scaffolded successfully!')}\n`);
};
