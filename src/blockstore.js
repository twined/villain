/**
 * blockstore.js
 * This is where we store the blocks. There are multiple stores to deal
 * with columns/superblocks. The columns blocks have their own store
 * named after their id.
 */

Villain.BlockStore = [];
Villain.BlockStore.stores = [];
Villain.BlockStore.count = 1;

// Don't need storeName here, since we never want two equal ids
Villain.BlockStore.getId = function() {
    id = Villain.BlockStore.count;
    Villain.BlockStore.count++;
    return id;
};

Villain.BlockStore.getBlockById = function(storeName, id) {
    block = _.find(Villain.BlockStore[storeName], function(b) {
        return b.id == id;
    });
    if (!block) {
        return false;
    }
    if (!block.hasOwnProperty('object')) {
        return false;
    }
    return block.object;
};

Villain.BlockStore.add = function(store, id, blockObject) {
    Villain.BlockStore[store].push({
        id: id,
        object: blockObject
    });
};

Villain.BlockStore.del = function(store, id) {
    Villain.BlockStore[store] = _.filter(Villain.BlockStore[store], function(block) {
        return parseInt(block.id) !== parseInt(id);
    });
};

Villain.BlockStore.delStore = function(store) {
    // iterate all blocks
    _.each(Villain.BlockStore[store], function(element, index) {
        element.object.destroy();
    });
    Villain.BlockStore[store] = [];
    var index = Villain.BlockStore.stores.indexOf(store);
    Villain.BlockStore.stores.splice(index, 1);
};

Villain.BlockStore.create = function(name) {
    Villain.BlockStore[name] = [];
    Villain.BlockStore.stores.push(name);
};

Villain.BlockStore.listAll = function() {
    for (var i = 0; i < Villain.BlockStore.stores.length; i++) {
        console.log(Villain.BlockStore.stores[i]);
        console.log(Villain.BlockStore[Villain.BlockStore.stores[i]]);
    }
};
