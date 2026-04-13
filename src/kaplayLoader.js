import kaplay from "kaplay"

export const scale = 2

export const k = kaplay({
    width: 640 * scale,
    height: 360 * scale,
    letterbox: true,
    global: false,
     mouse: true,
     background: [30, 30, 30]
    
})

// โหลด asset ตรงนี้
k.loadSprite("player", "./assets/sprites/red.png", {
    sliceX: 10,
    sliceY: 11,
        anims: {
        idle: { from: 0, to: 5, loop: true, },
        run:  { from: 10, to: 17, loop: true,},
        jump: { from: 40, to: 45, loop: true,},
        fall: { from: 50, to: 56, loop: true, }, 
        explode: { from: 60, to: 69, loop: true, },
        attack: { from: 30, to: 36, loop: false, speed: 16 },
        dash: { from: 70, to:85, loop:true,},
        cast: {from:90,to:109, loop:false,speed: 20},
    }
});

k.loadSprite("drone1","./assets/sprites/SkeletonUN.png", 
    {sliceX: 6,
        sliceY:5,
        anims: {
            idle :{ from: 0, to:5, loop:true,},
            walk :{ from: 6,to: 11, loop:true},
            run:{ from :12, to: 17, loop:true},
            attack :{ from: 18, to: 23, loop:false,},
            hurt:{ from: 24,to:25, loop:true ,speed: 1},
            explode :{ from: 24, to:25,loop:false},
    }});

k.loadSprite("burner", "./assets/sprites/burn3r.png", {
  sliceX: 5,
  sliceY: 6,
  anims: {
    idle: { from: 0, to: 3, loop: true },
    run: { from: 6, to: 8, loop: true },
    "open-fire": { from: 10, to: 14 },
    fire: { from: 15, to: 18, loop: true },
    "shut-fire": { from: 20, to: 23 },
    explode: { from: 25, to: 29 },
  },
});

k.loadSpriteAtlas("./assets/healthbarui2.png", {
  healthBar: {
    x: 0,
    y: 0,
    width: 96,
    height: 240,
    sliceY: 5,  
  },
});
    
k.loadSpriteAtlas("assets/animations.png", {
  cartridge: {
    x: 125,
    y: 145,
    width: 134,
    height: 16,
    sliceX: 8,
    anims: {
      default: { from: 0, to: 4, loop: true, speed: 7 },
    },
  },
});

k.loadSpriteAtlas("./assets/manaUi.png", {
  manaBar: {
    x: 0,
    y: 0,
    width: 96,
    height: 336,
    sliceY: 7,
  },
});

k.loadSprite("fireball","assets/sprites/dr0ne.png",{
  sliceX: 6,
  sliceY:3,
  anims: {
    cast: {from: 10,to:15,loop:true},
  },
});

k.loadSprite("npc","./assets/sprites/npc1.png", 
    {sliceX:6,
        sliceY:1,
        anims: {
    idle: { from: 0, to: 5, loop: true },
    walk: { from: 0,to: 5, loop:true},
  }
     });

k.loadSprite("Box","./assets/box.png",{
  sliceX:1,
  sliceY:1,
  anims:{
    idle: { from:0,to : 0, loop:true},
    explode: { from: 0, to: 1 },
  }
})


k.loadSprite("bgroom1", "assets/sprites/bts.png");

k.loadSprite("logo","assets/sprites/startmanu.png");
k.loadSprite("alert","assets/alert.png")



k.loadSound("boom", "assets/sounds/boom.wav");
k.loadSound("flamethrower", "assets/sounds/flamethrower.wav");
k.loadSound("notify","assets/sounds/notify.mp3");
k.loadSound("health","assets/sounds/health.wav");
k.loadSound("DystopianCity","assets/sounds/DystopianCity.mp3")
k.loadSound("playerWalk","assets/sounds/playerWalk.mp3")

k.loadSprite("doublejump-ui", "./assets/doubleJump.png")
k.loadFont("Zaslia","./assets/Zaslia.otf");
k.loadFont("FutureThor","./assets/FutureThor.ttf");
k.loadSprite("room1","./maps/room1.png");
k.loadSprite("room2","./maps/room2.png");
k.loadSprite("room3","./maps/room3.png");
k.loadSprite("room4","./maps/room4.png");


