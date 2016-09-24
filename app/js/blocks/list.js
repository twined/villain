import _ from 'underscore';
import marked from 'marked';

import Block from '../block';

const List = Block.extend({
  type: 'list',
  template: _.template([
    '<div class="villain-text-block villain-text-block-list villain-content" contenteditable="true">',
    '  <%= content %>',
    '</div>',
  ].join('\n')),

  additionalEvents: {
    'keyup .villain-content': 'onListKeyUp',
  },

  onListKeyUp(e) {
    const target = e.currentTarget;
    if (target.innerText === '' || target.innerText === '\n') {
      target.innerHTML = '<ul><li><br></li></ul>';
    }
  },

  renderEditorHtml() {
    const blockTemplate = this.template({
      content: marked(this.data.text),
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  renderEmpty() {
    const blockTemplate = this.template({
      content: '<ul><li>list</li></ul>',
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });
    return wrapperTemplate;
  },

  getJSON() {
    const textNode = this.getTextBlock()
      .html()
      .replace(/<\/li>/mg, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/^(.+)$/mg, ' - $1');
    return {
      type: this.type,
      data: {
        text: textNode,
      },
    };
  },

  getHTML() {
    const textNode = this.getTextBlock().html();
    return `<h3>${marked(textNode)}</h3>`;
  },

  toMarkdown(markdown) {
    return markdown.replace(/<\/li>/mg, '\n')
                   .replace(/<\/?[^>]+(>|$)/g, '')
                   .replace(/^(.+)$/mg, ' - $1');
  },

}, {
  /* static methods */
  getButton(afterId) {
    const blockType = 'list';
    const t = _.template([
      '<button class="villain-block-button" ',
      '        data-type="<%= type %>" ',
      '        data-after-block-id="<%= id %>">',
      '  <i class="fa fa-list-ul"></i>',
      '  <p>list</p>',
      '</button>',
    ].join('\n'));
    return t({
      id: afterId,
      type: blockType,
    });
  },
});

export default List;
