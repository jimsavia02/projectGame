
import { makePlayer } from "../entities/player";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls,setExitZones} from "./roomutils";
import { createInventory } from "../ui/inventory.js";
import { makeKey } from "../entities/key";

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
      continue;
    }

    if (
      position.name === "entrance-2" &&
      previousSceneData.exitName === "exit-2"
    ) {
      player.setPosition(position.x , position.y );
      player.setControl();
      player.respawnIfOutOfBounds(1000, "room2", { exitName: "exit-2" });
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
