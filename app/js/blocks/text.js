import _ from 'underscore';
import marked from 'marked';
import $ from 'jquery';

import Block from '../block';
import HTMLUtils from '../utils/html';
import Markup from '../utils/markup';

import trumbowyg from 'trumbowyg';

const Text = Block.extend({
  hasToolbar: true,
  resizeSetup: false,
  type: 'text',
  blockName: 'text',
  blockIcon: 'fa-paragraph',
  template: _.template(
    '<div class="villain-text-block villain-content" data-text-type="<%= type %>"><%= content %></div>'
  ),

  initialize(opts) {
    Block.prototype.initialize.apply(this, [opts]);
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
      content: Markup.toHTML(text),
      type: this.data.type,
    });
  },

  afterRenderCallback() {
    $.trumbowyg.svgPath = false;
    $(this.$content).trumbowyg({
      btns: ['bold', 'italic', 'link'],
      removeformatPasted: true,
      autogrow: true,
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

    return wrapperTemplate;
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

  afterShowSetupCallback() {
    this.$content.parent().parent().find('.trumbowyg-box').hide();
  },

  afterHideSetupCallback() {
    this.$content.parent().parent().find('.trumbowyg-box').show();
  },

  setup() {
    const data = this.getData();
    if (!{}.hasOwnProperty.call(data, 'type')) {
      this.setDataProperty('type', 'paragraph');
    }

    const type = this.data.type;
    this.$setup.hide();

    const radios = HTMLUtils.createRadios(
      this.editor.i18n.t('text:type'),
      `text-type-${this.dataId}`,
      [
        { name: this.editor.i18n.t('text:paragraph'), val: 'paragraph' },
        { name: this.editor.i18n.t('text:lead'), val: 'lead' },
        { name: this.editor.i18n.t('text:custom'), val: 'custom' },
      ],
      type,
      [
        {
          ev: 'change',
          fn: (e) => {
            const val = $(e.target).val();
            if (val === 'custom') {
              $(`input[name="text-custom-${this.dataId}"]`).prop('disabled', false);
            } else {
              $(`input[name="text-custom-${this.dataId}"]`).prop('disabled', true);
            }
            this.setDataProperty('type', val);
            this.refreshContentBlock();
            this.$content.attr('data-text-type', val);
          },
        },
      ],
    );

    this.$setup.append(radios);

    let initialCustomClass;

    if (['lead', 'paragraph'].indexOf(this.data.type) >= 0) {
      initialCustomClass = '';
    } else {
      initialCustomClass = this.data.type;
    }

    const $customField = HTMLUtils.createInput(
      this.editor.i18n.t('text:custom'),
      `text-custom-${this.dataId}`,
      initialCustomClass,
      {
        ev: 'keyup',
        fn: (e) => {
          this.setDataProperty('type', $(e.target).val());
          this.refreshContentBlock();
          this.$content.attr('data-text-type', $(e.target).val());
        },
      },
    );

    this.$setup.append($customField);
  },
});

export default Text;
