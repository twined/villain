Villain.Block = Backbone.View.extend({
    tagName: 'div',
    className: 'villain-block-wrapper',
    type: 'base',
    template: _.template('base'),
    store: 'main',

    wrapperTemplate: _.template([
        '<div class="villain-block-inner"><%= content %><%= actions %></div>'
    ].join('\n')),

    actionsTemplate: _.template([
        '<div class="villain-actions">',
        '  <div class="villain-action-button villain-action-button-setup">',
        '    <i class="fa fa-cogs"></i>',
        '  </div>',
        '  <div class="villain-action-button villain-action-button-del">',
        '    <i class="fa fa-trash"></i>',
        '  </div>',
        '  <div class="villain-action-button villain-action-button-move" draggable="true">',
        '    <i class="fa fa-arrows-alt"></i>',
        '  </div>',
        '</div>'
    ].join('\n')),

    setupTemplate: _.template(
        '<div class="villain-setup-block" />'
    ),

    events: {
        'dragstart .villain-action-button-move': 'onDragStart',
        'click .villain-action-button-move': 'onClickMove',
        'click .villain-action-button-del': 'onClickDelete',
        'mouseover .villain-block-inner': 'onMouseOver',
        'mouseout .villain-block-inner': 'onMouseOut',
        'paste .villain-text-block': 'onPaste',
        'mouseup .villain-text-block': 'onMouseUp',
        'keyup .villain-text-block': 'onKeyUp',
        'click .villain-text-block': 'onClick',
        'click .villain-action-button-setup': 'onSetupClick'
    },

    initialize: function(json, store) {
        this.data = json || null;
        this.dataId = this.getIdFromBlockStore();
        this.$el.attr('data-block-id', this.dataId);
        this.$el.attr('data-block-type', this.type);
        this.$el.attr('id', 'villain-block-' + this.dataId);
        if (store) {
            this.store = store;
        }
        this.$el.attr('data-blockstore', this.store);
        this.id = 'villain-block-' + this.dataId;
        this.addToBlockStore(store);
        this.render();
    },

    render: function() {
        if (this.hasData()) {
            // we got passed data. render editorhtm
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

    onClick: function(e) {
        var text = this.getSelectedText();
        if (text === '') {
            Villain.EventBus.trigger('formatpopup:hide');
        }
    },

    onSetupClick: function(e) {
        e.stopPropagation();
        // is it active now?
        $button = this.$('.villain-action-button-setup');
        if ($button.hasClass('active')) {
            // hide the setup
            $button.removeClass('active');
            this.hideSetup();
        } else {
            $button.addClass('active');
            this.showSetup();
        }
    },

    onKeyUp: function(e) {
        // check if there's text selected
        var text = this.getSelectedText();

        if (text !== '') {
            Villain.EventBus.trigger('formatpopup:show', this);
        } else {
            Villain.EventBus.trigger('formatpopup:hide');
        }
    },

    onMouseUp: function(e) {
        // check if there's text selected
        var text = this.getSelectedText();

        if (text !== '') {
            Villain.EventBus.trigger('formatpopup:show', this);
        } else {
            Villain.EventBus.trigger('formatpopup:hide');
        }
    },

    getSelectedText: function() {
        var text = '';

        if (window.getSelection) {
          text = window.getSelection();
        } else if (document.getSelection) {
          text = document.getSelection();
        } else if (document.selection) {
          text = document.selection.createRange().text;
        }
        return text.toString();
    },

    deleteBlock: function() {
        Villain.BlockStore.del(this.store, this.dataId);
        this.destroy();
    },

    loading: function() {
        this.$el.loadingOverlay();
    },

    done: function() {
        this.$el.loadingOverlay('remove');
    },

    addToPathName: function(relativeUrl) {
        if (relativeUrl.charAt(0) === "/") {
            return relativeUrl;
        } else {
            var divider = (window.location.pathname.slice(-1) == "/") ? "" : "/";
            var fullPath = window.location.pathname + divider + relativeUrl;
        }
        return fullPath;
    },

    destroy: function() {
        // delete the plus after
        this.$el.next('.villain-add-block').remove();
        // TODO: find the plus object and delete it...
        // COMPLETELY UNBIND THE VIEW
        this.undelegateEvents();
        this.$el.removeData().unbind();
        // Remove view from DOM
        this.remove();
        Backbone.View.prototype.remove.call(this);
    },

    onClickDelete: function(e) {
        this.deleteBlock();
        e.stopPropagation();
    },

    onClickMove: function(e) {
        e.stopPropagation();
    },

    onDragStart: function(e) {
        e.originalEvent.dataTransfer.setDragImage(this.$el.get(0), this.$el.width(), this.$el.height());
        e.originalEvent.dataTransfer.setData('Text', this.dataId);
        e.stopPropagation();
    },

    onMouseOver: function(e) {
        event.stopPropagation();
        this.$inner.addClass('hover');
        this.$inner.children('.villain-actions').visible();
    },

    onMouseOut: function(e) {
        this.$inner.removeClass('hover');
        this.$inner.children('.villain-actions').invisible();
    },

    onPaste: function(e) {
        var clipboard = false;
        if (e && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
            var types = '',
                clipboard_types = e.originalEvent.clipboardData.types;

            if ($.isArray(clipboard_types)) {
                for (var i = 0 ; i < clipboard_types.length; i++) {
                    types += clipboard_types[i] + ';';
                }
            } else {
                types = clipboard_types;
            }

            if (/text\/html/.test(types)) {
                // HTML.
                clipboardHTML = e.originalEvent.clipboardData.getData('text/html');
            } else if (/text\/rtf/.test(types) && Villain.browser.safari) {
                // Safari HTML.
                clipboardHTML = e.originalEvent.clipboardData.getData('text/rtf');
            } else if (/text\/plain/.test(types) && !Villain.browser.mozilla) {
                clipboardHTML = e.originalEvent.clipboardData.getData('text/plain').replace(/\n/g, '<br/>');
            }

            if (this.clipboardHTML !== '') {
                clipboard = true;
            } else {
                this.clipboardHTML = null;
            }

            if (clipboard) {
                cleanHtml = Villain.Editor.processPaste(clipboardHTML);
                e.stopPropagation();
                e.preventDefault();
                Villain.Editor.pasteHtmlAtCaret(cleanHtml);
                return false;
            }
        }
    },

    getIdFromBlockStore: function() {
        return Villain.BlockStore.getId();
    },

    doRenderCallback: function() {

    },

    hasTextBlock: function() {
        // check if the block has its own textblock
        return this.$('.villain-text-block').length === 0 ? false : true;
    },

    setCaret: function() {
        var range, selection;

        range = document.createRange();
        range.selectNodeContents(this.getTextBlock()[0]);
        range.collapse(false);

        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },

    scrollTo: function() {
        $('html, body').animate({
            scrollTop: this.$el.offset().top - 75
        }, 300, 'linear');
    },

    flash: function(color, duration) {

    },

    getJSON: function() {
        return [];
    },

    addToBlockStore: function(store) {
        Villain.BlockStore.add(store ? store : 'main', this.dataId, this);
    },

    setData: function(json) {
        this.data = json;
    },

    getData: function() {
        return this.data;
    },

    setDataProperty: function(prop, value) {
        data = this.getData();
        data[prop] = value;
        this.setData(data);
    },

    hasData: function() {
        return this.data ? !_.isEmpty(this.data) : false;
    },

    refreshBlock: function() {
        html = this.renderEditorHtml();
        this.el.innerHTML = html;
        this.addSetup();
        return this;
    },

    refreshContentBlock: function(hidden) {
        block = this.renderContentBlockHtml();
        this.$content.html($(block).html());
        return this.$content;
    },

    setSections: function() {
        this.$inner = this.$('.villain-block-inner');
        this.$content = this.$('.villain-content');
    },

    addSetup: function() {
        if (this.setup) {
            // the block has a setup method - add the setupTemplate
            // and call setup()
            this.$inner.prepend(this.setupTemplate());
            this.$setup = this.$('.villain-setup-block');
            // show the setup button
            this.$('.villain-action-button-setup').show();
            this.setup();
        } else {
            this.$('.villain-action-button-setup').hide();
        }
    },

    clearSetup: function() {
        this.$setup.empty();
    },

    getTextBlock: function() {
        this.$textBlock = this.$('.villain-text-block');
        return this.$textBlock;
    },

    getTextBlockInner: function() {
        tb = this.getTextBlock();
        return tb.html();
    },

    clearInsertedStyles: function(e) {
        var target = e.target;
        target.removeAttribute('style'); // Hacky fix for Chrome.
    },

    renderEditorHtml: function() {},

    renderEmpty: function() {},

    renderPlus: function() {
        addblock = new Villain.Plus(this.store);
        return addblock;
    },

    showSetup: function() {
        innerHeight = this.$inner.height();
        innerWidth = this.$inner.width();
        this.$content.hide();
        $button = this.$('.villain-action-button-setup');
        $button.addClass('active');
        this.$setup.show();
        if (this.$setup.height() < innerHeight) {
            this.$setup.height(innerHeight);
        }
        if (innerWidth < 300) {
            this.$el.width(300);
        }
    },

    hideSetup: function() {
        this.$setup.hide();
        this.$setup.height("");
        $button = this.$('.villain-action-button-setup');
        $button.removeClass('active');
        this.$content.show();
    }
});
