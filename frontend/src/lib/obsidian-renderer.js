// import { marked } from '../../thirdparty/marked.esm.js';
// import hljs from '../../thirdparty/highlight.min.js';
// import katex from '../../thirdparty/katex.mjs';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';
import hljs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js';
import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs';

// Подсветка кода
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
});

// ==текст==
const obsidianHighlight = {
  name: 'obsidianHighlight',
  level: 'inline',
  start(src) {
    return src.indexOf('==');
  },
  tokenizer(src) {
    const match = src.match(/^==([^=]+)==/);
    if (match) {
      return {
        type: 'obsidianHighlight',
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer(token) {
    return `<mark>${marked.parseInline(token.text)}</mark>`;
  },
};

// #тег
const obsidianTag = {
  name: 'obsidianTag',
  level: 'inline',
  start(src) {
    return src.indexOf('#');
  },
  tokenizer(src) {
    const match = src.match(/^#([a-zA-Z0-9_\-]+)/);
    if (match) {
      return {
        type: 'obsidianTag',
        raw: match[0],
        text: match[1],
      };
    }
  },
  renderer(token) {
    return `<span class="tag">#${token.text}</span>`;
  },
};

// [[заметка]]
const obsidianLink = {
  name: 'obsidianLink',
  level: 'inline',
  start(src) {
    return src.indexOf('[[');
  },
  tokenizer(src) {
    const match = src.match(/^\[\[([^\]]+)\]\]/);
    if (match) {
      return {
        type: 'obsidianLink',
        raw: match[0],
        text: match[1],
      };
    }
  },
  renderer(token) {
    const noteName = token.text;
    return `<a class="internal-link" href="#${encodeURIComponent(noteName)}">${noteName}</a>`;
  },
};

// Включение расширений
marked.use({ extensions: [obsidianHighlight, obsidianTag, obsidianLink] });

const applyStyles = () => {
  if (!document.getElementById('katex-styles')) {
    const link = document.createElement('link');
    link.id = 'katex-styles';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(link);
  }

  if (!document.getElementById('hljs-styles')) {
    const link = document.createElement('link');
    link.id = 'hljs-styles';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/default.min.css';
    document.head.appendChild(link);
  }
}

// Функция рендера
export async function renderObsidianMarkdown(markdownText, containerElement) {
  const latexBlocks = [];

  // Используем HTML-комментарии как "невидимые" плейсхолдеры
  const commentPlaceholder = (index) => `<!-- LATEX:${index} -->`;

  // Шаг 1: извлекаем блочные формулы $$...$$
  markdownText = markdownText.replace(/\$\$(.*?)\$\$/gs, (match, tex) => {
    latexBlocks.push({ type: 'block', content: tex });
    return commentPlaceholder(latexBlocks.length - 1);
  });

  // Шаг 2: извлекаем inline формулы $...$
  markdownText = markdownText.replace(/\$(.*?)\$/g, (match, tex) => {
    latexBlocks.push({ type: 'inline', content: tex });
    return commentPlaceholder(latexBlocks.length - 1);
  });

  // Шаг 3: парсим Markdown → HTML
  let html = marked.parse(markdownText);

  // Шаг 4: заменяем комментарии на рендер KaTeX
  html = html.replace(/<!-- LATEX:(\d+) -->/g, (match, index) => {
    const { type, content } = latexBlocks[parseInt(index)];
    try {
      return katex.renderToString(content.trim(), {
        displayMode: type === 'block',
        throwOnError: false,
      });
    } catch (e) {
      console.warn('KaTeX error:', e);
      const delim = type === 'block' ? '$$' : '$';
      return `<code class="katex-error">${delim}${content}${delim}</code>`;
    }
  });

  containerElement.innerHTML = html;

  applyStyles();
}

