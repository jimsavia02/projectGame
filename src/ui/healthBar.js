import { state } from "../state/globalState.js";
import { k } from "../kaplayLoader.js";


function makeHealthBar(k) {
  return k.make([
    k.sprite("healthBar", { frame: 0 }),
    k.fixed(),
    k.anchor("topleft"), 
    k.pos(80, 16),
    k.scale(2),
    {
      hpMapping: {
        1: 4,
        2: 3,
        3: 2,
        4: 1,
        5: 0,
      },
      setEvents() {
        this.on("update", () => {
          const currentHp = state.current().playerHp;
          if (currentHp === 0) {
            k.destroy(this);
            return;
          }
          this.frame = this.hpMapping[currentHp];
        });
      },
    },
  ]);
}

export const healthBar = makeHealthBar(k);