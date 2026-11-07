# Dev container

This dev container is set up so that a malicious dependency (a gem, or anything it runs during `bundle install`) can damage only what's inside the container. It shouldn't be able to reach the Mac, your credentials, or arbitrary hosts on the internet.

## Setup

1. One-time, on the Mac: make sure `~/devnet-egress` exists and run `~/devnet-egress/up.sh`. That creates the `devnet` network and the `egress` proxy.
2. Allow these hosts in `~/devnet-egress/allowlist`, then run `docker restart egress`:
   - `rubygems.org` and `index.rubygems.org`: gems
   - `github.com`: `guard-concat` is a git dependency in the `Gemfile`
3. In RubyMine or WebStorm: **File → Remote Development → Dev Containers → New Dev Container**, choose **From Local Project**, and pick `.devcontainer/devcontainer.json`. The first build runs `bundle install` inside the container.
4. Develop: `bundle exec guard` compiles the `.coffee` and `.scss` files and watches them.

### Persistent volumes
- **`selectorgadget-bundle`** (`/usr/local/bundle`): installed gems.
- **`selectorgadget-jetbrains-config`** (`~/.config/JetBrains`): IDE backend settings. RubyMine and WebStorm each keep their own subdirectory in it.

To start clean (or to fix ownership): `docker volume rm selectorgadget-bundle selectorgadget-jetbrains-config`, then rebuild. **An existing `selectorgadget-bundle` volume from before this setup has to be removed**, because nothing runs `chown` on it any more.

### Tools in the image
Ruby 3.1 (base image `mcr.microsoft.com/devcontainers/ruby`), Node 24 (the `node` binary only, for execjs), Temurin 17 JRE (for yui-compressor) and git. Node and Java are copied from the official `node` and `eclipse-temurin` images rather than installed by devcontainer features. There's no GitHub CLI, because git runs on the Mac.

## Security setup

Same model as the other hardened repos:

- **Network:** `--network=devnet`, an internal network with an isolated gateway. The only way out is `http://egress:8888`, which forwards only to allowlisted hostnames.
- **Read-only mounts** for paths the Mac executes or reads as configuration: `.git` and `.devcontainer`. The `.claude` line is commented out; uncomment it if you run Claude Code only on the Mac. This repo has no `mise.toml`, `.mise.toml`, `.tool-versions` or `.npmrc`. If you add one, add a read-only mount for it too. Docker fails when a bind source is missing, which is why they aren't listed now.
- **Privileges:** the base image's passwordless sudo grant (`/etc/sudoers.d/vscode`) is deleted, and `--security-opt=no-new-privileges` would block sudo anyway. `--cap-drop=NET_RAW` removes raw sockets. To get root, run `docker exec -it -u root <container> bash` from the Mac.
- **Build:** no devcontainer `features` and no network `RUN` steps. The Dockerfile only copies from images and changes local files.

## Day to day

- **git:** on the Mac only.
- **Don't run workspace code on the Mac.** `Guardfile`, `Gemfile` and `bin/*.sh` are writable from the container, and Ruby runs `Guardfile` and `Gemfile` as code.
- **SSH key prompts from the IDE:** deny them.
- **A request is refused by the proxy:** `docker logs -f egress 2>&1 | grep -i refused`, add the hostname to the allowlist if you trust it, then `docker restart egress`.

## Known gaps

- Build time isn't isolated: base images are pulled over the normal network. The `ruby:1-3.1-bookworm` tag hasn't been rebuilt since Ruby 3.1 reached end of life (March 2025), so in practice it stays fixed. The `node` and `eclipse-temurin` tags follow their release lines.
- `github.com` on the allowlist means data could leave through it.
- The container can create *new* files the Mac auto-loads, such as `.envrc`, `.rvmrc` or `mise.toml`, because read-only mounts only cover files that already exist. Check `git status` on the Mac for unexpected dotfiles.
