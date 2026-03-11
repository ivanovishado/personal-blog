import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const header = [
    '# Ivan Galaviz Blog',
    '',
    '> Thoughts on software engineering',
    '',
  ].join('\n');

  const postSections = sorted.map((post) => {
    return `## ${post.data.title}\n\n${post.body ?? ''}`;
  });

  const body = header + '\n' + postSections.join('\n\n---\n\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
