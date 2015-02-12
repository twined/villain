Villain.Blocks.Video = Villain.Block.extend({
    type: 'video',

    providers: {
        vimeo: {
            regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
            html: ['<iframe src=\"{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0\" ',
                   'width=\"580\" height=\"320\" frameborder=\"0\"></iframe>'].join('\n')
        },
        youtube: {
            regex: /(?:http[s]?:\/\/)?(?:www.)?(?:(?:youtube.com\/watch\?(?:.*)(?:v=))|(?:youtu.be\/))([^&].+)/,
            html: ['<iframe src=\"{{protocol}}//www.youtube.com/embed/{{remote_id}}\" ',
                   'width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>'].join('\n')
        }
    },

    template: _.template(
        '<div class="villain-video-block villain-content"><%= content %></div>'
    ),

    events: {
        'click .villain-setup-block button': 'onClick'
    },

    onClick: function(e) {
        e.preventDefault();
        videoUrl = this.$('.villain-video-setup-url').val();
        // parse the url
        if (!_.isURI(videoUrl)) {
            return;
        }

        embedString = this.buildString(videoUrl);

        this.$content.html(embedString);
        this.hideSetup();
    },

    buildString: function(videoUrl) {
        var match, data;

        _.each(this.providers, function(provider, index) {
            match = provider.regex.exec(videoUrl);

            if (match !== null && !_.isUndefined(match[1])) {
                data = {
                    source: index,
                    remote_id: match[1]
                };
                this.setData(data);
            }
        }, this);

        if (!this.providers.hasOwnProperty(data.source)) {
            return;
        }

        var embedString = this.providers[data.source].html
            .replace('{{protocol}}', window.location.protocol)
            .replace('{{remote_id}}', data.remote_id)
            .replace('{{width}}', '100%'); // for videos that can't resize automatically like vine

        return embedString;
    },

    initialize: function(json, store) {
        Villain.Block.prototype.initialize.apply(this, [json, store]);
        _.extend(this.events, Villain.Block.prototype.events);
    },

    renderEditorHtml: function() {
        if (!this.providers.hasOwnProperty(this.data.source)) {
            return;
        }

        var embedString = this.providers[this.data.source].html
            .replace('{{protocol}}', window.location.protocol)
            .replace('{{remote_id}}', this.data.remote_id)
            .replace('{{width}}', '100%'); // for videos that can't resize automatically like vine

        blockTemplate = this.template({content: embedString});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: ''});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        url = this.$('img').attr('src');
        json = {
            type: this.type,
            data: this.data
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
            this.$('.villain-video-block').hide();
            videoSetup = $([
                '<div class="villain-video-setup-icon">',
                    '<i class="fa fa-video-camera"></i>',
                    '<div>Lim inn link til youtube eller vimeo, f.eks http://www.youtube.com/watch?v=jlbunmCbTBA</div>',
                '</div>',
                '<div class="villain-video-setup-input-wrapper">',
                    '<input type="text" name="villain-video-setup-url" class="villain-video-setup-url" />',
                '</div>',
                '<div><hr></div>',
                '<div style="text-align: center;"><button>Hent video</button></div>',
            ].join('\n'));
            this.$setup.append(videoSetup);
            this.$setup.show();
        }
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        blockType = 'video';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-video-camera"></i>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
