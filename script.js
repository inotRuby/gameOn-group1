const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const objectList = []
const backgroundtheme = new Audio('edited ancient soundtrack.mp3')
const basejump = new Audio('Jump.mp3')
const baseland = new Audio('Land.mp3')
const playerdeath = new Audio('highdeath sfx.mp3')
const basesword = new Audio('swordswing.mp3')
let canland = false
let candie = true
let timeplayed = 0
let playerWin = false
backgroundtheme.loop = true
let attackAllowed = false

function jumpoverlap(){
    const jump = basejump.cloneNode()
    jump.play()
}
function landoverlap(){
    const land = baseland.cloneNode()
    land.play()
}
function swordoverlap(){
    const swing = basesword.cloneNode()
    swing.play()
}
/*
document.addEventListener('keydown', (e) => {
    if(e.code){
        backgroundtheme.play();
    }
})
*/

// The gravity value
let gravconst = 0.4



class GameObjects {

    constructor(x, y, width, height, imageSrc, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.image = new Image();
        if (imageSrc) {
            this.image.src = imageSrc
        }
        this.color = color
        this.active = true
    }

    collision(obj, otherObj) {
        // Checks collidion between two objects returns true if there is a collision
        if (otherObj !== obj){
            if (obj.x + obj.width + obj.speedX >= otherObj.x &&
                obj.x + obj.speedX <= otherObj.x + otherObj.width &&
                Math.round(obj.y) + obj.height + obj.deltaY >= otherObj.y &&
                Math.round(obj.y) + obj.deltaY <= otherObj.y + otherObj.height){
                    return true                    
            }
        }
        return false
    }

    update() {
        //extra functions for extending classes
    }

