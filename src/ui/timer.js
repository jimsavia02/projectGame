import { state, statePropsEnum } from "../state/globalState.js";

export function createTimer(k) {
    // Initialize game start time if it hasn't been set yet (first room entry)
    if (state.current().gameStartTime === null) {
        state.set(statePropsEnum.gameStartTime, k.time());
    }

    const gameStartTime = state.current().gameStartTime;
    
    // สร้าง UI ตัวเลขจับเวลาที่มุมขวาบน
    const ui = k.add([
        k.text("0.00s", { size: 18, color: k.rgb(255, 255, 255) }),
        k.pos(k.width() - 20, 20),
        k.anchor("topright"),
        k.fixed(),
        k.z(100), // ให้อยู่เลเยอร์บนสุด
        {
            update() {
                const currentTime = k.time() - gameStartTime;
                this.text = currentTime.toFixed(2) + "s";
            },
            getTime() {
                return (k.time() - gameStartTime).toFixed(2);
            }
        }
    ]);

    const showSummary = (nextRoomName, currentRoomName) => {
        const finalTime = ui.getTime();
        
        // สร้าง Overlay พื้นหลัง
        const bg = k.add([
            k.rect(k.width(), k.height()),
            k.color(0, 0, 0),
            k.opacity(0.7),
            k.fixed(),
            k.z(200),
        ]);

        // แสดงเวลาที่ทำได้
        bg.add([
            k.text(`CLEAR!\nTIME: ${finalTime}s`, { size: 30, align: "center" }),
            k.pos(k.center().x, k.center().y - 40),
            k.anchor("center"),
        ]);

        // --- ปุ่ม Next Level ---
        const nextBtn = bg.add([
            k.rect(160, 45, { radius: 4 }),
            k.pos(k.center().x, k.center().y + 50),
            k.color(50, 200, 50),
            k.area(),
            k.anchor("center"),
        ]);
        nextBtn.add([k.text("NEXT", { size: 18 }), k.anchor("center"), k.color(0,0,0)]);

        nextBtn.onClick(() => k.go(nextRoomName));

        // --- ปุ่ม Retry ---
        const retryBtn = bg.add([
            k.rect(160, 45, { radius: 4 }),
            k.pos(k.center().x, k.center().y + 110),
            k.color(200, 50, 50),
            k.area(),
            k.anchor("center"),
        ]);
        retryBtn.add([k.text("RETRY", { size: 18 }), k.anchor("center"), k.color(0,0,0)]);

        retryBtn.onClick(() => k.go(currentRoomName));
    };

    return { ui, showSummary };
}