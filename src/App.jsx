import { useState, useMemo } from "react";

// ─── SEED DATA (90 days, 25 Feb – 25 May 2026) ───────────────────────────────
const SEED_DATA=[{"date":"2026-02-25","ranks":{"Wordle":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Connections":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Tango":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Queens":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Pinpoint":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5}}},{"date":"2026-02-26","ranks":{"Wordle":{"Andy":1,"Rishi":2,"Nick":3,"Yan":4},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Tango":{"Andy":1,"Yan":2,"Nick":3,"Rishi":4},"Queens":{"Nick":1,"Rishi":2,"Yan":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":2,"Yan":2,"Rishi":2},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-02-27","ranks":{"Wordle":{"Yan":1,"Andy":2,"Nick":3,"Rishi":5},"Connections":{"Yan":1,"Nick":2,"Andy":3,"Rishi":5},"Tango":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Queens":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Pinpoint":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-02-28","ranks":{"Wordle":{"Yan":1,"Rishi":1,"Andy":3,"Nick":4},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Nick":1,"Rishi":2,"Yan":3,"Andy":4},"Pinpoint":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Rishi":2,"Andy":3,"Nick":4}}},{"date":"2026-03-01","ranks":{"Wordle":{"Nick":1,"Rishi":2,"Andy":3,"Yan":4},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":4},"Tango":{"Nick":1,"Andy":2,"Yan":3,"Rishi":5},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":5},"Pinpoint":{"Nick":1,"Andy":1,"Yan":5,"Rishi":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Nick":1,"Andy":5,"Yan":5,"Rishi":5}}},{"date":"2026-03-02","ranks":{"Wordle":{"Andy":1,"Yan":2,"Nick":3,"Rishi":4},"Connections":{"Andy":1,"Yan":2,"Nick":3,"Rishi":3},"Tango":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Queens":{"Nick":1,"Andy":2,"Yan":2,"Rishi":4},"Pinpoint":{"Nick":1,"Andy":1,"Yan":1,"Rishi":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-03-03","ranks":{"Wordle":{"Nick":1,"Yan":2,"Andy":3,"Rishi":5},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Pinpoint":{"Rishi":1,"Nick":2,"Andy":3,"Yan":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5}}},{"date":"2026-03-04","ranks":{"Wordle":{"Andy":1,"Yan":1,"Rishi":3,"Nick":4},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":4},"Tango":{"Andy":1,"Nick":2,"Yan":3,"Rishi":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":2,"Yan":2,"Rishi":2},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-03-05","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Connections":{"Nick":1,"Andy":2,"Rishi":3,"Yan":4},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Yan":1,"Rishi":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4}}},{"date":"2026-03-06","ranks":{"Wordle":{"Andy":1,"Yan":1,"Nick":3,"Rishi":5},"Connections":{"Nick":1,"Yan":2,"Andy":5,"Rishi":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Nick":1,"Rishi":2,"Andy":3,"Yan":4},"Pinpoint":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":1,"Nick":3,"Yan":4}}},{"date":"2026-03-07","ranks":{"Wordle":{"Andy":1,"Yan":1,"Rishi":1,"Nick":4},"Connections":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Tango":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Nick":1,"Yan":1,"Andy":3,"Rishi":3},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5}}},{"date":"2026-03-08","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Connections":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Tango":{"Andy":1,"Rishi":2,"Nick":3,"Yan":4},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5}}},{"date":"2026-03-09","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Andy":3,"Yan":4},"Connections":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4},"Tango":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Queens":{"Andy":1,"Yan":2,"Nick":3,"Rishi":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Andy":2,"Nick":3,"Rishi":5}}},{"date":"2026-03-10","ranks":{"Wordle":{"Yan":1,"Nick":2,"Andy":2,"Rishi":5},"Connections":{"Andy":1,"Nick":2,"Yan":3,"Rishi":5},"Tango":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Andy":1,"Nick":2,"Yan":2,"Rishi":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-03-11","ranks":{"Wordle":{"Andy":1,"Rishi":1,"Nick":3,"Yan":3},"Connections":{"Andy":1,"Yan":1,"Nick":3,"Rishi":3},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Nick":1,"Andy":2,"Yan":3,"Rishi":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4}}},{"date":"2026-03-12","ranks":{"Wordle":{"Yan":1,"Nick":2,"Andy":3,"Rishi":3},"Connections":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":2,"Andy":4},"Queens":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Pinpoint":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4}}},{"date":"2026-03-13","ranks":{"Wordle":{"Andy":1,"Nick":2,"Rishi":3,"Yan":4},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Yan":1,"Andy":3,"Rishi":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4}}},{"date":"2026-03-14","ranks":{"Wordle":{"Yan":1,"Rishi":1,"Nick":3,"Andy":3},"Connections":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5},"Queens":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Pinpoint":{"Andy":1,"Yan":1,"Nick":3,"Rishi":3},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4}}},{"date":"2026-03-15","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Connections":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4}}},{"date":"2026-03-16","ranks":{"Wordle":{"Yan":1,"Nick":2,"Andy":3,"Rishi":3},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Andy":1,"Yan":2,"Rishi":2,"Nick":4},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Rishi":1,"Nick":3,"Andy":4}}},{"date":"2026-03-17","ranks":{"Wordle":{"Andy":1,"Rishi":1,"Nick":3,"Yan":3},"Connections":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Tango":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Queens":{"Rishi":1,"Yan":2,"Nick":3,"Andy":3},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4}}},{"date":"2026-03-18","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":5},"Connections":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Tango":{"Nick":1,"Yan":2,"Rishi":2,"Andy":4},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Pinpoint":{"Andy":1,"Yan":2,"Nick":3,"Rishi":3},"Patches":{"Nick":5,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5}}},{"date":"2026-03-19","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Connections":{"Andy":1,"Yan":2,"Rishi":3,"Nick":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Andy":1,"Nick":2,"Yan":2,"Rishi":4},"Patches":{"Andy":1,"Nick":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4}}},{"date":"2026-03-20","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Connections":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5},"Queens":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4},"Pinpoint":{"Rishi":1,"Nick":2,"Yan":2,"Andy":4},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Nick":2,"Rishi":3,"Yan":4}}},{"date":"2026-03-21","ranks":{"Wordle":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Queens":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Pinpoint":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5}}},{"date":"2026-03-22","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Connections":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Queens":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-03-23","ranks":{"Wordle":{"Nick":1,"Rishi":2,"Andy":3,"Yan":4},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":4},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Yan":2,"Andy":4}}},{"date":"2026-03-24","ranks":{"Wordle":{"Nick":1,"Rishi":2,"Andy":3,"Yan":3},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Rishi":1,"Nick":2,"Andy":2,"Yan":2},"Patches":{"Nick":1,"Andy":5,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4}}},{"date":"2026-03-25","ranks":{"Wordle":{"Rishi":1,"Andy":2,"Nick":3,"Yan":3},"Connections":{"Nick":1,"Rishi":1,"Andy":5,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":3},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5}}},{"date":"2026-03-26","ranks":{"Wordle":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Nick":1,"Rishi":1,"Yan":3,"Andy":4},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-03-27","ranks":{"Wordle":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Connections":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Pinpoint":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Patches":{"Nick":1,"Andy":1,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4}}},{"date":"2026-03-28","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Connections":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Andy":1,"Yan":2,"Nick":3,"Rishi":3},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-03-29","ranks":{"Wordle":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Queens":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Patches":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5}}},{"date":"2026-03-30","ranks":{"Wordle":{"Andy":1,"Nick":2,"Yan":2,"Rishi":4},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Queens":{"Yan":1,"Rishi":2,"Andy":3,"Nick":4},"Pinpoint":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5}}},{"date":"2026-03-31","ranks":{"Wordle":{"Nick":1,"Yan":1,"Andy":3,"Rishi":4},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Tango":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Nick":1,"Yan":1,"Andy":3,"Rishi":4},"Patches":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Rishi":2,"Andy":3,"Nick":4}}},{"date":"2026-04-01","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Connections":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Tango":{"Rishi":1,"Yan":2,"Andy":3,"Nick":5},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":2},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-04-02","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Andy":3,"Yan":3},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":4},"Pinpoint":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Patches":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Nick":2,"Andy":2,"Yan":4}}},{"date":"2026-04-03","ranks":{"Wordle":{"Nick":1,"Andy":2,"Rishi":2,"Yan":4},"Connections":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Queens":{"Nick":1,"Yan":2,"Andy":3,"Rishi":4},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Yan":2,"Andy":3,"Rishi":5},"Zip":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4}}},{"date":"2026-04-04","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Zip":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5}}},{"date":"2026-04-05","ranks":{"Wordle":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Patches":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Zip":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5}}},{"date":"2026-04-06","ranks":{"Wordle":{"Andy":1,"Yan":2,"Rishi":2,"Nick":4},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5}}},{"date":"2026-04-07","ranks":{"Wordle":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Connections":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":2},"Patches":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Rishi":1,"Nick":3,"Andy":4}}},{"date":"2026-04-08","ranks":{"Wordle":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Connections":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Queens":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Patches":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":4}}},{"date":"2026-04-09","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Connections":{"Rishi":1,"Nick":5,"Andy":5,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":5},"Pinpoint":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Patches":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Zip":{"Yan":1,"Nick":2,"Rishi":3,"Andy":5}}},{"date":"2026-04-10","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Connections":{"Yan":1,"Nick":2,"Andy":2,"Rishi":2},"Tango":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Queens":{"Rishi":1,"Nick":2,"Yan":3,"Andy":5},"Pinpoint":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Patches":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Zip":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5}}},{"date":"2026-04-11","ranks":{"Wordle":{"Nick":1,"Yan":1,"Andy":3,"Rishi":3},"Connections":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Tango":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Queens":{"Andy":1,"Nick":2,"Yan":3,"Rishi":4},"Pinpoint":{"Andy":1,"Yan":2,"Nick":3,"Rishi":4},"Patches":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Zip":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4}}},{"date":"2026-04-12","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Patches":{"Andy":1,"Nick":2,"Yan":5,"Rishi":5},"Zip":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4}}},{"date":"2026-04-13","ranks":{"Wordle":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Nick":1,"Andy":1,"Yan":1,"Rishi":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Yan":1,"Rishi":1,"Nick":3,"Andy":5}}},{"date":"2026-04-14","ranks":{"Wordle":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Connections":{"Andy":1,"Rishi":2,"Nick":5,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Queens":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Pinpoint":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":5,"Yan":5},"Zip":{"Yan":1,"Andy":2,"Rishi":2,"Nick":5}}},{"date":"2026-04-15","ranks":{"Wordle":{"Rishi":1,"Andy":2,"Yan":2,"Nick":4},"Connections":{"Andy":1,"Rishi":2,"Nick":5,"Yan":5},"Tango":{"Nick":1,"Andy":2,"Yan":3,"Rishi":4},"Queens":{"Nick":1,"Yan":1,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4}}},{"date":"2026-04-16","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":2,"Rishi":4},"Connections":{"Yan":1,"Andy":2,"Nick":3,"Rishi":3},"Tango":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Queens":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Rishi":2,"Andy":3,"Yan":3},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Nick":1,"Yan":2,"Rishi":3,"Andy":5}}},{"date":"2026-04-17","ranks":{"Wordle":{"Yan":1,"Rishi":2,"Andy":3,"Nick":5},"Connections":{"Andy":1,"Rishi":2,"Nick":5,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Andy":1,"Nick":2,"Yan":3,"Rishi":5},"Pinpoint":{"Andy":1,"Yan":1,"Rishi":1,"Nick":4},"Patches":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Zip":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4}}},{"date":"2026-04-18","ranks":{"Wordle":{"Andy":1,"Nick":2,"Rishi":2,"Yan":4},"Connections":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Pinpoint":{"Yan":1,"Rishi":1,"Nick":3,"Andy":3},"Patches":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4}}},{"date":"2026-04-19","ranks":{"Wordle":{"Yan":1,"Nick":2,"Rishi":2,"Andy":4},"Connections":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5},"Queens":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5}}},{"date":"2026-04-20","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Andy":1,"Nick":2,"Yan":3,"Rishi":3},"Queens":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Pinpoint":{"Andy":1,"Nick":2,"Yan":2,"Rishi":4},"Patches":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Zip":{"Rishi":1,"Andy":2,"Yan":2,"Nick":4}}},{"date":"2026-04-21","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Connections":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4},"Pinpoint":{"Andy":1,"Rishi":2,"Nick":3,"Yan":3},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Andy":1,"Rishi":1,"Yan":3,"Nick":4}}},{"date":"2026-04-22","ranks":{"Wordle":{"Nick":1,"Yan":1,"Andy":3,"Rishi":3},"Connections":{"Andy":1,"Yan":1,"Nick":3,"Rishi":3},"Tango":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Patches":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Zip":{"Yan":1,"Rishi":2,"Andy":3,"Nick":4}}},{"date":"2026-04-23","ranks":{"Wordle":{"Andy":1,"Rishi":2,"Yan":3,"Nick":5},"Connections":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Tango":{"Andy":1,"Rishi":1,"Yan":3,"Nick":5},"Queens":{"Yan":1,"Rishi":2,"Andy":3,"Nick":5},"Pinpoint":{"Andy":1,"Rishi":2,"Yan":3,"Nick":5},"Patches":{"Yan":1,"Andy":2,"Rishi":3,"Nick":5},"Zip":{"Yan":1,"Rishi":2,"Andy":3,"Nick":5}}},{"date":"2026-04-24","ranks":{"Wordle":{"Andy":1,"Rishi":1,"Nick":3,"Yan":3},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Patches":{"Andy":1,"Yan":2,"Nick":3,"Rishi":4},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-04-25","ranks":{"Wordle":{"Nick":1,"Yan":1,"Andy":3,"Rishi":4},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":5},"Queens":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5}}},{"date":"2026-04-26","ranks":{"Wordle":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-04-27","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Yan":1,"Rishi":2,"Nick":3,"Andy":3},"Patches":{"Yan":1,"Rishi":1,"Andy":3,"Nick":5},"Zip":{"Andy":1,"Yan":1,"Rishi":3,"Nick":4}}},{"date":"2026-04-28","ranks":{"Wordle":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4},"Connections":{"Andy":1,"Yan":1,"Rishi":3,"Nick":5},"Tango":{"Andy":1,"Rishi":2,"Yan":3,"Nick":5},"Queens":{"Yan":1,"Rishi":2,"Andy":3,"Nick":5},"Pinpoint":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Yan":3,"Nick":5},"Zip":{"Andy":1,"Nick":5,"Yan":5,"Rishi":5}}},{"date":"2026-04-29","ranks":{"Wordle":{"Yan":1,"Nick":2,"Rishi":2,"Andy":4},"Connections":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Tango":{"Nick":1,"Rishi":2,"Yan":3,"Andy":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Patches":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Zip":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4}}},{"date":"2026-04-30","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":2,"Rishi":4},"Connections":{"Yan":1,"Rishi":1,"Andy":3,"Nick":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":5},"Queens":{"Yan":1,"Andy":2,"Rishi":3,"Nick":4},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Rishi":1,"Yan":3,"Andy":4},"Zip":{"Rishi":1,"Andy":2,"Yan":2,"Nick":4}}},{"date":"2026-05-01","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":2,"Rishi":2},"Connections":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Tango":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Queens":{"Rishi":1,"Yan":2,"Andy":3,"Nick":5},"Pinpoint":{"Andy":1,"Nick":5,"Yan":5,"Rishi":5},"Patches":{"Andy":1,"Rishi":2,"Nick":5,"Yan":5},"Zip":{"Rishi":1,"Nick":5,"Andy":5,"Yan":5}}},{"date":"2026-05-02","ranks":{"Wordle":{"Andy":1,"Nick":2,"Yan":3,"Rishi":4},"Connections":{"Andy":1,"Yan":1,"Rishi":1,"Nick":4},"Tango":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Queens":{"Andy":1,"Rishi":2,"Nick":3,"Yan":4},"Pinpoint":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Patches":{"Nick":1,"Yan":2,"Rishi":3,"Andy":5},"Zip":{"Yan":1,"Andy":2,"Rishi":2,"Nick":4}}},{"date":"2026-05-03","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Andy":2,"Yan":2},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5},"Queens":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Yan":5,"Rishi":5},"Patches":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-05-04","ranks":{"Wordle":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Pinpoint":{"Nick":1,"Rishi":1,"Andy":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-05-05","ranks":{"Wordle":{"Andy":1,"Rishi":1,"Nick":3,"Yan":4},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Pinpoint":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Patches":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Zip":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4}}},{"date":"2026-05-06","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Yan":3,"Andy":4},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Nick":2,"Andy":3,"Rishi":4},"Pinpoint":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5}}},{"date":"2026-05-07","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Connections":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Pinpoint":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5}}},{"date":"2026-05-08","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Yan":3,"Andy":4},"Connections":{"Rishi":1,"Nick":2,"Andy":2,"Yan":2},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Andy":1,"Yan":2,"Rishi":3,"Nick":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-05-09","ranks":{"Wordle":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Queens":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":2,"Yan":5}}},{"date":"2026-05-10","ranks":{"Wordle":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5}}},{"date":"2026-05-11","ranks":{"Wordle":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Connections":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Yan":3,"Andy":4},"Queens":{"Yan":1,"Rishi":1,"Nick":3,"Andy":3},"Pinpoint":{"Andy":1,"Nick":2,"Yan":2,"Rishi":2},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Rishi":1,"Andy":2,"Yan":2,"Nick":4}}},{"date":"2026-05-12","ranks":{"Wordle":{"Rishi":1,"Nick":2,"Yan":2,"Andy":4},"Connections":{"Andy":1,"Rishi":2,"Nick":5,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Andy":1,"Yan":1,"Nick":3,"Rishi":3},"Patches":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Zip":{"Andy":1,"Nick":2,"Rishi":2,"Yan":4}}},{"date":"2026-05-13","ranks":{"Wordle":{"Andy":1,"Nick":2,"Yan":3,"Rishi":4},"Connections":{"Nick":1,"Andy":1,"Yan":1,"Rishi":1},"Tango":{"Andy":1,"Yan":2,"Rishi":2,"Nick":4},"Queens":{"Rishi":1,"Yan":2,"Andy":3,"Nick":5},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":3},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-05-14","ranks":{"Wordle":{"Andy":1,"Yan":1,"Nick":3,"Rishi":3},"Connections":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Andy":1,"Yan":1,"Rishi":3,"Nick":4},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Patches":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-05-15","ranks":{"Wordle":{"Nick":1,"Andy":1,"Yan":3,"Rishi":3},"Connections":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Tango":{"Yan":1,"Rishi":2,"Andy":3,"Nick":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Patches":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4},"Zip":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5}}},{"date":"2026-05-16","ranks":{"Wordle":{"Yan":1,"Andy":2,"Nick":3,"Rishi":3},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4},"Queens":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Patches":{"Andy":1,"Yan":2,"Rishi":3,"Nick":4},"Zip":{"Andy":1,"Yan":2,"Nick":3,"Rishi":4}}},{"date":"2026-05-17","ranks":{"Wordle":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Queens":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5},"Patches":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Zip":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5}}},{"date":"2026-05-18","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":2,"Rishi":2},"Connections":{"Andy":1,"Yan":1,"Rishi":3,"Nick":4},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":4},"Queens":{"Yan":1,"Rishi":2,"Nick":3,"Andy":4},"Pinpoint":{"Rishi":1,"Nick":2,"Andy":2,"Yan":4},"Patches":{"Andy":1,"Yan":1,"Rishi":3,"Nick":4},"Zip":{"Rishi":1,"Andy":2,"Yan":3,"Nick":4}}},{"date":"2026-05-19","ranks":{"Wordle":{"Rishi":1,"Yan":2,"Nick":3,"Andy":3},"Connections":{"Andy":1,"Rishi":1,"Nick":5,"Yan":5},"Tango":{"Andy":1,"Nick":2,"Rishi":3,"Yan":4},"Queens":{"Nick":1,"Yan":1,"Andy":3,"Rishi":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Patches":{"Andy":1,"Rishi":2,"Nick":3,"Yan":4},"Zip":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4}}},{"date":"2026-05-20","ranks":{"Wordle":{"Nick":1,"Yan":2,"Rishi":2,"Andy":4},"Connections":{"Yan":1,"Andy":2,"Nick":3,"Rishi":4},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Andy":1,"Nick":2,"Rishi":3,"Yan":4},"Pinpoint":{"Yan":1,"Nick":2,"Andy":2,"Rishi":4},"Patches":{"Rishi":1,"Yan":2,"Andy":3,"Nick":4},"Zip":{"Nick":1,"Rishi":2,"Yan":3,"Andy":4}}},{"date":"2026-05-21","ranks":{"Wordle":{"Andy":1,"Yan":1,"Rishi":1,"Nick":4},"Connections":{"Nick":1,"Andy":1,"Rishi":1,"Yan":5},"Tango":{"Rishi":1,"Yan":2,"Nick":3,"Andy":4},"Queens":{"Yan":1,"Nick":2,"Rishi":3,"Andy":4},"Pinpoint":{"Nick":1,"Andy":1,"Yan":1,"Rishi":4},"Patches":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Zip":{"Yan":1,"Rishi":1,"Andy":3,"Nick":4}}},{"date":"2026-05-22","ranks":{"Wordle":{"Nick":1,"Yan":1,"Rishi":1,"Andy":4},"Connections":{"Rishi":1,"Andy":2,"Nick":3,"Yan":3},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Pinpoint":{"Andy":1,"Nick":2,"Rishi":2,"Yan":5},"Patches":{"Nick":1,"Rishi":2,"Andy":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5}}},{"date":"2026-05-23","ranks":{"Wordle":{"Nick":1,"Andy":2,"Yan":2,"Rishi":4},"Connections":{"Nick":1,"Yan":2,"Andy":3,"Rishi":4},"Tango":{"Andy":1,"Rishi":2,"Yan":3,"Nick":4},"Queens":{"Nick":1,"Andy":2,"Yan":3,"Rishi":4},"Pinpoint":{"Nick":1,"Andy":2,"Rishi":2,"Yan":5},"Patches":{"Rishi":1,"Nick":2,"Andy":3,"Yan":5},"Zip":{"Nick":1,"Yan":2,"Rishi":3,"Andy":4}}},{"date":"2026-05-24","ranks":{"Wordle":{"Nick":1,"Rishi":1,"Yan":3,"Andy":4},"Connections":{"Nick":1,"Andy":2,"Yan":2,"Rishi":4},"Tango":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5},"Queens":{"Nick":1,"Andy":2,"Rishi":3,"Yan":5},"Pinpoint":{"Nick":1,"Rishi":2,"Andy":5,"Yan":5},"Patches":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Zip":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5}}},{"date":"2026-05-25","ranks":{"Wordle":{"Andy":1,"Yan":1,"Rishi":1,"Nick":4},"Connections":{"Andy":1,"Rishi":1,"Nick":3,"Yan":5},"Tango":{"Rishi":1,"Andy":2,"Nick":3,"Yan":5},"Queens":{"Rishi":1,"Nick":2,"Andy":5,"Yan":5},"Pinpoint":{"Nick":1,"Andy":1,"Rishi":3,"Yan":5},"Patches":{"Andy":1,"Rishi":2,"Nick":3,"Yan":5},"Zip":{"Andy":1,"Nick":2,"Rishi":3,"Yan":5}}}];

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PLAYERS = ["Nick","Andy","Yan","Rishi"];
const LEADERBOARD_GAMES = ["Wordle","Connections","Tango","Queens","Pinpoint"];
const ALL_GAMES          = ["Wordle","Connections","Tango","Queens","Pinpoint","Patches","Zip"];
const DEFAULT_RANK = 5;

const GAME_META = {
  Wordle:      { abbr:"W",  color:"#4ade80", unit:"guesses"  },
  Connections: { abbr:"C",  color:"#60a5fa", unit:"mistakes" },
  Tango:       { abbr:"T",  color:"#a78bfa", unit:"secs"     },
  Queens:      { abbr:"Q",  color:"#34d399", unit:"secs"     },
  Pinpoint:    { abbr:"Pt", color:"#fbbf24", unit:"guesses"  },
  Patches:     { abbr:"Pa", color:"#f472b6", unit:"secs"     },
  Zip:         { abbr:"Z",  color:"#fb923c", unit:"secs"     },
};

const PLAYER_META = {
  Nick:  { color:"#ef4444", initials:"NW" },
  Andy:  { color:"#3b82f6", initials:"AS" },
  Yan:   { color:"#8b5cf6", initials:"YJ" },
  Rishi: { color:"#f59e0b", initials:"R"  },
};

const MONTH_NAMES = {
  "2026-02":"February","2026-03":"March","2026-04":"April","2026-05":"May"
};

// ─── LOGIC ────────────────────────────────────────────────────────────────────
function rankTotals(totals) {
  const sorted = [...PLAYERS].sort((a,b) => totals[a]-totals[b]);
  const out = {};
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length-1 && totals[sorted[j+1]] === totals[sorted[i]]) j++;
    for (let k=i;k<=j;k++) out[sorted[k]] = i+1;
    i = j+1;
  }
  return out;
}

