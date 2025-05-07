import * as fs from 'fs/promises';
import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import semver from 'semver';

const ISSUE_LABEL = 'dependency-update-tracker';
const DEPENDENCIES_FILE = 'dependencies.json';

interface NpmPackageConfig {
  id: string;
  packageName: string;
}

interface GitHubRepoConfig {
  id: string;
  repo: string;
}

interface DependenciesConfig {
  npmPackages: NpmPackageConfig[];
  githubRepos: GitHubRepoConfig[];
}

interface ReportedItem {
  id: string;
  version: string;
}

function parseIssueTitle(title: string): ReportedItem | null {
  const pattern = /^New Release: (NPM|GitHub) (.*?) (v?[\w.-]+)$/;
  const match = title.match(pattern);
  if (match) {
    return { id: match[2], version: match[3] };
  }
  return null;
}

async function getExistingReportedItems(
  octokit: ReturnType<typeof github.getOctokit>,
  repoOwner: string,
  repoName: string,
): Promise<Map<string, string>> {
  const reportedItems = new Map<string, string>();
  try {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner: repoOwner,
      repo: repoName,
      labels: ISSUE_LABEL,
      state: 'open',
    });

    for (const issue of issues) {
      const parsed = parseIssueTitle(issue.title);
      if (parsed) {
        const existingVersion = reportedItems.get(parsed.id);
        if (
          !existingVersion ||
          semver.gt(semver.coerce(parsed.version)!, semver.coerce(existingVersion)!)
        ) {
          reportedItems.set(parsed.id, parsed.version);
        }
      }
    }
    core.info(
      `Found ${reportedItems.size} existing open issues for tracked items with label "${ISSUE_LABEL}".`,
    );
  } catch (error: any) {
    core.error(`Failed to fetch existing issues: ${error.message}`);
  }
  return reportedItems;
}

async function createIssue(
  octokit: ReturnType<typeof github.getOctokit>,
  repoOwner: string,
  repoName: string,
  title: string,
  body: string,
): Promise<void> {
  try {
    await octokit.rest.issues.create({
      owner: repoOwner,
      repo: repoName,
      title,
      body,
      labels: [ISSUE_LABEL],
    });
    core.info(`Successfully created issue: "${title}"`);
  } catch (error: any) {
    core.error(`Failed to create issue "${title}": ${error.message}`);
  }
}

async function getNpmLatestVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      core.warning(
        `Failed to fetch NPM info for ${packageName}: ${response.status} ${response.statusText}`,
      );
      return null;
    }
    const data = (await response.json()) as any;
    return data?.['dist-tags']?.latest || null;
  } catch (error: any) {
    core.error(`Error fetching NPM info for ${packageName}: ${error.message}`);
    return null;
  }
}

async function getGithubLatestReleaseTag(
  repoFullName: string,
  octokit: ReturnType<typeof github.getOctokit>,
): Promise<string | null> {
  const [owner, repo] = repoFullName.split('/');
  if (!owner || !repo) {
    core.warning(`Invalid GitHub repo format: ${repoFullName}. Expected "owner/repo".`);
    return null;
  }

  try {
    const releaseResponse = await octokit.rest.repos.getLatestRelease({ owner, repo });
    if (releaseResponse.data?.tag_name) {
      core.info(`Latest release for ${repoFullName} is tag ${releaseResponse.data.tag_name}.`);
      return releaseResponse.data.tag_name;
    }
  } catch (error: any) {
    core.info(
      `No formal 'latest release' found for ${repoFullName} (or error: ${error.message}). Checking tags...`,
    );
  }

  try {
    const tagsResponse = await octokit.rest.repos.listTags({ owner, repo, per_page: 20 });
    const tags = tagsResponse.data;

    if (tags && tags.length > 0) {
      const versionTags = tags
        .map((tag) => tag.name)
        .filter((name) => semver.valid(semver.coerce(name)));

      if (versionTags.length > 0) {
        versionTags.sort((a, b) => semver.rcompare(semver.coerce(a)!, semver.coerce(b)!));
        core.info(
          `Found ${versionTags.length} semver tags for ${repoFullName}. Latest is ${versionTags[0]}.`,
        );
        return versionTags[0];
      } else {
        core.info(
          `No semver-like tags found for ${repoFullName}. Using the most recent tag by API order: ${tags[0].name}.`,
        );
        return tags[0].name;
      }
    }
    core.warning(`No releases or tags found for ${repoFullName}.`);
    return null;
  } catch (error: any) {
    core.error(`Error fetching GitHub tags for ${repoFullName}: ${error.message}`);
    return null;
  }
}

