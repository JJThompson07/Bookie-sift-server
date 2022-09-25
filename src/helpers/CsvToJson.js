function convert(csv) {
  const lines = csv.split('\n'); // 1️⃣
  const header = lines[0].split(','); // 2️⃣
  const output = lines.slice(1).map((line) => {
    const fields = line.split(','); // 3️⃣
    return Object.fromEntries(header.map((h, i) => [h.toLowerCase(), fields[i]])); // 4️⃣
  });

  return output;
}

module.exports = { convert }