function computeTotals(dayRanks, games) {
  const totals = {};
  PLAYERS.forEach(p => {
    totals[p] = games.reduce((s,g) => s + (dayRanks[g]?.[p] ?? DEFAULT_RANK), 0);
  });
  return { totals, dayRanks: rankTotals(totals) };
}
function formatScore(game, val) {
  if (val==null) return "—";
  if (game==="Wordle")      return val===7?"X/6":`${val}/6`;
  if (game==="Connections") return val===4?"✓":`+${val-4}`;
  if (game==="Pinpoint")    return val===6?"Fail":`${val}`;
  const m=Math.floor(val/60), s=val%60;
  return m>0?`${m}:${String(s).padStart(2,"0")}`:`0:${String(s).padStart(2,"0")}`;
}

function dateLabel(iso) {
  const d = new Date(iso+"T12:00:00Z");
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#f0efe9;min-height:100vh}
.app{min-height:100vh;background:#f0efe9;font-family:'DM Sans',sans-serif;color:#111}

/* HEADER */
.hdr{background:#111;color:#f0efe9;display:flex;flex-direction:column;padding:10px 16px 0;position:sticky;top:0;z-index:100}
.hdr-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}
.logo{font-family:'Instrument Serif',serif;font-size:21px;letter-spacing:-0.3px;flex-shrink:0}
.logo em{font-style:italic;color:#a3e635}
.sep{width:1px;height:18px;background:rgba(255,255,255,0.15);flex-shrink:0}
.hdr-right{margin-left:auto;font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,0.28);letter-spacing:.5px}
.tabs{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;padding-bottom:8px}
.tabs::-webkit-scrollbar{display:none}
.tab{flex-shrink:0;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.4);font-family:'DM Sans',sans-serif;transition:all .15s}
.tab:hover{color:rgba(255,255,255,0.75)}
.tab.on{background:rgba(255,255,255,0.12);color:#fff}

/* BODY */
.body{max-width:980px;margin:0 auto;padding:36px 20px 80px}
.eyebrow{font-size:10.5px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:#999;margin-bottom:14px}
.section{margin-bottom:40px}

/* STANDING CARDS */
.s-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.s-card{background:#fff;border-radius:14px;padding:18px 16px;border:1.5px solid #e5e3dc;position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s;cursor:default}
.s-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.07)}
.s-card.gold{background:#111;border-color:#111;color:#f0efe9}
.s-rank{font-family:'Instrument Serif',serif;font-size:52px;line-height:1;color:#ece9e0;margin-bottom:8px}
.s-card.gold .s-rank{color:rgba(255,255,255,.1)}
.s-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;margin-bottom:8px;font-family:'DM Mono',monospace}
.s-name{font-size:15px;font-weight:600;margin-bottom:2px}
.s-pts{font-family:'DM Mono',monospace;font-size:26px;font-weight:500;line-height:1}
.s-label{font-size:10.5px;color:#aaa;letter-spacing:.4px;margin-top:3px}
.s-card.gold .s-label{color:rgba(255,255,255,.35)}
.s-sub{font-size:11.5px;color:#999;margin-top:8px}
.s-card.gold .s-sub{color:rgba(255,255,255,.4)}
.s-card.gold .s-pts{color:#a3e635}

/* MINI GAME LEADERBOARD */
.g-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.g-mini{background:#fff;border-radius:12px;padding:14px;border:1.5px solid #e5e3dc}
.g-mini-hdr{display:flex;align-items:center;gap:7px;margin-bottom:10px}
.chip{font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;padding:2px 6px;border-radius:4px;color:#fff;letter-spacing:.5px;flex-shrink:0}
.g-mini-name{font-size:12.5px;font-weight:600}
.g-row{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f2efe8;font-size:12.5px}
.g-row:last-child{border-bottom:none}
.g-num{font-family:'DM Mono',monospace;font-size:10.5px;color:#bbb;width:14px}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.g-player{font-weight:500;flex:1}
.g-pts{font-family:'DM Mono',monospace;font-size:11.5px;color:#777}

/* MONTH TABS */
.m-tabs{display:flex;gap:6px;margin-bottom:24px}
.m-tab{padding:7px 16px;border-radius:8px;border:1.5px solid #e5e3dc;background:#fff;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;color:#777;transition:all .15s}
.m-tab:hover{border-color:#111;color:#111}
.m-tab.on{background:#111;color:#f0efe9;border-color:#111}

/* DAY TABLE */
.day-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;margin-bottom:28px;scrollbar-width:none}
.day-scroll::-webkit-scrollbar{display:none}
.d-btn{flex-shrink:0;padding:7px 14px;border-radius:8px;border:1.5px solid #e5e3dc;background:#fff;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;color:#777;transition:all .15s;white-space:nowrap}
.d-btn:hover{border-color:#111;color:#111}
.d-btn.on{background:#111;color:#f0efe9;border-color:#111}

/* DAY SUMMARY */
.day-sum{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.dc{background:#fff;border-radius:12px;padding:16px;border:1.5px solid #e5e3dc;text-align:center}
.dc.gold{background:#111;color:#f0efe9;border-color:#111}
.dc-rank{font-family:'Instrument Serif',serif;font-size:36px;line-height:1;color:#ece9e0;margin-bottom:6px}
.dc.gold .dc-rank{color:rgba(255,255,255,.1)}
.dc-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;margin:0 auto 6px;font-family:'DM Mono',monospace}
.dc-name{font-size:13.5px;font-weight:600;margin-bottom:4px}
.dc-total{font-family:'DM Mono',monospace;font-size:20px;font-weight:500;color:#111}
.dc.gold .dc-total{color:#a3e635}
.dc-sub{font-size:11px;color:#aaa;margin-top:2px}
.dc.gold .dc-sub{color:rgba(255,255,255,.35)}

/* GAME TABLE */
.tbl{background:#fff;border-radius:14px;border:1.5px solid #e5e3dc;overflow:hidden;margin-bottom:10px}
.tbl-hdr{display:grid;background:#f7f5f0;border-bottom:1.5px solid #e5e3dc;padding:9px 16px}
.tbl-row{display:grid;padding:11px 16px;border-bottom:1px solid #f2efe8;align-items:center;transition:background .1s}
.tbl-row:hover{background:#faf9f6}
.tbl-row:last-child{border-bottom:none}
.tbl-cols-day{grid-template-columns:130px repeat(4,1fr)}
.tbl-cols-game{grid-template-columns:110px repeat(4,1fr)}
.tbl-cell{font-size:12.5px}
.tbl-hdr-cell{font-size:10.5px;font-weight:600;color:#aaa;letter-spacing:1px;text-transform:uppercase}
.tbl-hdr-player{display:flex;align-items:center;gap:5px}
.game-name-cell{display:flex;align-items:center;gap:7px;font-weight:600;font-size:12.5px}

/* RANK BADGE */
.rb{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-family:'DM Mono',monospace;font-size:10px;font-weight:600;flex-shrink:0}
.rb1{background:#111;color:#a3e635}
.rb2{background:#ece9e0;color:#777}
.rb3{background:#ece9e0;color:#999}
.rb4{background:#ece9e0;color:#bbb}
.rb5{background:#fef2f2;color:#fca5a5}
.score-tiny{font-family:'DM Mono',monospace;font-size:10.5px;color:#aaa;margin-left:3px}

/* TOGGLE */
.tog{padding:6px 13px;border-radius:8px;border:1.5px solid #e5e3dc;background:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;color:#777;transition:all .15s}
.tog:hover{border-color:#111;color:#111}
.tog.on{background:#111;color:#f0efe9;border-color:#111}

/* GAME PILLS */
.pills{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:24px}
.pill{padding:6px 15px;border-radius:999px;border:1.5px solid #e5e3dc;background:#fff;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;color:#777;transition:all .15s}
.pill:hover{border-color:#111;color:#111}
.pill.on{background:#111;color:#f0efe9;border-color:#111}

/* DETAIL TABLE */
.det-tbl{background:#fff;border-radius:14px;border:1.5px solid #e5e3dc;overflow:hidden}
.det-row{display:grid;grid-template-columns:100px repeat(4,1fr);padding:10px 16px;border-bottom:1px solid #f2efe8;align-items:center}
.det-row:last-child{border-bottom:none}
.det-row.hdr{background:#f7f5f0;border-bottom:1.5px solid #e5e3dc}
.det-date{font-family:'DM Mono',monospace;font-size:11px;color:#aaa}
.det-cell{display:flex;align-items:center;gap:5px}
.det-score{font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:#555}
.det-miss{color:#fca5a5}
.det-win{color:#111;font-weight:700}

/* CHART */
.chart-wrap{background:#fff;border-radius:14px;border:1.5px solid #e5e3dc;padding:20px 16px 8px;margin-bottom:14px}
.chart-title{font-size:13px;font-weight:600;margin-bottom:16px;color:#111}
.chart-sub{font-size:11px;color:#999;margin-top:2px;font-weight:400}

/* RESPONSIVE */
@media(max-width:700px){
  .s-grid,.g-grid{grid-template-columns:repeat(2,1fr)}
  .g-grid{grid-template-columns:repeat(2,1fr)}
  .day-sum{grid-template-columns:repeat(2,1fr)}
  .tbl-cols-day,.tbl-cols-game{grid-template-columns:90px repeat(4,1fr)}
  .det-row{grid-template-columns:70px repeat(4,1fr)}
}
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]     = useState("year");
  const [month, setMonth] = useState("2026-05");
  const [selDay, setDay]  = useState(null);
  const [selGame, setGame]= useState("Wordle");
  const [showRaw, setRaw] = useState(false);

  // Pre-compute all days with both leaderboard games and all games
  const allDays = useMemo(() => SEED_DATA.map(d => ({
    ...d,
    lb:  computeTotals(d.ranks, LEADERBOARD_GAMES),
    all: computeTotals(d.ranks, ALL_GAMES),
  })), []);

  // Months
  const months = useMemo(() => [...new Set(SEED_DATA.map(d=>d.date.slice(0,7)))].sort(), []);

  // Year standings (leaderboard games only)
  const yearStats = useMemo(() => {
    const pts={}, wins={};
    PLAYERS.forEach(p=>{pts[p]=0;wins[p]=0;});
    allDays.forEach(dr=>{
      PLAYERS.forEach(p=>pts[p]+=dr.lb.totals[p]);
      PLAYERS.filter(p=>dr.lb.dayRanks[p]===1).forEach(p=>wins[p]++);
    });
    return { pts, wins, sorted:[...PLAYERS].sort((a,b)=>pts[a]-pts[b]), ranks:rankTotals(pts) };
  }, [allDays]);

  // Month standings
  const monthStats = useMemo(() => {
    const mDays = allDays.filter(d=>d.date.startsWith(month));
    const pts={}, wins={};
    PLAYERS.forEach(p=>{pts[p]=0;wins[p]=0;});
    mDays.forEach(dr=>{
      PLAYERS.forEach(p=>pts[p]+=dr.lb.totals[p]);
      PLAYERS.filter(p=>dr.lb.dayRanks[p]===1).forEach(p=>wins[p]++);
    });
    return { pts, wins, sorted:[...PLAYERS].sort((a,b)=>pts[a]-pts[b]), ranks:rankTotals(pts), days:mDays.length };
  }, [allDays, month]);

  // Per-game leaderboard (year, leaderboard games)
  const gameLeaders = useMemo(() => {
    const out={};
    LEADERBOARD_GAMES.forEach(g=>{
      const pts={}; PLAYERS.forEach(p=>pts[p]=0);
      allDays.forEach(d=>{
        const r=d.ranks[g];
        PLAYERS.forEach(p=>pts[p]+=(r[p]||DEFAULT_RANK));
      });
      out[g]={pts,sorted:[...PLAYERS].sort((a,b)=>pts[a]-pts[b])};
    });
    return out;
  }, [allDays]);

  // Days in selected month (for daily tab)
  const monthDays = useMemo(()=>allDays.filter(d=>d.date.startsWith(month)),[allDays,month]);
  const selDayData = selDay!=null ? monthDays[selDay] : monthDays[monthDays.length-1];

  // Sorted day for display in daily tab
  const daySorted = selDayData ? [...PLAYERS].sort((a,b)=>selDayData.all.totals[a]-selDayData.all.totals[b]) : [];

  const RB = ({rank}) => <span className={`rb rb${rank}`}>{rank===5?"–":rank}</span>;
  const Av = ({p,size=32}) => (
    <div className="s-av" style={{width:size,height:size,background:PLAYER_META[p].color,fontSize:size<28?9.5:11}}>
      {PLAYER_META[p].initials}
    </div>
  );

  const StandingCards = ({sorted,pts,wins,ranks,label,days}) => (
    <div className="s-grid">
      {sorted.map(p=>{
        const rank=ranks[p];
        return(
          <div key={p} className={`s-card ${rank===1?"gold":""}`}>
            <div className="s-rank">{rank}</div>
            <Av p={p} size={34}/>
            <div className="s-name">{p}</div>
            <div className="s-pts">{pts[p]}</div>
            <div className="s-label">{label}</div>
            {wins && <div className="s-sub">{wins[p]} day win{wins[p]!==1?"s":""}</div>}
          </div>
        );
      })}
    </div>
  );

  return(<>
    <style>{CSS}</style>
    <div className="app">

      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-top">
          <div className="logo">Work<em>dle</em></div>
          <div className="sep"/>
          <div className="hdr-right">FEB – MAY 2026 · {allDays.length} DAYS</div>
        </div>
        <nav className="tabs">
          {[["year","Year"],["month","Month"],["daily","Daily"],["games","Games"],["trends","Trends"]].map(([v,l])=>(
            <button key={v} className={`tab ${tab===v?"on":""}`} onClick={()=>setTab(v)}>{l}</button>
          ))}
        </nav>
      </header>

      <div className="body">

        {/* ══ YEAR ══════════════════════════════════════════════════════════ */}
        {tab==="year" && (<>
          <div className="section">
            <div className="eyebrow">2026 Season · {allDays.length} days · Wordle Connections Tango Queens Pinpoint</div>
            <StandingCards sorted={yearStats.sorted} pts={yearStats.pts} wins={yearStats.wins} ranks={yearStats.ranks} label="pts total"/>
          </div>
          <div className="section">
            <div className="eyebrow">Game rankings — year</div>
            <div className="g-grid">
              {LEADERBOARD_GAMES.map(g=>(
                <div key={g} className="g-mini">
                  <div className="g-mini-hdr">
                    <span className="chip" style={{background:GAME_META[g].color}}>{GAME_META[g].abbr}</span>
                    <span className="g-mini-name">{g}</span>
                  </div>
                  {gameLeaders[g].sorted.map((p,i)=>(
                    <div key={p} className="g-row">
                      <span className="g-num">{i+1}</span>
                      <div className="dot" style={{background:PLAYER_META[p].color}}/>
                      <span className="g-player">{p}</span>
                      <span className="g-pts">{gameLeaders[g].pts[p]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ══ MONTH ═════════════════════════════════════════════════════════ */}
        {tab==="month" && (<>
          <div className="m-tabs">
            {months.map(m=>(
              <button key={m} className={`m-tab ${month===m?"on":""}`} onClick={()=>setMonth(m)}>
                {MONTH_NAMES[m]||m}
              </button>
            ))}
          </div>
          <div className="section">
            <div className="eyebrow">{MONTH_NAMES[month]} · {monthStats.days} days</div>
            <StandingCards sorted={monthStats.sorted} pts={monthStats.pts} wins={monthStats.wins} ranks={monthStats.ranks} label="pts this month"/>
          </div>
          <div className="section">
            <div className="eyebrow">Game rankings — {MONTH_NAMES[month]}</div>
            <div className="g-grid">
              {LEADERBOARD_GAMES.map(g=>{
                const mDays=allDays.filter(d=>d.date.startsWith(month));
                const pts={}; PLAYERS.forEach(p=>pts[p]=0);
                mDays.forEach(d=>{ const r=d.ranks[g]; PLAYERS.forEach(p=>pts[p]+=(r[p]||DEFAULT_RANK)); });
                const sorted=[...PLAYERS].sort((a,b)=>pts[a]-pts[b]);
                return(
                  <div key={g} className="g-mini">
                    <div className="g-mini-hdr">
                      <span className="chip" style={{background:GAME_META[g].color}}>{GAME_META[g].abbr}</span>
                      <span className="g-mini-name">{g}</span>
                    </div>
                    {sorted.map((p,i)=>(
                      <div key={p} className="g-row">
                        <span className="g-num">{i+1}</span>
                        <div className="dot" style={{background:PLAYER_META[p].color}}/>
                        <span className="g-player">{p}</span>
                        <span className="g-pts">{pts[p]}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </>)}

        {/* ══ DAILY ═════════════════════════════════════════════════════════ */}
        {tab==="daily" && (<>
          {/* Month selector */}
          <div className="m-tabs">
            {months.map(m=>(
              <button key={m} className={`m-tab ${month===m?"on":""}`} onClick={()=>{setMonth(m);setDay(null);}}>
                {MONTH_NAMES[m]||m}
              </button>
            ))}
          </div>
          {/* Day selector */}
          <div className="day-scroll">
            {monthDays.map((d,i)=>(
              <button key={d.date} className={`d-btn ${(selDay===i||(selDay===null&&i===monthDays.length-1))?"on":""}`}
                onClick={()=>setDay(i)}>
                {dateLabel(d.date)}
              </button>
            ))}
          </div>

          {selDayData && (<>
            <div className="eyebrow">{dateLabel(selDayData.date)} · All 7 games (Wordle Connections Tango Queens Pinpoint Patches Zip)</div>
            <div className="day-sum">
              {daySorted.map(p=>{
                const rank=selDayData.all.dayRanks[p];
                return(
                  <div key={p} className={`dc ${rank===1?"gold":""}`}>
                    <div className="dc-rank">{rank}</div>
                    <div className="dc-av" style={{width:30,height:30,background:PLAYER_META[p].color}}>{PLAYER_META[p].initials}</div>
                    <div className="dc-name">{p}</div>
                    <div className="dc-total">{selDayData.all.totals[p]}</div>
                    <div className="dc-sub">pts · 7 games</div>
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div className="eyebrow" style={{margin:0}}>Game breakdown</div>

            </div>

            <div className="tbl">
              <div className="tbl-hdr tbl-cols-day">
                <div className="tbl-hdr-cell">Game</div>
                {PLAYERS.map(p=>(
                  <div key={p} className="tbl-hdr-cell tbl-hdr-player">
                    <div style={{width:8,height:8,borderRadius:"50%",background:PLAYER_META[p].color}}/>
                    {p}
                  </div>
                ))}
              </div>
              {ALL_GAMES.map(game=>(
                <div key={game} className="tbl-row tbl-cols-day">
                  <div className="game-name-cell">
                    <span className="chip" style={{background:GAME_META[game].color,padding:"2px 5px",fontSize:"9px"}}>{GAME_META[game].abbr}</span>
                    {game}
                  </div>
                  {PLAYERS.map(p=>{
                    const rank=selDayData.ranks[game][p];
                    return(
                      <div key={p} className="tbl-cell" style={{display:"flex",alignItems:"center",gap:4}}>
                        <RB rank={rank}/>

                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>)}
        </>)}

        {/* ══ GAMES ═════════════════════════════════════════════════════════ */}
        {tab==="games" && (<>
          <div className="pills">
            {ALL_GAMES.map(g=>(
              <button key={g} className={`pill ${selGame===g?"on":""}`} onClick={()=>setGame(g)}>{g}</button>
            ))}
          </div>

          {(()=>{
            const pts={}; PLAYERS.forEach(p=>pts[p]=0);
            allDays.forEach(d=>{
              const r=d.ranks[selGame];
              PLAYERS.forEach(p=>pts[p]+=(r[p]||DEFAULT_RANK));
            });
            const sorted=[...PLAYERS].sort((a,b)=>pts[a]-pts[b]);
            const ranks=rankTotals(pts);
            return(<>
              <div className="eyebrow">{selGame} · season ranking</div>
              <div className="s-grid" style={{marginBottom:32}}>
                {sorted.map(p=>(
                  <div key={p} className={`s-card ${ranks[p]===1?"gold":""}`}>
                    <div className="s-rank">{ranks[p]}</div>
                    <Av p={p} size={34}/>
                    <div className="s-name">{p}</div>
                    <div className="s-pts">{pts[p]}</div>
                    <div className="s-label">pts ({allDays.length} days)</div>
                  </div>
                ))}
              </div>
              <div className="eyebrow">{selGame} · day-by-day</div>
              <div className="det-tbl">
                <div className="det-row hdr">
                  <div className="tbl-hdr-cell">Date</div>
                  {PLAYERS.map(p=>(
                    <div key={p} className="tbl-hdr-cell tbl-hdr-player">
                      <div style={{width:7,height:7,borderRadius:"50%",background:PLAYER_META[p].color}}/>
                      {p}
                    </div>
                  ))}
                </div>
                {allDays.map(d=>{
                  const gRanks=d.ranks[selGame];
                  const minR=Math.min(...PLAYERS.map(p=>gRanks[p]||DEFAULT_RANK));
                  return(
                    <div key={d.date} className="det-row">
                      <div className="det-date">{dateLabel(d.date)}</div>
                      {PLAYERS.map(p=>{
                        const rank=gRanks[p]||DEFAULT_RANK;
                        const isW=rank===minR&&rank<5;
                        return(
                          <div key={p} className="det-cell">
                            <RB rank={rank}/>
                            <span className={`det-score ${rank===5?"det-miss":""} ${isW?"det-win":""}`}>
                              {rank===5?"–":`#${rank}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>);
          })()}
        </>)}

        {/* ══ TRENDS ════════════════════════════════════════════════════════ */}
        {tab==="trends" && (()=>{
          const FORM_DAYS = 12;
          const recentDays = allDays.slice(-FORM_DAYS);

          // Heatmap: avg rank per player per game (leaderboard games)
          const heatmap = {};
          PLAYERS.forEach(p=>{
            heatmap[p]={};
            LEADERBOARD_GAMES.forEach(g=>{
              const vals = allDays.map(d=>d.ranks[g]?.[p]||DEFAULT_RANK);
              heatmap[p][g] = parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2));
            });
          });

          // Colour scale: 1=best (green), 5=worst (red)
          const rankColor = (avg) => {
            // 1→green, 3→yellow, 5→red
            if (avg <= 1.5) return {bg:"#dcfce7",text:"#166534"};
            if (avg <= 2.2) return {bg:"#d1fae5",text:"#065f46"};
            if (avg <= 2.8) return {bg:"#fef9c3",text:"#854d0e"};
            if (avg <= 3.5) return {bg:"#ffedd5",text:"#9a3412"};
            return {bg:"#fee2e2",text:"#991b1b"};
          };

          // Form colour per day rank
          const formColor = (rank) => {
            if (rank===1) return {bg:"#111",text:"#a3e635"};
            if (rank===2) return {bg:"#e0f2fe",text:"#0369a1"};
            if (rank===3) return {bg:"#fef9c3",text:"#854d0e"};
            if (rank===4) return {bg:"#fee2e2",text:"#991b1b"};
            return {bg:"#f4f4f4",text:"#aaa"};  // missed
          };

          return(<>
            {/* ── FORM TABLE ── */}
            <div className="eyebrow">Recent form · last {FORM_DAYS} days · overall daily rank</div>
            <div className="tbl" style={{marginBottom:32}}>
              {/* Header row - dates */}
              <div style={{display:"grid",gridTemplateColumns:`56px repeat(${FORM_DAYS},1fr)`,background:"#f7f5f0",borderBottom:"1.5px solid #e5e3dc",padding:"8px 10px",gap:3}}>
                <div className="tbl-hdr-cell"></div>
                {recentDays.map(d=>(
                  <div key={d.date} style={{fontSize:8,fontWeight:600,color:"#bbb",textAlign:"center",letterSpacing:"0.3px",lineHeight:1.2}}>
                    {dateLabel(d.date).replace(" ","\n")}
                  </div>
                ))}
              </div>
              {/* Player rows */}
              {PLAYERS.map(p=>(
                <div key={p} style={{display:"grid",gridTemplateColumns:`56px repeat(${FORM_DAYS},1fr)`,padding:"5px 10px",borderBottom:"1px solid #f2efe8",alignItems:"center",gap:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,overflow:"hidden"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:PLAYER_META[p].color,flexShrink:0}}/>
                    <span style={{fontSize:11,fontWeight:700,color:"#111",whiteSpace:"nowrap"}}>{p}</span>
                  </div>
                  {recentDays.map(d=>{
                    const rank = d.lb.dayRanks[p] || DEFAULT_RANK;
                    const c = formColor(rank);
                    return(
                      <div key={d.date} style={{background:c.bg,color:c.text,borderRadius:5,textAlign:"center",padding:"5px 1px",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>
                        {rank===5?"–":rank}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── HEATMAP ── */}
            <div className="eyebrow">Game strengths · season avg rank · 1 = best · 5 = worst/missed</div>
            <div className="tbl" style={{overflowX:"auto"}}>
              {/* Header */}
              <div style={{display:"grid",gridTemplateColumns:`60px repeat(${LEADERBOARD_GAMES.length},1fr)`,background:"#f7f5f0",borderBottom:"1.5px solid #e5e3dc",padding:"8px 10px",gap:4}}>
                <div className="tbl-hdr-cell"></div>
                {LEADERBOARD_GAMES.map(g=>(
                  <div key={g} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <span className="chip" style={{background:GAME_META[g].color,fontSize:9,padding:"2px 5px"}}>{GAME_META[g].abbr}</span>
                    <span style={{fontSize:8,fontWeight:600,color:"#aaa",letterSpacing:"0.3px",textAlign:"center"}}>{g}</span>
                  </div>
                ))}
              </div>
              {/* Rows */}
              {[...PLAYERS].sort((a,b)=>{
                const avgA = LEADERBOARD_GAMES.reduce((s,g)=>s+heatmap[a][g],0)/LEADERBOARD_GAMES.length;
                const avgB = LEADERBOARD_GAMES.reduce((s,g)=>s+heatmap[b][g],0)/LEADERBOARD_GAMES.length;
                return avgA-avgB;
              }).map(p=>(
                <div key={p} style={{display:"grid",gridTemplateColumns:`60px repeat(${LEADERBOARD_GAMES.length},1fr)`,padding:"6px 10px",borderBottom:"1px solid #f2efe8",alignItems:"center",gap:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:PLAYER_META[p].color,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:700}}>{p}</span>
                  </div>
                  {LEADERBOARD_GAMES.map(g=>{
                    const avg = heatmap[p][g];
                    const c = rankColor(avg);
                    return(
                      <div key={g} style={{background:c.bg,color:c.text,borderRadius:7,textAlign:"center",padding:"7px 2px"}}>
                        <div style={{fontSize:14,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{avg.toFixed(1)}</div>
                        <div style={{fontSize:8,opacity:0.7,marginTop:1}}>avg</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
              {[["#dcfce7","#166534","1.0–1.5 Dominant"],["#d1fae5","#065f46","1.5–2.2 Strong"],["#fef9c3","#854d0e","2.2–2.8 Average"],["#ffedd5","#9a3412","2.8–3.5 Weak"],["#fee2e2","#991b1b","3.5–5.0 Struggling"]].map(([bg,text,label])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#777"}}>
                  <div style={{width:12,height:12,borderRadius:3,background:bg,border:`1px solid ${text}22`}}/>
                  {label}
                </div>
              ))}
            </div>
          </>);
        })()}



      </div>
    </div>
  </>);
}
