export function makeEnemyTree(k,initialPos){

    return k.make([
        k.pos(initialPos),
        k.sprite("enemyTree",{anim: "idle"}),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 5), 20, 50) }),
        k.body({isStatic:true}),
        k.health(5),
        k.scale(2),
        "Tree",{
        add() {
        this.flipX = true
        this.setBehavior();
        this.setEvents();
        
         },

         setEvents(){
            this.onCollide("sword-hitbox", () => {
          if (this.isDead) return;
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