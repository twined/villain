import _ from 'underscore';
import $ from 'jquery';

import Block from '../block';

const VIMEO_REGEX =
  /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/;
const YOUTUBE_REGEX =
  /(?:http[s]?:\/\/)?(?:www.)?(?:(?:youtube.com\/watch\?(?:.*)(?:v=))|(?:youtu.be\/))([^&].+)/;

const Video = Block.extend({
  type: 'video',
  blockName: 'video',
  blockIcon: 'fa-video',
  resizeSetup: false,

  providers: {
    vimeo: {
      regex: VIMEO_REGEX,
      html: [
        '<iframe src="{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0" ',
        'width="580" height="320" frameborder="0"></iframe>',
      ].join('\n'),
    },
    youtube: {
      regex: YOUTUBE_REGEX,
      html: ['<iframe src="{{protocol}}//www.youtube.com/embed/{{remote_id}}" ',
        'width="580" height="320" frameborder="0" allowfullscreen></iframe>',
      ].join('\n'),
    },
  },

  template: _.template(
    '<div class="villain-video-block villain-content"><%= content %></div>'
  ),

  additionalEvents: {
    'click .villain-setup-block button': 'onVideoSetupClick',
  },

  onVideoSetupClick(e) {
    e.preventDefault();
    const videoUrl = this.$('.villain-video-setup-url').val();

    if (!_.isURI(videoUrl)) {
      return;
    }

    const embedString = this.buildString(videoUrl);

    this.$content.html(embedString);
    this.hideSetup();
  },

  buildString(videoUrl) {
    let match;
    let data;

    _.each(this.providers, (provider, index) => {
      match = provider.regex.exec(videoUrl);

      if (match !== null && !_.isUndefined(match[1])) {
        data = {
          source: index,
          remote_id: match[1],
        };
        this.setData(data);
      }
    }, this);

    if (!{}.hasOwnProperty.call(this.providers, data.source)) {
      return false;
    }

    return this.providers[data.source].html
      .replace('{{protocol}}', window.location.protocol)
      .replace('{{remote_id}}', data.remote_id)
      .replace('{{width}}', '100%'); // for videos that can't resize automatically like vine
  },

  renderEditorHtml() {
    if (!{}.hasOwnProperty.call(this.providers, this.data.source)) {
      return false;
    }

    const embedString = this.providers[this.data.source].html
      .replace('{{protocol}}', window.location.protocol)
      .replace('{{remote_id}}', this.data.remote_id)
      .replace('{{width}}', '100%'); // for videos that can't resize automatically like vine

    const blockTemplate = this.template({
      content: embedString,
    });
    const actionsTemplate = this.actionsTemplate();

    return this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: '',
    });
    const actionsTemplate = this.actionsTemplate();
    return this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
  },

  getJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  },

  getHTML() {
    const url = this.$('img').attr('src');
    return this.template({
      url,
    });
  },

  setup() {
    // check if this block has data, if not, show the setup div
    const videoSetup = $(`
      <div class="villain-video-setup-icon">
        <i class="fa fa-video-camera"></i>
        <div>${this.editor.i18n.t('video:setup_instructions')}<br/>http://www.youtube.com/watch?v=jlbunmCbTBA</div>
      </div>
      <div class="villain-video-setup-input-wrapper">
        <input type="text" name="villain-video-setup-url" class="villain-video-setup-url" />
      </div>
      <div><hr></div>
      <div style="text-align: center;"><button>OK</button></div>
    `);
    this.$setup.append(videoSetup);

    if (!this.hasData()) {
      this.showSetup();
    } else {
      this.$setup.hide();
    }
  },
});

export default Video;
