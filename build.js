import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  const distDir = 'dist';
  const publicDir = 'public';
  const indexHtmlPath = path.join(publicDir, 'index.html');
  const distIndexHtmlPath = path.join(distDir, 'index.html');

  try {
    // Delete dist folder if it exists
    await fs.rm(distDir, { recursive: true, force: true }).catch(() => {});

    // Create dist folder
    await fs.mkdir(distDir, { recursive: true });
    console.log('Created dist folder');

    // Copy public/* to dist/*
    const files = await fs.readdir(publicDir);
    for (const file of files) {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      const stat = await fs.stat(srcPath);
      if (stat.isDirectory()) {
        await fs.cp(srcPath, destPath, { recursive: true });
      } else {
        await fs.copyFile(srcPath, destPath);
      }
      console.log(`Copied ${file} to dist`);
    }

    // Minify index.html (remove comments and whitespace)
    let html = await fs.readFile(distIndexHtmlPath, 'utf8');
    html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
    html = html.replace(/\s+/g, ' ').trim(); // Minify whitespace
    await fs.writeFile(distIndexHtmlPath, html, 'utf8');
    console.log('Minified index.html');

    console.log('Build complete. dist folder ready for production.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();