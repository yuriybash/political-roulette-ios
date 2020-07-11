export function log_error(text) {
  let time = new Date();
  console.error('[' + time.toLocaleTimeString() + '] ' + text);
}
