import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc"

export function room3(k,room3Data,previousSceneData) {
   
   k.camScale(1.8),
   k.camPos(1280,720);
   k.setGravity(1000);
   

   const roomLayers = room3Data.layers;
   const map = k.add([k.pos(0,0), k.sprite("room3")]);

       const colliders = [];
       const positions = [];
       const cameras = [];  
       const exits = [];
      

   
       for (const layer of roomLayers) {
           if (layer.name === "cameras"){
               cameras.push(...layer.objects);
   
           }
   
           if (layer.name === "positions") {
               positions.push(...layer.objects);
           }

           if (layer.name === "exits"){
               exits.push(...layer.objects);
               continue;
           }
   
           if (layer.name === "colliders") {
               colliders.push(...layer.objects);
           }
           
           

       }

       

         setMapColliders(k, map, colliders);

         const player = k.add(makePlayer(k));
       player.play("idle"); 
       setCameraZones(k,map,cameras);
       setCameraControls(k,player,map, room3Data);
       setExitZones(k, map, exits, "room4");

           // ... (โค้ดส่วนบนอื่นๆ)

// ✅ 1. หาบรรทัดที่วนลูปตำแหน่ง (positions)
for (const position of positions) {

    // ✅ 2. เพิ่มเงื่อนไขนี้เข้าไปเป็นอันแรกในลูป
    // เพื่อดึงตัวละครไปที่จุด "player" หรือ "entrance-1" แม้จะไม่ได้วาร์ปมาจากห้องอื่น
    if (position.name === "player" ) {
        // ถ้าไม่มีข้อมูลการวาร์ปมา (เช่น มาจาก Intro) ให้ทำงานทันที
        if (!previousSceneData?.exitName) {
            player.setPosition(position.x, position.y);
            player.setControl(); // 🔥 บรรทัดนี้จะทำให้กดเดินได้
            continue; 
        }   
    }

    if (position.name === "enemy1") {

            const enemy1 = k.add(
                makeDrone(k, k.vec2(position.x, position.y))
            );

            enemy1.setBehavior();
            enemy1.setEvents();
            continue;
        }

    // --- โค้ดเดิมของคุณที่มีอยู่แล้ว ---
    if (
        position.name === "entrance-3" &&
        previousSceneData.exitName === "exit-3"
    ) {
        player.setPosition(position.x, position.y);
        player.setControl();
        continue;
    }
    if (position.name === "npc") {
    makeNPC(
        k,
        player,
        position.x,
        position.y,
        [
            "Hello. Nice to meet you. The weather is nice today",
            "Why don't you take a look around?"
        ],
        // ✅ Callback เมื่อคุยจบแล้ว
        (npc) => {
            // ✅ ปิดการพูดคุยเพิ่มเติม
            npc.allowTalk = false;
            
            // ✅ ล็อคการควบคุมของ player ก่อน
            player.disableControl();
            player.play("run");
            
            // ✅ เพิ่มเสียงเดิน
            if (player.walkSound) {
                player.walkSound.stop();
            }
            player.walkSound = k.play("playerWalk", { loop: true, volume: 1 });
            
            let isFollowing = true;
            let hasReachedBehindNPC = false;
            let hasPlayerArrivedAtArea2 = false;
            let followStartTime = Date.now();
            
            // ✅ ให้ player เดินตามหลัง NPC ไป
            const followNPC = k.onUpdate(() => {
                // ✅ Safety timeout: ถ้าผ่านไป 5 วินาที ให้บังคับตำแหน่ง
                const elapsedTime = (Date.now() - followStartTime) / 1000;
                if (elapsedTime > 5 && !hasPlayerArrivedAtArea2) {
                    // บังคับให้ player ไปที่ eventArea2
                    player.pos.x = 941;
                    player.pos.y = 475;
                    player.vel.x = 0;
                    player.vel.y = 0;
                    hasPlayerArrivedAtArea2 = true;
                    player.play("idle");
                    if (player.walkSound) {
                        player.walkSound.stop();
                        player.walkSound = null;
                    }
                }
                // ✅ Safety timeout: ถ้า NPC ยัง ไปไม่ถึง after 6 วินาที ให้เช็คว่า NPC บังคับไปยังตำแหน่ง
                if (elapsedTime > 6 && hasReachedBehindNPC && hasPlayerArrivedAtArea2) {
                    if (npc.pos.dist(k.vec2(1000, 475)) > 15) {
                        npc.pos.x = 1000;
                        npc.pos.y = 475;
                        npc.vel.x = 0;
                        npc.play("idle");
                    }
                }

                if (!isFollowing || hasPlayerArrivedAtArea2) return;
                
                // ✅ งานที่ 1: ให้ player เดินไปยังตำแหน่งด้านหลัง NPC (ระยะ 60 pixels)
                if (!hasReachedBehindNPC) {
                    const distToNPC = player.pos.dist(npc.pos);
                    
                    // คำนวณตำแหน่งด้านหลัง NPC
                    const behindDistance = 60;
                    const offsetX = npc.flipX ? behindDistance : -behindDistance;
                    const targetX = npc.pos.x + offsetX;
                    const targetY = npc.pos.y;
                    
                    const distToBehind = player.pos.dist(k.vec2(targetX, targetY));
                    
                    if (distToBehind < 15) {
                        // ถึงตำแหน่งด้านหลัง NPC แล้ว
                        hasReachedBehindNPC = true;
                        // เริ่มให้ NPC เดินไปยัง eventArea2 ผ่านไปสักนิด
                        npc.walkTo(1000, 475, 100, null);
                        return;
                    }
                    
                    // เดินไปยังตำแหน่งด้านหลัง
                    const angle = Math.atan2(targetY - player.pos.y, targetX - player.pos.x);
                    player.flipX = Math.cos(angle) < 0;
                    
                    const moveSpeed = 250; // ✅ เพิ่มความเร็ว เพื่อ bypass collisions
                    player.vel.x = Math.cos(angle) * moveSpeed;
                    
                } else {
                    // ✅ งานที่ 2: player เดินตามหลัง NPC ไปยัง eventArea2 (แล้วหยุด)
                    const targetPos = k.vec2(941, 475);
                    const targetDist = player.pos.dist(targetPos);
                    
                    if (targetDist < 15) {
                        // ถึง eventArea2 แล้ว - หยุดเดิน
                        hasPlayerArrivedAtArea2 = true;
                        player.pos.x = 941;
                        player.pos.y = 475;
                        player.vel.x = 0;
                        player.vel.y = 0;
                        player.play("idle");
                        if (player.walkSound) {
                            player.walkSound.stop();
                            player.walkSound = null;
                        }
                        isFollowing = false;
                        followNPC.cancel();
                        
                        // ✅ เพิ่ม safety interval เพื่อให้แน่ใจว่า animation ยังเป็น idle
                        const ensureIdleInterval = k.onUpdate(() => {
                            if (player.curAnim() !== "idle") {
                                player.play("idle");
                            }
                            if (player.vel.x !== 0) {
                                player.vel.x = 0;
                            }
                        });
                        
                        // ยกเลิก ensureIdleInterval หลังจาก 0.5 วินาที
                        k.wait(0.5, () => {
                            ensureIdleInterval.cancel();
                        });
                        
                        // เมื่อ player ถึง eventArea2 และ NPC ยังเดินต่อ ให้แสดง dialog ใหม่
                        let area2DialogIndex = 0;
                        const area2Dialogs = [
                            "Watch out! Monster is nearby!",
                            "Let me show you how we can defeat it"
                        ];
                        
                        const newDialogBox = k.add([
                            k.rect(k.width() - 400, 120, { radius: 8 }),
                            k.pos(k.center().x, k.height() - 100),
                            k.anchor("center"),
                            k.color(0, 0, 0),
                            k.outline(1, k.rgb(255, 255, 255)),
                            k.opacity(0.9),
                            k.fixed(),
                        ]);

                        const newContent = newDialogBox.add([
                            k.text(area2Dialogs[area2DialogIndex], { size: 24, width: k.width() - 450 }),
                            k.pos(0, 0),
                            k.anchor("center"),
                            k.color(255, 255, 255),
                        ]);

                        // ⚠️ ไม่ปลดล็อค player ที่นี่ เพราะ dialog ยังไม่จบ

                        // ให้กดปุ่ม E เพื่อเปลี่ยน dialog หรือปิด
                        let area2DialogClosed = false;
                        const closeDialogHandler = k.onKeyPress("e", () => {
                            if (area2DialogClosed) return;
                            
                            area2DialogIndex++;
                            
                            if (area2DialogIndex < area2Dialogs.length) {
                                // ยังมี dialog ต่ออีก
                                newContent.text = area2Dialogs[area2DialogIndex];
                            } else {
                                // Dialog จบแล้ว - NPC จะเดินเข้าไป attack enemy1
                                area2DialogClosed = true;
                                newDialogBox.opacity = 0;
                                closeDialogHandler.cancel();
                                k.destroy(newDialogBox);
                                
                                // ✅ Keep player control disabled ละให้เดิน
                                // player.disableControl(); // ✅ เรียบร้อยแล้ว
                                
                                // ✅ หา enemy1 position
                                
                                const enemies = k.get("enemy1");

if (enemies.length > 0) {
    // หา Drone ตัวที่อยู่ใกล้ NPC ที่สุด
    let closestEnemy = enemies[0];
    let minDist = npc.pos.dist(closestEnemy.pos);

    for (const e of enemies) {
        const d = npc.pos.dist(e.pos);
        if (d < minDist) {
            minDist = d;
            closestEnemy = e;
        }
    }

    // NPC เดินไปหาศัตรู (หยุดห่างจากศัตรู 40 pixel เพื่อโจมตี)
    const attackDist = 40;
    const targetX = closestEnemy.pos.x > npc.pos.x 
                    ? closestEnemy.pos.x - attackDist 
                    : closestEnemy.pos.x + attackDist;

    npc.walkTo(targetX, closestEnemy.pos.y, 180, () => {
        // หันหน้าไปหาศัตรูให้ถูกด้านก่อนตี
        npc.flipX = closestEnemy.pos.x < npc.pos.x;
        
        k.wait(0.2, () => {
            npc.attack();
            
            // หลังจากตีเสร็จ 0.5 วินาที ค่อยคืนการควบคุมให้ Player
            k.wait(0.5, () => {
                player.enableControl();
                // แถม: ให้ NPC พูดส่งท้ายสั้นๆ (ถ้าต้องการ)
                console.log("Mission Complete");
            });
        });
    });
} else {
    player.enableControl();
}
                            }
                        });
                        return;
                    }
                    
                    // ยังไม่ถึง eventArea2 ให้เดินตามหลัง NPC ต่อ
                    const behindDistance = 60;
                    const offsetX = npc.flipX ? behindDistance : -behindDistance;
                    const targetX = npc.pos.x + offsetX;
                    const targetY = npc.pos.y;
                    
                    const angle = Math.atan2(targetY - player.pos.y, targetX - player.pos.x);
                    player.flipX = Math.cos(angle) < 0;
                    
                    const moveSpeed = 150;
                    player.vel.x = Math.cos(angle) * moveSpeed;
                }
            });
        }
    );
    continue;
}

    
    // ... (เงื่อนไขอื่นๆ เช่น spawn boss หรือ drone)
    
    
}
    const bgm = k.play("DystopianCity", {
        volume: 0.5, // ปรับความดัง (0.0 ถึง 1.0)
        loop: true,   // ให้เล่นวนซ้ำไปเรื่อยๆ
    });

   healthBar.setEvents();
       healthBar.trigger("update");
       k.add(healthBar);

       k.onSceneLeave(() => {
    if (player.walkSound) {
        player.walkSound.stop();
        player.walkSound = null;
    }
});


}