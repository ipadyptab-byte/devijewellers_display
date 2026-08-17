const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
    'className={`font-poppins font-bold uppercase tracking-widest leading-none silver-gradient whitespace-nowrap shrink-0`}',
    'className={`font-poppins font-bold uppercase tracking-widest leading-none whitespace-nowrap shrink-0`}'
);

code = code.replace(
    '{item.label} <span className="text-[0.45em] normal-case font-medium tracking-normal opacity-90">Rate per kg</span>',
    '<span className="silver-gradient">{item.label}</span> <span className="text-[0.45em] normal-case font-medium tracking-normal opacity-90 silver-gradient">Rate per kg</span>'
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
