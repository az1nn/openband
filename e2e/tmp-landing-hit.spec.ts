import { test, expect } from "@playwright/test";

test("diagnose landing CTA hit target", async ({ page }) => {
  await page.goto("/");
  const button = page.getByTestId("launch-start-creating");
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
    return {
      point: { x, y },
      elementFromPoint: document.elementFromPoint(x, y)
        ? describe(document.elementFromPoint(x, y)!)
        : null,
      stack: document.elementsFromPoint(x, y).slice(0, 12).map(describe),
      flexViews: Array.from(document.querySelectorAll("div.r-13awgt0"))
        .map(describe)
        .filter((item) => item.rect.width > 0 && item.rect.height > 0),
    };
  }, { x, y });
  console.log("HIT_DIAGNOSTIC", JSON.stringify(hit, null, 2));
});
