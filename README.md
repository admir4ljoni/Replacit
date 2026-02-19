# 🔄 Replacit

**Replacit** is a minimalist, ultra-lightweight, and 100% private web application for bulk find-and-replace operations in documents. 

Designed for students, professionals, and privacy-conscious users, Replacit ensures your documents never leave your machine while providing powerful text manipulation tools.

---

## ✨ Key Features

- **🔒 100% Client-Side**: No backend, no accounts, no tracking. Your files are processed entirely within your browser's memory.
- **📄 Document Support**:
  - **.docx**: Preserves your formatting (bold, italic, colors, etc.) using XML-level manipulation.
  - **.txt**: Fast and simple plain text processing.
- **🛠 Powerful Find & Replace**:
  - **Multiple Pairs**: Add as many find/replace groups as you need.
  - **Regex Mode**: Use Regular Expressions for complex patterns.
  - **Case Sensitivity**: Toggle exact case matching.
  - **Whole Word**: Avoid accidental partial matches.
- **👁 Live Preview**: See your matches highlighted in real-time as you type.
- **🎨 Premium UI**: A clean, responsive design built with **Oat UI**, featuring dark/light mode support.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository (or extract the zip)
cd replacit

# Install dependencies
npm install
```

### Development
```bash
# Launch the local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Documentation
```bash
# Generate the JSDoc HTML documentation
npm run docs
```
View the generated documentation by opening `docs/index.html` in your browser.

---

## 📦 Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + Vanilla JavaScript
- **Styling**: [Oat UI](https://oat.ink/) (Semantic, minimal, zero-dependency)
- **Processing**:
  - [JSZip](https://stuk.github.io/jszip/): For `.docx` (OOXML) extraction and repacking.
  - [Mammoth.js](https://github.com/mwilliamson/mammoth.js): For high-fidelity `.docx` to HTML preview rendering.
  - [FileSaver.js](https://github.com/eligrey/FileSaver.js/): For client-side file downloads.
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

## 📂 Project Structure

- `src/core/`: The "brain" — contains pure logic for find/replace and document processing.
- `src/components/`: Modular UI components (FileUpload, Preview, etc.).
- `src/utils/`: Shared helper functions for file handling and downloads.
- `src/style.css`: Custom overrides and branding on top of Oat UI.

---

## ⚖️ License

MIT © 2026 Replacit Team

