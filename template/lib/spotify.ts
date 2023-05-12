const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export type Track = {
    isPlaying: boolean;
    artists: string;
    trackImage: string;
    url: string;
    name: string;
    duration?: number;
    progress?: number;
};

export type TrackResponse = {
    type: 'track' | 'unknown';
    track?: Track;
};

// Get the access token from the Spotify API. This is used to make requests to the API.
const getAccessToken = async () => {
    if (refresh_token !== undefined) {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token,
            }),
        });

        if (response.status > 400) {
            throw new Error('Unable to get access token.');
        }

        const data = await response.json();

        if (response.status > 400) {
            throw new Error(data.error);
        }

        return data;
    }

    return {};
};

// Get the top tracks from the Spotify API.
export const getTopTracks = async () => {
    try {
        const { access_token } = await getAccessToken();

        return await fetch(TOP_TRACKS_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    } catch (error) {
        console.error(error);

        return {
            status: 205,
            json: () => ({
                items: [],
            }),
        };
    }
};

// Get the currently playing track from the Spotify API.
export const getNowPlaying = async () => {
    try {
        const { access_token } = await getAccessToken();

        return await fetch(NOW_PLAYING_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    } catch (error) {
        console.error(error);

        return {
            status: 205,
            json: () => ({
                isPlaying: false,
            }),
        };
    }
};

// Get the latest track from the Spotify API.
export const getRecentlyPlayed = async () => {
    try {
        const { access_token } = await getAccessToken();

        return await fetch(RECENTLY_PLAYED_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    } catch (error) {
        console.error(error);

        return {
            status: 205,
            json: () => ({
                items: [],
            }),
        };
    }
};

export const getCurrentTrack = async () => {
    const response = await getNowPlaying();

    if (response.status > 400)
        return {
            type: 'unknown',
        } as TrackResponse;

    // If there is no currently playing track, find the last played track.
    if (response.status === 204) {
        const recentlyPlayed = await getRecentlyPlayed();

        if (recentlyPlayed.status === 204 || recentlyPlayed.status > 400)
            return {
                type: 'unknown',
            } as TrackResponse;

        const { items } = await recentlyPlayed.json();

        if (items[0].track.type !== 'track')
            return {
                type: 'unknown',
            } as TrackResponse;

        return {
            type: 'track',
            track: {
                isPlaying: false,
                artists: items[0].track.artists.map((_artist: any) => _artist.name).join(', '),
                trackImage: items[0].track.album.images[0].url,
                url: items[0].track.external_urls.spotify,
                name: items[0].track.name,
                duration: items[0].track.duration_ms,
            },
        } as TrackResponse;
    }

    const track = await response.json();

    if (track.currently_playing_type !== 'track') return { type: 'unknown' } as TrackResponse;

    return {
        type: 'track',
        track: {
            isPlaying: track.is_playing,
            artists: track.item.artists.map((_artist: any) => _artist.name).join(', '),
            trackImage: track.item.album.images[0].url,
            url: track.item.external_urls.spotify,
            name: track.item.name,
            duration: track.item.duration_ms,
            progress: track.progress_ms,
        },
    } as TrackResponse;
};
