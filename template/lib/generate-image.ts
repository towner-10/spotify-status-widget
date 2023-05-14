import { createCanvas, loadImage, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { getAverageColor } from 'fast-average-color-node';
import { join } from 'path';
import { Track } from './spotify';
import { Theme, defaultTheme } from '@/lib/themes';

const loadedCustomFonts: number = GlobalFonts.loadFontsFromDir(join(process.cwd(), 'fonts'));

console.log(`Loaded ${loadedCustomFonts} custom fonts from ${join(process.cwd(), 'fonts')}`);

/**
 * Draw a rounded rectangle
 * @param ctx Canvas context
 * @param x X position to draw the rectangle
 * @param y Y position to draw the rectangle
 * @param width Width of the rectangle
 * @param height Height of the rectangle
 * @param radius Radius of the corners
 * @returns The canvas context
 */
const roundedRect = (ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    return ctx;
};

/**
 * Scale a string of text to fit within a given width
 * @param ctx Canvas context
 * @param text Text to draw
 * @param maxWidth Maximum width of the text
 * @param font Font to use
 * @param fontSize Font size to use
 * @returns The scaled font size
 */
const scaleText = (ctx: SKRSContext2D, text: string, maxWidth: number, font: string, fontSize: number) => {
    do {
        ctx.font = `${(fontSize -= 1)}px ${font}`;
    } while (ctx.measureText(text).width > maxWidth);
    return ctx.font;
};

/**
 * Create a Spotify image
 * @param track The track response from the Spotify API
 */
export const createSpotifyImage = async (track: Track, theme: Theme): Promise<Buffer> => {
    const getFont = (type: 'heading' | 'subheading') => {
        if (type === 'heading') {
            return theme.headingFont || defaultTheme.headingFont!;
        } else if (type === 'subheading') {
            return theme.subheadingFont || defaultTheme.subheadingFont!;
        } else {
            return defaultTheme.subheadingFont!;
        }
    };

    const canvas = createCanvas(960, 360);
    const ctx = canvas.getContext('2d');

    const albumArt = await loadImage(track.trackImage);
    const color = await getAverageColor(track.trackImage);

    // Transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = theme.backgroundColor;
    roundedRect(ctx, 0, 0, canvas.width, canvas.height, 30).fill();

    ctx.shadowBlur = theme.shadowBlur;
    ctx.shadowColor = color.hex;
    ctx.drawImage(albumArt, 30, canvas.height / 2 - 150, 300, 300);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    const textPositionY = canvas.width / 2 - 100;
    const maxTextWidth = canvas.width - textPositionY - 20;

    ctx.fillStyle = theme.textColor;
    ctx.font = scaleText(ctx, track.name, maxTextWidth, getFont('heading'), 48);
    ctx.textAlign = 'left';
    ctx.fillText(track.name, canvas.width / 2 - 100, canvas.height / 2);

    ctx.font = scaleText(ctx, track.artists, maxTextWidth, getFont('subheading'), 25);
    ctx.fillText(track.artists, canvas.width / 2 - 100, canvas.height / 2 - 50);

    if (track.progress && track.duration && track.isPlaying) {
        // Draw progress bar
        ctx.shadowBlur = theme.shadowBlur;
        ctx.shadowColor = color.hex;
        ctx.fillStyle = color.hex;
        roundedRect(ctx, canvas.width / 2 - 100, canvas.height / 2 + 50, 500, 20, 20).fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = theme.progressColor;
        roundedRect(
            ctx,
            canvas.width / 2 - 100,
            canvas.height / 2 + 50,
            500 * (track.progress / track.duration),
            20,
            20,
        ).fill();
    } else {
        // Draw pause icon
        ctx.shadowBlur = theme.shadowBlur;
        ctx.shadowColor = color.hex;
        ctx.fillStyle = color.hex;
        ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 50, 10, 30);
        ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 50, 10, 30);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = theme.textColor;
        ctx.font = scaleText(ctx, 'Paused', maxTextWidth, getFont('subheading'), 25);
        ctx.fillText('Paused', canvas.width / 2 - 20, canvas.height / 2 + 73);
    }

    return canvas.encode('png');
};
