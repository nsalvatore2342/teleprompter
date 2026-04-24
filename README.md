# Teleprompter

A local browser-based teleprompter for recording YouTube and video content. No backend, no login, no internet required.

## Install & Run

```bash
cd teleprompter
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

### Script Editor
- Paste or type your full script in the editor
- Scripts auto-save to localStorage — nothing is lost on refresh
- Create, rename, duplicate, and delete scripts from the sidebar

### Segments
- Split your script into segments using headings or dividers:
  - `# Heading` — starts a named segment
  - `## Sub-heading` — also starts a segment
  - `---` — inserts an unnamed segment break
- Each segment shows estimated read time in the sidebar
- Click any segment to jump directly to it in the teleprompter

### Teleprompter Mode
- Click **▶ Preview** in the top bar to enter teleprompter mode
- The guide line (faint blue) marks your reading position
- Controls auto-hide while playing; move the mouse to reveal them

### Controls
| Action | Keyboard | UI |
|---|---|---|
| Play / Pause | `Space` | ▶/⏸ button |
| Reset to top | `R` | ↺ button |
| Speed up | `↑` | Speed slider |
| Speed down | `↓` | Speed slider |
| Jump back ~200px | `←` | — |
| Jump forward ~200px | `→` | — |
| Toggle fullscreen | `F` | ⛶ button |
| Exit fullscreen | `Esc` | — |
| Back to editor | — | ← Edit button |

### Settings (⚙ button in teleprompter)
- **Speed** — scroll speed in px/second (5–300)
- **Font size** — text size in the teleprompter (20–80px)
- **Width** — text column width as % of screen (30–100%)
- **Line height** — spacing between lines (1.2–3.0)
- **Guide line %** — vertical position of the reading guide
- **WPM estimate** — words per minute for read-time calculations
- **Mirror** — horizontally flip the text (for mirror/beam splitter setups)

## Recording Workflow

1. Write or paste your script in the editor
2. Add `# Section Headings` to break it into logical segments
3. Note estimated read times in the segment panel on the right
4. Switch to **▶ Preview**, go fullscreen with `F`
5. Use the segment list on the left to jump between takes
6. Hit `Space` to start/pause, `R` to reset a segment

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Open `dist/index.html` directly in a browser (no server needed).
