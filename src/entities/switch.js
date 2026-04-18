// switch.js
export function makeSwitch(k, position) {
    const sw = k.make([
        k.sprite("switch",{ anim: "idle" }), 
        k.pos(position),
        // 1. ใช้ area ปกติ แต่ไม่ต้องตั้ง collisionIgnore ก็ได้หากเราเอา body ออก
        k.area(), 
        // 2. ลบ k.body() ออก หรือถ้าอยากคงไว้ให้ใช้ { isStatic: true } 
        // แต่ต้องมั่นใจว่าไม่มีฟังชั่นที่ทำให้เกิดการ "ชน" แบบแข็ง (Solid)
        "switch",
        {
            isActivated: false,
        }
    ]);

    k.onKeyPress("e", () => {
        const player = k.get("player")[0];
        
        // เช็คว่า player "สัมผัส" (Overlap) กับสวิตช์หรือไม่
        if (player && player.isColliding(sw)) {
            if (!sw.isActivated) {
                sw.isActivated = true;
                sw.play("active");

                // ทำลายประตูทั้งหมดที่มี Tag "door"
                k.get("door").forEach((d) => {
                    d.destroy();
                });

                sw.opacity = 0.5; 
                k.debug.log("Doors destroyed!");
            }
        }
    });

    return sw;
}