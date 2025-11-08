# Builder stage for dependencies
FROM mcr.microsoft.com/devcontainers/typescript-node:18 AS builder

# Set shell options for security
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Set up user
USER node

# Set working directory
WORKDIR /workspaces

# Copy package files for dependency installation
COPY --chown=node:node ../package*.json ./
RUN npm ci

# Final stage
FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Set shell options for security
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install additional tools with pinned versions
# hadolint ignore=DL3008
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        curl \
        wget \
        git \
        ca-certificates \
        gnupg \
        lsb-release \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI with pinned version
# hadolint ignore=DL3008
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install kubectl
RUN KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt) \
    && curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" \
    && curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl.sha256" \
    && echo "$(cat kubectl.sha256)  kubectl" | sha256sum -c - \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl kubectl.sha256

# Install Helm
RUN curl -fsSL https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz -o helm.tar.gz \
    && echo "1bdbbeec5a12dd0c1cd4efd8948a156d33e1e2f51140e2a51e1e5e7b11b81d47  helm.tar.gz" | sha256sum -c - \
    && tar -zxvf helm.tar.gz \
    && mv linux-amd64/helm /usr/local/bin/helm \
    && rm -rf linux-amd64 helm.tar.gz

# Set up user
USER node

# Set working directory
WORKDIR /workspaces

# Copy dependencies from builder
COPY --from=builder --chown=node:node /workspaces/node_modules ./node_modules

# Copy the rest of the application
COPY --chown=node:node ../. .

# Expose ports
EXPOSE 3000 4000 5000 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["npm", "run", "dev"]
