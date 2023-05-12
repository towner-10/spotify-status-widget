import gradient from 'gradient-string';
import { TITLE_TEXT } from '@/consts';
import { getUserPkgManager } from './getUserPkgManager';

const spotifyColors = {
    green: '#1DB954',
    white: '#191414',
};

export const renderTitle = () => {
    const spotifyGradient = gradient(Object.values(spotifyColors));

    // Prevent weird issue with displaying the title with these package managers
    const pkgManager = getUserPkgManager();
    if (pkgManager === 'yarn' || pkgManager === 'pnpm') {
        console.log('');
    }
    console.log(spotifyGradient.multiline(TITLE_TEXT));
};
