Villain.Blocks.List = Villain.Block.extend({
    type: 'list',
    template: _.template([
        '<div class="villain-text-block villain-text-block-list villain-content" contenteditable="true">',
          '<ul><li><%= content %></li></ul>',
        '</div>'].join('\n')
    ),

    renderEditorHtml: function() {
        blockTemplate = this.template({content: this.data.text});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: 'Liste'});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        textNode = this.getTextBlock().html().replace(/<\/li>/mg,'\n')
                                             .replace(/<\/?[^>]+(>|$)/g, '')
                                             .replace(/^(.+)$/mg,' - $1');
        json = {
            type: this.type,
            data: {
                text: textNode
            }
        };
        return json;
    },

    getHTML: function() {
        textNode = this.getTextBlock().html();
        return '<h3>' + markdown.toHTML(textNode) + '</h3>';
    },

    toMarkdown: function(markdown) {
      return markdown.replace(/<\/li>/mg,'\n')
                     .replace(/<\/?[^>]+(>|$)/g, '')
                     .replace(/^(.+)$/mg,' - $1');
    },
    /*
    onBlockRender: function() {
      this.checkForList = _.bind(this.checkForList, this);
      this.getTextBlock().on('click keyup', this.checkForList);
    },
    */

},
{
    /* static methods */
    getButton: function(afterId) {
        blockType = 'list';
        t = _.template([
            '<button class="villain-block-button" ',
            '        data-type="<%= type %>" ',
            '        data-after-block-id="<%= id %>"',
            '>',
            '   <i class="fa fa-list-ul"></i>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
