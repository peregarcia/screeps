/**
 * Extend creep
 */
module.exports = function () {
    /**
     * Get rampart index
     * @return {string|null}
     */
    Creep.prototype.getRampartIndex = function () {
        if (typeof this.memory.rampart_index == 'undefined') return null;
        return this.memory.rampart_index;
    };

    /**
     * Set rampart index
     * @param {string|null} rampart_index
     */
    Creep.prototype.setRampartIndex = function (rampart_index) {
        if (this.memory.rampart_index != rampart_index) {
            this.memory.rampart_index = rampart_index;
        }
    };

    /**
     * Assigns a rampart to the worker
     * @returns {string|null}
     */
    Creep.prototype.assignRampart = function () {
        // initialize variables
        var ramparts = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART
            }
        });
        var rampartsLength = ramparts.length;
        var soldiers = this.room.getAllSoldiers();
        var soldiersLength = soldiers.length;
        // get current soldiers ramparts
        var currentSoldiersRamparts = [];
        for (let i = 0; i < soldiersLength; i++) {
            if (soldiers[i].getSourceIndex() !== null) {
                currentSoldiersRamparts.push(soldiers[i].getSourceIndex());
            }
        }
        // get an empty rampart
        for (let i = 0; i < rampartsLength; i++) {
            if (currentSoldiersRamparts.indexOf(ramparts[i].id) === -1) {
                this.setSourceIndex(ramparts[i].id);
                return ramparts[i].id;
            }
        }
        return null;
    };

    /**
     * Revoke a worker rampart.
     */
    Creep.prototype.revokeRampart = function () {
        this.setRampartIndex(null);
    };

    /**
     * Defend room
     */
    Creep.prototype.setToDefendRoom = function () {
        if (this.getRampartIndex() === null) {
            if (this.assignRampart() === null) {
                this.setToAttackNearestTarget();
            }
        }
        var rampart = Game.getObjectById(this.getRampartIndex());
        if (rampart !== null) {
            if (!rampart.pos.isEqualTo(this.pos)) {
                this.moveTo(rampart);
            } else {
                var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target !== null) {
                    switch (this.memory.archetype) {
                        case 'attacker':
                            this.attack(target);
                            break;
                        case 'defender':
                            this.rangedAttack(target);
                            break;
                    }
                }
            }
        } else {
            // rampart does not longer exist
            this.revokeRampart();
        }
    };

    /**
     * Attack room
     */
    Creep.prototype.setToAttackRoom = function (roomName) {
        if (this.room.name != roomName) {
            var exitDir = this.room.findExitTo(roomName);
            var exit = this.pos.findClosestByPath(exitDir);
            this.moveTo(exit, {reusePath: 0});
        } else {
            this.setToAttackNearestTarget();
        }
    };

    /**
     * Attack nearest hostile creep
     */
    Creep.prototype.setToAttackNearestTarget = function () {
        var target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (target !== null) {
            this.moveTo(target);
            switch (this.memory.archetype) {
                case 'attacker':
                    this.attack(target);
                    break;
                case 'defender':
                    this.rangedAttack(target);
                    break;
            }
        } else {
            var target = this.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType != STRUCTURE_STORAGE && structure.structureType != STRUCTURE_CONTROLLER
                }
            });
            if (target !== false) {
                switch (this.memory.archetype) {
                    case 'attacker':
                        if (this.attack(target) == ERR_NOT_IN_RANGE) {
                            this.moveTo(target, {reusePath: 0});
                        }
                        break;
                    case 'defender':
                        if (this.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                            this.moveTo(target, {reusePath: 0});
                        }
                        break;
                }
            }
        }
    };

    /**
     * Heal most damaged attacker or follow the nearest attacker
     */
    Creep.prototype.setToHealMostDamagedAttacker = function () {
        let soldiers = this.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.memory.role == 'soldier' && creep.hits < creep.hitsMax
            }
        });
        if (soldiers.length > 0) {
            soldiers.sort(function (a, b) {
                return a.hits - b.hits;
            });
            this.moveTo(soldiers[0], {reusePath: 0});
            if (this.pos.isNearTo(soldiers[0])) {
                this.heal(soldiers[0]);
            } else {
                this.rangedHeal(soldiers[0]);
            }
        } else {
            let soldiers = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return creep.memory.role == 'soldier' && creep.memory.archetype == 'attacker'
                }
            });
            if (soldiers.length > 0) {
                this.moveTo(soldiers[0], {reusePath: 0});
            }
        }
    };

    /**
     * Scouting Mission
     */
    Creep.prototype.setToScout = function () {
        /**
         * Choose room to go.
         * Move to room.
         * Avoid other creeps.
         * Maybe can get stuck so check if it's possible to go to the room.
         * If we like the room claim it.
         */
        if (this.room.name != 'E67N51') {
            var exitDir = this.room.findExitTo('E67N51');
            var exit = this.pos.findClosestByRange(exitDir);
            this.moveTo(exit);
        } else {
            var result = this.claimController(this.room.controller);
            if (result == OK) {
            } else if (result == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            } else  {
            }
        }
    };
};
