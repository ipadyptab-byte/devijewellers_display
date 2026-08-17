const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

code = code.replace(
  "    await db\n      .insert(globalState)\n      .values({ moduleName: module, data: req.body as any })\n      .onConflictDoUpdate({\n        target: globalState.moduleName,\n        set: { data: req.body as any, updatedAt: new Date() },\n      });",
  `    const existing = await db.select().from(globalState).where(sql\`module_name = \${module}\`).limit(1);
    if (existing.length > 0) {
      await db.update(globalState).set({ data: req.body as any, updatedAt: new Date() }).where(sql\`module_name = \${module}\`);
    } else {
      await db.insert(globalState).values({ moduleName: module, data: req.body as any });
    }`
);

fs.writeFileSync('src/api.ts', code);
