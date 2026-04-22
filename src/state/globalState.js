export const statePropsEnum = {
    playerHp: "playerHp",
    maxPlayerHp: "maxPlayerHp",
    playerMana: "playerMana",
    maxPlayerMana: "maxPlayerMana",
    isDoubleJumpUnlocked: "isDoubleJumpUnlocked",
    playerInBossFight: "playerInBossFight",
    isBossDefeated: "isBossDefeated",
    lastRoom: "lastRoom",
    inventoryItems: "inventoryItems",
};


function initStateManager() {
    const state = {
        playerHp: 5,
        maxPlayerHp: 5,
        playerMana: 6,
        maxPlayerMana: 6,
        isDoubleJumpUnlocked: false,
        playerInBossFight: false,
        isBossDefeated: false,
        lastRoom: "room3",
        inventoryItems: [],
    };

    return {
        current: () => {
            return { ...state };
        },
        set(property, value) {
            state[property] = value;
        },
    };
}

export const state = initStateManager();
