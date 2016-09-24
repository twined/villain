import _ from 'underscore';

import Block from '../block';

const Divider = Block.extend({
  type: 'divider',
  template: _.template('<div class="villain-divider-block villain-content"><hr></div>'),

  renderEditorHtml() {
    const blockTemplate = this.template();
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  renderEmpty() {
    const blockTemplate = this.template();
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
      data: {
        text: '--------------------',
      },
    };
  },

  getHTML() {
    return '<hr>';
  },
}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'divider';
    const t = _.template([
      '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
      '<i class="fa fa-minus"></i>',
      '<p>hr</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default Divider;
