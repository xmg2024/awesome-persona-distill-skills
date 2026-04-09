import assert from "node:assert/strict";
import test from "node:test";

import {
  CATEGORY_LABELS,
  applySubmissionToReadmes,
  parseSubmissionIssueBody,
} from "../scripts/submission-automation.mjs";

const issueBody = `
### 存储库链接 / Repository URL
https://github.com/example/project

### 项目名称 / Project Name
Example Project

### 汉语描述 / Chinese Description
一个示例项目，用于蒸馏某类人物表达风格。

### 英语描述 / English Description
An example project for distilling a certain style of personal expression.

### 分类 / Category
自我蒸馏与元工具 / Self Distillation and Meta Tools

### 收录理由 / Why It Belongs Here
Because it focuses on persona distillation.

### 与现有条目的区别 / Differentiation
It focuses on first-person reflection workflows.

### 确认事项 / Confirmations
- [x] 我已阅读并遵循贡献指南 / I have read and follow the contribution guide
`;

test("parseSubmissionIssueBody extracts required fields", () => {
  const parsed = parseSubmissionIssueBody(issueBody);

  assert.equal(parsed.repositoryUrl, "https://github.com/example/project");
  assert.equal(parsed.projectName, "Example Project");
  assert.equal(parsed.categoryLabel, CATEGORY_LABELS[0]);
  assert.match(parsed.descriptionZh, /示例项目/);
  assert.match(parsed.descriptionEn, /example project/i);
});

test("parseSubmissionIssueBody rejects non-GitHub repository URLs", () => {
  assert.throws(
    () =>
      parseSubmissionIssueBody(
        issueBody.replace(
          "https://github.com/example/project",
          "https://example.com/project",
        ),
      ),
    /GitHub repository URL/i,
  );
});

test("applySubmissionToReadmes inserts matching entries in both READMEs", () => {
  const submission = parseSubmissionIssueBody(issueBody);
  const readmeZh = `## 自我蒸馏与元工具

- [Alpha](https://github.com/example/alpha) - 一个旧项目。

## 职场与学术关系

- [Beta](https://github.com/example/beta) - 另一个项目。
`;
  const readmeEn = `## Self Distillation and Meta Tools

- [Alpha](https://github.com/example/alpha) - An older project.

## Workplace and Academic Relationships

- [Beta](https://github.com/example/beta) - Another project.
`;

  const updated = applySubmissionToReadmes({
    readmeZh,
    readmeEn,
    submission,
  });

  assert.match(
    updated.readmeZh,
    /\- \[Example Project\]\(https:\/\/github\.com\/example\/project\) - 一个示例项目，用于蒸馏某类人物表达风格。\n/,
  );
  assert.match(
    updated.readmeEn,
    /\- \[Example Project\]\(https:\/\/github\.com\/example\/project\) - An example project for distilling a certain style of personal expression\.\n/,
  );
});

test("applySubmissionToReadmes rejects duplicate repository URLs", () => {
  const submission = parseSubmissionIssueBody(issueBody);
  const readmeZh = `## 自我蒸馏与元工具

- [Existing](https://github.com/example/project) - 已存在。

## 职场与学术关系
`;
  const readmeEn = `## Self Distillation and Meta Tools

- [Existing](https://github.com/example/project) - Existing.

## Workplace and Academic Relationships
`;

  assert.throws(
    () => applySubmissionToReadmes({ readmeZh, readmeEn, submission }),
    /already exists/i,
  );
});
