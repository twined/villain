import _ from 'underscore';
import $ from 'jquery';

import Block from '../block';
import { alertError } from '../alerts';

const Image = Block.extend({
  type: 'image',
  template: _.template(
    '<div class="villain-image-block villain-content"><img class="img-responsive" src="<%= url %>" /></div>'
  ),

  events: {
    'drop .villain-image-dropper i': 'onDropImage',
    'dragenter .villain-image-dropper i': 'onDragEnter',
    'dragleave .villain-image-dropper i': 'onDragLeave',
    'dragover .villain-image-dropper i': 'onDragOver',
    'click .villain-image-dropper-upload': 'onUploadClickAfterDrop',
  },

  initialize(editor, json, store) {
    Block.prototype.initialize.apply(this, [editor, json, store]);
    _.extend(this.events, Block.prototype.events);
  },

  renderEditorHtml() {
    const blockTemplate = this.renderContentBlockHtml();
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  renderContentBlockHtml() {
    return this.template({
      url: this.data.url,
    });
  },

  renderEmpty() {
    const blockTemplate = this.template({ url: 'http://placehold.it/1150x400' });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  onUploadClickAfterDrop(e) {
    const uid = [this.dataId, (new Date()).getTime(), 'raw'].join('-');
    const data = new FormData();

    e.preventDefault();
    this.loading();

    if (!this.file) {
      this.done();
      return false;
    }

    data.append('name', this.file.name);
    data.append('image', this.file);
    data.append('uid', uid);

    const self = this;

    $.ajax({
      data,
      type: 'post',
      dataType: 'json',
      accepts: { json: 'text/json' },
      url: this.addToPathName(this.editor.options.uploadURL),
      cache: false,
      contentType: false,
      processData: false,
      // Custom XMLHttpRequest
      xhr() {
        const customXhr = $.ajaxSettings.xhr();
        // Check if upload property exists
        if (customXhr.upload) {
          customXhr.upload.addEventListener('progress', self.progressHandlingFunction,
            false);
        }
        return customXhr;
      },
    })
    .done($.proxy(function uploadCallback(retData) {
      /**
       * Callback after confirming upload
       */
      if (retData.status === '200') {
        // image uploaded successfully
        this.$setup.append('<div class="villain-message success">Bildet er lastet opp</div>');
        // remove upload button
        this.$setup.find('.villain-image-dropper-upload').remove();
        this.$setup.find('.villain-image-dropper').remove();

        if ({}.hasOwnProperty.call(retData, 'image')) {
          const imageData = retData.image;
          const $image = $(`<img src="${imageData.src}" />`);
          this.$setup.append($image);

          // set the image src as data
          const json = {
            url: imageData.src,
            sizes: imageData.sizes,
          };
          this.setData(json);
        }

        let retUid;

        if ({}.hasOwnProperty.call(retData, 'uid')) {
          retUid = retData.uid;
        }

        if ({}.hasOwnProperty.call(retData, 'form')) {
          let inputsHtml = '';
          const inputTemplate = _.template([
            '<label><%= label %></label>',
            '<input type="<%= type %>" ',
            '       value="<%= value %>" ',
            '       name="<%= name %>"',
            '/>',
          ].join('\n'));
          for (let i = 0; i < retData.form.fields.length; i += 1) {
            const field = retData.form.fields[i];
            inputsHtml += inputTemplate({
              label: field.label,
              type: field.type,
              value: field.value,
              name: field.name,
            });
          }
          const formTemplate = _.template([
            '<form method="<%= method %>" ',
            '      action="<%= action %>" ',
            '      class="villain-form" ',
            '      name="<%= name %>"',
            '>',
            '<%= inputs %>',
            '</form>',
          ].join('\n'));
          const form = formTemplate({
            method: retData.form.method,
            action: self.addToPathName(retData.form.action),
            name: retData.form.name,
            inputs: inputsHtml,
          });
          const $form = $(form);
          const $submitButton = $(`<input type="submit" name="${retData.form.name}-submit" value="Lagre" />`);

          $submitButton.on('click', function submitClicked(ev) {
            ev.preventDefault();

            const serializedForm = $form.serialize();
            const imagedata = new FormData();
            imagedata.append('form', serializedForm);
            imagedata.append('uid', retUid);

            $.ajax({
              type: 'post',
              url: self.addToPathName(retData.form.action),
              data: imagedata,
              cache: false,
              contentType: false,
              processData: false,
              dataType: 'json',
            })
            .done($.proxy((attrsData) => {
              if (attrsData.status === 200) {
                // set the image title and credits as data
                const json = self.getData();
                json.title = attrsData.title;
                json.credits = attrsData.credits;
                json.link = '';
                self.setData(json);
                self.refreshContentBlock();
                self.hideSetup();
                self.setup();
              }
            }, this));
          });
          $form.append($submitButton);
          this.$setup.append($form);
        }
      }
    }, this))
    .fail($.proxy(() => {
      // Failed during upload.
      alertError('Feil fra server under opplasting.');
    }, this))
    .always($.proxy(() => {

    }));
    this.done();
    return true;
  },

  progressHandlingFunction(e) {
    if (e.lengthComputable) {
      // value
      // $('progress').attr({value:e.loaded, max:e.total});
    }
  },

  onDragEnter(e) {
    this.$('.villain-image-dropper i').addClass('drop-hover');
    e.preventDefault();
  },

  onDragLeave(e) {
    this.$('.villain-image-dropper i').removeClass('drop-hover');
    e.preventDefault();
  },

  onDragOver(e) {
    e.preventDefault();
  },

  getUrlAPI() {
    if (typeof URL !== 'undefined') {
      return URL;
    } else if (typeof window.webkitURL !== 'undefined') {
      return window.webkitURL;
    }
    return null;
  },

  onDropImage(e) {
    e.preventDefault();
    this.$('.villain-image-dropper i').removeClass('drop-hover');

    const dataTransfer = e.originalEvent.dataTransfer;
    const file = dataTransfer.files[0];
    const urlAPI = this.getUrlAPI();

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      // Show this image on here
      this.$('.villain-image-dropper')
        .html($('<img>', {
          src: urlAPI.createObjectURL(file),
        }));

      // const $form = $(`
      //   <form enctype="multipart/form-data"
      //         encoding="multipart/form-data"
      //         action="upload/image"
      //         method="post"
      //         id="villain-upload-form-${this.dataId}">
      //     <input id="villain-upload-file-${this.dataId}"
      //            type="file"
      //            name="villain-upload-file-${this.dataId}"
      //            accept="image/*">
      //   </form>`
      // );

      this.$setup.append('<hr>');
      this.$setup.append(
        '<button class="villain-image-dropper-upload">Last opp og lagre</button>'
      );
      this.file = file;
    }
  },

  getJSON() {
    const data = this.getData();
    return {
      type: this.type,
      data: {
        url: data.url,
        sizes: data.sizes,
        title: data.title || '',
        credits: data.credits || '',
        link: data.link || '',
      },
    };
  },

  getHTML() {
    const url = this.$('img').attr('src');
    return this.template({ url });
  },

  setup() {
    // check if this block has data. if not, show the setup div
    if (!this.hasData()) {
      this.$('.villain-image-block')
        .hide();
      const $imageDropper = $([
        '<div class="villain-image-dropper">',
        '  <i class="fa fa-image"></i>',
        '  <div>Dra bildet du vil laste opp hit</div>',
        '  <div><hr></div>',
        '  <div>',
        '    <button class="villain-image-browse-button">Hent bilde fra server</button>',
        '  </div>',
        '</div>',
      ].join('\n'));

      $imageDropper.find('.villain-image-browse-button')
        .on('click', $.proxy(this.onImageBrowseButton, this));
      this.$setup.append($imageDropper);
      this.$setup.show();
    } else {
      this.clearSetup();
      const data = this.getData();
      const $form = $(`<form name="image-meta-${this.dataId}">`);
      const $meta = $(`
        <label for="title">Tittel</label>
        <input value="${data.title}" type="text" name="title" />
        <label for="credits">Kreditering</label>
        <input value="${data.credits}" type="text" name="credits" />
        <label for="link">URL</label>
        <input value="${data.link}" type="text" name="link" />
      `);
      $form.append($meta);
      $form.append($('<label>Størrelse</label>'));

      /* create sizes overview */
      for (const key in data.sizes) {
        if ({}.hasOwnProperty.call(data.sizes, key)) {
          let checked = '';
          if (data.sizes[key] === data.url) {
            checked = ' checked="checked"';
          }
          const $radio = $(`
            <label for="${key}">
              <input type="radio"
                     name="imagesize"
                     value="${data.sizes[key]}"${checked} />
              ${key}
            </label>
          `);
          $form.append($radio);
        }
      }

      this.$setup.append($form);
      this.$setup.find('input[name="title"]')
        .on('keyup', _.debounce($.proxy(function setTitle(e) {
          this.setDataProperty('title', $(e.target)
            .val());
        }, this), 700, false));
      this.$setup.find('input[name="credits"]')
        .on('keyup', _.debounce($.proxy(function setCredits(e) {
          this.setDataProperty('credits', $(e.target)
            .val());
        }, this), 700, false));
      this.$setup.find('input[name="link"]')
        .on('keyup', _.debounce($.proxy(function setLink(e) {
          this.setDataProperty('link', $(e.target)
            .val());
        }, this), 700, false));
      this.$setup.find('input[type=radio]')
        .on('change', $.proxy(function setUrl(e) {
          this.setUrl($(e.target)
            .val());
        }, this));
      this.hideSetup();
    }
  },

  setUrl(url) {
    this.setDataProperty('url', url);
    this.refreshContentBlock();
  },

  onImageBrowseButton(e) {
    e.preventDefault();
    this.loading();
    $.ajax({
      type: 'get',
      url: this.addToPathName(this.editor.options.browseURL),
      cache: false,
      contentType: false,
      processData: false,
      dataType: 'json',
    }).done($.proxy((data) => {
      /**
       * Data returned from image browse.
       */
      if (data.status !== 200) {
        alertError('Ingen bilder fantes.');
        this.done();
        return false;
      }

      if (!{}.hasOwnProperty.call(data, 'images')) {
        alertError('Ingen bilder fantes.');
        this.done();
        return false;
      }

      const $images = $('<div />');

      for (let i = 0; i < data.images.length; i += 1) {
        const img = data.images[i];
        const $storeImg = $(`<img src="${img.thumb}" />`);
        $storeImg.data('sizes', img.sizes)
          .data('large', img.src)
          .data('title', img.title)
          .data('credits', img.credits);
        $images.append($storeImg);
      }
      $images.on('click', 'img', $.proxy(function setDataOnClick(ev) {
        this.setData({
          url: $(ev.target)
            .data('large'),
          title: $(ev.target)
            .data('title'),
          credits: $(ev.target)
            .data('credits'),
          sizes: $(ev.target)
            .data('sizes'),
        });
        this.getData();
        this.refreshContentBlock();
        this.hideSetup();
        this.setup();
      }, this));

      this.$setup.html('');
      this.$setup.append(
        '<div class="villain-message success">Klikk på bildet du vil sette inn</div>'
      );
      this.$setup.append($images);
      this.done();
      return true;
    }, this))
    .fail(() => {
      alertError('Kunne ikke koble til bildeserver.');
      this.done();
      return false;
    });
    return true;
  },

  onUploadImagesButton(e) {
    const files = e.target.files;
    const urlAPI = this.getUrlAPI();
    const fileList = [];

    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];

      fileList.push([
        '<div class="three">',
        '<div class="center-cropped" style="background-image: url(',
        urlAPI.createObjectURL(f),
        ');"></div>',
        '</div>',
      ].join('\n'));
    }

    let listHTML = '<div style="margin-top: 10px;" class="wrapper"><div class="row">';
    for (let x = 0; x < fileList.length; x += 1) {
      if (x && (x % 4) === 0) {
        // add row
        listHTML += `</div><div style="margin-top: 15px" class="row">${fileList[x]}`;
      } else {
        listHTML += fileList[x];
      }
    }
    listHTML += '</div></div>';
    this.$setup.append(listHTML);
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'image';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-file-image-o"></i>',
      '<p>img</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Image;
