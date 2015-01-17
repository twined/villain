Villain.Blocks.Text = Villain.Block.extend({
    type: 'text',
    template: _.template(
        '<div class="villain-text-block villain-content" contenteditable="true"><%= content %></div>'
    ),

    renderEditorHtml: function() {
        blockTemplate = this.template({content: Villain.toHTML(this.data.text)});
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
        textNode = Villain.toMD(this.getTextBlock().html());
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
        return markdown.toHTML(textNode);
    }
},
{
    /* static methods */
    getButton: function(afterId) {
        blockType = 'text';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-paragraph"></i>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
