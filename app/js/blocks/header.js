import _ from 'underscore';
import $ from 'jquery';
import marked from 'marked';

import Block from '../block';
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
    const levels = [1, 2, 3, 4, 5];

    const radios = levels.map((l) => {
      let selected = '';
      if (parseInt(level, 10) === parseInt(l, 10)) {
        selected = ' checked="checked"';
      }
      return `
        <label>
          <input type="radio"
                 name="header-size-${this.dataId}"
                 value="${l}"${selected}>H${l}
        </label>`;
    });

    this.$setup.append($(`
      <label>Størrelse</label>
      ${radios.join('\n')}`));

    this.$setup.append($(`
      <br />
      <label>Anker</label>
      <input type="text" value="${anchor}" name="header-anchor-${this.dataId}" />`));

    this.$setup.find('input[type=text]')
      .on('keyup', $.proxy(function setAnchorProperty(e) {
        this.setDataProperty('anchor', $(e.target).val());
      }, this));

    this.$setup.find('input[type=radio]')
      .on('change', $.proxy(function setLevelAndRefresh(e) {
        this.setDataProperty('level', $(e.target).val());
        this.refreshContentBlock();
        this.$content.attr('data-header-level', $(e.target).val());
      }, this));
  },

  getData() {
    const data = this.data;
    data.text = Markup.toMD(this.getTextBlock().html()).trim();
    return data;
  },

  getJSON() {
    return {
      type: this.type,
      data: this.getData(),
    };
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
