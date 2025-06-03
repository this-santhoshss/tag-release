import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import path from 'path';

const tasksDir = path.resolve('tasks');
const taskFolders = readdirSync(tasksDir).filter((name) => {
  const taskPath = path.join(tasksDir, name);
  return statSync(taskPath).isDirectory() && existsSync(path.join(taskPath, 'package.json'));
});

for (const task of taskFolders) {
  const taskPath = path.join(tasksDir, task);
  console.log(`📦 Running npm install in ${taskPath}`);
  execSync('npm install', { cwd: taskPath, stdio: 'inherit' });
}
