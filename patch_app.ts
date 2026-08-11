import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldFunc = `  const handleUpdateRates = (newRates: JewelleryRates) => {
    setRates(newRates);
    saveToStorage("rates", newRates);
    setDoc(
      doc(db, "system", "rates"),
      {
        ...newRates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    ).catch((err) => console.error("Firebase write error:", err));
  };`;

const newFunc = `  const handleUpdateRates = (newRates: JewelleryRates) => {
    setRates(newRates);
    saveToStorage("rates", newRates);
    
    // Also push directly to PostgreSQL backend
    fetch('/api/rates/manual_push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRates)
    }).catch(err => console.error("Failed to push manual rates to backend:", err));

    setDoc(
      doc(db, "system", "rates"),
      {
        ...newRates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    ).catch((err) => console.error("Firebase write error:", err));
  };`;

if (code.includes('doc(db, "system", "rates")')) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched src/App.tsx");
} else {
  console.log("Could not find the function to patch in App.tsx");
}
