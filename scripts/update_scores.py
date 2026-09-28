#!/usr/bin/env python3
"""Update src/data.json from a WhatsApp chat export of the Workdle group.

Usage:
    python3 scripts/update_scores.py path/to/_chat.txt [--from YYYY-MM-DD] [--through YYYY-MM-DD] [--dry-run]

By default it re-parses from (last date in data.json - 1 day) through
(last date in the chat - 1 day), i.e. a one-day overlap and "today" excluded.
Days in that window are replaced; everything before it is kept untouched.
See CLAUDE.md for the full methodology.
"""
import argparse
import json
import re
import sys
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "src" / "data.json"

NAME_MAP = {
    "Nick Whitworth": "Nick",
    "Andrew Simmons": "Andy",
    "Yan Johnson": "Yan",
    "Rishi": "Rishi",
}
PLAYERS = ["Nick", "Andy", "Yan", "Rishi"]
GAMES = ["Wordle", "Connections", "Tango", "Queens", "Pinpoint", "Patches", "Zip"]
MISSED = 5

MSG_START = re.compile(r'^\[(\d{2})/(\d{2})/(\d{4}), \d{2}:\d{2}:\d{2}\] ([^:]+): (.*)$')
WORDLE_RE = re.compile(r'Wordle\s+([\d,]+)\s+([1-6X])/6')
TIME_GAME_RE = re.compile(r'\b(Tango|Queens|Zip|Patches)\s*#\s*(\d+)[^\n]*\|\s*(\d+):(\d{2})')
PINPOINT_HDR_RE = re.compile(r'Pinpoint\s*#\s*(\d+)')
PINPOINT_GUESSES_RE = re.compile(r'Pinpoint\s*#\s*\d+[^\n]*\|\s*(\d+)\s*guess')
PINPOINT_PIN_RE = re.compile(r'Pinpoint\s*#\s*\d+[^\n]*\|\s*(\d)\s*📌')  # "Pinpoint #815 | 5 📌"
PINPOINT_FRACTION_RE = re.compile(r'\((\d)/5\)')
CONNECTIONS_HDR_RE = re.compile(r'Connections\s*\nPuzzle\s*#\s*(\d+)')
GRID_ROW_RE = re.compile(r'^(🟨|🟩|🟦|🟪){4}$')


def load_messages(path):
    msgs, cur = [], None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.rstrip("\n").replace("‎", "").replace("‏", "")
            m = MSG_START.match(line)
            if m:
                if cur:
                    msgs.append(cur)
                d, mo, y, sender, body = m.groups()
                cur = {"date": date(int(y), int(mo), int(d)), "sender": sender.strip(), "body": body}
            elif cur is not None:
                cur["body"] += "\n" + line
    if cur:
        msgs.append(cur)
    return msgs


def parse_wordle(body):
    m = WORDLE_RE.search(body)
    if not m:
        return None
    return int(m.group(1).replace(",", "")), 7 if m.group(2) == "X" else int(m.group(2))


def parse_connections(body):
    m = CONNECTIONS_HDR_RE.search(body)
    if not m:
        return None
    rows = [ln.strip() for ln in body.split("\n") if GRID_ROW_RE.match(ln.strip())]
    if not rows:
        return None
    solid = sum(1 for r in rows if len(set(r)) == 1)
    return int(m.group(1)), (4 + len(rows) - solid) if solid == 4 else 8


def parse_time_games(body):
    for m in TIME_GAME_RE.finditer(body):
        yield m.group(1), int(m.group(2)), int(m.group(3)) * 60 + int(m.group(4))


def parse_pinpoint(body):
    m = PINPOINT_HDR_RE.search(body)
    if not m:
        return None
    num = int(m.group(1))
    g = (PINPOINT_GUESSES_RE.search(body) or PINPOINT_PIN_RE.search(body)
         or PINPOINT_FRACTION_RE.search(body))
    if g:
        return num, int(g.group(1))
    if "📌" in body:
        # Solved but in a format we don't recognise: count 🤔 before 📌.
        before = body.split("📌", 1)[0]
        guesses = before.count("🤔") + 1
        print(f"WARNING: unrecognised Pinpoint #{num} format, guessed {guesses} guess(es) "
              f"from 🤔 count: {body.splitlines()[0]!r}", file=sys.stderr)
        return num, guesses
    return num, 6


def extract_records(msgs):
    """game -> list of (puzzle_num, send_date, player, score), in chat order."""
    records = {g: [] for g in GAMES}
    for msg in msgs:
        player = NAME_MAP.get(msg["sender"])
        if not player:
            continue
        body, d = msg["body"], msg["date"]
        if r := parse_wordle(body):
            records["Wordle"].append((r[0], d, player, r[1]))
        if r := parse_connections(body):
            records["Connections"].append((r[0], d, player, r[1]))
        for game, num, secs in parse_time_games(body):
            records[game].append((num, d, player, secs))
        if r := parse_pinpoint(body):
            records["Pinpoint"].append((r[0], d, player, r[1]))
    return records


