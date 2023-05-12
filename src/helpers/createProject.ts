import path from 'path';
import { scaffoldProject } from '@/helpers/scaffoldProject.js';
import { getUserPkgManager } from '@/utils/getUserPkgManager.js';

interface CreateProjectOptions {
    projectName: string;
    noInstall: boolean;
}

export const createProject = async ({ projectName, noInstall }: CreateProjectOptions) => {
    const pkgManager = getUserPkgManager();
    const projectDir = path.resolve(process.cwd(), projectName);

    // Bootstraps the base Next.js application
    await scaffoldProject({
        projectName,
        projectDir,
        pkgManager,
        noInstall,
    });

    return projectDir;
};
