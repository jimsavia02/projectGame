export function makeNPC(k, player, x, y, dialogs, onDialogComplete) {
    let canTalk = false;
    let dialogIndex = 0;
    let isTalking = false; // ✅ เพิ่มตัวแปรเช็คสถานะการคุย
    let isWalking = false; // ✅ ตัวแปรเช็คสถานะการเดิน

    const npc = k.add([
        k.pos(x, y),
        k.sprite("npc"),
        k.anchor("center"),
        k.area({ shape: new k.Rect(k.vec2(0, 10), 20, 12) }),
        k.body(), 
        k.scale(2),
        "npc"
    ]);

    // ✅ Flag เพื่อควบคุมว่า NPC สามารถพูดได้หรือไม่
    npc.allowTalk = true;


    npc.play("idle");
    // หันหน้าซ้ายขวา
    npc.flipX = true;

    // --- 1. สร้าง UI Dialog Box (ซ่อนไว้ก่อน) ---
    const dialogBox = k.add([
        k.rect(k.width() - 400, 120, { radius: 8 }), // ขนาดกล่อง
        k.pos(k.center().x, k.height() - 100),       // ตำแหน่งล่างจอ
        k.anchor("center"),
        k.color(0, 0, 0),                           // สีดำ
        k.outline(1, k.rgb(255, 255, 255)),          // เส้นขอบสีขาว
        k.opacity(0),                               // เริ่มต้นให้โปร่งใส (ซ่อน)
        k.fixed(),                                  // ✅ สำคัญ: ให้ติดหน้าจอ ไม่เลื่อนตามแมพ
        k.z(100),
    ]);

    const content = dialogBox.add([
        k.text("", { size: 24, width: k.width() - 450 ,}),
        
        k.pos(0, 0),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]);

    // --- 2. เช็คระยะห่างเหมือนเดิม ---
    npc.onUpdate(() => {
        const dist = player.pos.dist(npc.pos);
        if (dist < 60) {
            canTalk = true;
        } else {
            canTalk = false;
            // ถ้าเดินหนี ให้ปิดกล่องข้อความทันที
            isTalking = false;
            dialogBox.opacity = 0;
            dialogIndex = 0;
            content.text = ""
        }
    });

    // ✅ เพิ่มฟังก์ชัน attack สำหรับ NPC
    npc.attack = function() {
        // NPC ไม่มี attack animation ให้ใช้ idle แทน
        npc.play("idle");
        
        const hitbox = npc.add([
            k.pos(npc.flipX ? -25 : 5, -10),
            k.area({ shape: new k.Rect(k.vec2(0), 30, 30) }),
            "sword-hitbox",
        ]);

        // auto destroy hitbox
        k.wait(0.1, () => {
            if (hitbox.exists()) k.destroy(hitbox);
        });
    };

    // ✅ เพิ่มฟังก์ชันให้ NPC เดินไปยัง target position
    npc.walkTo = function(targetX, targetY, speed = 100, onReach = null) {
        isWalking = true;
        npc.play("idle");
        
        const walkInterval = k.onUpdate(() => {
            if (!isWalking) {
                walkInterval.cancel();
                return;
            }

            const dist = npc.pos.dist(k.vec2(targetX, targetY));
            
            // ✅ ถ้าระยะห่างน้อยกว่า 15 pixels ถือว่าถึงจุดหมาย
            if (dist < 15) {
                // ถึงจุดหมายแล้ว - ตั้งตำแหน่งที่แน่นอน
                npc.pos.x = targetX;
                npc.pos.y = targetY;
                npc.play("idle");
                npc.vel.x = 0;
                isWalking = false;
                walkInterval.cancel();
                
                // ✅ เพิ่ม safety interval เพื่อให้แน่ใจว่า NPC ยังเป็น idle
                const ensureNPCIdleInterval = k.onUpdate(() => {
                    if (npc.curAnim() !== "idle") {
                        npc.play("idle");
                    }
                    if (npc.vel.x !== 0) {
                        npc.vel.x = 0;
                    }
                });
                
                // ยกเลิก safety interval หลังจาก 0.5 วินาที
                k.wait(0.5, () => {
                    ensureNPCIdleInterval.cancel();
                });
                
                if (onReach) onReach();
                return;
            }

            // คำนวณทิศทาง
            const angle = Math.atan2(targetY - npc.pos.y, targetX - npc.pos.x); 
            npc.flipX = Math.cos(angle) > 0;
            
            // ✅ ใช้ velocity ที่สูงพอที่จะ bypass collisions
            npc.vel.x = Math.cos(angle) * speed;
            // ไม่แก้ y เพื่อให้ gravity ทำงานปกติ
        });
    };

    function nextDialog() {
        isTalking = true;
        dialogBox.opacity = 0.9;

        if (dialogIndex < dialogs.length) {
            content.text = dialogs[dialogIndex];
            dialogIndex++;
        } else {
            // ✅ คุยจบแล้ว: ปิดกล่อง, รีเซ็ต index
            dialogBox.opacity = 0;
            dialogIndex = 0;
            content.text = "";
            isTalking = false;
            
            // ✅ หากมี callback ให้เรียก ไม่เช่นนั้นให้ปลดล็อคการควบคุม
            if (onDialogComplete) {
                onDialogComplete(npc);
            } else {
                player.enableControl();
            }
        }
    }

    // ✅ ฟังคำสั่งจาก roomutils.js (บรรทัดที่ k.get("npc")[0]?.trigger("start-dialog"))
    npc.on("start-dialog", () => {
        nextDialog();
    });

    npc.onUpdate(() => {
        const dist = player.pos.dist(npc.pos);
        // ✅ ถ้า allowTalk เป็น false ให้ canTalk เป็น false เสมอ
        if (npc.allowTalk === false) {
            canTalk = false;
        } else if (dist < 60) {
            canTalk = true;
        } else {
            canTalk = false;
            if (!isTalking) { // ปิดกล่องเฉพาะถ้าไม่ได้อยู่ในโหมดบังคับคุย
                dialogBox.opacity = 0;
                dialogIndex = 0;
                content.text = "";
            }
        }
    });

    // --- 3. จัดการการกดปุ่ม E ---
    k.onKeyPress("e", () => {
        if (!canTalk) return;

        // ✅ ตรวจสอบว่า player ถือ key หรือไม่
        if (player.grabTarget && player.grabTarget.is("key")) {
            // Player ถือ key → ทำลาย barrier2 และ key
            const barriers2 = k.get("barrier2");
            for (const barrier of barriers2) {
                if (barrier.exists()) {
                    k.tween(
                        barrier.opacity,
                        0,
                        0.5,
                        (val) => (barrier.opacity = val),
                        k.easings.linear
                    );
                    k.wait(0.5, () => {
                        if (barrier.exists()) {
                            barrier.unuse(k.body());
                            k.destroy(barrier);
                        }
                    });
                }
            }
            // ทำลาย key ที่ player กำลังถือ
            if (player.grabTarget.exists()) {
                k.destroy(player.grabTarget);
                player.grabTarget = null;
            }
            // แสดง dialog สำเร็จ
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

        isTalking = true;
        dialogBox.opacity = 0.9; // แสดงกล่อง (เกือบชัด)

        // ถ้าคุยยังไม่จบ list
        if (dialogIndex < dialogs.length) {
            content.text = dialogs[dialogIndex];
            dialogIndex++;
        } else {
            // ถ้าคุยจบแล้ว ให้ปิดกล่อง
            dialogBox.opacity = 0;
            dialogIndex = 0;
            content.text = "";
            isTalking = false;

            // ✅ หากมี callback ให้เรียก ไม่เช่นนั้นให้ปลดล็อคการควบคุม
            if (onDialogComplete) {
                onDialogComplete(npc);
            } else {
                player.enableControl();
            }
        }
    });

    return npc;
}