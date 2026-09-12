# Brain Dump

A small Next.js app that reads and writes your Notion Brain Dump page —
fully rule-based, no AI API calls, no ongoing cost beyond hosting (which
is free on Vercel's hobby tier).

- **Generate tasks** sorts your notes (plus anything unchecked from your
  most recent previous day) into Tutorials / Personal by keyword
  matching, assigns a rough priority by keyword too, and writes the
  whole thing as a new page titled "[Month Day, Year] - Tasklist"
  nested under your Brain Dump page. A quote is picked from a small
  rotating list based on the date.
- **Summarize my day** reads today's tasklist page, counts what's done
  vs. pending, and appends a plain-text Day Summary block to that page.
- Checkboxes sync back to Notion live as you check things off.

## How the sorting works (no AI, just keywords)

- Tutorials bucket: a line is filed there if it mentions things like
  "Riann", "tutor", "grade 6/7", "lesson", "worksheet", "quiz", etc.
  Everything else goes to Personal.
- Priority letter: looks for words like "urgent"/"asap"/"today" (→ A),
  "someday"/"later"/"maybe" (→ C), "delegate"/"assign" (→ D),
  "skip"/"cancel" (→ E). Anything else defaults to B.
- You can freely edit `app/lib/sorter.js` to add your own keywords or
  change the quote list — it's plain arrays, no special syntax.

## 1. Get a Notion integration token

1. Go to https://www.notion.so/my-integrations and click "New integration".
2. Name it anything, pick your workspace, create it.
3. Copy the "Internal Integration Secret" — this is your `NOTION_TOKEN`.
4. Open your Brain Dump page in Notion, click "..." in the top right →
   "Connections" → add the integration you just created.

## 2. Push this code to GitHub

Make sure the contents of this folder (not the folder itself, not a
zip) end up at the root of your repo: `app/`, `package.json`,
`next.config.js` should all be visible directly when you open the repo.

## 3. Deploy on Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. Add two environment variables (Settings → Environment Variables),
   both checked for the Production environment:
   - `NOTION_TOKEN`
   - `NOTION_PAGE_ID` — defaulted in `.env.example` to your Brain Dump
     page's ID (`3782edf2-18e8-8027-a0d3-f11c16f5ce43`)
3. Click Deploy.

## Running locally

Copy `.env.example` to `.env.local`, fill in the two values, then:
```
npm install
npm run dev
```
