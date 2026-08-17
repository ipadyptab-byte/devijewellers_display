const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import { doc, setDoc, getDoc, onSnapshot } from "firebase\/firestore";\n/, '');
code = code.replace(/import { db, auth } from "\.\/lib\/firebase";\n/, '');

// Remove the onSnapshot block for history
const historySnapshotBlock = /\s*\/\/ Listen to Firestore for history[\s\S]*?unsubscribeHistory\(\);\n\s*};\n\s*}, \[\]\);/
code = code.replace(historySnapshotBlock, '');

// Remove setDoc for rates
const setDocRates = /\s*setDoc\([\s\S]*?firebase write error.*?\n/i;
code = code.replace(setDocRates, '');

// Remove setDoc for history
const setDocHistory = /\s*setDoc\([\s\S]*?firebase write error.*?\n/i;
code = code.replace(setDocHistory, '');

fs.writeFileSync('src/App.tsx', code);
