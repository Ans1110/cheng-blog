const isTableRow = (line: string) => /^\s*\|.*\|\s*$/.test(line);
const isFence = (line: string) => /^\s*(```|~~~)/.test(line);

/**
 * Some exported .md files have a blank line after every line, which splits a
 * table into one paragraph per row. Drop blank lines that sit between two table
 * rows (outside code fences) so GFM sees one table again.
 */
export function joinSplitTableRows(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isFence(line)) inFence = !inFence;
    if (!inFence && line.trim() === "" && out.length && isTableRow(out[out.length - 1])) {
      let j = i;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length && isTableRow(lines[j])) {
        i = j - 1; // skip the blank run; the next row is pushed next iteration
        continue;
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

/**
 * Same export problem inside code: a doubled block reads
 * "", line1, "", line2, …, "", lineN, "" between its fences. Only when every
 * even-indexed line is empty are those inserted blanks dropped; a normal code
 * block never has that shape, so it is left untouched.
 */
export function undoubleCodeBlocks(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const open = lines[i];
    const fence = open.match(/^\s*(```|~~~)/)?.[1];
    const close = fence
      ? lines.findIndex((l, k) => k > i && l.trim().startsWith(fence) && l.trim().replaceAll(fence[0], "") === "")
      : -1;
    if (!fence || close === -1) {
      out.push(open);
      i++;
      continue;
    }
    const body = lines.slice(i + 1, close);
    const doubled =
      body.length >= 3 && body.length % 2 === 1 && body.every((l, k) => k % 2 === 1 || l === "");
    out.push(open, ...(doubled ? body.filter((_, k) => k % 2 === 1) : body), lines[close]);
    i = close + 1;
  }
  return out.join("\n");
}

/** Repairs Markdown from exports that put a blank line after every line. */
export const normalizeMarkdown = (md: string) => joinSplitTableRows(undoubleCodeBlocks(md));
