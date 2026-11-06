const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const objectList = []

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
        // Checks collidion between two objects returns false if there is a collision
        if (otherObj !== obj){
            if (obj.x + obj.width + obj.speedX >= otherObj.x &&
                obj.x + obj.speedX <= otherObj.x + otherObj.width &&
                Math.round(obj.y) + obj.height + obj.deltaY >= otherObj.y &&
                Math.round(obj.y) + obj.deltaY <= otherObj.y + otherObj.height){
                    return false
                    
            }
        }
        return true
    }

    update() {
        //extra functions for extending classes
    }

    drawBox() {
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

    constructor(x, y, width, height, imageSrc, color, speedX, deltaY, jumpHeight) {
        super(x, y, width, height, imageSrc, color)
        this.speedX = speedX
        this.deltaY = deltaY
        this.jumpHeight = jumpHeight
    }

    movement(objList, obj){
        // Allows the player to move unless they are going to move into an object
        this.speedX = 0
        if (keys["a"] && this.playable) this.speedX = -3
        if (keys["d"] && this.playable) this.speedX = 3
        for (let otherObj of objList) {
            if (this.playable &&
                otherObj !== obj){
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

    update() {
        //extra logic for any moving objects
        super.update()
    }

    gravity(objList, obj) {
        // Checks if we are in the air and if we are make the player accelerate down
        this.deltaY += gravity
        if (this.playable || this == enemy) {
            this.y += this.deltaY
        }
        updateGravity = false
        for (let otherObj of objList) {
            
        if ((obj !== otherObj &&
            this.playable) ||
            (obj !== otherObj &&
            obj == enemy)) {

                    if (!(this.collision(obj, otherObj))) {
                            if (this.deltaY < 0) {
                                this.y = otherObj.y + otherObj.height
                                this.deltaY = 0
                            }
                            else if (this.deltaY > 0) {
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
                if (!this.collision(obj, otherObj)){
                if (obj !== otherObj &&
                    this.x + this.width + this.speedX > otherObj.x &&
                    this.x + this.speedX < otherObj.x + otherObj.width) {
                        this.deltaY = this.jumpHeight * -1
                        break
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

    constructor(x, y, hp) {
        super(x, y, 20, 50, "", "pink", 0, 0, 10)
        this.hp = hp
    }

    update() {
        //extra logic for the player class
        super.update()
    }

    death(objList, obj) {
        // Check if player died by any means added in future and draw gameover! + restart button
        if (this.playable &&
            this.y - this.deltaY >= canvas.height) {
                playerAlive = false
            }
        if (!(playerAlive) && !(playerWin)) {
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
        }
    }

    win() {
        if(this.playable) {
            if(this.x >= 550 &&
                this.y + this.height >= canvas.height - 10) {
                    if (playerAlive) {
                        playerWin = true
                        
                    }
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
    constructor(hp) {
        super(x, y, width, height, imageSrc, color, speedX, deltaY, this.jumpHeight)
        this.hp = hp
    }

    update(objList, obj) {
        for(let otherObj of objList) {
            if (otherObj.playable && obj == enemy) {
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
                    enemyJump = true
                    enemy.jump(objectList, enemy)
                }
                if (this.x + this.width + this.speedX >= otherObj.x &&
                    this.x + this.speedX <= otherObj.x + otherObj.width &&
                    Math.round(this.y) + this.height >= otherObj.y &&
                    Math.round(this.y) <= otherObj.y + otherObj.height) {
                    playerAlive = false
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

class Box{
    // Class for our objects
    constructor(x, y, width, height, speedX, deltaY, jumpHeight, color, playable) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speedX = speedX
    this.deltaY = deltaY
    this.jumpHeight = jumpHeight
    this.color = color
    this.playable = playable
    }

    drawBox() {
        // Draws all the objects
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    withinCanvas() {
        // Checks if we are within the canvas edges
        if (this.x + this.width + this.speedX < canvas.width &&
            this.x + this.speedX > 0 &&
            this.y + this.height + this.deltaY < canvas.height &&
            this.y + this.deltaY > 0){

                return true
        }
    }
    
    collision(obj, otherObj) {
        // Checks collidion between two objects returns false if there is a collision
        if (otherObj !== obj){
            if (obj.x + obj.width + obj.speedX >= otherObj.x &&
                obj.x + obj.speedX <= otherObj.x + otherObj.width &&
                Math.round(obj.y) + obj.height + obj.deltaY >= otherObj.y &&
                Math.round(obj.y) + obj.deltaY <= otherObj.y + otherObj.height){
                    return false
                    
            }
        }
        return true
    }

    movement(objList, obj){
        // Allows the player to move unless they are going to move into an object
        this.speedX = 0
        if (keys["a"] && this.playable) this.speedX = -3
        if (keys["d"] && this.playable) this.speedX = 3
        for (let otherObj of objList) {
            if (this.playable &&
                otherObj !== obj){
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
    
    /*
    */
   gravity(objList, obj) {
       // Checks if we are in the air and if we are make the player accelerate down
       this.deltaY += gravity
       if (this.playable || this == enemy) {
           this.y += this.deltaY
       }
       updateGravity = false
       for (let otherObj of objList) {
           
           if ((obj !== otherObj &&
            this.playable) ||
            (obj !== otherObj &&
            obj == enemy)) {

                    if (!(this.collision(obj, otherObj))) {
                            if (this.deltaY < 0) {
                                this.y = otherObj.y + otherObj.height
                                this.deltaY = 0
                            }
                            else if (this.deltaY > 0) {
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
                if (!this.collision(obj, otherObj)){
                if (obj !== otherObj &&
                    this.x + this.width + this.speedX > otherObj.x &&
                    this.x + this.speedX < otherObj.x + otherObj.width) {
                        this.deltaY = this.jumpHeight * -1
                        break
                    }
            }
        }
    }

    update(objList, obj) {
        for(let otherObj of objList) {
            if (otherObj.playable && obj == enemy) {
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
                    enemyJump = true
                    enemy.jump(objectList, enemy)
                }
                if (this.x + this.width + this.speedX >= otherObj.x &&
                    this.x + this.speedX <= otherObj.x + otherObj.width &&
                    Math.round(this.y) + this.height >= otherObj.y &&
                    Math.round(this.y) <= otherObj.y + otherObj.height) {
                    playerAlive = false
                }
                this.x += this.speedX
            }
        }  
    }

    death(objList, obj) {
        // Check if player died by any means added in future and draw gameover! + restart button
        if (this.playable &&
            this.y - this.deltaY >= canvas.height) {
                playerAlive = false
            }
        if (!(playerAlive) && !(playerWin)) {
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
        }
    }

    win() {
        if(this.playable) {
            if(this.x >= 550 &&
                this.y + this.height >= canvas.height - 10) {
                    if (playerAlive) {
                        playerWin = true
                        
                    }
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

    screenChange(objList) {
        // Allows us to move between screens in the level
        if(player.x + player.width/2 <= 0) {
            for (let obj of objList) {
                if(obj !== player){
                    obj.x += canvas.width
                }
            }
            player.x += canvas.width
        }
        if(player.x + player.width/2 >= canvas.width) {
            for (let obj of objList) {
                if(obj !== player){
                    obj.x -= canvas.width
                }
            }
            player.x -= canvas.width
        }
    }
    
}


//const objName = new Box(x, y, width, height, speedX, deltaY, jumpHeight, color, playable)
const player = new Box(50, canvas.height - 30, 10, 25, 0, 0, 10, "pink", true)
const enemy = new Box(325, 175, 10, 25, 0, 0, 10, "red", false )
const block = new Box(160, 275, 50, 50, 0, 0, 0, "grey", false)
const block2 = new Box(300, 200, 50, 50, 0, 0, 0, "grey", false)
const floor = new Box(canvas.width * -1, canvas.height - 5, canvas.width + 400, 5, 0, 0, 0, "green", false)
const floor2 = new Box(550, canvas.height - 5, canvas.width * 2, 5, 0, 0, 0, "blue", false)

objectList.push(player)
objectList.push(enemy)
objectList.push(block)
objectList.push(block2)
objectList.push(floor)
objectList.push(floor2)


const keys = {}

// Event listeners for when we click certain keys or mouse
window.addEventListener("keydown", function(e){
    keys[e.key] = true;
})
window.addEventListener("keyup", function(e){
    keys[e.key] = false;
})
window.addEventListener("keypress", function(e){
    if (e.key == " ") {
        spacePress = true
        player.jump(objectList, player)
    }
})
window.addEventListener("mousedown", function(e){
    if (e.offsetX >= canvas.width/2 - 150 &&
        e.offsetX <= canvas.width/2 + 150 &&
        e.offsetY >= 175 &&
        e.offsetY <= 175 + 150 &&
        !(playerAlive) || playerWin) {
            location.reload()
        }
})

class GameEngine {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId)
        this.ctx = this.canvas.getContext("2d")
        this.keyList = {}
        this.objectList = []

        this.player = new Player(50, canvas.height - 30, 3)
        this.enemy = new Enemy(3)
        this.block = new Block(160, 275, 50, 50, "", "grey")
        this.block2 = new Block(300, 200, 50, 50, "", "grey")
        this.floor = new Block(canvas.width * -1, canvas.height - 5, canvas.width + 400, 5, "", "green")
        this.floor2 = new Block(550, canvas.height - 5, canvas.width * 2, 5, "", "blue")

        this.objectList.push(this.player)
        this.objectList.push(this.enemy)
        this.objectList.push(this.block)
        this.objectList.push(this.block2)
        this.objectList.push(this.floor)
        this.objectList.push(this.floor2)

        this.initInput()
    }

    initInput() {
        window.addEventListener("keydown", function(e){
            this.keyList[e.key] = true;
        })
        window.addEventListener("keyup", function(e){
            this.keyList[e.key] = false;
        })
        window.addEventListener("keypress", function(e){
            if (this.keyList[e.key] == " ") {
                spacePress = true
                player.jump(objectList, player)
            }
        })
        window.addEventListener("mousedown", function(e){
            if (e.offsetX >= canvas.width/2 - 150 &&
                e.offsetX <= canvas.width/2 + 150 &&
                e.offsetY >= 175 &&
                e.offsetY <= 175 + 150 &&
                !(playerAlive) || playerWin) {
                    location.reload()
                }
        })
    }

    gameloop(){
        // The gameloop function which makes everything else run
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let obj of objectList) {
            obj.movement(objectList, obj)
            obj.update(objectList, obj)
            obj.gravity(objectList, obj)
            player.screenChange(objectList)
            obj.drawBox()
            obj.death(objectList, obj)
            obj.win()
        }
        spacePress = false
        enemyJump = false
        requestAnimationFrame(gameloop)
    }

}

GameEngine.gameloop()

/*
Current issues existing in the code:

When jumping and moving into the sides of the second upper block you get stuck on the sides
Hitting sides of first lower block resets gravity
You still get stuck in blocks if the block is to close to where the player starts jumping (jump under bottom block)
When holding down jump any jump after the first is higher
When jumping over the hole you can go through the floor if you land in it (will add picture in discord)
When falling and moving so the top of player hits the bottom corner of a block you can move along it (very rarely happens)
*/