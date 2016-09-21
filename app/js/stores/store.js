'use strict';

/**
 * block_store.js
 * This is where we store the blocks. There are multiple stores to deal
 * with columns/superblocks. The columns blocks have their own store
 * named after their id.
 */

import _ from 'underscore';

class BlockStore {
  constructor() {
    // holds the names of all stores
    this.storeIndex = [];
    // holds the actual stores
    this.stores = [];
    this.count = 1;
  }

  // Don't need storeName here, since we never want two equal ids
  getId() {
    const id = this.count;
    this.count += 1;
    return id;
  }

  getBlockById(storeName, id) {
    const block = this.stores[storeName].find(b => parseInt(b.id, 10) === parseInt(id, 10));

    if (!block) {
      return false;
    }

    if (!{}.hasOwnProperty.call(block, 'object')) {
      return false;
    }

    return block.object;
  }

  add(store, id, blockObject) {
    this.stores[store].push({
      id,
      object: blockObject,
    });
  }

  del(store, id) {
    this.stores[store] = _.filter(
      this.stores[store],
      block => parseInt(block.id, 10) !== parseInt(id, 10)
    );
  }

  delStore(store) {
    // iterate all blocks
    this.stores[store].forEach(element => element.object.destroy());
    this.stores[store] = [];

    const index = this.storeIndex.indexOf(store);
    this.storeIndex.splice(index, 1);
  }

  create(name) {
    this.stores[name] = [];
    this.storeIndex.push(name);
  }
}

export default BlockStore;
