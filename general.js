/**
 * The general will command the troops based on an strategy to win any opponent.
 */
var general = {
    /**
     * Set current general mode
     * @return {string} getMode
     */
    getMode: function () {
        return Memory.general.mode;
    },

    /**
     * Set current general mode
     * @param {string} mode
     */
    setMode: function (mode) {
        if (Memory.general.mode != mode) {
            Memory.general.mode = mode;
            console.log('General: ' + mode);
        }
    },

    /**
     * Command the troops to the victory.
     */
    command: function () {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let soldiers = room.getAllSoldiers();
            let soldiersLength = soldiers.length;
            if (this.getMode() == 'attack') {
                // Tell every soldier to attack
                for (let i = 0; i < soldiersLength; i++) {
                    this.attack(soldiers[i]);
                }
                // Recruit
                this.recruitAttackers(roomName);
            } else if (this.getMode() == 'defend') {
                // Tell every soldier to attack
                for (let i = 0; i < soldiersLength; i++) {
                    this.defend(soldiers[i]);
                }
                // Recruit
                this.recruitDefenders(roomName);
            }
            // Use tower if necessary
            var towers = Game.rooms[roomName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.defendRoom());
        }
    },

    /**
     * Comm'on folks! Attackers is time to join the army!
     */
    recruitAttackers: function (roomName) {
        // Useful variables
        var room = Game.rooms[roomName];
        var maxAttackers = 1;
        var maxHealers = 1;
        var attackersLength = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.memory.archetype == 'attacker').length;
        var healersLength = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.memory.archetype == 'healer').length;

        // Spawn as many as needed
        var spawns = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_SPAWN
        });
        if (spawns.length > 0) {
            var name = null;
            if (attackersLength < maxAttackers) {
                name = spawns[0].createAttacker();
            }
            if (healersLength < maxHealers) {
                name = spawns[0].createHealer();
            }
            if (name !== null && isNaN(name)) {
                console.log('Spawned soldier [level: ' + Game.creeps[name].memory.level + ', archetype: ' + Game.creeps[name].memory.archetype + ']: ' + name);
            }
        }
    },

    /**
     * Comm'on folks! Defenders is time to join the army!
     */
    recruitDefenders: function (roomName) {
        // Useful variables
        var room = Game.rooms[roomName];

        var ramparts = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART
            }
        });
        var maxDefenders = ramparts.length;
        var defendersLength = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier' && creep.memory.archetype == 'defender').length;

        // Spawn as many as needed
        if (defendersLength < maxDefenders) {
            var spawns = room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_SPAWN
            });
            if (spawns.length > 0) {
                var name = spawns[0].createDefender();
                if (name !== null && isNaN(name)) {
                    console.log('Spawned soldier [level: ' + Game.creeps[name].memory.level + ', archetype: ' + Game.creeps[name].memory.archetype + ']: ' + name);
                }
            }
        }
    },

    /**
     * Attack the nearest hostile creep
     * @param soldier
     */
    attack: function (soldier) {
        switch (soldier.memory.archetype) {
            case 'attacker':
            case 'defender':
                soldier.setToAttackNearestHostileCreep();
                break;
            case 'healer':
                soldier.setToHealMostDamagedAttacker();
                break;
        }
    },

    /**
     * Defend the base
     * @param soldier
     */
    defend: function (soldier) {
        switch (soldier.memory.archetype) {
            case 'defender':
                soldier.setToDefendRoom();
                break;
            case 'attacker':
                soldier.setToAttackNearestHostileCreep();
                break;
            case 'healer':
                soldier.setToHealMostDamagedAttacker();
                break;
        }
    },
};

module.exports = general;
