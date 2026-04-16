export function makeBoss(k, pos) {
   const boss = k.add([
         k.sprite("boss"),
         k.pos(pos),
        k.anchor("bot"), 
 k.area({ shape: new k.Rect(k.vec2(-35, 0), 35, 50) }),
 k.body(),
 k.health(100),
        k.state("idle", ["idle", "walk", "attack", "cast", "death"]),
        "boss",
        {
            speed: 70,
            damage: 1,
        }
    ]);

    // ✅ แก้ไข Logic การหันหน้า: เดินซ้ายหันซ้าย เดินขวาหันขวา
    function facePlayer() {
        const player = k.get("player")[0];
        if (!player) return;

        if (player.pos.x < boss.pos.x) {
            // ผู้เล่นอยู่ทางซ้ายของบอส -> บอสต้องหันซ้าย
            boss.flipX = false;
        } else {
            // ผู้เล่นอยู่ทางขวาของบอส -> บอสต้องหันขวา
            boss.flipX = true;
        }
    }

    // --- [State: Idle] ---
    boss.onStateEnter("idle", () => {
        boss.play("idle");
        facePlayer(); 
        k.wait(2, () => {
            if (boss.state !== "idle") return;
            const player = k.get("player")[0];
            if (player && boss.pos.dist(player.pos) > 250) {
                boss.enterState("cast");
            } else {
                boss.enterState("walk");
            }
        });
    });

    // --- [State: Walk] ---
    boss.onStateEnter("walk", () => boss.play("walk"));
    boss.onStateUpdate("walk", () => {
        const player = k.get("player")[0];
        if (!player) return;

        facePlayer(); // หันหน้าตามตำแหน่งผู้เล่นขณะเดิน
        const dir = player.pos.x < boss.pos.x ? -1 : 1;
        boss.move(dir * boss.speed, 0);

        if (boss.pos.dist(player.pos) < 90) boss.enterState("attack");
    });

    // --- [State: Attack] ---
    boss.onStateEnter("attack", () => {
        facePlayer(); // หันหน้าไปหาผู้เล่นก่อนเริ่มตี
        boss.play("attack");

        boss.onAnimEnd((anim) => {
            if (anim === "attack") {
                // คำนวณจุดปล่อย Hitbox: ถ้าหันซ้าย (flipX=true) ให้ offsetX เป็นลบ
                const offsetX = boss.flipX ? 65 : -65;

                const atkArea = boss.add([
                    k.area({ shape: new k.Rect(k.vec2(offsetX, 35), 100, 50) }),
                    k.anchor("center"),
                    "bossAttackHitbox",
                ]);

                atkArea.onCollide("player", (p) => {
                    p.hurt(boss.damage);
                    k.shake(1);
                });

                k.wait(0.1, () => {
                    k.destroy(atkArea);
                    boss.enterState("idle");
                });
            }
        });
    });

    // --- [State: Cast] ---
    boss.onStateEnter("cast", () => {
        facePlayer(); // หันหน้าไปหาผู้เล่นก่อนใช้สกิล
        boss.play("prepare");
        const player = k.get("player")[0];
        if (player) spawnSpell(k, player.pos);
        k.wait(1.5, () => boss.enterState("idle"));
    });

    // --- [State: Death / Hurt] ---
    boss.onStateEnter("death", () => {
        boss.play("death");
        boss.unuse("body");
        boss.onAnimEnd((anim) => {
            if (anim === "death") k.wait(1, () => k.destroy(boss));
        });
    });

    boss.on("hurt", () => {
        if (boss.hp() <= 0) boss.enterState("death");
    });

    return boss;
}

// ✅ ฟังก์ชันสกิล: รับดาเมจครั้งเดียวต่อการร่าย
export function spawnSpell(k, targetPos) {
    const vortex = k.add([
        k.sprite("spell_vortex", { anim: "vortex" }),
        k.pos(targetPos.x, targetPos.y),
        k.anchor("bot"),
        k.area({ shape: new k.Rect(k.vec2(0), 0, 0) }),
        "vortex_warning",
        {
            hasDoneDamage: false 
        }
    ]);

    k.wait(0.8, () => {
        vortex.play("fall");
        vortex.area.shape = new k.Rect(k.vec2(0, 20), 20, 80);

        vortex.onUpdate(() => {
            const player = k.get("player")[0];
            if (player && vortex.isOverlapping(player) && !vortex.hasDoneDamage) {
                player.hurt(2);
                k.shake(1);
                vortex.hasDoneDamage = true; 
            }
        });

        vortex.onAnimEnd(() => k.destroy(vortex));
    });
} 