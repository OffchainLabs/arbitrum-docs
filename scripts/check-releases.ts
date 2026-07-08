import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import semver from 'semver';

const DEPENDENCIES_FILE = 'dependencies.json';

// Mirrors @actions/core's setOutput by appending to the GITHUB_OUTPUT file
// (the current GitHub Actions mechanism). No-op outside Actions — e.g. local
// runs, where GITHUB_OUTPUT is unset. Avoids depending on the ESM-only
// @actions/core, which fails to load under tsx's CommonJS resolution.
function setOutput(name: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  fsSync.appendFileSync(outputFile, `${name}=${value}\n`);
}

interface Project {
  id: string;
  name: string;
  repo: string;
  currentDocsVersion: string;
  latestRelease: string;
  latestReleaseDate: string;
  docsPath: string;
  description: string;
}

interface DependenciesConfig {
  projects: Project[];
}

function extractRepoInfo(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    const [, owner, repo] = url.pathname.split('/');
    if (!owner || !repo) {
      console.warn(
        `Invalid GitHub repo URL format: ${repoUrl}. Expected "https://github.com/owner/repo"`,
      );
      return null;
    }
    return { owner, repo };
  } catch (error) {
    console.error(`Error parsing repo URL ${repoUrl}:`, error);
    return null;
  }
}

async function getGithubLatestRelease(
  repoUrl: string,
): Promise<{ version: string; date: string } | null> {
  const repoInfo = extractRepoInfo(repoUrl);
  if (!repoInfo) return null;

  const { owner, repo } = repoInfo;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    if (!response.ok) {
      console.warn(`No latest release found for ${repoUrl}. Checking tags...`);
      const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`);
      if (!tagsResponse.ok) {
        console.error(`Failed to fetch tags for ${repoUrl}`);
        return null;
      }
      const tags = await tagsResponse.json();
      if (tags.length > 0) {
        // For tags, we don't have a release date, so we'll use current date
        return {
          version: tags[0].name,
          date: new Date().toISOString().split('T')[0],
        };
      }
      return null;
    }

    const data = await response.json();
    return {
      version: data.tag_name,
      date: new Date(data.published_at).toISOString().split('T')[0],
    };
  } catch (error) {
    console.error(`Error checking ${repoUrl}:`, error);
    return null;
  }
}

function isNewerVersion(newVersion: string, currentVersion: string): boolean {
  const cleanNew = semver.coerce(newVersion);
  const cleanCurrent = semver.coerce(currentVersion);

  if (!cleanNew || !cleanCurrent) {
    // If we can't parse versions, fall back to string comparison
    return newVersion > currentVersion;
  }

  return semver.gt(cleanNew, cleanCurrent);
}

async function resolveTagCommitSha(
  owner: string,
  repo: string,
  tagName: string,
): Promise<string | null> {
  const headers: Record<string, string> = { 'User-Agent': 'arbitrum-docs-bot' };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/tags/${tagName}`,
      { headers },
    );
    if (!refRes.ok) return null;
    const ref = await refRes.json();

    let sha: string = ref.object.sha;

    // Annotated tag → dereference to the underlying commit
    if (ref.object.type === 'tag') {
      const tagRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/tags/${sha}`, {
        headers,
      });
      if (!tagRes.ok) return null;
      const tagObj = await tagRes.json();
      sha = tagObj.object.sha;
    }

    return sha.slice(0, 7);
  } catch (error) {
    console.error(`Error resolving tag SHA for ${tagName}:`, error);
    return null;
  }
}

// Syncs both Nitro values in globalVars.js from a release: the git tag
// (nitroVersionTag, which drives the @@ doc references and the precompile source
// links) and the node Docker image (latestNitroNodeImage, tag + short commit).
function updateGlobalVarsNitro(version: string, shortSha: string): void {
  const filePath = path.join(process.cwd(), 'src/resources/globalVars.js');
  const before = fsSync.readFileSync(filePath, 'utf-8');
  const dockerImage = `offchainlabs/nitro-node:${version}-${shortSha}`;

  const after = before
    .replace(/nitroVersionTag:\s*'[^']*'/, `nitroVersionTag: '${version}'`)
    .replace(/latestNitroNodeImage:\s*'[^']*'/, `latestNitroNodeImage: '${dockerImage}'`);

  if (after !== before) {
    fsSync.writeFileSync(filePath, after, 'utf-8');
    console.log(`✅ Updated nitroVersionTag to: ${version}`);
    console.log(`✅ Updated latestNitroNodeImage to: ${dockerImage}`);
  }
}

async function main() {
  try {
    const dependenciesFilePath = path.join(process.cwd(), DEPENDENCIES_FILE);
    const dependenciesFileContent = await fs.readFile(dependenciesFilePath, 'utf-8');
    const config: DependenciesConfig = JSON.parse(dependenciesFileContent);

    console.log('\nChecking latest releases for all projects...\n');

    const updatedProjects: Project[] = [];

    for (const project of config.projects) {
      console.log(`Checking ${project.name}...`);
      const latest = await getGithubLatestRelease(project.repo);

      if (!latest) {
        console.log(`  ❌ Could not fetch release info for ${project.repo}\n`);
        continue;
      }

      const needsUpdate = isNewerVersion(latest.version, project.latestRelease);

      console.log(`  Current docs version: ${project.currentDocsVersion}`);
      console.log(`  Latest release: ${latest.version} (${latest.date})`);
      console.log(`  Status: ${needsUpdate ? '🔄 Update needed' : '✅ Up to date'}\n`);

      if (needsUpdate) {
        const updatedProject = {
          ...project,
          latestRelease: latest.version,
          latestReleaseDate: latest.date,
        };
        updatedProjects.push(updatedProject);
      }
    }

    if (updatedProjects.length > 0) {
      console.log('\n📋 Dependencies with available updates:');
      updatedProjects.forEach((project) => {
        console.log(
          `  • ${project.name}: ${project.currentDocsVersion} → ${project.latestRelease} (released ${project.latestReleaseDate})`,
        );
      });

      // Update dependencies.json file
      console.log('\n🔄 Updating dependencies.json...');
      const updatedConfig: DependenciesConfig = {
        ...config,
        projects: config.projects.map((project) => {
          const updatedProject = updatedProjects.find((up) => up.id === project.id);
          return updatedProject || project;
        }),
      };

      await fs.writeFile(
        dependenciesFilePath,
        JSON.stringify(updatedConfig, null, 2) + '\n',
        'utf-8',
      );

      console.log('✅ dependencies.json updated successfully');

      // If Nitro was updated, also derive and update the Docker image tag in globalVars.js
      const nitroUpdate = updatedProjects.find((p) => p.id === 'nitro');
      if (nitroUpdate) {
        const repoInfo = extractRepoInfo(nitroUpdate.repo);
        if (repoInfo) {
          console.log(`\n🐳 Resolving Docker image tag for Nitro ${nitroUpdate.latestRelease}...`);
          const shortSha = await resolveTagCommitSha(
            repoInfo.owner,
            repoInfo.repo,
            nitroUpdate.latestRelease,
          );
          if (shortSha) {
            updateGlobalVarsNitro(nitroUpdate.latestRelease, shortSha);
          } else {
            console.warn('  ⚠️  Could not resolve tag SHA — globalVars.js not updated');
          }
        }
      }

      // Set output to indicate updates were made
      setOutput('updates_made', 'true');
      setOutput('updated_projects', updatedProjects.map((p) => p.name).join(', '));
    } else {
      console.log('All dependencies are up to date.');
      setOutput('updates_made', 'false');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
