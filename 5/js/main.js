const STORAGE_KEY = 'void_protocol_deck';

const DEFAULT_CARDS = [
    // Юниты
    { type: 'unit',  name: 'Квантовый призрак',   cost: 3, rarity: 'rare',      description: 'Призрак из квантового измерения, способный проходить сквозь любые барьеры.',       attack: 4, defense: 2, ability: 'Фаза: неуязвим в первый ход после выхода на поле.' },
    { type: 'unit',  name: 'Стальной колосс',      cost: 5, rarity: 'epic',      description: 'Боевой дрон класса Titan, собранный из обломков уничтоженных кораблей.',            attack: 6, defense: 5, ability: 'Ярость: +2 к атаке за каждый погибший союзник.' },
    { type: 'unit',  name: 'Разведчик пустоты',    cost: 1, rarity: 'common',    description: 'Лёгкий дрон-разведчик, патрулирующий периметр.',                                   attack: 1, defense: 1, ability: 'Прорыв: может атаковать противника напрямую.' },
    { type: 'unit',  name: 'Плазменный страж',     cost: 4, rarity: 'rare',      description: 'Защитник в тяжёлой броне, вооружённый плазменным клинком.',                         attack: 3, defense: 4, ability: 'Защитник: все атаки противника перенаправляются на него.' },
    { type: 'unit',  name: 'Левиафан пустоты',     cost: 7, rarity: 'legendary', description: 'Огромный боевой крейсер, внушающий ужас одним своим появлением.',                  attack: 8, defense: 8, ability: 'Ужас: при выходе наносит 2 урона всем юнитам противника.' },

    // Заклинания
    { type: 'spell', name: 'Импульс данных',       cost: 2, rarity: 'common',    description: 'Сконцентрированный поток энергии, сжигающий схемы цели.',                          effect: 'Нанеси 3 урона выбранному юниту.' },
    { type: 'spell', name: 'Перехват нейросети',   cost: 4, rarity: 'rare',      description: 'Взлом управляющей системы вражеского дрона.',                                       effect: 'Захвати управление одним юнитом противника до конца хода.' },
    { type: 'spell', name: 'Каскадное обнуление',  cost: 6, rarity: 'epic',      description: 'Тотальный сброс всех активных процессов на поле боя.',                              effect: 'Уничтожь всех юнитов на поле.' },
    { type: 'spell', name: 'Системное восстановление', cost: 3, rarity: 'rare',  description: 'Экстренный ремонт и перезапуск выведенного из строя союзника.',                     effect: 'Верни одного своего погибшего юнита обратно на поле.' },

    // Ловушки
    { type: 'trap',  name: 'Глушитель сигнала',    cost: 1, rarity: 'common',    description: 'Устройство подавления связи, скрытно установленное на поле.',                      trigger: 'Когда противник разыгрывает заклинание — отмени его.' },
    { type: 'trap',  name: 'Засада из пустоты',    cost: 2, rarity: 'rare',      description: 'Замаскированные дроны, ожидающие команды к атаке.',                                 trigger: 'Когда юнит противника атакует — нанеси ему 3 урона.' },
    { type: 'trap',  name: 'Петля обратной связи', cost: 3, rarity: 'epic',      description: 'Замкнутый контур, отражающий действие обратно на его источник.',                    trigger: 'Когда противник берёт карту — заставь его сбросить 2 карты.' },
];

let cards    = [];
let editMode = false;

function loadCards() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            let parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                cards = parsed.map(cardFromJSON);
                return;
            }
        } catch (e) {}
    }
    cards = DEFAULT_CARDS.map(cardFromJSON);
}

function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards.map(c => c.toJSON())));
}

// buildSite — главная функция сборки сайта.
// Всё содержимое <body> генерируется на основе объектов классов Card.
function buildSite() {
    let editLabel = editMode ? 'Режим просмотра' : 'Режим редактирования';

    let sections = renderSections();

    document.body.innerHTML =
        renderHeader(editLabel) +
        `<main class="main">
            <section class="intro">
                <h2>О колоде</h2>
                <p>
                    <b>Void Protocol</b> — тактическая карточная игра о войне в открытом космосе.
                    Командуй флотом дронов, применяй протоколы взлома и расставляй ловушки,
                    чтобы уничтожить вражеский командный центр.
                </p>
                <p>В колоде ${cards.length} карт.</p>
            </section>
            ${editMode ? renderAddForm() : ''}
            ${sections}
        </main>
        <footer class="footer">
            <p>Void Protocol &mdash; карточная игра. Вариант 26.</p>
        </footer>`;

    attachListeners();
}

function renderHeader(editLabel) {
    return `<header class="header">
        <div class="header__inner">
            <div class="header__brand">
                <span class="header__logo">VOID</span>
                <span class="header__title">PROTOCOL</span>
            </div>
            <nav class="header__nav">
                <button class="btn btn--toggle" id="edit-toggle">${editLabel}</button>
            </nav>
        </div>
    </header>`;
}

