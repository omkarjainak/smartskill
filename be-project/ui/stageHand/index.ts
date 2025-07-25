/**
 * 🤘 Welcome to Stagehand!
 *
 * You probably DON'T NEED TO BE IN THIS FILE
 *
 * You're probably instead looking for the main() function in main.ts
 *
 * This is run when you do npm run start; it just calls main()
 *
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import { main } from "./main.js";
import boxen from "boxen";

async function run(url:string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
    url
  });
  await stagehand.close();
  console.log('Stagehand closed');
}

const args = process.argv.slice(2); // Get the command line arguments

run(args[0]);
