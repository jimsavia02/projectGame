export function loadSpikes(k, map, spikes) {
  if (!spikes) return;

  for (const spike of spikes) {
    k.add([
      k.rect(spike.width, spike.height),
      k.pos(spike.x, spike.y),
      k.area(),
      k.opacity(0),
      "spike",
    ]);
  }
}

// ระบบดาเมจ (เรียกครั้งเดียวพอ)
export function setupSpikeDamage(k) {

  k.onCollideUpdate("player", "spike", (player) => {

    if (player.isDead) return;
    if (!player.canBeHit) return;

    player.canBeHit = false;
    player.hurt(1);

    k.wait(0.5, () => {
      if (player.exists()) {
        player.canBeHit = true;
      }
    });
  });
}