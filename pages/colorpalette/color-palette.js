
document.addEventListener('DOMContentLoaded', function () {
    // === TEMA ===
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector("i");

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

        (function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                applyTheme(savedTheme);
            } else {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                applyTheme(prefersDark ? 'dark' : 'light');
            }
        })();

        themeToggle.addEventListener("click", () => {
            const isDark = document.documentElement.classList.contains("dark");
            applyTheme(isDark ? "light" : "dark");
        });
    }

    // === PDF AYIRMA SAYFASI ===
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
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

        function showAlert(msg) {
            alertText.textContent = msg;
            alertMessage.style.display = "flex";
        }
        function hideAlert() {
            alertMessage.style.display = "none";
        }
        function resetFile() {
            pdfDoc = null;
            pdfName = '';
            pdfFileInput.value = '';
            fileInfo.style.display = 'none';
            dropZone.style.display = 'block';
            startPage.value = '';
            endPage.value = '';
            hideAlert();
        }

        selectFileBtn.addEventListener('click', () => pdfFileInput.click());
        pdfFileInput.addEventListener('change', handleFileSelect);

        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                pdfFileInput.files = e.dataTransfer.files;
                handleFileSelect({ target: pdfFileInput });
            }
        });

        removeFileBtn.addEventListener('click', resetFile);
        extractBtn.addEventListener('click', extractPages);

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                pdfName = file.name.replace('.pdf', '');
                fileName.textContent = pdfName;

                const reader = new FileReader();
                reader.onload = async function (event) {
                    try {
                        const typedarray = new Uint8Array(event.target.result);
                        pdfDoc = await PDFLib.PDFDocument.load(typedarray);
                        pageCount.textContent = `${pdfDoc.getPageCount()} sayfa`;
                        fileInfo.style.display = 'flex';
                        dropZone.style.display = 'none';
                        hideAlert();
                    } catch {
                        showAlert("PDF yüklenirken hata oluştu.");
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                showAlert("Lütfen geçerli bir PDF dosyası seçin.");
            }
        }

        async function extractPages() {
            if (!pdfDoc) return showAlert("Lütfen PDF dosyası yükleyin.");
            const start = parseInt(startPage.value);
            const end = parseInt(endPage.value);
            if (isNaN(start) || isNaN(end)) return showAlert("Geçerli sayfa aralığı girin.");

            const total = pdfDoc.getPageCount();
            const lower = Math.min(Math.max(1, start), total);
            const upper = Math.max(Math.min(end, total), lower);

            try {
                extractBtn.disabled = true;
                btnText.textContent = "İşleniyor...";
                spinner.style.display = "inline-block";

                const newPdf = await PDFLib.PDFDocument.create();
                const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: upper - lower + 1 }, (_, i) => lower + i - 1));
                pages.forEach(p => newPdf.addPage(p));

                const bytes = await newPdf.save();
                const blob = new Blob([bytes], { type: "application/pdf" });
                saveAs(blob, `${pdfName}_sayfa_${lower}-${upper}.pdf`);
            } catch {
                showAlert("Sayfalar ayrılırken hata oluştu.");
            } finally {
                extractBtn.disabled = false;
                btnText.textContent = "PDF Ayır ve İndir";
                spinner.style.display = "none";
            }
        }
    }

    // === RENK SEÇİCİ SAYFASI ===
    const colorPicker = document.getElementById("colorPicker");
    if (colorPicker) {
        const colorBox = document.getElementById("colorBox");
        const hexCode = document.getElementById("hexCode");
        const rgbCode = document.getElementById("rgbCode");
        const hslCode = document.getElementById("hslCode");
        const manualInput = document.getElementById("manualInput");
        const applyColor = document.getElementById("applyColor");

        function hexToRgb(hex) {
            hex = hex.replace("#", "");
            if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16)
            };
        }
        function rgbToHex(r, g, b) {
            return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
        }
        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }
        function updateColor(color) {
            colorBox.style.backgroundColor = color;
            let r, g, b;
            if (color.startsWith("#")) {
                ({ r, g, b } = hexToRgb(color));
                hexCode.textContent = color.toUpperCase();
                colorPicker.value = color;
            } else {
                let vals = color.match(/\d+/g).map(Number);
                [r, g, b] = vals;
                hexCode.textContent = rgbToHex(r, g, b).toUpperCase();
                colorPicker.value = rgbToHex(r, g, b);
            }
            rgbCode.textContent = `${r}, ${g}, ${b}`;
            let { h, s, l } = rgbToHsl(r, g, b);
            hslCode.textContent = `${h}, ${s}%, ${l}%`;
        }

        colorPicker.addEventListener("input", () => updateColor(colorPicker.value));
        applyColor.addEventListener("click", () => {
            let val = manualInput.value.trim();
            if (val.startsWith("#") || val.startsWith("rgb")) {
                updateColor(val);
            } else {
                alert("Geçerli bir HEX (#ff0000) veya RGB (rgb(255,0,0)) değeri girin!");
            }
        });

        document.querySelectorAll(".copyBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                let text = document.getElementById(btn.dataset.target).textContent;
                navigator.clipboard.writeText(text);
                btn.innerHTML = '<i class="fas fa-check text-green-600"></i>';
                setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i>', 1000);
            });
        });
    }
});

