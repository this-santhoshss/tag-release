/* eslint-disable no-console */
export function log(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  switch (level) {
    case 'info':
      console.log(`[INFO] ${message}`);
      break;
    case 'warning':
      console.warn(`[WARNING] ${message}`);
      break;
    case 'error':
      console.error(`[ERROR] ${message}`);
      break;
    default:
      console.log(`[UNKNOWN] ${message}`);
      break;
  }
}
