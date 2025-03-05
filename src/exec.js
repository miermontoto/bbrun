const docker = require("./docker");
const { parseVars } = require("./util");

function exec(script, image, flags) {
  const environmentVars = flags.env ? parseVars(flags.env) : [];
  const commands = [].concat(
    environmentVars.map(x => `export ${x}`),
    "set -e",
    script
  );

  // Create options object for docker.run
  const runOptions = {
    commands,
    image,
    dryRun: flags.dryRun,
    interactive: flags.interactive,
    workDir: flags.workDir,
    ignoreFolder: flags.ignoreFolder,
    noRoot: flags.noRoot
  };

  docker.run(runOptions);
}

module.exports.exec = exec;
