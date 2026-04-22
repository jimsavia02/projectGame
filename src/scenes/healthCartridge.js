
import { state } from "../state/globalState";

export function makeCartridge(k, pos) {
  const cartridge = k.make([
    k.sprite("cartridge", { anim: "default" }),
    k.area(),
    k.anchor("center"),
    k.pos(pos),
  ]);

  cartridge.onCollide("player", (player) => {
    // k.play("health", { volume: 0.2 });
    if (player.hp() < state.current().maxPlayerHp) {
      player.heal(2);
    }
    k.destroy(cartridge);
  });

  return cartridge;
}
