import { state } from "../state/globalState.js";

export function createInventory(k, player, makeKey) {
  let isOpen = false;
  let inventoryUI = null;
  let selectedIndex = 0;

  function openInventory() {
    if (isOpen) return;
    isOpen = true;
    selectedIndex = 0;

    // Create background overlay
    inventoryUI = k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.7),
      k.fixed(),
      k.z(1000),
    ]);

    // Create inventory panel
    const panel = inventoryUI.add([
      k.rect(400, 350, { radius: 10 }),
      k.pos(k.center()),
      k.anchor("center"),
      k.color(40, 40, 40),
      k.outline(3, k.rgb(200, 200, 200)),
    ]);

    // Title
    panel.add([
      k.text("INVENTORY", { size: 32, weight: "bold" }),
      k.pos(0, -150),
      k.anchor("center"),
      k.color(255, 255, 100),
    ]);

    // Get items from state (inventory data)
    const inventoryData = state.current().inventoryItems || [];

    if (inventoryData.length === 0) {
      // Empty inventory message
      panel.add([
        k.text("Empty", { size: 20 }),
        k.pos(0, 0),
        k.anchor("center"),
        k.color(150, 150, 150),
      ]);
    } else {
      // Display items
      let yOffset = -100;
      for (let i = 0; i < inventoryData.length; i++) {
        const item = inventoryData[i];
        const isSelected = i === selectedIndex;
        const color = isSelected ? k.rgb(255, 255, 0) : k.rgb(200, 200, 200);
        const prefix = isSelected ? "> " : "  ";

        panel.add([
          k.text(`${prefix}${item.name} x${item.count}`, { size: 18 }),
          k.pos(-150, yOffset),
          k.anchor("left"),
          k.color(color),
        ]);
        yOffset += 40;
      }
    }

    // Controls hint
    panel.add([
      k.text("↑↓ Select | V Drop | I Close", { size: 12 }),
      k.pos(0, 140),
      k.anchor("center"),
      k.color(150, 150, 150),
    ]);
  }

  function closeInventory() {
    if (!isOpen) return;
    isOpen = false;

    // Destroy inventory UI
    if (inventoryUI) {
      k.destroy(inventoryUI);
      inventoryUI = null;
    }
  }

  function toggleInventory() {
    if (isOpen) {
      closeInventory();
    } else {
      openInventory();
    }
  }

  function dropItem() {
    if (!isOpen) return;
    
    const currentInventory = state.current().inventoryItems || [];
    if (currentInventory.length === 0) return;

    const item = currentInventory[selectedIndex];
    if (!item) return;

    // Only support dropping keys for now
    if (item.name === "Key") {
      // Decrease count
      item.count--;
      if (item.count <= 0) {
        currentInventory.splice(selectedIndex, 1);
        if (selectedIndex >= currentInventory.length && selectedIndex > 0) {
          selectedIndex--;
        }
      }
      
      // Create a new array to ensure state updates properly
      const updatedInventory = JSON.parse(JSON.stringify(currentInventory));
      state.set("inventoryItems", updatedInventory);

      // Spawn key at player position
      if (makeKey) {
        const newKey = k.add(makeKey(k, k.vec2(player.pos.x, player.pos.y)));
      }

      // Refresh inventory display
      closeInventory();
      openInventory();
    }
  }

  function selectUp() {
    if (!isOpen) return;
    const inventoryData = state.current().inventoryItems || [];
    if (inventoryData.length === 0) return;
    selectedIndex = (selectedIndex - 1 + inventoryData.length) % inventoryData.length;
    closeInventory();
    openInventory();
  }

  function selectDown() {
    if (!isOpen) return;
    const inventoryData = state.current().inventoryItems || [];
    if (inventoryData.length === 0) return;
    selectedIndex = (selectedIndex + 1) % inventoryData.length;
    closeInventory();
    openInventory();
  }

  return {
    toggle: toggleInventory,
    open: openInventory,
    close: closeInventory,
    isOpen: () => isOpen,
    drop: dropItem,
    selectUp: selectUp,
    selectDown: selectDown,
  };
}
