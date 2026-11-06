const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const objectList = []

// The gravity value
const gravity = 0.4

// For gravity function
let updateGravity = false

// For gravity function (update gravity even if we are on the ground and pressed spacebar to jump)
let spacePress = false
let enemyJump = false

// For death function if player is alive or not
let playerAlive = true
let playerWin = false


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
    
    collision(objList, obj) {
        // Checks collidion between two objects returns false if there is a collision
        for (let otherObj of objList){
            if (otherObj !== obj){
                if (obj.x + obj.width + obj.speedX >= otherObj.x &&
                    obj.x + obj.speedX <= otherObj.x + otherObj.width &&
                    Math.round(obj.y) + obj.height >= otherObj.y &&
                    Math.round(obj.y) <= otherObj.y + otherObj.height){
                        return false
                        
                }
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

    gravity(objList, obj) {
        // Checks if we are in the air and if we are make the player accelerate down
        updateGravity = false
        for (let otherObj of objList) {
            if (spacePress && this.playable && otherObj !== obj || this == enemy && enemyJump) {
                this.y += this.deltaY
                break
            }
            if (obj !== otherObj &&
                this.playable ||
                obj !== otherObj &&
                obj == enemy) {

                    if (this.withinCanvas &&
                        this.collision(objList, obj)) {

                        if (this.x + this.width >= otherObj.x &&
                            this.x <= otherObj.x + otherObj.width) {
                                console.log("here2")
                            if (this.y + this.height + this.deltaY > otherObj.y &&
                                this.y < otherObj.y + otherObj.height) {
                                let checkY = otherObj.y - Math.round(this.height)
                                console.log(this.y)
                                console.log(otherObj.y + otherObj.height)
                                //updateGravity = false
                            }
                            if (checkY < otherObj.y + otherObj.height &&
                                checkY + 1 > otherObj.y + otherObj.height) {
                                    console.log("this code runs")
                                if (this.deltaY < 0) {
                                    this.deltaY = 0
                                    this.y = otherObj.y + otherObj.height
                                }
                                updateGravity = true
                            }
                        }
                        else {
                            updateGravity = true
                        }
                    }
                    else {
                        this.deltaY = 0
                    }         
            }
        }
        if (updateGravity) {
            this.y += this.deltaY
        }
        this.deltaY += gravity
    }

    jump(objList, obj) {
        // Checks if we are on the ground and if we are make us jump up
        if (!this.collision(objList, obj)){
            for (let otherObj of objList) {
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
//objectList.push(enemy)
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


function gameloop(){
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
gameloop()

/*
Current issues existing in the code:

When jumping and moving into the sides of the second upper block you get stuck on the sides
Hitting sides of first lower block resets gravity
You still get stuck in blocks if the block is to close to where the player starts jumping (jump under bottom block)
When holding down jump any jump after the first is higher
When jumping over the hole you can go through the floor if you land in it (will add picture in discord)
When falling and moving so the top of player hits the bottom corner of a block you can move along it (very rarely happens)
*/