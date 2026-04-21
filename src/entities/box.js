export function makeBox(k, initialPos) {
  return k.make([
    k.pos(initialPos),
    k.sprite("Box"),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 16, 16), collisionIgnore: ["enemy1",] }),
    k.body({ isStatic: false, mass: 100 }),
    k.scale(1),
    k.health(5),
     k.z(10),
    "Tree",

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

        this.on("healthChanged", () => {
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

        this.setHP(this.hp() - dmg);
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
          this.pos.x = this.grabber.pos.x + (this.grabber.flipX ? -16 : 16);
        }
        if (!this.grabTarget?.exists()) {
          this.grabTarget = null;
        }
      }
    },
  ]);
}