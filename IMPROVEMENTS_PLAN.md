# MangaReader-CLI Refactoring Plan

This document outlines the plan to refactor and improve the `mangareader-cli` application, with a primary focus on enhancing the User Experience (UX) and User Interface (UI).

## Phase 1: Core UX Refactor (Navigation & Prompts)

The current text-based command system (`"next"`, `"back"`) is unintuitive. Replacing it with a structured prompt-based system will significantly improve usability.

- [x] **Replace Text-Based Navigation:** Convert all `inquirer` prompts of type `input` used for navigation into `list` or `rawlist` types. This will present clear, selectable options to the user instead of requiring them to type commands.
- [x] **Create Consistent Navigation Menus:** At each stage (manga selection, chapter selection), provide a consistent set of actions like "Next Page," "Previous Page," "Back," and "Exit."
- [x] **Remove Forced Delays:** Replace all `setTimeout` calls, which force the user to wait, with input-based prompts like "Press Enter to continue." This gives the user control over the application flow.

## Phase 2: Display & Layout Improvements

The current columnar display can be hard to read. Improving the visual hierarchy and layout will make the application easier on the eyes.

- [x] **Simplify List Displays:** Refactor the `displayManga` and `displayChapters` helper functions. A simple, clean, numbered list might be more effective than the current multi-column layout.
- [x] **Enhance Visual Hierarchy:** Use the `chalk` library more effectively to add color and style, creating a clearer distinction between titles, descriptions, instructions, and prompts.
- [x] **Add "Quick View" Details:** Include essential details like `year` or `status` directly in the main manga search list to provide more context at a glance.

## Phase 3: Chapter Reading Flow

The process of selecting and reading chapters can be made smoother and more intuitive.

- [x] **Improve Post-Reading Workflow:** After a chapter is opened in the browser, instead of a timed delay, the CLI should wait for user input before returning to the chapter list.
- [x] **Implement Bi-Directional Chapter Navigation:** Enhance the post-viewing prompt to allow reading the "Next" or "Previous" chapter, or returning to the chapter list.

## Phase 4: Code Structure & Refactoring

The main command file is overly complex. Breaking it down will improve maintainability.

- [x] **Deconstruct `search_manga.ts`:** Break down the monolithic `searchManga` function into smaller, single-responsibility functions (e.g., `promptForMangaSelection`, `promptForChapterSelection`).
- [x] **Centralize UI Prompts:** Create a dedicated `ui.ts` or `prompts.ts` helper file to abstract away `inquirer` prompt logic, ensuring a consistent look and feel across the application.

## Phase 5: Polishing

Final touches to make the application feel more complete and professional.

- [x] **Add a Welcome Screen:** Create a simple, visually appealing welcome message that appears when the CLI starts.
- [x] **Refine Error Messaging:** Make error messages more user-friendly and provide clear, actionable advice on what to do next.
- [x] **Add a Help Option:** Include a "Help" option in the main menus to explain the different commands and features.