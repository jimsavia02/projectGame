import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import { state, statePropsEnum } from "../state/globalState";
import { setCameraZones, setMapColliders, setCameraControls, setExitZones } from "./roomutils";
import { makeNPC } from "../entities/npc";
import { makeBox } from "../entities/Box";
import { healthBar } from "../ui/healthBar";
import { manaBar } from "../ui/manaBar";
import { loadSpikes, setupSpikeDamage } from "../entities/spike";
import { makeDoor } from "../entities/door"
import { makeSwitch } from "../entities/switch";

export function room5(k, room5Data, previousSceneData) {
state.set("playerHp", state.current().maxPlayerHp);
state.set("playerMana", 6);
state.set(statePropsEnum.lastRoom, "room5");

  k.camScale(2);
  k.camPos(1280, 720);
  k.setGravity(1000);

  const spikesLayer = room5Data.layers.find(l => l.name === "spikes");
  const roomLayers = room5Data.layers;
  const map = k.add([k.pos(0, 0), k.sprite("room5")]);

  const colliders = [];
  const positions = [];
  const cameras = [];
  const exits = [];
  const spikes = [];

  // 🔥 อ่าน layer จาก Tiled
  for (const layer of roomLayers) {

    if (layer.name === "cameras") {
      cameras.push(...layer.objects);
    }

    if (layer.name === "positions") {
      positions.push(...layer.objects);
    }

    if (layer.name === "exits") {
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

  // 🔥 สร้าง collider
  setMapColliders(k, map, colliders);

  // 🔥 สร้าง player
  const player = k.add(makePlayer(k));
  player.play("idle");
  player.currentRoom = "room5";

  // 🔥 กล้อง
  setCameraZones(k, map, cameras);
  setCameraControls(k, player, map, room5Data);

  // 🔥 exit ไป room4 (แก้ได้ตามต้องการ)
  setExitZones(k, map, exits, "room4");

  // spikes
  loadSpikes(k, map, spikes);

  // spikes damage
  setupSpikeDamage(k);

  // 🔥 วนตำแหน่ง
  for (const position of positions) {
    

    // ✅ spawn ตอนเริ่มเกม
    if (position.name === "player") {
      if (!previousSceneData?.exitName) {
        player.setPosition(position.x, position.y);
        player.setControl();
        continue;
      }
    }

    // ✅ spawn จาก room อื่น (dynamic)
    if (
      position.name === previousSceneData?.exitName?.replace("exit", "entrance")
    ) {
      player.setPosition(position.x, position.y);
      player.setControl();
      continue;
    }

    // 🔥 enemy
    if (position.name === "enemy1") {
      const enemy = k.add(
        makeDrone(k, k.vec2(position.x, position.y))
      );
      enemy.setBehavior();
      enemy.setEvents();
      continue;
    }

    // 🔥 object
    if (position.name === "Tree") {
      k.add(makeBox(k, k.vec2(position.x, position.y)));
      continue;
    }

    if (position.name === "Tree") {
      k.add(makeBox(k, k.vec2(position.x, position.y)));
      continue;
    }

     if (position.name === "Tree") {
      k.add(makeBox(k, k.vec2(position.x, position.y)));
      continue;
    }

    // 🔥 NPC
    if (position.name === "npc") {
      makeNPC(
        k,
        player,
        position.x,
        position.y,
        [
          "Welcome to room 5!",
          "This is your new map."
        ]
      );
      if (position.name === "Tree") {          
        const Tree = k.add(
        makeBox(k, k.vec2(position.x, position.y))
        );
        continue;
    }
      
    if (position.name === "boss") {
        const boss = makeBoss(k, k.vec2(position.x, position.y)); 
        continue;
      }
      continue;
    }
      // door
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
        

  }

  // 🔥 UI
  healthBar.setEvents();
  healthBar.trigger("update");
  k.add(healthBar);

  manaBar.setEvents();
  k.add(manaBar);
  manaBar.trigger("update");

  // 🔥 cleanup
  k.onSceneLeave(() => {
    if (player.walkSound) {
      player.walkSound.stop();
      player.walkSound = null;
    }
  });
}