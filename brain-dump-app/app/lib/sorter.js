const TUTORING_KEYWORDS = [
  "riann",
  "tutor",
  "tutoring",
  "grade 6",
  "grade 7",
  "lesson",
  "worksheet",
  "quiz",
  "reviewer",
  "homeschool",
  "math class",
  "science class",
  "english class",
];

const URGENT_KEYWORDS = ["urgent", "asap", "today", "deadline", "due", "now"];
const SOMEDAY_KEYWORDS = ["someday", "later", "maybe", "eventually", "no rush", "low priority"];
const DELEGATE_KEYWORDS = ["delegate", "assign", "hand off"];
const ELIMINATE_KEYWORDS = ["skip", "cancel", "not needed", "eliminate", "drop"];

function containsAny(lowerText, keywords) {
  return keywords.some((k) => lowerText.includes(k));
}

function classifyBucket(text) {
  const lower = text.toLowerCase();
  return containsAny(lower, TUTORING_KEYWORDS) ? "Tutorials" : "Personal";
}

function classifyLetter(text) {
  const lower = text.toLowerCase();
  if (containsAny(lower, URGENT_KEYWORDS)) return "A";
  if (containsAny(lower, ELIMINATE_KEYWORDS)) return "E";
  if (containsAny(lower, DELEGATE_KEYWORDS)) return "D";
  if (containsAny(lower, SOMEDAY_KEYWORDS)) return "C";
  return "B";
}

export function classifyTasks(lines) {
  const buckets = { Tutorials: [], Personal: [] };
  lines.forEach((text) => {
    const bucket = classifyBucket(text);
    const letter = classifyLetter(text);
    buckets[bucket].push({ text, letter });
  });

  const result = [];
  ["Tutorials", "Personal"].forEach((bucket) => {
    ["A", "B", "C", "D", "E"].forEach((letter) => {
      buckets[bucket]
        .filter((item) => item.letter === letter)
        .forEach((item, idx) => {
          result.push({ bucket, priority: `${letter}${idx + 1}`, text: item.text });
        });
    });
  });
  return result;
}

const QUOTES = [
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "James Clear" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You are never too small to make a difference.", author: "Greta Thunberg" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "What we do today is what matters most.", author: "Buddha" },
  { text: "Progress, not perfection.", author: "Unknown" },
];

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function pickQuote() {
  return QUOTES[dayOfYear() % QUOTES.length];
}

export function todayTitle() {
  const d = new Date();
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${dateStr} - Tasklist`;
}
