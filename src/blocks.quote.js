Villain.Blocks.Blockquote = Villain.Block.extend({
    type: 'blockquote',
    template: _.template(
        '<div class="villain-quote-block villain-content"><blockquote contenteditable="true"><%= content %></blockquote><cite contenteditable="true"><%= cite %></cite></div>'
    ),

    renderEditorHtml: function() {
        blockTemplate = this.renderContentBlockHtml();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderContentBlockHtml: function() {
        text = this.getTextBlockInner() ? this.getTextBlockInner() : this.data.text;
        return this.template({content: Villain.toHTML(text), cite: this.data.cite});
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: 'quote', cite: 'author'});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        quote = this.$content.find('blockquote')[0].outerHTML;
        cite = $('cite', this.$content).html();
        textNode = Villain.toMD(quote);
        data = this.getData();
        json = {
            type: this.type,
            data: {
                text: textNode,
                cite: cite
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
        var blockType = 'blockquote';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-quote-right"></i>',
            '<p>quote</p>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
