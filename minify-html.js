import { minify } from 'html-minifier';
import { readFile, writeFile } from 'fs/promises';

try {
  const html = await readFile('dist/index.html', 'utf8');
  const minified = minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true
  });
  await writeFile('dist/index.html', minified, 'utf8');
  console.log('index.html minified successfully');
} catch (error) {
  console.error('Error minifying index.html:', error);
  process.exit(1);
}