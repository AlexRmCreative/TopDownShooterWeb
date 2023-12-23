class Player {
    constructor() {
        this.x = 200;
        this.y = 200;
        this.size = 20;
        this.speed = 2;
        this.health = 350;
        this.pistol = new Pistol(this);
        this.shootSpeed = 25;
        this.shootTime = this.shootSpeed;
        this.bulletDamage = 40;
    }

    draw() {
        // Dibuja al jugador
        ctx.fillStyle = "#6570FA";
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // Dibuja la barra de vida
        const healthBarWidth = 100;  // Ancho fijo de la barra de vida
        const healthBarHeight = 10;  // Altura fija de la barra de vida
        const healthBarX = 10;      // Posición X fija de la barra de vida
        const healthBarY = 10;      // Posición Y fija de la barra de vida

        // Calcula el ancho proporcional de la barra de vida en relación con la salud del jugador
        const currentHealthBarWidth = (this.health / 100) * healthBarWidth;

        // Dibuja la barra de vida
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(healthBarX, healthBarY, currentHealthBarWidth, healthBarHeight);

        // Dibuja el texto de las monedas
        ctx.fillStyle = "#f39c12";
        ctx.font = "16px Arial";

        // Dibuja la pistola
        this.pistol.draw();
    }

    update(deltaTime) {
        if (this.moveUp && this.y > 0) {
            this.y -= this.speed * deltaTime;
        }

        if (this.moveDown && this.y + this.size < canvas.height) {
            this.y += this.speed * deltaTime;
        }

        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed * deltaTime;
        }

        if (this.moveRight && this.x + this.size < canvas.width) {
            this.x += this.speed * deltaTime;
        }

        this.pistol.update();
        this.shootTime -= deltaTime;
        if (this.shootTime > 0)
            this.isShooting = false;
        else {
            this.isShooting = true;
            this.shootTime = this.shootSpeed;
        }
    }
}

class Pistol {
    constructor(player) {
        this.player = player;
    }

