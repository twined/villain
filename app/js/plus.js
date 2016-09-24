import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

import VillainError from './errors/error';

const Plus = Backbone.View.extend({
  el: null,
  tagName: 'div',
  className: 'villain-add-block villain-droppable',
  blockSelectionTemplate: _.template(
    '<div class="villain-block-selection"><%= content %></div>'
  ),
  events: {
    'click .villain-add-block-button': 'onClickAddBlock',
    'click .villain-block-button': 'onClickBlockButton',
  },

  initialize(options) {
    this.editor = options.editor;
    this.store = options.store;
    this.setElement(this.el);
    this.$el.attr('data-blockstore', this.store);
    this.$el.attr('id', _.uniqueId('villain-plus-'));
    this.render();
  },

  render() {
    this.$el.append('<button class="villain-add-block-button">+</button>');
    return this;
  },

  onClickBlockButton(e) {
    /* clicked a button in the add new block container */
    e.preventDefault();

    const $button = $(e.currentTarget);
    const blockType = $button.data('type');
    const blockStore = this.store;
    const BlockClass = this.editor.blockRegistry.getBlockClassByType(blockType);

    // get a new block with no data, and the specified blockStore
    const block = new BlockClass({
      editor: this.editor,
      data: false,
      store: blockStore,
    });

    block.$el.insertAfter($button.parent().parent());
    block.$el.after(block.renderPlus().$el);

    // if the block has a textblock, set the caret to the end
    if (block.hasTextBlock()) {
      block.setCaret();
    }

    // scroll to element position
    block.scrollTo();

    // show the plus
    $button.parent().prev().show();

    // hide the buttons
    $button.parent().remove();
  },

  onClickAddBlock(e) {
    e.preventDefault();

    const $addBlockButton = $(e.currentTarget);

    $addBlockButton.hide();

    const blockId = $addBlockButton.parent().data('after-block-id');
    const blockSelection = this.blockSelectionTemplate({
      content: this.getButtons(blockId),
    });

    $addBlockButton.parent().append(blockSelection);
  },

  getButtons(id) {
    // iterate through block types in the block registry
    // and get buttons for each type.
    let html = '';

    for (const { name, cls } of this.editor.blockRegistry.registry) {
      if ({}.hasOwnProperty.call(cls, 'getButton')) {
        html += cls.getButton(id);
      } else {
        throw new VillainError(`No button found for ${name}`);
      }
    }

    return html;
  },
});

export default Plus;
