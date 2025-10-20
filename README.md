<div align="center">
  <br />
  <h1>📖 MangaCLI</h1>
  <br />
  <p><strong>Your favorite manga, right from your terminal.</strong></p>
  <p>A powerful command-line tool to search, browse, and read manga from MangaDex.</p>
  <br />
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License">
    <img src="https://img.shields.io/badge/made%20with-TypeScript-blue.svg" alt="Made with TypeScript">
  </p>
</div>

---

## ✨ Features

- **⚡️ Interactive & Quick Search**: Instantly search for any manga from MangaDex's vast library.
- **📖 Detailed Manga Info**: View manga details, including description, status, genres, and tags.
- **📚 Seamless Chapter Navigation**: Easily browse through chapter lists with pagination support.
- **🖥️ Comfortable Reading**: Opens chapters directly in your default web browser for an optimal reading experience.
- **🎨 Themed & Colorful Interface**: Enjoy a visually appealing and easy-to-navigate terminal UI.
- **🌐 Cross-Platform**: Works flawlessly on Windows, macOS, and Linux.

---

## 🚀 Installation

To get started, you need to have Node.js and npm installed. Then, install MangaCLI globally:

```bash
npm install -g mangareader-cli
```
*(Note: You might need to publish the package to npm first!)*

---

## 🎮 How to Use

There are two ways to use MangaCLI:

### 1. Interactive Mode

Simply run the command without any arguments to enter the interactive search prompt:

```bash
mangareader-cli
```

You will be guided through the process of searching, selecting a manga, and choosing a chapter.

### 2. Direct Search

Provide a search query directly as an argument to see results immediately:

```bash
mangareader-cli "solo leveling"
```

### Navigation
- Use the **arrow keys** (↑/↓) to navigate lists.
- Press **Enter** to make a selection.
- Follow the on-screen prompts for actions like going to the next/previous page, viewing chapters, or exiting.

---

## 📦 Tech Stack

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [MangaDex API](https://api.mangadex.org/docs/)
- [Commander.js](https://github.com/tj/commander.js/) for command-line arguments.
- [Inquirer](https://github.com/SBoudrias/Inquirer.js/) for interactive prompts.
- [Axios](https://axios-http.com/) for making API requests.
- [Chalk](https://github.com/chalk/chalk) for terminal styling.
- [Ora](https://github.com/sindresorhus/ora) for loading spinners.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or find any bugs, feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.