const fs = require('fs');
let code = fs.readFileSync('src/components/TVDisplay.tsx', 'utf8');

code = code.replace(
`              />
            )}
          </div>
            {/* Soft dark gradient mask over rotating image to ensure text legibility */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}`,
`              />
            )}
            {/* Soft dark gradient mask over rotating image to ensure text legibility */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}`
);

fs.writeFileSync('src/components/TVDisplay.tsx', code);
