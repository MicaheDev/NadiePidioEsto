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
import { visit } from 'unist-util-visit';

const remarkEmbedder = fauxRemarkEmbedder.default;
const oembedTransformer = fauxOembedTransformer.default;

/**
 * Plugin de Rehype para reescribir las rutas de las imágenes relativas
 * @param {Object} options - Contiene contentType y slug
 */
function rehypeRewriteImagePaths(options) {
  const { contentType, slug } = options;
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties && node.properties.src) {
        const src = node.properties.src;
        // Si no es una URL externa ni absoluta, reescribe la ruta
        const isExternal = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//');
        const isAbsolute = src.startsWith('/');

        if (!isExternal && !isAbsolute) {
          // Limpia la ruta por si viene con './'
          const cleanSrc = src.replace(/^\.\//, '');
          node.properties.src = `/content/src/content/${contentType}/${slug}/${cleanSrc}`;
        }
      }
    });
  };
}

/**
 * Obtiene el contenido HTML y metadatos de una lección específica.
 * @param {'courses' | 'tutorials'} contentType - Tipo de contenido
 * @param {string} slug - ID o carpeta del curso/tutorial
 * @param {string} lessonId - ID del archivo de la lección (sin extensión .md)
 */
export async function getLessonData(contentType, slug, lessonId) {
  const filePath = path.join(process.cwd(), 'src/content', contentType, slug, `${lessonId}.md`);
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
    // 5. Reescribir rutas de imágenes relativas para vite-plugin-static-copy
    .use(rehypeRewriteImagePaths, { contentType, slug })
    // 6. Transformar bloques de código con syntax highlighting
    .use(rehypeStarryNight)
    // 7. Convertir bloques math a KaTeX (HTML)
    .use(rehypeKatex)
    // 8. Generar HTML final en string
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdownContent);

  return {
    metadata,
    htmlContent: String(processed)
  };
}

/**
 * Obtiene la lista de carpetas (cursos o tutoriales existentes).
 * @param {'courses' | 'tutorials'} contentType 
 */
export async function getCollectionList(contentType) {
  const dirPath = path.join(process.cwd(), 'src/content', contentType);
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory()).map(dir => dir.name);
  } catch (error) {
    return [];
  }
}

/**
 * Obtiene la lista de lecciones (.md) de un curso o tutorial específico.
 * @param {'courses' | 'tutorials'} contentType 
 * @param {string} slug 
 */
export async function getLessonsList(contentType, slug) {
  const dirPath = path.join(process.cwd(), 'src/content', contentType, slug);
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    return [];
  }
}