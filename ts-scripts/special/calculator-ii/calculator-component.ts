export class CalculatorComponent {
  debug: boolean

  protected constructor(debug: boolean) {
    this.debug = debug;
  }

  protected log(messages: any) {
    if (this.debug) console.log(messages);
  }

  protected static log(debug: boolean, messages: any) {
    if (debug) console.log(messages);
  }
}
