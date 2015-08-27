Villain.Blocks.Slideshow = Villain.Block.extend({
    type: 'slideshow',
    template: _.template([
        '<div class="villain-slideshow-block villain-content" contenteditable="false">',
          '<h4>Slideshow</h4>',
          '<%= content %>',
        '</div>'
    ].join('\n')),

    renderEditorHtml: function() {
        blockTemplate = this.renderContentBlockHtml();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderContentBlockHtml: function() {
        images = this.renderDataImages();
        return this.template({content: images});
    },

    renderDataImages: function() {
        var data = this.getData();
        if (_.isUndefined(data.images)) {
            return "";
        } else {
            var html = "";
            for (var i = 0; i < data.images.length; i++) {
                img = data.images[i];
                html += '<img src="' + data.media_url + '/' + img.sizes.thumb + '" />';
            }
            return html;
        }
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: '<i class="fa fa-th"></i>'});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getAllImageseries: function() {
        that = this;
        $select = this.$setup.find('.imageserie-select');
        $.ajax({
            type: 'get',
            dataType: 'json',
            accepts: {
                json: 'text/json'
            },
            url: this.addToPathName(Villain.options['imageseriesURL']),
            cache: false,
            contentType: false,
            processData: false,
            // Custom XMLHttpRequest
            xhr: function() {
                var customXhr = $.ajaxSettings.xhr();
                // Check if upload property exists
                if (customXhr.upload) {
                    customXhr.upload.addEventListener('progress', that.progressHandlingFunction, false);
                }
                return customXhr;
            }
        }).done($.proxy(function(data) {
            /**
             * Callback after confirming upload
             */
            if (data.status == '200') {
                $select.append(that.buildOptions(data.series, true));
                if (!_.isUndefined(that.data.imageseries)) {
                    $select.val(that.data.imageseries).change();
                }
            }
        }));
    },

    getImageseries: function(series) {
        $.ajax({
            type: 'get',
            dataType: 'json',
            accepts: {json: 'text/json'},
            url: this.addToPathName(Villain.options['imageseriesURL']),
            data: {series: series},
            cache: false,
            contentType: false,
            // Custom XMLHttpRequest
            xhr: function() {
                var customXhr = $.ajaxSettings.xhr();
                // Check if upload property exists
                if (customXhr.upload) {
                    customXhr.upload.addEventListener('progress', that.progressHandlingFunction, false);
                }
                return customXhr;
            }
        }).done($.proxy(function(data) {
            /**
             * Callback after confirming upload
             */
            if (data.status == '200') {
                var json = {};

                json.imageseries = data.series;
                json.media_url = data.media_url;
                json.images = data.images;

                if (that.$setup.find('.imageserie-size-select').length > 0) {
                    // we already have the size select
                } else {
                    // add size dropdown
                    var sizeSelect = '<label for="imageserie-size">Str:</label>' +
                                     '<select class="imageserie-size-select" ' +
                                     '        name="imageserie-size"></select>';
                    that.$setup.append(sizeSelect);
                }

                var $sizeSelect = that.$setup.find('.imageserie-size-select');
                $sizeSelect.html('');
                $sizeSelect.append(that.buildOptions(data.sizes, true));
                if (!_.isUndefined(that.data.size)) {
                    $sizeSelect.val(that.data.size).change();
                }
                $sizeSelect.on('change', function(e) {
                    that.setDataProperty('size', $(this).val());
                    that.hideSetup();
                });
                that.setData(json);
                that.refreshContentBlock();
            }
        }));
    },

    buildOptions: function(values, placeholder) {
        if (placeholder) {
            html = '<option disabled="disabled" selected="selected">---</option>';
        } else {
            html = '';
        }
        for (var i = 0; i < values.length; i++) {
            val = values[i];
            html += '<option value="' + val + '">' + val + '</option>';
        }
        return html;
    },

    setup: function() {
        if (!this.hasData()) {
            this.$content.hide();

            that = this;
            data = this.getData();
            //this.$setup.hide();
            var select = '<select class="imageserie-select" name="imageserie"></select>';
            this.$setup.append($([
                '<label for="imageserie">Bildeserie</label>',
                select
            ].join('\n')));

            $select = this.$setup.find('.imageserie-select');
            $select.on('change', function(e) {
                that.getImageseries($(this).val());
            });

            this.getAllImageseries();
        } else {
            this.$setup.hide();
            var select = '<select class="imageserie-select" name="imageserie"></select>';
            this.$setup.append($([
                '<label for="imageserie">Bildeserie</label>',
                select
            ].join('\n')));

            $select = this.$setup.find('.imageserie-select');
            $select.on('change', function(e) {
                that.getImageseries($(this).val());
            });
            this.getAllImageseries();
        }
    },

    getData: function() {
        data = this.data;
        return data;
    },

    getJSON: function() {
        var data = this.getData();
        // strip out images, we don't need to store them since they are
        // already in the DB.
        delete data.images;
        delete data.media_url;
        json = {
            type: this.type,
            data: data
        };
        return json;
    },

    getHTML: function() {
        textNode = this.getTextBlock().html();
        return '<h3>' + markdown.toHTML(textNode) + '</h3>';
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'slideshow';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-th"></i>',
            '<p>slides</p>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
