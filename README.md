# bprun

`bprun` is a command line tool to execute [bitbucket pipelines](https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html) locally.

this project is a fork of [bbrun](https://github.com/mserranom/bbrun).

## usage

`bprun` can execute any step defined in your `bitbucket-pipelines.yml` template:

```yaml
pipelines:
  default:
    - step:
          name: hello
          image: ubuntu2
          script:
            - echo "hello world!"
```

run `bprun` using `bunx`:

```bash
bunx bprun hello
```

Check the [examples](https://github.com/miermontoto/bprun/tree/master/examples) and its [tests](https://github.com/miermontoto/bprun/blob/master/examples/examples.test.js) to learn different use cases.

### flags

```
usage
  $ bprun <step> <options>

options
  --template (-t)    pipeline template, defaults to "bitbucket-pipelines.yml"
  --pipeline (-p)    pipeline to execute, "default" if not provided
  --env (-e)         define environment variables for execution
  --workDir (-w)     docker working directory, defaults to "ws"
  --dryRun (-d)      performs dry run, printing the docker command
  --interactive (-i) starts an interactive bash session in the container
  --ignoreFolder (-f) maps the folder to an empty folder
  --noRoot (-n)      run the container as non-root user (default is to run as root)
  --help             prints this guide
```

## development

```bash
# clone the repo
git clone https://github.com/miermontoto/bprun
cd bprun

# install dependencies
bun install

# run tests
bun run test

# link for local development
bun link
```
