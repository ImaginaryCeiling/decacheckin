const barcode = "2025/12/01 10:37:18 1210082";
const parts = barcode.trim().split(/\s+/);
const id = parts[parts.length - 1];

console.log(`Original: "${barcode}"`);
console.log(`Parts:`, parts);
console.log(`Extracted ID: "${id}"`);

if (id === '1210082') {
  console.log('PASS: ID extraction correct');
} else {
  console.error('FAIL: ID extraction incorrect');
}

const barcodeWithSpaces = "2025/12/01  10:37:18   1210082  ";
const parts2 = barcodeWithSpaces.trim().split(/\s+/);
const id2 = parts2[parts2.length - 1];

if (id2 === '1210082') {
    console.log('PASS: ID extraction with extra spaces correct');
} else {
    console.error('FAIL: ID extraction with extra spaces incorrect');
}

