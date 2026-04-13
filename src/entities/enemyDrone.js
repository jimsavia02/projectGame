export function makeDrone(k, initialPos) {
  const BLOCK_SIZE = 16;
  const WALK_BLOCKS = 3;
  const maxDistance = BLOCK_SIZE * WALK_BLOCKS;

  return k.make([
    k.pos(initialPos),
    k.sprite("drone1", { anim: "idle" }),
    k.area({ shape: new k.Rect(k.vec2(0, 2), 25, 30) }),
    k.anchor("center"),
    k.body(),
    k.health(3),
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
          // 1. ถ้าตาย หรือ บาดเจ็บ (Hurt) หรือกำลังโจมตี ให้หยุดการคำนวณเคลื่อนที่ทั้งหมด
          if (this.isDead || this.isHurt || this.isAttacking) return;

          const player = k.get("player")[0];
          const distToPlayer = player ? this.pos.dist(player.pos) : Infinity;

          // 2. สถานะ Cooldown หลังโจมตี (รอ 1 วิในท่า Idle)
          if (!this.canAttack) {
            if (this.curAnim() !== "idle") this.play("idle");
            return; 
          }

          // 3. เงื่อนไขการโจมตี
          if (player && distToPlayer < this.attackRange) {
            this.attackPlayer(player);
            return;
          }

          // 4. การเคลื่อนไหวปกติ
          if (player && distToPlayer < this.range) {
            // โหมดวิ่งไล่
            const dir = player.pos.x > this.pos.x ? 1 : -1;
            this.move(dir * this.pursuitSpeed, 0);
            this.flipX = dir > 0;
            if (this.curAnim() !== "run") this.play("run");
          } else {
            // โหมดลาดตระเวน
            const distanceFromStart = this.pos.x - this.startX;
            if (distanceFromStart >= maxDistance) this.direction = -1;
            if (distanceFromStart <= -maxDistance) this.direction = 1;

            this.move(this.direction * this.speed, 0);
            this.flipX = this.direction > 0;
            if (this.curAnim() !== "walk") this.play("walk");
          }
        });
      },

      attackPlayer(player) {
        this.isAttacking = true;
        this.canAttack = false; 
        this.flipX = player.pos.x > this.pos.x;
        this.play("attack");

        // จังหวะสร้าง Hitbox
        k.wait(0.3, () => {
          // สำคัญ: ถ้าก่อนจะสร้าง Hitbox ดันโดนตีจนตายหรือบาดเจ็บ (isHurt) ให้ยกเลิกการสร้าง
          if (this.isDead || this.isHurt) return;

          const hitBoxOffset = this.flipX ? 22 : -22;
          const hitBox = k.add([
            k.pos(this.pos.x + hitBoxOffset, this.pos.y),
            k.area({ shape: new k.Rect(k.vec2(0), 30, 30) }),
            k.anchor("center"),
            "enemy-attack-hitbox",
          ]);

          hitBox.onCollide("player", (p) => {
            p.hurt(1);
            k.destroy(hitBox);
          });

          k.wait(0.1, () => {
            if (hitBox.exists()) k.destroy(hitBox);
          });
        });
      },

      takeDamage() {
        if (this.isDead) return;

        this.isHurt = true;
        this.isAttacking = false; // ขัดจังหวะการโจมตีถ้าโดนตีสวน
        this.hurt(1);
        
        // หยุดนิ่งทันที ล้างความเร็วเดิม
        this.move(0, 0); 
        this.play("hurt");
      },

      setEvents() {
        this.onCollide("sword-hitbox", () => this.takeDamage());
        this.onCollide("player-skill", () => this.takeDamage());

        this.on("hurt", () => {
          if (this.hp() <= 0) this.triggerExplode();
        });

        this.onAnimEnd((anim) => {
          if (anim === "attack") {
            this.isAttacking = false;
            this.play("idle");
            k.wait(1.0, () => {
              if (this.isDead) return;
              this.canAttack = true;
            });
          }
          if (anim === "hurt") {
            this.isHurt = false;
            // เมื่อจบท่า Hurt จะกลับไปเช็ค Behavior ใน onUpdate อัตโนมัติ
          }
          if (anim === "explode") {
            k.destroy(this);
          }
        });
      },

      triggerExplode() {
        this.isDead = true;
        this.play("explode");
        this.area.enabled = false;
        if (this.body) {
           // หยุดแรงกระแทกทั้งหมดเมื่อระเบิด
           this.move(0,0);
           this.body.pausing = true;
        }
      },
    },
  ]);
}