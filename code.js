/**
 * This manages the code updates and version.
 */
var code = {
  /**
   * Returns current code version.
   * @return {float} getVersion
   */
  getVersion: function() {
    return Memory.code.version;
  },

  /**
   * Sets current code version
   * @param {float} version
   */
  setVersion: function(version) {
    Memory.code.version = version;
  },

  /**
   * Update model acording to the current version
   */
  update: function() {
    // init variables
    var name = null;
    var creep = null;
    // first time run
    if (typeof Memory.code == 'undefined') {
      Memory.code = {};
    }
    if (typeof Memory.code.version == 'undefined') {
      Memory.code.version = 1.0;
    }
    // v1.1
    if (this.getVersion() == 1.0) {
      for (name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester' || creep.memory.role == 'upgrader' || creep.memory.role == 'builder') {
          creep.memory.role = 'probe';
          creep.memory.state = 'init';
          creep.memory.source_init = null;
        }
      }
      this.setVersion(1.1);
    }
    // v1.2
    if (this.getVersion() == 1.1) {
      Memory.arquitect = {};
      this.setVersion(1.2);
    }
    // v1.3
    if (this.getVersion() == 1.2) {
      for (name in Game.creeps) {
        creep = Game.creeps[name];
        if (creep.memory.role == 'probe') {
          delete creep.memory.source_init;
          creep.memory.state = 'init';
          creep.memory.source_index = null;
        }
      }
      this.setVersion(1.3);
    }
    // v1.4
    if (this.getVersion() == 1.3) {
      for (name in Game.creeps) {
        creep = Game.creeps[name];
        if (creep.memory.role == 'probe') {
          creep.memory.state = 'init';
        }
      }
      this.setVersion(1.4);
    }
    // v1.5
    if (this.getVersion() == 1.4) {
      for (name in Game.creeps) {
        creep = Game.creeps[name];
        if (creep.memory.role == 'probe') {
          creep.memory.level = 1;
        }
      }
      this.setVersion(1.5);
    }
    // v1.6
    if (this.getVersion() == 1.5) {
      Memory.arquitect.probe_locations = {};
      this.setVersion(1.6);
    }
	}
};

module.exports = code;
