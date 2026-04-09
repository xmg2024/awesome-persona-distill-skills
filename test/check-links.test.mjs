import test from "node:test";
import assert from "node:assert/strict";

import {
  checkRemoteLink,
  checkRelativeLink,
  extractMarkdownLinks,
} from "../scripts/check-links.mjs";

test("extractMarkdownLinks collects markdown targets", () => {
  const links = extractMarkdownLinks(
    "[one](https://github.com/example/a) and [two](./README.md)",
  );

  assert.deepEqual(links, ["https://github.com/example/a", "./README.md"]);
});

test("extractMarkdownLinks ignores fenced code blocks", () => {
  const links = extractMarkdownLinks(`
\`\`\`md
- [Example](https://github.com/owner/repo)
\`\`\`

[real](https://github.com/example/a)
`);

  assert.deepEqual(links, ["https://github.com/example/a"]);
});

test("checkRelativeLink accepts existing repository files", async () => {
  const result = await checkRelativeLink({
    filePath: "README.md",
    target: "./CONTRIBUTING.md",
    workspace: process.cwd(),
  });

  assert.equal(result.ok, true);
});

test("checkRemoteLink treats successful responses as valid", async () => {
  const result = await checkRemoteLink({
    target: "https://github.com/example/a",
    fetchImpl: async () => ({ ok: true, status: 200 }),
  });

  assert.deepEqual(result, {
    ok: true,
    status: 200,
    url: "https://github.com/example/a",
  });
});

test("checkRemoteLink retries with GET after HEAD failure", async () => {
  const calls = [];
  const result = await checkRemoteLink({
    target: "https://github.com/example/a",
    fetchImpl: async (_url, init) => {
      calls.push(init.method);
      if (init.method === "HEAD") {
        return { ok: false, status: 405 };
      }
      return { ok: true, status: 200 };
    },
  });

  assert.deepEqual(calls, ["HEAD", "GET"]);
  assert.equal(result.ok, true);
});
