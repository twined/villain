import _ from 'underscore';

import '../utils/mixins.js';
import Block from '../block';

const Markdown = Block.extend({
  type: 'markdown',
  template: _.template(
    '<div class="villain-md-block villain-content"><textarea><%= content %></textarea></div>'
  ),

  initialize(editor, json, store) {
    Block.prototype.initialize.apply(this, [editor, json, store]);
    _.extend(this.events, Block.prototype.events);
  },

  afterRenderCallback() {
    this.$('textarea')
      .autogrow({
        onInitialize: true,
        fixMinHeight: true,
      });
  },

  renderEditorHtml() {
    const blockTemplate = this.renderContentBlockHtml();
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  renderContentBlockHtml() {
    const text = this.getTextBlockInner() ? this.getTextBlockInner() : this.data.text;
    return this.template({
      content: text,
    });
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: 'Markdown',
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  getJSON() {
    const textNode = this.$('textarea').val();

    return {
      type: this.type,
      data: {
        text: textNode,
      },
    };
  },

  getHTML() {
    const textNode = this.$('textarea').val();
    return textNode;
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'markdown';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-code"></i>',
      '<p>markdown</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Markdown;
