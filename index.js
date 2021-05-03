window.onload = function () {
  function resize() {
    let canvas = document.querySelector("canvas");
    let ww = window.innerWidth;
    let wh = window.innerHeight;
    let wRatio = ww / wh;
    let gameRatio = config.width / config.height;
    if (wRatio < gameRatio) {
      canvas.style.width = ww + "px";
      canvas.style.height = ww / gameRatio + "px";
    } else {
      canvas.style.width = wh * gameRatio + "px";
      canvas.style.height = wh + "px";
    }
  }
  resize();
  window.addEventListener("resize", resize, false); // 偵聽事件 resize
};

const scene = new Phaser.Scene("Game");

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 320,
  scene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      // debug: true
    },
  },
};

const game = new Phaser.Game(config);

scene.init = function () {
  this.playerSpeed = 4.5;
  this.playerFallingBoostSpeed = 4;
  this.playerJumpHeight = -400;
  this.playerBoostSpeed = 2.5;
  this.keyboard = null;
};

scene.preload = function () {
  // this.load.spritesheet('player', 'images/characters/Zombie/Tilesheet/character_zombie_sheetHD.png', {
  this.load.spritesheet(
    "player",
    "images/characters/Robot/Tilesheet/character_robot_sheetHD.png",
    {
      frameWidth: 192,
      frameHeight: 256,
    }
  );
  this.load.image(
    "zombie",
    "images/characters/Zombie/PNG/Poses/character_zombie_wide.png"
  );
  this.load.image("bg", "images/background.png");

  for (let i = 0; i < 100; i++) {
    this.load.image("bg" + i, "images/background.png");
  }

  const precentText = this.add
    .text(320, 160, "", {
      font: "20px Open Sans",
      fill: "#ffffff",
    })
    .setOrigin(0.5, 0.5);

  this.load.on("progress", (value) => {
    precentText.setText(parseInt(value * 100) + "%");
  });

  this.load.on("complete", () => {
    precentText.destroy();
  });
};

scene.create = function () {
  // system
  const sysWidth = this.sys.game.config.width;
  const sysHeight = this.sys.game.config.height;
  this.keyboard = this.input.keyboard.createCursorKeys();

  // player
  this.player = this.add.sprite(100, 50, "player").setInteractive();
  this.input.setDraggable(this.player);
  this.player.displayWidth = 92;
  this.player.displayHeight = 128;
  this.player.width = 92;
  this.player.height = 128;
  console.log(this.player);
  this.player.depth = 1;
  this.physics.add.existing(this.player);

  this.ground = this.add.sprite(0, sysHeight, "tile");
  this.ground.setOrigin(0, 0);
  this.ground.width = sysWidth;
  this.physics.add.existing(this.ground, true);
  this.physics.add.collider(this.player, this.ground);

  // text
  this.text = this.add.text(12, 12, `使用方向鍵操作`, {
    font: "20px Open Sans",
    fill: "#000000",
  });
  this.text.depth = 2;

//   // drag
//   this.input.on("drag", function (pointer, gameObj, dragX, dragY) {
//     gameObj.x = dragX;
//     gameObj.y = dragY;
//   });

  // anims
  this.anims.create({
    key: "stand",
    frames: this.anims.generateFrameNumbers("player", {
      start: 0,
      end: 0,
    }),
    frameRate: 1,
    repeat: -1,
  });

  this.anims.create({
    key: "crouch",
    frames: this.anims.generateFrameNumbers("player", {
      start: 3,
      end: 3,
    }),
    frameRate: 1,
    repeat: -1,
  });

  this.anims.create({
    key: "slide",
    frames: this.anims.generateFrameNumbers("player", {
      start: 10,
      end: 10,
    }),
    frameRate: 1,
    repeat: -1,
  });

  this.anims.create({
    key: "slideAtSpace",
    frames: this.anims.generateFrameNumbers("player", {
      start: 19,
      end: 19,
    }),
    frameRate: 1,
    repeat: -1,
  });

  this.anims.create({
    key: "atSpace",
    frames: this.anims.generateFrameNumbers("player", {
      start: 8,
      end: 8,
    }),
    frameRate: 1,
    repeat: -1,
  });

  this.anims.create({
    key: "walk",
    frames: this.anims.generateFrameNumbers("player", {
      start: 36,
      end: 43,
    }),
    frameRate: 25,
    repeat: -1,
  });

  // zombie
  this.zombie = this.add.sprite(500, 100, "zombie");
  this.zombie.depth = 1;

  // background
  this.background = this.add.sprite(0, 0, "bg");
  this.background.setPosition(sysWidth / 2, sysHeight / 2);
  this.background.depth = 0;
};

