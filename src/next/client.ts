declare const __GIGGY_NEXT_BASE__: string;

// This module is only attached to Next's development browser entries.
if (typeof document !== 'undefined' && !document.getElementById('giggydev-next-loader')) {
  const script = document.createElement('script');
  script.id = 'giggydev-next-loader';
  script.type = 'module';
  script.src = `${__GIGGY_NEXT_BASE__}/__giggydev/client.js`;
  (document.head ?? document.documentElement).append(script);
}
