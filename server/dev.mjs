import { spawn } from 'node:child_process';

const children = [];

const run = (command, args) => {
  const child = spawn(command, args, {
    env: process.env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  children.push(child);
  return child;
};

run('node', ['server/index.mjs']);
run('vite', ['--host', '127.0.0.1', '--port', '5173']);

const shutdown = () => {
  for (const child of children) {
    child.kill('SIGINT');
  }
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
