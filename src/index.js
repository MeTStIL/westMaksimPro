import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import Player from "./Player.js";

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}



// // Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }

class Creature extends Card {

    getDescriptions () {
        return [getCreatureDescription(this), super.getDescriptions(this)]
    }

}


class Duck extends Creature {

    constructor() {
        super('Мирная Утка', 2);
    }
}


// Основа для собаки.
class Dog extends Creature {

    constructor() {
        super('Пес-бандит', 3);
    }
}

class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Трэщер томихелфигер';
        this.maxPower = 5;
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const modifiedValue = Math.max(value - 1, 0);

        this.view.signalAbility(() => {
            continuation(modifiedValue);
        });
    }
}

class Gatling extends Creature {
    constructor() {
        super();
        this.name = 'Гатлинг';
        this.maxPower = 6;
        this.currentPower = this.maxPower;
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const { oppositePlayer } = gameContext;

        for (let position = 0; position < oppositePlayer.table.length; position++) {
            const oppositeCard = oppositePlayer.table[position];

            taskQueue.push(onDone => {
                this.view.showAttack(() => {
                    if (oppositeCard) {
                        this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                    } else {
                        this.dealDamageToPlayer(1, gameContext, onDone);
                    }
                });
            });
        }

        taskQueue.continueWith(continuation);
    }
}

const sheriffStartDeck = [
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];


/*// Колода Шерифа, нижнего игрока.
const sheriffStartDeck = [
    new Card('Мирный житель', 2),
    new Card('Мирный житель', 2),
    new Card('Мирный житель', 2),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Card('Бандит', 3),
];*/


// Создание игры.
const game = new Game(sheriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
