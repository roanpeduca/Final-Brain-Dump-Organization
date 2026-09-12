import {
  getChildren,
  deleteBlock,
  appendChildren,
  createChildPage,
  todoText,
  isChecked,
} from "../../lib/notion";
import { classifyTasks, pickQuote, todayTitle } from "../../lib/sorter";

export async function POST(request) {
  try {
    const { notes } = await request.json();
    const pageId = process.env.NOTION_PAGE_ID;
    const title = todayTitle();

    const rootChildren = await getChildren(pageId);
    const childPages = rootChildren.filter((b) => b.type === "child_page");
    const todayPage = childPages.find((b) => b.child_page.title === title);

    let carried = [];
    let existingChildrenOfTarget = [];

    if (todayPage) {
      existingChildrenOfTarget = await getChildren(todayPage.id);
      carried = existingChildrenOfTarget
        .filter((b) => b.type === "to_do" && !isChecked(b))
        .map(todoText);
    } else {
      const previous = childPages
        .filter((b) => b.child_page.title.endsWith("- Tasklist"))
        .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))[0];
      if (previous) {
        const prevChildren = await getChildren(previous.id);
        carried = prevChildren
          .filter((b) => b.type === "to_do" && !isChecked(b))
          .map(todoText);
      }
    }

    const newLines = (notes || "")
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const allLines = [...carried, ...newLines];
    if (allLines.length === 0) {
      return Response.json(
        { error: "Nothing to generate — no carried-over tasks and no new notes." },
        { status: 400 }
      );
    }

    const tasks = classifyTasks(allLines);
    const quote = pickQuote();

    const quoteBlock = {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: `"${quote.text}" — ${quote.author}` },
            annotations: { italic: true },
          },
        ],
      },
    };
    const taskBlocks = tasks.map((t) => ({
      object: "block",
      type: "to_do",
      to_do: {
        rich_text: [
          { type: "text", text: { content: `[${t.bucket} ${t.priority}] ${t.text}` } },
        ],
        checked: false,
      },
    }));

    let created;
    if (todayPage) {
      for (const child of existingChildrenOfTarget) {
        await deleteBlock(child.id);
      }
      created = await appendChildren(todayPage.id, [quoteBlock, ...taskBlocks]);
    } else {
      const page = await createChildPage(pageId, title, [quoteBlock, ...taskBlocks]);
      created = await getChildren(page.id);
    }

    const createdTasks = created.slice(1).map((block, i) => ({
      id: block.id,
      bucket: tasks[i].bucket,
      priority: tasks[i].priority,
      text: tasks[i].text,
      done: false,
    }));

    return Response.json({ quote, tasks: createdTasks });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
