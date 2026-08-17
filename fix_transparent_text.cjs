const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

// Fix gold
code = code.replace(
    /<h3\s+className="([^"]*)gold-gradient([^"]*)"([^>]*)>\s*\{item\.label\}\s*<span className="([^"]*)">Rate per 10 gms<\/span>\s*<\/h3>/g,
    `<h3\n  className="$1$2"\n$3\n>\n  <span className="gold-gradient">{item.label}</span>\n  <span className="$4 gold-gradient"> Rate per 10 gms</span>\n</h3>`
);

// Fix silver
code = code.replace(
    /<h3\s+className="([^"]*)silver-gradient([^"]*)"([^>]*)>\s*\{item\.label\}\s*<span className="([^"]*)">Rate per kg<\/span>\s*<\/h3>/g,
    `<h3\n  className="$1$2"\n$3\n>\n  <span className="silver-gradient">{item.label}</span>\n  <span className="$4 silver-gradient"> Rate per kg</span>\n</h3>`
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
