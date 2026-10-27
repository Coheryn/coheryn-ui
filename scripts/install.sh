#!/usr/bin/env sh
set -e

# ==============================================================================
# CoherynUI Universal Native CLI Installer (Linux & macOS)
# https://coheryntech.com/products/coheryn-ui
# ==============================================================================

REPO="Coheryn/coheryn-ui"
GITHUB_URL="https://github.com/${REPO}"
BINARY_NAME="coherynui"

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_step() {
    printf "${BLUE}==>${NC} ${BOLD}%s${NC}\n" "$1"
}

print_success() {
    printf "${GREEN}✓${NC} ${BOLD}%s${NC}\n" "$1"
}

print_error() {
    printf "${RED}Error:${NC} %s\n" "$1" >&2
}

# 1. Detect Operating System
OS="$(uname -s)"
case "${OS}" in
    Darwin)
        TARGET_OS="apple-darwin"
        ;;
    Linux)
        # Check for musl vs glibc
        if ldd /bin/ls 2>&1 | grep -q "musl"; then
            TARGET_OS="unknown-linux-musl"
        else
            TARGET_OS="unknown-linux-gnu"
        fi
        ;;
    *)
        print_error "Unsupported operating system: ${OS}. Please build from source using cargo."
        exit 1
        ;;
esac

# 2. Detect Hardware Architecture
ARCH="$(uname -m)"
case "${ARCH}" in
    x86_64|amd64)
        TARGET_ARCH="x86_64"
        ;;
    arm64|aarch64)
        TARGET_ARCH="aarch64"
        ;;
    *)
        print_error "Unsupported CPU architecture: ${ARCH}. Please build from source using cargo."
        exit 1
        ;;
esac

TARGET="${TARGET_ARCH}-${TARGET_OS}"
print_step "Detected platform target: ${TARGET}"

# 3. Determine Installation Directory
if [ -n "${COHERYN_INSTALL_DIR}" ]; then
    INSTALL_DIR="${COHERYN_INSTALL_DIR}"
elif [ -w "/usr/local/bin" ]; then
    INSTALL_DIR="/usr/local/bin"
elif [ -d "${HOME}/.local/bin" ] && [ -w "${HOME}/.local/bin" ]; then
    INSTALL_DIR="${HOME}/.local/bin"
else
    INSTALL_DIR="${HOME}/.coheryn/bin"
fi

mkdir -p "${INSTALL_DIR}"

# 4. Resolve Version
VERSION="${VERSION:-latest}"
if [ "${VERSION}" = "latest" ]; then
    print_step "Querying latest release from GitHub..."
    LATEST_URL="https://api.github.com/repos/${REPO}/releases/latest"
    if command -v curl >/dev/null 2>&1; then
        TAG_NAME=$(curl -fsSL "${LATEST_URL}" | grep '"tag_name":' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/' || true)
    elif command -v wget >/dev/null 2>&1; then
        TAG_NAME=$(wget -qO- "${LATEST_URL}" | grep '"tag_name":' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/' || true)
    fi

    if [ -n "${TAG_NAME}" ]; then
        VERSION="${TAG_NAME}"
    else
        VERSION="v1.0.0"
    fi
fi

# Ensure 'v' prefix
case "${VERSION}" in
    v*) ;;
    *) VERSION="v${VERSION}" ;;
esac

TARBALL_NAME="coherynui-${VERSION}-${TARGET}.tar.gz"
DOWNLOAD_URL="${GITHUB_URL}/releases/download/${VERSION}/${TARBALL_NAME}"

print_step "Downloading CoherynUI (${VERSION}) for ${TARGET}..."

TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'coherynui-install')
cleanup() {
    rm -rf "${TMP_DIR}"
}
trap cleanup EXIT INT TERM

ARCHIVE_PATH="${TMP_DIR}/${TARBALL_NAME}"

if command -v curl >/dev/null 2>&1; then
    if ! curl -fsSL "${DOWNLOAD_URL}" -o "${ARCHIVE_PATH}"; then
        # Fallback to local build if repo checkout
        if [ -f "./target/release/${BINARY_NAME}" ]; then
            print_step "Online asset unavailable; installing from local release build..."
            cp "./target/release/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
            chmod +x "${INSTALL_DIR}/${BINARY_NAME}"
            INSTALLED=1
        else
            print_error "Failed to download from ${DOWNLOAD_URL}"
            exit 1
        fi
    fi
elif command -v wget >/dev/null 2>&1; then
    if ! wget -q "${DOWNLOAD_URL}" -O "${ARCHIVE_PATH}"; then
        print_error "Failed to download from ${DOWNLOAD_URL}"
        exit 1
    fi
else
    print_error "curl or wget is required to install CoherynUI."
    exit 1
fi

if [ -z "${INSTALLED}" ]; then
    print_step "Extracting binary..."
    tar -xzf "${ARCHIVE_PATH}" -C "${TMP_DIR}"
    
    if [ -f "${TMP_DIR}/${BINARY_NAME}" ]; then
        SRC_BIN="${TMP_DIR}/${BINARY_NAME}"
    elif [ -f "${TMP_DIR}/coherynui-${VERSION}-${TARGET}/${BINARY_NAME}" ]; then
        SRC_BIN="${TMP_DIR}/coherynui-${VERSION}-${TARGET}/${BINARY_NAME}"
    else
        SRC_BIN=$(find "${TMP_DIR}" -type f -name "${BINARY_NAME}" | head -n 1)
    fi

    if [ -z "${SRC_BIN}" ] || [ ! -f "${SRC_BIN}" ]; then
        print_error "Could not locate ${BINARY_NAME} in extracted archive."
        exit 1
    fi

    cp "${SRC_BIN}" "${INSTALL_DIR}/${BINARY_NAME}"
    chmod +x "${INSTALL_DIR}/${BINARY_NAME}"
fi

print_success "CoherynUI CLI successfully installed to: ${INSTALL_DIR}/${BINARY_NAME}"

# 5. Check PATH
case ":${PATH}:" in
    *:"${INSTALL_DIR}":*) ;;
    *)
        printf "\n${PURPLE}${BOLD}Action Required:${NC} Add CoherynUI to your shell PATH:\n"
        printf "  export PATH=\"%s:\$PATH\"\n\n" "${INSTALL_DIR}"
        printf "Add the line above to your ${CYAN}~/.bashrc${NC}, ${CYAN}~/.zshrc${NC}, or ${CYAN}~/.config/fish/config.fish${NC}.\n"
        ;;
esac

# 6. Verify Execution
if command -v "${INSTALL_DIR}/${BINARY_NAME}" >/dev/null 2>&1; then
    printf "\n"
    "${INSTALL_DIR}/${BINARY_NAME}" --version || true
fi

printf "\n${GREEN}${BOLD}Welcome to CoherynUI!${NC}\n"
printf "Quick start in any project:\n"
printf "  ${CYAN}coherynui init${NC}            # Initialize deterministic configuration\n"
printf "  ${CYAN}coherynui build${NC}           # Compile strict @layer cyn.* cascades\n"
printf "  ${CYAN}coherynui agent init${NC}      # Configure AI agents & install 7 canonical skills\n\n"
printf "Documentation: ${BOLD}https://coheryntech.com/products/coheryn-ui${NC}\n\n"
