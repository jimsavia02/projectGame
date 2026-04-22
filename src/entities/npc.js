import { state } from "../state/globalState.js";

export function makeNPC(k, player, x, y, dialogs, onDialogComplete) {
    let canTalk = false;
    let dialogIndex = 0;
    let isTalking = false;
    let isWalking = false;

    const npc = k.add([
        k.pos(x, y),
        k.sprite("npc"),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 30), 20, 12) }),
        k.scale(2),
        "npc"
    ]);

    npc.allowTalk = true;
    npc.play("idle");
    npc.flipX = true;

    // --- 1. สร้าง UI Dialog Box ---
    const dialogBox = k.add([
        k.rect(k.width() - 400, 120, { radius: 8 }),
        k.pos(k.center().x, k.height() - 100),
        k.anchor("center"),
        k.color(0, 0, 0),
        k.outline(1, k.rgb(255, 255, 255)),
        k.opacity(0),
        k.fixed(),
        k.z(100),
    ]);

    const content = dialogBox.add([
        k.text("", { size: 24, width: k.width() - 450 }),
        k.pos(0, 0),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]);

    // --- 2. ฟังก์ชันเสริมสำหรับ NPC ---
    npc.attack = function() {
        npc.play("idle");
        const hitbox = npc.add([
            k.pos(npc.flipX ? -25 : 5, -10),
            k.area({ shape: new k.Rect(k.vec2(0), 30, 30) }),
            "sword-hitbox",
        ]);
        k.wait(0.1, () => { if (hitbox.exists()) k.destroy(hitbox); });
    };

    npc.walkTo = function(targetX, targetY, speed = 100, onReach = null) {
        isWalking = true;
        const walkInterval = k.onUpdate(() => {
            if (!isWalking) { walkInterval.cancel(); return; }
            const dist = npc.pos.dist(k.vec2(targetX, targetY));
            if (dist < 15) {
                npc.pos.x = targetX;
                npc.pos.y = targetY;
                npc.play("idle");
                npc.vel.x = 0;
                isWalking = false;
                walkInterval.cancel();
                if (onReach) onReach();
                return;
            }
            const angle = Math.atan2(targetY - npc.pos.y, targetX - npc.pos.x); 
            npc.flipX = Math.cos(angle) > 0;
            npc.vel.x = Math.cos(angle) * speed;
        });
    };

    function nextDialog() {
        isTalking = true;
        dialogBox.opacity = 0.9;
        if (dialogIndex < dialogs.length) {
            content.text = dialogs[dialogIndex];
            dialogIndex++;
        } else {
            dialogBox.opacity = 0;
            dialogIndex = 0;
            content.text = "";
            isTalking = false;
            if (onDialogComplete) onDialogComplete(npc);
            else player.enableControl();
        }
    }

    npc.on("start-dialog", () => { nextDialog(); });

    npc.onUpdate(() => {
        const dist = player.pos.dist(npc.pos);
        if (npc.allowTalk === false) {
            canTalk = false;
        } else if (dist < 60) {
            canTalk = true;
        } else {
            canTalk = false;
            if (!isTalking) {
                dialogBox.opacity = 0;
                dialogIndex = 0;
                content.text = "";
            }
        }
    });

    // --- 3. จัดการการกดปุ่ม E (แก้ไขส่วนการลบไอเทม) ---
    k.onKeyPress("e", () => {
        if (!canTalk) return;

        const inventoryItems = state.current().inventoryItems || [];
        // ค้นหา Index ของกุญแจ
        const keyIndex = inventoryItems.findIndex(item => item.name === "Key" && item.count > 0);

        if (keyIndex !== -1) {
            // --- ขั้นตอนการลบไอเทมออกจาก State ---
            const updatedInventory = JSON.parse(JSON.stringify(inventoryItems));
            updatedInventory[keyIndex].count--;

            // ถ้ากุญแจเหลือ 0 ให้ลบออกจากกระเป๋าเลย
            if (updatedInventory[keyIndex].count <= 0) {
                updatedInventory.splice(keyIndex, 1);
            }

            // อัปเดต Global State
            state.set("inventoryItems", updatedInventory);

            // --- ทำลาย Barrier ---
            const barriers2 = k.get("barrier2");
            for (const barrier of barriers2) {
                if (barrier.exists()) {
                    k.tween(barrier.opacity, 0, 0.5, (val) => (barrier.opacity = val), k.easings.linear);
                    k.wait(0.5, () => { if (barrier.exists()) k.destroy(barrier); });
                }
            }

            isTalking = true;
            dialogBox.opacity = 0.9;
            content.text = "Thank you! The barrier is now removed!";

            k.wait(2, () => {
                dialogBox.opacity = 0;
                isTalking = false;
                dialogIndex = 0;
                content.text = "";
                player.enableControl();
            });
            return;
        }

        // --- Dialog ปกติ (ถ้าไม่มีกุญแจ) ---
        isTalking = true;
        dialogBox.opacity = 0.9;

        if (dialogIndex < dialogs.length) {
            content.text = dialogs[dialogIndex];
            dialogIndex++;
        } else {
            dialogBox.opacity = 0;
            dialogIndex = 0;
            content.text = "";
            isTalking = false;
            if (onDialogComplete) onDialogComplete(npc);
            else player.enableControl();
        }
    });

    return npc;
}