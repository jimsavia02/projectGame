export function makeEnemy2(k, initialPos, makeBox) {
  const BLOCK_SIZE = 16;
  const WALK_BLOCKS = 3;
  const maxDistance = BLOCK_SIZE * WALK_BLOCKS;

  return k.make([
    k.pos(initialPos),
    k.sprite("Knight", { anim: "idle" }),
    k.area({ 
      shape: new k.Rect(k.vec2(0, -1), 25, 15), 
      collisionIgnore: ["player"] 
    }),
    k.anchor("center"),
    k.body(),
    k.health(10),
    k.scale(2),
    "enemy2",

    {
      speed: 35,
      pursuitSpeed: 75,
      range: 130,
      attackRange: 45,
      startX: initialPos.x,
      direction: 1,
      isDead: false,
      isAttacking: false,
      isHurt: false,
      isDefending: false,
      canAttack: true,

      add() {
        this.setBehavior();
        this.setEvents();
      },

      setBehavior() {
        this.onUpdate(() => {
          if (this.isDead) return;
          if (this.curAnim()?.includes("attack") || this.isAttacking) return;
          if (this.isDefending) return;

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
            if (this.curAnim() !== "walk") this.play("walk");
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

      // ✅ สุ่มการโจมตี 3 แบบ (attack1, attack2, attack3) หรือป้องกัน ด้วยความเสียหายที่แตกต่างกัน
      attackPlayer(player) {
        this.canAttack = false;
        this.flipX = player.pos.x < this.pos.x;
        
        // สุ่มเลือกการโจมตี 3 แบบ หรือป้องกัน
        const actions = [
          { anim: "attack1", damage: 1, delay: 0.25, duration: 0.3, type: "attack" },  // เบาสุด
          { anim: "attack2", damage: 2, delay: 0.35, duration: 0.4, type: "attack" },  // กลาง
          { anim: "attack3", damage: 3, delay: 0.45, duration: 0.5, type: "attack" },  // แรงสุด
          { anim: "defense", delay: 0.5, duration: 1.2, type: "defense" }               // ป้องกัน
        ];
        
        const selectedAction = k.choose(actions);
        
        if (selectedAction.type === "defense") {
          this.activateDefense(selectedAction);
        } else {
          this.performAttack(selectedAction);
        }
      },

      // ✅ ฟังก์ชันป้องกัน - ไม่ได้รับดาเมจในขณะที่ป้องกัน
      activateDefense(defenseData) {
        this.isDefending = true;
        this.isAttacking = false;
        this.play(defenseData.anim);
        
        k.wait(defenseData.duration, () => {
          if (!this.isDead) this.isDefending = false;
        });
      },

      // ✅ ฟังก์ชันโจมตี
      performAttack(selectedAttack) {
        this.isAttacking = true;
        this.play(selectedAttack.anim);

        k.wait(selectedAttack.delay, () => {
          if (this.isDead || this.isHurt) return;
          
          const hitBoxOffset = this.flipX ? -22 : 22;
          const hitBox = k.add([
            k.pos(this.pos.x + hitBoxOffset, this.pos.y),
            k.area({ shape: new k.Rect(k.vec2(0), 30, 30) }),
            k.anchor("center"),
            "enemy-attack-hitbox",
          ]);
          
          // ทำความเสียหายตามประเภทการโจมตี
          hitBox.onCollide("player", (p) => { 
            p.hurt(selectedAttack.damage); 
            k.destroy(hitBox); 
          });
          
          k.wait(selectedAttack.duration, () => { 
            if (hitBox.exists()) k.destroy(hitBox); 
          });
        });
      },

      takeDamage() {
        if (this.isDead || this.isHurt) return;
        // ✅ ไม่ได้รับดาเมจขณะป้องกัน
        if (this.isDefending) return;
        
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

          if (anim.includes("attack")) {
            this.isAttacking = false;
            this.play("idle");
            k.wait(1.2, () => { 
              if (!this.isDead) this.canAttack = true;
            });
          }

          if (anim === "defense") {
            this.isDefending = false;
            this.play("idle");
            k.wait(0.8, () => { 
              if (!this.isDead) this.canAttack = true;
            });
          }

          if (anim === "hurt") {
            this.isHurt = false;
            k.wait(0.1, () => { 
              if (!this.isDead) this.canAttack = true;
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
        this.play("death");
        
        // ✅ Spawn box ที่จุดตาย
        const boxEntity = makeBox(k, this.pos);
        k.add(boxEntity);
      },
    },
  ]);
}
