import path from 'path';
import { promises as fs } from 'fs';
import { z } from 'zod';

export const themeSchema = z.object({
    name: z.string().toLowerCase(),
    backgroundColor: z.string().startsWith('#').min(7).max(7),
    textColor: z.string().startsWith('#').min(7).max(7),
    progressColor: z.string().startsWith('#').min(7).max(7),
    shadowColor: z.string().startsWith('#').min(7).max(7),
    shadowBlur: z.number().int().min(0).max(100),
    borderRadius: z.number().int().min(0).max(100),
    headingFont: z.string().optional(),
    subheadingFont: z.string().optional(),
});

export type Theme = z.infer<typeof themeSchema>;

export const defaultTheme: Theme = {
    name: 'default',
    backgroundColor: '#0d1117',
    textColor: '#ffffff',
    progressColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowBlur: 20,
    borderRadius: 30,
    headingFont: 'Poppins',
    subheadingFont: 'Source Sans Pro',
};

export const getTheme = async (name: string): Promise<Theme | undefined> => {
    const themeFiles = await fs.readdir(path.join(process.cwd(), 'themes'));

    if (!themeFiles.includes(`${name}.json`)) return undefined;

    const theme = await fs.readFile(path.join(process.cwd(), 'themes', `${name}.json`), 'utf-8');

    const parsedTheme = JSON.parse(theme);

    try {
        return themeSchema.parse(parsedTheme);
    } catch (e) {
        console.error(`Error parsing theme ${name}`);
        console.error(e);
        return undefined;
    }
};
