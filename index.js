window.onload = function() {
    function resize() {
        let canvas = document.querySelector('canvas')
        let ww = window.innerWidth
        let wh = window.innerHeight
        let wRatio =  ww / wh
        let gameRatio = config.width / config.height
        if (wRatio < gameRatio) {
            canvas.style.width = ww + 'px'
            canvas.style.height = ( ww / gameRatio ) + 'px'
        } else {
            canvas.style.width = ( wh * gameRatio ) + 'px'
            canvas.style.height = wh + 'px'
        }
    }
    resize()
    window.addEventListener('resize', resize, false)	// 偵聽事件 resize
}

const scene = new Phaser.Scene('Game')

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 320,
    scene
}

const game = new Phaser.Game(config)

scene.init = function(){
    this.playerSpeed = 2
    this.keyboard = null
}

scene.preload = function(){
    this.load.spritesheet('player', 'images/characters/Robot/Tilesheet/character_robot_sheetHD.png', {
        frameWidth: 192,
        frameHeight: 256
    })
    // this.load.image('player', 'images/characters/Robot/PNG/Poses/character_robot_wide.png')
    this.load.image('zombie', 'images/characters/Zombie/PNG/Poses/character_zombie_wide.png')
    this.load.image('bg', 'images/background.png')
}

scene.create = function(){
    // system
    const sysWidth = this.sys.game.config.width
    const sysHeight = this.sys.game.config.height
    this.keyboard = this.input.keyboard.createCursorKeys()
    
    // player
    this.player = this.add.sprite(100, 100, 'player').setInteractive()
    this.input.setDraggable(this.player)
    this.player.displayWidth = 92
    this.player.displayHeight = 128
    this.player.depth = 1

    this.input.on('drag', function(pointer, gameObj, dragX, dragY) {
        gameObj.x = dragX
        gameObj.y = dragY
    })

    this.anims.create({
        key: 'stand',
        frames: this.anims.generateFrameNumbers('player', {
            start: 0,
            end: 0
        }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', {
            start: 36,
            end: 43
        }),
        frameRate: 10,
        repeat: -1
    })


    // zombie
    this.zombie = this.add.sprite(500, 100, 'zombie')
    this.zombie.depth = 1

    // background
    this.background = this.add.sprite(0, 0, 'bg')
    this.background.setPosition(sysWidth / 2, sysHeight / 2)
    this.background.depth = 0

    console.log(this.player)
    
}

scene.update = function(){
    // this.cameras.main.shake(500)
    if(this.keyboard.right.isDown){
        this.player.flipX = false
        this.player.x += this.playerSpeed
        this.player.anims.play('walk', true)
    }
    else if(this.keyboard.left.isDown){
        this.player.flipX = true
        this.player.x -= this.playerSpeed
        this.player.anims.play('walk', true)
    }
    else if(this.keyboard.up.isDown){
        this.player.y -= this.playerSpeed
        this.player.anims.play('walk', true)
    }
    else if(this.keyboard.down.isDown){
        this.player.y += this.playerSpeed
        this.player.anims.play('walk', true)
    }
    else {
        this.player.anims.play('stand', true)
        this.player.anims.stop()
    }

    const playerRect = this.player.getBounds()
    const zombieRect = this.zombie.getBounds()

    if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, zombieRect)){
        this.cameras.main.shake(500)

        this.cameras.main.on('camerashakecomplete', () => {
            this.cameras.main.fade(2000)
        })
        
        this.cameras.main.on('camerafadeoutcomplete', () => {
            this.scene.restart()
        })
    }
}