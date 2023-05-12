import path from 'path';
import fs from 'fs-extra';

type WriteEnvOptions = {
    projectDir: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
};

export const writeEnv = async ({ projectDir, clientId, clientSecret, refreshToken }: WriteEnvOptions) => {
    const envPath = path.join(projectDir, '.env.local');

    const envContents = `SPOTIFY_CLIENT_ID="${clientId}"\nSPOTIFY_CLIENT_SECRET="${clientSecret}"\nSPOTIFY_REFRESH_TOKEN="${refreshToken}"`;

    await fs.writeFile(envPath, envContents);

    return envPath;
};
