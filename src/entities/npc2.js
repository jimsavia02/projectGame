export function makeNPC2(k, player, x, y, onKeyReceived) {
  let canTalk = false;
  let dialogIndex = 0;
  let isTalking = false;
  let hasReceivedKey = false;
  let canPressE = true; // ✅ Cooldown สำหรับการกด E

  const npc2 = k.add([
    k.pos(x, y),
    k.sprite("npc2"),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 12) }),
    k.scale(2),
    "npc2"
  ]);

  npc2.allowTalk = true;
  npc2.play("idle");
  npc2.flipX = true;

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

  // --- 2. ตรวจสอบระยะห่าง ---
  npc2.onUpdate(() => {
    const dist = player.pos.dist(npc2.pos);
    if (dist < 60) {
      canTalk = true;
    } else {
      canTalk = false;
      isTalking = false;
      canPressE = true; // ✅ รีเซ็ต cooldown เมื่อผู้เล่นเดินหนี
      dialogBox.opacity = 0;
      dialogIndex = 0;
      content.text = "";
    }
  });

  // --- 3. Dialog System ---
  function nextDialog() {
    dialogBox.opacity = 0.9;

    // ✅ ถ้าผู้เล่นยังไม่มี key
    if (!hasReceivedKey) {
      const dialogs = [
        "นายช่วยฉันหน่อย!",
        "ฉันต้องการกุญแจ",
        "นำกุญแจมาให้ฉัน แล้วฉันจะเปิดประตูให้"
      ];

      if (dialogIndex < dialogs.length) {
        content.text = dialogs[dialogIndex];
        dialogIndex++;
      } else {
        dialogBox.opacity = 0;
        dialogIndex = 0;
        content.text = "";
      }
    } else {
      // ✅ ถ้าผู้เล่นมี key แล้ว
      const completeDialogs = [
        "Thankyou",
        "Door is opened"
      ];

      if (dialogIndex < completeDialogs.length) {
        content.text = completeDialogs[dialogIndex];
        dialogIndex++;
      } else {
        dialogBox.opacity = 0;
        dialogIndex = 0;
        content.text = "";
      }
    }
    
    // ✅ รีเซ็ต isTalking ให้สามารถกด E ได้ต่อไป
    isTalking = false;
  }

  // --- 4. Key Receive Logic ---
  function receiveKey() {
    // ✅ เช็คว่าผู้เล่นถือ key หรือไม่
    const keys = k.get("key");
    let hasKeyInHand = false;

    for (const keyEntity of keys) {
      if (keyEntity.isGrabbed && keyEntity.grabber === player) {
        hasKeyInHand = true;
        break;
      }
    }

    if (hasKeyInHand && !hasReceivedKey) {
      hasReceivedKey = true;
      dialogIndex = 0;
      
      // ✅ ลบ key ออกจากมือ player
      for (const keyEntity of keys) {
        if (keyEntity.isGrabbed && keyEntity.grabber === player) {
          keyEntity.isGrabbed = false;
          keyEntity.grabber = null;
          k.destroy(keyEntity);
          break;
        }
      }

      // ✅ เรียก callback เพื่อทำลาย barrier4
      if (onKeyReceived) {
        onKeyReceived();
      }

      nextDialog();
    } else if (!hasKeyInHand && !hasReceivedKey) {
      // ✅ ยังไม่มี key ในมือ
      content.text = "you dont have a key!";
      isTalking = true;
      dialogBox.opacity = 0.9;
      k.wait(2, () => {
        dialogBox.opacity = 0;
        isTalking = false;
      });
    }
  }

  // --- 5. E Key Press Handler ---
  k.onKeyDown("e", () => {
    if (!canTalk || !canPressE) return; // ✅ ตรวจสอบ cooldown

    canPressE = false; // ✅ ปิด input ชั่วคราว
    
    // ✅ ถ้ายังไม่ได้รับ key ให้ตรวจสอบว่ามี key ไหม
    if (!hasReceivedKey) {
      receiveKey();
    } else {
      // ✅ ถ้าได้ key แล้ว ให้ปรอท
      nextDialog();
    }

    // ✅ รอ 0.5 วินาที แล้วปลดล็อค E
    k.wait(0.5, () => {
      canPressE = true;
    });
  });

  // --- 6. Interaction Function ---
  npc2.tryGiveKey = function() {
    receiveKey();
  };

  return npc2;
}
