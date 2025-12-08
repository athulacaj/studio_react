import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

console.log("Starting rename...");

try {
    if (fs.existsSync(srcDir)) {
        const files = getAllFiles(srcDir);
        files.forEach(file => {
            if (file.endsWith('.jsx')) {
                fs.renameSync(file, file.replace(/\.jsx$/, '.tsx'));
                console.log(`Renamed: ${file}`);
            } else if (file.endsWith('.js')) {
                 fs.renameSync(file, file.replace(/\.js$/, '.ts'));
                 console.log(`Renamed: ${file}`);
            }
        });
    } else {
        console.error("src dir not found");
    }

    // Rename vite.config.js
    const viteConfig = path.join(rootDir, 'vite.config.js');
    if (fs.existsSync(viteConfig)) {
        fs.renameSync(viteConfig, viteConfig.replace('.js', '.ts'));
        console.log('Renamed vite.config.js');
    }
} catch(e) {
    console.error(e);
}
console.log("Done.");
