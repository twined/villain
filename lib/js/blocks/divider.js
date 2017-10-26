import _ from 'underscore';

import Block from '../block';

const Divider = Block.extend({
  type: 'divider',
  blockName: 'hr',
  blockIcon: 'fa-minus',
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
});

export default Divider;