function renderSections() {
    let types = [
        { key: 'unit',  label: 'Юниты' },
        { key: 'spell', label: 'Заклинания' },
        { key: 'trap',  label: 'Ловушки' }
    ];

    let html = '';

    for (let t of types) {
        let group = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].getType() === t.key) {
                group.push({ card: cards[i], index: i });
            }
        }

        if (group.length === 0) continue;

        let cardsHtml = group.map(function(item) {
            let cardHtml = item.card.toHTML();
            if (editMode) {
                return `<div class="card-wrap">
                    ${cardHtml}
                    <div class="card-controls">
                        <button class="btn btn--del" data-index="${item.index}">Удалить</button>
                    </div>
                </div>`;
            }
            return `<div class="card-wrap">${cardHtml}</div>`;
        }).join('');

        html += `<section class="section section--${t.key}">
            <h2 class="section__title">${t.label} <span class="section__count">${group.length}</span></h2>
            <div class="cards-grid">${cardsHtml}</div>
        </section>`;
    }

    return html;
}

function renderAddForm() {
    return `<section class="section section--add">
        <h2 class="section__title">Добавить карту</h2>
        <form class="add-form" id="add-form">
            <div class="add-form__row">
                <label class="add-form__label">
                    Тип
                    <select name="type" id="form-type">
                        <option value="unit">Юнит</option>
                        <option value="spell">Заклинание</option>
                        <option value="trap">Ловушка</option>
                    </select>
                </label>
                <label class="add-form__label">
                    Название
                    <input type="text" name="name" required maxlength="40">
                </label>
                <label class="add-form__label">
                    Стоимость
                    <input type="number" name="cost" min="0" max="10" value="2" required>
                </label>
                <label class="add-form__label">
                    Редкость
                    <select name="rarity">
                        <option value="common">Обычная</option>
                        <option value="rare">Редкая</option>
                        <option value="epic">Эпическая</option>
                        <option value="legendary">Легендарная</option>
                    </select>
                </label>
            </div>
            <label class="add-form__label add-form__label--wide">
                Описание
                <textarea name="description" rows="2" required maxlength="200"></textarea>
            </label>
            <div id="type-fields">
                ${getTypeFields('unit')}
            </div>
            <div class="add-form__actions">
                <button type="submit" class="btn btn--add">Добавить</button>
                <span class="add-form__msg" id="form-msg"></span>
            </div>
        </form>
    </section>`;
}

function getTypeFields(type) {
    if (type === 'unit') {
        return `<div class="add-form__row">
            <label class="add-form__label">
                Атака
                <input type="number" name="attack" min="0" max="20" value="2" required>
            </label>
            <label class="add-form__label">
                Защита
                <input type="number" name="defense" min="0" max="20" value="2" required>
            </label>
            <label class="add-form__label add-form__label--wide">
                Способность
                <input type="text" name="ability" maxlength="120" required>
            </label>
        </div>`;
    }
    if (type === 'spell') {
        return `<label class="add-form__label add-form__label--wide">
            Эффект
            <input type="text" name="effect" maxlength="150" required>
        </label>`;
    }
    if (type === 'trap') {
        return `<label class="add-form__label add-form__label--wide">
            Триггер
            <input type="text" name="trigger" maxlength="150" required>
        </label>`;
    }
    return '';
}

function attachListeners() {
    let toggleBtn = document.getElementById('edit-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleEditMode);

    if (!editMode) return;

    // Удаление карт
    document.querySelectorAll('.btn--del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            let idx = Number(this.dataset.index);
            deleteCard(idx);
        });
    });

    // Смена типа в форме добавления
    let typeSelect = document.getElementById('form-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            document.getElementById('type-fields').innerHTML = getTypeFields(this.value);
        });
    }

    // Отправка формы добавления
    let addForm = document.getElementById('add-form');
    if (addForm) addForm.addEventListener('submit', handleAddCard);
}

function toggleEditMode() {
    editMode = !editMode;
    buildSite();
}

function deleteCard(index) {
    cards.splice(index, 1);
    saveCards();
    buildSite();
}

function handleAddCard(event) {
    event.preventDefault();

    let form = event.target;
    let data = Object.fromEntries(new FormData(form).entries());

    let card;
    if (data.type === 'unit') {
        card = new UnitCard(
            data.name, data.cost, data.rarity, data.description,
            data.attack, data.defense, data.ability
        );
    } else if (data.type === 'spell') {
        card = new SpellCard(data.name, data.cost, data.rarity, data.description, data.effect);
    } else {
        card = new TrapCard(data.name, data.cost, data.rarity, data.description, data.trigger);
    }

    cards.push(card);
    saveCards();
    buildSite();

    // Показываем сообщение об успехе (buildSite уже перестроил DOM)
    let msg = document.getElementById('form-msg');
    if (msg) {
        msg.textContent = 'Карта добавлена!';
        setTimeout(function() { msg.textContent = ''; }, 2500);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadCards();
    buildSite();
});