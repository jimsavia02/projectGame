// door2.js
export function makeDoor2(k, position) {
    return k.make([
        k.sprite("door"), // ใส่ชื่อ Sprite ที่คุณโหลดไว้
        k.pos(position),
         k.anchor("center"),
       k.area({ shape: new k.Rect(k.vec2(0,0), 16, 90) }),
        k.body({ isStatic: true }), // เป็นกำแพงที่เดินผ่านไม่ได้ในตอนแรก
        k.offscreen({ hide: true }),
        "door2", // Tag สำหรับอ้างอิง
        {
            isOpen: false,
            // ฟังก์ชันสำหรับสั่งเปิดประตู
            open() {
                if (this.isOpen) return;
                this.isOpen = true;
                this.unuse("body");    // ลบ Collider ออกเพื่อให้เดินผ่านได้
                this.opacity = 0.3;     // ทำให้จางลงเพื่อให้รู้ว่าเปิดแล้ว
            },
            // ฟังก์ชันสำหรับสั่งปิดประตู (ถ้าต้องการ)
            close() {
                if (!this.isOpen) return;
                this.isOpen = false;
                this.use(k.body({ isStatic: true })); // กลับมาเป็นกำแพง
                this.opacity = 1;
            }
        }
    ]);
}