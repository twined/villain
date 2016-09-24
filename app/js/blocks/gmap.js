import _ from 'underscore';
import $ from 'jquery';

import Block from '../block';
import { alertError } from '../alerts';

const Gmap = Block.extend({
  type: 'map',

  providers: {
    gmaps: {
      regex: /<iframe(?:.*)src="(.*?)"/,
      html: `
        <iframe src="{{protocol}}{{embed_url}}"
                width="600"
                height="450"
                frameborder="0"
                style="border:0"
                allowfullscreen></iframe>`,
    },
  },

  template: _.template(
    '<div class="villain-map-block villain-content"><%= content %></div>'
  ),

  additionalEvents: {
    'click .villain-setup-block button': 'onSetupBlockClick',
  },

  onSetupBlockClick(e) {
    e.preventDefault();
    const mapUrl = this.$('.villain-map-setup-url').val();
    const embedString = this.buildString(mapUrl);

    if (!embedString) {
      return;
    }

    this.$content.html(embedString);
    this.hideSetup();
  },

  buildString(mapUrl) {
    let match;
    let data = {};

    _.each(this.providers, function loopProviders(provider, index) {
      match = provider.regex.exec(mapUrl);

      if (match !== null && !_.isUndefined(match[1])) {
        data = {
          source: index,
          embed_url: match[1],
        };

        data.embed_url = data.embed_url.replace('http:', '')
          .replace('https:', '');
        this.setData(data);
      }
    }, this);

    if (!{}.hasOwnProperty.call(data, 'source')) {
      alertError('Feil format på embed.');
      return false;
    }

    if (!{}.hasOwnProperty.call(this.providers, data.source)) {
      return false;
    }

    return this.providers[data.source].html
      .replace('{{protocol}}', 'https:')
      .replace('{{embed_url}}', data.embed_url)
      .replace('{{width}}', '100%');
  },

  renderEditorHtml() {
    if (!{}.hasOwnProperty.call(this.providers, this.data.source)) {
      return false;
    }

    // this.hideSetup();

    const embedString = this.providers[this.data.source].html
      .replace('{{protocol}}', 'https:')
      .replace('{{embed_url}}', this.data.embed_url)
      .replace('{{width}}', '100%');

    const blockTemplate = this.template({ content: embedString });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  renderEmpty() {
    const blockTemplate = this.template({ content: '' });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

    return wrapperTemplate;
  },

  getJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  },

  getHTML() {
    const url = this.$('img').attr('src');
    return this.template({ url });
  },

  setup() {
    // check if this block has data. if not, show the setup div
    if (!this.hasData()) {
      this.$('.villain-map-block').hide();
      const mapSetup = $(`
        <div class="villain-map-setup-icon">
          <i class="fa fa-map-marker"></i>
          <div>Lim inn embed-link fra Google Maps</div>
        </div>
        <div class="villain-map-setup-input-wrapper">
          <input type="text" name="villain-map-setup-url" class="villain-map-setup-url" />
        </div>
        <div><hr></div>
        <div style="text-align: center;"><button>Hent kart</button></div>`
      );
      this.$setup.append(mapSetup);
      this.$setup.show();
    } else {
      this.hideSetup();
    }
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'map';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-map-marker"></i>',
      '<p>map</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Gmap;
