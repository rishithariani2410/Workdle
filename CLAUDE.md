# Workdle

A single-page React app (`react-scripts`) that tracks a friend group's daily
scores across NYT/LinkedIn puzzle games (Wordle, Connections, Tango, Queens,
Pinpoint, Patches, Zip) and shows leaderboards/trends.

- `src/App.jsx` — the entire app: UI, scoring logic, and the hardcoded
  `SEED_DATA` array (all historical daily results, one object per day).
- `src/index.js` — mounts `<App />`.
- `public/index.html` — HTML shell.
- Deployed on Vercel; pushing to `main` auto-redeploys in ~60s.

## When the user shares a WhatsApp `.txt` chat export

This repo has no in-app uploader — updating scores means **regenerating
`SEED_DATA` in `src/App.jsx` from a WhatsApp export file the user pastes/
uploads in chat**. Follow the methodology below exactly.

### Data Sources

1. **WhatsApp chat export** (primary) — `.txt` file exported from the Workdle WhatsApp group
2. **Google Sheet CSV** (fallback) — covers Feb 2025–Jan 2026 where chat data was missing

### Parsing Logic

**Message format**: `[DD/MM/YYYY, HH:MM:SS] Sender Name: message text`
Split the file into multiline messages via this header regex, then process each message individually.

**Player name mapping**

| WhatsApp Name | App Name |
|---|---|
| Andrew Simmons | Andy |
| Nick Whitworth | Nick |
| Yan Johnson | Yan |
| Rishi | Rishi |

Ignore all other senders (other group members not tracked in the leaderboard).

**Per-game parsing**

- **Wordle** — regex `Wordle [\d,]+ (\d|X)/6\*?`. Score = guesses (1–6), `X` = 7 (fail). Trailing `*` (hard mode) treated identically.
- **Connections** — count all lines matching `^[🟨🟩🟦🟪]{4}$` (attempt rows). Count solid-colour rows (all 4 emoji identical) = successful group solves. If solid rows < 4 → failed to complete → score = **8**. Otherwise score = 4 + (total rows − solid rows), i.e. 4 = perfect, 7 = 3 mistakes. Lower is better.
- **Tango / Queens / Patches / Zip** — regex `GameName #\d+ \| (\d+):(\d+)`. Convert MM:SS to total seconds. Lower is better.
- **Pinpoint** — try `| N guess` pattern first, then `(N/5)`, then count 🤔 emojis before 📌 (solved on Nth guess). If `Pinpoint #` present but no 📌 anywhere → fail = **6**. Score range 1–5, fail = 6. Lower is better.

### Ranking Logic

For each game each day, sort players by raw score ascending (lower = better). Assign ranks using standard competition ranking — ties share the lower position and the next rank skips. Missing = **rank 5** (default, worse than any played position).

```python
def compute_ranks(raw_scores):
    present = {p: v for p, v in raw_scores.items() if v is not None}
    sorted_p = sorted(present, key=lambda p: present[p])
    ranks = {}
    i = 0
    while i < len(sorted_p):
        j = i
        while j < len(sorted_p) - 1 and present[sorted_p[j+1]] == present[sorted_p[i]]:
            j += 1
        for k in range(i, j + 1):
            ranks[sorted_p[k]] = i + 1
        i = j + 1
    for p in ["Nick", "Andy", "Yan", "Rishi"]:
        if p not in ranks:
            ranks[p] = 5  # missed = default rank
    return ranks
```

Examples: all different → 1,2,3,4. Two tied for 1st → 1,1,3,4. Two tied for 2nd → 1,2,2,4. Missed → 5 regardless of ties elsewhere.

### Data structure stored per day

Only ranks (1–5) are stored — no raw scores.

```json
{
  "date": "2026-08-04",
  "ranks": {
    "Wordle":      {"Nick": 1, "Andy": 2, "Yan": 2, "Rishi": 4},
    "Connections": {"Nick": 3, "Andy": 1, "Yan": 5, "Rishi": 2},
    "Tango":       {"Nick": 2, "Andy": 1, "Yan": 3, "Rishi": 4},
    "Queens":      {"Nick": 1, "Andy": 3, "Yan": 2, "Rishi": 4},
    "Pinpoint":    {"Nick": 2, "Andy": 1, "Yan": 3, "Rishi": 5},
    "Patches":     {"Nick": 1, "Andy": 2, "Yan": 3, "Rishi": 4},
    "Zip":         {"Nick": 3, "Andy": 1, "Yan": 2, "Rishi": 4}
  }
}
```

### Update process

1. Take the WhatsApp export `.txt` from the Workdle group (as shared by the user in chat).
2. Parse only from **(last date in app − 1 day)** onwards — overlap by 1 day to catch any late-posted scores.
3. Remove that overlap day from the existing `SEED_DATA`, append the freshly parsed version.
4. **Exclude today** — always drop the most recent date, since scores trickle in through the day.
5. Replace `const SEED_DATA=[...]` in `src/App.jsx` with the new merged array.
6. Commit and push → Vercel auto-redeploys in ~60 seconds.

### Key edge cases

| Case | Handling |
|---|---|
| Connections failure | Fewer than 4 solid-colour rows = didn't complete = score **8** (worse than max 3 mistakes = 7) |
| Wordle hard mode | `4/6*` treated same as `4/6` |
| No data day | If nobody played a game, skip it entirely — don't add default 5s to everyone |
| Today excluded | Always drop the most recent date; scores come in throughout the day |
| Overlap on re-parse | Always re-parse the last known day in case some players posted late |
| Duplicate messages | First occurrence per player per game per day wins; subsequent ignored |

### Scoring modes (in-app toggle)

- **🏆 Regularity rewarded** (default) — missing a game = rank 5, worse than last place. Rewards consistent daily participation.
- **🎯 Skill only** — a game only counts for a given day if all 4 players played it; if anyone missed, that game is skipped for everyone that day. Purely measures performance when everyone showed up.

### Games reference

| Game | Metric | Direction | Notes |
|---|---|---|---|
| Wordle | Guesses (1–6) | Lower better | Fail = 7 |
| Connections | Rows used (4–7) | Lower better | Fail = 8 |
| Tango | Seconds | Lower better | LinkedIn puzzle |
| Queens | Seconds | Lower better | LinkedIn puzzle |
| Pinpoint | Guesses (1–5) | Lower better | Fail = 6 |
| Patches | Seconds | Lower better | LinkedIn puzzle |
| Zip | Seconds | Lower better | LinkedIn puzzle |

### File locations

| File | Purpose |
|---|---|
| `src/App.jsx` | Full React app including embedded `SEED_DATA` |
| `public/index.html` | HTML shell required by Vercel |
| `package.json` | Dependencies (React 18, recharts) |
