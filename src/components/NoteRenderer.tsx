import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Note } from '../types';
import { format } from 'date-fns';
import { Calendar, Tag, Clock, ArrowLeft, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { TableOfContents } from './TableOfContents';
import { SAMPLE_NOTES } from '../data/notes';
import { extractMarkdownHeadings, slugifyHeading } from '../lib/headings';
import { generatedInterviewResourceMap } from '../generated/interview-content.generated';

const IMAGE_FILE_EXTENSION_PATTERN = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;
const INTERNAL_NOTE_PROTOCOL = 'qgarden-note:';

function joinBaseUrl(relativePath: string) {
  return `${import.meta.env.BASE_URL}${relativePath.replace(/^\/+/, '')}`;
}

function normalizeAssetPath(value: string) {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
}

function resolveNoteAssetUrl(note: Note, assetPath: string) {
  const normalizedAssetPath = normalizeAssetPath(assetPath);

  if (!normalizedAssetPath) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(normalizedAssetPath) || normalizedAssetPath.startsWith('data:')) {
    return normalizedAssetPath;
  }

  if (!note.path.startsWith('interviews/')) {
    return normalizedAssetPath;
  }

  const noteRelativePath = note.path.replace(/^interviews\//, '');
  const noteDirectory = noteRelativePath.includes('/')
    ? noteRelativePath.slice(0, noteRelativePath.lastIndexOf('/'))
    : '';
  const candidateKeys = Array.from(new Set([
    normalizedAssetPath,
    noteDirectory ? `${noteDirectory}/${normalizedAssetPath}` : normalizedAssetPath,
  ]));

  for (const candidateKey of candidateKeys) {
    const mappedPath = generatedInterviewResourceMap[candidateKey];

    if (mappedPath) {
      return joinBaseUrl(mappedPath);
    }
  }

  return normalizedAssetPath.startsWith('_resources/')
    ? ''
    : normalizedAssetPath;
}

function isEmbeddedImageTarget(target: string) {
  const normalizedTarget = normalizeAssetPath(target.split('|')[0] ?? '');
  return IMAGE_FILE_EXTENSION_PATTERN.test(normalizedTarget) || normalizedTarget.includes('_resources/');
}

function processContent(content: string, note: Note) {
  const lines = content.split('\n');
  const processedLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      processedLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      processedLines.push(line);
      continue;
    }

    let processedLine = line.replace(/!\[\[([^[\]]+)\]\]/g, (match, rawTarget) => {
      if (!isEmbeddedImageTarget(rawTarget)) {
        return match;
      }

      const [assetTarget, altText] = rawTarget.split('|');
      const resolvedAssetUrl = resolveNoteAssetUrl(note, assetTarget);

      if (!resolvedAssetUrl) {
        return match;
      }

      const fallbackAltText = normalizeAssetPath(assetTarget).split('/').at(-1)?.replace(/\.[^.]+$/, '') ?? 'image';
      return `![${(altText ?? fallbackAltText).trim()}](${resolvedAssetUrl})`;
    });

    processedLine = processedLine.replace(/(?<!!)\[\[(.*?)\]\]/g, (match, rawTarget) => {
      const [noteTarget, customLabel] = rawTarget.split('|');
      const normalizedTarget = (noteTarget ?? '').trim();
      const label = (customLabel ?? normalizedTarget).trim();

      if (!normalizedTarget || !label) {
        return match;
      }

      return `[${label}](${INTERNAL_NOTE_PROTOCOL}${encodeURIComponent(normalizedTarget)})`;
    });

    processedLines.push(processedLine);
  }

  return processedLines.join('\n');
}

interface NoteRendererProps {
  note: Note;
  onNoteSelect: (id: string) => void;
}

function normalizeWikiLookupValue(value: string) {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, ' ');
}

