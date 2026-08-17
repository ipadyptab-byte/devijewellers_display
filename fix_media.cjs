const fs = require('fs');
let code = fs.readFileSync('src/components/MediaManager.tsx', 'utf8');

const regex = /<span className="text-\[10px\] text-zinc-550">sec<\/span>\n                <\/div>\n              <\/div>/;

if (regex.test(code)) {
  code = code.replace(regex, `<span className="text-[10px] text-zinc-550">sec</span>\n                </div>\n              </div>\n              </div>`);
  fs.writeFileSync('src/components/MediaManager.tsx', code);
  console.log("Fixed closing tag!");
} else {
  console.log("Could not find regex!");
}

