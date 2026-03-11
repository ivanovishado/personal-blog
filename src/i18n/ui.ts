export const languages = { en: 'English', es: 'Español' };
export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.tags': 'Tags',
    'nav.backToPortfolio': 'Back to Portfolio',
    'post.readMore': 'Read more',
    'post.publishedOn': 'Published on',
    'post.updatedOn': 'Updated on',
    'post.readingTime': 'Reading time',
    'post.minuteRead': 'min read',
    'post.minutesRead': 'min read',
    'post.tableOfContents': 'Table of Contents',
    'post.onThisPage': 'On this page',
    'post.tldr': 'TL;DR',
    'post.writtenBy': 'Written by',
    'post.taggedWith': 'Tagged with',
    'tags.title': 'Tags',
    'tags.postsTagged': 'Posts tagged with',
    'blog.title': 'Blog',
    'blog.description': 'Thoughts on software engineering, maybe will add more topics later.',
    'blog.allPosts': 'All Posts',
    'blog.latestPosts': 'Latest Posts',
    'common.language': 'Language',
    'common.switchToEs': 'Cambiar a Español',
    'common.switchToEn': 'Switch to English',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'rss.title': 'Ivan Galaviz Blog',
    'rss.description': 'Thoughts on software engineering, maybe will add more topics later.',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.blog': 'Blog',
    'nav.tags': 'Etiquetas',
    'nav.backToPortfolio': 'Volver al Portafolio',
    'post.readMore': 'Leer más',
    'post.publishedOn': 'Publicado el',
    'post.updatedOn': 'Actualizado el',
    'post.readingTime': 'Tiempo de lectura',
    'post.minuteRead': 'min de lectura',
    'post.minutesRead': 'min de lectura',
    'post.tableOfContents': 'Tabla de Contenidos',
    'post.onThisPage': 'En esta página',
    'post.tldr': 'TL;DR',
    'post.writtenBy': 'Escrito por',
    'post.taggedWith': 'Etiquetado con',
    'tags.title': 'Etiquetas',
    'tags.postsTagged': 'Posts etiquetados con',
    'blog.title': 'Blog',
    'blog.description': 'Reflexiones sobre ingeniería de software, quizás agregue más temas después.',
    'blog.allPosts': 'Todos los Posts',
    'blog.latestPosts': 'Últimos Posts',
    'common.language': 'Idioma',
    'common.switchToEs': 'Cambiar a Español',
    'common.switchToEn': 'Switch to English',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    'rss.title': 'Blog de Ivan Galaviz',
    'rss.description': 'Reflexiones sobre ingeniería de software, quizás agregue más temas después.',
  },
} as const;

export type UIKey = keyof typeof ui.en;

export function useTranslation(lang: keyof typeof ui) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function getLangFromUrl(url: URL): keyof typeof ui {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}
