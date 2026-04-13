import { state, statePropsEnum } from "../state/globalState"
import { makeNotificationBox } from "../ui/notificationBox.js"
import { makeBlink } from "./entitySharedLogic.js"

export function makeBoss(k, initialPos) {

  return k.make([

    // ---------------- COMPONENTS ----------------
    k.pos(initialPos),
    k.sprite("burner", { anim: "idle" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 10), 20, 20),
    }),
    k.body({ mass: 100 },),
    k.anchor("center"),
    k.health(15),
    k.opacity(1),
    

    k.state("follow", [
      "follow",
      "open-fire",
      "fire",
      "shut-fire",
      "explode",
    ]),

    // ---------------- CUSTOM ----------------
    {
      pursuitSpeed: 100,
      fireRange: 50,
      fireDuration: 1,
      detectRange: 180,


      // ---------------- BEHAVIOR ----------------
      setBehavior() {

        const player = k.get("player", {recursive:true});
        // FOLLOW (เริ่มต้นเลย)
        this.onStateEnter("follow", () => {
          this.play("run")
        })

        this.onStateUpdate("follow", () => {



          const player = k.get("player")[0]
          if (!player) return

          const dist = this.pos.dist(player.pos)

          this.flipX = player.pos.x < this.pos.x

          if (dist < this.detectRange) {
    this.moveTo(player.pos, this.pursuitSpeed)
  } else {
    this.stop() // หยุดถ้าไกลเกิน
  }


          if (this.pos.dist(player.pos) < this.fireRange) {
            this.enterState("open-fire")
          }
        })

        // OPEN FIRE
        this.onStateEnter("open-fire", () => {
          this.play("open-fire")
        })

        // FIRE
        this.onStateEnter("fire", () => {

          this.play("fire")
          const player = k.get("player")[0]
          const sound = k.play("flamethrower")

          const fireHitbox = this.add([
            k.pos(this.flipX ? -70 : 0, 5),
            k.area({
              shape: new k.Rect(k.vec2(0), 70, 12),
            }),
            "fire-hitbox",
          ])

          fireHitbox.onCollide("player", () => {
            if (!player) return
            player.hurt(1)
          })

          k.wait(this.fireDuration, () => {
            sound.stop()
            this.enterState("shut-fire")
          })
        })

        this.onStateEnd("fire", () => {
          const hitboxes = this.get("fire-hitbox")
          hitboxes.forEach(h => k.destroy(h))
        })

        // SHUT FIRE
        this.onStateEnter("shut-fire", () => {
          this.play("shut-fire")
        })

      },

      // ---------------- EVENTS ----------------
      setEvents() {

        this.onCollide("sword-hitbox", () => {
          k.play("boom",{ volume: 0.1 })
          this.hurt(1)
        })

        this.onAnimEnd((anim) => {

          if (anim === "open-fire") {
            this.enterState("fire")
          }

          if (anim === "shut-fire") {
            this.enterState("follow")
          }

          if (anim === "explode") {
            k.destroy(this)
          }

        })

        this.on("hurt", () => {

          makeBlink(k, this)

          if (this.hp() > 0) return

          this.enterState("explode")
          this.play("explode")
          this.unuse("body")
          this.collisionIgnore = ["player"]

          state.set(statePropsEnum.isBossDefeated, true)
          state.set(statePropsEnum.isDoubleJumpUnlocked, true)

          const player = k.get("player")[0]
          if (player) player.enableDoubleJump()

          k.play("boom")
          k.play("notify")

          const notification = makeNotificationBox(k)

          k.wait(3, () => notification.close())
        })

      },

    }

  ])
}