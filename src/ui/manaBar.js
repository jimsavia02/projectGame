import { state } from "../state/globalState.js";
import { k } from "../kaplayLoader.js";

function makeManaBar(k) {
  return k.make([
    k.sprite("manaBar", { frame: 0 }),
    k.fixed(),
    k.anchor("topleft"),
    k.pos(80, 15), // ปรับ Y ให้ลงมาข้างล่าง Health Bar (Health Bar คุณอยู่ที่ 16)
    k.scale(3),
    k.z(100),
    {
      // Mapping ใหม่สำหรับ 7 เฟรม (0-6)
      manaMapping: {
        6: 0, //มานาเต็ม
        5: 1,
        4: 2,
        3: 3,
        2: 4,
        1: 5,
        0: 6, //มานาหมด

      },
      setEvents() {
        this.on("update", () => {
          // ดึงค่ามานาปัจจุบันจาก State
          const currentMana = state.current().playerMana || 0; 
          
          // เปลี่ยนเฟรมตาม Mapping
          if (this.manaMapping[currentMana] !== undefined) {
            this.frame = this.manaMapping[currentMana];
          }
        });
      },
    },
  ]);
}

export const manaBar = makeManaBar(k);