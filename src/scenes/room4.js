import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc"

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

    // --- โค้ดเดิมของคุณที่มีอยู่แล้ว ---
    if (
        position.name === "entrance-3" &&
        previousSceneData.exitName === "exit-3"
    ) {
        player.setPosition(position.x, position.y);
        player.setControl();
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