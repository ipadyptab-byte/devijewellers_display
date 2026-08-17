const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /    socket\.on\("state_update", \(\{ module, data \}\) => \{\n      const payload = data\.payload !== undefined \? data\.payload : data;\n      switch \(module\) \{/;

const replacement = `    socket.on("state_update", ({ module, data }) => {
      const payload = data.payload !== undefined ? data.payload : data;
      
      // Update local storage so any future page refresh gets this new value immediately synchronously!
      try {
        window.localStorage.setItem(\`asm_\${module}\`, JSON.stringify(payload));
      } catch (e) {}

      switch (module) {`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched state_update!");
} else {
  console.log("Failed to patch state_update!");
}
