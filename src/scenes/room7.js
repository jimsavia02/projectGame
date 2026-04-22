import { makePlayer } from "../entities/player";
import { makeBox } from "../entities/Box";
import { state, statePropsEnum } from "../state/globalState";
import {setMapColliders,setCameraZones,setCameraControls,setExitZones} from "./roomutils";
import { healthBar } from "../ui/healthBar";
import { manaBar } from "../ui/manaBar";
import { createInventory } from "../ui/inventory.js";
import { loadSpikes, setupSpikeDamage } from "../entities/spike.js";
import { makeKey } from "../entities/key";
import { makeEnemy2 } from "../entities/enemy2";
import { makeNPC } from "../entities/npc"
import { makeNPC2 } from "../entities/npc2"
import { makeCartridge } from "./healthCartridge";
import { makeBoss } from "../entities/Boss";
import { makeDrone } from "../entities/enemyDrone";

export function room7(k, mapData, previousSceneData) {
state.set("playerHp", state.current().maxPlayerHp);
state.set("playerMana", 6);
state.currentRoom = "room7";
state.set(statePropsEnum.lastRoom, "room7");
   k.camScale(2),
   k.camPos(1280,720);
   k.setGravity(1000);

    const roomLayers = mapData.layers;
    const colliders = [];
    const cameras = [];
    const exits = [];
    const positions = [];
    const spikes = [];

    const map = k.add([
        k.sprite("room7"),
        k.pos(0, 0),
    ]);

    const player = k.add(makePlayer(k));
    player.setControl();

    player.currentRoom = "room7";
    state.set(statePropsEnum.lastRoom, "room7");

for (const layer of mapData.layers) {

    if (layer.name === "colliders") {
        colliders.push(...layer.objects);
    }

    if (layer.name === "positions") {
        positions.push(...layer.objects);
    }

    if (layer.name === "cameras") {
        cameras.push(...layer.objects);
    }

    if (layer.name === "exits") {
        exits.push(...layer.objects);
    }
    if (layer.name === "spikes" && layer.objects) {
    spikes.push(...layer.objects);
    }
}
    setMapColliders(k, map, colliders);
    setCameraZones(k, map, cameras);
    setCameraControls(k, player, map, mapData);
    setExitZones(k, map, exits);
    loadSpikes(k, map, spikes);
    setupSpikeDamage(k);

    // spawn
    let spawned = false;

for (const position of positions) {

    if (
        position.name.includes("entrance-7") &&
        previousSceneData?.exitName?.includes("exit-7")
    ) {
        console.log("✅ spawn entrance-7");
        player.setPosition(position.x, position.y);
        spawned = true;
        continue;
    }

    // 🔥 default spawn
    if (position.name === "player" && !previousSceneData?.exitName) {
        player.setPosition(position.x, position.y);
        spawned = true;
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

    if (position.name === "enemy2") {

        const enemy2 = k.add(
            makeEnemy2(k, k.vec2(position.x, position.y), makeBox)
        );

        enemy2.setBehavior();
        enemy2.setEvents();
        continue;
    }

    if (position.name === "npc") {
        const npc = makeNPC(k, player, position.x, position.y);
        continue;
    }
    if (position.name === "cartridge"){
        map.add(makeCartridge(k,k.vec2(position.x,position.y)));
    }
}

    if (!spawned) {
        player.setPosition(30, 500);
    }



      healthBar.setEvents();
      healthBar.trigger("update");
      k.add(healthBar);
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
