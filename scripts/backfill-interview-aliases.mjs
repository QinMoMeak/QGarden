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
  const match = content.match(blockPattern);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
  };
}

function parseYamlListValue(rawValue) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [trimmed.replace(/^['"]|['"]$/g, '')].filter(Boolean);
}

function extractAliases(frontmatter) {
  const aliases = [];
  const lines = frontmatter.split(/\r?\n/u);
  let inAliases = false;

  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    const key = separatorIndex === -1 ? null : line.slice(0, separatorIndex).trim();
    const listItemMatch = line.match(/^\s*-\s+(.+)$/u);

    if (key === 'aliases') {
      const value = line.slice(separatorIndex + 1).trim();
      aliases.push(...parseYamlListValue(value));
      inAliases = true;
      continue;
    }

    if (listItemMatch && inAliases) {
      aliases.push(listItemMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }

    if (key && key !== 'aliases') {
      inAliases = false;
    }
  }

  return aliases.filter(Boolean);
}

function stringifyAliases(aliases) {
  if (!aliases.length) {
    return [];
  }

  return [
    'aliases:',
    ...aliases.map((alias) => `  - "${alias.replace(/"/g, '\\"')}"`),
  ];
}

function updateFrontmatter(content, desiredAliases) {
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    return content;
  }

  const lines = frontmatter.split(/\r?\n/u);
  const outputLines = [];
  let activeListKey = null;
  let insertedAliases = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const separatorIndex = line.indexOf(':');
    const key = separatorIndex === -1 ? null : line.slice(0, separatorIndex).trim();
    const listItemMatch = line.match(/^\s*-\s+/u);

    if (key === 'aliases') {
      if (!insertedAliases) {
        outputLines.push(...stringifyAliases(desiredAliases));
        insertedAliases = true;
      }
      activeListKey = 'aliases';
      continue;
    }

    if (listItemMatch && activeListKey === 'aliases') {
      continue;
    }

    if (key && key !== 'aliases') {
      if (!insertedAliases && key === 'title') {
        outputLines.push(line);
        outputLines.push(...stringifyAliases(desiredAliases));
        insertedAliases = true;
        activeListKey = null;
        continue;
      }

      activeListKey = null;
    }

    outputLines.push(line);
  }

  if (!insertedAliases) {
    outputLines.push(...stringifyAliases(desiredAliases));
  }

  return `---\n${outputLines.filter(Boolean).join('\n')}\n---\n${body.replace(/^\n?/, '\n')}`;
}

async function main() {
  const files = await walkMarkdownFiles(interviewsRoot);
  let updatedCount = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath, '.md');
    const content = await fs.readFile(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(content);

    if (!frontmatter) {
      continue;
    }

    const titleMatch = frontmatter.match(/^title\s*:\s*(.+)$/mu);
    const shortTitleMatch = frontmatter.match(/^short_title\s*:\s*(.+)$/mu);

    if (!titleMatch || !shortTitleMatch) {
      continue;
    }

    const title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const shortTitle = shortTitleMatch[1].trim().replace(/^['"]|['"]$/g, '');

    if (!title || !shortTitle || title === shortTitle) {
      continue;
    }

    const existingAliases = extractAliases(frontmatter);

    const desiredAliases = Array.from(new Set([title, shortTitle, ...existingAliases].map((item) => item.trim()).filter(Boolean)));
    const nextContent = updateFrontmatter(content, desiredAliases);

    if (nextContent !== content) {
      await fs.writeFile(filePath, nextContent, 'utf8');
      updatedCount += 1;
    }
  }

  console.log(`Backfilled aliases for ${updatedCount} interview markdown files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
