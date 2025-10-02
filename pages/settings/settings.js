document.addEventListener('DOMContentLoaded', function () {
    // Tema butonu varsa
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        // ... tema kodları
    }

    // PDF ayırma sayfası kodu
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        // ... pdf işlemleri buraya
    }

    // Renk seçici sayfası kodu
    const colorPicker = document.getElementById("colorPicker");
    if (colorPicker) {
        // ... renk seçici kodları
    }

    // Ayarlar sayfası kodu
    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
        // ... ayarlar kodları
    }
});
document.addEventListener('DOMContentLoaded', function () {
    // ELEMENTLER
    const themeToggle = document.getElementById("themeToggle");
    const icon = themeToggle.querySelector("i");

    const dropZone = document.getElementById('dropZone');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const pdfFileInput = document.getElementById('pdfFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const pageCount = document.getElementById('pageCount');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const extractBtn = document.getElementById('extractBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    const startPage = document.getElementById('startPage');
    const endPage = document.getElementById('endPage');

    let pdfDoc = null;
    let pdfName = '';

    // TEMA FONKSİYONLARI
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            document.documentElement.classList.remove('dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', theme);
    }

    // FONT UYGULAMA
    function applyFont(font) {
        if (font) {
            document.body.style.fontFamily = font;
            localStorage.setItem('selectedFont', font);
        } else {
            document.body.style.fontFamily = '';
            localStorage.removeItem('selectedFont');
        }
    }

    // Başlangıçta tema ve fontu uygula
    (function initThemeAndFont() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            // Cihaz tercihi
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }

        const savedFont = localStorage.getItem('selectedFont');
        if (savedFont) {
            applyFont(savedFont);
        }
    })();

    // Tema toggle event
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });})