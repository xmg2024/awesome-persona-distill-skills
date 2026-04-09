import test from "node:test";
import assert from "node:assert/strict";

import {
  CATEGORY_MAP,
  findDuplicateUrls,
  validateRepositoryContent,
} from "../scripts/check-repository-consistency.mjs";

test("findDuplicateUrls reports duplicates within a single README set", () => {
  const duplicates = findDuplicateUrls([
    "https://github.com/example/a",
    "https://github.com/example/a",
  ]);

  assert.deepEqual(duplicates, ["https://github.com/example/a"]);
});

test("validateRepositoryContent rejects mismatched bilingual entry URLs", () => {
  const readmeZh = `issue 表单 approved

## 自我蒸馏与元工具

- [项目甲](https://github.com/example/a) - 中文。

## 职场与学术关系

## 亲密关系与家庭记忆

## 公众人物与方法论视角

## 精神性与专门化主题
`;
  const readmeEn = `issue form approved

## Self Distillation and Meta Tools

- [Project A](https://github.com/example/b) - English.

## Workplace and Academic Relationships

## Intimate Relationships and Family Memories

## Public Figures and Methodological Perspectives

## Spiritual and Specialized Topics
`;

  assert.throws(
    () =>
      validateRepositoryContent({
        readmeZh,
        readmeEn,
        contributingZh: "issue 表单 approved",
        contributingEn: "issue form approved",
        issueTemplateConfig: "blank_issues_enabled: false",
        issueTemplate: "Submission Request approved",
      }),
    /same URLs/i,
  );
});

test("validateRepositoryContent accepts aligned bilingual content", () => {
  const readmeZh = `issue 表单 approved

## 自我蒸馏与元工具

- [项目甲](https://github.com/example/a) - 中文。

## 职场与学术关系

## 亲密关系与家庭记忆

## 公众人物与方法论视角

## 精神性与专门化主题
`;
  const readmeEn = `issue form approved

## Self Distillation and Meta Tools

- [Project A](https://github.com/example/a) - English.

## Workplace and Academic Relationships

## Intimate Relationships and Family Memories

## Public Figures and Methodological Perspectives

## Spiritual and Specialized Topics
`;

  assert.doesNotThrow(() =>
    validateRepositoryContent({
      readmeZh,
      readmeEn,
      contributingZh: "issue 表单 approved",
      contributingEn: "issue form approved",
      issueTemplateConfig: "blank_issues_enabled: false",
      issueTemplate: "Submission Request approved",
    }),
  );
  assert.ok(CATEGORY_MAP.size > 0);
});
