import { expect, test } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "path";

test("Document QA", async ({ page }) => {
  test.skip(
    !process?.env?.OPENAI_API_KEY,
    "OPENAI_API_KEY required to run this test",
  );

  if (!process.env.CI) {
    dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  }

  await page.goto("/");
  await page.waitForTimeout(2000);

  let modalCount = 0;
  try {
    const modalTitleElement = await page?.getByTestId("modal-title");
    if (modalTitleElement) {
      modalCount = await modalTitleElement.count();
    }
  } catch (error) {
    modalCount = 0;
  }

  while (modalCount === 0) {
    await page.getByText("New Project", { exact: true }).click();
    await page.waitForTimeout(5000);
    modalCount = await page.getByTestId("modal-title")?.count();
  }

  await page.getByRole("heading", { name: "Document QA" }).click();
  await page.waitForTimeout(1000);

  await page.getByTitle("fit view").click();
  await page.getByTitle("zoom out").click();
  await page.getByTitle("zoom out").click();
  await page.getByTitle("zoom out").click();

  let outdatedComponents = await page.getByTestId("icon-AlertTriangle").count();

  while (outdatedComponents > 0) {
    await page.getByTestId("icon-AlertTriangle").first().click();
    await page.waitForTimeout(1000);
    outdatedComponents = await page.getByTestId("icon-AlertTriangle").count();
  }

  await page
    .getByTestId("popover-anchor-input-api_key")
    .fill(process.env.OPENAI_API_KEY ?? "");

  await page.getByTestId("dropdown-model_name").click();
  await page.getByTestId("gpt-4o-1-option").click();

  await page.waitForTimeout(2000);
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("icon-FileSearch2").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "/assets/test_file.txt"));
  await page.getByText("test_file.txt").isVisible();

  await page.waitForTimeout(2000);

  await page.getByTestId("button_run_chat output").click();
  await page.waitForSelector("text=built successfully", { timeout: 30000 });

  await page.getByText("built successfully").last().click({
    timeout: 15000,
  });

  await page.getByText("Playground", { exact: true }).click();
  await page
    .getByText("No input message provided.", { exact: true })
    .last()
    .isVisible();

  await page.waitForSelector('[data-testid="input-chat-playground"]', {
    timeout: 100000,
  });
  await page
    .getByTestId("input-chat-playground")
    .last()
    .fill("whats the text in the file?");
  await page.getByTestId("icon-LucideSend").last().click();

  await page.waitForTimeout(3000);

  await page.getByText("this is a test file").last().isVisible();

  await page.getByText("Default Session").last().click();

  await page.getByText("timestamp", { exact: true }).last().isVisible();
  await page.getByText("text", { exact: true }).last().isVisible();
  await page.getByText("sender", { exact: true }).last().isVisible();
  await page.getByText("sender_name", { exact: true }).last().isVisible();
  await page.getByText("session_id", { exact: true }).last().isVisible();
  await page.getByText("files", { exact: true }).last().isVisible();

  await page.getByRole("gridcell").last().isVisible();
  await page.getByTestId("icon-Trash2").first().click();

  await page.waitForSelector('[data-testid="input-chat-playground"]', {
    timeout: 100000,
  });

  await page.getByTestId("input-chat-playground").last().isVisible();
});
