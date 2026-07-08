const { spawn, spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const backendRoot = path.join(projectRoot, 'backend');
const frontendRoot = path.join(projectRoot, 'frontend');

console.log('Seeding database...');
const seed = spawnSync(process.execPath, [path.join('src', 'seeds', 'seeder.js')], {
  cwd: backendRoot,
  stdio: 'inherit',
  env: process.env,
});

if (seed.status !== 0) {
  console.error('Database seeding failed, aborting startup.');
  process.exit(seed.status ?? 1);
}

const backend = spawn(process.execPath, ['server.js'], {
  cwd: backendRoot,
  stdio: 'inherit',
  env: process.env,
  detached: true,
});

backend.unref();

const expoArgs = ['expo', 'start', ...process.argv.slice(2).filter((arg) => arg.startsWith('--'))];
const expoCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const expo = spawn(expoCommand, expoArgs, {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

expo.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  try {
    process.kill(backend.pid);
  } catch (error) {
    // ignore cleanup errors
  }
  process.exit(0);
});