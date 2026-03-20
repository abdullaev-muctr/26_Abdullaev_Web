// Три кита ООП:
// Инкапсуляция
// Наследование
// Полиморфизм

class Card {
    #name;
    #cost;
    #rarity;
    #description;

    constructor(name, cost, rarity, description) {
        this.#name        = name;
        this.#cost        = Number(cost);
        this.#rarity      = rarity;
        this.#description = description;
    }

    get name()        { return this.#name; }
    get cost()        { return this.#cost; }
    get rarity()      { return this.#rarity; }
    get description() { return this.#description; }

    set name(v)        { this.#name = String(v); }
    set description(v) { this.#description = String(v); }

    // Полиморфизм: переопределяется в подклассах
    getType()      { return 'card'; }
    getTypeLabel() { return 'Карта'; }

    getRarityLabel() {
        let map = { common: 'Обычная', rare: 'Редкая', epic: 'Эпическая', legendary: 'Легендарная' };
        return map[this.#rarity] || this.#rarity;
    }

    // Полиморфизм: каждый класс возвращает своё HTML-представление карты
    toHTML() {
        return `<article class="card card--${this.#rarity} card--${this.getType()}">
            <div class="card__top">
                <span class="card__name">${this.#name}</span>
                <span class="card__cost">${this.#cost}</span>
            </div>
            <div class="card__art"></div>
            <div class="card__type-line">
                <span>${this.getTypeLabel()}</span>
                <span>${this.getRarityLabel()}</span>
            </div>
            <div class="card__text">
                <p>${this.#description}</p>
            </div>
        </article>`;
    }

    // Сериализация для localStorage
    toJSON() {
        return {
            type:        this.getType(),
            name:        this.#name,
            cost:        this.#cost,
            rarity:      this.#rarity,
            description: this.#description
        };
    }
}

// Наследование: боевая единица
class UnitCard extends Card {
    #attack;
    #defense;
    #ability;

    constructor(name, cost, rarity, description, attack, defense, ability) {
        super(name, cost, rarity, description);
        this.#attack  = Number(attack);
        this.#defense = Number(defense);
        this.#ability = ability;
    }

    get attack()  { return this.#attack; }
    get defense() { return this.#defense; }
    get ability() { return this.#ability; }

    set attack(v)  { this.#attack = Number(v); }
    set defense(v) { this.#defense = Number(v); }
    set ability(v) { this.#ability = String(v); }

    getType()      { return 'unit'; }
    getTypeLabel() { return 'Юнит'; }

    toHTML() {
        return `<article class="card card--${this.rarity} card--unit">
            <div class="card__top">
                <span class="card__name">${this.name}</span>
                <span class="card__cost">${this.cost}</span>
            </div>
            <div class="card__art card__art--unit">&#9876;</div>
            <div class="card__type-line">
                <span>${this.getTypeLabel()}</span>
                <span>${this.getRarityLabel()}</span>
            </div>
            <div class="card__text">
                <p>${this.description}</p>
                <p class="card__ability">${this.#ability}</p>
            </div>
            <div class="card__stats">
                <span class="card__stat card__stat--atk" title="Атака">&#9876; ${this.#attack}</span>
                <span class="card__stat card__stat--def" title="Защита">&#9670; ${this.#defense}</span>
            </div>
        </article>`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            attack:  this.#attack,
            defense: this.#defense,
            ability: this.#ability
        };
    }
}

// Наследование: одноразовое заклинание
class SpellCard extends Card {
    #effect;

    constructor(name, cost, rarity, description, effect) {
        super(name, cost, rarity, description);
        this.#effect = effect;
    }

    get effect() { return this.#effect; }
    set effect(v) { this.#effect = String(v); }

    getType()      { return 'spell'; }
    getTypeLabel() { return 'Заклинание'; }

    toHTML() {
        return `<article class="card card--${this.rarity} card--spell">
            <div class="card__top">
                <span class="card__name">${this.name}</span>
                <span class="card__cost">${this.cost}</span>
            </div>
            <div class="card__art card__art--spell">&#10022;</div>
            <div class="card__type-line">
                <span>${this.getTypeLabel()}</span>
                <span>${this.getRarityLabel()}</span>
            </div>
            <div class="card__text">
                <p>${this.description}</p>
                <p class="card__effect"><b>Эффект:</b> ${this.#effect}</p>
            </div>
        </article>`;
    }

    toJSON() {
        return { ...super.toJSON(), effect: this.#effect };
    }
}

// Наследование: скрытая ловушка
class TrapCard extends Card {
    #trigger;

    constructor(name, cost, rarity, description, trigger) {
        super(name, cost, rarity, description);
        this.#trigger = trigger;
    }

    get trigger() { return this.#trigger; }
    set trigger(v) { this.#trigger = String(v); }

    getType()      { return 'trap'; }
    getTypeLabel() { return 'Ловушка'; }

    toHTML() {
        return `<article class="card card--${this.rarity} card--trap">
            <div class="card__top">
                <span class="card__name">${this.name}</span>
                <span class="card__cost">${this.cost}</span>
            </div>
            <div class="card__art card__art--trap">&#9888;</div>
            <div class="card__type-line">
                <span>${this.getTypeLabel()}</span>
                <span>${this.getRarityLabel()}</span>
            </div>
            <div class="card__text">
                <p>${this.description}</p>
                <p class="card__trigger"><b>Триггер:</b> ${this.#trigger}</p>
            </div>
        </article>`;
    }

    toJSON() {
        return { ...super.toJSON(), trigger: this.#trigger };
    }
}

// Фабрика для восстановления карт из localStorage
function cardFromJSON(data) {
    switch (data.type) {
        case 'unit':
            return new UnitCard(
                data.name, data.cost, data.rarity, data.description,
                data.attack, data.defense, data.ability
            );
        case 'spell':
            return new SpellCard(data.name, data.cost, data.rarity, data.description, data.effect);
        case 'trap':
            return new TrapCard(data.name, data.cost, data.rarity, data.description, data.trigger);
        default:
            return new Card(data.name, data.cost, data.rarity, data.description);
    }
}