import { NPCsAction } from "./action";

export type NPCsReactionList = {
  parry: NPCsReaction;
}

type NPCsReactionConstructorData = {
  name: string,
  body: string
}

export class NPCsReaction extends NPCsAction {
  constructor(data: NPCsReactionConstructorData) {
    super(data);
  }
}
