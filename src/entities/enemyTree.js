export function makeEnemyTree(k,initialPos){

    return k.make([
        k.pos(initialPos),
        k.sprite("enemyTree",),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 16, 16) }),
        k.body({isStatic:false,mass: 100,}),
        k.health(5),  
        k.scale(),
        "Tree",{
        add() {
        this.flipX = true
        this.setBehavior();
        this.setEvents();
        
         },

         setEvents(){

            this.onCollide("sword-hitbox", () => {
          if (this.isDead) return;
          if (this.isDead || this.isInvincible) return;
          this.hurt(1);
          //console.log("Tree HP Remaining:", this.hp());
          this.isInvincible = true;
          this.opacity = 0.5;
          k.wait(0.2, () => {
          this.isInvincible = false;
          this.opacity = 1;
          });
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

        setBehavior() {
        },

        triggerExplode() {
          this.isDead = true;

          this.play("explode");
          this.area.enabled = false;   // ปิด hitbox
          this.body?.pause?.();        // หยุดฟิสิกส์
        },
        
    },
    
    ])

    
    
  

}