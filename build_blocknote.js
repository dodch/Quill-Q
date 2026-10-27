const esbuild = require('esbuild');

async function build() {
  console.log('Building BlockNote React + Mantine bundle...');
  await esbuild.build({
    entryPoints: ['src/blocknote-entry.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'BlockNoteReactModule',
    outfile: 'libs/blocknote-react.bundle.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    conditions: ['style', 'import', 'module', 'browser', 'default'],
    loader: {
      '.css': 'css'
    }
  });
  console.log('Build complete! Output: libs/blocknote-react.bundle.js and libs/blocknote-react.bundle.css');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
