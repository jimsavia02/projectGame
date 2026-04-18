import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc"
import { makeBox } from "../entities/Box";
import { manaBar } from "../ui/manaBar";
import { makeDoor } from "../entities/door"
import { makeSwitch } from "../entities/switch";

export function room3(k,room3Data,previousSceneData) {
   
   k.camScale(3),
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
            // Set respawn position
            state.set("currentRoom", "room3");
            state.set("respawnPos", { x: position.x, y: position.y });
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

    if (position.name === "Tree") {

            const Tree = k.add(
                makeBox(k, k.vec2(position.x, position.y))
            );
            continue;
        }

    // --- โค้ดเดิมของคุณที่มีอยู่แล้ว ---
    if (
    position.name === "entrance-3" &&
        previousSceneData?.exitName === "exit-3"
        ) {
        player.setPosition(position.x, position.y);
        player.setControl();
        // Set respawn position
        state.set("currentRoom", "room3");
        state.set("respawnPos", { x: position.x, y: position.y });
        continue;
        }

    if (previousSceneData?.exitName === "respawn" && previousSceneData?.respawnPos) {
        player.setPosition(previousSceneData.respawnPos.x, previousSceneData.respawnPos.y);
        // Reset player state
        player.vel = k.vec2(0, 0);
        player.play("idle");
        player.flipX = false;
        player.isAttacking = false;
        player.disableControls();
        player.setControl();
        // Update respawn position and health
        state.set("playerHp", state.current().maxPlayerHp);
        healthBar.trigger("update");
        k.camPos(player.pos);
        continue;
    }
    if (position.name === "npc") {
    makeNPC(
        k,
        player,
        position.x,
        position.y,
        [
            "Jimmy : Hmm… where am I?, I remember I was sleeping in my room…",
            "Nara : Oh, hello. My name is Nara.",
            "Nara : This place is called the City of Slumber.",
            "Nara : Try walking around and exploring first."
        ]
    );
    continue;
}
    if (position.name === "door") {
                // สร้าง object ประตูขึ้นมา
                const door = makeDoor(k, k.vec2(position.x, position.y));
                
                // แอดเข้าไปในฉาก (หรือ map.add(door) ถ้าต้องการให้ยึดกับ map)
                k.add(door); 
                
                continue;
            }
    if (position.name === "switch") {
                        // รอให้ Loop ทำงานไปเรื่อยๆ จนเจอ door ก่อน หรือใช้ k.onUpdate
                        // แต่ทางที่ปลอดภัยที่สุดคือสร้าง Switch หลังจาก Loop ประตูเสร็จ
                        // หรือเขียนแบบนี้:
                    
                            k.add(makeSwitch(k, k.vec2(position.x, position.y)));
                      
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

   manaBar.setEvents();
   k.add(manaBar);
   manaBar.trigger("update");


       k.onSceneLeave(() => {
    if (player.walkSound) {
        player.walkSound.stop();
        player.walkSound = null;
        }
    });
}