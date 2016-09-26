import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';

import Plus from './plus';

const Block = Backbone.View.extend({
  el: null,
  tagName: 'div',
  className: 'villain-block-wrapper',
  type: 'base',
  template: _.template('base'),
  resizeSetup: true,
  hasToolbar: false,
  store: 'main',

  wrapperTemplate: _.template([
    '<div class="villain-block-inner"><%= content %><%= actions %></div>',
  ].join('\n')),

  actionsTemplate: _.template([
    '<div class="villain-actions">',
    '  <div class="villain-action-button villain-action-button-setup">',
    '    <i class="fa fa-wrench fa-fw"></i>',
    '  </div>',
    '  <div class="villain-action-button villain-action-button-del">',
    '    <i class="fa fa-close fa-fw"></i>',
    '  </div>',
    '  <div class="villain-action-button villain-action-button-move" draggable="true">',
    '    <i class="fa fa-arrows-alt fa-fw"></i>',
    '  </div>',
    '</div>',
  ].join('\n')),

  setupTemplate: _.template(
    '<div class="villain-setup-block" />'
  ),

  additionalEvents: {

  },

  originalEvents: {
    'dragstart .villain-action-button-move': 'onDragStart',
    'click .villain-action-button-move': 'onClickMove',
    'click .villain-action-button-del': 'onClickDelete',
    'mouseover .villain-block-inner': 'onMouseOver',
    'mouseout .villain-block-inner': 'onMouseOut',
    'paste .villain-text-block': 'onPaste',
    'mouseup .villain-text-block': 'onMouseUp',
    'keyup .villain-text-block': 'onKeyUp',
    'click .villain-text-block': 'onClick',
    'click .villain-action-button-setup': 'onSetupClick',
  },

  events() {
    return _.extend({}, this.originalEvents, this.additionalEvents);
  },

  initialize(options) {
    if (options.store) {
      this.store = options.store;
    }

    this.editor = options.editor;
    this.data = options.data || {};

    this.dataId = this.getIdFromBlockStore();
    this.id = `villain-block-${this.dataId}`;

    this.$el.attr('data-block-id', this.dataId);
    this.$el.attr('data-block-type', this.type);
    this.$el.attr('id', `villain-block-${this.dataId}`);
    this.$el.attr('data-blockstore', this.store);

    this.addToBlockStore(this.store);
    this.render();

    if (this.afterRenderCallback) {
      this.afterRenderCallback();
    }
  },

  render() {
    let html;

    if (this.hasData()) {
      // we got passed data. render editorhtml
      html = this.renderEditorHtml();
    } else {
      // no data, probably want a blank block
      html = this.renderEmpty();
    }

    this.el.innerHTML = html;

    this.setSections();
    this.addSetup();

    return this;
  },

  onSetupClick(e) {
    e.stopPropagation();
    // is it active now?
    const $button = this.$('.villain-action-button-setup');
    if ($button.hasClass('active')) {
      // hide the setup
      $button.removeClass('active');
      this.hideSetup();
    } else {
      $button.addClass('active');
      this.showSetup();
    }
  },

  onKeyUp() {
    if (this.hasToolbar) {
      // check if there's text selected
      const text = this.getSelectedText();

      if (text !== '') {
        this.editor.eventBus.trigger('formattoolbar:show', this);
      } else {
        this.editor.eventBus.trigger('formattoolbar:hide');
      }
    }
  },

  onMouseUp() {
    if (this.hasToolbar) {
      // check if there's text selected
      const text = this.getSelectedText();

      if (text !== '') {
        this.editor.eventBus.trigger(`formattoolbar:${this.dataId}:show`, this);
      } else {
        this.editor.eventBus.trigger('formattoolbar:hide');
      }
    }
  },

  onClick() {
    if (this.hasToolbar) {
      setTimeout(() => {
        const text = this.getSelectedText();
        if (text === '') {
          this.editor.eventBus.trigger('formattoolbar:hide');
        }
      }, 1);
    }
  },

  getSelectedText() {
    let text = '';

    if (window.getSelection) {
      text = window.getSelection();
    } else if (document.getSelection) {
      text = document.getSelection();
    } else if (document.selection) {
      text = document.selection.createRange().text;
    }
    return text.toString();
  },

  deleteBlock() {
    this.editor.blockStore.del(this.store, this.dataId);
    this.destroy();
  },

  loading() {
    this.$el.loadingOverlay();
  },

  done() {
    this.$el.loadingOverlay('remove');
  },

  addToPathName(relativeUrl) {
    if (relativeUrl.charAt(0) === '/') {
      return relativeUrl;
    }

    const divider = (window.location.pathname.slice(-1) === '/') ? '' : '/';
    const fullPath = window.location.pathname + divider + relativeUrl;

    return fullPath;
  },

  destroy() {
    // delete the plus after
    this.$el.next('.villain-add-block').remove();
    // TODO: find the plus object and delete it?
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    Backbone.View.prototype.remove.call(this);
  },

  onClickDelete(e) {
    this.deleteBlock();
    e.stopPropagation();
  },

  onClickMove(e) {
    e.stopPropagation();
  },

  onDragStart(e) {
    e.originalEvent.dataTransfer.setDragImage(this.$el.get(0), this.$el.width(), this.$el
      .height());
    e.originalEvent.dataTransfer.setData('Text', this.dataId);
    e.stopPropagation();
  },

  onMouseOver() {
    event.stopPropagation();
    this.$inner.addClass('hover');
    this.$inner.children('.villain-actions')
      .visible();
  },

  onMouseOut() {
    this.$inner.removeClass('hover');
    this.$inner.children('.villain-actions')
      .invisible();
  },

  onPaste(e) {
    let clipboard = false;

    if (e && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
      let types = '';
      const clipboardTypes = e.originalEvent.clipboardData.types;

      if ($.isArray(clipboardTypes)) {
        for (let i = 0; i < clipboardTypes.length; i += 1) {
          types += `${clipboardTypes[i]};`;
        }
      } else {
        types = clipboardTypes;
      }
      let clipboardHTML;
      if (/text\/html/.test(types)) {
        // HTML.
        clipboardHTML = e.originalEvent.clipboardData.getData('text/plain'); // text/html
      } else if (/text\/rtf/.test(types) && this.editor.browser.safari) {
        // Safari HTML.
        clipboardHTML = e.originalEvent.clipboardData.getData('text/plain'); // text/rtf
      } else if (/text\/plain/.test(types) && !this.editor.browser.mozilla) {
        clipboardHTML = e.originalEvent.clipboardData.getData('text/plain')
          .replace(/\n/g, '<br/>');
      }

      if (this.clipboardHTML !== '') {
        clipboard = true;
      } else {
        this.clipboardHTML = null;
      }

      if (clipboard) {
        const cleanHtml = this.editor.processPaste(clipboardHTML);
        e.stopPropagation();
        e.preventDefault();
        this.editor.pasteHtmlAtCaret(cleanHtml);

        return false;
      }
    }
    return true;
  },

  getIdFromBlockStore() {
    return this.editor.blockStore.getId();
  },

  doRenderCallback() {

  },

  hasTextBlock() {
    // check if the block has its own textblock
    return this.$('.villain-text-block').length !== 0;
  },

  setCaret() {
    const range = document.createRange();
    range.selectNodeContents(this.getTextBlock()[0]);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  },

  scrollTo() {
    $('html, body')
      .animate({
        scrollTop: this.$el.offset().top - 75,
      }, 300, 'linear');
  },

  getJSON() {
    return {};
  },

  addToBlockStore(store) {
    this.editor.blockStore.add(store || 'main', this.dataId, this);
  },

  hasData() {
    return this.data ? !_.isEmpty(this.data) : false;
  },

  setData(json) {
    this.data = json;
  },

  getData() {
    return this.data;
  },

  setDataProperty(prop, value) {
    const data = this.getData();
    data[prop] = value;
    this.setData(data);
  },

  refreshBlock() {
    const html = this.renderEditorHtml();
    this.el.innerHTML = html;
    this.addSetup();

    return this;
  },

  refreshContentBlock() {
    const block = this.renderContentBlockHtml();
    this.$content.html($(block).html());

    return this.$content;
  },

  setSections() {
    this.$inner = this.$('.villain-block-inner');
    this.$content = this.$('.villain-content');
  },

  addSetup() {
    if (this.setup) {
      // the block has a setup method - add the setupTemplate and call setup()
      this.$inner.prepend(this.setupTemplate());
      this.$setup = this.$('.villain-setup-block');

      // show the setup button
      this.$('.villain-action-button-setup').show();
      this.setup();
    } else {
      this.$('.villain-action-button-setup').hide();
    }
  },

  clearSetup() {
    this.$setup.empty();
  },

  getTextBlock() {
    this.$textBlock = this.$('.villain-text-block');
    return this.$textBlock;
  },

  getTextBlockInner() {
    const tb = this.getTextBlock();
    return tb.html();
  },

  clearInsertedStyles(e) {
    const target = e.target;
    target.removeAttribute('style'); // Hacky fix for Chrome.
  },

  renderEditorHtml() {},

  renderEmpty() {},

  renderPlus() {
    const addblock = new Plus({
      editor: this.editor,
      store: this.store,
    });
    return addblock;
  },

  showSetup() {
    const iHeight = this.$inner.height();
    const iWidth = this.$inner.width();
    const $button = this.$('.villain-action-button-setup');

    $button.addClass('active');

    this.$content.hide();
    this.$setup.show();

    if (this.resizeSetup) {
      if (this.$setup.height() < iHeight) {
        this.$setup.height(iHeight);
      }

      if (iWidth < 300 && iWidth !== 0) {
        this.$el.width(300);
      }
    }
  },

  hideSetup() {
    const $button = this.$('.villain-action-button-setup');
    $button.removeClass('active');

    this.$setup.hide();
    this.$setup.height('');

    this.$content.show();
  },
}, {
  getButton(cls, afterId) {
    return `
      <button class="villain-block-button"
              data-type="${cls.prototype.type}"
              data-after-block-id="${afterId}">
        <i class="fa ${cls.prototype.blockIcon}"></i>
        <p>${cls.prototype.blockName}</p>
      </button>
    `;
  },
});

export default Block;
