import { makeBoss } from "../entities/enemyBoss";
import { makeDrone } from "../entities/enemyDrone";
import { makePlayer } from "../entities/player";
import {  setBackgroundImage, setCameraZones, setMapColliders,setCameraControls, setExitZones} from "./roomutils";
import { state } from "../state/globalState";
import { makeCartridge } from "./healthCartridge";
import { healthBar } from "../ui/healthBar";
import { makeNPC } from "../entities/npc";

export function room1(k, roomData,previousSceneData) {

    setBackgroundImage(k, "bgroom1");

    k.camScale(4);
    k.camPos(170, 100);
    k.setGravity(1000);

    const roomLayers = roomData.layers;

    const map = k.add([
        k.pos(0, 0),
        k.sprite("room1"),
    ]);

    const colliders = [];
    const positions = [];
    const cameras =[];
    const exits =[];

    for (const layer of roomLayers) {
        if (layer.name === "cameras"){
            cameras.push(...layer.objects);

        }

        if (layer.name === "exits"){
    exits.push(...layer.objects);
}

        if (layer.name === "positions") {
            positions.push(...layer.objects);
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
    setCameraControls(k,player,map, roomData);
    // ✅ กล้องตาม player (ย้ายมาหลังประกาศ)

    setExitZones(k,map,exits,"room2");
  

    // ✅ LOOP SPAWN OBJECTS
    for (const position of positions) {

        // -------- SPAWN PLAYER --------
        if (position.name === "player" && !previousSceneData.exitName) {
            player.setPosition(position.x, position.y);
            player.setControl();
            player.respawnIfOutOfBounds(1000, "room1");
            continue;
            
            
        }

        if (
      position.name === "entrance-1" &&
      previousSceneData.exitName === "exit-1"
    ) {
      player.setPosition(position.x, position.y);
      player.setControl();
      player.respawnIfOutOfBounds(1000, "room1");
      k.camPos(player.pos);
      continue;
    }

    if (
      position.name === "entrance-2" &&
      previousSceneData.exitName === "exit-2"
    ) {
      player.setPosition(position.x, position.y);
      player.setControl();
      player.respawnIfOutOfBounds(1000, "room1");
      k.camPos(player.pos);
      continue;
    }

        // -------- SPAWN DRONE --------
        if (position.name === "enemy1") {

            const drone = map.add(
                makeDrone(k, k.vec2(position.x, position.y))
            );

            drone.setBehavior();
            drone.setEvents();
            continue;
        }

        if(position.name ==="boss" && !state.current().isBossDefeated){
            const boss = k.add(makeBoss(k,k.vec2(position.x,position.y)));
            boss.setBehavior();
            boss.setEvents();
            continue;
        }
        
        if (position.name === "cartridge"){
            map.add(makeCartridge(k,k.vec2(position.x,position.y)));
        }
        


        if (position.name === "npc") {
    makeNPC(
        k,
        player,
        position.x,
        position.y,
        [
            "สวัสดี",
            "ยินดีต้อนรับ"
            
        ]
        
    );
    continue;
}
    }
       healthBar.setEvents();
       healthBar.trigger("update");
       k.add(healthBar);

}