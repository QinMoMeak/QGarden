import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const interviewsRoot = path.join(projectRoot, 'src', 'content', 'interviews');

async function walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFrontmatter(content) {
  const blockPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u;

  if (!blockPattern.test(content)) {
    return { frontmatterBlocks: [], body: content };
  }

  const frontmatterBlocks = [];
  let remaining = content;

  while (true) {
    const match = remaining.match(blockPattern);

    if (!match) {
      break;
    }

    frontmatterBlocks.push(match[1]);
    remaining = remaining.slice(match[0].length);
    remaining = remaining.replace(/^(?:\r?\n)+(?=---\r?\n)/u, '');
  }

  return {
    frontmatterBlocks,
    body: remaining,
  };
}

function normalizeFrontmatter(content, fallbackTitle, fallbackShortTitle) {
  const { frontmatterBlocks, body } = parseFrontmatter(content);
  const outputLines = [];
  let hasTitle = false;
  let hasShortTitle = false;

  for (const block of frontmatterBlocks) {
    const lines = block.split(/\r?\n/u);

    for (const line of lines) {
      if (/^title\s*:/u.test(line)) {
        if (!hasTitle) {
          outputLines.push(line);
          hasTitle = true;
        }
        continue;
      }

      if (/^short_title\s*:/u.test(line)) {
        if (!hasShortTitle) {
          outputLines.push(line);
          hasShortTitle = true;
        }
        continue;
      }

      outputLines.push(line);
    }
  }

  if (!hasTitle) {
    outputLines.unshift(`title: "${fallbackTitle.replace(/"/g, '\\"')}"`);
  }

  if (!hasShortTitle) {
    outputLines.unshift(`short_title: "${fallbackShortTitle.replace(/"/g, '\\"')}"`);
  }

  return `---\n${outputLines.filter(Boolean).join('\n')}\n---\n${body.replace(/^\n?/, '\n')}`;
}

async function main() {
  const files = await walkMarkdownFiles(interviewsRoot);
  let updatedCount = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath, '.md');
    const content = await fs.readFile(filePath, 'utf8');
    const { frontmatterBlocks } = parseFrontmatter(content);
    const frontmatterText = frontmatterBlocks.join('\n');
    const hasTitle = /^title\s*:/um.test(frontmatterText);
    const hasShortTitle = /^short_title\s*:/um.test(frontmatterText);
    const hasDuplicateFrontmatter = frontmatterBlocks.length > 1;

    if (hasTitle && hasShortTitle && !hasDuplicateFrontmatter) {
      continue;
    }

    const nextContent = normalizeFrontmatter(content, fileName, fileName);
    await fs.writeFile(filePath, nextContent, 'utf8');
    updatedCount += 1;
  }

  console.log(`Normalized frontmatter for ${updatedCount} interview markdown files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
