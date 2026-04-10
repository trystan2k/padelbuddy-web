import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VERSION_FILE = resolve('src/version.ts');
const PBXPROJ_FILE = resolve('mobile/ios/App/App.xcodeproj/project.pbxproj');
const INFOPLIST_FILE = resolve('mobile/ios/App/App/Info.plist');

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
console.log(`Syncing iOS version: ${semver} (build: ${versionCode})`);

let pbxproj = readFileSync(PBXPROJ_FILE, 'utf-8');
pbxproj = pbxproj.replace(/MARKETING_VERSION = \d+\.\d+;/, `MARKETING_VERSION = ${semver};`);
pbxproj = pbxproj.replace(
  /CURRENT_PROJECT_VERSION = \d+;/,
  `CURRENT_PROJECT_VERSION = ${versionCode};`
);
writeFileSync(PBXPROJ_FILE, pbxproj);
// oxlint-disable-next-line no-console
console.log('Updated mobile/ios/App/App.xcodeproj/project.pbxproj');

let infoplist = readFileSync(INFOPLIST_FILE, 'utf-8');
infoplist = infoplist.replace(/<string>\d+\.\d+<\/string>/, `<string>${semver}</string>`);
writeFileSync(INFOPLIST_FILE, infoplist);
// oxlint-disable-next-line no-console
console.log('Updated mobile/ios/App/App/Info.plist');
