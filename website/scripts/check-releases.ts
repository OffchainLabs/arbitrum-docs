import * as fs from 'fs/promises';
import * as path from 'path';
import semver from 'semver';
import * as github from '@actions/github';
import * as core from '@actions/core';

const DEPENDENCIES_FILE = 'dependencies.json';

interface Product {
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
  products: Product[];
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

async function createPullRequest(updatedProducts: Product[]) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not found in environment');
  }

  const octokit = github.getOctokit(token);
  const context = github.context;

  // Create a new branch
  const branchName = `docs/update-dependencies-${new Date().toISOString().split('T')[0]}`;

  try {
    // Get the current commit SHA
    const { data: ref } = await octokit.rest.git.getRef({
      ...context.repo,
      ref: 'heads/master',
    });

    // Create a new branch
    await octokit.rest.git.createRef({
      ...context.repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });

    // Update dependencies.json in the new branch
    const { data: content } = await octokit.rest.repos.getContent({
      ...context.repo,
      path: DEPENDENCIES_FILE,
    });

    if (!('content' in content)) {
      throw new Error('Could not get content of dependencies.json');
    }

    const currentContent = Buffer.from(content.content, 'base64').toString();
    const currentConfig: DependenciesConfig = JSON.parse(currentContent);

    // Update only the products that have changed
    updatedProducts.forEach((updatedProduct) => {
      const index = currentConfig.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        currentConfig.products[index] = updatedProduct;
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

    // Create pull request
    const prBody = `This PR updates the following dependencies to their latest versions:\n\n${updatedProducts
      .map((p) => `- ${p.name}: ${p.latestRelease} (released on ${p.latestReleaseDate})`)
      .join('\n')}\n\nPlease review the changes and update the documentation accordingly.`;

    const { data: pr } = await octokit.rest.pulls.create({
      ...context.repo,
      title: 'chore: update dependencies to latest versions',
      head: branchName,
      base: 'master',
      body: prBody,
    });

    console.log(`Created PR #${pr.number}: ${pr.html_url}`);

    // Set output for GitHub Actions
    core.setOutput('pr_number', pr.number);
    core.setOutput('pr_url', pr.html_url);
  } catch (error) {
    console.error('Error creating pull request:', error);
    throw error;
  }
}

async function main() {
  try {
    const dependenciesFilePath = path.join(process.cwd(), DEPENDENCIES_FILE);
    const dependenciesFileContent = await fs.readFile(dependenciesFilePath, 'utf-8');
    const config: DependenciesConfig = JSON.parse(dependenciesFileContent);

    console.log('\nChecking latest releases for all products...\n');

    const updatedProducts: Product[] = [];

    for (const product of config.products) {
      console.log(`Checking ${product.name}...`);
      const latest = await getGithubLatestRelease(product.repo);

      if (!latest) {
        console.log(`  ❌ Could not fetch release info for ${product.repo}\n`);
        continue;
      }

      const needsUpdate = isNewerVersion(latest.version, product.latestRelease);

      console.log(`  Current docs version: ${product.currentDocsVersion}`);
      console.log(`  Latest release: ${latest.version} (${latest.date})`);
      console.log(`  Status: ${needsUpdate ? '🔄 Update needed' : '✅ Up to date'}\n`);

      if (needsUpdate) {
        const updatedProduct = {
          ...product,
          latestRelease: latest.version,
          latestReleaseDate: latest.date,
        };
        updatedProducts.push(updatedProduct);
      }
    }

    if (updatedProducts.length > 0) {
      console.log('Creating pull request with updates...');
      await createPullRequest(updatedProducts);
    } else {
      console.log('All dependencies are up to date.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
