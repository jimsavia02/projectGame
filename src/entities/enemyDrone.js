export function makeDrone(k, initialPos) {
  const BLOCK_SIZE = 16;
  const WALK_BLOCKS = 3;
  const maxDistance = BLOCK_SIZE * WALK_BLOCKS;

  return k.make([
    k.pos(initialPos),
    k.sprite("drone1", { anim: "idle" }),
    k.area({ 
      shape: new k.Rect(k.vec2(0, -1), 25, 15), 
      collisionIgnore: ["player"] 
    }),
    k.anchor("center"),
    k.body(),
    k.health(6),
    k.scale(1.5),
    "enemy1",

    {
      speed: 30,
      pursuitSpeed: 70,
      range: 120,
      attackRange: 40,
      startX: initialPos.x,
      direction: 1,
      isDead: false,
      isAttacking: false,
      isHurt: false,
      canAttack: true,

      add() {
        this.setBehavior();
        this.setEvents();
      },

      setBehavior() {
        this.onUpdate(() => {
          if (this.isDead) return;
          if (this.curAnim() === "attack3" || this.isAttacking) return;

          if (this.isHurt) {
            const player = k.get("player")[0];
            if (player) {
              const knockDir = this.pos.x < player.pos.x ? -1 : 1;
              this.move(knockDir * 60, 0); 
            }
            return; 
          }

          const player = k.get("player")[0];
          const distToPlayer = player ? this.pos.dist(player.pos) : Infinity;

          if (!this.canAttack) {
            if (this.curAnim() !== "idle") this.play("idle");
            return; 
          }

          if (player && distToPlayer < this.attackRange) {
            this.attackPlayer(player);
          } else if (player && distToPlayer < this.range) {
            const dir = player.pos.x > this.pos.x ? 1 : -1;
            this.move(dir * this.pursuitSpeed, 0);
            this.flipX = dir < 0; 
            if (this.curAnim() !== "run") this.play("run");
          } else {
            const distanceFromStart = this.pos.x - this.startX;
            if (distanceFromStart >= maxDistance) this.direction = -1;
            if (distanceFromStart <= -maxDistance) this.direction = 1;

            this.move(this.direction * this.speed, 0);
            this.flipX = this.direction < 0; 
            if (this.curAnim() !== "walk") this.play("walk");
          }
        });
      },

      attackPlayer(player) {
        this.isAttacking = true;
        this.canAttack = false; 
        this.flipX = player.pos.x < this.pos.x;
        
        const selectedAnim = k.choose(["attack", "attack2"]);
        this.play(selectedAnim);

        k.wait(0.3, () => {
          if (this.isDead || this.isHurt) return;
          const hitBoxOffset = this.flipX ? -22 : 22;
          const hitBox = k.add([
            k.pos(this.pos.x + hitBoxOffset, this.pos.y),
            k.area({ shape: new k.Rect(k.vec2(0), 30, 30) }),
            k.anchor("center"),
            "enemy-attack-hitbox",
          ]);
          hitBox.onCollide("player", (p) => { p.hurt(1); k.destroy(hitBox); });
          k.wait(0.1, () => { if (hitBox.exists()) k.destroy(hitBox); });
        });
      },

      // --- ส่วนที่แก้ไข: ยิงแล้วหายไปในระยะ 200px ---
      counterAttack() {
        if (this.isDead) return;
        const player = k.get("player")[0];
        if (!player) return;

        this.isAttacking = true;
        this.canAttack = false; 
        this.flipX = player.pos.x < this.pos.x;

        this.play("attack3", { speed: 10 });

        k.wait(0.6, () => {
          if (this.isDead || this.isHurt) return;
          const arrowDir = this.flipX ? -1 : 1;
          const spawnPos = k.vec2(this.pos.x + (arrowDir * 20), this.pos.y);

          const arrow = k.add([
            k.pos(spawnPos),
            k.sprite("arrow"),
            k.anchor("center"),
            k.area({ shape: new k.Rect(k.vec2(0), 16, 6) }), 
            k.move(arrowDir === 1 ? 0 : 180, 150), 
            k.offscreen({ destroy: true }),
            "enemy-projectile",
            { spawnPos: spawnPos } // เก็บจุดเกิดไว้เช็คระยะ
          ]);
          
          arrow.flipX = this.flipX;

          // เช็คระยะทางทุกเฟรม
          arrow.onUpdate(() => {
            if (arrow.pos.dist(arrow.spawnPos) >= 150) {
              k.destroy(arrow);
            }
          });

          arrow.onCollide("player", (p) => {
            p.hurt(1);
            k.destroy(arrow);
          });

          arrow.onCollide("colliders", () => {
            k.destroy(arrow);
          });
        });
      },

      takeDamage() {
        if (this.isDead || this.isHurt) return;
        this.isHurt = true;
        this.isAttacking = false; 
        
        const player = k.get("player")[0];
        if (player) {
          const knockDir = this.pos.x < player.pos.x ? -1 : 1;
          this.move(knockDir * 180, 0); 
        }

        this.play("hurt");
        this.hurt(1);
      },

      setEvents() {
        this.onCollide("sword-hitbox", () => this.takeDamage());
        this.onCollide("player-skill", () => this.takeDamage());

        this.on("hurt", () => {
          if (this.hp() <= 0) this.triggerExplode();
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") k.destroy(this);

          if (anim === "attack" || anim === "attack2" || anim === "attack3") {
            this.isAttacking = false;
            this.play("idle");
            k.wait(1.0, () => { 
              if (!this.isDead) this.canAttack = true;
            });
          }

          if (anim === "hurt") {
            this.isHurt = false;
            k.wait(0.1, () => { 
              if (!this.isDead) this.counterAttack();
            });
          }
        });
      },

      triggerExplode() {
        if (this.isDead) return;
        this.isDead = true;
        this.area.enabled = false;
        if (this.body) {
           this.stop(); 
           this.body.unuse(); 
        }
        this.play("explode");
      },
    },
  ]);
}