function decodeInternalNoteTarget(href: string) {
  const encodedTarget = href.slice(INTERNAL_NOTE_PROTOCOL.length);

  try {
    return decodeURIComponent(encodedTarget);
  } catch {
    return encodedTarget;
  }
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({ note, onNoteSelect }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const processedContent = useMemo(() => processContent(note.content, note), [note.content, note]);
  const headingDefinitions = useMemo(() => extractMarkdownHeadings(processedContent), [processedContent]);
  const noteLookup = useMemo(() => {
    const normalizedCurrentNoteId = normalizeWikiLookupValue(note.id);
    const normalizedCurrentNoteTitle = normalizeWikiLookupValue(note.title);

    return {
      findByWikiTarget(target: string) {
        const normalizedTarget = normalizeWikiLookupValue(target.split('#')[0] ?? '');

        if (!normalizedTarget) {
          return null;
        }

        const byId = SAMPLE_NOTES.find((item) => normalizeWikiLookupValue(item.id) === normalizedTarget);
        if (byId) return byId;

        const byTitle = SAMPLE_NOTES.find((item) => normalizeWikiLookupValue(item.title) === normalizedTarget);
        if (byTitle) return byTitle;

        const byAlias = SAMPLE_NOTES.find((item) => item.aliases?.some((alias) => normalizeWikiLookupValue(alias) === normalizedTarget));
        if (byAlias) return byAlias;

        if (normalizedTarget === normalizedCurrentNoteId || normalizedTarget === normalizedCurrentNoteTitle) {
          return note;
        }

        return null;
      },
    };
  }, [note]);

  const HeadingRenderer = ({
    level,
    children,
    node,
  }: {
    level: number;
    children?: React.ReactNode;
    node?: { position?: { start?: { line?: number } } };
  }) => {
    const text = React.Children.toArray(children).join('').trim();
    const line = node?.position?.start?.line;
    const matchedHeading = headingDefinitions.find((heading) => (
      heading.level === level && heading.line === line
    ));
    const id = matchedHeading?.id ?? slugifyHeading(text);

    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return <Tag id={id}>{children}</Tag>;
  };

  const markdownComponents: Components = {
    h1: ({node, ...props}) => <HeadingRenderer level={1} node={node as { position?: { start?: { line?: number } } }} {...props} />,
    h2: ({node, ...props}) => <HeadingRenderer level={2} node={node as { position?: { start?: { line?: number } } }} {...props} />,
    h3: ({node, ...props}) => <HeadingRenderer level={3} node={node as { position?: { start?: { line?: number } } }} {...props} />,
    img: ({ src, alt, ...props }) => {
      const resolvedSrc = src ? resolveNoteAssetUrl(note, src) : '';

      if (!resolvedSrc) {
        return null;
      }

      return <img src={resolvedSrc} alt={alt ?? ''} referrerPolicy="no-referrer" {...props} />;
    },
    a: ({ href, children, ...props }) => {
      if (href?.startsWith(INTERNAL_NOTE_PROTOCOL)) {
        const wikiTarget = decodeInternalNoteTarget(href);
        const matchedNote = noteLookup.findByWikiTarget(wikiTarget);

        return (
          <a
            href={matchedNote ? '#' : undefined}
            onClick={(event) => {
              event.preventDefault();

              if (matchedNote) {
                onNoteSelect(matchedNote.id);
              }
            }}
            {...props}
          >
            {children}
          </a>
        );
      }

      return <a href={href} {...props}>{children}</a>;
    },
  };

  const relatedNotes = SAMPLE_NOTES
    .filter(n => n.id !== note.id && (n.category === note.category || n.tags.some(t => note.tags.includes(t))))
    .slice(0, 2);

  return (
    <div className="relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 z-50">
        <div 
          className="h-full bg-indigo-600 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[84rem] justify-center px-6 xl:pr-4">
        <div className="flex-1 max-w-3xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">{note.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80">
                  <Bookmark size={18} />
                </button>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {note.coverImage && (
              <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-100 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                <img
                  src={resolveNoteAssetUrl(note, note.coverImage)}
                  alt={`${note.title} cover`}
                  className="h-full max-h-[28rem] min-h-56 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <h1 className="reading-title text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-8 leading-tight">
              {note.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 border-y border-slate-100 py-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-300 dark:text-slate-500" />
                <span>发布于 {format(new Date(note.lastModified), 'yyyy年MM月dd日')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-300 dark:text-slate-500" />
                <span>阅读时间约 5 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-slate-300 dark:text-slate-500" />
                <div className="flex gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <article className="garden-prose prose prose-slate dark:prose-invert prose-indigo max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-[1.42rem] prose-h3:text-[1.18rem]
            prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-a:text-indigo-600 dark:prose-a:text-indigo-300 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
            prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-medium
            prose-pre:rounded-2xl prose-pre:p-6
            prose-img:rounded-[1.75rem] prose-img:shadow-[0_22px_60px_-34px_rgba(15,23,42,0.32)]
            prose-li:marker:text-indigo-400
            prose-hr:my-12
            prose-table:text-sm
          ">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </article>

          {/* Related Notes */}
          {relatedNotes.length > 0 && (
            <section className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-2">
                <ArrowRight size={20} className="text-indigo-500" />
                延伸阅读
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedNotes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => onNoteSelect(n.id)}
                    className="group rounded-2xl border border-slate-100 bg-white p-6 text-left transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800/80 dark:bg-slate-900/75 dark:hover:border-indigo-500/25 dark:hover:shadow-[0_20px_50px_-30px_rgba(79,70,229,0.22)]"
                  >
                    <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">{n.category}</div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">{n.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400">
                      <Calendar size={12} />
                      <span>{format(new Date(n.lastModified), 'yyyy-MM-dd')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                <ArrowLeft size={14} className="rotate-90" />
              </div>
              回到顶部
            </button>
            <div className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-400 dark:bg-slate-900 dark:text-slate-400">
              Vault Path: {note.path}
            </div>
          </footer>
        </div>

        {/* Desktop Sidebar TOC */}
        <TableOfContents headings={headingDefinitions} />
      </div>
    </div>
  );
};
