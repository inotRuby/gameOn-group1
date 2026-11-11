const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const objectList = []
const backgroundtheme = new Audio('edited ancient soundtrack.mp3')
const basejump = new Audio('Jump.mp3')
const baseland = new Audio('Land.mp3')
const playerdeath = new Audio('highdeath sfx.mp3')
let canland = false
let candie = true
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
            this.active = false
        }
    }

}

class MoveableObjects extends GameObjects {

    constructor(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight, direction = "right") {
        super(x, y, width, height, imageSrc, color)
        this.speedX = speedX
        this.deltaY = deltaY
        this.jumpHeight = jumpHeight
        this.direction = direction
    }

    movement(objList, obj){
        // Allows the player to move unless they are going to move into an object
        
    }

    update() {
        //extra logic for any moving objects
        super.update()
    }

    gravity(objList, obj) {
        // Checks if we are in the air and if we are make the player accelerate down
        this.deltaY += gravconst

        this.y += this.deltaY

        for (let otherObj of objList) {
            
        if ((obj !== otherObj && otherObj.active)) {
            if ((this.collision(obj, otherObj))) {
                    if (this.deltaY < 0) {
                        this.deltaY = 0
                    }
                    else if (this.deltaY > 0 && 
                        (this.x > otherObj.x && this.x < otherObj.x + otherObj.width) ||
                        (this.x + this.width > otherObj.x && this.x + this.width < otherObj.x + otherObj.width)
                    ) {
                        this.y = otherObj.y - this.height
                        this.deltaY = 0
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
        super(x, y, 20, 50, "", "pink", speedX, 0, 15)
        this.hp = hp
        this.attackCooldown = 0
    }

    update(objList, obj) {
        // add attack function via update function
        
        //extra logic for the player class
        if (this.speedX > 0) this.direction = "right";
        if (this.speedX < 0) this.direction = "left";
        
        this.movement(objList, obj)
        this.gravity(objList, obj)
        
        
        for (let otherObj of objList) {
            if (otherObj instanceof Enemy) {
                if (this.collision(obj, otherObj) && otherObj.active) {
                    if (this.hp > 0) {
                        this.hp -= 1 
                    }
                    else {
                        this.death()
                    }
                }
                if (!(this.active)) {
                    this.death()
                }
                
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
                            console.log(`enemy hp: ${otherObj.hp}`)
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
                console.log("draw our hitbox")
                if (otherObj instanceof Enemy) {
                    if (otherObj.x + otherObj.width <= this.x &&
                        otherObj.x >= this.x - 100 &&
                        otherObj.y + otherObj.height >= this.y - 20 &&
                        otherObj.y + otherObj.height <= this.y + this.height + 20) {
                            this.attackCooldown = 21
                            otherObj.hp -= 1
                            console.log(`enemy hp: ${otherObj.hp}`)
                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }
    }



    gravity(objList, obj) {
        super.gravity(objList, obj)
    }

    handleMoving(keyList, objList) {
        this.speedX = 0
        if (keyList["a"]) this.speedX = -3;
        if (keyList["d"]) this.speedX = 3;
        if (keyList[" "]) this.jump(objList, this);
    }

    movement(objList, obj) {
        for (let otherObj of objList) {
            if (otherObj !== obj){
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
    constructor(hp, x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight) {
        super(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight)
        this.hp = hp
        this.attackCooldown = 0
        this.jumpCooldown = 0
    }

    update(objList, obj) {

        
        if (this.active) {
            
            this.movement(objList, obj)
            this.gravity(objList, obj)
            if (this.speedX > 0) this.direction = "right";
            if (this.speedX < 0) this.direction = "left";
            
            if (this.attackCooldown <= 20) {
                this.attacking(objList)
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

    movement(objList, obj) {
        for(let otherObj of objList) {
            if (otherObj instanceof Player) {
                if (this.x + this.width/2 > otherObj.x + otherObj.width/2 + 1) {
                    this.speedX = -1
                }
                else if (this.x + this.width/2 < otherObj.x + otherObj.width/2 - 1) {
                    this.speedX = 1
                }
                else {
                    this.speedX = 0
                }
                if (this.y > otherObj.y + otherObj.height) {
                    if (this.jumpCooldown <= 0) {
                        this.jumpCooldown += 1
                        this.jump(objList, this)
                    }
                }
                if (this.x + this.width + this.speedX >= otherObj.x &&
                    this.x + this.speedX <= otherObj.x + otherObj.width &&
                    Math.round(this.y) + this.height >= otherObj.y &&
                    Math.round(this.y) <= otherObj.y + otherObj.height) {
                }
                this.x += this.speedX
            }
        }
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
                            console.log(`player hp: ${otherObj.hp}`)
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
                            console.log(`player hp: ${otherObj.hp}`)
                            if (otherObj.hp <= 0) {
                                otherObj.active = false
                            }
                        }
                }
            }
        }
    }

}

class Block extends StaticObjects {
    constructor(x, y, width, height, imageSrc, color) {
        super(x, y, width, height, imageSrc, color)
    }
}





class GameEngine {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d")
        this.keyList = {}
        this.objectList = []

        this.player = new Player(50, 300, 3, 0)
        this.enemy = new Enemy(3, 575, 165, 25, 50, "", "red", 0, 0, 10)
        this.block = new Block(160, 275, 50, 50, "", "grey")
        this.block2 = new Block(300, 200, 50, 50, "", "grey")
        this.block3 = new Block(550, 225, 50, 50, "", "grey")
        this.floor = new Block(canvas.width * -1, canvas.height - 5, canvas.width + 600, 5, "", "green")
        this.floor2 = new Block(850, canvas.height - 5, canvas.width * 2, 5, "", "blue")

        this.objectList.push(this.player)
        this.objectList.push(this.enemy)
        this.objectList.push(this.block)
        this.objectList.push(this.block2)
        this.objectList.push(this.block3)
        this.objectList.push(this.floor)
        this.objectList.push(this.floor2)

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

    startGame() {
        requestAnimationFrame(() => this.gameloop());
    }

    gameloop(){

        // The gameloop function which makes everything else run
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        this.player.handleMoving(this.keyList, this.objectList)
        
        for (let obj of this.objectList) {
            obj.update(this.objectList, obj)
            obj.drawBox(this.ctx)
        }
        
        requestAnimationFrame(() => this.gameloop());
    }

}

window.onload = () => {
    const game = new GameEngine("gameCanvas")
    game.startGame()
}

/*
Current issues existing in the code:

When jumping and moving into the sides of the second upper block you get stuck on the sides
Hitting sides of first lower block resets gravity
You still get stuck in blocks if the block is to close to where the player starts jumping (jump under bottom block)
When holding down jump any jump after the first is higher
When jumping over the hole you can go through the floor if you land in it (will add picture in discord)
When falling and moving so the top of player hits the bottom corner of a block you can move along it (very rarely happens)
*/