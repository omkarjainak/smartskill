/**
 * 🤘 Welcome to Stagehand!
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run start
 * ```
 *
 * To edit config, see `stagehand.config.ts`
 *
 */
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";
import { actWithCache, drawObserveOverlay, clearOverlays } from "./utils.js";

dotenv.config();

export async function main({
  page,
  context,
  stagehand,
  url
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
  url: string
}) {
  // Navigate to the page
  //await page.goto("https://docs.stagehand.dev/reference/introduction");
  await page.goto(url);

  // You can pass a string directly to act
 
  await page.waitForTimeout(500);
  const { text } = await page.extract({
    instruction:
      "extract the article content",
    schema: z.object({
      text: z.string(),
    }),
    useTextExtract: true, // Set this to true if you want to extract longer paragraphs
  });
  console.log(`###EXTRACT###\n ${text}`);
}
