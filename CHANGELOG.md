# Change Log

All notable changes to the "LaTeX Thesis Helper" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.5.1] - 2025-12-13

### Changed
- 📦 Removed COE198 Research Proposal template zip (reducing extension size)
- 👋 Removed LaTeX Workshop dependency - extension now works standalone
- 💡 **Guided LaTeX installation** - When LaTeX isn't found:
  - "Download Installer" button opens MiKTeX/MacTeX/TeX Live download page
  - "Copy Install Command" copies `winget install MiKTeX.MiKTeX` (Windows), `brew install --cask mactex` (macOS), or `sudo apt install texlive-full` (Linux) to clipboard
- 🐧 Fixed PowerShell compatibility (uses `;` separator and `Push-Location`)

## [0.5.0] - 2025-12-13

### Added
- 🔧 **Configurable LaTeX Engine** - Choose between `pdflatex`, `xelatex`, or `lualatex`
- 📚 **Configurable Bibliography Tool** - Choose `none`, `biber`, or `bibtex`
- 🔄 **Compile on Save** option (disabled by default)
- ✅ **Cross-platform CI/CD** - Automated testing on Windows, macOS, and Linux
- 🧪 **Improved test suite** - Extension activation, command registration, and cross-platform tests

### Changed
- 🚀 Compile command now respects user configuration for LaTeX engine and bibliography tool
- 📦 Publish workflow now requires all platform tests to pass before releasing

## [0.4.4] - 2025-12-02

### Changed
- 🔄 Compile command now uses LaTeX Workshop extension instead of custom implementation
- ✨ Automatically prompts to install LaTeX Workshop if not present
- 🧹 Removed redundant LaTeX distribution detection (LaTeX Workshop handles this)

## [0.4.3] - 2025-12-01

### Added
- ✨ LaTeX installation detection before compiling
- 💡 Helpful error messages with platform-specific installation instructions
- 🔗 "Open Installation Guide" button linking to MiKTeX (Windows), MacTeX (macOS), or TeX Live (Linux)

## [0.4.2] - 2025-12-01

### Fixed
- 🐛 Fixed PowerShell compatibility issue on Windows (replaced `&&` with `;` separator)
- 🐛 Improved cross-platform terminal command handling for Windows, macOS, and Linux
- 🐛 Use `Push-Location`/`Pop-Location` for reliable directory handling in PowerShell

## [0.4.1] - 2025-12-01

### Fixed
- 🐛 Cross-platform path handling for Windows, macOS, and Linux
- 🐛 Template file creation now works correctly on all operating systems
- 🐛 Compile command now works properly on Windows

## [0.4.0] - 2025-11-29

### Added
- 🎓 **COE198 Research Proposal** template (MSU-IIT)
  - Complete Rho class integration
  - Pre-configured sections for research proposals
  - Includes bibliography setup and formatting

## [0.3.0] - 2025-11-29

### Added
- 📄 **New Document from Template** command
  - IEEE Conference Paper template
  - IEEE Journal Article template
  - Standard Thesis template (report class)
  - Book-style Thesis template
  - Academic Article template
  - Research Proposal template
  - Dissertation template
- Creates complete project structure with folders and files
- Quick Insert now includes "New Document" and "Word Goal" shortcuts

## [0.2.0] - 2025-11-29

### Added
- 🎯 Word count goal tracker with visual progress bar
- New command: `LaTeX Helper: Set Word Count Goal`
- Configurable `latexHelper.wordCountGoal` setting
- Number formatting in stats panel (e.g., 1,234 instead of 1234)

### Changed
- Improved stats panel UI with better styling

## [0.1.0] - 2024-11-29

### Added
- 📊 Live document statistics panel (words, pages, sections, citations, figures, tables)
- 📑 Section navigator with hierarchical tree view
- 📚 Bibliography manager with citation search and insert
- 🖼️ Figure and table manager
- ⚡ Quick insert snippets for common LaTeX structures
- 📝 Thesis chapter templates (Abstract, Introduction, Methodology, Results, Conclusion)
- ⌨️ Keyboard shortcuts for citation, figure, and table insertion
- 🔄 Auto-refresh on document save