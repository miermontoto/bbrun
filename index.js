#!/usr/bin/env node

"use strict";
const meow = require("meow");
const bbrun = require("./src/bbrun");

const cli = meow(
  `
Usage
  $ bbrun <step> <options>

Options
    --template (-t), build template, defaults to "bitbucket-pipelines.yml"
    --pipeline (-p), pipeline to execute. "default" if not provided
    --env (-e), define environment variables for execution
    --workDir (-w), docker working directory, defaults to "ws"
    --dryRun (-d), performs dry run, printing the docker command
    --interactive (-i), starts an interactive bash session in the container
    --ignoreFolder (-f), maps the folder to an empty folder (useful for forcing package managers to reinstall)
    --help, prints this very guide

Examples:
  Execute all steps in the default pipeline from bitbucket-pipelines.yml
    $ bbrun
    $ bbrun --template bitbucket-template.yml
    $ bbrun --pipeline default
  Execute a single step by its name
    $ bbrun test
    $ bbrun "Integration Tests"
  Execute steps from different pipelines
    $ bbrun test --pipeline branches:master
  Define an environment variable
    $ bbrun test --env EDITOR=vim
    $ bbrun test --env "EDITOR=vim, USER=root"
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
      }
    }
  }
);

try {
  // Map the new flag names to the old ones for backward compatibility
  cli.flags["work-dir"] = cli.flags.workDir;
  cli.flags["dry-run"] = cli.flags.dryRun;
  cli.flags["ignore-folder"] = cli.flags.ignoreFolder;

  bbrun(cli.flags, cli.input[0]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
