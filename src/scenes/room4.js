import { makeBoss } from "../entities/Boss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones, checkEnemy2AndRemoveBarrier3, checkBarrier4AndRemoveAfterKeyReceived} from "./roomutils";
import { state, statePropsEnum } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { manaBar } from "../ui/manaBar";
import { makeNPC } from "../entities/npc"
import { makeNPC2 } from "../entities/npc2"
import { makeDoor } from "../entities/door"
import { makeSwitch } from "../entities/switch";
import { makeDoor2 } from "../entities/door2";
import { makeBox } from "../entities/Box";
import { loadSpikes, setupSpikeDamage } from "../entities/spike";
import { makeKey } from "../entities/key";
import { makeEnemy2 } from "../entities/enemy2";
import { createInventory } from "../ui/inventory.js";


export function room4(k,room4Data,previousSceneData) {
state.set("playerHp", state.current().maxPlayerHp);
state.set("playerMana", 6);
state.currentRoom = "room4";
state.set(statePropsEnum.lastRoom, "room4");
   
   k.camScale(2),
   k.camPos(1280,720);
   k.setGravity(1000);
    
   const spikesLayer = room4Data.layers.find(l => l.name === "spikes");
   const roomLayers = room4Data.layers;
   const map = k.add([k.pos(0,0), k.sprite("room4")]);

       const colliders = [];
       const positions = [];
       const cameras = [];  
       const exits = [];
       const spikes = [];
      
   // ✅ สร้าง destroyBarrier4 callback สำหรับ npc2
   const destroyBarrier4 = checkBarrier4AndRemoveAfterKeyReceived(k);

   
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
           if (layer.name === "spikes" && layer.objects) {
                spikes.push(...layer.objects);
            }
            
       }

         setMapColliders(k, map, colliders);

         const player = k.add(makePlayer(k));
       player.play("idle"); 
       setCameraZones(k,map,cameras);
       setCameraControls(k,player,map, room4Data);
       setupSpikeDamage(k);
       setExitZones(k, map, exits,);
       loadSpikes(k, map, spikes);

           // ... (โค้ดส่วนบนอื่นๆ)

// ✅ 1. หาบรรทัดที่วนลูปตำแหน่ง (positions)
let spawned = false;

for (const position of positions) {



  if (position.name === "player" && !previousSceneData?.exitName) {
    player.setPosition(position.x, position.y);
    player.setControl();
    spawned = true;
    continue;
  }

  if (
  position.name === previousSceneData?.exitName?.replace("exit", "entrance")
    ) {
    player.setPosition(position.x, position.y);
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

        if (position.name === "enemy1") {

            const enemy1 = k.add(
                makeDrone(k, k.vec2(position.x, position.y))
            );

            enemy1.setBehavior();
            enemy1.setEvents();
            continue;
        }
        if (position.name === "key") {
        
                    const Tree = k.add(
                        makeKey(k, k.vec2(position.x, position.y))
                    );
                    continue;
                }

        if (position.name === "enemy2") {

            const enemy2 = k.add(
                makeEnemy2(k, k.vec2(position.x, position.y), makeBox)
            );

            enemy2.setBehavior();
            enemy2.setEvents();
            continue;
        }

        if (position.name === "npc2") {
            const npc2 = makeNPC2(k, player, position.x, position.y, destroyBarrier4);
            continue;
        }
        if (position.name === "cartridge"){
            map.add(makeCartridge(k,k.vec2(position.x,position.y)));
        }
}


// 🔥 ต้องอยู่นอก loop เท่านั้น
if (!spawned) {
  player.setPosition(110, 130);
  player.setControl();
}

// ✅ ตรวจสอบการพ่ายแพ้ของ enemy2 และลบ barrier3
checkEnemy2AndRemoveBarrier3(k);

    // const bgm = k.play("DystopianCity", {
    //     volume: 0.5, // ปรับความดัง (0.0 ถึง 1.0)
    //     loop: true,   // ให้เล่นวนซ้ำไปเรื่อยๆ
    // });

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

    // ✅ Setup Inventory System
    const inventory = createInventory(k, player, makeKey);
    
    k.onKeyDown("i", () => {
      inventory.toggle();
    });

    k.onKeyDown("up", () => {
      inventory.selectUp();
    });

    k.onKeyDown("down", () => {
      inventory.selectDown();
    });

    k.onKeyDown("v", () => {
      inventory.drop();
    });
}