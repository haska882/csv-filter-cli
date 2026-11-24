import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { config } from './config/index.js';
import { escapeCsvField, parseCsvLine } from './utils/csv.js';

async function main() {
  if (!fs.existsSync(config.inputFile)) {
    throw new Error(`Input file not found: ${config.inputFile}`);
  }

  await fs.promises.mkdir(path.dirname(config.outputFile), { recursive: true });

  const input = fs.createReadStream(config.inputFile, { encoding: 'utf8' });
  const lines = createInterface({ input, crlfDelay: Infinity });
  const output = fs.createWriteStream(config.outputFile, { encoding: 'utf8' });
  let processed = 0;
  let matched = 0;
  let header;
  let indexes;

  try {
    for await (const line of lines) {
      if (header === undefined) {
        if (!line.trim()) continue;
        header = parseCsvLine(line).map((name) => name.trim());
        indexes = Object.fromEntries(header.map((name, index) => [name, index]));
        for (const column of ['age', 'city']) {
          if (indexes[column] === undefined) throw new Error(`CSV is missing required column: ${column}`);
        }
        if (!output.write(`${header.map(escapeCsvField).join(',')}\n`)) {
          await new Promise((resolve) => output.once('drain', resolve));
        }
        continue;
      }

      if (!line.trim()) continue;
      processed += 1;
      const fields = parseCsvLine(line);
      const age = Number(fields[indexes.age]);
      const city = fields[indexes.city]?.trim();
      if (Number.isFinite(age) && age >= config.minAge && city === config.cityFilter) {
        matched += 1;
        const record = header.map((_, index) => escapeCsvField(fields[index] ?? '')).join(',');
        if (!output.write(`${record}\n`)) await new Promise((resolve) => output.once('drain', resolve));
      }
    }

    if (header === undefined) throw new Error('Input CSV is empty or has no header');
    output.end();
    await new Promise((resolve, reject) => {
      output.once('finish', resolve);
      output.once('error', reject);
    });
    console.log(`Processed: ${processed}; matched: ${matched}; filtered out: ${processed - matched}`);
  } catch (error) {
    lines.close();
    input.destroy();
    output.destroy();
    throw error;
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
