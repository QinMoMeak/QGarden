import { Note } from '../types';
import { generatedInterviewModules } from '../generated/interview-content.generated';

export const INTERVIEW_CATEGORY = '面试';
const INTERVIEW_ROOT_PREFIX = 'interviews';
const FALLBACK_UPDATED_AT = '2024-03-22T09:00:00Z';
const MAX_URL_SLUG_LENGTH = 32;

type Frontmatter = {
  title?: string;
  tags?: string[];
  date?: string;
  updated?: string;
  coverImage?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/[^a-z0-9\u4e00-\u9fa5/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function slugifyForUrl(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'note';
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function createStableInterviewId(relativePathWithoutExtension: string, title: string, fileName: string) {
  const slugSource = slugifyForUrl(fileName) || slugifyForUrl(title);
  const shortSlug = slugSource.slice(0, MAX_URL_SLUG_LENGTH) || 'note';
  const hash = hashString(relativePathWithoutExtension).slice(0, 8);

  return `iv-${shortSlug}-${hash}`;
}

function parseTags(rawValue: string) {
  const cleaned = rawValue.trim();

  if (!cleaned) return [];

  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    return cleaned
      .slice(1, -1)
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return cleaned
    .split(',')
    .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  if (!raw.startsWith('---')) {
    return { data: {}, content: raw.trim() };
  }

  const endIndex = raw.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { data: {}, content: raw.trim() };
  }

  const block = raw.slice(3, endIndex).trim();
  const content = raw.slice(endIndex + 4).trim();
  const data: Frontmatter = {};

  for (const line of block.split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!value) continue;

    if (key === 'tags') {
      data.tags = parseTags(value);
      continue;
    }

    if (key === 'title' || key === 'date' || key === 'updated' || key === 'coverImage') {
      data[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }

  return { data, content };
}

function extractTitle(content: string, fallback: string) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  return headingMatch?.[1]?.trim() || fallback;
}

function extractFolderTags(relativeSegments: string[]) {
  return relativeSegments
    .slice(0, -1)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function createInterviewNote(filePath: string, raw: string): Note {
  const relativePath = filePath.replace(/\\/g, '/');
  const relativePathWithoutExtension = relativePath.replace(/\.md$/i, '');
  const segments = relativePathWithoutExtension.split('/').filter(Boolean);
  const fileName = segments.at(-1) ?? relativePathWithoutExtension;
  const { data, content } = parseFrontmatter(raw);
  const title = data.title || extractTitle(content, fileName);
  const tags = Array.from(new Set([...(data.tags ?? []), ...extractFolderTags(segments)]));

  return {
    id: createStableInterviewId(relativePathWithoutExtension, title, fileName),
    title,
    content,
    path: `${INTERVIEW_ROOT_PREFIX}/${relativePathWithoutExtension}`,
    tags,
    lastModified: data.updated || data.date || FALLBACK_UPDATED_AT,
    category: INTERVIEW_CATEGORY,
    coverImage: data.coverImage,
  };
}

export const INTERVIEW_VAULT_NOTES: Note[] = generatedInterviewModules
  .filter(({ filePath }) => !filePath.split('/').some((segment) => segment.startsWith('_')))
  .map(({ filePath, raw }) => createInterviewNote(filePath, raw))
  .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));

export function isInterviewVaultNote(note: Note) {
  return note.path.startsWith(`${INTERVIEW_ROOT_PREFIX}/`);
}

export function getInterviewRelativeSegments(note: Note) {
  return note.path
    .replace(`${INTERVIEW_ROOT_PREFIX}/`, '')
    .split('/')
    .filter(Boolean);
}
