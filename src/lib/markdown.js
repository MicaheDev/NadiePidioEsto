import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStarryNight from 'rehype-starry-night';
import rehypeStringify from 'rehype-stringify';
import fauxRemarkEmbedder from '@remark-embedder/core';
import fauxOembedTransformer from '@remark-embedder/transformer-oembed';

const remarkEmbedder = fauxRemarkEmbedder.default;
const oembedTransformer = fauxOembedTransformer.default;

export async function getLessonData(courseId, lessonId) {
  const filePath = path.join(process.cwd(), 'src/content', courseId, `${lessonId}.md`);
  const rawFile = await fs.readFile(filePath, 'utf-8');

  const { data: metadata, content: markdownContent } = matter(rawFile);

  const processed = await unified()
    // 1. Parsear Markdown
    .use(remarkParse)
    // 2. Soportar sintaxis matemática ($...$ y $$...$$)
    .use(remarkMath)
    // 3. Embeber recursos como vídeos de YouTube
    .use(remarkEmbedder, { transformers: [oembedTransformer] })
    // 4. Transformar el AST de Markdown (Remark) a HTML (Rehype)
    .use(remarkRehype, { allowDangerousHtml: true })
    // 5. Transformar bloques de código con syntax highlighting
    .use(rehypeStarryNight)
    // 6. Convertir bloques math a KaTeX (HTML)
    .use(rehypeKatex)
    // 7. Generar HTML final en string
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdownContent);

  return {
    metadata,
    htmlContent: String(processed)
  };
}