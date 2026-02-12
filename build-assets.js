import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure output directories exist
function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

// Remove sourcemap comments
function stripSourceMapComments(content) {
  return content
    .replace(/\/\*# sourceMappingURL=.*\*\//g, '')
    .replace(/\/\/# sourceMappingURL=.*/g, '')
    .trim();
}

// Combine files
function combineFiles(inputFiles, outputFile) {
  console.log(`📦 Combining ${inputFiles.length} files → ${outputFile}`);
  const combined = inputFiles
    .map(file => stripSourceMapComments(readFileSync(file, 'utf8')))
    .join('\n');
  ensureDir(outputFile);
  writeFileSync(outputFile, combined);
  console.log(`✅ Created ${outputFile}`);
}

// Copy files
function copyFile(input, output) {
  console.log(`📄 Copying ${input} → ${output}`);
  let content = readFileSync(input, 'utf8');
  content = stripSourceMapComments(content);
  ensureDir(output);
  writeFileSync(output, content);
  console.log(`✅ Copied ${output}`);
}

console.log('\n🚀 Building assets...\n');

// CSS files - output to src/assets/vendor for Vite imports
copyFile('public/static/assets/css/vendors.min.css', 'src/assets/vendor/css/vendors.min.css');
copyFile('public/static/assets/css/app.min.css', 'src/assets/vendor/css/app.min.css');
copyFile('public/static/assets/css/custom.css', 'src/assets/vendor/css/custom.css')

combineFiles(
  [
    'public/static/assets/js/vendors.min.js',
  ],
  'src/assets/vendor/js/vendors.js'
);

combineFiles(
  [
    'public/static/assets/js/app.js',
  ],
  'src/assets/vendor/js/app.js'
);

combineFiles(
  [
    'public/static/assets/js/config.js'
  ],
  'src/assets/vendor/js/config.js'
)

console.log('\n✨ Assets built successfully!\n');