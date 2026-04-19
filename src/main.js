
import { k } from "./kaplayLoader.js"
import { room1 } from "./scenes/room1.js"
import { room2 } from "./scenes/room2.js"
import { room3 } from "./scenes/room3.js"
import { room4 } from "./scenes/room4.js"
import { room5 } from "./scenes/room5.js"
import { intro } from "./scenes/intro.js";


async function main() {
  const room1Data = await (await fetch("./maps/room1.json")).json();
  const room2Data = await (await fetch("./maps/room2.json")).json();  
  const room3Data = await (await fetch("./maps/room3.json")).json();
  const room4Data = await (await fetch("./maps/room4.json")).json();
  const room5Data = await (await fetch("./maps/room5.json")).json();

    k.scene("intro", (previousSceneData) => {
    intro(k, previousSceneData);
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


k.go("room5");
}

main();


