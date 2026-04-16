import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc"
import { makeBox } from "../entities/Box";

export function room4(k,room4Data,previousSceneData) {
   
   k.camScale(1.8),
   k.camPos(1280,720);
   k.setGravity(1000);
   

   const roomLayers = room4Data.layers;
   const map = k.add([k.pos(0,0), k.sprite("room4")]);


       const colliders = [];
       const spikes = [];
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

           if (layer.name === "spikes") {
                spikes.push(...layer.objects);
           }
       }

       

         setMapColliders(k, map, colliders);

         const player = k.add(makePlayer(k));
       player.play("idle"); 
       setCameraZones(k,map,cameras);
       setCameraControls(k,player,map, room4Data);
       setExitZones(k, map, exits, "room3");

       for (const spike of spikes) {
      k.add([
        k.rect(spike.width, spike.height),
        k.pos(spike.x, spike.y),
        k.area(),
        k.opacity(0),
        "spike",
    ]);
  }
        k.onCollide("player", "spike", (player) => {
        player.hurt(5); // ลด HP เมื่อชนกับ หนาม
    });


// ✅ 1. หาบรรทัดที่วนลูปตำแหน่ง (positions)
let spawned = false;

for (const position of positions) {

  if (position.name === "player" && !previousSceneData?.exitName) {
    player.setPosition(position.x, position.y);
    player.setControl();
    spawned = true;
    continue;
  }
  if (position.name === "Tree") {      
    const Tree = k.add(
    makeBox(k, k.vec2(position.x, position.y))
    );
    continue;
}

  if (
    position.name.includes("entrance-4") &&
    previousSceneData?.exitName === "exit-4"
  ) {
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

