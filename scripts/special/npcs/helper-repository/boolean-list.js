export class NPCsBooleanList {
    /**
     * Returns a list of all of the true values
     */
    list(separator) {
        let keys = Object.keys(this);
        let output = '';
        keys.forEach((key) => {
            if (this[key]) {
                if (output !== '')
                    output += separator || '';
                output += key;
            }
        });
        return output;
    }
}
//# sourceMappingURL=boolean-list.js.map