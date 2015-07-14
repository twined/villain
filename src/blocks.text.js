Villain.Blocks.Text = Villain.Block.extend({
    type: 'text',
    template: _.template(
        '<div class="villain-text-block villain-content" contenteditable="true" data-text-type="<%= type %>"><%= content %></div>'
    ),

    renderEditorHtml: function() {
        blockTemplate = this.renderContentBlockHtml();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderContentBlockHtml: function() {
        text = this.getTextBlockInner() ? this.getTextBlockInner() : this.data.text;
        return this.template({content: Villain.toHTML(text), type: this.data.type});
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: '', type: "paragraph"});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    getJSON: function() {
        textNode = Villain.toMD(this.getTextBlockInner());
        data = this.getData();
        json = {
            type: this.type,
            data: {
                text: textNode,
                type: data.type
            }
        };
        return json;
    },

    getHTML: function() {
        textNode = this.getTextBlock().html();
        return markdown.toHTML(textNode);
    },

    setup: function() {
        data = this.getData();
        if (!data.hasOwnProperty('type')) {
            this.setDataProperty('type', 'paragraph');
        }
        type = this.data.type;
        this.$setup.hide();
        var radios = "";
        types = ['paragraph', 'lead'];
        for (i in types) {
            selected = "";
            if (type === types[i]) {
                selected = ' checked="checked"';
            }
            radios += '<label><input type="radio" name="text-type" value="'
                    + types[i] + '"' + selected + '>' + types[i] + '</label>';
        }

        this.$setup.append($([
            '<label>Type</label>',
            radios
        ].join('\n')));

        this.$setup.find('input[type=radio]').on('change', $.proxy(function(e) {
            this.setDataProperty('type', $(e.target).val());
            this.refreshContentBlock();
            this.$content.attr('data-text-type', $(e.target).val());
        }, this));
    },
},
{
    /* static methods */
    getButton: function(afterId) {
        var blockType = 'text';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-paragraph"></i>',
            '</button>'].join('\n'));
        return t({id: afterId, type: blockType});
    }
});
