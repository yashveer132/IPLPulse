class Logger {
  constructor(scriptName) {
    this.scriptName = scriptName;
    this.startTime = Date.now();
  }

  info(msg) {
    console.log(`[${this.scriptName}] ℹ️  ${msg}`);
  }

  success(msg) {
    console.log(`[${this.scriptName}] ✅ ${msg}`);
  }

  warn(msg) {
    console.warn(`[${this.scriptName}] ⚠️  ${msg}`);
  }

  error(msg, err) {
    console.error(`[${this.scriptName}] ❌ ${msg}`);
    if (err) console.error(err);
  }

  progress(current, total, label = 'items') {
    const pct = ((current / total) * 100).toFixed(1);
    process.stdout.write(`\r[${this.scriptName}] 🔄 ${current}/${total} ${label} (${pct}%)`);
    if (current === total) console.log('');
  }

  done() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(`[${this.scriptName}] 🏁 Completed in ${elapsed}s\n`);
  }
}

export default Logger;
