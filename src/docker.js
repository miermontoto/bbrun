"use strict";

const shelljs = require("shelljs");
const fs = require("fs");
const child_process = require("child_process");

// Destructure required functions from shelljs
const { exec, pwd } = shelljs;

// Constants
const BUILD_SCRIPT = ".bprun.sh";
const TMP_DIR = '.bprun';

/**
 * Deletes the build script and temporary directory if they exist
 */
function deleteBuildScript() {
  if (fs.existsSync(BUILD_SCRIPT)) {
    fs.unlinkSync(BUILD_SCRIPT);
  }

  if (fs.existsSync(`./${TMP_DIR}`)) {
    deleteFolderSync(`./${TMP_DIR}`);
  }
}

/**
 * Creates a build script with the provided commands
 * @param {string[]} commands - Commands to include in the build script
 */
function prepareBuildScript(commands) {
  deleteBuildScript();
  const script = "#!/usr/bin/env sh\n" + commands.join("\n");
  fs.writeFileSync(BUILD_SCRIPT, script);
}

/**
 * Checks if Docker is installed and available
 * @throws {Error} If Docker is not installed or not available
 */
function checkExists() {
  const dockerStatus = exec("docker -v", { silent: true });
  if (dockerStatus.code !== 0) {
    console.error(`
      Error: bprun requires a valid Docker installation"
      Output:
          $ docker -v
          ${dockerStatus.stdout}`);
    process.exit(1);
  }
}

/**
 * @typedef {Object} RunOptions
 * @property {string[]} commands - Commands to run in the container
 * @property {string} image - Docker image to use
 * @property {boolean} [dryRun=false] - Whether to perform a dry run
 * @property {boolean} [interactive=false] - Whether to run in interactive mode
 * @property {string} workDir - Working directory in the container
 * @property {string|string[]} [ignoreFolder] - Folder(s) to ignore
 * @property {boolean} [noRoot=false] - Whether to run as non-root user
 */

/**
 * Builds the Docker run command based on the provided options
 * @param {RunOptions} options - Options for the Docker command
 * @returns {string} The Docker run command
 */
function buildDockerCommand(options) {
  const { image, interactive, workDir, noRoot } = options;
  let { ignoreFolder } = options;

  const runParts = ['run', '--rm', '-P'];

  // User permissions
  if (!noRoot) {
    runParts.push('-u root');
  }

  // Interactive mode settings
  if (interactive) {
    runParts.push('-it');
    runParts.push('--entrypoint=/bin/bash');
  }

  // Volume mapping
  runParts.push(`-v ${pwd()}:${workDir}`);

  // Working directory
  runParts.push(`-w ${workDir}`);

  // Handle ignored folders
  if (typeof ignoreFolder !== "undefined") {
    if (typeof ignoreFolder === "string") {
      ignoreFolder = [ignoreFolder];
    }

    ignoreFolder.forEach((folder) => {
      runParts.push(`-v ${pwd()}/${TMP_DIR}/:${workDir}/${folder}`);
    });
  }

  // Add image
  runParts.push(image);

  // Add build script execution if not in interactive mode
  if (!interactive) {
    runParts.push(`bash ${BUILD_SCRIPT}`);
  }

  return runParts.join(' ');
}

/**
 * Run a Docker container with the specified options
 * @param {RunOptions} options - Options for running the container
 */
function run(options) {
  const { commands, image, dryRun, interactive } = options;

  const cmd = buildDockerCommand(options);

  if (dryRun) {
    console.log(`docker command:\n\tdocker ${cmd}`);
    console.log(`build script:\n\t${commands.join("\n\t")}`);
  } else if (interactive) {
    console.log(`opening shell for image "${image}"`);
    child_process.execFileSync("docker", cmd.split(" "), {
      stdio: "inherit"
    });
  } else {
    prepareBuildScript(commands);
    exec(`docker ${cmd}`, { async: false });
    deleteBuildScript();
  }
}

/**
 * Extracts the image name from various formats
 * @param {string|Object} image - Image name or object containing image information
 * @returns {string} The extracted image name
 * @throws {Error} If the image format is invalid
 */
function extractImageName(image) {
  if (typeof image === "string" || image instanceof String) {
    return image;
  } else if (image && image.name) {
    return image.name;
  } else {
    throw new Error(`"${JSON.stringify(image)}" is not a valid image`);
  }
}

/**
 * Recursively deletes a folder and its contents
 * @param {string} path - Path to the folder to delete
 */
function deleteFolderSync(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  const files = fs.readdirSync(path);

  files.forEach(file => {
    const curPath = `${path}/${file}`;

    if (fs.lstatSync(curPath).isDirectory()) {
      // Recursively delete subdirectories
      deleteFolderSync(curPath);
    } else {
      // Delete files
      fs.unlinkSync(curPath);
    }
  });

  // Delete the empty directory
  fs.rmdirSync(path);
}

module.exports = {
  checkExists,
  run,
  extractImageName
};
