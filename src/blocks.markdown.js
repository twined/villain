Villain.Blocks.Markdown = Villain.Block.extend({
    type: 'markdown',
    template: _.template(
        '<div class="villain-md-block villain-content"><textarea><%= content %></textarea></div>'
    ),

    initialize: function(json, store) {
        Villain.Block.prototype.initialize.apply(this, [json, store]);
        _.extend(this.events, Villain.Block.prototype.events);
    },

    afterRenderCallback: function() {
        var that = this;
        this.$('textarea').autogrow({onInitialize: true});
    },

    renderEditorHtml: function() {
        blockTemplate = this.renderContentBlockHtml();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderContentBlockHtml: function() {
        text = this.getTextBlockInner() ? this.getTextBlockInner() : this.data.text;
        return this.template({content: text});
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: 'Markdown'});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        textNode = this.$('textarea').val();

        data = this.getData();
        json = {
            type: this.type,
            data: {
                text: textNode
            }
        };
        return json;
    },

    getHTML: function() {
        textNode = this.$('textarea').val();
        return textNode;
    },
},
{
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'markdown';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-code"></i>',
            '<p>markdown</p>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
