import { makeBoss } from "../entities/Boss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc"
import { makeDoor } from "../entities/door"
import { makeSwitch } from "../entities/switch";
import { makeDoor2 } from "../entities/door2";
import { makeBox } from "../entities/Box";

export function room4(k,room4Data,previousSceneData) {
   
   k.camScale(1.8),
   k.camPos(1280,720);
   k.setGravity(1000);
   

   const roomLayers = room4Data.layers;
   const map = k.add([k.pos(0,0), k.sprite("room4")]);

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
       setCameraControls(k,player,map, room4Data);
       setExitZones(k, map, exits, "room3");

           // ... (โค้ดส่วนบนอื่นๆ)

// ✅ 1. หาบรรทัดที่วนลูปตำแหน่ง (positions)
let spawned = false;

for (const position of positions) {

  console.log("🔥 positions:", positions);
  console.log("👉 exitName:", previousSceneData?.exitName);

  if (position.name === "player" && !previousSceneData?.exitName) {
    player.setPosition(position.x, position.y);
    player.setControl();
    spawned = true;
    continue;
  }

  if (
    position.name.includes("entrance-4") &&
    previousSceneData?.exitName === "exit-4"
  ) {
    console.log("✅ เข้า entrance-4 แล้ว");

    player.setPosition(position.x, position.y + 20);
    player.setControl();
    spawned = true;
    continue;
  }

  if (
    position.name.includes("entrance-4") &&
    previousSceneData?.exitName?.includes("exit-4")
  ) {
    console.log("✅ spawn entrance-4");
    player.setPosition(position.x, position.y + 20);
    player.setControl();
    spawned = true;
    continue;
  }
  if (position.name === "door") {
            // สร้าง object ประตูขึ้นมา
            const door = makeDoor(k, k.vec2(position.x, position.y));
            
            // แอดเข้าไปในฉาก (หรือ map.add(door) ถ้าต้องการให้ยึดกับ map)
            k.add(door); 
            
            continue;
        }

    if (position.name === "door2") {
            const door = makeDoor2(k, k.vec2(position.x, position.y));
            
         
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

        if (position.name === "Tree") {
        
                    const Tree = k.add(
                        makeBox(k, k.vec2(position.x, position.y))
                    );
                    continue;
                }

        if (position.name === "boss") {
    // ✅ เรียกใช้ลอยๆ ได้เลย เพราะข้างในมี k.add() อยู่แล้ว
    const boss = makeBoss(k, k.vec2(position.x, position.y)); 
    
    continue;
}
    

  
}



// 🔥 ต้องอยู่นอก loop เท่านั้น
if (!spawned) {
  player.setPosition(500, 300);
  player.setControl();
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