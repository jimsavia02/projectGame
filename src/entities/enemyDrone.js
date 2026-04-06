export function makeDrone(k, initialPos) {

  const BLOCK_SIZE = 16;
  const WALK_BLOCKS = 3;
  const maxDistance = BLOCK_SIZE * WALK_BLOCKS;

  return k.make([
    k.pos(initialPos),
    k.sprite("drone1", { anim: "flying" }),
    k.area({ shape: new k.Rect(k.vec2(0, 6), 22, 20) }),
    k.anchor("center"),
    k.body(),
    k.health(1),
    "enemy1",

    {
      speed: 30,
      pursuitSpeed: 60,
      range: 90,

      startX: initialPos.x,
      direction: 1,
      isDead: false,

      add() {
        this.setBehavior();
        this.setEvents();
      },

      // =========================
      // การเคลื่อนไหว
      // =========================
      setBehavior() {

        this.onUpdate(() => {

          if (this.isDead) return;

          const player = k.get("player")[0];
          const distanceFromStart = this.pos.x - this.startX;

          // เดินได้แค่ระยะที่กำหนด
          if (distanceFromStart >= maxDistance) {
            this.direction = -1;
          }

          if (distanceFromStart <= -maxDistance) {
            this.direction = 1;
          }

          // โหมดไล่
          if (player && this.pos.dist(player.pos) < this.range) {

            const dir = player.pos.x > this.pos.x ? 1 : -1;
            this.move(dir * this.pursuitSpeed, 0);
            this.flipX = dir < 0;

          } else {

            this.move(this.direction * this.speed, 0);
            this.flipX = this.direction < 0;

          }

        });
      },

      // =========================
      // Events
      // =========================
      setEvents() {

        this.onCollide("player", (player) => {
          if (this.isDead) return;

          player.hurt(1);
          this.triggerExplode();
        });

        this.onCollide("sword-hitbox", () => {
          if (this.isDead) return;
          this.hurt(1);
        });

        this.onCollide("player-skill", ()=>{
          if(this.isDead) return;
          this.hurt(1);
        });

        this.on("hurt", () => {
          if (this.hp() <= 0 && !this.isDead) {
            this.triggerExplode();
          }
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") {
            k.destroy(this);
          }
        });
      },

      // =========================
      // ระเบิด
      // =========================
      triggerExplode() {
        this.isDead = true;

        this.play("explode");
        this.area.enabled = false;   // ปิด hitbox
        this.body?.pause?.();        // หยุดฟิสิกส์
      },

    },
  ]);
}