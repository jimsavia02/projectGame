export function makeKey(k, initialPos) {
  return k.make([
    k.pos(initialPos),
    k.sprite("key"),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 16, 16), collisionIgnore: ["sword-hitbox", "player-skill", "enemy-attack-hitbox", "fire-hitbox", "bossAttackHitbox", "player", "npc","enemy1","enemy2","npc2"] }),
    k.body({ isStatic: false, mass: 100 }),
    k.scale(),
     k.z(10),
    "key",

    {
      isDead: false,
      isInvincible: false,

      // ✅ เพิ่ม
      isHeld: false,
      holder: null,

      add() {
        this.flipX = true;
        this.setEvents();
      },

      setEvents() {
        this.onCollide("sword-hitbox", () => {
          this.takeDamage(1);
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

      takeDamage(dmg) {
        if (this.isDead || this.isInvincible) return;

        this.hurt(dmg);
        this.isInvincible = true;
        this.opacity = 0.5;

        k.wait(0.2, () => {
          this.isInvincible = false;
          this.opacity = 1;
        });
      },

      triggerExplode() {
        this.isDead = true;
      if (this.isGrabbed && this.grabber) {
        this.grabber.grabTarget = null;
        }
        this.play("explode");
        this.area.enabled = false;
        this.body?.pause?.();
      },

      // ✅ ทำให้ตาม player ตอนถูกถือ
      update() {
        if (this.isGrabbed && this.grabber) {
          // follow player with a small horizontal offset to avoid overlap
          this.pos.x = this.grabber.pos.x + (this.grabber.flipX ? -16 : 16);
          // small vertical offset so the key sits slightly above/beside the player
          this.pos.y = this.grabber.pos.y - 6;
        }
        // cleanup if grabber no longer exists
        if (this.isGrabbed && (!this.grabber || !this.grabber.exists())) {
          this.isGrabbed = false;
          this.grabber = null;
        }
      }
    },
  ]);
}