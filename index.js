#!/usr/bin/env node

"use strict";
const meow = require("meow");
const bprun = require("./src/bprun");

const cli = meow(
  `
Usage
  $ bprun <step> <options>

Options
    --template (-t), build template, defaults to "bitbucket-pipelines.yml"
    --pipeline (-p), pipeline to execute. "default" if not provided
    --env (-e), define environment variables for execution
    --workDir (-w), docker working directory, defaults to "ws"
    --dryRun (-d), performs dry run, printing the docker command
    --interactive (-i), starts an interactive bash session in the container
    --ignoreFolder (-f), maps the folder to an empty folder (useful for forcing package managers to reinstall)
    --noRoot (-n), run the container as non-root user (default is to run as root)
    --help, prints this very guide

Examples:
  Execute all steps in the default pipeline from bitbucket-pipelines.yml
    $ bprun
    $ bprun --template bitbucket-template.yml
    $ bprun --pipeline default
  Execute a single step by its name
    $ bprun test
    $ bprun "Integration Tests"
  Execute steps from different pipelines
    $ bprun test --pipeline branches:master
  Define an environment variable
    $ bprun test --env EDITOR=vim
    $ bprun test --env "EDITOR=vim, USER=root"
  Run as non-root user
    $ bprun test --noRoot
`,
  {
    flags: {
      pipeline: {
        type: "string",
        shortFlag: "p"
      },
      template: {
        type: "string",
        shortFlag: "t"
      },
      env: {
        type: "string",
        shortFlag: "e"
      },
      workDir: {
        type: "string",
        shortFlag: "w"
      },
      interactive: {
        type: "boolean",
        shortFlag: "i"
      },
      dryRun: {
        type: "boolean",
        shortFlag: "d"
      },
      ignoreFolder: {
        type: "string",
        shortFlag: "f"
      },
      noRoot: {
        type: "boolean",
        shortFlag: "n"
      }
    }
  }
);

try {
  // Map the new flag names to the old ones for backward compatibility
  cli.flags["work-dir"] = cli.flags.workDir;
  cli.flags["dry-run"] = cli.flags.dryRun;
  cli.flags["ignore-folder"] = cli.flags.ignoreFolder;
  cli.flags["no-root"] = cli.flags.noRoot;

  bprun(cli.flags, cli.input[0]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
