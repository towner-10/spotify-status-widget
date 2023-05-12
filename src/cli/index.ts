import { DEFAULT_APP_NAME, TITLE } from '@/consts';
import inquirer from 'inquirer';
import { program } from 'commander';
import { logger } from '@/utils/logger';
import { validateAppName } from '@/utils/validateAppName';
import { getUserPkgManager } from '@/utils/getUserPkgManager';

interface CLIFlags {
    // General
    noGit: boolean;
    noInstall: boolean;

    // Spotify
    spotifyClientId: string;
    spotifyClientSecret: string;
}

interface CLIResults {
    appName: string;
    flags: CLIFlags;
}

const defaultResults: CLIResults = {
    appName: DEFAULT_APP_NAME,
    flags: {
        noGit: false,
        noInstall: false,
        spotifyClientId: '',
        spotifyClientSecret: '',
    },
};

export const runCLI = async () => {
    const results = defaultResults;

    await program
        .name(TITLE)
        .description('A CLI to create a Next.js app that displays your Spotify status for your GitHub profile.')
        .argument('[dir]', 'The name of the application, as well as the name of the directory to create it in.')
        .option('--noGit', 'Skip initializing a Git repository', defaultResults.flags.noGit)
        .option('--noInstall', 'Skip installing dependencies', defaultResults.flags.noInstall)
        .option('--spotifyClientId <clientId>', 'Your Spotify client ID')
        .option('--spotifyClientSecret <clientSecret>', 'Your Spotify client secret')
        .parseAsync();

    results.flags = program.opts() as CLIFlags;

    const cliProvidedName = program.args[0];
    if (cliProvidedName) {
        results.appName = cliProvidedName;
    }

    if (!cliProvidedName) {
        results.appName = await promptAppName();
    } else {
        if (validateAppName(cliProvidedName) !== true) {
            logger.error(validateAppName(cliProvidedName));
            process.exit(1);
        }

        logger.info(`Using '${results.appName}' as the name of the project.`);
    }

    if (!results.flags.noGit) {
        results.flags.noGit = !(await promptGit());
    } else {
        logger.info('You can come back and run `git init` later.');
    }

    if (!results.flags.noInstall) {
        results.flags.noInstall = !(await promptInstall());
    } else {
        const pkgManager = getUserPkgManager();

        if (pkgManager === 'yarn') {
            logger.info(`No worries. You can run '${pkgManager}' later to install the dependencies.`);
        } else {
            logger.info(`No worries. You can run '${pkgManager} install' later to install the dependencies.`);
        }
    }

    if (!results.flags.spotifyClientId) {
        results.flags.spotifyClientId = await promptSpotifyId();
    } else {
        logger.info(`Using '${results.flags.spotifyClientId}' as your Spotify client ID.`);
    }

    if (!results.flags.spotifyClientSecret) {
        results.flags.spotifyClientSecret = await promptSpotifySecret();
    } else {
        logger.info(`Using '${results.flags.spotifyClientSecret}' as your Spotify client secret.`);
    }

    return results;
};

const promptAppName = async () => {
    const { appName } = await inquirer.prompt<Pick<CLIResults, 'appName'>>({
        name: 'appName',
        type: 'input',
        message: 'What is the name of the project?',
        default: defaultResults.appName,
        validate: validateAppName,
        transformer: (input: string) => {
            return input.trim();
        },
    });

    return appName;
};

const promptGit = async (): Promise<boolean> => {
    const { git } = await inquirer.prompt<{ git: boolean }>({
        name: 'git',
        type: 'confirm',
        message: 'Initialize a new git repository?',
        default: true,
    });

    if (git) {
        logger.success('Initializing repository!');
    } else {
        logger.info('You can come back and run `git init` later.');
    }

    return git;
};

const promptInstall = async (): Promise<boolean> => {
    const pkgManager = getUserPkgManager();

    const { install } = await inquirer.prompt<{ install: boolean }>({
        name: 'install',
        type: 'confirm',
        message: `Would you like to auto run '${pkgManager}` + (pkgManager === 'yarn' ? `'?` : ` install'?`),
        default: true,
    });

    if (install) {
        logger.success("Alright. We'll install the dependencies for you!");
    } else {
        if (pkgManager === 'yarn') {
            logger.info(`No worries. You can run '${pkgManager}' later to install the dependencies.`);
        } else {
            logger.info(`No worries. You can run '${pkgManager} install' later to install the dependencies.`);
        }
    }

    return install;
};

const promptSpotifyId = async (): Promise<string> => {
    const { spotifyId } = await inquirer.prompt<{ spotifyId: string }>({
        name: 'spotifyId',
        type: 'input',
        message: 'What is your Spotify client ID?',
        validate: (input: string) => {
            if (!input) return 'Please enter your Spotify client ID.';
            return true;
        },
    });

    return spotifyId;
};

const promptSpotifySecret = async (): Promise<string> => {
    const { spotifySecret } = await inquirer.prompt<{ spotifySecret: string }>({
        name: 'spotifySecret',
        type: 'password',
        message: 'What is your Spotify client secret?',
        validate: (input: string) => {
            if (!input) return 'Please enter your Spotify client secret.';
            return true;
        },
    });

    return spotifySecret;
};
