
# Atropos

**A semantic garbage collector for Obsidian vaults.**

Atropos is a system that applies programmed entropy to Markdown files based on inactivity. Notes that are not revisited or connected progressively lose visibility in the graph, get disconnected from the knowledge network, and are eventually compressed by AI into a single archival sentence — while the original is always preserved.

Originally built as a local desktop daemon, **Atropos is now also available as a Native Obsidian Plugin**, bringing the entire decay engine, Purgatory, and Fossilized archives directly into your Obsidian workspace.

The system executes silently in the background or right within Obsidian. No cloud sync. No subscriptions. No data ever leaves your machine except for the AI compression call you explicitly configure.

<p align="center">
  <img src="packages/app/assets/screenshots/dashboard.png" width="49%" />
  <img src="packages/app/assets/screenshots/plugin.png" width="49%" />
</p>

<p align="center">
  <img src="packages/app/assets/screenshots/graph.png" width="49%" />
  <img src="packages/app/assets/screenshots/purgatory.png" width="49%" />
</p>

---

## The Problem

Knowledge management tools are optimized for capture, not for forgetting. Over time, a vault accumulates hundreds of notes that are never revisited — half-formed ideas, outdated meeting notes, obsolete drafts. They consume cognitive space in the graph without contributing meaning. There is no native mechanism in Obsidian to let knowledge decay naturally.

Atropos is that mechanism.

---

## How It Works

The core engine evaluates each note's vitality based on the time elapsed since its last modification. Decay happens in three sequential phases:

### Phase 1 — Drought (inactivity > 30 days)

The note is flagged as inactive. No content is modified. The system injects `decay_level: 1` into the YAML frontmatter. In Obsidian, the graph node loses its primary color and turns gray through pre-configured graph filters.

### Phase 2 — Disconnection (inactivity > 60 days)

Before any modification, the system creates a **mandatory Git snapshot** of the entire vault. Then it scans every `.md` file in the vault, finds all references to the decaying note, and replaces `[[Note Name]]` wikilink syntax with plain text. The note loses all its edges in the graph, becoming an isolated node — an island disconnected from the main knowledge network.

### Phase 3 — Dissolution (inactivity > 90 days)

The note's content is sent to an AI provider (Google Gemini or Anthropic Claude) for lossy compression. The original file is safely moved to `/_fossilized/YYYY-MM/` and a lightweight note is created in its place containing a one-sentence summary and a recovery link. The original is never deleted.

**Resurrection:** Linking to a decaying note from any other note, or opening/modifying it directly (if using the plugin), instantly resets its `decay_level` to zero on the next execution cycle.

---

## Features

Whether you use the Native Plugin or the Desktop App, you have access to the full suite of Atropos features:

### Native Obsidian Integration (New)
Run Atropos entirely inside Obsidian without the background desktop daemon. Access native commands via the Command Palette to run decay cycles, immunize notes, or open the Purgatory. Configure phase thresholds, immune folders, and AI providers directly within Obsidian's native settings window.

### Dashboard (Desktop)
Real-time vault health overview. Displays total note count, active notes, notes in decay across all three phases, fossilized count, and a visual health bar showing the distribution of vault states. Recent activity log shows the last execution results inline.

### Interactive Graph (Desktop)
A live D3.js force simulation of your entire vault. Nodes are colored by decay phase — teal for active, gray for Phase 1, amber for Phase 2, coral for Phase 3, dark for fossilized. Nodes that have lost their wikilinks drift naturally toward the periphery. Hover any node to see its name and decay state. Click to open the note directly in Obsidian.

