import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, FileText, Folder, FolderTree, PanelLeft, Sparkles } from 'lucide-react';
import { Note } from '../types';
import { cn } from '../lib/utils';
import { getInterviewRelativeSegments } from '../data/interviewNotes';

interface InterviewDirectoryViewProps {
  notes: Note[];
  onNoteSelect: (id: string) => void;
}

interface FolderNode {
  id: string;
  name: string;
  fullPath: string;
  children: FolderNode[];
  notes: Note[];
}

function createFolderNode(name: string, fullPath: string): FolderNode {
  return {
    id: fullPath || 'root',
    name,
    fullPath,
    children: [],
    notes: [],
  };
}

function buildFolderTree(notes: Note[]) {
  const root = createFolderNode('面试逐字稿', '');

  for (const note of notes) {
    const segments = getInterviewRelativeSegments(note);
    const folderSegments = segments.slice(0, -1);
    let currentNode = root;

    for (const segment of folderSegments) {
      let nextNode = currentNode.children.find((child) => child.name === segment);
      if (!nextNode) {
        const fullPath = currentNode.fullPath ? `${currentNode.fullPath}/${segment}` : segment;
        nextNode = createFolderNode(segment, fullPath);
        currentNode.children.push(nextNode);
        currentNode.children.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
      }
      currentNode = nextNode;
    }

    currentNode.notes.push(note);
    currentNode.notes.sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'));
  }

  return root;
}

function findFolder(node: FolderNode, folderPath: string): FolderNode | null {
  if (node.fullPath === folderPath) return node;

  for (const child of node.children) {
    const found = findFolder(child, folderPath);
    if (found) return found;
  }

  return null;
}

function collectNotes(node: FolderNode): Note[] {
  return [
    ...node.notes,
    ...node.children.flatMap((child) => collectNotes(child)),
  ];
}

function getRelativeFileLabel(note: Note, folderPath: string) {
  const fullPath = getInterviewRelativeSegments(note).join('/');
  if (!folderPath) return fullPath;
  return fullPath.replace(`${folderPath}/`, '');
}

function getPreview(content: string) {
  const preview = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .slice(0, 2)
    .join(' ');

  return preview || '点击查看逐字稿详情';
}

function countNotes(node: FolderNode) {
  return collectNotes(node).length;
}

interface FolderTreeItemProps {
  node: FolderNode;
  activeFolderPath: string;
  onSelect: (folderPath: string) => void;
  level?: number;
}

function FolderTreeItem({
  node,
  activeFolderPath,
  onSelect,
  level = 0,
}: FolderTreeItemProps) {
  return (
    <div>
      <button
        onClick={() => onSelect(node.fullPath)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
          activeFolderPath === node.fullPath
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:bg-indigo-500 dark:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
        )}
        style={{ paddingLeft: `${level * 14 + 12}px` }}
      >
        <span className="flex items-center gap-2">
          <Folder size={16} className={activeFolderPath === node.fullPath ? 'text-white' : 'text-indigo-500 dark:text-indigo-300'} />
          {node.name}
        </span>
        <span className={cn('text-xs', activeFolderPath === node.fullPath ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500')}>
          {countNotes(node)}
        </span>
      </button>

      {node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              activeFolderPath={activeFolderPath}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function InterviewDirectoryView({
  notes,
  onNoteSelect,
}: InterviewDirectoryViewProps) {
  const folderTree = useMemo(() => buildFolderTree(notes), [notes]);
  const initialFolderPath = folderTree.children[0]?.fullPath ?? '';
  const [activeFolderPath, setActiveFolderPath] = useState(initialFolderPath);

  useEffect(() => {
    if (!findFolder(folderTree, activeFolderPath)) {
      setActiveFolderPath(initialFolderPath);
    }
  }, [activeFolderPath, folderTree, initialFolderPath]);

  const activeFolder = useMemo(
    () => findFolder(folderTree, activeFolderPath) ?? folderTree,
    [activeFolderPath, folderTree]
  );

  const visibleNotes = useMemo(() => collectNotes(activeFolder), [activeFolder]);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/72 dark:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.92)]">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <PanelLeft size={16} className="text-indigo-500" />
          文件夹目录
        </div>

        <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs leading-6 text-slate-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-slate-300">
          把 Obsidian 的面试文件夹直接复制到
          <span className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-indigo-600 dark:bg-slate-950 dark:text-indigo-200">
            src/content/interviews
          </span>
          即可。
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setActiveFolderPath('')}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
              activeFolderPath === ''
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:bg-indigo-500 dark:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
            )}
          >
            <span className="flex items-center gap-2">
              <FolderTree size={16} className={activeFolderPath === '' ? 'text-white' : 'text-indigo-500 dark:text-indigo-300'} />
              全部逐字稿
            </span>
            <span className={cn('text-xs', activeFolderPath === '' ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500')}>
              {countNotes(folderTree)}
            </span>
          </button>

          {folderTree.children.map((node) => (
            <FolderTreeItem
              key={node.id}
              node={node}
              activeFolderPath={activeFolderPath}
              onSelect={setActiveFolderPath}
            />
          ))}
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white/80 p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/72 dark:shadow-[0_30px_80px_-46px_rgba(15,23,42,0.94)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-indigo-500 dark:text-indigo-300">
            <FolderTree size={14} />
            面试逐字稿
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {activeFolder.fullPath || '全部文件夹'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                左侧只展示文件夹结构，右侧展示当前文件夹下的逐字稿文件，风格参考 Obsidian 文件目录。
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <Sparkles size={14} className="text-indigo-500" />
              {visibleNotes.length} 篇文件
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {visibleNotes.length > 0 ? (
            visibleNotes.map((note, index) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onNoteSelect(note.id)}
                className="group flex w-full items-start justify-between rounded-[26px] border border-slate-200 bg-white/80 p-5 text-left shadow-[0_20px_60px_-42px_rgba(15,23,42,0.12)] transition-all hover:border-indigo-200 hover:shadow-[0_24px_60px_-38px_rgba(99,102,241,0.18)] dark:border-slate-800/80 dark:bg-slate-900/72 dark:shadow-[0_26px_80px_-46px_rgba(15,23,42,0.95)] dark:hover:border-indigo-500/25 dark:hover:shadow-[0_28px_70px_-42px_rgba(79,70,229,0.28)]"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/12 dark:text-indigo-300">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {note.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                        {getRelativeFileLabel(note, activeFolder.fullPath)}
                      </div>
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    {getPreview(note.content)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {note.tags.slice(0, 4).map((tag) => (
                      <span
                        key={`${note.id}-${tag}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-950 dark:text-slate-300 dark:group-hover:bg-indigo-500">
                  <ChevronRight size={18} />
                </div>
              </motion.button>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              当前文件夹下还没有 Markdown 文件。
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
