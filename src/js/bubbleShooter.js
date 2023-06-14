import gsap from "../../node_modules/gsap/index.js";

const canvas = document.getElementById("canvasBox");
canvas.width = window.innerWidth;
canvas.height= window.innerHeight;

const c = canvas.getContext("2d");

const scoreBox = document.getElementById("score");
let score = 0;
const startButton = document.getElementById("startButton");
const startGameDiv = document.getElementById("startGameDiv");
const startGameScoreDiv = document.getElementById("startGameScoreDiv");


class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.update = () =>{
            this.draw();
        }
    
        this.draw = () =>{
            c.beginPath();
            c.save();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.shadowColor = "rgba(64, 67, 71, 0.1)";
            c.shadowBlur = 10;
            c.fillStyle = this.color;
            c.fill();
            c.restore();
            c.closePath();
        }
    }
}

class Projectiles{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;

        this.update = () =>{
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.draw();
        }
    
        this.draw = () =>{
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
        }
    }
}

class Enemies{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;

        this.update = () =>{
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.draw();
        }
    
        this.draw = () =>{
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
        }
    }
}

const friction = 0.99;
class Particles{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;

        this.update = () =>{
            this.velocity.x *= friction;
            this.velocity.y *= friction;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01

            this.draw();
        }
    
        this.draw = () =>{
            c.save();
            c.globalAlpha = this.alpha;
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
            c.restore();
        }
    }
}

// create a player
let player = new Player(canvas.width / 2, canvas.height / 2, 30, "white");

// create projectiles
let projectiles = [];
addEventListener("mousedown", (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event. clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectiles(canvas.width / 2, canvas.height / 2, 5, "white", velocity));
});

//create random enemies
let enemies = [];
let particles = [];
function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (40 - 10) + 10;
        let x;
        let y;
        if(Math.random() < 0.5 ){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.floor(Math.random() * 45)}, 70%, 50%)`;
        const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
        const velocity = {
            x: -Math.cos(angle) * 1.2,
            y: -Math.sin(angle) * 1.2
        }

        enemies.push(new Enemies(x, y, radius, color, velocity));
    }, 1000);
}

let animationId;
function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.3)"
    c.fillRect(0, 0, canvas.width, canvas.height);

    //explosions animation
    particles.forEach((particle, i) => {
        if (particle.alpha <= 0){
            setTimeout(()=>{
                particles.splice(i, 1);
            }, 0)
        }else{
            particle.update();
        }
    });

    player.update();    
    projectiles.forEach((projectile, i) =>{
        if (projectile.x > canvas.width || projectile.x < 0 || projectile.y > canvas.height || projectile.y < 0){
            projectiles.splice(i, 1);
        }else{
            projectile.update();
        }
    });
    enemies.forEach((enemy, i) =>{
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //player and enemy touched
        if (dist - enemy.radius - enemy.radius < 1){
            startButton.innerText = "Try Again";
            startGameScoreDiv.innerHTML = score;
            startGameDiv.style.display = "flex"
            cancelAnimationFrame(animationId);
        }

        projectiles.forEach((projectile, j) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            // particle and enemy touched
            if (dist - enemy.radius - projectile.radius < 0){
                score += 100;
                scoreBox.innerHTML = " " + score;
                //create explosions
                for (let i=0; i< enemy.radius / 2; i++){
                    const radius = Math.random() * (6-2) + 2;
                    const velocityMultiplier = Math.random() * (6 - 3) + 3;
                    particles.push(new Particles(projectile.x, projectile.y, radius, enemy.color, {x: (Math.random() - 0.5) * velocityMultiplier, y: (Math.random() - 0.5) * velocityMultiplier}))
                }
                if(enemy.radius - 10 > 5){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(j, 1);
                    }, 0) 
                }else{
                    setTimeout(() => {
                        enemies.splice(i, 1);
                        projectiles.splice(j, 1);
                    }, 0) 
                }  
            }
        });
    });
}


startButton.addEventListener("click", () => {
    startGameDiv.style.display = "none";
    enemies.splice(0, enemies.length);
    scoreBox.innerHTML = " 0";
    score = 0;
    spawnEnemies();
    animate();  
})

addEventListener("resize", () => {
    location.reload(true);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})



