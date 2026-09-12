import { getChildren, appendChildren, todoText, isChecked } from "../../lib/notion";
import { todayTitle } from "../../lib/sorter";

export async function POST() {
  try {
    const pageId = process.env.NOTION_PAGE_ID;
    const title = todayTitle();

    const rootChildren = await getChildren(pageId);
    const todayPage = rootChildren.find(
      (b) => b.type === "child_page" && b.child_page.title === title
    );
    if (!todayPage) {
      return Response.json(
        { error: "No tasklist found for today yet — generate tasks first." },
        { status: 400 }
      );
    }

    const todoBlocks = (await getChildren(todayPage.id)).filter(
      (b) => b.type === "to_do"
    );
    if (!todoBlocks.length) {
      return Response.json(
        { error: "No tasks found on today's page." },
        { status: 400 }
      );
    }

    const done = todoBlocks.filter(isChecked);
    const pending = todoBlocks.filter((b) => !isChecked(b));

    const parts = [`${done.length} of ${todoBlocks.length} tasks done today.`];
    if (done.length) parts.push("Completed: " + done.map(todoText).join("; "));
    if (pending.length) parts.push("Still open: " + pending.map(todoText).join("; "));
    const summary = parts.join(" ");

    await appendChildren(todayPage.id, [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: "Day summary" }, annotations: { bold: true } },
          ],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: summary } }] },
      },
    ]);

    return Response.json({ summary });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
