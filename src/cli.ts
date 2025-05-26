#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const search_manga_1 = require("./commands/search_manga");
const program = new commander_1.Command();
program
  .version("1.0.0")
  .argument("[query]", "Manga search term")
  .action(async (query: any) => {
    const mangaId = await (0, search_manga_1.searchManga)(query);
  });
program.parse(process.argv);
