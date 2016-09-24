import $ from 'jquery';
import _ from 'underscore';
import marked from 'marked';

import Block from '../block';
import Markup from '../utils/markup';

const Blockquote = Block.extend({
  type: 'blockquote',
  template: _.template(
    '<div class="villain-quote-block villain-content"><blockquote contenteditable="true"><%= content %></blockquote><cite contenteditable="true"><%= cite %></cite></div>'
  ),

  renderEditorHtml: function renderEditorHtml() {
    const blockTemplate = this.renderContentBlockHtml();
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  renderContentBlockHtml: function renderContentBlockHtml() {
    const text = this.getTextBlockInner() ? this.getTextBlockInner() : this.data.text;
    return this.template({
      content: Markup.toHTML(text),
      cite: this.data.cite,
    });
  },

  renderEmpty: function renderEmpty() {
    const blockTemplate = this.template({
      content: 'quote',
      cite: 'author',
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  getJSON: function getJSON() {
    const quote = this.$content.find('blockquote')[0].outerHTML;
    const cite = $('cite', this.$content)
      .html();
    const text = Markup.toMD(quote);
    const json = {
      type: this.type,
      data: {
        text,
        cite,
      },
    };
    return json;
  },

  getHTML: function getHTML() {
    const textNode = this.getTextBlock()
      .html();
    return marked.toHTML(textNode);
  },
}, {
  /* static methods */
  getButton: function getButton(afterId) {
    const blockType = 'blockquote';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-quote-right"></i>',
      '<p>quote</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Blockquote;
