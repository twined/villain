import _ from 'underscore';
import autosize from 'autosize';

import Block from '../block';

const Html = Block.extend({
  type: 'html',
  template: _.template(
    '<div class="villain-html-block villain-content"><textarea><%= content %></textarea></div>'
  ),

  _propTextarea() {

  },

  _inputTextarea() {

  },

  afterRenderCallback() {
    const textarea = this.$('.villain-html-block textarea');
    autosize(textarea);
    setTimeout(() => autosize.update(textarea), 1000);
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
      content: '<p>Text</p>',
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
    const blockType = 'html';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-code"></i>',
      '<p>html</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Html;
