export const statePropsEnum = {
    playerHp: "playerHp",
    isDoubleJumpUnlocked: "isDoubleJumpUnlocked",
    playerIsInBossFight: "playerIsInBossFight",
    isBossDefeated: "isBossDefeated",
    currentRoom: "currentRoom",
    respawnPos: "respawnPos",
};

function initStateManager() {
    const state = {
        playerHp:5,
        maxPlayerHp: 5,
        playerMana: 6,
        isDoubleJumpUnlocked: false,
        playerInBossFight: false,
        isBossDefeated: false,
        currentRoom: "room1",
        respawnPos: { x: 0, y: 0 },
    };

    return {
        current: () => {
            return {...state};
        },
        set(property, value){
            state[property] =value;

        },
    };
} 

export const state = initStateManager();