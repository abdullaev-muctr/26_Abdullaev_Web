function startGame() {
    let hp = 100;
    let coffee = 0;
    let karma = 0;
    let name = "";

    // функция безопасного ввода
    function safePrompt(message, validator, errorMsg) {
        while (true) {
            let input = prompt(message);

            if (input === null) {
                let quit = confirm("Ты точно хочешь сдаться и выйти из игры?");
                if (quit) {
                    alert("Ты сбежал. Ковбои Marlboro разочарованы.");
                    return null;
                }
                continue;
            }

            input = input.trim();

            if (input === "") {
                alert("Ты ничего не ввёл. Попробуй ещё раз.");
                continue;
            }

            if (validator && !validator(input)) {
                alert(errorMsg || "Некорректный ввод. Попробуй снова.");
                continue;
            }

            return input;
        }
    }

    // выбор из вариантов
    function choicePrompt(message, options) {
        let text = message + "\n\n";

        for (let i = 0; i < options.length; i++) {
            text += (i + 1) + ". " + options[i] + "\n";
        }

        text += "\nВведи номер (1–" + options.length + "):";

        let result = safePrompt(
            text,
            function (val) {
                let num = Number(val);
                return Number.isInteger(num) && num >= 1 && num <= options.length;
            },
            "Введи число от 1 до " + options.length + "."
        );

        if (result === null) return null;
        return Number(result);
    }

    function showStats() {
        return "\n\n[HP: " + hp + " | Кофе: " + coffee + " | Карма: " + karma + "]";
    }

    alert(
        "=== ВЫЖИВАНИЕ ПРОГРАММИСТА ===\n\n" +
        "Текстовая мини-RPG.\n" +
        "Тебе предстоит пережить один рабочий день.\n" +
        "Удачи. Она тебе понадобится."
    );

    name = safePrompt(
        "Как тебя зовут, герой?",
        function (val) {
            return val.length >= 2 && val.length <= 30;
        },
        "Имя должно быть от 2 до 30 символов."
    );

    if (name === null) return;

    alert(
        "Добро пожаловать, " + name + "!\n\n" +
        "Ты — junior-разработчик. Сегодня понедельник.\n" +
        "Впереди — дедлайн, баги и совещания.\n" +
        "Выживи до 18:00." + showStats()
    );

    alert("Будильник орёт. На часах 7:30. Ты лежишь в кровати.");

    let ch1 = choicePrompt(
        "Что делаешь?",
        [
            "Встаёшь сразу",
            "Ещё 5 минут",
            "Выключаешь будильник и спишь дальше"
        ]
    );

    if (ch1 === null) return;

    if (ch1 === 1) {
        karma += 10;
        alert("Ты встал вовремя. +10 кармы." + showStats());
    } else if (ch1 === 2) {
        hp -= 10;
        alert("Ты проспал. -10 HP." + showStats());
    } else {
        hp -= 30;
        alert("Ты проспал два часа. -30 HP." + showStats());
    }

    let wantCoffee = confirm("По пути на работу ты проходишь мимо кофейни.\n\nЗайти за кофе?");

    if (wantCoffee) {
        let coffeeChoice = choicePrompt(
            "Что берёшь?",
            [
                "Эспрессо",
                "Капучино",
                "Тройной раф"
            ]
        );

        if (coffeeChoice === null) return;

        if (coffeeChoice === 1) {
            coffee += 1;
            alert("+1 кофе." + showStats());
        } else if (coffeeChoice === 2) {
            coffee += 1;
            karma -= 5;
            alert("+1 кофе, -5 кармы." + showStats());
        } else {
            coffee += 3;
            hp -= 5;
            alert("+3 кофе, -5 HP." + showStats());
        }
    }

    alert("Ты приходишь на работу. В Slack куча сообщений.");

    let ch2 = choicePrompt(
        "С чего начнёшь?",
        [
            "Прочитать Slack",
            "Сразу кодить",
            "Открыть YouTube"
        ]
    );

    if (ch2 === null) return;

    if (ch2 === 1) {
        karma += 10;
        hp -= 10;
        alert("+10 кармы, -10 HP." + showStats());
    } else if (ch2 === 2) {
        karma += 5;
        alert("+5 кармы." + showStats());
    } else {
        hp -= 15;
        karma -= 10;
        alert("-15 HP, -10 кармы." + showStats());
    }

    alert("Тимлид: \"" + name + "! В проде баг!\"");

    let bugGuess = safePrompt(
        "Сколько часов нужно на фикс? (1–24)",
        function (val) {
            let num = Number(val);
            return !isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 24;
        },
        "Введи число от 1 до 24."
    );

    if (bugGuess === null) return;

    bugGuess = Number(bugGuess);

    if (bugGuess <= 2) {
        karma += 15;
        alert("+15 кармы." + showStats());
    } else if (bugGuess <= 8) {
        karma += 5;
        alert("+5 кармы." + showStats());
    } else {
        hp -= 10;
        alert("-10 HP." + showStats());
    }

    let ch3 = choicePrompt(
        "Обед. Что будешь есть?",
        [
            "Столовая",
            "Доширак",
            "Пропустить обед"
        ]
    );

    if (ch3 === null) return;

    if (ch3 === 1) {
        hp += 20;
        karma += 5;
        alert("+20 HP, +5 кармы." + showStats());
    } else if (ch3 === 2) {
        hp += 5;
        karma -= 5;
        alert("+5 HP, -5 кармы." + showStats());
    } else {
        hp -= 20;
        karma += 5;
        alert("-20 HP, +5 кармы." + showStats());
    }

    let moreCoffee = confirm("После обеда хочется кофе.");

    if (moreCoffee) {
        coffee += 2;

        if (coffee >= 5) {
            hp -= 15;
            alert("Слишком много кофе. -15 HP." + showStats());
        } else {
            hp += 5;
            alert("+5 HP." + showStats());
        }
    }

    let ch4 = choicePrompt(
        "Созвон в 15:00. Что делаешь?",
        [
            "Слушаешь",
            "Смотришь мемы",
            "Уходишь спать"
        ]
    );

    if (ch4 === null) return;

    if (ch4 === 1) {
        karma += 15;
        hp -= 15;
        alert("+15 кармы, -15 HP." + showStats());
    } else if (ch4 === 2) {
        karma += 5;
        alert("+5 кармы." + showStats());
    } else {
        karma -= 15;
        alert("-15 кармы." + showStats());
    }

    let score = hp + karma * 2 + coffee;

    let title = "";
    let ending = "";

    if (hp <= 0) {
        title = "GAME OVER";
        ending = "Ты не дожил до конца дня.";
    } else if (score >= 120) {
        title = "ЛЕГЕНДА ОФИСА";
        ending = "Идеальный день.";
    } else if (score >= 80) {
        title = "КРЕПКИЙ МИДЛ";
        ending = "Нормальный рабочий день.";
    } else if (score >= 40) {
        title = "ВЫЖИВШИЙ";
        ending = "День был тяжёлым.";
    } else {
        title = "ЖЕРТВА ДЕДЛАЙНА";
        ending = "Ты еле пережил этот день.";
    }

    alert(
        title + "\n\n" +
        ending + "\n\n" +
        "Имя: " + name + "\n" +
        "HP: " + hp + "\n" +
        "Кофе: " + coffee + "\n" +
        "Карма: " + karma + "\n" +
        "Счёт: " + score
    );

    let again = confirm("Хочешь сыграть ещё раз?");

    if (again) {
        startGame();
    } else {
        alert("Спасибо за игру, " + name + "!");
    }
}