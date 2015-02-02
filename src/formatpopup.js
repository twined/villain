Villain.FormatPopUp = Backbone.View.extend({
    tagName: 'div',
    className: 'villain-format-popup',

    events: {
        'click .villain-format-bold': 'onClickBold',
        'click .villain-format-italic': 'onClickItalic',
        'click .villain-format-link': 'onClickLink',
        'click .villain-format-unlink': 'onClickUnlink',
    },

    onClickBold: function(e) {
        e.preventDefault();
        document.execCommand('bold', false, false);
        this.activateButton('.villain-format-bold');
    },

    onClickItalic: function(e) {
        e.preventDefault();
        document.execCommand('italic', false, false);
        this.activateButton('.villain-format-italic');
    },

    onClickLink: function(e) {
        e.preventDefault();
        var link = prompt('Sett inn link:'),
            link_regex = /((ftp|http|https):\/\/.)|mailto(?=\:[-\.\w]+@)/;

        if (link && link.length > 0) {
            if (!link_regex.test(link)) {
                link = 'http://' + link;
            }
            document.execCommand('CreateLink', false, link);
        }
        this.activateButton('.villain-format-link');
    },

    onClickUnlink: function(e) {
        e.preventDefault();
        document.execCommand('unlink', false, false);
    },

    initialize: function() {
        this.render();
        // listen to events
        Villain.EventBus.on('formatpopup:show', this.showPopUp, this);
        Villain.EventBus.on('formatpopup:hide', this.hidePopUp, this);
    },

    render: function() {
        // add buttons
        this.$el.append('<button class="popup-button villain-format-bold"><i class="fa fa-bold"></i></button>');
        this.$el.append('<button class="popup-button villain-format-italic"><i class="fa fa-italic"></i></button>');
        this.$el.append('<button class="popup-button villain-format-link"><i class="fa fa-link"></i></button>');
        this.$el.append('<button class="popup-button villain-format-unlink"><i class="fa fa-unlink"></i></button>');
        return this;
    },

    showPopUp: function(view) {
        $el = view.$el;
        var selection = window.getSelection(),
            range = selection.getRangeAt(0),
            boundary = range.getBoundingClientRect(),
            offset = $el.offset(),
            coords = {};
            mainContent = $('section#maincontent');

        coords.top = boundary.top + mainContent.scrollTop();
        // 12 is padding for text-block
        coords.left = ((boundary.left + boundary.right) / 2) - (this.$el.width() / 2) - offset.left + 12;
        if (parseInt(coords.left) < 0) {
            coords.left = '0';
        }
        coords.left = coords.left  + 'px';

        this.deactivateButtons();
        this.activeButtons();
        this.$el.addClass('show-popup');
        this.$el.css(coords);
    },

    hidePopUp: function() {
        this.$el.removeClass('show-popup');
    },

    activeButtons: function() {
        var selection = window.getSelection(),
            node;

        if (selection.rangeCount > 0) {
            node = selection.getRangeAt(0)
                          .startContainer
                          .parentNode;
        }

        // link
        if (node && node.nodeName == 'A') {
            this.activateButton('.villain-format-link');
        }
        if (document.queryCommandState('bold')) {
            this.activateButton('.villain-format-bold');
        }
        if (document.queryCommandState('italic')) {
            this.activateButton('.villain-format-italic');
        }
    },

    activateButton: function(className) {
        this.$(className).addClass('active');
    },

    deactivateButtons: function() {
        this.$('.popup-button').removeClass('active');
    }
});
