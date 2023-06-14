const attackButton = document.getElementById("attack_button");
const skillButton = document.getElementById("skill_button");
const guardButton = document.getElementById("guard_button");
const itemButton = document.getElementById("item_button");

const battleList = document.getElementById("battle_list");

let item = true;


class Move {

    constructor(name, power, cost, accuracy, type = "damage"){
        this.name = name;
        this.power = power;
        this.cost = cost;
        this.accuracy = accuracy;
        this.type = type;

    }
}

physicalAttack = new Move("a physical attack", 5, 0, 100);
specialAttack = new Move("charge", 1.5, 20, 75, "multiplier");
guardMove = new Move("guard", 1, 0, 75, "guard");
itemMove = new Move("item", 20, 0, 100, "item");

queue = [];

class Battler {
    constructor(name, hp_bar, mp_bar, hp = 100, mp = 100, moveset = [physicalAttack, specialAttack], attackMultiplier = 1){
        this.name = name;
        this.hp_bar = hp_bar;
        this.mp_bar = mp_bar;
        this.hp = hp;
        this.mp = mp;
        this.moveset = moveset;
        this.attackMultiplier = attackMultiplier;

    }

        addToQueue(move){

            let target;

            if(move.cost > this.mp){
                addToList("Not enough mp", "alert_message");
                return;

            }

            if(move.type == "item" && item == false){
                addToList("No items available", "alert_message");
                return;

            }

            if(move.type == "item" && item == true){
                addToList(this.name + " used an item and restored 20 points of hp!");
                queue.push(new Turn(move, this, target));
                item = false;

            }

            if(this == player){
                target = monster;
            } else {
                target = player;
            }


            if(move.type == "damage"){
                queue.push(new Turn(move, this, target));
            } else {
                queue.unshift(new Turn(move, this, target));
            }

            if(queue.length >= 2){
                executeQueue();
            }
        
        }

        attack(target, move){

            if(this.mp >= move.cost){
        
                this.mp = Math.max(0, this.mp - move.cost);
        
                switch(move.type){
        
                    case "damage":
                        let damage = move.power * this.attackMultiplier;
                        target.hp = Math.max(0, target.hp - damage);
        
                        addToList(this.name + " used " + move.name + " and did " + Math.round(damage * 10)/10 + " points of damage!", "normal_message");
                        
                        this.attackMultiplier = 1;
                        break;
                        
        
                    case "multiplier":
                        this.attackMultiplier = Math.min(this.attackMultiplier + move.power, 4);
        
                        addToList(this.name + " used " + move.name + "! The next attack will be " + Math.round((this.attackMultiplier) * 10)/10 + " times as powerful!", "normal_message");
                        
                        break;
        
                }
        
                update();
        
            }
        
        
        }

        guard(notUser){
            notUser.attackMultiplier *= 0.5;
            addToList(this.name + " guarded!");
        }

        useItem(){
            this.hp = Math.min(this.hp, 100);
        }
        
}

class Turn {
    constructor(move, user, target){
        this.move = move;
        this.user = user;
        this.target = target;
    }
}

let monster = new Battler("Green Slime", document.getElementById("monster_current_health"), document.getElementById("monster_current_mana"));
document.getElementById("enemy_name").textContent = monster.name;
let player = new Battler("You", document.getElementById("current_health"), document.getElementById("current_mana"));


function updateBar(bar, value){
    bar.textContent = "" + Math.round(value*10) / 10 + "/100";
    bar.style.width = "" + (170 * 0.01 * value) + "px";
}


function update(){

    updateBar(monster.hp_bar, monster.hp);
    updateBar(monster.mp_bar, monster.mp);
    updateBar(player.hp_bar, player.hp);
    updateBar(player.mp_bar, player.mp);


    if(monster.hp <= 0 || player.hp <= 0){
        end();
    }

    
}

function addToList(text, type){

        let log = document.createElement("li");
        battleList.appendChild(log);
        log.className = type;
        //log.textContent = text;

        let count = 0;
        

        let i = setInterval(
                function(){
                    log.textContent = text.substring(0, count);
                    count++;
                    }, 25
            );



}


function end(){

    if(monster.hp <= 0){
        addToList("You win!", "win_message");

    } else {
        addToList("You lose!", "alert_message");
        
    }

    addToList("----------------------------------", "normal_message");
    monster.hp = 100;
    monster.mp = 100;
    player.hp = 100;
    player.mp = 100;
    item = true;
    player.attackMultiplier = 1;
    monster.attackMultiplier = 1;
    update();


}

function monsterTurn(){
    
    let monsterChoice = 0;

    if(monster.mp >= specialAttack.cost){
        monsterChoice = Math.floor(Math.random() * 4);
    } else {
        monsterChoice = Math.floor(Math.random() * 3);
    }


    switch(monsterChoice){

        case 0:
            monster.addToQueue(physicalAttack);
            break;

        case 1:
            monster.addToQueue(physicalAttack);
            break;
        

        case 2:
            monster.addToQueue(guardMove);
            break;

        case 3:
            monster.addToQueue(specialAttack);
            break;


    }



}

function executeQueue(){
    for(i = 0; i < queue.length; i++){
        if(queue[i].move.type == "damage" || queue[i].move.type == "multiplier"){
            console.log(queue[i]);

            queue[i].user.attack(queue[i].target, queue[i].move);
        } 

        else if(queue[i].move.type == "item"){
            queue[i].user.useItem();
        } 
        
        else{
            let x;

            if(queue[i].user == monster){
                x = player;
            } else {
                x = monster;
            }
            
            queue[i].user.guard(x);
        }

    }

    addToList("----")

    queue = [];
    monsterTurn();
    
}


attackButton.addEventListener("click", function(){player.addToQueue(physicalAttack, monster)});
skillButton.addEventListener("click", function(){player.addToQueue(specialAttack, monster)});
guardButton.addEventListener("click", function(){player.addToQueue(guardMove, monster)});
itemButton.addEventListener("click", function(){player.addToQueue(itemMove, monster)});

monsterTurn();
  
    






