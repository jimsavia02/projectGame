export const statePropsEnum = {
    playerHp: "playerHp",
    isDoubleJumpUnlocked: "isDoubleJumpUnlocked",
    playerIsInBossFight: "playerIsInBossFight",
    isBossDefeated: "isBossDefeated",
};

function initStateManager() {
    const state = {
        playerHp:5,
        maxPlayerHp: 5,
        playerMana: 6,
        isDoubleJumpUnlocked: false,
        playerInBossFight: false,
        isBossDefeated: false,
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