# LaTeX Thesis Helper

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=thesis-tools.latex-thesis-helper)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](https://github.com/Seuketchi/latex-helper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A powerful VS Code extension that streamlines LaTeX thesis writing with smart navigation, bibliography management, and real-time document statistics.**

---

## ✨ Features

### 📊 Live Document Stats
Get real-time insights into your document with an interactive stats panel:
- **Word count** — Track your progress
- **Page estimate** — Know your document length
- **Citation count** — Monitor your references
- **Figures & tables count** — Keep track of visual elements

### 📑 Section Navigator
Navigate your thesis structure effortlessly:
- Hierarchical tree view of all sections and subsections
- One-click navigation to any section
- Per-section word count for balanced writing

### 📚 Bibliography Manager
Manage your references with ease:
- Browse all citations from `.bib` files
- Quick search and insert with `Ctrl+Shift+C`
- Preview author, title, and year at a glance

### 🖼️ Figure & Table Manager
Keep track of all visual elements:
- Complete list of figures and tables
- Quick navigation to any element
- Caption and label preview

### ⚡ Quick Insert Snippets
Insert common LaTeX structures in seconds:
- **Figures** — Complete figure environment with label and caption
- **Tables** — Customizable table with column specification
- **Sections** — Auto-generated labels for cross-referencing
- **Thesis Templates** — Pre-built templates for Abstract, Introduction, Methodology, Results, and Conclusion

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Shift+C` | Insert Citation | Search and insert a citation from your bibliography |
| `Ctrl+Shift+F` | Insert Figure | Insert a figure environment template |
| `Ctrl+Shift+T` | Insert Table | Insert a table environment template |

> **Tip:** All shortcuts work when editing `.tex` files with the editor focused.

---

## 🚀 Getting Started

### Installation

#### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "LaTeX Thesis Helper"
4. Click **Install**

#### From VSIX File
1. Download the `.vsix` file from [Releases](https://github.com/Seuketchi/latex-helper/releases)
2. In VS Code, go to Extensions → `...` → **Install from VSIX**
3. Select the downloaded file

### Quick Start

1. **Open** a LaTeX project in VS Code
2. **Click** the 📖 book icon in the Activity Bar to open LaTeX Helper
3. **Explore** the sidebar panels:
   - **Document Stats** — View real-time statistics
   - **Sections** — Navigate your document structure
   - **Bibliography** — Manage and insert citations
   - **Figures & Tables** — Track visual elements
   - **Quick Insert** — Add common LaTeX structures

---

## 📋 Requirements

| Requirement | Details |
|-------------|---------|
| VS Code | Version 1.85.0 or higher |
| LaTeX Files | `.tex` files in your workspace |
| Bibliography | `.bib` files (optional, for citation features) |

---

## 🔧 Extension Settings

This extension contributes the following commands:

| Command | Description |
|---------|-------------|
| `LaTeX Helper: Insert Figure` | Insert a figure environment |
| `LaTeX Helper: Insert Table` | Insert a table environment |
| `LaTeX Helper: Insert Citation` | Search and insert a citation |
| `LaTeX Helper: Insert Section` | Insert a new section |
| `LaTeX Helper: Insert Thesis Template` | Insert a thesis chapter template |
| `LaTeX Helper: Show Document Stats` | Display document statistics |

---

## 🐛 Known Issues

- Section word counts may be approximate for complex document structures
- Bibliography parsing requires standard BibTeX format

See the [issue tracker](https://github.com/Seuketchi/latex-helper/issues) for current bugs and feature requests.

---

## 📝 Release Notes

### 0.1.0 (Initial Release)
- ✅ Live document statistics panel
- ✅ Section navigator with word counts
- ✅ Bibliography browser and citation insertion
- ✅ Figure and table manager
- ✅ Quick insert snippets for common LaTeX structures
- ✅ Thesis chapter templates

See [CHANGELOG](CHANGELOG.md) for full release history.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Seuketchi/latex-helper/pulls).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with the [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by the academic writing community

---

<p align="center">
  <strong>Made with ❤️ for thesis writers everywhere</strong>
</p>

<p align="center">
  <a href="https://github.com/Seuketchi/latex-helper/issues">Report Bug</a>
  ·
  <a href="https://github.com/Seuketchi/latex-helper/issues">Request Feature</a>
</p>
