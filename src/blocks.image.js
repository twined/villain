Villain.Blocks.Image = Villain.Block.extend({
    type: 'image',
    template: _.template(
        '<div class="villain-image-block villain-content"><img class="img-responsive" src="<%= url %>" /></div>'
    ),

    events: {
        'drop .villain-image-dropper i': 'onDropImage',
        'dragenter .villain-image-dropper i': 'onDragEnter',
        'dragleave .villain-image-dropper i': 'onDragLeave',
        'dragover .villain-image-dropper i': 'onDragOver',
        'click .villain-image-dropper-upload': 'onUploadClickAfterDrop'
    },

    initialize: function(json, store) {
        Villain.Block.prototype.initialize.apply(this, [json, store]);
        _.extend(this.events, Villain.Block.prototype.events);
    },

    onUploadClickAfterDrop: function(e) {
        e.preventDefault();
        this.loading();
        var uid  = [this.dataId, (new Date()).getTime(), 'raw'].join('-');
        img = this.$setup.find('.villain-image-dropper img');
        if (!this.file) {
            this.done();
            return false;
        }

        var data = new FormData();

        data.append('name', this.file.name);
        data.append('image', this.file);
        data.append('uid', uid);

        that = this;

        $.ajax({
            type: 'post',
            dataType: 'json',
            accepts: {
                json: 'text/json'
            },
            url: Villain.options['uploadURL'],
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            //crossDomain: this.options.crossDomain,
            //xhrFields: {
            //    withCredentials: this.options.withCredentials
            //},
            //headers: this.options.headers,
            // Custom XMLHttpRequest
            xhr: function() {
                var customXhr = $.ajaxSettings.xhr();
                // Check if upload property exists
                if (customXhr.upload) {
                    customXhr.upload.addEventListener('progress', that.progressHandlingFunction, false);
                }
                return customXhr;
            },
            dataType: 'json'
        }).done($.proxy(function(data) {
            if (data.status == '200') {
                // image uploaded successfully
                this.$setup.append('<div class="villain-message success">Bildet er lastet opp</div>');
                // remove upload button
                this.$setup.find('.villain-image-dropper-upload').remove();
                this.$setup.find('.villain-image-dropper').remove();

                if (data.hasOwnProperty('image')) {
                    imageData = data.image;
                    $image = $('<img src="' + imageData.src + '" />');
                    this.$setup.append($image);

                    // set the image src as data
                    json = {
                        url: imageData.src
                    };
                    this.setData(json);
                }

                if (data.hasOwnProperty('uid')) {
                    uid = data.uid;
                }

                if (data.hasOwnProperty('form')) {
                    var inputsHtml = '';
                    inputTemplate = _.template([
                        '<label><%= label %></label>',
                        '<input type="<%= type %>" ',
                        '       value="<%= value %>" ',
                        '       name="<%= name %>"',
                        '/>'
                    ].join('\n'));
                    for (var i = 0; i < data.form.fields.length; i++) {
                        field = data.form.fields[i];
                        inputsHtml += inputTemplate({
                            label: field.label,
                            type: field.type,
                            value: field.value,
                            name: field.name
                        });
                    }
                    formTemplate = _.template([
                        '<form method="<%= method %>" ',
                        '      action="<%= action %>" ',
                        '      class="villain-form" ',
                        '      name="<%= name %>"',
                        '>',
                        '<%= inputs %>',
                        '</form>'
                    ].join('\n'));
                    form = formTemplate({
                        method: data.form.method,
                        action: data.form.action,
                        name: data.form.name,
                        inputs: inputsHtml
                    });
                    $form = $(form);
                    $submitButton = $('<input type="submit" name="' + data.form.name + '-submit" value="Lagre" />');

                    $submitButton.on('click', function(e) {
                        e.preventDefault();

                        serializedForm = $form.serialize();
                        imagedata = new FormData();
                        imagedata.append('form', serializedForm);
                        imagedata.append('uid', uid);

                        $.ajax({
                            type: 'post',
                            url: data.form.action,
                            data: imagedata,
                            cache: false,
                            contentType: false,
                            processData: false,
                            dataType: 'json'
                        }).done($.proxy(function(data) {
                            if (data.status == 200) {
                                // set the image title and credits as data
                                json = that.getData();
                                json.title = data.title;
                                json.credits = data.credits;
                                that.setData(json);
                                that.refreshBlock();
                            }
                        }, this));
                    });
                    $form.append($submitButton);
                    this.$setup.append($form);
                }
            }
        }, this)).fail($.proxy(function() {
            // Failed during upload.
            alert('Feil fra server under opplasting.');
        }, this)).always($.proxy(function() {
            // block.removeQueuedItem, block, uid
        }));
        // block.addQueuedItem(uid, xhr); ?
        this.done();
    },

    progressHandlingFunction: function(e) {
        if (e.lengthComputable) {
            // value
            //$('progress').attr({value:e.loaded, max:e.total});
        }
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
            this.$('.villain-image-dropper').html($('<img>', {src: urlAPI.createObjectURL(file)}));
            $form = $([
                '<form enctype="multipart/form-data" ',
                      'encoding="multipart/form-data" action="upload/image" ',
                      'method="post" id="villain-upload-form-' + this.dataId + '">',
                    '<input id="villain-upload-file-' + this.dataId + '" ',
                           'type="file" ',
                           'name="villain-upload-file-' + this.dataId + '" ',
                           'accept="image/*">',
                '</form>'].join('\n'));

            this.$setup.append('<hr>');
            this.$setup.append(
                '<button class="villain-image-dropper-upload">Last opp og lagre</button>'
            );
            this.file = file;
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
        json = {
            type: this.type,
            data: {
                url: this.data.url,
                title: this.data.title || "",
                credits: this.data.credits || ""
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
            $imageDropper = $([
                '<div class="villain-image-dropper"><i class="fa fa-image"></i>',
                    '<div>Dra bildet du vil laste opp hit</div>',
                    '<div><hr></div>',
                    '<div>',
                        '<button class="villain-image-browse-button">Hent bilde fra server</button>',
                        //'<button class="villain-image-upload-button">Last opp bilder</button>',
                        //'<input class="hidden" type="file" id="files" value="Last opp bilder" name="files[]" multiple />',
                    '</div>',
                '</div>'
            ].join('\n'));
            $imageDropper.find('.villain-image-browse-button').on('click', $.proxy(this.onImageBrowseButton, this));
            /*
            $imageDropper.find('input[type=file]').on('change', $.proxy(this.onUploadImagesButton, this));
            $imageDropper.find('.villain-image-upload-button').on('click', function(e) {
                $imageDropper.find('input[type=file]').click();
            });
            */
            this.$setup.append($imageDropper);
            this.$setup.show();
        }
    },

    onImageBrowseButton: function(e) {
        e.preventDefault();
        this.loading();
        $.ajax({
            type: 'get',
            url: Villain.options['browseURL'],
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json'
        }).done($.proxy(function(data) {
            if (data.status != 200) {

                return false;
            }
            if (!data.hasOwnProperty('images')) {
                return false;
            }
            $images = $('<div />');
            for (var i = 0; i < data.images.length; i++) {
                img = data.images[i];
                $images.append('<img src="' + img.thumb + '" data-large="' + img.src + '" />');
            }
            $images.on('click', 'img', $.proxy(function(e) {
                this.setData({
                    url: $(e.target).data('large')
                });
                this.refreshBlock();
            }, this));
            this.$setup.html('');
            this.$setup.append('<div class="villain-message success">Klikk på bildet du vil sette inn</div>');
            this.$setup.append($images);
            this.done();

        }, this));

    },

    onUploadImagesButton: function(e) {
        var files = e.target.files,
            urlAPI = (typeof URL !== 'undefined') ? URL : (typeof webkitURL !== 'undefined') ? webkitURL : null;
        fileList = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            fileList.push([
                '<div class="three">',
                '<div class="center-cropped" style="background-image: url(', urlAPI.createObjectURL(f), ');"></div>',
                '</div>'].join('\n')
            );
        }
        listHTML = '<div style="margin-top: 10px;" class="wrapper"><div class="row">';
        for (var x = 0; x < fileList.length; x++) {
            if (x && (x  % 4) === 0) {
                // add row
                listHTML += '</div><div style="margin-top: 15px" class="row">' + fileList[x];
            } else {
                listHTML += fileList[x];
            }
        }
        listHTML += '</div></div>';
        this.$setup.append(listHTML);
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        blockType = 'image';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-file-image-o"></i>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
