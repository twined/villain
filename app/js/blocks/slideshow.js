import _ from 'underscore';
import $ from 'jquery';
import marked from 'marked';

import Block from '../block';

const Slideshow = Block.extend({
  type: 'slideshow',
  blockName: 'slides',
  blockIcon: 'fa-th',
  template: _.template([
    '<div class="villain-slideshow-block villain-content" contenteditable="false">',
    '  <h4>Slideshow</h4>',
    '  <%= content %>',
    '</div>',
  ].join('\n')),

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
    const images = this.renderDataImages();
    return this.template({
      content: images,
    });
  },

  renderDataImages() {
    const data = this.getData();
    if (_.isUndefined(data.images)) {
      return '';
    }

    let html = '';
    for (let i = 0; i < data.images.length; i += 1) {
      const img = data.images[i];
      html += `<img src="${data.media_url}/${img.sizes.thumb}" />`;
    }
    return html;
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: '<i class="fa fa-th"></i>',
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  getAllImageseries() {
    const self = this;
    const $select = this.$setup.find('.imageserie-select');

    $.ajax({
      type: 'get',
      dataType: 'json',
      accepts: {
        json: 'text/json',
      },
      url: this.addToPathName(this.editor.options.imageseriesURL),
      cache: false,
      contentType: false,
      processData: false,
      // Custom XMLHttpRequest
      xhr() {
        const customXhr = $.ajaxSettings.xhr();
        // Check if upload property exists
        if (customXhr.upload) {
          customXhr.upload.addEventListener('progress', self.progressHandlingFunction, false);
        }
        return customXhr;
      },
    })
    .done($.proxy((data) => {
      /**
       * Callback after confirming upload
       */
      if (data.status === '200') {
        $select.append(self.buildOptions(data.series, true));
        if (!_.isUndefined(self.data.imageseries)) {
          $select.val(self.data.imageseries)
            .change();
        }
      }
    }));
  },

  getImageseries(series) {
    const self = this;

    $.ajax({
      type: 'get',
      dataType: 'json',
      accepts: {
        json: 'text/json',
      },
      url: this.addToPathName(this.editor.options.imageseriesURL),
      data: {
        series,
      },
      cache: false,
      contentType: false,
      // Custom XMLHttpRequest
      xhr() {
        const customXhr = $.ajaxSettings.xhr();
        // Check if upload property exists
        if (customXhr.upload) {
          customXhr.upload.addEventListener('progress', self.progressHandlingFunction, false);
        }
        return customXhr;
      },
    })
    .done($.proxy((data) => {
      /**
       * Callback after confirming upload
       */
      if (data.status === '200') {
        const json = {};

        json.imageseries = data.series;
        json.media_url = data.media_url;
        json.images = data.images;

        if (self.$setup.find('.imageserie-size-select').length > 0) {
          // we already have the size select
        } else {
          // add size dropdown
          const sizeSelect = '<label for="imageserie-size">Str:</label>' +
            '<select class="imageserie-size-select" ' +
            '        name="imageserie-size"></select>';
          self.$setup.append(sizeSelect);
        }

        const $sizeSelect = self.$setup.find('.imageserie-size-select');
        $sizeSelect.html('');
        $sizeSelect.append(self.buildOptions(data.sizes, true));

        if (!_.isUndefined(self.data.size)) {
          $sizeSelect.val(self.data.size).change();
          json.size = self.data.size;
        }

        $sizeSelect.on('change', function sizeSelectChangeCallback() {
          json.size = $(this).val();
          self.hideSetup();
        });

        self.setData(json);
        self.refreshContentBlock();
      }
    }));
  },

  buildOptions(values, placeholder) {
    let html;

    if (placeholder) {
      html = '<option disabled="disabled" selected="selected">---</option>';
    } else {
      html = '';
    }

    for (let i = 0; i < values.length; i += 1) {
      const val = values[i];
      html += `<option value="${val}">${val}</option>`;
    }
    return html;
  },

  setup() {
    const self = this;

    if (!this.hasData()) {
      this.$content.hide();
      const select = '<select class="imageserie-select" name="imageserie"></select>';
      this.$setup.append($(`
        <label for="imageserie">
          ${this.editor.i18n.t('slides:imageserie')}
        </label>
        ${select}
      `));

      const $select = this.$setup.find('.imageserie-select');
      $select.on('change', function imageSeriesSelectChangeCallback() {
        self.getImageseries($(this).val());
      });

      this.getAllImageseries();
    } else {
      this.$setup.hide();

      const select = '<select class="imageserie-select" name="imageserie"></select>';
      this.$setup.append($(`
        <label for="imageserie">
          ${this.editor.i18n.t('slides:imageserie')}
        </label>
        ${select}
      `));

      const $select = this.$setup.find('.imageserie-select');
      $select.on('change', function imageSeriesSelectChangeCallbackWithData() {
        self.getImageseries($(this).val());
      });
      this.getAllImageseries();
    }
  },

  getData() {
    return this.data;
  },

  getJSON() {
    const data = this.getData();
    // strip out images, we don't need to store them since they are already in the DB.
    delete data.images;
    delete data.media_url;
    return {
      data,
      type: this.type,
    };
  },

  getHTML() {
    const textNode = this.getTextBlock().html();
    return `<h3>${marked(textNode)}</h3>`;
  },
});

export default Slideshow;
