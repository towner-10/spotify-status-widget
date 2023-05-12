import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, '../');

export const TITLE_TEXT = ` ___  ___   ___  _____  ___  ___ __   __  ___  _____  _  _____  _   _  ___  __      __ ___  ___    ___  ___  _____ 
/ __|| _ \\ / _ \\|_   _||_ _|| __|\\ \\ / / / __||_   _|/_\\|_   _|| | | |/ __| \\ \\    / /|_ _||   \\  / __|| __||_   _|
\\__ \\|  _/| (_) | | |   | | | _|  \\ V /  \\__ \\  | | / _ \\ | |  | |_| |\\__ \\  \\ \\/\\/ /  | | | |) || (_ || _|   | |  
|___/|_|   \\___/  |_|  |___||_|    |_|   |___/  |_|/_/ \\_\\|_|   \\___/ |___/   \\_/\\_/  |___||___/  \\___||___|  |_|                                                                                                                  
`;

export const DEFAULT_APP_NAME = 'my-spotify-status-widget';
export const TITLE = 'create-spotify-status-widget';
