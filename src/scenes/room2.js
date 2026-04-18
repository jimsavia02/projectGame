
import { makePlayer } from "../entities/player";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls,setExitZones} from "./roomutils";
import { state } from "../state/globalState";

export function room2(k,room2Data,previousSceneData) {
   setBackgroundImage(k, "bgroom1");

   k.camScale(4),
   k.camPos(170,100);
   k.setGravity(1000);

   const roomLayers = room2Data.layers;
   const map = k.add([k.pos(0,0), k.sprite("room2")]);

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
   
   
       // ✅ สร้าง player ก่อน
       const player = k.add(makePlayer(k));
       player.play("idle"); 
       setCameraZones(k,map,cameras);
       setCameraControls(k,player,map, room2Data);
       // ✅ กล้องตาม player (ย้ายมาหลังประกาศ)
       
       setExitZones(k,map,exits,"room1");
   
       // ✅ LOOP SPAWN OBJECTS
       for (const position of positions) {
   
           // -------- SPAWN PLAYER --------
               if (
      position.name === "entrance-1" &&
      previousSceneData.exitName === "exit-1"
    ) {
      player.setPosition(position.x , position.y );
      player.setControl();
      // Set respawn position
      state.set("currentRoom", "room2");
      state.set("respawnPos", { x: position.x, y: position.y });
      continue;
    }

    if (
      position.name === "entrance-2" &&
      previousSceneData.exitName === "exit-2"
    ) {
      player.setPosition(position.x , position.y );
      player.setControl();
      player.respawnIfOutOfBounds(1000, "room2", { exitName: "exit-2" });
      // Set respawn position
      state.set("currentRoom", "room2");
      state.set("respawnPos", { x: position.x, y: position.y });
      k.camPos(player.pos);
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
      player.respawnIfOutOfBounds(1000, "room2");
      // Update respawn position and health
      state.set("playerHp", state.current().maxPlayerHp);
      healthBar.trigger("update");
      k.camPos(player.pos);
      continue;
    }
           
           if (position.name === "cartridge"){
               map.add(makeCartridge(k,k.vec2(position.x,position.y)));
           }
       }
          healthBar.setEvents();
          healthBar.trigger("update");
          k.add(healthBar);
   }
