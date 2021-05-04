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
  width: 800,
  height: 450,
  scene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: true,
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
  this.load.spritesheet(
    "player",
    "images/characters/Zombie/Tilesheet/character_zombie_sheetHD.png",
    { frameWidth: 192, frameHeight: 256 }
  );
  this.load.image("bg1", "images/background/plx-1.png");
  this.load.image("bg2", "images/background/plx-2.png");
  this.load.image("bg3", "images/background/plx-3.png");
  this.load.image("bg4", "images/background/plx-4.png");
  this.load.image("bg5", "images/background/plx-5.png");
  this.load.image("ground", "images/background/ground.png");
  this.load.audio("intro", ["./audio/forest.wav"]);

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

  // background
  this.bg1 = this.add.tileSprite(
    sysWidth / 2,
    sysHeight / 2,
    sysWidth,
    sysHeight,
    "bg1"
  );
  this.bg2 = this.add.tileSprite(
    sysWidth / 2,
    sysHeight / 2,
    sysWidth,
    sysHeight,
    "bg2"
  );
  this.bg3 = this.add.tileSprite(
    sysWidth / 2,
    sysHeight / 2,
    sysWidth,
    sysHeight,
    "bg3"
  );
  this.bg4 = this.add.tileSprite(
    sysWidth / 2,
    sysHeight / 2,
    sysWidth,
    sysHeight,
    "bg4"
  );
  this.bg5 = this.add.tileSprite(
    sysWidth / 2,
    sysHeight / 2,
    sysWidth,
    sysHeight,
    "bg5"
  );
  this.ground = this.add.tileSprite(
    sysWidth / 2,
    sysHeight * 0.98,
    sysWidth,
    sysHeight * 0.4,
    "ground"
  );
  this.physics.add.existing(this.ground, true);
  this.ground.body.immovable = true;
  this.ground.body.moves = false;

  // player
  this.player = this.add.sprite(200, 50, "player").setInteractive();
  this.input.setDraggable(this.player);
  this.player.displayWidth = 92;
  this.player.displayHeight = 128;
  this.player.width = 92;
  this.player.height = 128;
  this.player.depth = 1;
  this.physics.add.existing(this.player);

  this.physics.add.collider(this.player, this.ground);

  // text
  this.text = this.add.text(12, 12, `使用方向鍵操作`, {
    font: "20px Open Sans",
    fill: "#000000",
  });
  this.text.depth = 2;

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
    key: "jump",
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
};

scene.update = function () {
  // this.cameras.main.shake(500)
  const enableBackgroundMoving = true;
  const enableMoveModule = true;
  const enableBoundModule = false;

  const pressUp = this.keyboard.up.isDown;
  const pressDown = this.keyboard.down.isDown;
  const pressLeft = this.keyboard.left.isDown;
  const pressRight = this.keyboard.right.isDown;
  const onTheGround = this.player.body.blocked.down;

  const defaultBackgroundParallaxLevel = {
    bg1: 0,
    bg2: 0.9,
    bg3: 1.8,
    bg4: 3,
    bg5: 4.5,
    ground: 4.5,
  };

  /** Background Module */
  if (enableBackgroundMoving) {
    const backgroundParallaxLevel = JSON.parse(
      JSON.stringify(defaultBackgroundParallaxLevel)
    );

    if (pressDown && (pressLeft || pressRight)) {
      backgroundParallaxLevel["bg1"] = 0;
      backgroundParallaxLevel["bg2"] = 2.9;
      backgroundParallaxLevel["bg3"] = 3.8;
      backgroundParallaxLevel["bg4"] = 5;
      backgroundParallaxLevel["bg5"] = 6.5;
      backgroundParallaxLevel["ground"] = 6.5;
    }

    if (pressRight) {
      this.bg1.tilePositionX += backgroundParallaxLevel["bg1"];
      this.bg2.tilePositionX += backgroundParallaxLevel["bg2"];
      this.bg3.tilePositionX += backgroundParallaxLevel["bg3"];
      this.bg4.tilePositionX += backgroundParallaxLevel["bg4"];
      this.bg5.tilePositionX += backgroundParallaxLevel["bg5"];
      this.ground.tilePositionX += backgroundParallaxLevel["ground"];
    }
    if (pressLeft) {
      this.bg1.tilePositionX -= backgroundParallaxLevel["bg1"];
      this.bg2.tilePositionX -= backgroundParallaxLevel["bg2"];
      this.bg3.tilePositionX -= backgroundParallaxLevel["bg3"];
      this.bg4.tilePositionX -= backgroundParallaxLevel["bg4"];
      this.bg5.tilePositionX -= backgroundParallaxLevel["bg5"];
      this.ground.tilePositionX -= backgroundParallaxLevel["ground"];
    }
  }

  /** Move Module */
  if (enableMoveModule) {
    if (pressUp) {
      if (onTheGround) {
        this.player.anims.play("stand", true);
        this.player.body.setVelocityY(this.playerJumpHeight);
      }
      if (!onTheGround) {
        this.player.anims.play("jump", true);
      }
      if (pressLeft) {
        this.player.flipX = true;
      } else if (pressRight) {
        this.player.flipX = false;
      }
    } else if (pressDown) {
      if (onTheGround && pressLeft) {
        this.player.flipX = true;
        // this.player.x -= this.playerSpeed + this.playerBoostSpeed;
        this.player.anims.play("slide", true);
      } else if (onTheGround && pressRight) {
        this.player.flipX = false;
        // this.player.x += this.playerSpeed + this.playerBoostSpeed;
        this.player.anims.play("slide", true);
      } else if (!onTheGround && pressLeft) {
        this.player.flipX = true;
        // this.player.x -= this.playerSpeed;
        this.player.y += this.playerFallingBoostSpeed;
        this.player.anims.play("slideAtSpace", true);
      } else if (!onTheGround && pressRight) {
        this.player.flipX = false;
        // this.player.x += this.playerSpeed;
        this.player.y += this.playerFallingBoostSpeed;
        this.player.anims.play("slideAtSpace", true);
      } else if (onTheGround && !pressLeft && !pressRight) {
        this.player.anims.play("crouch", true);
      } else if (!onTheGround && !pressLeft && !pressRight) {
        // this.cameras.main.shake(20)
        this.player.y += this.playerFallingBoostSpeed;
        this.player.anims.play("crouch", true);
      }
    } else if (pressRight) {
      this.player.flipX = false;
      // this.player.x += this.playerSpeed;

      this.player.anims.play("walk", true);
    } else if (pressLeft) {
      this.player.flipX = true;
      // this.player.x -= this.playerSpeed;

      this.player.anims.play("walk", true);
    } else {
      /** default */
      this.player.anims.play("stand", true);
      this.player.anims.stop();
    }
  }

  /** Bound Module */
  if (enableBoundModule) {
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
