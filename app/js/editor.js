import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import uid from 'uid';
import i18n from 'i18next';

import BlockStore from './stores/store';
import BlockRegistry from './stores/registry';
import Plus from './plus';
import VillainError from './errors/error';

import LOCALE_NB from './locales/nb';

const VILLAIN_VERSION = '0.1.0';

const Editor = Backbone.View.extend({
  textArea: '#id_body',
  data: {},
  blocks: {},
  version: VILLAIN_VERSION,

  events: {
    'submit form': 'clickSubmit',
    'dragover .villain-droppable': 'onDragOverDroppable',
    'dragenter .villain-droppable': 'onDragEnterDroppable',
    'dragleave .villain-droppable': 'onDragLeaveDroppable',
    'drop .villain-droppable': 'onDropDroppable',
    'drop .villain-text-block': 'onDropTextblock',
  },

  initialize(options) {
    const self = this;

    this.instanceId = uid();
    this.eventBus = _.extend({}, Backbone.Events);
    // create a blockstore
    this.blockStore = new BlockStore();
    this.blockStore.create('main');
    this.setOptions(options);

    this.i18n = i18n.init({
      lng: this.options.language,
      resources: {
        nb: LOCALE_NB,
      },
    });

    // initialize registry with optional extra blocks
    this.blockRegistry = new BlockRegistry(this, options.defaultBlocks || [], options.extraBlocks ||
      []);
    this.browser = this.getBrowser();

    this.$textArea = $(options.textArea) || this.textArea;
    this.sourceMode = false;
    this.$textArea.css({
      width: '100%',
      'min-height': '250px',
      'font-family': 'monospace',
      'font-size': '12px',
      'line-height': '20px',
    });

    const $sourceView = $(`
      <div data-editor="${this.instanceId}"
           class="villain-toggle-source">
        <i class="fa villain-mask-icon"></i>
        <div class="villain-toggle-menu" style="display: none;">
          Version: ${this.version}
        </div>
      </div>
    `);

    $sourceView.on('click', 'i', $.proxy(this.onToggleMask, this));
    $sourceView.insertBefore(this.$textArea);

    this.eventBus.on('source:toggle', this.toggleSource, this);

    const $v = $(
      `<div class="villain-editor" data-villain-instance="${this.instanceId}"></div>`);
    $v.insertAfter(this.$textArea);

    this.setElement($v);

    this.$textArea.hide();
    this.isDirty = false;

    try {
      this.data = JSON.parse(this.$textArea.val());
    } catch (e) {
      this.data = null;
    }

    // inject json to textarea before submitting.
    $('form')
      .submit(() => {
        self.$textArea.val(self.getJSON());
      });

    this.render();
  },

  setOptions(options) {
    if (_.isUndefined(options.imageSeries) || _.isUndefined(options.baseURL)) {
      throw new VillainError(
        'Villain: baseURL and imageSeries MUST be set on initialization.');
    }

    const newOpts = {
      browseURL: options.baseURL + Editor.defaults.browseURL + options.imageSeries,
      uploadURL: options.baseURL + Editor.defaults.uploadURL + options.imageSeries,
      imageseriesURL: options.baseURL + Editor.defaults.imageseriesURL,
    };

    this.options = _.extend(Editor.defaults, newOpts);
  },

  render() {
    // add + block
    const addblock = new Plus({
      editor: this,
      store: 'main',
    });

    this.$el.append(addblock.$el);

    // parse json
    if (!this.data) {
      return false;
    }

    for (let i = 0; i <= this.data.length - 1; i += 1) {
      const blockJson = this.data[i];
      const BlockClass = this.blockRegistry.getBlockClassByType(blockJson.type);
      if (BlockClass !== false) {
        const block = new BlockClass({
          editor: this,
          data: blockJson.data,
          store: 'main',
        });

        this.$el.append(block.$el);
        this.$el.append(block.renderPlus()
          .$el);
      } else {
        throw new VillainError(
          `Villain: No class found for type: ${blockJson.type}`
        );
      }
    }
    return this;
  },

  onToggleMask() {
    $(`.villain-toggle-source[data-editor="${this.instanceId}"] .villain-toggle-menu`).toggle();
    this.eventBus.trigger('source:toggle');
  },

  toggleSource() {
    if (this.sourceMode) {
      this.$textArea.hide();
      this.$el.show();
      this.sourceMode = false;

      try {
        this.data = JSON.parse(this.$textArea.val());
      } catch (e) {
        this.data = null;
      }

      // destroy stuff
      this.$el.html('');

      // build it back up
      this.render();
    } else {
      this.$textArea.val(this.getJSON());
      this.$textArea.show();
      this.$el.hide();
      this.sourceMode = true;
    }
  },

  saveSelection() {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        const ranges = [];
        for (let i = 0, len = sel.rangeCount; i < len; i += 1) {
          ranges.push(sel.getRangeAt(i));
        }
        return ranges;
      }
    } else if (document.selection && document.selection.createRange) {
      return document.selection.createRange();
    }
    return null;
  },

  restoreSelection(savedSel) {
    if (savedSel) {
      if (window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        for (let i = 0, len = savedSel.length; i < len; i += 1) {
          sel.addRange(savedSel[i]);
        }
      } else if (document.selection && savedSel.select) {
        savedSel.select();
      }
    }
  },

  organizeMode() {
    $('.villain-block-wrapper')
      .toggleClass('organize');
    $('.villain-block-wrapper[data-block-type="columns"]')
      .removeClass('organize');
    $('.organize .villain-content')
      .hide();
  },

  getJSON() {
    const self = this;
    const json = [];

    this.$('.villain-block-wrapper')
      .each(function pushEachBlockWrapper() {
        // check the main block store for the id. if it's not there
        // it probably belongs to a superblock
        const block = self.blockStore.getBlockById('main', $(this)
          .data('block-id'));
        if (block !== false) {
          const blockJson = block.getJSON();
          json.push(blockJson);
        }
      });

    const ret = JSON.stringify(json, undefined, 2);

    return ret !== '[]' ? ret : '';
  },

  onDragEnterDroppable(e) {
    $('.villain-add-block-button', e.currentTarget)
      .addClass('drop-hover');
    e.preventDefault();
    e.stopPropagation();
  },

  onDragLeaveDroppable(e) {
    $('.villain-add-block-button', e.currentTarget)
      .removeClass('drop-hover');
    e.preventDefault();
    e.stopPropagation();
  },

  onDragOverDroppable(e) {
    e.preventDefault();
    e.stopPropagation();
  },

  onDropDroppable(e) {
    const target = e.currentTarget;
    if ($(target)
      .hasClass('villain-droppable') !== true) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const sourceId = e.originalEvent.dataTransfer.getData('text/plain');
    const $source = $(`[data-block-id=${sourceId}]`);
    const $sourceAdd = $source.next();

    $('.villain-add-block-button', target)
      .removeClass('drop-hover');

    if ($sourceAdd[0] === target) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    $source.detach();
    $sourceAdd.detach();

    // move the block by removing it from its current blockstore,
    // and adding it to the new blockstore
    $source.insertAfter($(target));
    const oldBlockStore = $source.attr('data-blockstore');
    const newBlockStore = $(target)
      .attr('data-blockstore');

    // get the block from old blockstore
    const block = this.blockStore.getBlockById(oldBlockStore, sourceId);

    block.store = newBlockStore;
    this.blockStore.del(oldBlockStore, sourceId);
    this.blockStore.add(newBlockStore, sourceId, block);
    $source.attr('data-blockstore', newBlockStore);
    $sourceAdd.insertAfter($source);
    $sourceAdd.attr('data-blockstore', newBlockStore);
    return true;
  },

  onDropTextblock(e) {
    $(e.currentTarget)
      .closest('.villain-block-wrapper')
      .shake();
    e.preventDefault();
    e.stopPropagation();
    return false;
  },

  processPaste(pastedFrag) {
    let cleanHtml;
    if (pastedFrag.match(/(class="?Mso|style="[^"]*\bmso\-|w:WordDocument)/gi)) {
      cleanHtml = this.wordClean(pastedFrag);
      cleanHtml = this.clean($('<div>')
        .append(cleanHtml)
        .html(), false, true);
      cleanHtml = this.removeEmptyTags(cleanHtml);
    } else {
      // Paste.
      cleanHtml = this.clean(pastedFrag, false, true);
      cleanHtml = this.removeEmptyTags(cleanHtml);
    }

    cleanHtml = this.plainPasteClean(cleanHtml);

    // Check if there is anything to clean.
    if (cleanHtml !== '') {
      // Insert HTML.
      return cleanHtml;
    }
    return false;
  },

  wordClean(html) {
    // Keep only body.
    let cleanedHtml = html;

    if (html.indexOf('<body') >= 0) {
      cleanedHtml = cleanedHtml.replace(
        /[.\s\S\w\W<>]*<body[^>]*>([.\s\S\w\W<>]*)<\/body>[.\s\S\w\W<>]*/g, '$1');
    }

    // Single item list.
    cleanedHtml = cleanedHtml.replace(
      /<p(.*?)class="?'?MsoListParagraph"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ul><li><p>$3</p></li></ul>'
    );

    // List start.
    cleanedHtml = cleanedHtml.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpFirst"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<ul><li><p>$3</p></li>'
    );

    // List middle.
    cleanedHtml = cleanedHtml.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpMiddle"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li><p>$3</p></li>'
    );

    // List end.
    cleanedHtml = cleanedHtml.replace(
      /<p(.*?)class="?'?MsoListParagraphCxSpLast"?'?([\s\S]*?)>([\s\S]*?)<\/p>/gi,
      '<li><p>$3</p></li></ul>');

    // Clean list bullets.
    cleanedHtml = cleanedHtml.replace(
      /<span([^<]*?)style="?'?mso-list:Ignore"?'?([\s\S]*?)>([\s\S]*?)<span/gi,
      '<span><span');

    // Webkit clean list bullets.
    cleanedHtml = cleanedHtml.replace(
      /<!--\[if !supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi, '');

    // Remove mso classes.
    cleanedHtml = cleanedHtml.replace(/(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/gi, ' ');

    // Remove comments.
    cleanedHtml = cleanedHtml.replace(/<!--[\s\S]*?-->/gi, '');

    // Remove tags but keep content.
    cleanedHtml = cleanedHtml.replace(
      /<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, '');

    // Remove no needed tags.
    const wordTags = ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'];
    for (let i = 0; i < wordTags.length; i += 1) {
      const regex = new RegExp(`<${wordTags[i]}.*?${wordTags[i]}(.*?)>`, 'gi');
      cleanedHtml = cleanedHtml.replace(regex, '');
    }

    // Remove attributes.
    cleanedHtml = cleanedHtml.replace(/([\w\-]*)=("[^<>"]*"|'[^<>']*'|\w+)/gi, '');

    // Remove spaces.
    cleanedHtml = cleanedHtml.replace(/&nbsp;/gi, '');

    // Remove empty tags.
    let oldHTML;
    do {
      oldHTML = cleanedHtml;
      cleanedHtml = cleanedHtml.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
    } while (cleanedHtml !== oldHTML);

    cleanedHtml = this.clean(cleanedHtml);

    return cleanedHtml;
  },

  clean(html) {
    // List of allowed attributes.
    const allowedAttrs = [
      'accept', 'accept-charset', 'accesskey', 'action', 'align',
      'alt', 'async', 'autocomplete', 'autofocus', 'autoplay',
      'autosave', 'background', 'bgcolor', 'border', 'charset',
      'cellpadding', 'cellspacing', 'checked', 'cite', 'class',
      'color', 'cols', 'colspan', 'contenteditable', 'contextmenu',
      'controls', 'coords', 'data', 'data-.*', 'datetime',
      'default', 'defer', 'dir', 'dirname', 'disabled',
      'download', 'draggable', 'dropzone', 'enctype', 'for',
      'form', 'formaction', 'headers', 'height', 'hidden', 'high',
      'href', 'hreflang', 'icon', 'id', 'ismap', 'itemprop',
      'keytype', 'kind', 'label', 'lang', 'language', 'list',
      'loop', 'low', 'max', 'maxlength', 'media', 'method',
      'min', 'multiple', 'name', 'novalidate', 'open', 'optimum',
      'pattern', 'ping', 'placeholder', 'poster', 'preload',
      'pubdate', 'radiogroup', 'readonly', 'rel', 'required',
      'reversed', 'rows', 'rowspan', 'sandbox', 'scope', 'scoped',
      'scrolling', 'seamless', 'selected', 'shape', 'size', 'sizes',
      'span', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step',
      'summary', 'spellcheck', 'style', 'tabindex', 'target', 'title',
      'type', 'translate', 'usemap', 'value', 'valign', 'width', 'wrap',
    ];
    const allowedTags = [
      '!--', 'a', 'abbr', 'address', 'area', 'article', 'aside',
      'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'br',
      'button', 'canvas', 'caption', 'cite', 'code', 'col',
      'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn',
      'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
      'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
      'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i',
      'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label',
      'legend', 'li', 'link', 'main', 'map', 'mark', 'menu',
      'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol',
      'optgroup', 'option', 'output', 'p', 'param', 'pre',
      'progress', 'queue', 'rp', 'rt', 'ruby', 's', 'samp',
      'script', 'section', 'select', 'small', 'source',
      'span', 'strong', 'style', 'sub', 'summary', 'sup',
      'table', 'tbody', 'td', 'textarea', 'tfoot', 'th',
      'thead', 'time', 'title', 'tr', 'track', 'u', 'ul',
      'var', 'video', 'wbr',
    ];

    // Remove script tag.
    let cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '');

    // Remove all tags not in allowed tags.
    const atReg = new RegExp(`<\\/?((?!(?:${allowedTags.join('|')}))\\w+)[^>]*?>`, 'gi');
    cleanedHtml = cleanedHtml.replace(atReg, '');

    // Remove all attributes not in allowed attrs.
    const aaReg = new RegExp(
      `( (?!(?:${allowedAttrs.join('|')}))[a-zA-Z0-9-_]+)=((?:.(?!\\s+(?:\\S+)=|[>]|(\\/>)))+.)`,
      'gi',
    );

    cleanedHtml = cleanedHtml.replace(aaReg, '');

    // Clean style.
    const styleReg = new RegExp(
      'style=("[a-zA-Z0-9:;\\.\\s\\(\\)\\-\\,!\\/\'%]*"|' +
      '\'[a-zA-Z0-9:;\\.\\s\\(\\)\\-\\,!\\/"%]*\')', 'gi'
    );
    cleanedHtml = cleanedHtml.replace(styleReg, '');

    // Remove the class.
    const $div = $('<div>')
      .append(cleanedHtml);
    $div.find('[class]:not([class^="fr-"])')
      .each((index, el) => {
        $(el)
          .removeAttr('class');
      });

    cleanedHtml = $div.html();

    return cleanedHtml;
  },

  plainPasteClean(html) {
    const $div = $('<div>')
      .html(html);

    $div.find('h1, h2, h3, h4, h5, h6, pre, blockquote')
      .each((i, el) => {
        $(el)
          .replaceWith(`<p>${$(el).html()}</p>`);
      });

    const replacePlain = function replacePlain(i, el) {
      $(el)
        .replaceWith($(el)
          .html());
    };

    while ($div.find('strong, em, strike, b, u, i, sup, sub, span, a')
      .length) {
      $div.find('strong, em, strike, b, u, i, sup, sub, span, a')
        .each(replacePlain);
    }

    return $div.html();
  },

  removeEmptyTags(html) {
    const $div = $('<div>')
      .html(html);
    let emptyTags = $div.find('*:empty:not(br, img, td, th)');

    while (emptyTags.length) {
      for (let i = 0; i < emptyTags.length; i += 1) {
        $(emptyTags[i])
          .remove();
      }

      emptyTags = $div.find('*:empty:not(br, img, td, th)');
    }

    // Workaround for Notepad paste.
    $div.find('> div')
      .each((i, div) => {
        $(div)
          .replaceWith(`${$(div).html()}<br />`);
      });

    // Remove divs.
    let divs = $div.find('div');
    while (divs.length) {
      for (let i = 0; i < divs.length; i += 1) {
        const $el = $(divs[i]);
        const text = $el.html()
          .replace(/\u0009/gi, '')
          .trim();

        $el.replaceWith(text);
      }

      divs = $div.find('div');
    }

    return $div.html();
  },

  pasteHtmlAtCaret(html) {
    let range;
    if (window.getSelection) {
      // IE9 and non-IE
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        const el = document.createElement('div');
        el.innerHTML = html;
        const frag = document.createDocumentFragment();

        let node = el.firstChild;
        let lastNode;

        while (node != null) {
          lastNode = frag.appendChild(node);
          node = el.firstChild;
        }

        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } else if (document.selection && document.selection.type !== 'Control') {
      // IE < 9
      document.selection.createRange().pasteHTML(html);
    }
  },

  getBrowser() {
    const browser = {};

    const ua = navigator.userAgent.toLowerCase();
    const match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      (ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) || [];

    const matched = {
      browser: match[1] || '',
      version: match[2] || '0',
    };

    if (match[1]) {
      browser[matched.browser] = true;
    }
    if (parseInt(matched.version, 10) < 9 && browser.msie) {
      browser.oldMsie = true;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
      browser.webkit = true;
    } else if (browser.webkit) {
      browser.safari = true;
    }
    return browser;
  },
});

Editor.defaults = {
  textArea: '#textarea',
  browseURL: 'villain/browse/',
  uploadURL: 'villain/upload/',
  imageseriesURL: 'villain/imageseries/',
  language: 'nb',
};

export default Editor;
