import { state, statePropsEnum } from "../state/globalState";
import { healthBar } from "../ui/healthBar";
import { makeBlink } from "./entitySharedLogic";

export function makePlayer(k) {
  return k.make([
    k.pos(),
    k.scale(1.5),
    k.sprite("player"),
    k.z(10),
    //k.area({ shape: new k.Rect(k.vec2(-1, 0), 5, 5) }),
    k.area({ shape: new k.Rect(k.vec2(-2, 0), 20, 50),collisionIgnore: ["npc"]
     }),
    k.anchor("center"),
    k.body({ mass: 100, jumpForce: 400 }),
    k.doubleJump(state.current().isDoubleJumpUnlocked ? 2 : 1),
    k.opacity(),  
    k.health(state.current().playerHp),
    "player",

    {
      speed: 150,
      isAttacking: false,
      controlHandlers: [],
      walkSound: null,
      canControl: true,
      mana: 6,
      maxMana: 6,
      canDash: true,
      dashCost: 1,
      dashCooldown: 0.5,
      dashSpeed: 400,

    useMana(cost) {
      if (this.mana < cost) return false;
     this.mana -= cost;
       // TODO: update mana UI
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


      
      // 🔥 Lifecycle
      add() {
        this.setupEvents();
      },

      respawnIfOutOfBounds(
        boundvalue,
        destinationName,
        previousSceneData = {exitName:null}

      ) {
        k.onUpdate(()=>{
          if(this.pos.y > boundvalue){
            k.go(destinationName,previousSceneData);
          }
        });
      },
      

      // -------------------
      // EVENTS
      // -------------------
      setupEvents() {
        this.onFall(() => {
          this.play("fall");
        });

        this.onFallOff(() => {
          this.play("fall");
        });

        this.onGround(() => {
          if (!this.isAttacking) this.play("idle");
        });

        this.onHeadbutt(() => {
          this.play("fall");
        });

        this.on("heal", () => {
          state.set(statePropsEnum.playerHp, this.hp());
          healthBar.trigger("update");
        });

        this.on("hurt", () => {
          makeBlink(k, this);

          if (this.hp() > 0) {
            state.set(statePropsEnum.playerHp, this.hp());
             healthBar.trigger("update");
            return;
          }

          // ตาย
          state.set(
            statePropsEnum.playerHp,
            state.current().maxPlayerHp
          );

          this.play("explode");
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") {
              k.go("room1", { exitName: null });
          }

          
        });
      },
      

      // -------------------
      // CONTROLS
      // -------------------
      setControl() {
        this.controlHandlers = [];

        this.controlHandlers.push(
        k.onKeyPress("shift", () => {
         if (!this.canControl) return;
        this.dash();
        })
       );

        //skill
        this.controlHandlers.push(
  k.onKeyPress("c", () => {
    if (!this.canControl || this.isAttacking) return;
    this.castSkill()
    
  })
);

        // Jump
        this.controlHandlers.push(
          k.onKeyPress("x", () => {
            if (!this.canControl) return;
            this.doubleJump();
            if (this.curAnim() !== "jump") this.play("jump");
            if (this.walkSound) {
               this.walkSound.stop();
               this.walkSound = null; 
              }
            if (this.walkSound) {
              this.walkSound.stop();
               this.walkSound = null;
              }
            
          })
        );

        // Attack
        this.controlHandlers.push(
          k.onKeyPress("z", () => {
            
            if (!this.canControl || !this.isGrounded()) return;

            this.isAttacking = true;
            this.play("attack");
            if (this.walkSound) {
           this.walkSound.stop();
           this.walkSound = null;
            }

            const hitbox = this.add([
              k.pos(this.flipX ? -45 : 10, -10),
              k.area({ shape: new k.Rect(k.vec2(0), 30, 15) }),
              "sword-hitbox",
            ]);

            // auto destroy hitbox
            k.wait(0.2, () => {
              if (hitbox.exists()) k.destroy(hitbox);
            });
          })
        );


        this.controlHandlers.push(
          k.onKeyRelease("z", () => {
            if (!this.canControl) return;
            this.isAttacking = false;

            if (k.isKeyDown("left") || k.isKeyDown("right")) {
              this.play("run");
            } else {
              this.play("idle");
            }
          })
        );

        // Movement
        this.controlHandlers.push(
          k.onKeyDown((key) => {
            if (!this.canControl || this.isAttacking) return;

            if (key === "left") {
              this.flipX = true;
              this.move(-this.speed, 0);
              if (this.isGrounded() && this.curAnim() !== "run") this.play("run");
              if (this.isGrounded() && !this.walkSound) {
                console.log("playSound")
              this.walkSound = k.play("playerWalk", { loop: true, volume: 1 });
            }
              
            }
            

            if (key === "right") {
              this.flipX = false;
              this.move(this.speed, 0);
              if (this.isGrounded() && this.curAnim() !== "run")  this.play("run");
              if (this.isGrounded() && !this.walkSound) {
                console.log("playSound")
        this.walkSound = k.play("playerWalk", { loop: true, volume: 1 });
      }
            }
          })
        );

        this.controlHandlers.push(
          k.onKeyRelease((key) => {
            if (!this.canControl) return;
            if (
              (key === "left" || key === "right") &&
              !k.isKeyDown("left") &&
              !k.isKeyDown("right") &&
              this.isGrounded()
            ) {
              this.play("idle");

            if (this.walkSound) {
             this.walkSound.stop();
             this.walkSound = null;
            }
            }
          })
        );
      },
      

      disableControls() {
        this.controlHandlers.forEach((h) => h.cancel());
      },

      setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
      },

      enableDoubleJump() {
  this.unuse("doubleJump")     // ลบของเดิม (1 jump)
  this.use(k.doubleJump(2))    // ใส่ใหม่เป็น 2 jumps
},
   castSkill(){
    if (!this.useMana(2)) return;

    const dir = this.flipX ?-1:1
   

    const Skill = this.add([
      k.sprite("fireball", { anim: "cast" }),
      k.pos(dir *20,-10),
      k.area({
        shape: new k.Rect(k.vec2(0, 0), 10, 8)
      }),
      k.anchor("center"),
      k.move(k.vec2(dir,0),200),
      "player-skill"
    ]);

    Skill.play("cast");

      Skill.onUpdate(() => {
    if (Skill.pos.x > 1000 || Skill.pos.x < -1000) {
      Skill.destroy()
    }
  });
   },

   //Dash
   dash() {
  if (!this.canDash) return;
  if (!this.useMana(this.dashCost)) return;

  this.canDash = false;

  const dir = this.flipX ? -1 : 1;
   
  

  this.vel.x = dir * 800;
 console.log("dash")
  k.wait(0.5, () => {
    this.vel.x = 0;
  

  });

  k.wait(this.dashCooldown, () => {
    this.canDash = true;
  });
},
   
    },

    
    
    

  ]);

  

}