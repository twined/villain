Villain.Blocks.Header = Villain.Block.extend({
    type: 'header',
    template: _.template([
        '<div class="villain-text-block villain-text-block-header villain-content" contenteditable="true">',
          '<%= content %>',
        '</div>'
    ].join('\n')),

    renderEditorHtml: function() {
        blockTemplate = this.template({content: this.data.text});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: ''});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        textNode = Villain.toMD(this.getTextBlock().html()).trim();
        // strip newlines
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
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        blockType = 'header';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-header"></i>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
