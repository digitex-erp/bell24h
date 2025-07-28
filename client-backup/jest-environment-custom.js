const JSDOMEnvironment = require('jest-environment-jsdom');

module.exports = class CustomEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.jsdom = this.dom;
  }

  async setup() {
    await super.setup();
    // Add any custom setup here
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
