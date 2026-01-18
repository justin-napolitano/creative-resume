import { siteConfig } from '@/config';

export const prerender = true;

export function GET() {
  const body = JSON.stringify(
    {
      name: siteConfig.siteTitle,
      short_name: 'Resume',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      description: siteConfig.siteDescription,
      background_color: '#fdfbf7',
      theme_color: '#0f7c66',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    null,
    2,
  );

  return new Response(body, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