    draw() {
        // Dibujamos la pistola
        ctx.save();
        ctx.translate(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = "#8E96F9";
        ctx.fillRect(0, -5, 20, 10);
        ctx.restore();
    }

    update() {
        // Actualizamos el ángulo de dirección hacia el puntero
        this.angle = Math.atan2(mouseY - this.player.y - this.player.size / 2, mouseX - this.player.x - this.player.size / 2);

        // Lógica de disparo (a implementar)
        if (this.player.isShooting) {
            this.shoot();
        }
    }

    // Lógica de disparo en la clase Pistol
    shoot() {
        // Crea una nueva instancia de Bullet y añádela al juego con el daño del jugador
        const bullet = new Bullet(
            this.player.x + this.player.size / 2,
            this.player.y + this.player.size / 2,
            this.angle,
            this.player.bulletDamage // Supongamos que el daño está almacenado en bulletDamage del jugador
        );

        // Añade la nueva bala al array de balas en el juego (debes definir este array)
        bullets.push(bullet);
    }

}

class Bullet {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.angle = angle;
        this.size = 5;
        this.damage = damage; // Nuevo parámetro para el daño de la bala
    }

    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.y += Math.sin(this.angle) * this.speed * deltaTime;
    }

    draw() {
        // Dibuja la bala
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class Zombie {
    constructor(speed, health, pointsValue = 10) {
        this.size = 20;
        this.speed = speed;
        this.health = health;
        this.maxHealth = this.health;
        this.damage = 1;
        this.pointsValue = pointsValue;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() < 0.5 ? 0 : canvas.height;
    }

    draw() {
        let percentHealth = (this.health / this.maxHealth) * 100;
        ctx.fillStyle = `rgb(${255 - percentHealth * 255 / 100}, 0, 0)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }    

    update(deltaTime) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed * deltaTime;
        this.y += Math.sin(angle) * this.speed * deltaTime;

        if (
            this.x < player.x + player.size &&
            this.x + this.size > player.x &&
            this.y < player.y + player.size &&
            this.y + this.size > player.y
        ) {
            player.health -= this.damage;
        }
    }

    die() {
        updateScore(this.pointsValue);
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const restartBtn = document.getElementById("restartButton");
const gameBtns = document.getElementById("gameButtons");
const costText = document.getElementById("costText");
const coinsText = document.getElementById("coins");

let gameSpeed = 70;
let lastTime = 0;
let mouseX = 0;
let mouseY = 0;

let contador;
let coins;
let cost;

let player = new Player();

let zombieSpeed;
let zombiesHealth;
let zombiesValue;
let zombiesGenIntervalMax;
let zombiesGenIntervalMin;
let zombiesUpgInterval;

let zombies = [];
let bullets = [];

function updateCounter() {
    function pad(number) {
        return number < 10 ? "0" + number : number;
    }
    contador++;
    const hours = Math.floor(contador / 3600);
    const minutes = Math.floor((contador % 3600) / 60);
    const seconds = contador % 60;

    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    document.getElementById("contador").innerText = formattedTime;
    if(player.health > 0)
    {
        requestAnimationFrame(updateCounter);
    }
}

function updateScore(points) {
    coins += points;
}

//Upgrades
function upgradeRateOfFire(){
    if(coins >= cost && player.shootSpeed > 0.1)
    {
        player.shootSpeed -= 1.5;
        if(player.shootSpeed < 0.1)
            player.shootSpeed = 0.1;
        coins -= cost;
        cost += 85;
    }
}

function upgradeDamage(){
    if(coins >= cost)
    {
        player.bulletDamage += 15;
        coins -= cost;
        cost += 135;
    }
}

function upgradeMoveSpeed(){
    if(coins >= cost)
    {
        player.speed += 0.35;
        coins -= cost;
        cost += 75;
    }
}

function healPlayer(){
    if(coins >= cost / 5 && player.health + 30 <= 350)
    {
        player.health += 30;
        coins -= cost / 5;
        cost += 10;
    }
}
//

function drawCharacter(character, deltaTime) {
    character.update(deltaTime);
    character.draw();
}

function upgradeZombies() {
    zombieSpeed += 0.075;
    zombiesHealth += 5;
    zombiesValue += 5;
    if(zombiesGenIntervalMax > 250 && (zombiesGenIntervalMax - 50) > zombiesGenIntervalMin)
        zombiesGenIntervalMax -= 50;
    if(zombiesGenIntervalMin > 100)
        zombiesGenIntervalMin -= 10;
    setTimeout(() => { requestAnimationFrame(upgradeZombies); }, zombiesUpgInterval);
}

function generateZombies() {
    if(player.health > 0)
    {
        zombies.push(new Zombie(zombieSpeed, zombiesHealth, zombiesValue))
    }
    setTimeout(() => { requestAnimationFrame(generateZombies); }, Math.floor(Math.random() * (zombiesGenIntervalMax - zombiesGenIntervalMin + 1) + zombiesGenIntervalMin));
}

function updateBullets(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update(deltaTime);

        if (bulletOutOfBounds(bullets[i])) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = zombies.length - 1; j >= 0; j--) {
            if (bulletHitsZombie(bullets[i], zombies[j])) {
                zombies[j].health -= bullets[i].damage;
                bullets.splice(i, 1);

                if (zombies[j].health <= 0) {
                    zombies[j].die();
                    zombies.splice(j, 1);
                }

                break;
            }
        }
    }
}

function drawBullets() {
    bullets.forEach(bullet => {
        bullet.draw();
    });
}

function bulletHitsZombie(bullet, zombie) {
    // Verifica si la posición de la bala colisiona con el zombie
    return (
        bullet.x < zombie.x + zombie.size &&
        bullet.x + bullet.size > zombie.x &&
        bullet.y < zombie.y + zombie.size &&
        bullet.y + bullet.size > zombie.y
    );
}

function bulletOutOfBounds(bullet) {
    // Implementa la lógica para determinar si la bala está fuera del canvas
    // Puedes comparar la posición de la bala con las dimensiones del canvas
    return (
        bullet.x < 0 ||
        bullet.y < 0 ||
        bullet.x > canvas.width ||
        bullet.y > canvas.height
    );
}

function gameLoop(timestamp) {
    // Calcula deltaTime basándote en el tiempo real
    const deltaTime = (timestamp - lastTime) / 1000 * gameSpeed;  // Dividido por 1000 para convertir milisegundos a segundos
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    coinsText.innerText = coins;
    costText.innerText = "Cost: " + cost;

    if (player.health > 0) {
        drawCharacter(player, deltaTime);
        zombies.forEach((zombie) => {
            drawCharacter(zombie, deltaTime);
        });
        drawBullets();
        updateBullets(deltaTime);
        requestAnimationFrame(gameLoop);
    } else {
        restartBtn.style.display = "block";
        canvas.style.display = "none";
        costText.style.display = "none";
        gameBtns.style.display = "none";
    }
}


// Función para manejar las acciones del jugador
function handleKeyPress(e) {
    if(player.health > 0)
    {
        if (e.key === "w" || e.key === "ArrowUp") {
            player.moveUp = true;
        }
    
        if (e.key === "s" || e.key === "ArrowDown") {
            player.moveDown = true;
        }
    
        if (e.key === "a" || e.key === "ArrowLeft") {
            player.moveLeft = true;
        }
    
        if (e.key === "d" || e.key === "ArrowRight") {
            player.moveRight = true;
        }
    
        if(e.key === " " || e.key === "1") {
            healPlayer();
        }
        if(e.key === "q" || e.key === "2") {
            upgradeDamage();
        }
        if(e.key === "e" || e.key === "3") {
            upgradeMoveSpeed();
        }
        if(e.key === "r" || e.key === "4") {
            upgradeRateOfFire();
        }
    }
}

function handleKeyRelease(e) {
    // W o Arriba
    if (e.key === "w" || e.key === "ArrowUp") {
        player.moveUp = false;
    }

    // S o Abajo
    if (e.key === "s" || e.key === "ArrowDown") {
        player.moveDown = false;
    }

    // A o Izquierda
    if (e.key === "a" || e.key === "ArrowLeft") {
        player.moveLeft = false;
    }

    // D o Derecha
    if (e.key === "d" || e.key === "ArrowRight") {
        player.moveRight = false;
    }
}

function handleMouseMove(event) {
    mouseX = event.clientX - canvas.getBoundingClientRect().left;
    mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Verifica si el juego está en el estado de "Game Over" y el mouse está sobre el botón "Restart"
    if (
        player.health <= 0 &&
        mouseX >= (canvas.width - 100) / 2 &&
        mouseX <= (canvas.width - 100) / 2 + 100 &&
        mouseY >= (canvas.height - 50) / 2 &&
        mouseY <= (canvas.height - 50) / 2 + 50
    ) {
        canvas.style.cursor = "pointer"; // Cambia el cursor al estilo de puntero
    } else {
        canvas.style.cursor = "default"; // Cambia el cursor al estilo predeterminado
    }
}

// Manejamos las teclas presionadas
window.addEventListener("keydown", handleKeyPress);
// Manejamos la liberación de teclas
window.addEventListener("keyup", handleKeyRelease);
// Manejamos eventos del ratón
canvas.addEventListener("mousemove", handleMouseMove);

function startGame()
{
    restartBtn.style.display = "none";
    canvas.style.display = "block";
    gameBtns.style.display = "block";
    costText.style.display = "block";
    player = new Player();
    contador = 0;
    coins = 0;
    lastTime = 0;
    cost = 50;
    zombieSpeed = 0.6;
    zombiesHealth = 100;
    zombiesValue = 5;
    zombiesGenIntervalMax = 2000;
    zombiesGenIntervalMin = 250;
    zombiesUpgInterval = 10000;
    
    if(player.health > 0)
    {
        zombies = [];
        bullets = [];
        updateCounter();
        upgradeZombies();
        generateZombies();
        gameLoop();
    }
}

startGame();