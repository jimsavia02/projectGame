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
        dash: { from: 70, to:85, loop:false,},
        cast: {from:90,to:109, loop:false,speed: 20},
    }
});

k.loadSprite("drone1","./assets/sprites/Soldier.png", 
    {sliceX: 9,
        sliceY:7,
        anims: {
            idle :{ from: 0, to:5, loop:true,},
            walk :{ from: 9,to: 16, loop:true},
            run:{ from :9, to: 16, loop:true},
            attack :{ from: 18, to: 23, loop:false,},
            attack2 :{ from: 27, to: 32, loop:false,},
            attack3 :{ from: 37, to: 45, loop:false,speed:10},
            hurt:{ from: 46,to:48, loop:false ,},
            explode :{ from: 54, to:57,loop:false},
    }});
k.loadSprite("arrow","./assets/sprites/arrow.png",{
  sliceX: 1,
  sliceY:1,
  anims: {
    projectile: {from: 0,to:0,loop:true},
  },
});

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
    width: 191,
    height: 320,
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
    width: 191,
    height: 448,
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

k.loadSprite("npc","./assets/sprites/Orc.png", 
    {sliceX:8,
        sliceY:6,
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
k.loadSprite("door","./assets/door.png"),{
  sliceX:1,
  sliceY:1,
  anims:{
    idle: { from:0,to : 0, loop:true},
    explode: { from: 0, to: 0 },
  }
}

k.loadSprite("switch","./assets/switch.png",{
  sliceX:2,
  sliceY:1,
  anims:{
    idle: { from:0,to:0,},
    active: { from: 1,to:1,},
  }
});

k.loadSprite("key","./assets/key.png",{
  sliceX: 1,
  sliceY:1,
  anims: {
    projectile: {from: 0,to:0,loop:true},
  },
});

k.loadSprite("boss", "assets/sprites/boss.png", {
    sliceX: 8, // คอลัมน์ (นับแนวนอน)
    sliceY: 8, // แถว (นับแนวตั้ง - รูปนี้มี 8 แถว)

    anims: {
        // แถวที่ 1: Idle
        idle: { from: 0, to: 7, loop: true, speed: 8 },
        // แถวที่ 2: Walk
        walk: { from: 8, to: 15, loop: true, speed: 10 },
        // แถวที่ 3: Attack
        attack: { from: 16, to: 23, loop: false, speed: 12 },
        // แถวที่ 4-5: การร่ายเวทย์และการกลายร่าง (ในรูปคือเฟรม 24-39)
        cast: { from: 24, to: 31, loop: false, speed: 10 },
        // แถวที่ 6: ท่าเตรียมร่าย (ยกมือ)
        prepare: { from: 40, to: 47, loop: false, speed: 10 },
        // แถวที่ 5: Death (การสลายตัว) - ตามรูปจริงน่าจะเริ่มที่เฟรม 32 หรือแถวที่ 5
        death: { from: 32, to: 39, loop: false, speed: 8 },
    },
});
k.loadSprite("spell_vortex", "assets/sprites/boss.png", {
    sliceX: 8,
    sliceY: 8,
    anims: {
        // แถว 7: วงเวทย์ม่วงๆ ที่พื้น (Vortex)
        vortex: { from: 48, to: 51, loop: true, speed: 10 }, 
        // แถว 7-8: เวทย์ตกลงมาหรือระเบิดขึ้น (Fall/Explosion)
        fall: { from: 52, to: 63, loop: false, speed: 15 },
    },
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
k.loadSprite("room5", "maps/room5.png");
k.loadJSON("room5Data", "maps/room5.json");


