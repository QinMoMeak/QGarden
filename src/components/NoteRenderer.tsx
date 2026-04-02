import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Note } from '../types';
import { format } from 'date-fns';
import { Calendar, Tag, Clock, ArrowLeft, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { TableOfContents } from './TableOfContents';
import { SAMPLE_NOTES } from '../data/notes';

interface NoteRendererProps {
  note: Note;
  onNoteSelect: (id: string) => void;
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

  // Simple wikilink replacement: [[Link Name]] -> [Link Name](#)
  const processContent = (content: string) => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      return `[${p1}](#)`;
    });
  };

  // Custom heading renderer to add IDs for TOC
  const HeadingRenderer = ({ level, children }: { level: number, children?: React.ReactNode }) => {
    const text = React.Children.toArray(children).join('');
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return <Tag id={id}>{children}</Tag>;
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

      <div className="max-w-7xl mx-auto flex justify-center px-6">
        <div className="flex-1 max-w-3xl py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">{note.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
                  <Bookmark size={18} />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-8 leading-tight">
              {note.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-300 dark:text-slate-600" />
                <span>发布于 {format(new Date(note.lastModified), 'yyyy年MM月dd日')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-300 dark:text-slate-600" />
                <span>阅读时间约 5 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-slate-300 dark:text-slate-600" />
                <div className="flex gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <article className="prose prose-slate dark:prose-invert prose-indigo max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/30 dark:prose-blockquote:bg-indigo-900/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
            prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-medium
            prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:shadow-2xl prose-pre:rounded-2xl prose-pre:p-6
            prose-img:rounded-2xl prose-img:shadow-lg
            prose-li:marker:text-indigo-400
          ">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({node, ...props}) => <HeadingRenderer level={1} {...props} />,
                h2: ({node, ...props}) => <HeadingRenderer level={2} {...props} />,
                h3: ({node, ...props}) => <HeadingRenderer level={3} {...props} />,
              }}
            >
              {processContent(note.content)}
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
                    className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left group"
                  >
                    <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">{n.category}</div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">{n.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
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
              className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                <ArrowLeft size={14} className="rotate-90" />
              </div>
              回到顶部
            </button>
            <div className="text-slate-400 dark:text-slate-500 text-xs font-mono bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full">
              Vault Path: {note.path}
            </div>
          </footer>
        </div>

        {/* Desktop Sidebar TOC */}
        <TableOfContents content={note.content} />
      </div>
    </div>
  );
};
