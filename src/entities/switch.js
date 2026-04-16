// switch.js
export function makeSwitch(k, position) { // ไม่ต้องรับ targetDoor แล้ว
    const sw = k.make([
        k.sprite("switch",{ anim: "idle" }), 
        k.pos(position),
        k.area(),
        k.body({ isStatic: true }),
        "switch",
        {
            isActivated: false,
        }
    ]);

    k.onKeyPress("e", () => {
        const player = k.get("player")[0];
        
        // เช็คว่า player อยู่ใกล้สวิตช์หรือไม่
        if (player && player.isColliding(sw)) {
            if (!sw.isActivated) {
                sw.isActivated = true;
                 

                sw.play("active");
                // --- ส่วนที่เปลี่ยนใหม่ ---
                // หา Object ทั้งหมดที่มี Tag "door" แล้วทำลายทิ้ง
                k.get("door").forEach((d) => {
                    d.destroy();
                });
                // -----------------------

                sw.opacity = 0.5; 
                k.debug.log(" doors destroyed!");
            }
        }
    });

    return sw;
}