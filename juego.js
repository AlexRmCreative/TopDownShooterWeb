var mouseX = 0;
var mouseY = 0;
const buttonWidth = 150;
const buttonHeight = 50;

class Player {
    constructor() {
        this.x = 50;
        this.y = 50;
        this.size = 20;
        this.speed = 2.15;
        this.health = 200;
        this.coins = 0;
        this.pistol = new Pistol(this);
        this.shootSpeed = 8;
        this.shootTime = this.shootSpeed;
        this.bulletDamage = 30;
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
        ctx.fillText(`Monedas: ${this.coins}`, canvas.width - 100, 20);

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
        // Actualiza la posición de la bala en función de su velocidad y dirección
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
    constructor() {
        this.size = 20;
        this.speed = 1.4;
        this.health = Math.floor(Math.random() * (225 - 30) + 30)
        this.damage = 1;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() < 0.5 ? 0 : canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgb(${255 - this.health}, 0, 0)`;
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
        player.coins += 10;
    }
}

function drawCharacter(character) {
    character.update();
    character.draw();
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = new Player();

let nextSpawnTime = 100;

const zombies = [];
const bullets = [];

function generateZombies() {
    zombies.push(new Zombie());
}

function updateBullets(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update(deltaTime);

        // Elimina la bala si sale del canvas
        if (bulletOutOfBounds(bullets[i])) {
            bullets.splice(i, 1);
            continue;
        }

        // Verifica la colisión con zombies
        for (let j = zombies.length - 1; j >= 0; j--) {
            if (bulletHitsZombie(bullets[i], zombies[j])) {
                zombies[j].health -= bullets[i].damage;

                // Elimina la bala
                bullets.splice(i, 1);

                // Elimina el zombie si su salud es igual o menor a 0
                if (zombies[j].health <= 0) {
                    zombies[j].die(); // Llama al método die() del zombie
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

function restartGame() {
    // Restablece la posición del jugador
    player.x = 50;
    player.y = 50;

    // Restablece la salud y las monedas del jugador
    player.health = 200;
    player.coins = 0;

    // Elimina todos los zombies
    zombies.length = 0;

    // Elimina todas las balas
    bullets.length = 0;

    document.getElementById("gameCanvas").style.display = "block";
}

let zombieGenTimer = 0;
const minZombieTimer = 20;
const maxZombieTimer = 80;

const gameCanvas = document.getElementById("gameCanvas");
const restartBtn = document.getElementById("restartButton");

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 15; // Convierte a segundos
    lastTime = timestamp;


    zombieGenTimer -= deltaTime;
    if(zombieGenTimer < 0)
    {
        generateZombies();
        zombieGenTimer = Math.random() * (maxZombieTimer - minZombieTimer) + minZombieTimer;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si la vida del jugador llega a 0, muestra el botón "Restart"
    if (player.health <= 0) {
        restartBtn.style.display = "block";
        gameCanvas.style.display = "none";
    }
    else {
        restartBtn.style.display = "none";

        // Actualizamos y dibujamos a los zombies existentes
        zombies.forEach((zombie) => {
            zombie.update(deltaTime);
            zombie.draw();
        });

        player.update(deltaTime);
        player.draw();
        updateBullets(deltaTime);
        drawBullets();
    }

    requestAnimationFrame(gameLoop);
}

// Función para manejar las teclas presionadas
function handleKeyPress(e) {
    // W o Arriba
    if (e.key === "w" || e.key === "ArrowUp") {
        player.moveUp = true;
    }

    // S o Abajo
    if (e.key === "s" || e.key === "ArrowDown") {
        player.moveDown = true;
    }

    // A o Izquierda
    if (e.key === "a" || e.key === "ArrowLeft") {
        player.moveLeft = true;
    }

    // D o Derecha
    if (e.key === "d" || e.key === "ArrowRight") {
        player.moveRight = true;
    }
}

// Función para manejar las teclas liberadas
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

// Manejamos las teclas presionadas
window.addEventListener("keydown", handleKeyPress);

// Manejamos la liberación de teclas
window.addEventListener("keyup", handleKeyRelease);

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

// Manejamos eventos del ratón
canvas.addEventListener("mousemove", handleMouseMove);
// Iniciamos el bucle del juego
requestAnimationFrame(gameLoop);
