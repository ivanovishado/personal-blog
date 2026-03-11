import { getCollection } from 'astro:content';
import { languages } from '../../i18n/ui';
import { extractSlug } from '../../lib/posts';
import type { APIContext } from 'astro';

export async function getStaticPaths() {
  const langs = Object.keys(languages) as Array<'en' | 'es'>;
  const paths = [];

  for (const lang of langs) {
    const posts = await getCollection('blog', ({ data }) => {
      return data.lang === lang && !data.draft;
    });

    for (const post of posts) {
      const slug = extractSlug(post.id);
      paths.push({
        params: { lang, slug },
        props: { post },
      });
    }
  }

  return paths;
}

export async function GET(context: APIContext) {
  const { post } = context.props;
  const { title, description, pubDate, authors, tags, lang } = post.data;

  const frontmatter = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `pubDate: ${pubDate.toISOString().split('T')[0]}`,
    `authors: [${authors.map((a: string) => `"${a}"`).join(', ')}]`,
    `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]`,
    `lang: ${lang}`,
    '---',
  ].join('\n');

  const body = `${frontmatter}\n\n${post.body ?? ''}`;
  const tokenEstimate = Math.ceil(body.length / 4);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Markdown-Tokens': String(tokenEstimate),
    },
  });
}