    drawBox(ctx) {
        // Draws all the objects
        if (!this.active) return;
        if (this.image.complete && this.image.src) {
            ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        else {
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    withinCanvas() {
        // Checks if we are within the canvas edges
        if (this.x + this.width + this.speedX < canvas.width &&
            this.x + this.speedX > 0 &&
            this.y + this.height + this.deltaY < canvas.height &&
            this.y + this.deltaY > 0){

                return true
        }
        else {
            return false
        }
    }

}

class MoveableObjects extends GameObjects {

    constructor(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight, activeimage = 0, direction = "right",canland= false) {
        super(x, y, width, height, imageSrc, color)
        this.speedX = speedX
        this.deltaY = deltaY
        this.jumpHeight = jumpHeight
        this.activeimage = activeimage
        this.direction = direction
        this.canland = canland
    }

    movement(objList){
        // Allows the player to move unless they are going to move into an object
        
    }
    changeimage(){
        
        if (this.activeimage<25){
            this.image.src = "player3.png"
        }
        if (this.activeimage<50 && this.activeimage > 25){
            this.image.src = "player1.png"
        }
        if (this.activeimage<75 && this.activeimage > 50){
            this.image.src = "player2.png"
        }
        if (this.activeimage<100 && this.activeimage > 75){
            this.image.src = "player4.png"
        }
        if(this.activeimage>= 100){
            this.activeimage = 0
        }
    }

    update() {
        //extra logic for any moving objects
        super.update()
    }
    
    gravity(objList) {
        // Checks if we are in the air and if we are make the player accelerate down
        this.deltaY += gravconst

        this.y += this.deltaY
        for (let otherObj of objList) {
            
        if ((otherObj !== this) && !(otherObj instanceof Door)) {
            if (this.deltaY > 0.4){ 
                        this.canland = true
                    }
            if ((this.collision(this, otherObj))) {
                    if (this.deltaY < 0 && canland) {
                        this.deltaY = 0
                        landoverlap()
                        timeplayed += 1
                    }
                    if (this.deltaY > 0 && 
                        (this.x > otherObj.x && this.x < otherObj.x + otherObj.width) ||
                        (this.x + this.width > otherObj.x && this.x + this.width < otherObj.x + otherObj.width &&
                        this.deltaY > 0)
                        ) {
                            this.y = otherObj.y - this.height
                            this.deltaY = 0
                        }
                    
                    if((this.canland && (this instanceof Player)) || ((this instanceof Enemy) && this.canland)){
                        this.canland = false
                        landoverlap()
                        timeplayed += 1
                    }
                }
            }
        }
 
    }

    jump(objList, obj) {
        // Checks if we are on the ground and if we are make us jump up
        for (let otherObj of objList) {
                if (obj !== otherObj) {
                if (this.collision(obj, otherObj)){
                    if (this.x + this.width + this.speedX > otherObj.x &&
                        this.x + this.speedX < otherObj.x + otherObj.width &&
                        this.y + this.height <= otherObj.y) {
                            this.deltaY = this.jumpHeight * -1
                            canland = true
                            jumpoverlap()
                            break
                        }
                }
            }
        }
    }
    
}

class StaticObjects extends GameObjects {

    constructor(x, y, width, height, imageSrc, color) {
        super(x, y, width, height, imageSrc, color)
    }

    update() {
        //extra logic for static objects
        super.update()
    }
}

class Player extends MoveableObjects {

    constructor(x, y, hp, speedX) {
        super(x, y, 20, 50, "player.png", "pink", speedX, 0, 10,0)
        this.hp = hp
        this.attackCooldown = 0
    }

    update(ge) {
        // add attack function via update function
        const objList = ge.objectList;
        //extra logic for the player class
        this.changeimage()
        if (this.speedX > 0) this.direction = "right";
        if (this.speedX < 0) this.direction = "left";
        
        this.movement(objList)
        this.gravity(objList)
        
        
        for (let otherObj of objList) {
            if (otherObj instanceof Enemy) {
                if (this.collision(this, otherObj) && otherObj.active) {
                    if (this.hp > 0) {
                        this.hp -= 1 
                    }
                    else {
                        this.death()
                    }
                }
                
            }
            if (this.y > canvas.height) {
                this.death()
            }
        }
        if (this.attackCooldown >= 1) {
            this.attackCooldown += 1
        }
        if (this.attackCooldown >= 180) {
            this.attackCooldown = 0
        }
        if (attackAllowed) {
            this.attacking(objList)
            
        }
    }

    attacking(objList) {
        
        //maked this function run via update instead of event listener
        if (this.attackCooldown >= 21) {
            attackAllowed = false
        }
        if (this.attackCooldown == 2){
            swordoverlap()
        }
        ctx.fillStyle = "black"
        this.attackCooldown += 1
        if (this.direction === "right") {
            
            for (let otherObj of objList) {
                ctx.fillRect(this.x + this.width, this.y - 20, 100, this.height + 40)
                if (otherObj instanceof Enemy) {
                    if (otherObj.x + otherObj.width >= this.x + this.width &&
                        otherObj.x <= this.x + this.width + 100 &&
                        otherObj.y + otherObj.height >= this.y - 20 &&
                        otherObj.y + otherObj.height <= this.y + this.height + 20) {
                            this.attackCooldown = 21
                            otherObj.hp -= 1
                            swordoverlap()

                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }

        if (this.direction === "left") {
            
            for (let otherObj of objList) {
                ctx.fillRect(this.x, this.y - 20, -100, this.height + 40)

                if (otherObj instanceof Enemy) {
                    if (otherObj.x + otherObj.width <= this.x &&
                        otherObj.x >= this.x - 100 &&
                        otherObj.y + otherObj.height >= this.y - 20 &&
                        otherObj.y + otherObj.height <= this.y + this.height + 20) {
                            this.attackCooldown = 21
                            otherObj.hp -= 1

                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }
    }



    gravity(objList) {
        super.gravity(objList)
    }
    
    handleMoving(keyList, objList) {
        this.speedX = 0
        if (keyList["a"] || keyList["A"]){
            this.speedX = -3
            this.activeimage += 5
        }
        else if (keyList["d"] || keyList["D"]) {
            this.speedX = 3
            this.activeimage += 5
        }
        else {
            this.activeimage = 0
        }
        if (keyList[" "]) this.jump(objList, this)
        
    }

    movement(objList) {
        for (let otherObj of objList) {
            if ((otherObj !== this) && !(otherObj instanceof Door) && !(otherObj instanceof Enemy)){
                if (this.y >= otherObj.y &&
                    this.y <= otherObj.y + otherObj.height ||
                    this.y + this.height > otherObj.y &&
                    this.y + this.height < otherObj.y + otherObj.height){
                        if (this.x + this.width + this.speedX > otherObj.x &&
                            this.x + this.speedX <= otherObj.x + otherObj.width) {

                            this.speedX = 0
                            break
                        }                  
                }
            }
        }
        this.x += this.speedX
        return
    }

    death() {
        // Check if player died by any means added in future and draw gameover! + restart button
        if (candie) {
            playerdeath.play();
            candie = false;
        }
        ctx.fillStyle = "red"
        ctx.font = "150px sans serif"
        ctx.fillText("Gameover!", 10, canvas.height/2 - 75, canvas.width - 20)

        ctx.fillStyle = "lightgrey"
        ctx.fillRect(canvas.width/2 - 150, 175, 300, 150)
        ctx.fillStyle = "black"
        ctx.lineWidth = 2.5
        ctx.font = "100px sans serif"
        ctx.strokeRect(canvas.width/2 - 150, 175, 300, 150)
        ctx.fillText("Restart?", canvas.width/2 - 140, 280, 280)
        this.active = false
        window.addEventListener("mousedown", (e) => {
            if (e.offsetX >= canvas.width/2 - 150 &&
                e.offsetX <= canvas.width/2 + 150 &&
                e.offsetY >= 175 &&
                e.offsetY <= 175 + 150) {
                    location.reload()
                }
        })
    }

    win() {

        if(this.x >= 550 &&
            this.y + this.height >= canvas.height - 10) {
                if (playerAlive) {
                    playerWin = true
                    
                }
            }
        
        if (playerWin) {
            ctx.fillStyle = "yellow"
            ctx.font = "150px sans serif"
            ctx.fillText("Winner!", 10, canvas.height/2 - 75, canvas.width - 20)

            ctx.fillStyle = "lightgrey"
            ctx.fillRect(canvas.width/2 - 150, 175, 300, 150)
            ctx.fillStyle = "black"
            ctx.lineWidth = 2.5
            ctx.font = "100px sans serif"
            ctx.strokeRect(canvas.width/2 - 150, 175, 300, 150)
            ctx.fillText("Restart?", canvas.width/2 - 140, 280, 280)
        }
    }
}

class Enemy extends MoveableObjects {
    constructor(hp, x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight,leftRange, rightRange) {
        super(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight,canland)
        this.hp = hp
        this.leftRange = leftRange
        this.rightRange = rightRange
        this.attackCooldown = 0
        this.jumpCooldown = 0
    }

    update(ge) {

        const objList = ge.objectList;
        if (this.active) {
            
            this.movement(objList)
            if (this.speedX > 0) this.direction = "right";
            if (this.speedX < 0) this.direction = "left";
            
            if (this.attackCooldown <= 20) {
                this.attacking(objList)
                basesword.play()
            }
            if (this.attackCooldown >= 1) {
                this.attackCooldown += 1
            }
            if (this.attackCooldown >= 180) {
                this.attackCooldown = 0
            }
    
            if (this.jumpCooldown >= 1) {
                this.jumpCooldown += 1
            }
            if (this.jumpCooldown >= 120) {
                this.jumpCooldown = 0
            }
        }
    }


    movement(objList) {

        this.x += this.speedX;
        if (this.x > this.rightRange) {
            this.speedX *= -1;
        }
        if(this.x < this.leftRange) {
            this.speedX *= -1;
        }

        /*
        for(let otherObj of objList) {
            if (otherObj instanceof Player && (otherObj.x > obj.x - obj.range && otherObj.x < obj.x + obj.range)) {
                if (this.x + this.width/2 > otherObj.x + otherObj.width/2) {
                    this.speedX = -1
                }
                else if (this.x + this.width/2 < otherObj.x + otherObj.width/2) {
                    this.speedX = 1
                }
                else {
                    this.speedX = 0
                }
                if (this.y > otherObj.y + otherObj.height) {
                    this.jump(objList, this)
                    
                }
                this.x += this.speedX
            }
        }
        */
    }

    attacking(objList) {
        ctx.fillStyle = "black"
        this.attackCooldown += 1

        if (this.direction === "right") {
            ctx.fillRect(this.x + this.width, this.y - 20, 100, this.height + 40)
    
            for (let otherObj of objList) {
                if (otherObj instanceof Player) {
                    if (otherObj.x + otherObj.width >= this.x + this.width &&
                        otherObj.x <= this.x + this.width + 100 &&
                        otherObj.y + otherObj.height >= this.y - 20 &&
                        otherObj.y + otherObj.height <= this.y + this.height + 20) {
                            this.attackCooldown = 21
                            otherObj.hp -= 1

                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }

        if (this.direction === "left") {
            ctx.fillRect(this.x, this.y - 20, -100, this.height + 40)
    
            for (let otherObj of objList) {
                if (otherObj instanceof Player) {
                    if (otherObj.x + otherObj.width <= this.x &&
                        otherObj.x >= this.x - 100 &&
                        otherObj.y + otherObj.height >= this.y - 20 &&
                        otherObj.y + otherObj.height <= this.y + this.height + 20) {
                            this.attackCooldown = 21
                            otherObj.hp -= 1

                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }
    }
}

class Boss extends Enemy {
    constructor(hp, attackCooldown) {
        super(x, y, 50, 100, imageSrc, color, speedX, deltaY, jumpHeight,canland)
        this.hp = hp
        this.attackCooldown = attackCooldown
    }
}

class Block extends StaticObjects {
    constructor(x, y, width, height, imageSrc, color) {
        super(x, y, width, height, imageSrc, color)
    }
}
class Door extends StaticObjects {
    constructor(x,y,width,height,imageSrc,color,xcoord){
        super(x,y,width,height,imageSrc,color)
        this.xcoord = xcoord
    }
    update(ge){
        const objList = ge.objectList;
        for(let otherObj of objList){
            if (otherObj instanceof Player || otherObj instanceof Enemy){
                if((otherObj.x + otherObj.width> this.x && otherObj.x < this.x+this.width) && (otherObj.y +otherObj.height>this.y && otherObj.y < this.y + this.height)){
                    ge.clear();
                    ge.setLevel(5);
                    //otherObj.x += this.xcoord
                }
            }
        }
    }
}




class GameEngine {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d")
        this.keyList = {}
        this.objectList = []

        //player
        this.player = new Player(50, 450, 3, 0)

        this.setLevel(1);
        this.initInput()
    }

    initInput() {
        window.addEventListener("keydown", (e) => {
            this.keyList[e.key] = true;
        })

        window.addEventListener("keyup", (e) => {
            this.keyList[e.key] = false;
        })

        window.addEventListener("mousedown", (e) => {
            if (this.player.attackCooldown <= 20) {
                attackAllowed = true
            }
        })

        window.addEventListener("keydown", (e) => {
            if (e.key == "e" && this.player.attackCooldown <= 20) {  
                attackAllowed = true
            }
        })
    }

    setLevel(level) {
        if (level == 1) {
            //enemies
        this.enemy = new Enemy(3, 325, 145, 25, 50, "", "red", 1, 0, 10,300, 725)

        //blocks for the level
        this.block = new Block(150, 395, 325, 100, "platform1.png", "purple")
        this.block2 = new Block(750, 395, 250, 100, "platform2.png", "purple")
        this.block3 = new Block(850, 295, 150, 100, "platform3.png", "purple")
        this.block4 = new Block(300, 195, 450, 100, "platform1.png", "purple")
        this.block5 = new Block(200, 295, 175, 100, "platform2.png", "purple")
        this.block6 = new Block(0, 195, 125, 100, "platform3.png", "purple")
        this.block7 = new Block(250, 0, 250, 100, "platform1.png", "purple")
        this.block8 = new Block(700, 0, 300, 100, "platform2.png", "purple")


        
        //floor for the level
        this.floor = new Block(0, canvas.height - 5, 550, 5, "", "green")
        this.floor2 = new Block(650, canvas.height - 5, 350, 5, "", "blue")

        //door to end the level
        this.door = new Door(100,400,20,60,"","grey",700)

        //walls and roof
        this.wall = new Block(1000, 0, 20, canvas.height, "", "grey")
        this.wall2 = new Block(-10, 0, 10, canvas.height, "", "grey")
        this.roof = new Block(0, -10, 3 * canvas.width, 10, "", "grey")


        //player
        this.objectList.push(this.player)
        
        //enemies
        this.objectList.push(this.enemy)

        //blocks for the level
        this.objectList.push(this.block)
        this.objectList.push(this.block2)
        this.objectList.push(this.block3)
        this.objectList.push(this.block4)
        this.objectList.push(this.block5)
        this.objectList.push(this.block6)
        this.objectList.push(this.block7)
        this.objectList.push(this.block8)

        //floor for the level
        this.objectList.push(this.floor)
        this.objectList.push(this.floor2)
        
        //door to end the level
        this.objectList.push(this.door)
        
        //walls and roof
        this.objectList.push(this.wall)
        this.objectList.push(this.wall2)
        this.objectList.push(this.roof)
        }

        if (level == 2) {
            this.player.hp = 3;
            this.player.x = 50;
            
            this.floor = new Block(0, canvas.height - 5, canvas.width, 5, "", "green");
            this.wall = new Block(1000, 0, 20, canvas.height, "", "grey");
            this.wall2 = new Block(-10, 0, 10, canvas.height, "", "grey");
            this.roof = new Block(0, -10, 3 * canvas.width, 10, "", "grey");
            
            this.enemy = new Enemy(3, 325, 45, 25, 50, "", "red", 1, 0, 10, 250, 725);
            this.enemy2 = new Enemy(3, 750, 245, 25, 50, "", "red", 1, 0, 10, 600, 824);
            
            this.block = new Block(150, 395, 250, 100, "platform1.png", "grey");
            this.block2 = new Block(250, 295, 250, 100, "platform1.png", "grey");
            this.block3 = new Block(-100, 195, 250, 100, "platform1.png", "grey");
            this.block4 = new Block(400, 195, 100, 100, "platform1.png", "grey");
            this.block5 = new Block(250, 95, 500, 100, "platform1.png", "grey");
            this.block6 = new Block(850, 195, 150, 100, "platform1.png", "grey");
            this.block7 = new Block(600, 295, 400, 100, "platform1.png", "grey");
            
            this.door = new Door(400,400,50,95,"","grey",700);

            this.objectList.push(this.player);

            this.objectList.push(this.floor);
            this.objectList.push(this.wall);
            this.objectList.push(this.wall2);
            this.objectList.push(this.roof);

            this.objectList.push(this.block);
            this.objectList.push(this.block2);
            this.objectList.push(this.block3);
            this.objectList.push(this.block4);
            this.objectList.push(this.block5);
            this.objectList.push(this.block6);
            this.objectList.push(this.block7);

            this.objectList.push(this.door);

            this.objectList.push(this.enemy);
            this.objectList.push(this.enemy2);

        }

        if (level == 3) {
            this.player.hp = 3;
            this.player.x = 900;
            this.player.y = 50;

            this.block = new Block(850, 95, 150, 100, "platform1.png", "grey");
            this.block2 = new Block(100, 115, 750, 75, "platform1.png", "grey");
            this.block3 = new Block(0, 295, 850, 75, "platform1.png", "grey");

            this.enemy = new Enemy(3, 500, 65, 25, 50, "", "red", 1, 0, 10, 100, 750);
            this.enemy2 = new Enemy(3, 345, 245, 25, 50, "", "red", 1, 0, 10, 0, 825);
            this.enemy3 = new Enemy(3, 370, 445, 25, 50, "", "red", 1, 0, 10, 105, 975);
            
            this.floor = new Block(0, canvas.height - 5, canvas.width, 5, "", "green");
            this.wall = new Block(1000, 0, 20, canvas.height, "", "grey");
            this.wall2 = new Block(-10, 0, 10, canvas.height, "", "grey");
            this.roof = new Block(0, -10, 3 * canvas.width, 10, "", "grey");

            this.door = new Door(50,400,50,95,"","grey",700)

            this.objectList.push(this.block);
            this.objectList.push(this.block2);
            this.objectList.push(this.block3);

            this.objectList.push(this.enemy);
            this.objectList.push(this.enemy2);
            this.objectList.push(this.enemy3);

            this.objectList.push(this.door);

            this.objectList.push(this.floor);
            this.objectList.push(this.wall);
            this.objectList.push(this.wall2);
            this.objectList.push(this.roof);
            this.objectList.push(this.player);

        }

        if (level == 4) {
            this.player.hp = 3;
            this.player.x = 50;
            this.player.y = 245;

            this.block = new Block(0, 295, 125, 100, "platform1.png", "grey");
            this.block2 = new Block(225, 295, 125, 100, "platform1.png", "grey");
            this.block3 = new Block(450, 295, 125, 100, "platform1.png", "grey");
            this.block4 = new Block(675, 295, 125, 100, "platform1.png", "grey");
            this.block5 = new Block(875, 295, 125, 100, "platform1.png", "grey");

            this.enemy = new Enemy(3, 275, 245, 25, 50, "", "red", 1, 0, 10, 225, 325);
            this.enemy2 = new Enemy(3, 500, 245, 25, 50, "", "red", 1, 0, 10, 450, 550);
            this.enemy3 = new Enemy(3, 725, 245, 25, 50, "", "red", 1, 0, 10, 675, 775);

            this.wall = new Block(1000, 0, 20, canvas.height, "", "grey");
            this.wall2 = new Block(-10, 0, 10, canvas.height, "", "grey");
            this.roof = new Block(0, -10, 3 * canvas.width, 10, "", "grey");

            this.door = new Door(925, 200, 50, 95, "", "grey", 700);

            this.objectList.push(this.block);
            this.objectList.push(this.block2);
            this.objectList.push(this.block3);
            this.objectList.push(this.block4);
            this.objectList.push(this.block5);

            this.objectList.push(this.enemy);
            this.objectList.push(this.enemy2);
            this.objectList.push(this.enemy3);

            this.objectList.push(this.door);

            this.objectList.push(this.wall);
            this.objectList.push(this.wall2);
            this.objectList.push(this.roof);

            this.objectList.push(this.player);
        }

        if(level == 5) {
            this.player.hp = 3;
            this.player.x = 50;
            this.player.y = 45;

            this.block = new Block(0, 95, 150, 100, "platform1.png", "grey");
            this.block2 = new Block(0, 395, 1000, 100, "platform1.png", "grey");
            this.block3 = new Block(100, 295, 250, 25, "platform1.png", "grey");
            this.block4 = new Block(400, 195, 250, 25, "platform1.png", "grey");
            this.block5 = new Block(700, 295, 250, 25, "platform1.png", "grey");

            this.wall = new Block(1000, 0, 20, canvas.height, "", "grey");
            this.wall2 = new Block(-10, 0, 10, canvas.height, "", "grey");
            this.roof = new Block(0, -10, 3 * canvas.width, 10, "", "grey");

            this.objectList.push(this.block);
            this.objectList.push(this.block2);
            this.objectList.push(this.block3);
            this.objectList.push(this.block4);
            this.objectList.push(this.block5);

            this.objectList.push(this.wall);
            this.objectList.push(this.wall2);
            this.objectList.push(this.roof);

            this.objectList.push(this.player);
        }
    }

    clear() {
        this.objectList = [];
    }

    startGame() {
        requestAnimationFrame(() => this.gameloop());
    }

    gameloop(){

        // The gameloop function which makes everything else run
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        this.player.handleMoving(this.keyList, this.objectList)
        
        for (let obj of this.objectList) {
            obj.update(this)
            obj.drawBox(this.ctx)
        }
        
        requestAnimationFrame(() => this.gameloop());
    }

}

window.onload = () => {
    const game = new GameEngine("gameCanvas")
    game.startGame()
}
