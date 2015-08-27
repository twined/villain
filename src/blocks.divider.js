Villain.Blocks.Divider = Villain.Block.extend({
    type: 'divider',
    template: _.template('<div class="villain-divider-block villain-content"><hr></div>'),

    renderEditorHtml: function() {
        blockTemplate = this.template();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderEmpty: function() {
        blockTemplate = this.template();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        json = {
            type: this.type,
            data: {
                text: '--------------------'
            }
        };
        return json;
    },

    getHTML: function() {
        return '<hr>';
    }
}, {
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'divider';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-minus"></i>',
            '<p>hr</p>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
