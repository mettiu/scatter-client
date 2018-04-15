
class Commander {
  constructor() {
    this.commands = {};
  }

  createCommand(command) {
    if (!command.name) return;
    this.commands[command.name] = command;
  }

  exec(name, ...args) {
    // return console.log(name, this.commands[name].action());
    return this.commands[name] && this.commands[name].action(...args);
  }
}

const instance = new Commander();
Object.freeze(instance);

module.exports = instance;
