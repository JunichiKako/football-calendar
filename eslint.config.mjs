// ESLint 9 のフラット設定。Next.js 16 で `next lint` が廃止されたため、
// eslint を直接実行する構成に移行した。
// eslint-config-next は CommonJS で設定配列をそのまま default export する。
import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...coreWebVitals,
];

export default config;
