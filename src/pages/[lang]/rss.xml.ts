import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { languages, useTranslation } from '../../i18n/ui';
import { extractSlug } from '../../lib/posts';
import type { APIContext } from 'astro';

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as 'en' | 'es';
  const t = useTranslation(lang);

  const posts = await getCollection('blog', ({ data }) => {
    return data.lang === lang && !data.draft;
  });

  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: t('rss.title'),
    description: t('rss.description'),
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${lang}/${extractSlug(post.id)}/`,
    })),
    customData: `<language>${lang}</language>`,
  });
}
