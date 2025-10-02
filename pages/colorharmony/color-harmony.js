let colorPalettes = [];

async function loadColorPalettes() {
    try {
        const response = await fetch('renk_paleti_500_kategorili.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        colorPalettes = await response.json();
        populateCategoryFilter(colorPalettes);
        loadPalettes(colorPalettes);
    } catch (error) {
        console.error('Error loading color palettes:', error);
        // Fallback data
        colorPalettes = [
            {
                "id": 1,
                "name": "Loş Yıldız Tozu",
                "colors": ["#5F9EA0", "#00BFFF", "#20B2AA", "#1E90FF"],
                "category": "gece"
            },
            {
                "id": 2,
                "name": "Mat Sinyaller",
                "colors": ["#800080", "#E6E6FA"],
                "category": "mor"
            }
        ];
        populateCategoryFilter(colorPalettes);
        loadPalettes(colorPalettes);
    }
}

// ✅ Kategorileri dinamik olarak ekler
function populateCategoryFilter(palettes) {
    const select = document.getElementById('categoryFilter');
    const categories = [...new Set(palettes.map(p => p.category))].sort();

    // Temizle ve "Tüm Kategoriler"i yeniden ekle
    select.innerHTML = '<option value="all">Tüm Kategoriler</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        select.appendChild(option);
    });
}

function loadPalettes(palettes) {
    const container = document.getElementById('palettesContainer');
    container.innerHTML = '';

    palettes.forEach(palette => {
        const paletteCard = document.createElement('div');
        paletteCard.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow';

        const paletteName = document.createElement('h3');
        paletteName.className = 'text-lg font-medium mb-3';
        paletteName.textContent = palette.name;

        const colorsContainer = document.createElement('div');
        colorsContainer.className = 'flex transform-style-preserve-3d transform-perspective-1000';

        palette.colors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-item';
            colorBtn.style.setProperty('--color', color);
            colorBtn.setAttribute('aria-color', color);
            colorBtn.setAttribute('data-color', color);
            colorsContainer.appendChild(colorBtn);
        });

        paletteCard.appendChild(paletteName);
        paletteCard.appendChild(colorsContainer);
        container.appendChild(paletteCard);
    });
}

function filterPalettes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterCategory = document.getElementById('categoryFilter').value;

    const filtered = colorPalettes.filter(palette => {
        const matchesSearch = palette.name.toLowerCase().includes(searchTerm) ||
            palette.colors.some(color => color.toLowerCase().includes(searchTerm));

        const matchesCategory = filterCategory === 'all' || (palette.category && palette.category === filterCategory);

        return matchesSearch && matchesCategory;
    });

    loadPalettes(filtered);
}

function copyColorToClipboard(color) {
    navigator.clipboard.writeText(color).then(() => {
        showCopyMessage(color + ' kopyalandı!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showCopyMessage('Kopyalama başarısız!');
    });
}

function showCopyMessage(msg) {
    const copyMsg = document.getElementById('copyMessage');
    copyMsg.textContent = msg;
    copyMsg.classList.remove('hidden');

    setTimeout(() => {
        copyMsg.classList.add('hidden');
    }, 1200);
}

document.addEventListener('DOMContentLoaded', () => {
    loadColorPalettes();

    document.getElementById('searchInput').addEventListener('input', filterPalettes);
    document.getElementById('categoryFilter').addEventListener('change', filterPalettes);

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-item') || e.target.closest('.color-item')) {
            const colorItem = e.target.closest('.color-item');
            const color = colorItem.getAttribute('data-color');
            copyColorToClipboard(color);
        }
    });

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

 // Tema uygulama
  const globalTheme = localStorage.getItem('theme');
  if (globalTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Font uygulama
  const globalFont = localStorage.getItem('selectedFont');
  if (globalFont) {
    document.body.style.fontFamily = globalFont;
  }

  