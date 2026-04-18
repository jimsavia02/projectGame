import { state, statePropsEnum } from "../state/globalState";
import { healthBar } from "../ui/healthBar";
import { makeBlink } from "./entitySharedLogic";

export function makePlayer(k) {
  return k.make([
    k.pos(),
    k.scale(1.5),
    k.sprite("player"),
    k.z(10),
    k.area({ shape: new k.Rect(k.vec2(0, 1), 10, 20), collisionIgnore: ["npc"] }),
    k.anchor("center"),
    k.body({ mass: 100, jumpForce: 400 }),
    k.doubleJump(state.current().isDoubleJumpUnlocked ? 2 : 1),
    k.opacity(),  
    k.health(state.current().playerHp),
    "player",

    {
      speed: 150,
      canBeHit: true,
      isAttacking: false,
      controlHandlers: [],
      walkSound: null,
      canControl: true,
      mana: 6,
      maxMana: 6,
      canDash: true,
      dashCost: 2,
      skillCost: 3,
      dashCooldown: 0.5,
      dashSpeed: 100,
      heldItem: null,

      useMana(cost) {
        if (this.mana < cost) return false;
        this.mana -= cost;
        state.set("playerMana", this.mana);
        return true;
      },

      disableControl() {
        this.canControl = false;
        if (this.walkSound) {
          this.walkSound.stop();
          this.walkSound = null;
        }
      },

      enableControl() {
        this.canControl = true;
      },

      add() {
        this.setupEvents();
      },

      respawnIfOutOfBounds(boundvalue, destinationName, previousSceneData = {exitName:null}) {
        k.onUpdate(() => {
          if(this.pos.y > boundvalue) {
            k.go(destinationName, previousSceneData);
          }
        });
      },

      setupEvents() {
        this.onFall(() => this.play("fall"));
        this.onFallOff(() => this.play("fall"));
        this.onGround(() => { if (!this.isAttacking) this.play("idle"); });
        this.onHeadbutt(() => this.play("fall"));
        this.on("heal", () => {
          state.set(statePropsEnum.playerHp, this.hp());
          healthBar.trigger("update");
        });

        this.on("hurt", () => {
          this.canBeHit = true;
          makeBlink(k, this);
          if (this.hp() <= 0) {
            this.isDead = true;
          }
          if (this.hp() > 0) {
            state.set(statePropsEnum.playerHp, this.hp());
            healthBar.trigger("update");
            return;
          }
          state.set(statePropsEnum.playerHp, state.current().maxPlayerHp);
          this.play("explode");
        });

        // 🔥 แก้ไข: จัดการตอนจบ Anim
        this.onAnimEnd((anim) => {
          if (anim === "explode") {
            k.go("room3", { exitName: null });
          }
          // เมื่อตีจบ ให้กลับสถานะปกติทันที
          if (anim === "attack") {
            this.isAttacking = false;
            if (k.isKeyDown("left") || k.isKeyDown("right")) {
              this.play("run");
            } else {
              this.play("idle");
            }
          }
        });
      },

      setControl() {
        this.controlHandlers = [];

        this.controlHandlers.push(k.onKeyPress("shift", () => {
          if (!this.canControl) return;
          this.dash();
        }));

        this.controlHandlers.push(k.onKeyPress("c", () => {
          if (!this.canControl || this.isAttacking) return;
          this.castSkill();
        }));

        this.controlHandlers.push(k.onKeyPress("x", () => {
          if (!this.canControl) return;
          this.doubleJump();
          if (this.curAnim() !== "jump") this.play("jump");
          if (this.walkSound) { this.walkSound.stop(); this.walkSound = null; }
        }));

        // 🔥 แก้ไข: Attack (ป้องกันการกดค้างด้วยการเช็ค isAttacking)
        this.controlHandlers.push(k.onKeyPress("z", () => {
          if (!this.canControl || !this.isGrounded() || this.isAttacking|| this.grabTarget) return;

          this.isAttacking = true;
          this.play("attack");
          
          if (this.walkSound) {
            this.walkSound.stop();
            this.walkSound = null;
          }

          const hitbox = this.add([
            k.pos(this.flipX ? -17 : 5, 0),
            k.area({ shape: new k.Rect(k.vec2(0), 10, 5) }),
            "sword-hitbox",
          ]);

          k.wait(0.2, () => { if (hitbox.exists()) k.destroy(hitbox); });
        }));

        // ⚠️ ลบ onKeyRelease("z") ออกไปแล้วเพื่อให้แอนิเมชันควบคุมตัวเอง

        this.controlHandlers.push(k.onKeyDown((key) => {
          if (!this.canControl || this.isAttacking) return;
          if (key === "left") {
            this.flipX = true;
            this.move(-this.speed, 0);
            if (this.isGrounded() && this.curAnim() !== "run") this.play("run");
            if (this.isGrounded() && !this.walkSound) {
              this.walkSound = k.play("playerWalk", { loop: true, volume: 1 });
            }
          }
          if (key === "right") {
            this.flipX = false;
            this.move(this.speed, 0);
            if (this.isGrounded() && this.curAnim() !== "run") this.play("run");
            if (this.isGrounded() && !this.walkSound) {
              this.walkSound = k.play("playerWalk", { loop: true, volume: 1 });
            }
          }
        }));

        this.controlHandlers.push(k.onKeyRelease((key) => {
          if (!this.canControl) return;
          if ((key === "left" || key === "right") && !k.isKeyDown("left") && !k.isKeyDown("right") && this.isGrounded()) {
            if (!this.isAttacking) this.play("idle");
            if (this.walkSound) { this.walkSound.stop(); this.walkSound = null; }
          }
        }));

        this.controlHandlers.push(k.onKeyPress("v", () => {
          if (!this.canControl) return;
          if (!this.grabTarget) {
            const boxes = k.get("Tree") || [];
            const keys = k.get("key") || [];
            const candidates = [...boxes, ...keys];
            let nearest = null;
            let minDist = 40;
            candidates.forEach((t) => {
              if (!t.exists()) return;
              const d = this.pos.dist(t.pos);
              if (d < minDist && !t.isGrabbed) { nearest = t; minDist = d; }
            });
            if (nearest) {
              this.grabTarget = nearest;
              nearest.isGrabbed = true;
              nearest.grabber = this;
              nearest.body?.pause?.();
            }
          } else {
            if (this.grabTarget && this.grabTarget.exists()) {
              this.grabTarget.isGrabbed = false;
              this.grabTarget.grabber = null;
              this.grabTarget.body?.unpause?.();
            }
            this.grabTarget = null;
          }
        }));
      },

      disableControls() { this.controlHandlers.forEach((h) => h.cancel()); },
      setPosition(x, y) { this.pos.x = x; this.pos.y = y; },
      enableDoubleJump() {
        this.unuse("doubleJump");
        this.use(k.doubleJump(2));
      },

      castSkill() {
        if (!this.useMana(this.skillCost)) return;
        this.isAttacking = true;
        this.play("cast");
        let hasSpawned = false;
        const checkFrame = this.onUpdate(() => {
          if (this.curAnim() === "cast" && this.frame === 99 && !hasSpawned) {
            hasSpawned = true;
            const dir = this.flipX ? -1 : 1;
            const fireball = k.add([
              k.sprite("fireball", { anim: "cast" }),
              k.pos(this.pos.add(dir * 25, -8)),
              k.area({ shape: new k.Rect(k.vec2(0, 13), 10, 8) }),
              k.anchor("center"),
              k.move(k.vec2(dir, 0), 300),
              "player-skill"
            ]);
            const spawnPos = fireball.pos;
            fireball.onUpdate(() => { if (fireball.pos.dist(spawnPos) > 150) fireball.destroy(); });
            checkFrame.cancel();
          }
        });
        const endHandler = this.onAnimEnd((anim) => {
          if (anim === "cast") {
            this.isAttacking = false;
            if (k.isKeyDown("left") || k.isKeyDown("right")) { this.play("run"); } 
            else { this.play("idle"); }
            endHandler.cancel();
          }
        });
      },

      dash() {
        if (!this.canDash || !this.useMana(this.dashCost)) return;
        this.canDash = false;
        const dir = this.flipX ? -1 : 1;
        this.play("dash");
        this.vel.x = dir * 200;
        k.wait(0.5, () => {
          this.vel.x = 0;
          if (!this.isGrounded()) { this.play("fall"); } 
          else if (k.isKeyDown("left") || k.isKeyDown("right")) { this.play("run"); } 
          else { this.play("idle"); }
        });
        k.wait(this.dashCooldown, () => { this.canDash = true; });
      },
    },
  ]);
}