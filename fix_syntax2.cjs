const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
`            />
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 text-right">`,
`            />
          )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 text-right">`
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
