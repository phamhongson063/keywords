const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'sw.js');
const indexPath = path.join(__dirname, 'index.html');
const manifestPath = path.join(__dirname, 'manifest.json');

function getCurrentVersion() {
  const swContent = fs.readFileSync(swPath, 'utf8');
  const match = swContent.match(/const CACHE_VERSION = ['"]([^'"]+)['"]/);
  if (match) {
    let version = match[1];
    if (version.startsWith('v')) {
      version = version.substring(1);
    }
    return version;
  }
  return null;
}

function incrementVersion(version, type = 'patch') {
  const parts = version.split('.').map(Number);
  
  if (type === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === 'minor') {
    parts[1]++;
    parts[2] = 0;
  } else {
    parts[2]++;
  }
  
  return parts.join('.');
}

function updateVersion(newVersion) {
  const versionWithV = `v${newVersion}`;
  
  // Update sw.js
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(
    /const CACHE_VERSION = ['"][^'"]+['"]/,
    `const CACHE_VERSION = '${versionWithV}'`
  );
  swContent = swContent.replace(
    /const CACHE_NAME = `[^`]+`/,
    `const CACHE_NAME = \`hoc-tu-vung-${versionWithV}\``
  );
  fs.writeFileSync(swPath, swContent, 'utf8');
  
  // Update index.html
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = indexContent.replace(
    /\.register\(["']\.\/sw\.js\?version=[^"']+["']/,
    `.register("./sw.js?version=${newVersion}"`
  );
  indexContent = indexContent.replace(
    /<title>MyBôk v[^<]+<\/title>/,
    `<title>MyBôk ${versionWithV}</title>`
  );
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  
  console.log(`✅ Version updated to ${versionWithV}`);
  console.log(`   - sw.js: CACHE_VERSION = '${versionWithV}'`);
  console.log(`   - index.html: sw.js?version=${newVersion}`);
  console.log(`   - index.html: title = MyBôk ${versionWithV}`);
}

const args = process.argv.slice(2);
const type = args[0] || 'patch';

const currentVersion = getCurrentVersion();
if (!currentVersion) {
  console.error('❌ Could not find current version in sw.js');
  process.exit(1);
}

const newVersion = incrementVersion(currentVersion, type);
updateVersion(newVersion);

console.log(`\n📦 Version bumped: ${currentVersion} → ${newVersion}`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review the changes`);
console.log(`   2. Commit: git add sw.js index.html && git commit -m "Bump version to ${newVersion}"`);
console.log(`   3. Push: git push`);