scene.update = function () {
  // this.cameras.main.shake(500)
  const enableMoveModule = true
  const enableBoundModule = false


  /** Move Module */
  if(enableMoveModule){
    const pressUp = this.keyboard.up.isDown;
    const pressDown = this.keyboard.down.isDown;
    const pressLeft = this.keyboard.left.isDown;
    const pressRight = this.keyboard.right.isDown;
    const onTheGround = this.player.body.blocked.down;

    if (pressUp) {
        // this.player.y -= this.playerSpeed
        if (onTheGround) { this.player.anims.play("stand", true); this.player.body.setVelocityY(this.playerJumpHeight); }
        if (!onTheGround) { this.player.anims.play("atSpace", true);}
        if (pressLeft) { this.player.flipX = true; this.player.x -= this.playerSpeed;}
        else if (pressRight) { this.player.flipX = false; this.player.x += this.playerSpeed; }

    } else if (pressDown) {
        // this.player.y += this.playerSpeed

        // this.player.anims.play('crouch', true)

        if (onTheGround && pressLeft) {
            this.player.flipX = true;
            this.player.x -= (this.playerSpeed + this.playerBoostSpeed);
            this.player.anims.play("slide", true);
        } else if (onTheGround && pressRight) {
            this.player.flipX = false;
            this.player.x += (this.playerSpeed + this.playerBoostSpeed);
            this.player.anims.play("slide", true);
        } else if (!onTheGround && pressLeft) {
            this.player.flipX = true;
            this.player.x -= this.playerSpeed;
            this.player.y += this.playerFallingBoostSpeed
            this.player.anims.play("slideAtSpace", true);
        } else if (!onTheGround && pressRight) {
            this.player.flipX = false;
            this.player.x += this.playerSpeed;
            this.player.y += this.playerFallingBoostSpeed
            this.player.anims.play("slideAtSpace", true);
        } else if ( onTheGround && !pressLeft && !pressRight ) {
            this.player.anims.play("crouch", true)
        } else if ( !onTheGround && !pressLeft && !pressRight ) {
            // this.cameras.main.shake(20)
            this.player.y += this.playerFallingBoostSpeed
            this.player.anims.play("crouch", true)
        }
        

    } else if (pressRight) {
        this.player.flipX = false;
        this.player.x += this.playerSpeed;

        this.player.anims.play("walk", true);
    } else if (pressLeft) {
        this.player.flipX = true;
        this.player.x -= this.playerSpeed;

        this.player.anims.play("walk", true);
    } else {
        /** default */
        this.player.anims.play("stand", true);
        this.player.anims.stop();
    }
  }

  /** Bound Module */
  if(enableBoundModule){
      const playerRect = this.player.getBounds();
      const zombieRect = this.zombie.getBounds();
    
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, zombieRect)) {
        this.cameras.main.shake(500);
    
        this.cameras.main.on("camerashakecomplete", () => {
          this.cameras.main.fade(2000);
        });
    
        this.cameras.main.on("camerafadeoutcomplete", () => {
          this.scene.restart();
        });
      }
  }
};
