import { getCollection } from 'astro:content';
import { extractSlug } from '../lib/posts';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const enPosts = sorted.filter((p) => p.data.lang === 'en');
  const esPosts = sorted.filter((p) => p.data.lang === 'es');

  const formatPost = (post: (typeof sorted)[number]) => {
    const slug = extractSlug(post.id);
    const lang = post.data.lang;
    return `- [${post.data.title}](${context.site}${lang}/${slug}.md): ${post.data.description}`;
  };

  const lines = [
    '# Ivan Galaviz Blog',
    '',
    '> Thoughts on software engineering',
    '',
    '## English Posts',
    '',
    ...enPosts.map(formatPost),
    '',
    '## Spanish Posts (Español)',
    '',
    ...esPosts.map(formatPost),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
