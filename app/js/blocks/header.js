import _ from 'underscore';
import $ from 'jquery';
import marked from 'marked';

import Block from '../block';
import HTMLUtils from '../utils/html';
import Markup from '../utils/markup';

const Header = Block.extend({
  type: 'header',
  template: _.template(`
    <div class="villain-text-block villain-text-block-header villain-content"
         data-header-level="<%= level %>" contenteditable="true">
    <%= content %>
    </div>`
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
    return this.template({
      content: this.data.text,
      level: this.data.level,
    });
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: 'Header',
      level: 1,
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  setup() {
    this.$setup.hide();
    const data = this.getData();

    if (!{}.hasOwnProperty.call(data, 'level')) {
      this.setDataProperty('level', 1);
    }

    const level = data.level;
    const anchor = data.anchor || '';

    const headerSizeRadios = HTMLUtils.createRadios(
      'Størrelse på overskrift',
      `header-size-${this.dataId}`,
      [
        { name: 'H1', val: 1 },
        { name: 'H2', val: 2 },
        { name: 'H3', val: 3 },
        { name: 'H4', val: 4 },
        { name: 'H5', val: 5 },
        { name: 'H6', val: 6 },
      ],
      level,
      [
        {
          ev: 'change',
          fn: (e) => {
            this.setDataProperty('level', parseInt($(e.target).val(), 10));
            this.refreshContentBlock();
            this.$content.attr('data-header-level', $(e.target).val());
          },
        },
      ]
    );

    const anchorInput = HTMLUtils.createInput(
      'Anker',
      `header-anchor-${this.dataId}`,
      anchor,
      [
        {
          ev: 'keyup',
          fn: (e) => {
            this.setDataProperty('anchor', $(e.target).val());
          },
        },
      ],
    );

    this.$setup.append(headerSizeRadios);
    this.$setup.append(anchorInput);
  },

  getData() {
    const data = this.data;
    data.text = Markup.toMD(this.getTextBlock().html()).trim();
    return data;
  },

  getJSON() {
    const data = this.getData();
    const json = {
      data,
      type: this.type,
    };

    return json;
  },

  getHTML() {
    const textNode = this.getTextBlock().html();
    return `<h3>${marked.toHTML(textNode)}</h3>`;
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'header';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-header"></i>',
      '<p>h1-6</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Header;
