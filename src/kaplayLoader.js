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
k.loadSprite("player", "./assets/sprites/jim.png", {
    sliceX: 28,
    sliceY: 1,
        anims: {
        idle: { from: 0, to: 10, loop: true, },
        run:  { from: 11, to: 21, loop: true,},
        jump: { from: 22, to: 27, loop: true,},
        fall: { from: 0, to: 0, loop: true, }, 
        explode: { from: 0, to: 0, loop: true, },
        attack: { from: 0, to: 0, loop: true, speed: 16 },
    }
});

k.loadSprite("drone1","./assets/sprites/covid001.png", 
    {sliceX: 4,
        sliceY:4,
        anims: {
            flying :{ from: 4, to:10, loop:true,},
            attack :{ from: 4, to: 10, loop:true,},
            explode :{ from: 11, to:14,loop:false},
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

k.loadSpriteAtlas("./assets/ui.png", {
  healthBar: {
    x: 16,
    y: 16,
    width: 60,
    height: 48,
    sliceY: 3,
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

k.loadSprite("fireball","assets/sprites/dr0ne.png",{
  sliceX: 6,
  sliceY:3,
  anims: {
    cast: {from: 10,to:15,loop:true},
  },
});

k.loadSprite("npc","./assets/sprites/npc.png", 
    {sliceX:8,
        sliceY:1,
        anims: {
    idle: { from: 0, to: 7, loop: true },
    walk: { from: 0,to: 7, loop:true},
  }
     });


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


