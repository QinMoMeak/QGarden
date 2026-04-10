import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, 'src', 'content', 'interviews');
const outputFile = path.join(projectRoot, 'src', 'generated', 'interview-content.generated.ts');
const publicResourcesRoot = path.join(projectRoot, 'public', 'interview-resources');

async function walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue;
      files.push(...await walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function walkResourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walkResourceFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

async function generateManifest() {
  const markdownFiles = await walkMarkdownFiles(contentRoot);
  const records = [];
  const resourceMap = {};

  await fs.mkdir(publicResourcesRoot, { recursive: true });

  for (const fullPath of markdownFiles) {
    const raw = await fs.readFile(fullPath, 'utf8');
    const relativePath = path
      .relative(contentRoot, fullPath)
      .split(path.sep)
      .join('/');

    records.push({
      filePath: relativePath,
      raw,
    });
  }

  const allFiles = await walkResourceFiles(contentRoot);
  const resourceFiles = allFiles.filter((fullPath) => fullPath.split(path.sep).includes('_resources'));

  for (const fullPath of resourceFiles) {
    const relativePath = path
      .relative(contentRoot, fullPath)
      .split(path.sep)
      .join('/');
    const extension = path.extname(fullPath);
    const outputName = `${hashString(relativePath)}${extension.toLowerCase()}`;
    const outputPath = path.join(publicResourcesRoot, outputName);

    await fs.copyFile(fullPath, outputPath);
    resourceMap[relativePath] = `interview-resources/${outputName}`;
  }

  records.sort((left, right) => left.filePath.localeCompare(right.filePath, 'zh-CN'));

  const fileContent = `export interface GeneratedInterviewModule {
  filePath: string;
  raw: string;
}

export const generatedInterviewModules: GeneratedInterviewModule[] = ${JSON.stringify(records, null, 2)};\n`;

  const resourceContent = `\nexport const generatedInterviewResourceMap: Record<string, string> = ${JSON.stringify(resourceMap, null, 2)};\n`;

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${fileContent}${resourceContent}`, 'utf8');
}

generateManifest().catch((error) => {
  console.error('Failed to generate interview manifest.');
  console.error(error);
  process.exitCode = 1;
});