function isNewerVersion(newVersion: string, existingVersion: string | undefined): boolean {
  if (!existingVersion) return true;

  const cleanNew = semver.coerce(newVersion);
  const cleanOld = semver.coerce(existingVersion);

  if (!cleanNew) {
    core.warning(`Invalid new version format: ${newVersion}. Assuming not newer.`);
    return false;
  }
  if (!cleanOld) {
    core.warning(
      `Invalid existing version format: ${existingVersion}. Assuming new version ${newVersion} is newer.`,
    );
    return true;
  }

  try {
    return semver.gt(cleanNew, cleanOld);
  } catch (e: any) {
    core.warning(
      `Semver comparison error between "${newVersion}" and "${existingVersion}": ${e.message}. Falling back to string comparison.`,
    );
    return newVersion > existingVersion;
  }
}

async function main() {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER || github.context.repo.owner;
    const REPO_NAME = process.env.REPO_NAME || github.context.repo.repo;

    if (!GITHUB_TOKEN) {
      core.setFailed('GITHUB_TOKEN is not set.');
      return;
    }
    if (!REPO_OWNER || !REPO_NAME) {
      core.setFailed('REPO_OWNER or REPO_NAME could not be determined.');
      return;
    }

    const octokit = github.getOctokit(GITHUB_TOKEN);

    const dependenciesFilePath = path.join(process.cwd(), DEPENDENCIES_FILE);
    const dependenciesFileContent = await fs.readFile(dependenciesFilePath, 'utf-8');
    const config: DependenciesConfig = JSON.parse(dependenciesFileContent);

    const existingReportedItems = await getExistingReportedItems(octokit, REPO_OWNER, REPO_NAME);

    // Process NPM Packages
    for (const pkg of config.npmPackages) {
      core.info(`Checking NPM package: ${pkg.packageName} (id: ${pkg.id})`);
      const latestVersion = await getNpmLatestVersion(pkg.packageName);
      if (latestVersion) {
        const currentReportedVersion = existingReportedItems.get(pkg.id);
        if (isNewerVersion(latestVersion, currentReportedVersion)) {
          const title = `New Release: NPM ${pkg.id} ${
            semver.valid(semver.coerce(latestVersion)) || latestVersion
          }`;
          const body = `A new release for NPM package **${pkg.id}** (\`${
            pkg.packageName
          }\`) has been detected: **${latestVersion}**.

${
  currentReportedVersion
    ? `An issue for version **${currentReportedVersion}** might already exist. This is a newer version.`
    : 'This is the first release detected for this item by the tracker.'
}

**Package URL:** https://www.npmjs.com/package/${pkg.packageName}
**New Version:** ${latestVersion}

Please assess the impact of this update and create a task to incorporate it if necessary.`;
          await createIssue(octokit, REPO_OWNER, REPO_NAME, title, body);
        } else {
          core.info(
            `NPM package ${pkg.id} latest version ${latestVersion} is not newer than reported ${currentReportedVersion}. No action needed.`,
          );
        }
      }
    }

    // Process GitHub Repos
    for (const ghRepo of config.githubRepos) {
      core.info(`Checking GitHub repo: ${ghRepo.repo} (id: ${ghRepo.id})`);
      const latestTag = await getGithubLatestReleaseTag(ghRepo.repo, octokit);
      if (latestTag) {
        const currentReportedTag = existingReportedItems.get(ghRepo.id);
        if (isNewerVersion(latestTag, currentReportedTag)) {
          const title = `New Release: GitHub ${ghRepo.id} ${
            semver.valid(semver.coerce(latestTag)) || latestTag
          }`;
          const body = `A new release for GitHub repository **${ghRepo.id}** (\`${
            ghRepo.repo
          }\`) has been detected: **${latestTag}**.

${
  currentReportedTag
    ? `An issue for version **${currentReportedTag}** might already exist. This is a newer version.`
    : 'This is the first release detected for this item by the tracker.'
}

**Repository URL:** https://github.com/${ghRepo.repo}
**New Release Tag:** ${latestTag}
**Release URL:** https://github.com/${ghRepo.repo}/releases/tag/${latestTag}

Please assess the impact of this update and create a task to incorporate it if necessary.`;
          await createIssue(octokit, REPO_OWNER, REPO_NAME, title, body);
        } else {
          core.info(
            `GitHub repo ${ghRepo.id} latest tag ${latestTag} is not newer than reported ${currentReportedTag}. No action needed.`,
          );
        }
      }
    }
    core.info('Release check complete.');
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

main();
