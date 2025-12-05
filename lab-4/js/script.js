// klucz do localStorage
const STORAGE_KEY = 'lab4-kanban-board';

// kolejność kolumn
const kolumny = ['todo', 'progress', 'done'];

// stan wszystkich kart
// pojedyncza karta
let karty = [];

// główny kontener tablicy
const board = document.querySelector('.board');

// listy kart w kolumnach
const listy = {
    todo: document.querySelector('[data-list="todo"]'),
    progress: document.querySelector('[data-list="progress"]'),
    done: document.querySelector('[data-list="done"]'),
};

// liczniki kart w kolumnach
const liczniki = {
    todo: document.querySelector('[data-counter="todo"]'),
    progress: document.querySelector('[data-counter="progress"]'),
    done: document.querySelector('[data-counter="done"]'),
};

// losowy kolor HSL
function losowyKolor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 75%)`;
}

// zapis tablicy kart do localStorage
function zapiszStan() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(karty));
}

// odczyt stanu z localStorage
function wczytajStan() {
    const zapisane = localStorage.getItem(STORAGE_KEY);

    if (!zapisane) {
        return;
    }

    try {
        const dane = JSON.parse(zapisane);
        if (Array.isArray(dane)) {
            karty = dane;
        }
    } catch (err) {
        console.warn('Błąd odczytu z localStorage:', err);
    }
}

// aktualizacja liczników w każdej kolumnie
function aktualizujLiczniki() {
    kolumny.forEach((kolumna) => {
        const liczbaKart = karty.filter(
            (karta) => karta.column === kolumna
        ).length;
        if (liczniki[kolumna]) {
            liczniki[kolumna].textContent = liczbaKart;
        }
    });
}

// tworzenie obiektu z danymi nowej karty
function utworzDaneKarty(nazwaKolumny) {
    const karta = {
        id: 'card-' + Date.now(),
        title: 'Nowa karta',
        color: losowyKolor(),
        column: nazwaKolumny,
    };

    return karta;
}

// znajdź kartę po id
function znajdzKarte(idKarty) {
    return karty.find((karta) => karta.id === idKarty);
}

// usuń kartę po id
function usunKarte(idKarty) {
    const index = karty.findIndex((karta) => karta.id === idKarty);
    if (index !== -1) {
        karty.splice(index, 1);
    }
}

// disabled na strzałkach w zależności od kolumny
function aktualizujStrzalkiDlaKarty(elementKarty, nazwaKolumny) {
    const indexKolumny = kolumny.indexOf(nazwaKolumny);
    const btnLewo = elementKarty.querySelector('.card-btn-left');
    const btnPrawo = elementKarty.querySelector('.card-btn-right');

    if (btnLewo) {
        btnLewo.disabled = indexKolumny <= 0;
    }

    if (btnPrawo) {
        btnPrawo.disabled = indexKolumny === kolumny.length - 1;
    }
}

// tworzenie elementów DOM dla karty

function utworzElementKarty(daneKarty) {
    // <article class="card">
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = daneKarty.id;
    card.dataset.column = daneKarty.column;
    card.style.backgroundColor = daneKarty.color;

    // tytuł karty
    const tytul = document.createElement('div');
    tytul.className = 'card-title';
    tytul.contentEditable = 'true';
    tytul.textContent = daneKarty.title;

    // stopka z przyciskami
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const btnLewo = document.createElement('button');
    btnLewo.type = 'button';
    btnLewo.className = 'card-btn card-btn-left';
    btnLewo.dataset.move = 'left';
    btnLewo.textContent = '←';

    const btnPrawo = document.createElement('button');
    btnPrawo.type = 'button';
    btnPrawo.className = 'card-btn card-btn-right';
    btnPrawo.dataset.move = 'right';
    btnPrawo.textContent = '→';

    const btnKolor = document.createElement('button');
    btnKolor.type = 'button';
    btnKolor.className = 'card-btn card-btn-color';
    btnKolor.dataset.role = 'color-one';
    btnKolor.textContent = '🎨';

    const btnUsun = document.createElement('button');
    btnUsun.type = 'button';
    btnUsun.className = 'card-btn card-btn-delete';
    btnUsun.dataset.role = 'delete';
    btnUsun.textContent = '✕';

    footer.appendChild(btnLewo);
    footer.appendChild(btnPrawo);
    footer.appendChild(btnKolor);
    footer.appendChild(btnUsun);

    card.appendChild(tytul);
    card.appendChild(footer);

    aktualizujStrzalkiDlaKarty(card, daneKarty.column);

    return card;
}

// Renderowanie tablicy

function wyswietlKolumne(nazwaKolumny) {
    const lista = listy[nazwaKolumny];

    if (!lista) {
        return;
    }

    // wyczyszczenie kolumny
    lista.innerHTML = '';

    // wszystkie karty z tej kolumny
    const kartyWKolumnie = karty.filter(
        (karta) => karta.column === nazwaKolumny
    );

    // dodanie elementów DOM
    kartyWKolumnie.forEach((karta) => {
        const elementKarty = utworzElementKarty(karta);
        lista.appendChild(elementKarty);
    });

    aktualizujLiczniki();
}

// render całej tablicy (wszystkie kolumny)
function wyswietlTablice() {
    kolumny.forEach((kolumna) => {
        wyswietlKolumne(kolumna);
    });
}

// przesuwanie karty między kolumnami
function przeniesKarte(idKarty, kierunek) {
    const karta = znajdzKarte(idKarty);
    if (!karta) {
        return;
    }

    const indexKolumny = kolumny.indexOf(karta.column);
    if (indexKolumny === -1) {
        return;
    }

    let nowyIndex = indexKolumny;

    if (kierunek === 'left') {
        nowyIndex = Math.max(0, indexKolumny - 1);
    } else if (kierunek === 'right') {
        nowyIndex = Math.min(kolumny.length - 1, indexKolumny + 1);
    }

    if (nowyIndex === indexKolumny) {
        return;
    }

    karta.column = kolumny[nowyIndex];
    zapiszStan();
    wyswietlTablice();
}

// kolorowanie wszystkich kart w kolumnie
function pokolorujKolumne(nazwaKolumny) {
    karty.forEach((karta) => {
        if (karta.column === nazwaKolumny) {
            karta.color = losowyKolor();
        }
    });

    zapiszStan();
    wyswietlKolumne(nazwaKolumny);
}

// sortowanie kart w kolumnie po tytule alfabetycznie
function sortujKolumne(nazwaKolumny) {
    const wKolumnie = karty.filter((karta) => karta.column === nazwaKolumny);
    const inne = karty.filter((karta) => karta.column !== nazwaKolumny);

    wKolumnie.sort((a, b) => {
        const t1 = a.title || '';
        const t2 = b.title || '';
        return t1.localeCompare(t2);
    });

    karty = inne.concat(wKolumnie);

    zapiszStan();
    wyswietlKolumne(nazwaKolumny);
}

// Zdarzenia

board.addEventListener('click', (e) => {
    const przycisk = e.target.closest('button');

    if (!przycisk) {
        return;
    }

    // obsługa przycisków kolumn
    if (przycisk.dataset.action) {
        const kolumnaEl = przycisk.closest('.column');

        if (!kolumnaEl) {
            return;
        }

        const nazwaKolumny = kolumnaEl.dataset.column;

        // dodanie nowej karty
        if (przycisk.dataset.action === 'add') {
            const nowaKarta = utworzDaneKarty(nazwaKolumny);
            karty.push(nowaKarta);
            zapiszStan();
            wyswietlKolumne(nazwaKolumny);

            // fokus na tytuł nowej karty
            const lista = listy[nazwaKolumny];
            const ostatniaKarta = lista ? lista.lastElementChild : null;
            const tytul = ostatniaKarta
                ? ostatniaKarta.querySelector('.card-title')
                : null;

            if (tytul) {
                tytul.focus();
                const sel = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(tytul);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        // kolorowanie całej kolumny
        if (przycisk.dataset.action === 'color-column') {
            pokolorujKolumne(nazwaKolumny);
        }

        // sortowanie
        if (przycisk.dataset.action === 'sort') {
            sortujKolumne(nazwaKolumny);
        }

        return;
    }

    // obsługa przycisków na kartach
    const kartaEl = przycisk.closest('.card');

    if (!kartaEl) {
        return;
    }

    const idKarty = kartaEl.dataset.id;

    // usuwanie karty
    if (przycisk.dataset.role === 'delete') {
        usunKarte(idKarty);
        zapiszStan();
        wyswietlTablice();
        return;
    }

    // kolorowanie pojedynczej karty
    if (przycisk.dataset.role === 'color-one') {
        const karta = znajdzKarte(idKarty);
        if (!karta) {
            return;
        }

        karta.color = losowyKolor();
        kartaEl.style.backgroundColor = karta.color;
        zapiszStan();
        return;
    }

    // przesuwanie w lewo
    if (przycisk.dataset.move === 'left') {
        przeniesKarte(idKarty, 'left');
        return;
    }

    // przesuwanie w prawo
    if (przycisk.dataset.move === 'right') {
        przeniesKarte(idKarty, 'right');
        return;
    }
});

// Zdarzenie edycja tytułu karty

board.addEventListener('input', (e) => {
    const cel = e.target;

    if (!cel.classList || !cel.classList.contains('card-title')) {
        return;
    }

    const kartaEl = cel.closest('.card');
    if (!kartaEl) {
        return;
    }

    const idKarty = kartaEl.dataset.id;
    const karta = znajdzKarte(idKarty);

    if (!karta) {
        return;
    }

    karta.title = cel.textContent.trim();
    zapiszStan();
});

// odczyt danych z localStorage
wczytajStan();

// pierwsze renderowanie tablicy
wyswietlTablice();
