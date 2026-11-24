import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("\'") && value.endsWith("\'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(projectRoot, '.env'));

const minAge = Number(process.env.MIN_AGE);
if (!Number.isInteger(minAge) || minAge < 0) {
  throw new Error('MIN_AGE must be a non-negative integer in .env');
}

const cityFilter = process.env.CITY_FILTER?.trim();
if (!cityFilter) throw new Error('CITY_FILTER must be set in .env');

export const config = Object.freeze({
  inputFile: path.resolve(projectRoot, process.env.INPUT_FILE || 'data/users.csv'),
  outputFile: path.resolve(projectRoot, process.env.OUTPUT_FILE || 'data/result.csv'),
  minAge,
  cityFilter,
});
