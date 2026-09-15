import { test, expect } from "@playwright/test";

test("diagnose onboarding action hit target", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("launch-start-creating").click();
  await expect(page.getByText("Começar sem conta")).toBeVisible({ timeout: 15000 });
  await page.getByText("Começar sem conta").click();
  await expect(page.getByText("O que você quer fazer primeiro?")).toBeVisible({
    timeout: 15000,
  });

  const button = page.getByTestId("onboarding-action-import");
  await expect(button).toBeVisible({ timeout: 15000 });
  const box = await button.boundingBox();
  console.log("BUTTON_BOX", JSON.stringify(box));
  if (!box) throw new Error("button has no box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  const hit = await page.evaluate(({ x, y }) => {
    const describe = (el: Element) => {
      const node = el as HTMLElement;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        tag: node.tagName,
        className: node.className,
        testId: node.getAttribute("data-testid"),
        aria: node.getAttribute("aria-label"),
        role: node.getAttribute("role"),
        pointerEvents: style.pointerEvents,
        position: style.position,
        zIndex: style.zIndex,
        transform: style.transform,
        opacity: style.opacity,
        display: style.display,
        flexDirection: style.flexDirection,
        overflow: style.overflow,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        parent: node.parentElement
          ? {
              tag: node.parentElement.tagName,
              className: node.parentElement.className,
              testId: node.parentElement.getAttribute("data-testid"),
            }
          : null,
      };
    };

    const target = document.querySelector('[data-testid="onboarding-action-import"]');
    const ancestors: ReturnType<typeof describe>[] = [];
    let current: Element | null = target;
    while (current && ancestors.length < 14) {
      ancestors.push(describe(current));
      current = current.parentElement;
    }

    return {
      point: { x, y },
      target: target ? describe(target) : null,
      ancestors,
      elementFromPoint: document.elementFromPoint(x, y)
        ? describe(document.elementFromPoint(x, y)!)
        : null,
      stack: document.elementsFromPoint(x, y).slice(0, 16).map(describe),
    };
  }, { x, y });

  console.log("HIT_DIAGNOSTIC", JSON.stringify(hit, null, 2));
});