def puzzle_offsets(records):
    """Per game, the most common (send_date ordinal - puzzle number).

    Each game publishes one numbered puzzle per day, so this offset maps a
    puzzle number to its real calendar day, correcting after-midnight posts.
    """
    offsets = {}
    for g, recs in records.items():
        c = Counter(d.toordinal() - num for num, d, _, _ in recs)
        if c:
            offsets[g] = c.most_common(1)[0][0]
    return offsets


def compute_ranks(raw_scores):
    ordered = sorted(raw_scores, key=raw_scores.get)
    ranks, i = {}, 0
    while i < len(ordered):
        j = i
        while j + 1 < len(ordered) and raw_scores[ordered[j + 1]] == raw_scores[ordered[i]]:
            j += 1
        for k in range(i, j + 1):
            ranks[ordered[k]] = i + 1
        i = j + 1
    return {**ranks, **{p: MISSED for p in PLAYERS if p not in ranks}}


def build_days(records, offsets, start, end):
    scores = {}  # date -> game -> player -> raw score (first occurrence wins)
    for g, recs in records.items():
        for num, _, player, score in recs:
            d = date.fromordinal(offsets[g] + num)
            if start <= d <= end:
                scores.setdefault(d, {}).setdefault(g, {}).setdefault(player, score)
    days = []
    d = start
    while d <= end:
        if d in scores:  # skip days where nobody posted anything
            ranks = {g: compute_ranks(scores[d][g]) if g in scores[d] else {p: MISSED for p in PLAYERS}
                     for g in GAMES}
            days.append({"date": d.isoformat(), "ranks": ranks})
        d += timedelta(days=1)
    return days


def write_data(days):
    body = ",\n".join(json.dumps(d, ensure_ascii=False, separators=(",", ":")) for d in days)
    DATA.write_text("[\n" + body + "\n]\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("chat", help="WhatsApp .txt export")
    ap.add_argument("--from", dest="start", type=date.fromisoformat,
                    help="first day to (re)parse; default = last date in data.json - 1 day")
    ap.add_argument("--through", dest="end", type=date.fromisoformat,
                    help="last day to parse; default = last date in the chat - 1 day (today excluded)")
    ap.add_argument("--dry-run", action="store_true", help="report changes without writing data.json")
    args = ap.parse_args()

    existing = json.loads(DATA.read_text(encoding="utf-8"))
    msgs = load_messages(args.chat)
    if not msgs:
        sys.exit("No messages found — is this a WhatsApp export?")

    start = args.start or date.fromisoformat(existing[-1]["date"]) - timedelta(days=1)
    end = args.end or msgs[-1]["date"] - timedelta(days=1)
    if msgs[0]["date"] > start:
        print(f"WARNING: chat starts {msgs[0]['date']}, after the parse start {start}; "
              f"days before the chat starts will be dropped.", file=sys.stderr)

    records = extract_records(msgs)
    offsets = puzzle_offsets(records)
    new_days = build_days(records, offsets, start, end)

    # Exports can silently miss whole stretches of messages, so a day with no
    # parsed scores keeps its existing entry rather than being deleted.
    merged = {d["date"]: d for d in existing}
    old_by_date = dict(merged)
    for d in new_days:
        if merged.get(d["date"]) != d:  # keep unchanged days byte-for-byte (key order) for clean diffs
            merged[d["date"]] = d
    merged = [merged[k] for k in sorted(merged)]

    changed = [d for d in new_days if d["date"] in old_by_date and old_by_date[d["date"]] != d]
    added = [d["date"] for d in new_days if d["date"] not in old_by_date]
    missing = [d["date"] for d in existing
               if start <= date.fromisoformat(d["date"]) <= end and d["date"] not in {n["date"] for n in new_days}]

    print(f"Chat covers {msgs[0]['date']} → {msgs[-1]['date']}; parsing {start} → {end}")
    print(f"Days: {len(existing)} → {len(merged)} (added {len(added)}, changed {len(changed)})")
    if added:
        print(f"  added: {added[0]} … {added[-1]}" if len(added) > 1 else f"  added: {added[0]}")
    if missing:
        print(f"  WARNING: no messages in this export for {len(missing)} existing day(s) "
              f"({missing[0]} … {missing[-1]}); kept as they were.")
    for d in changed:
        old = old_by_date[d["date"]]
        print(f"  changed {d['date']}:")
        for g in GAMES:
            o, n = old["ranks"].get(g, {}), d["ranks"][g]
            if o != n:
                fmt = lambda r: " ".join(f"{p}{r.get(p, MISSED) if r.get(p, MISSED) < MISSED else '–'}" for p in PLAYERS)
                lost = [p for p in PLAYERS if o.get(p, MISSED) < MISSED and n[p] == MISSED]
                note = f"  ⚠ lost score for {', '.join(lost)}" if lost else ""
                print(f"    {g:<12} {fmt(o)}  →  {fmt(n)}{note}")
    print(f"Last date now: {merged[-1]['date']}")

    if args.dry_run:
        print("Dry run — data.json not written.")
    else:
        write_data(merged)
        print(f"Wrote {DATA.relative_to(DATA.parent.parent)}")


if __name__ == "__main__":
    main()
