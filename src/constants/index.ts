import type { Snippet, SnippetColor } from '@/types';

export const SNIPPET_COLORS: SnippetColor[] = [
  'blue',
  'purple',
  'pink',
  'green',
  'orange',
  'gray',
];

export const COLOR_LABELS: Record<SnippetColor, string> = {
  blue: 'ブルー',
  purple: 'パープル',
  pink: 'ピンク',
  green: 'グリーン',
  orange: 'オレンジ',
  gray: 'グレー',
};

export const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: '1',
    label: 'メールアドレス',
    content: 'example@mail.com',
    color: 'blue',
  },
  {
    id: '2',
    label: 'あいさつ',
    content: 'いつもお世話になっております。',
    color: 'green',
  },
  {
    id: '3',
    label: '笑顔の顔文字',
    content: '(❁´◡`❁)',
    color: 'pink',
  },
  {
    id: '4',
    label: '郵便番号',
    content: '123-4567',
    color: 'orange',
  },
  {
    id: '5',
    label: '完了フレーズ',
    content: 'ご確認のほど、よろしくお願いいたします。',
    color: 'purple',
  },
];

export const STORAGE_KEYS = {
  SNIPPETS: 'copipochi_v4_snippets',
  THEME: 'copipochi_theme',
  GUEST_SNIPPETS: 'copipochi_guest_snippets',
} as const;

export const AUTH_CONFIG = {
  GOOGLE_SCOPES: ['email', 'profile'],
  REDIRECT_URL: window.location.origin,
} as const;
