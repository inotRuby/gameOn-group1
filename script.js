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
backgroundtheme.loop = true

function jumpoverlap(){
    const jump = basejump.cloneNode()
    jump.play()
}
function landoverlap(){
    const land = baseland.cloneNode()
    land.play()
}
function swordoverlap(){
    const swing = baseland.cloneNode()
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
const gravity = 0.4

// For gravity function

// For gravity function (update gravity even if we are on the ground and pressed spacebar to jump)
let spacePress = false
let enemyJump = false

// For death function if player is alive or not
let playerAlive = true
let playerWin = false

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

    constructor(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight,activeimage = 0) {
        super(x, y, width, height, imageSrc, color)
        this.speedX = speedX
        this.deltaY = deltaY
        this.jumpHeight = jumpHeight
        this.activeimage = activeimage
    }

    movement(objList, obj){
        // Allows the player to move unless they are going to move into an object
        
    }
    changeimage(){
        
        if (this.activeimage<20){
            this.image.src = "stone wall.jpg"
        }
        if (this.activeimage<40 && this.activeimage > 20){
            this.image.src = "runskel.jpg"
        }
        if (this.activeimage<60 && this.activeimage > 40){
            this.image.src = "stone wall.jpg"
        }
        if (this.activeimage<80 && this.activeimage > 60){
            this.image.src = "runskel.jpg"
        }
        if (this.activeimage<100 && this.activeimage > 80){
            this.image.src = "stone wall.jpg"
        }
        if(this.activeimage>= 100){
            this.activeimage = 0
        }
        console.log(timeplayed)
    }

    update() {
        //extra logic for any moving objects
        super.update()
    }
    gravity(objList, obj) {
        // Checks if we are in the air and if we are make the player accelerate down
        this.deltaY += gravity

        this.y += this.deltaY

        for (let otherObj of objList) {
            
        if ((otherObj !== obj) && (!(otherObj instanceof Door))) {
            if ((this.collision(obj, otherObj))) {
                    if (this.deltaY < 0) {
                        this.y = otherObj.y + otherObj.height
                        this.deltaY = 0
                        landoverlap()
                        timeplayed += 1
                    }
                    if (this.deltaY < 0.4 || this.deltaY > 0.4){
                        canland = true
                    }
                    if (this.deltaY > 0) {
                        this.y = otherObj.y - this.height
                        this.deltaY = 0
                        if(canland && (obj instanceof Player) || (obj instanceof Enemy) && canland){
                            canland = false
                            landoverlap()
                            timeplayed += 1
                        }
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
        super(x, y, 20, 50, "stone wall.jpg", "pink", speedX, 0, 12,0)
        this.hp = hp
    }

    update(objList, obj) {
        //extra logic for the player class
        this.changeimage()
        this.movement(objList, obj)
        this.gravity(objList, obj)

        for (let otherObj of objList) {
            if (otherObj instanceof Enemy) {
                if (this.collision(obj, otherObj)) {
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

    }

    gravity(objList, obj) {
        super.gravity(objList, obj)
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

    movement(objList, obj) {
        for (let otherObj of objList) {
            if ((otherObj !== obj) && (!(otherObj instanceof Door))){
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
    constructor(hp, x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight,range) {
        super(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight)
        this.hp = hp
        this.range = range
    }

    update(objList, obj) {
        this.movement(objList, obj)
        this.gravity(objList, obj)
    }

    movement(objList, obj) {
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
                if (this.x + this.width + this.speedX >= otherObj.x &&
                    this.x + this.speedX <= otherObj.x + otherObj.width &&
                    Math.round(this.y) + this.height >= otherObj.y &&
                    Math.round(this.y) <= otherObj.y + otherObj.height) {
                }
                this.x += this.speedX
            }
        }
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
    update(objList){
        for(let otherObj of objList){
            if (otherObj instanceof Player || otherObj instanceof Enemy){
                if((otherObj.x + otherObj.width> this.x && otherObj.x < this.x+this.width) && (otherObj.y +otherObj.height>this.y && otherObj.y < this.y + this.height)){
                    otherObj.x += this.xcoord
                }
            }
        }
    }
}
const keys = {}

// Event listeners for when we click certain keys or mouse

class GameEngine {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d")
        this.keyList = {}
        this.objectList = []

        this.player = new Player(50, 300, 3, 0)
        this.enemy = new Enemy(3, 325, 145, 25, 50, "", "red", 0, 0, 10,270)
        this.block = new Block(100, 400, 200, 20, "", "grey")
        this.block2 = new Block(400, 300, 200, 20, "", "grey")
        this.block3 = new Block(700, 200, 200, 20, "", "grey")
        this.wall = new Block(990,0, 20,canvas.height, "", "grey")
        this.wall2 = new Block(-10,0, 20,canvas.height, "", "grey")
        this.floor = new Block(canvas.width * -1, canvas.height - 5, canvas.width + 400, 5, "", "green")
        this.floor2 = new Block(550, canvas.height - 5, canvas.width * 2, 5, "", "blue")
        this.roof = new Block(0,0,3 * canvas.width,10,"","grey")
        this.door = new Door(100,400,20,60,"","grey",700)

        this.objectList.push(this.player)
        this.objectList.push(this.enemy)
        this.objectList.push(this.block)
        this.objectList.push(this.block2)
        this.objectList.push(this.block3)
        this.objectList.push(this.wall)
        this.objectList.push(this.wall2)
        this.objectList.push(this.floor)
        this.objectList.push(this.floor2)
        this.objectList.push(this.door)
        this.objectList.push(this.roof)
        this.initInput()
    }

    initInput() {
        window.addEventListener("keydown", (e) => {
            this.keyList[e.key] = true;
        })
        window.addEventListener("keyup", (e) => {
            this.keyList[e.key] = false;
        })
    }

    startGame() {
        requestAnimationFrame(() => this.gameloop());
    }

    gameloop(){

        this.player.handleMoving(this.keyList, this.objectList)
        // The gameloop function which makes everything else run
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let obj of this.objectList) {
            obj.update(this.objectList, obj)
            obj.drawBox(this.ctx)
        }
        spacePress = false
        enemyJump = false
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