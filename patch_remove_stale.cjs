const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove loadStateFromApi("rates") and "trends"
code = code.replace(
  '    loadStateFromApi("rates", setRates, INITIAL_RATES);\n    loadStateFromApi("trends", setTrends, INITIAL_TRENDS);\n',
  ''
);

fs.writeFileSync('src/App.tsx', code);
