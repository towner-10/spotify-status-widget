import fetch from 'node-fetch';
import http from 'http';
import { URL } from 'url';
import ora from 'ora';
import { logger } from './logger';
import chalk from 'chalk';

type Options = {
    spotifyClientId: string;
    spotifyClientSecret: string;
};

export const getRefreshToken = async (options: Options) => {
    const { spotifyClientId, spotifyClientSecret } = options;

    const userCode = await new Promise((res, rej) => {
        let code: string | null = null;

        // Create URL to get authorization code and output it to the user
        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', spotifyClientId);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', 'http://localhost:3000');
        authUrl.searchParams.append('scope', 'user-read-recently-played user-read-currently-playing user-top-read');

        logger.info("");
        const serverSpinner = ora(`Please visit the following URL to authorize your Spotify account:\n\n${chalk.dim.bold(authUrl.href)}\n`);

        // Create a server to listen for the redirect URL and get the code, close the server once we have the code
        const server = http
            .createServer(async (req, res) => {
                const url = new URL(req.url as string, 'http://localhost:3000/');

                // Check if favicon, if so, ignore
                if (url.pathname === '/favicon.ico') {
                    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
                    res.end();
                    return;
                }

                code = url.searchParams.get('code');

                if (code) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h1>Got the code, you may now close this window and return to the CLI!</h1>');

                    server.close();
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<h1>Failed to get the code, please try again.</h1>');
                }
            })
            .on('close', () => {
                if (code) {
                    serverSpinner.succeed('Successfully got authorization code.');
                    res(code);
                } else {
                    serverSpinner.fail('Failed to get authorization code.');
                    rej(`Failed to get authorization code. Code: ${code}`);
                }
            })
            .listen(3000, () => {
                serverSpinner.start();
            });
    });

    const refreshTokenSpinner = ora('Waiting for refresh token...').start();

    // Get the refresh token
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')}`,
        },
        body: `grant_type=authorization_code&code=${userCode}&redirect_uri=http://localhost:3000`,
    });

    if (response.ok) {
        const { refresh_token } = (await response.json()) as { refresh_token: string };

        refreshTokenSpinner.succeed('Successfully got refresh token.');

        return refresh_token;
    }

    refreshTokenSpinner.fail('Failed to get refresh token.');
    throw new Error('Failed to get refresh token.');
};
