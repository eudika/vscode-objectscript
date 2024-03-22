import * as vscode from "vscode";
import commands = require("./commands.json");

type Localization = {
  label: string;
  documentation?: string[];
  link?: string;
};

type Command = Localization & {
  alias: string[];
  documentation: string[];
  link: string;
  insertText?: string;
};

const imported: { [kind: string]: Localization[] } = {};

function importLocalization(kind: string): Promise<Localization[]> {
  if (imported[kind] == null) {
    return import(`./${vscode.env.language}/${kind}.json`).then(
      (items) => (imported[kind] = items),
      () => (imported[kind] = [])
    );
  }
  return Promise.resolve(imported[kind]);
}

function importCommandLocalization(): Promise<Localization[]> {
  return importLocalization("command");
}

export async function searchCommand(search: string): Promise<Command> {
  const command = commands.find((command) => command.label === search || command.alias.includes(search));
  if (!command) {
    return null;
  }
  const local = (await importCommandLocalization()).find((l) => l.label == command.label);
  return {
    label: command.label,
    alias: command.alias,
    insertText: command.insertText,
    documentation: local.documentation ?? command.documentation,
    link: local.link ?? command.link,
  };
}
