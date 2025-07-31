import * as fs from 'fs/promises';
import * as path from 'path';
import semver from 'semver';
import * as github from '@actions/github';
import * as core from '@actions/core';

const DEPENDENCIES_FILE = 'dependencies.json';

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

async function createOrUpdatePullRequest(updatedProjects: Project[]) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not found in environment');
  }

  const octokit = github.getOctokit(token);
  const context = github.context;

  const prTitle = 'chore: update dependencies to latest versions';
  const branchName = 'docs/update-dependencies';

  try {
    // Check for existing open PRs with the same title
    const { data: existingPrs } = await octokit.rest.pulls.list({
      ...context.repo,
      state: 'open',
      head: `${context.repo.owner}:${branchName}`,
    });

    let existingPr = existingPrs.find(pr => pr.title === prTitle); // Find PR matching the title
    if (!existingPr) {
      console.log(`No existing pull request found with title "${prTitle}".`);
    }

    // Get the current commit SHA from master
    const { data: masterRef } = await octokit.rest.git.getRef({
      ...context.repo,
      ref: 'heads/master',
    });

    let branchExists = false;
    try {
      // Check if branch already exists
      await octokit.rest.git.getRef({
        ...context.repo,
        ref: `heads/${branchName}`,
      });
      branchExists = true;
    } catch (error: unknown) {
      if (isErrorWithStatus(error) && error.status !== 404) {
        throw error;
      }
    }

    if (!branchExists) {
      // Create a new branch
      await octokit.rest.git.createRef({
        ...context.repo,
        ref: `refs/heads/${branchName}`,
        sha: masterRef.object.sha,
      });
      console.log(`Created new branch: ${branchName}`);
    } else {
      // Update existing branch to latest master
      const { data: branchRef } = await octokit.rest.git.getRef({
        ...context.repo,
        ref: `heads/${branchName}`,
      });

      if (branchRef.object.sha === masterRef.object.sha) {
        console.log(`Branch ${branchName} is already up-to-date.`);
      } else {
        const { data: comparison } = await octokit.rest.repos.compareCommits({
          ...context.repo,
          base: branchRef.object.sha,
          head: masterRef.object.sha,
        });

        if (comparison.status === 'identical') {
          console.log(`Branch ${branchName} is already up-to-date.`);
        } else if (comparison.status === 'ahead') {
          console.warn(`Branch ${branchName} is ahead of master. Manual review required to preserve commits.`);
        } else if (comparison.status === 'diverged') {
          await octokit.rest.git.updateRef({
            ...context.repo,
            ref: `heads/${branchName}`,
            sha: masterRef.object.sha,
            force: true,
          });
          console.warn(`Forcefully updated branch ${branchName} to match master.`);
        } else if (comparison.status === 'behind') {
          await octokit.rest.git.updateRef({
            ...context.repo,
            ref: `heads/${branchName}`,
            sha: masterRef.object.sha,
            force: false,
          });
          console.log(`Updated branch ${branchName} to match master.`);
        } else {
          console.error(`Unexpected comparison status: ${comparison.status}. Manual intervention required.`);
        }
      }
    }

    // Update dependencies.json in the branch
    const { data: content } = await octokit.rest.repos.getContent({
      ...context.repo,
      path: DEPENDENCIES_FILE,
      ref: branchName,
    });

    if (!('content' in content)) {
      throw new Error('Could not get content of dependencies.json');
    }

    const currentContent = Buffer.from(content.content, 'base64').toString();
    const currentConfig: DependenciesConfig = JSON.parse(currentContent);

    // Update only the projects that have changed
    updatedProjects.forEach((updatedProject) => {
      const index = currentConfig.projects.findIndex((p) => p.id === updatedProject.id);
      if (index !== -1) {
        currentConfig.projects[index] = updatedProject;
      }
    });

    // Create commit with updated dependencies.json
    await octokit.rest.repos.createOrUpdateFileContents({
      ...context.repo,
      path: DEPENDENCIES_FILE,
      message: 'chore: update dependencies.json with latest versions',
      content: Buffer.from(JSON.stringify(currentConfig, null, 2)).toString('base64'),
      branch: branchName,
      sha: content.sha,
    });

    const prBody = `This PR updates the following dependencies to their latest versions:\n\n${updatedProjects
      .map((p) => `- ${p.name}: ${p.latestRelease} (released on ${p.latestReleaseDate})`)
      .join('\n')}\n\nPlease review the changes and update the documentation accordingly.`;

    if (existingPr) {
      // Update existing PR
      const { data: updatedPr } = await octokit.rest.pulls.update({
        ...context.repo,
        pull_number: existingPr.number,
        body: prBody,
      });

      console.log(`Updated existing PR #${updatedPr.number}: ${updatedPr.html_url}`);
      
      // Set output for GitHub Actions
      core.setOutput('pr_number', updatedPr.number);
      core.setOutput('pr_url', updatedPr.html_url);
    } else {
      // Create new pull request
      const { data: pr } = await octokit.rest.pulls.create({
        ...context.repo,
        title: prTitle,
        head: branchName,
        base: 'master',
        body: prBody,
      });

      console.log(`Created new PR #${pr.number}: ${pr.html_url}`);

      // Set output for GitHub Actions
      core.setOutput('pr_number', pr.number);
      core.setOutput('pr_url', pr.html_url);
    }
  } catch (error) {
    console.error('Error creating/updating pull request:', error);
    throw error;
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
      console.log('Creating or updating pull request with updates...');
      await createOrUpdatePullRequest(updatedProjects);
    } else {
      console.log('All dependencies are up to date.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
