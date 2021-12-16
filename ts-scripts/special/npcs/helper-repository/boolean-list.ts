export class NPCsBooleanList {
  /**
   * Returns a list of all of the true values
   */
   list(this: NPCsBooleanList, separator?: string): string {
    let keys: (keyof NPCsBooleanList)[] = Object.keys(this) as (keyof NPCsBooleanList)[];
    let output = ''

    keys.forEach((key: keyof NPCsBooleanList) => {
      if (this[key]) {
        if (output !== '')
          output += separator || '';

        output += key;
      }
    });

    return output;
  }
}