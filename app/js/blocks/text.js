import _ from 'underscore';
import marked from 'marked';
import $ from 'jquery';

import Block from '../block';
import Markup from '../utils/markup';

const Text = Block.extend({
  type: 'text',
  template: _.template(
    '<div class="villain-text-block villain-content" contenteditable="true" data-text-type="<%= type %>"><%= content %></div>'
  ),

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
      content: Markup.toHTML(text),
      type: this.data.type,
    });
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: 'Text',
      type: 'paragraph',
    });
    const actionsTemplate = this.actionsTemplate();
    return this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
  },

  getJSON() {
    const textNode = Markup.toMD(this.getTextBlockInner());
    const data = this.getData();

    return {
      type: this.type,
      data: {
        text: textNode,
        type: data.type,
      },
    };
  },

  getHTML() {
    const textNode = this.getTextBlock().html();
    return marked.toHTML(textNode);
  },

  setup() {
    const data = this.getData();
    if (!{}.hasOwnProperty.call(data, 'type')) {
      this.setDataProperty('type', 'paragraph');
    }

    const type = this.data.type;
    this.$setup.hide();

    let radios = '';
    const types = ['paragraph', 'lead'];

    for (const t of types) {
      let selected = '';

      if (t === type) {
        selected = ' checked="checked"';
      }

      radios += `
        <label>
          <input type="radio" name="text-type" value="${t}"${selected}>${t}
        </label>`;
    }

    this.$setup.append($(`<label>Type</label>${radios}`));

    this.$setup.find('input[type=radio]').on('change', $.proxy((e) => {
      this.setDataProperty('type', $(e.target).val());
      this.refreshContentBlock();
      this.$content.attr('data-text-type', $(e.target).val());
    }, this));
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'text';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '  <i class="fa fa-paragraph"></i>',
      '  <p>text</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Text;
