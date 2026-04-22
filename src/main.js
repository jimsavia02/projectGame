
import { k } from "./kaplayLoader.js"
import { gameover } from "./scenes/gameover.js";
import { room1 } from "./scenes/room1.js"
import { room2 } from "./scenes/room2.js"
import { room3 } from "./scenes/room3.js"
import { room4 } from "./scenes/room4.js"
import { room5 } from "./scenes/room5.js"
import { room6 } from "./scenes/room6.js";
import { intro } from "./scenes/intro.js"
import { ending } from "./scenes/ending.js";

async function main() {
  const room1Data = await (await fetch("./maps/room1.json")).json();
  const room2Data = await (await fetch("./maps/room2.json")).json();  
  const room3Data = await (await fetch("./maps/room3.json")).json();
  const room4Data = await (await fetch("./maps/room4.json")).json();
  const room5Data = await (await fetch("./maps/room5.json")).json();
  const room6Data = await (await fetch("./maps/room6.json")).json();

    ending(k);
    k.scene("intro", (previousSceneData) => {
    intro(k, previousSceneData);
    });
    k.scene("gameover", (data) => {
    gameover(k, data);
    });
  
k.scene("room1", (previousSceneData) => {
    room1(k, room1Data,previousSceneData)
});

k.scene("room2", (previousSceneData) => {
    room2(k,room2Data, previousSceneData)
});

k.scene("room3", (previousSceneData) => {
    room3(k,room3Data, previousSceneData)
});

k.scene("room4", (previousSceneData) => {
    room4(k,room4Data, previousSceneData)
});

k.scene("room5", (previousSceneData) => {
    room5(k,room5Data, previousSceneData)
});

k.scene("room6", (data) => {
    room6(k, room6Data, data);
});


k.go("room4");
}

main();

