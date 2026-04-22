import { state } from "../state/globalState.js";

export function makeNPC2(k, player, x, y, onKeyReceived) {
  let canTalk = false;
  let dialogIndex = 0;
  let isTalking = false;
  let hasReceivedKey = false;
  let canPressE = true;

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
      canPressE = true;
      dialogBox.opacity = 0;
      dialogIndex = 0;
      content.text = "";
    }
  });

  // --- 3. Dialog System ---
  function nextDialog() {
    dialogBox.opacity = 0.9;

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
      const completeDialogs = [
        "Thank you!",
        "The door is now open."
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
    isTalking = false;
  }

  // --- 4. Key Receive Logic (ส่วนที่แก้ไข) ---
  function receiveKey() {
    const inventoryItems = state.current().inventoryItems || [];
    // ค้นหาตำแหน่งกุญแจ
    const keyIndex = inventoryItems.findIndex(item => item.name === "Key" && item.count > 0);

    if (keyIndex !== -1 && !hasReceivedKey) {
      hasReceivedKey = true;
      dialogIndex = 0;
      
      // Clone array เพื่ออัปเดต state อย่างปลอดภัย
      const updatedInventory = JSON.parse(JSON.stringify(inventoryItems));
      
      // ลดจำนวนกุญแจ
      updatedInventory[keyIndex].count--;
      
      // ถ้าหมดให้ลบออกจากช่อง
      if (updatedInventory[keyIndex].count <= 0) {
        updatedInventory.splice(keyIndex, 1);
      }

      // บันทึกค่าใหม่ลง Global State
      state.set("inventoryItems", updatedInventory);

      // เรียก callback เพื่อทำลาย barrier4 (โค้ดทำลาย barrier อยู่ใน main scene)
      if (onKeyReceived) {
        onKeyReceived();
      }

      nextDialog();
    } else if (keyIndex === -1 && !hasReceivedKey) {
      content.text = "You don't have a key!";
      isTalking = true;
      dialogBox.opacity = 0.9;
      k.wait(2, () => {
        dialogBox.opacity = 0;
        isTalking = false;
      });
    }
  }

  // --- 5. E Key Press Handler ---
  k.onKeyPress("e", () => { // แนะนำใช้ onKeyPress แทน onKeyDown เพื่อป้องกันการกดค้างแล้วรัว
    if (!canTalk || !canPressE) return;

    canPressE = false;
    
    if (!hasReceivedKey) {
      receiveKey();
    } else {
      nextDialog();
    }

    k.wait(0.5, () => {
      canPressE = true;
    });
  });

  npc2.tryGiveKey = function() {
    receiveKey();
  };

  return npc2;
}