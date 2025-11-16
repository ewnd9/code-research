# Installation Guide

This repository uses **Bun** as the JavaScript runtime and **mise** as the development environment manager.

## Quick Install

```bash
# 1. Install mise (development environment manager)
curl https://mise.run | sh

# 2. Install Bun via mise
cd code-research
mise install

# 3. Install project dependencies
cd sentry-replays-meticulous
bun install
```

## Detailed Instructions

### 1. Install mise

mise is a development environment manager that handles tool version management (similar to asdf, nvm, rbenv).

**Linux/macOS:**
```bash
curl https://mise.run | sh
```

**Alternative methods:**

**Via Homebrew (macOS/Linux):**
```bash
brew install mise
```

**Via cargo (Rust):**
```bash
cargo install mise
```

**Manual download:**
```bash
# Download the latest release for your platform
# https://github.com/jdx/mise/releases
```

**Configure your shell:**

Add to your `~/.bashrc`, `~/.zshrc`, or equivalent:
```bash
eval "$(mise activate bash)"  # or zsh, fish, etc.
```

Then reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### 2. Install Bun via mise

Navigate to the repository:
```bash
cd /path/to/code-research
```

Install Bun using the `.mise.toml` configuration:
```bash
mise install
```

Verify Bun installation:
```bash
bun --version
```

You should see something like: `1.x.x`

### 3. Install Project Dependencies

Navigate to a project:
```bash
cd sentry-replays-meticulous
```

Install dependencies with Bun:
```bash
bun install
```

Run the example:
```bash
bun run example
```

## Alternative: Install Bun Directly

If you prefer not to use mise, you can install Bun directly:

**Linux/macOS:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

**Via npm (if you have Node.js):**
```bash
npm install -g bun
```

**Via Homebrew:**
```bash
brew tap oven-sh/bun
brew install bun
```

## Why mise?

mise offers several benefits:

1. **Version Management**: Lock Bun version per project (`.mise.toml`)
2. **Automatic Switching**: Automatically use the right Bun version when entering a project directory
3. **Reproducibility**: Team members get the same Bun version
4. **Multiple Projects**: Different projects can use different Bun versions
5. **Polyglot**: Can manage other tools (Node.js, Python, Ruby, etc.) in the future

## Why Bun?

Bun is an all-in-one JavaScript runtime and toolkit:

- ⚡ **3x faster** than Node.js
- 📦 **Built-in package manager** (faster than npm/yarn/pnpm)
- 🔄 **Native TypeScript support** (no transpilation needed)
- 🧪 **Built-in test runner** (compatible with Jest API)
- 🛠️ **Built-in bundler** (faster than webpack/esbuild)
- 🌐 **Web APIs** (fetch, WebSocket, etc. built-in)
- ⚙️ **Drop-in Node.js replacement** (most npm packages work)

## Troubleshooting

### mise command not found

Make sure you've added mise to your shell configuration:

```bash
# Add to ~/.bashrc or ~/.zshrc
eval "$(mise activate bash)"  # or zsh, fish, etc.
```

Then reload:
```bash
source ~/.bashrc
```

### Bun command not found after mise install

Try:
```bash
# Ensure mise is activated
mise doctor

# Reinstall Bun
mise install bun@latest

# Check mise environment
mise env
```

### Permission denied during installation

You may need to run with appropriate permissions:

```bash
# For mise installation
curl https://mise.run | sudo sh

# Or install to user directory (recommended)
curl https://mise.run | sh
```

### Network issues / Firewall blocking downloads

If you're behind a corporate firewall:

1. Download mise binary manually from https://github.com/jdx/mise/releases
2. Download Bun binary manually from https://github.com/oven-sh/bun/releases
3. Place them in your PATH

### Bun on Windows

Bun has experimental Windows support. For best results:
- Use WSL2 (Windows Subsystem for Linux)
- Or use the native Windows build (experimental)

## Verification

Verify your setup:

```bash
# Check mise
mise --version

# Check Bun
bun --version

# Check mise-managed tools
mise list

# Run a simple Bun command
echo "console.log('Hello from Bun!')" | bun run -
```

## Next Steps

1. Read the project QUICKSTART.md
2. Configure environment variables (Sentry API tokens)
3. Run examples with `bun run example`

## Resources

- [mise documentation](https://mise.jdx.dev/)
- [Bun documentation](https://bun.sh/docs)
- [Bun GitHub](https://github.com/oven-sh/bun)
- [mise GitHub](https://github.com/jdx/mise)
