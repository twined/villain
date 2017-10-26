import _ from 'underscore';
import autosize from 'autosize';

import '../utils/mixins';
import Block from '../block';

const Markdown = Block.extend({
  type: 'markdown',
  blockName: 'markdown',
  blockIcon: 'fa-hashtag',
  template: _.template(
    '<div class="villain-md-block villain-content"><textarea><%= content %></textarea></div>'
  ),

  afterRenderCallback() {
    const textarea = this.$('.villain-md-block textarea');
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
});

export default Markdown;
