'use strict';

import $ from 'jquery';
import Backbone from 'backbone';

const FormatPopUp = Backbone.View.extend({
  tagName: 'div',
  className: 'villain-format-popup',

  events: {
    'click .villain-format-bold': 'onClickBold',
    'click .villain-format-italic': 'onClickItalic',
    'click .villain-format-link': 'onClickLink',
    'click .villain-format-unlink': 'onClickUnlink',
  },

  initialize(options) {
    this.editor = options.editor;

    this.render();

    // listen to events
    this.editor.eventBus.on('formatpopup:show', this.showPopUp, this);
    this.editor.eventBus.on('formatpopup:hide', this.hidePopUp, this);
  },

  onClickBold(e) {
    e.preventDefault();
    document.execCommand('bold', false, false);
    this.activateButton('.villain-format-bold');
  },

  onClickItalic(e) {
    e.preventDefault();
    document.execCommand('italic', false, false);
    this.activateButton('.villain-format-italic');
  },

  onClickLink(e) {
    e.preventDefault();
    const link = prompt('link');
    document.execCommand('createLink', false, link);
    this.activateButton('.villain-format-link');
  },

  onClickUnlink(e) {
    e.preventDefault();
    document.execCommand('unlink', false, false);
  },

  render() {
    // add buttons
    this.$el.html(
      `
        <button class="popup-button villain-format-bold"><i class="fa fa-bold"></i></button>
        <button class="popup-button villain-format-italic"><i class="fa fa-italic"></i></button>
        <button class="popup-button villain-format-link"><i class="fa fa-link"></i></button>
        <button class="popup-button villain-format-unlink"><i class="fa fa-unlink"></i></button>
      `
    );
    return this;
  },

  showPopUp(view) {
    const $el = view.$el;
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const boundary = range.getBoundingClientRect();
    const offset = $el.offset();
    const coords = {};
    const mainContent = $('section#maincontent');

    coords.top = boundary.top + mainContent.scrollTop();
    // 12 is padding for text-block
    coords.left = ((boundary.left + boundary.right) / 2) -
      (this.$el.width() / 2) -
      (offset.left + 12);

    if (parseInt(coords.left, 10) < 0) {
      coords.left = '0';
    }
    coords.left = `${coords.left}px`;

    this.deactivateButtons();
    this.activeButtons();
    this.$el.addClass('show-popup');
    this.$el.css(coords);
  },

  hidePopUp() {
    this.$el.removeClass('show-popup');
  },

  activeButtons() {
    const selection = window.getSelection();
    let node;

    if (selection.rangeCount > 0) {
      node = selection.getRangeAt(0)
        .startContainer
        .parentNode;
    }

    // link
    if (node && node.nodeName === 'A') {
      this.activateButton('.villain-format-link');
    }
    if (document.queryCommandState('bold')) {
      this.activateButton('.villain-format-bold');
    }
    if (document.queryCommandState('italic')) {
      this.activateButton('.villain-format-italic');
    }
  },

  activateButton(className) {
    this.$(className)
      .addClass('active');
  },

  deactivateButtons() {
    this.$('.popup-button')
      .removeClass('active');
  },
});

export default FormatPopUp;
