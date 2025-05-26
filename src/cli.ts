#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const search_manga = require("./commands/search_manga");
const program = new commander.Command();
program
  .version("1.0.0")
  .argument("[query]", "Manga search term")
  .action(async (query: any) => {
    const results = await (0, search_manga.searchManga)(query);
  });
program.parse(process.argv);
