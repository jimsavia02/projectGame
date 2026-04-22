import { state, statePropsEnum } from "../state/globalState";

export function setBackgroundImage(k,spriteName){

    k.add([
        k.sprite(spriteName),
        k.pos(0, 0),
              // 🔥 สำคัญ ไม่ให้ขยับตามกล้อง
        k.z(-100),          // 🔥 ให้ลึกสุด
        
    ]);

}


export function setMapColliders(k,map, colliders){
    for (const collider of colliders){
        if(collider.polygon){
            const coordinates =[]
            for (const point of collider.polygon){
                coordinates.push(k.vec2(point.x,point.y));
            }
            map.add([
              k.pos(collider.x, collider.y),
              k.area({
              shape: new k.Polygon(coordinates),
              }),
            k.body({ isStatic: true }), // ถ้าอยากให้ block
            "collider",
            collider.type,
            ]);
            continue;
        }

        
    if (collider.name === "event-area1" || collider.name === "event-area2") {
      const eventArea = map.add([
        k.pos(collider.x, collider.y),
        k.area({
          shape: new k.Rect(k.vec2(0), collider.width, collider.height),
        }),
        collider.name,
      ]);

      if (collider.name === "event-area1") {
        eventArea.onCollide("player", async (player) => {
        if (!player.canControl) return;

        // 1. หยุดตัวละครทันที
        player.disableControl();
        player.play("idle"); // เปลี่ยนจาก "run" เป็น "idle" เพื่อให้หยุดยืนนิ่งๆ

        // 2. สร้าง Alert บนหัว
        const alertIcon = k.add([
          k.sprite("alert"),
          k.pos(player.pos.x, player.pos.y - 50),
          k.anchor("center"),
          k.scale(1),
          k.z(100), // ให้อยู่ข้างหน้าสุด
        ]);

        // ให้ Alert ขยับตามหัว Player (เผื่อตัวละครขยับจากแรงเฉื่อย)
        const updateAlert = k.onUpdate(() => {
          alertIcon.pos = k.vec2(player.pos.x, player.pos.y - 60);
        });

        // เล่นเสียงแจ้งเตือน (ถ้าต้องการ)
        // k.play("notify", { volume: 0.5 });

        // 3. หยุดรอ 2 วินาทีให้ผู้เล่นเห็น Alert
        await k.wait(2);

        // 4. ลบ Alert และตัวอัปเดตตำแหน่งออก
        updateAlert.cancel();
        k.destroy(alertIcon);

        // 5. เริ่มบังคับเดิน (เปลี่ยนเป็นท่าวิ่ง)
        player.play("run");
        const targetX = player.pos.x + 200; 

        await k.tween(
          player.pos.x,
          targetX,
          1.2, 
          (val) => (player.pos.x = val),
          k.easings.linear
        );

        // 6. เมื่อถึงจุดหมาย ให้หยุดนิ่งและเริ่มคุย
        player.play("idle");
        k.get("npc")[0]?.trigger("start-dialog");

        // 7. ทำลายพื้นที่ event
        k.destroy(eventArea);
      });
      } 
      // eventArea2 is just a trigger collider, no special handling needed
      continue;
    }
          if (collider.name === "boss-barrier") {
      const bossBarrier = map.add([
        k.rect(collider.width, collider.height),
        k.color("#eacfba"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.opacity(0),
        "boss-barrier",
        {
          activate() {
            k.tween(
              this.opacity,
              0.3,
              1,
              (val) => (this.opacity = val),
              k.easings.linear
            );

            k.tween(
              k.camPos().x,
              collider.properties[0].value,
              1,
              (val) => k.camPos(val, k.camPos().y),
              k.easings.linear
            );
          },
          async deactivate(playerPosX) {
            k.tween(
              this.opacity,
              0,
              1,
              (val) => (this.opacity = val),
              k.easings.linear
            );
            await k.tween(
              k.camPos().x,
              playerPosX,
              1,
              (val) => k.camPos(val, k.camPos().y),
              k.easings.linear
            );
            k.destroy(this);
          },
        },
      ]);

     bossBarrier.onCollide("player", async (player) => {

  const currentState = state.current();

  if (currentState.isBossDefeated) {
    state.set(statePropsEnum.playerInBossFight, false);
    bossBarrier.deactivate(player.pos.x);
    return;
  }

  if (currentState.playerInBossFight) return;

  state.set(statePropsEnum.playerInBossFight, true);

  // 🔥 ใส่ตรงนี้
  player.play("idle");

  await k.tween(
    player.pos.x,
    player.pos.x + 25,
    0.2,
    (val) => (player.pos.x = val),
    k.easings.linear
  );

  bossBarrier.activate();
  bossBarrier.use(k.body({ isStatic: true }));
});

      continue;
    }

    if (collider.name === "barrier") {
      const barrier = k.add([
        k.rect(collider.width, collider.height),
        k.color("#ff6b6b"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.body({ isStatic: true }),
        k.opacity(0.5),
        "barrier",
        collider.name,
      ]);
      continue;
    }

        if (collider.name === "barrier2") {
      const barrier = k.add([
        k.rect(collider.width, collider.height),
        k.color("#ff6b6b"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.body({ isStatic: true }),
        k.opacity(0.5),
        "barrier2",
        collider.name,
      ]);
      continue;
    }

    if (collider.name === "barrier3") {
      const barrier3 = k.add([
        k.rect(collider.width, collider.height),
        k.color("#4a4a4a"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.body({ isStatic: true }),
        k.opacity(0.8),
        "barrier3",
        collider.name,
      ]);
      continue;
    }

    if (collider.name === "barrier4") {
      const barrier4 = k.add([
        k.rect(collider.width, collider.height),
        k.color("#6b4226"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.body({ isStatic: true }),
        k.opacity(0.8),
        "barrier4",
        collider.name,
      ]);
      continue;
    }

        if (collider.name === "barrier5") {
      const barrier5 = k.add([
        k.rect(collider.width, collider.height),
        k.color("#6b4226"),
        k.pos(collider.x, collider.y),
        k.area({
          collisionIgnore: ["collider"],
        }),
        k.body({ isStatic: true }),
        k.opacity(0.8),
        "barrier5",
        collider.name,
      ]);
      continue;
    }

        map.add([
  k.pos(collider.x, collider.y),
  k.area({
    shape: new k.Rect(
      k.vec2(0, 0),
      collider.width,
      collider.height
    ),
  }),
  k.body({ isStatic: true }),
  "collider",
])
    }
}

export function setCameraControls(k, player, map, roomData) {

  const mapWidth = map.width;
  const mapHeight = map.height;

  k.onUpdate(() => {

    if (state.current().playerInBossFight) return;

    // ขนาดหน้าจอจริง (หลัง camScale)
    const viewWidth = k.width() / k.camScale().x;
    const viewHeight = k.height() / k.camScale().y;

    const halfW = viewWidth / 2;
    const halfH = viewHeight / 2;

    let camX = player.pos.x;
    let camY = player.pos.y;

    // ---- Clamp ซ้าย ----
    camX = Math.max(camX, map.pos.x + halfW);

    // ---- Clamp ขวา ----
    camX = Math.min(camX, map.pos.x + mapWidth - halfW);

    // ---- Clamp บน ----
    camY = Math.max(camY, map.pos.y + halfH);

    // ---- Clamp ล่าง ----
    camY = Math.min(camY, map.pos.y + mapHeight - halfH);

    k.camPos(camX, camY);

  });
}


export function setCameraZones(k, map, cameras) {
  for (const camera of cameras) {
    const cameraZone = map.add([
      k.area({
        shape: new k.Rect(k.vec2(0), camera.width, camera.height),
        collisionIgnore: ["collider"],
      }),
      k.pos(camera.x, camera.y),
    ]);

cameraZone.onCollide("player", () => {

  const targetY = camera.properties[0].value;

  if (k.camPos().y === targetY) return;

  k.tween(
    k.camPos().y,
    targetY,
    0.8,
    (val) => k.camPos(k.camPos().x, val),
    k.easings.linear
  );
});

  }
}

export function setExitZones(k,map,exits,){
  for(const exit of exits){
    const exitZone = map.add([k.pos(exit.x,exit.y),
      k.pos(exit.x, exit.y),
      k.area({
        shape: new k.Rect(k.vec2(0), exit.width, exit.height),
        collisionIgnore: ["collider"],
      }),
      k.body({ isStatic: true }),
      exit.name,
    ]);

        exitZone.onCollide("player", async () => {
      const background = k.add([
        k.pos(-k.width(), 0),
        k.rect(k.width(), k.height()),
        k.color("#20214a"),
      ]);

      await k.tween(
        background.pos.x,
        0,
        0.3,
        (val) => (background.pos.x = val),
        k.easings.linear
      );

      if (exit.name === "final-exit") {
        k.go("final-exit");
        return;
      }

      const targetRoom = exit.name.replace("exit-", "room");
  
k.go(targetRoom, {
  exitName: exit.name,
});
    });

  }
}

export function checkEnemiesAndRemoveBarrier(k, requiredEnemiesDefeated = 2) {
  let barrierRemoved = false;
  
  k.onUpdate(() => {
    if (barrierRemoved) return;
    
    const enemies = k.get("enemy1");
    
    // ถ้า enemies ที่เหลือน้อยกว่าจำนวนที่ต้องจัดการ แสดงว่าจัดการครบแล้ว
    if (enemies.length < requiredEnemiesDefeated) {
      barrierRemoved = true;
      const barriers = k.get("barrier");
      
      for (const barrier of barriers) {
        if (barrier.exists()) {
          k.tween(
            barrier.opacity,
            0,
            0.5,
            (val) => (barrier.opacity = val),
            k.easings.linear
          );
          k.wait(0.5, () => {
            if (barrier.exists()) {
              barrier.unuse(k.body());
              k.destroy(barrier);
            }
          });
        }
      }
    }
  });
}

// ✅ ฟังก์ชันตรวจสอบการพ่ายแพ้ของ enemy2 และทำลาย barrier3
export function checkEnemy2AndRemoveBarrier3(k) {
  let barrier3Removed = false;
  
  k.onUpdate(() => {
    if (barrier3Removed) return;
    
    const enemies2 = k.get("enemy2");
    
    // ถ้า enemy2 ตายแล้ว ให้ลบ barrier3
    if (enemies2.length > 0 && enemies2[0].isDead) {
      barrier3Removed = true;
      const barriers3 = k.get("barrier3");
      
      for (const barrier of barriers3) {
        if (barrier.exists()) {
          k.tween(
            barrier.opacity,
            0,
            0.5,
            (val) => (barrier.opacity = val),
            k.easings.linear
          );
          k.wait(0.5, () => {
            if (barrier.exists()) {
              barrier.unuse(k.body());
              k.destroy(barrier);
            }
          });
        }
      }
    }
  });
}

// ✅ ฟังก์ชันเพื่อลบ barrier4 หลังจากนำ key มาให้ NPC2
export function checkBarrier4AndRemoveAfterKeyReceived(k) {
  let barrier4Removed = false;
  
  return function destroyBarrier4() {
    if (barrier4Removed) return;
    barrier4Removed = true;
    
    const barriers4 = k.get("barrier4");
    
    for (const barrier of barriers4) {
      if (barrier.exists()) {
        k.tween(
          barrier.opacity,
          0,
          0.5,
          (val) => (barrier.opacity = val),
          k.easings.linear
        );
        k.wait(0.5, () => {
          if (barrier.exists()) {
            barrier.unuse(k.body());
            k.destroy(barrier);
          }
        });
      }
    }
  };
}

export function checkEnemy2AndRemoveBarrier5(k) {
  let barrier5Removed = false;
  
  k.onUpdate(() => {
    if (barrier5Removed) return;
    
    const enemies2 = k.get("enemy2");
    
    // ถ้า enemy2 ตายแล้ว ให้ลบ barrier5
    if (enemies2.length > 0 && enemies2[0].isDead) {
      barrier5Removed = true;
      const barriers5 = k.get("barrier5");
      
      for (const barrier of barriers5) {
        if (barrier.exists()) {
          k.tween(
            barrier.opacity,
            0,
            0.5,
            (val) => (barrier.opacity = val),
            k.easings.linear
          );
          k.wait(0.5, () => {
            if (barrier.exists()) {
              barrier.unuse(k.body());
              k.destroy(barrier);
            }
          });
        }
      }
    }
  });
}
