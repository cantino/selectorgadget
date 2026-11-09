FROM mcr.microsoft.com/devcontainers/ruby:1-3.1-bookworm

# Replaces the removed devcontainer features, copied from official images rather
# than installed over the network. git is already in the base image; gh is
# dropped because git/GitHub operations happen on the host.
#  - node: JS runtime for execjs (coffee-script, uglifier)
#  - Temurin 17 JRE: runs yui-compressor (same distro the old java feature used)
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=eclipse-temurin:17-jre /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# The base image grants vscode passwordless sudo. Remove it; no-new-privileges
# in runArgs would block it anyway.
RUN rm -f /etc/sudoers.d/vscode

# oh-my-zsh ships in the base image; make sure it never self-updates.
ENV DISABLE_AUTO_UPDATE=true

# Named-volume mount points. Docker copies this ownership into a volume when it
# first creates it, which replaces the old `sudo chown` in postCreateCommand.
RUN mkdir -p /usr/local/bundle /home/vscode/.config/JetBrains \
    && chown -R vscode:vscode /usr/local/bundle /home/vscode/.config
