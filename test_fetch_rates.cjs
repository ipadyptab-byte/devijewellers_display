const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will look at the `// Also fetch initial from backend` block in App.tsx
const index = code.indexOf("// Also fetch initial from backend");
console.log(code.substring(index, index + 1000));
