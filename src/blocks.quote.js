Villain.Blocks.Quote = Villain.Block.extend({
    type: 'quote',
    template: _.template(
        '<div class="villain-quote-block villain-content"><blockquote><cite></cite></blockquote></div>'
    ),

    events: {
        'drop .villain-image-dropper i': 'onDropImage',
        'dragenter .villain-image-dropper i': 'onDragEnter',
        'dragleave .villain-image-dropper i': 'onDragLeave',
        'dragover .villain-image-dropper i': 'onDragOver',
        'click .villain-image-dropper-upload': 'onUpload'
    },

    initialize: function(json, store) {
        Villain.Block.prototype.initialize.apply(this, [json, store]);
        _.extend(this.events, Villain.Block.prototype.events);
    },

    onUpload: function(e) {
        this.loading();
        this.done();
    },

    onDragEnter: function(e) {
        this.$('.villain-image-dropper i').addClass('drop-hover');
        e.preventDefault();
    },

    onDragLeave: function(e) {
        this.$('.villain-image-dropper i').removeClass('drop-hover');
        e.preventDefault();
    },

    onDragOver: function(e) {
        e.preventDefault();
    },

    onDropImage: function(e) {
        e.preventDefault();
        this.$('.villain-image-dropper i').removeClass('drop-hover');
        dataTransfer = e.originalEvent.dataTransfer;
        var file = dataTransfer.files[0],
            urlAPI = (typeof URL !== 'undefined') ? URL : (typeof webkitURL !== 'undefined') ? webkitURL : null;

        // Handle one upload at a time
        if (/image/.test(file.type)) {
            // Show this image on here
            //this.$inputs.hide();
            //this.$editor.html($('<img>', { src: urlAPI.createObjectURL(file) })).show();
            this.$('.villain-image-dropper').html($('<img>', {src: urlAPI.createObjectURL(file)}));
            this.$setup.append(
                '<label for="image-name">Navn:</label><input type="text" name="image-name" />'
            );
            this.$setup.append(
                '<label for="image-credits">Krediteringer:</label><input type="text" name="image-credits" />'
            );
            this.$setup.append(
                '<button class="villain-image-dropper-upload">Last opp og lagre</button>'
            );
        }
    },

    renderEditorHtml: function() {
        blockTemplate = this.template({url: this.data.url});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderEmpty: function() {
        blockTemplate = this.template({url: 'http://placehold.it/1150x400'});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        url = this.$('img').attr('src');
        json = {
            type: this.type,
            data: {
                url: url
            }
        };
        return json;
    },
    getHTML: function() {
        url = this.$('img').attr('src');
        return this.template({url: url});
    },

    setup: function() {
        // check if this block has data
        // if not, show the setup div
        if (!this.hasData()) {
            this.$('.villain-image-block').hide();
            imageDropper = $([
                '<div class="villain-image-dropper"><i class="fa fa-image"></i>',
                    '<div>Dra bildet du vil laste opp hit</div>',
                    '<div><hr></div>',
                    '<div><button>Hent bilde fra server</button></div>',
                '</div>'
            ].join('\n'));
            this.$setup.append(imageDropper);
            this.$setup.show();
        }
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'quote';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-quote-right"></i>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
