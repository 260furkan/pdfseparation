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
    });

    // PDF SAYFA AYIRMA İŞLEMLERİ

    selectFileBtn.addEventListener('click', () => pdfFileInput.click());

    pdfFileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
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
                } catch (error) {
                    showAlert('PDF yüklenirken hata oluştu.');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            showAlert('Lütfen geçerli bir PDF dosyası seçin.');
        }
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

    async function extractPages() {
        if (!pdfDoc) return showAlert('Lütfen PDF dosyası yükleyin.');

        const start = parseInt(startPage.value);
        const end = parseInt(endPage.value);

        if (isNaN(start) || isNaN(end)) return showAlert('Geçerli sayfa aralığı girin.');

        const totalPages = pdfDoc.getPageCount();
        const validStart = Math.max(1, Math.min(start, totalPages));
        const validEnd = Math.max(1, Math.min(end, totalPages));
        const lower = Math.min(validStart, validEnd);
        const upper = Math.max(validStart, validEnd);

        try {
            extractBtn.disabled = true;
            btnText.textContent = 'İşleniyor...';
            spinner.style.display = 'inline-block';

            const newPdf = await PDFLib.PDFDocument.create();
            const pages = await newPdf.copyPages(pdfDoc, Array.from({ length: upper - lower + 1 }, (_, i) => lower + i - 1));
            pages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const newFileName = `${pdfName}_sayfa_${lower}-${upper}.pdf`;

            saveAs(blob, newFileName);

        } catch (err) {
            console.error(err);
            showAlert('Sayfalar ayrılırken hata oluştu.');
        } finally {
            extractBtn.disabled = false;
            btnText.textContent = 'Sayfaları Ayır ve Kaydet';
            spinner.style.display = 'none';
        }
    }

    function showAlert(message) {
        alertText.textContent = message;
        alertMessage.style.display = 'flex';
    }

    function hideAlert() {
        alertMessage.style.display = 'none';
    }
});
