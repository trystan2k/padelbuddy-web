import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VERSION_FILE = resolve('src/version.ts');
const GRADLE_FILE = resolve('mobile/android/app/build.gradle');

const versionTs = readFileSync(VERSION_FILE, 'utf-8');
const match = versionTs.match(/export const APP_VERSION = '([^']+)'/);
if (!match) {
  console.error('Could not extract APP_VERSION from src/version.ts');
  process.exit(1);
}

const [major, minor, patch] = match[1].split('.').map(Number);
const versionCode = major * 10000 + minor * 100 + patch;
const semver = match[1];

// oxlint-disable-next-line no-console
console.log(`Syncing Android version: ${semver} (versionCode: ${versionCode})`);

let gradle = readFileSync(GRADLE_FILE, 'utf-8');
gradle = gradle.replace(/versionName "[^"]*"/, `versionName "${semver}"`);
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`);
writeFileSync(GRADLE_FILE, gradle);

// oxlint-disable-next-line no-console
console.log('Updated mobile/android/app/build.gradle');
