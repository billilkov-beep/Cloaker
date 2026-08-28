const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, '.next');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
function copy(src, dest){
  const st = fs.statSync(src);
  if(st.isDirectory()){
    fs.mkdirSync(dest, { recursive: true });
    for(const name of fs.readdirSync(src)) copy(path.join(src,name), path.join(dest,name));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
copy(path.join(root, 'public'), path.join(out, 'public'));
copy(path.join(root, 'sql'), path.join(out, 'sql'));
copy(path.join(root, 'data'), path.join(out, 'data'));
fs.copyFileSync(path.join(root, 'server.js'), path.join(out, 'server.js'));
fs.copyFileSync(path.join(root, 'package.json'), path.join(out, 'package.json'));
fs.writeFileSync(path.join(out, 'BUILD_OK.txt'), 'Cloakr V10.2 full real app build complete. Use server.js from root, or .next/server.js only if Hostinger entry is pointed there.\n');
console.log('Build completed: .next generated with V10 public files.');
