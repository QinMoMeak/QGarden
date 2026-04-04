export interface ParsedHeading {
  id: string;
  text: string;
  level: number;
  line: number;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

export function createUniqueHeadingId(text: string, seenIds: Map<string, number>) {
  const slug = slugifyHeading(text);
  const duplicateCount = seenIds.get(slug) ?? 0;
  seenIds.set(slug, duplicateCount + 1);

  return duplicateCount === 0
    ? slug
    : `${slug}-${duplicateCount + 1}`;
}

export function extractMarkdownHeadings(content: string): ParsedHeading[] {
  const seenIds = new Map<string, number>();
  const headings: ParsedHeading[] = [];
  let inCodeBlock = false;

  content.split('\n').forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) return;

    const match = line.match(/^(#{1,3})\s+(.*)/);
    if (!match) return;

    const level = match[1].length;
    const text = match[2].trim();
    const id = createUniqueHeadingId(text, seenIds);
    headings.push({ id, text, level, line: index + 1 });
  });

  return headings;
}