### Semantic Connections (Ollama)
Optional local AI layer using [Ollama](https://ollama.com) and the `nomic-embed-text` embedding model. When enabled, Atropos computes cosine similarity between all notes and surfaces thematic connections as dashed amber edges in the graph — distinct from real wikilinks. Runs entirely offline. No data leaves the machine. Results are cached to avoid recomputing unchanged notes.

### Purgatory
A list of all notes scheduled for Phase 3 within the next 30 days, sorted by urgency. Divided into two sections: notes expiring within 7 days, and notes expiring within the month. Each entry shows the note name, folder, dissolution date, and days remaining. Every note can be opened in Obsidian or immunized directly from the interface.

### Fossilized Archive
Browse all notes that have completed Phase 3. Each card shows the original note name, the date it was fossilized, and the one-sentence AI summary generated at compression time. Original files are recoverable from `/_fossilized/YYYY-MM/` with a single click.

### Cross-Device Sync
Git-based synchronization between devices. Atropos pulls remote changes before each execution cycle and pushes the updated vault state after completion. Conflicts are resolved automatically using last-write-wins based on file modification timestamps. Requires a Git remote — a private GitHub repository is recommended.

### System Tray (Desktop)
Atropos runs in the background via the system tray. The main window can be closed without stopping the daemon. The tray menu shows the next scheduled execution time and provides quick access to run immediately, open the dashboard, or quit.

---

## Architecture

Atropos is built as an npm workspace monorepo. The core decay logic is extracted into a shared `@atropos/core` package that powers both the desktop application and the Obsidian plugin to ensure identical behavior across environments. The AI API call in Phase 3 goes directly from your machine to Google or Anthropic.

```
atropos/
├── packages/
│   ├── core/      — Shared decay engine, Git operations, and AI logic
│   ├── app/       — Electron desktop application (Dashboard, System Tray)
│   └── plugin/    — Native Obsidian plugin
├── .github/workflows/
│   └── release.yml  — Dual CI/CD for Desktop App & Plugin
```

---

## Installation

You can run Atropos either as a native plugin (recommended for seamless integration) or as a standalone desktop application.

### Option A: Native Obsidian Plugin

1. Download `main.js` and `manifest.json` from the latest [Release](https://github.com/matheusnmto/atropos/releases).
2. Create a folder named `atropos` inside `.obsidian/plugins/` in your vault.
3. Copy both files into the new folder.
4. Restart Obsidian and enable Atropos in **Settings → Community Plugins**.

### Option B: Desktop Application

Download the installer for your operating system from [Releases](https://github.com/matheusnmto/atropos/releases):

| Platform | File |
|----------|------|
| macOS | `.dmg` (Intel + Apple Silicon) |
| Windows | `.exe` (NSIS installer) |
| Linux | `.AppImage` |

No runtime dependencies required for the desktop app. Node.js is bundled inside.

### From Source

```bash
git clone [https://github.com/matheusnmto/atropos.git](https://github.com/matheusnmto/atropos.git)
cd atropos
npm install
npm run build
```

---

## Configuration

### Vault Setup

* **Plugin:** The plugin automatically detects your vault. Configure thresholds and API keys directly in the Obsidian settings panel.
* **Desktop:** On first launch, the application will prompt for the absolute path to your Obsidian vault.

### Decay Thresholds

For the desktop app, or if you prefer file-based config, place a `decay.config.json` file at the root of your vault to override default thresholds per folder:

```json
{
  "global": {
    "phase1_days": 30,
    "phase2_days": 60,
    "phase3_days": 90
  },
  "folders": {
    "evergreen": {
      "decay_immune": true
    },
    "fleeting": {
      "phase1_days": 7,
      "phase2_days": 14,
      "phase3_days": 21
    },
    "journal": {
      "skip_phases": [1, 2],
      "phase3_days": 14
    }
  }
}
```

The most specific folder rule takes precedence over global defaults. Setting `decay_immune: true` on a folder exempts all notes inside it from all phases.

### Note-Level Immunity

Add `decay_immune: true` to any note's frontmatter to permanently exempt it from the decay cycle:

```yaml
---
decay_immune: true
tags: [person, reference]
---
```

Use this for permanent references, people notes, active project documents, or any note that should never decay.

### Obsidian Graph Colors

To visualize decay state in Obsidian's native graph view, add the following `colorGroups` to `.obsidian/graph.json`:

```json
"colorGroups": [
  { "query": "[decay_level:1]", "color": { "a": 1, "rgb": 8947584 } },
  { "query": "[decay_level:2]", "color": { "a": 1, "rgb": 12217111 } },
  { "query": "[decay_level:3]", "color": { "a": 1, "rgb": 10041373 } },
  { "query": "[status:fossilized]", "color": { "a": 0.4, "rgb": 4473921 } }
]
```

---

## AI Integration

AI is optional. Without a configured key, Phase 3 still runs — notes are archived to `/_fossilized/` with a recovery link, but without an AI-generated summary.

### Phase 3 Compression (Optional)

To enable summarization, configure a provider in Settings (Plugin) or via the Desktop App:

| Provider | Model | Estimated cost per note |
|----------|-------|------------------------|
| Google AI | gemini-2.0-flash | ~$0.0003 |
| Anthropic | claude-haiku-4-5-20251001 | ~$0.001 |

API keys are stored securely (exclusively in the OS keychain via `keytar` for Desktop, or locally within Obsidian for the Plugin). Keys are never written to disk, never logged, and never transmitted to any server other than the provider's official API endpoint.

**Privacy note:** In BYOK mode, note content travels directly from your machine to the AI provider's API. No Atropos server receives, processes, or stores your notes at any point.

### Semantic Connections (Local, Optional)

Atropos can discover thematic connections between notes using local AI embeddings via [Ollama](https://ollama.com). No data leaves your machine.

```bash
# Install Ollama from [https://ollama.com/download](https://ollama.com/download), then:
ollama pull nomic-embed-text
```

Once installed, enable it in Settings → Semantic connections → Ollama (local). The app detects Ollama automatically. Embedding results are cached. Add the cache file to your `.gitignore` to avoid committing large binary data:

```
.zelador/embeddings.json
```

---

## Safety and Reversibility

Data safety is the primary design constraint of the system. Two independent protection layers are in place before any destructive operation:

**Layer 1 — Git snapshot.** Before Phase 2 or Phase 3 executes on any note, the system runs `git add -A && git commit` with a standardized message. This is mandatory and cannot be disabled through configuration. If the commit fails, the operation aborts entirely. *(A Git initialized vault is required).*

```
atropos: snapshot pre-F2 2026-03-21 "Note Name"
atropos: snapshot pre-F3 2026-03-21 "Note Name"
```

**Layer 2 — Fossilized archive.** In Phase 3, the original note is moved — never deleted — to `/_fossilized/YYYY-MM/`. It is recoverable through Obsidian's file explorer or directly from the Fossilized tab, without requiring Git or terminal access.

**Concurrency protection.** Locks are utilized to prevent concurrent executions between the Plugin, Desktop App, and background tasks.

---

## Cross-Device Sync

To synchronize decay state across multiple machines, initialize a Git remote for your vault:

```bash
cd /path/to/your/vault
git init
git remote add origin [https://github.com/your-user/your-vault-private.git](https://github.com/your-user/your-vault-private.git)
git add -A && git commit -m "initial vault"
git push -u origin main
```

On subsequent machines, clone the repository as the vault path. Atropos detects the remote automatically and handles pull/push around each execution cycle. A private repository is strongly recommended.

Conflicts between devices are resolved using last-write-wins based on file modification timestamps. If the remote is unreachable, Atropos continues the local execution cycle and retries on the next run.

---

## Frontmatter Reference

All keys below are written and managed automatically by the core engine. The only key intended for manual use is `decay_immune`.

| Key | Type | Description |
|-----|------|-------------|
| `decay_level` | integer | Current phase: 0 (active), 1, 2, or 3 (fossilized) |
| `decay_immune` | boolean | If true, the note is ignored in all phases |
| `decay_since` | date | ISO date when decay began |
| `links_removed_at` | date | ISO date when wikilinks were removed (Phase 2) |
| `fossilized_at` | date | ISO date when Phase 3 executed |
| `original_path` | string | Path to the original in `/_fossilized/` |
| `status` | string | Set to `fossilized` after Phase 3 |

---

## Scheduled Execution

The desktop application runs the core engine automatically at 03:00 AM daily. The schedule is configurable through the Settings screen. The process runs in the background via system tray. 

For system-level scheduling outside the Electron app or Plugin:

```bash
# cron — add via crontab -e
0 3 * * * cd /path/to/atropos && node packages/core/dist/cli.js >> /var/log/atropos.log 2>&1
```

---

## The PURGATORIO.md File

On every execution, Atropos generates or updates `PURGATORIO.md` at the root of the vault. This file lists all notes scheduled for Phase 3 within the next 30 days, sorted by urgency. It is visible directly in Obsidian — no external notification or email required.

Opening any note listed in the Purgatory resets its decay cycle automatically. The file itself carries `decay_immune: true` and is never processed by the system.

---

## Development and Testing

#### Vault Override (Developer Mode)

For development and debugging, you can run the daemon against a specific test vault using the `ATROPOS_VAULT_OVERRIDE` environment variable. This prevents accidental modifications to your primary vault.

```bash
# Run the daemon against a test vault
ATROPOS_VAULT_OVERRIDE=/path/to/test-vault node packages/core/dist/cli.js
```

#### Functional Testing Framework

The repository includes a functional testing suite designed to verify decay phases and IPC integrity. 

1. **Setup Test Vault:** Initialize a Git repository in your test folder and create a few sample `.md` files.
2. **Age Files:** To simulate inactivity without waiting for weeks, use the `touch` command to set back the modification time (mtime) of your notes.
   ```bash
   # Set mtime to 35 days ago (triggers Phase 1)
   touch -t $(date -v-35d +%Y%m%d%0000) test-vault/note.md
   ```
3. **Run Suite:** Execute the engine using the override. The system will process notes according to their configuration, creating Git snapshots and breaking links as needed.

**Security:** API keys must never appear in logs, commits, or error messages — not even partially.

---

## Roadmap

- Undo last execution — one-click Git revert of the last run from the dashboard
- Archaeology mode — timeline slider showing vault state at any past point using existing Git history
- Weekly digest — auto-generated summary note of vault health and decay activity
- SaaS mode — centralized AI key with usage billing via Stripe

---

## License

MIT © 2026 Matheus Farah
```
