#! /usr/bin/env node

import path from 'path';
import { runCLI } from './cli';
import { createProject } from './helpers/createProject';
import { renderTitle } from './utils/renderTitle';
import fs from 'fs-extra';
import { parseNameAndPath } from './utils/parseNameAndPath';
import { installDependencies } from './helpers/installDependencies';
import { initializeGit } from './helpers/git';
import { logNextSteps } from './helpers/logNextSteps';
import { logger } from './utils/logger';
import { getRefreshToken } from './utils/getRefreshToken';
import { writeEnv } from './helpers/writeEnv';

const main = async () => {
    renderTitle();

    const results = await runCLI();

    const [scopedAppName, appDir] = parseNameAndPath(results.appName);

    const refreshToken = await getRefreshToken({
        spotifyClientId: results.flags.spotifyClientId,
        spotifyClientSecret: results.flags.spotifyClientSecret,
    });

    const projectDir = await createProject({
        projectName: appDir,
        noInstall: results.flags.noInstall,
    });

    // Write name to package.json
    const pkgJson = fs.readJSONSync(path.join(projectDir, 'package.json'));
    pkgJson.name = scopedAppName;

    if (!results.flags.noInstall) {
        await installDependencies({ projectDir });
    }

    // Write .env.local
    await writeEnv({
        projectDir,
        clientId: results.flags.spotifyClientId,
        clientSecret: results.flags.spotifyClientSecret,
        refreshToken,
    });

    // Rename _eslintrc.json to .eslintrc.json - we use _eslintrc.json to avoid conflicts with the monorepos linter
    fs.renameSync(path.join(projectDir, '_eslintrc.json'), path.join(projectDir, '.eslintrc.json'));

    if (!results.flags.noGit) {
        await initializeGit(projectDir);
    }

    logNextSteps({
        projectName: appDir,
        noInstall: results.flags.noInstall,
    });

    process.exit(0);
};

main().catch(err => {
    logger.error('An error occurred while creating your project.');

    if (err instanceof Error) {
        logger.error(err);
    } else {
        logger.error('An unknown error occurred.');
        console.log(err);
    }

    process.exit(1);
});
