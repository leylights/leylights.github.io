export class NPCsSpellcasterData {
    constructor(data) {
        this.list = data.spellList;
        this.spellcastingLevel = data.spellcastingLevel || null;
        this.spellcastingAbility = data.spellcastingAbility;
        this.characterData = data.characterData || null;
    }
    get dividedSpellList() {
        const dividedList = [[], [], [], [], [], [], [], [], [], []];
        // populate the divided list
        this.list.forEach((spell) => {
            dividedList[spell.level].push(spell);
        });
        return dividedList;
    }
    clone() {
        return new NPCsSpellcasterData({
            spellList: this.list,
            spellcastingLevel: this.spellcastingLevel,
            spellcastingAbility: this.spellcastingAbility,
            characterData: this.characterData,
        });
    }
}
NPCsSpellcasterData.spellSlotsByLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 2, 2, 2, 1, 1], // 20
];
//# sourceMappingURL=spellcaster-data.js.map