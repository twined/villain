Villain.Blocks.Map = Villain.Block.extend({
    type: 'map',

    providers: {
        gmaps: {
            regex: /\<iframe(?:.*)src="(.*?)"/,
            html: [
                '<iframe src="{{protocol}}{{embed_url}}" ',
                '        width="600" ',
                '        height="450" ',
                '        frameborder="0" ',
                '        style="border:0" ',
                '        allowfullscreen></iframe>'].join('\n')
        }
    },

    template: _.template(
        '<div class="villain-map-block villain-content"><%= content %></div>'
    ),

    events: {
        'click .villain-setup-block button': 'onClick'
    },

    onClick: function(e) {
        e.preventDefault();
        mapUrl = this.$('.villain-map-setup-url').val();

        embedString = this.buildString(mapUrl);

        if (!embedString) {
            return;
        }

        this.$content.html(embedString);
        this.hideSetup();
    },

    buildString: function(mapUrl) {
        var match;
        var data = {};

        _.each(this.providers, function(provider, index) {
            match = provider.regex.exec(mapUrl);

            if (match !== null && !_.isUndefined(match[1])) {
                data = {
                    source: index,
                    embed_url: match[1]
                };

                data.embed_url = data.embed_url.replace('http:', '').replace('https:', '');
                this.setData(data);
            }
        }, this);

        if (!data.hasOwnProperty('source')) {
            alert('Feil format på embed.');
            return;
        }

        if (!this.providers.hasOwnProperty(data.source)) {
            return;
        }

        var embedString = this.providers[data.source].html
            .replace('{{protocol}}', window.location.protocol)
            .replace('{{embed_url}}', data.embed_url)
            .replace('{{width}}', '100%');

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
            .replace('{{width}}', '100%');

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
            this.$('.villain-map-block').hide();
            mapSetup = $([
                '<div class="villain-map-setup-icon">',
                    '<i class="fa fa-map-marker"></i>',
                    '<div>Lim inn embed-link fra Google Maps</div>',
                '</div>',
                '<div class="villain-map-setup-input-wrapper">',
                    '<input type="text" name="villain-map-setup-url" class="villain-map-setup-url" />',
                '</div>',
                '<div><hr></div>',
                '<div style="text-align: center;"><button>Hent kart</button></div>',
            ].join('\n'));
            this.$setup.append(mapSetup);
            this.$setup.show();
        }
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'map';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-map-marker"></i>',
            '<p>map</p>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
