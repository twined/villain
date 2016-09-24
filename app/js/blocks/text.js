import _ from 'underscore';
import marked from 'marked';
import $ from 'jquery';

import Block from '../block';
import HTMLUtils from '../utils/html';
import Markup from '../utils/markup';

const Text = Block.extend({
  hasToolbar: true,
  type: 'text',
  template: _.template(
    '<div class="villain-text-block villain-content" contenteditable="true" data-text-type="<%= type %>"><%= content %></div>'
  ),

  additionalEvents: {
    'click .villain-format-bold': 'onClickBold',
    'click .villain-format-italic': 'onClickItalic',
    'click .villain-format-link': 'onClickLink',
    'click .villain-format-unlink': 'onClickUnlink',
  },

  initialize(opts) {
    Block.prototype.initialize.apply(this, [opts]);
    this.editor.eventBus.on(`formattoolbar:${this.dataId}:show`, this.showToolbar, this);
    this.editor.eventBus.on('formattoolbar:hide', this.hideToolbars, this);
  },

  renderToolbar() {
    return `
    <div class="villain-text-toolbar">
      <button class="toolbar-button villain-format-bold"><i class="fa fa-bold"></i></button>
      <button class="toolbar-button villain-format-italic"><i class="fa fa-italic"></i></button>
      <button class="toolbar-button villain-format-link"><i class="fa fa-link"></i></button>
      <button class="toolbar-button villain-format-unlink"><i class="fa fa-unlink"></i></button>
    </div>
    `;
  },

  renderEditorHtml() {
    const blockTemplate = this.renderContentBlockHtml();
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return `${this.renderToolbar()}${wrapperTemplate}`;
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
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return `${this.renderToolbar()}${wrapperTemplate}`;
  },

  showToolbar() {
    this.$('.villain-text-toolbar').slideDown();
  },

  hideToolbars() {
    $('.villain-text-toolbar').slideUp();
  },

  onClickBold(e) {
    e.preventDefault();
    document.execCommand('bold', false, false);
    this.activateToolbarButton('.villain-format-bold');
  },

  onClickItalic(e) {
    e.preventDefault();
    document.execCommand('italic', false, false);
    this.activateToolbarButton('.villain-format-italic');
  },

  onClickLink(e) {
    e.preventDefault();
    const link = prompt('link');
    document.execCommand('createLink', false, link);
    this.activateToolbarButton('.villain-format-link');
  },

  onClickUnlink(e) {
    e.preventDefault();
    document.execCommand('unlink', false, false);
  },

  activateToolbarButton(className) {
    this.$(className).addClass('active');
  },

  deactivateToolbarButtons() {
    this.$('.toolbar-button')
      .removeClass('active');
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

    const radios = HTMLUtils.createRadios(
      'Type',
      `text-type-${this.dataId}`,
      [
        { name: 'Paragraf', val: 'paragraph' },
        { name: 'Ingress', val: 'lead' },
      ],
      type,
      [
        {
          ev: 'change',
          fn: (e) => {
            this.setDataProperty('type', $(e.target).val());
            this.refreshContentBlock();
            this.$content.attr('data-text-type', $(e.target).val());
          },
        },
      ],
    );

    this.$setup.append(radios);
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
