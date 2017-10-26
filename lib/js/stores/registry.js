'use strict';

import _ from 'underscore';

import '../utils/mixins';
import VillainError from '../errors/error';

import Text from '../blocks/text';
import Header from '../blocks/header';
import Blockquote from '../blocks/blockquote';
import List from '../blocks/list';
import Image from '../blocks/image';
import Slideshow from '../blocks/slideshow';
import Video from '../blocks/video';
import Gmap from '../blocks/gmap';
import Divider from '../blocks/divider';
import Html from '../blocks/html';
import Markdown from '../blocks/markdown';
import Columns from '../blocks/columns';

const DEFAULT_BLOCKS = [{
  name: 'Text',
  cls: Text,
}, {
  name: 'Header',
  cls: Header,
}, {
  name: 'Blockquote',
  cls: Blockquote,
}, {
  name: 'List',
  cls: List,
}, {
  name: 'Image',
  cls: Image,
}, {
  name: 'Slideshow',
  cls: Slideshow,
}, {
  name: 'Video',
  cls: Video,
}, {
  name: 'Map',
  cls: Gmap,
}, {
  name: 'Divider',
  cls: Divider,
}, {
  name: 'Html',
  cls: Html,
}, {
  name: 'Markdown',
  cls: Markdown,
}, {
  name: 'Columns',
  cls: Columns,
}];

export default class BlockRegistry {
  constructor(editor, defaultBlocks, extraBlocks) {
    this.editor = editor;

    if (defaultBlocks.length > 0) {
      this.registry = defaultBlocks;
    } else {
      this.registry = DEFAULT_BLOCKS;
    }

    if (extraBlocks.length > 0) {
      this.addExtraBlocks(extraBlocks);
    }

    this.checkBlocks();
  }

  addExtraBlocks(extraBlocks) {
    this.registry = this.registry.concat(extraBlocks);
  }

  add(block) {
    this.registry.push(block);
  }

  checkBlocks() {
    for (let i = 0; i < this.registry.length; i += 1) {
      const b = this.registry[i];

      if (_.isUndefined(b.cls)) {
        throw new VillainError(
          `Villain: Missing block source for ${b.name}! Please ensure it is included.`
        );
      }
    }
  }

  getBlockClassByType(type) {
    const b = _.find(this.registry, { name: _(type).capitalize() });
    if (b) {
      return b.cls;
    }

    return false;
  }
}
