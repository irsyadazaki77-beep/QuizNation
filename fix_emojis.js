
const fs = require("fs");
const path = require("path");

const emojiMap = {
    "Beranda": "??",
    "Statistik": "??",
    "Evaluasi SNBT": "??",
    "Pencapaian": "??",
    "Materi": "??",
    "Library": "??",
    "Pengaturan": "??",
    "Panduan": "??",
    "Feedback": "??",
    "Masuk": "??"
};

const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".html"));
let changedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;

    // Fix sidebar logo
    content = content.replace(/<span class="(sidebar-logo-icon|sb-logo-icon|logo-icon)">[^<]+<\/span>/g, `<span class="$1">??</span>`);

    // Fix hamburger
    content = content.replace(/<div class="hamburger"[^>]*>\s*<span>[^<]+<\/span>/g, (match) => {
        return match.replace(/<span>[^<]+<\/span>/, `<span>?</span>`);
    });

    // Fix sidebar close
    content = content.replace(/<button class="sidebar-close"[^>]*>[^<]+<\/button>/g, (match) => {
        return match.replace(/>[^<]+<\/button>/, `>?</button>`);
    });
    
    // Fix Theme label
    content = content.replace(/<span id="themeIcon">[^<]+<\/span>/g, `<span id="themeIcon">??</span>`);
    content = content.replace(/<span class="theme-label">[^<]*(Mode Gelap|Mode Terang)<\/span>/g, `<span class="theme-label">?? $1</span>`);

    // Fix Sidebar menu items (menu-icon / sb-icon)
    Object.keys(emojiMap).forEach(key => {
        const emoji = emojiMap[key];
        
        // Pattern: <span class="menu-icon">...</span><span>Beranda</span>
        const regex1 = new RegExp(`<span class="menu-icon">[^<]+<\\/span><span>${key}<\\/span>`, "g");
        if (regex1.test(content)) {
            content = content.replace(regex1, `<span class="menu-icon">${emoji}</span><span>${key}</span>`);
            changed = true;
        }

        // Pattern: <span class="sb-icon">...</span>Beranda
        const regex2 = new RegExp(`<span class="sb-icon">[^<]+<\\/span>${key}`, "g");
        if (regex2.test(content)) {
            content = content.replace(regex2, `<span class="sb-icon">${emoji}</span>${key}`);
            changed = true;
        }
        
        // Handle "Masuk Akun" / "Masuk / Daftar"
        if (key === "Masuk") {
            const regex3 = new RegExp(`<span class="menu-icon">[^<]+<\\/span><span class="login-text"[^>]*>[^<]*Masuk[^<]*<\\/span>`, "g");
            if (regex3.test(content)) {
                content = content.replace(regex3, (match) => match.replace(/<span class="menu-icon">[^<]+<\/span>/, `<span class="menu-icon">??</span>`));
                changed = true;
            }
            
            const regex4 = new RegExp(`<span class="sb-icon">[^<]+<\\/span>Masuk Akun`, "g");
            if (regex4.test(content)) {
                content = content.replace(regex4, `<span class="sb-icon">??</span>Masuk Akun`);
                changed = true;
            }
        }
    });

    // Specific to library.html hstat-icons
    if (file === "library.html") {
        content = content.replace(/<span class="hstat-icon">[^<]+<\/span>\s*<div>\s*<div class="hstat-num" data-count="5">/g, `<span class="hstat-icon">??</span>\n                    <div>\n                        <div class="hstat-num" data-count="5">`);
        content = content.replace(/<span class="hstat-icon">[^<]+<\/span>\s*<div>\s*<div class="hstat-num" data-count="33">/g, `<span class="hstat-icon">??</span>\n                    <div>\n                        <div class="hstat-num" data-count="33">`);
        content = content.replace(/<span class="hstat-icon">[^<]+<\/span>\s*<div>\s*<div class="hstat-num" data-count="25000">/g, `<span class="hstat-icon">??</span>\n                    <div>\n                        <div class="hstat-num" data-count="25000">`);
        changed = true;
    }

    if (content !== fs.readFileSync(file, "utf8")) {
        fs.writeFileSync(file, content, "utf8");
        changedFiles++;
    }
}
console.log(`Updated ${changedFiles} files.`);

