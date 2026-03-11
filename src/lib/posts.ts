import { languages } from '../i18n/ui';

const langPattern = new RegExp(`^(${Object.keys(languages).join('|')})/`);

export function extractSlug(postId: string): string {
  return postId.replace(langPattern, '');
}
