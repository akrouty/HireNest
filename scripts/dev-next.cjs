const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = fs.realpathSync(path.resolve(__dirname, ".."));

process.chdir(projectRoot);

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(
  process.execPath,
  [nextBin, "dev", "--webpack", "--port", "3001"],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      INIT_CWD: projectRoot,
      PWD: projectRoot,
    },
    stdio: "inherit",
    windowsHide: false,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
