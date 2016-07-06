Villain.Blocks.Header = Villain.Block.extend({
    type: 'header',
    template: _.template([
        '<div class="villain-text-block villain-text-block-header villain-content" data-header-level="<%= level %>" contenteditable="true">',
          '<%= content %>',
        '</div>'
    ].join('\n')),

    renderEditorHtml: function() {
        blockTemplate = this.renderContentBlockHtml();
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    renderContentBlockHtml: function() {
        return this.template({content: this.data.text, level: this.data.level});
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: 'Header', level: 1});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        return wrapperTemplate;
    },

    setup: function() {
        data = this.getData();
        if (!data.hasOwnProperty('level')) {
            this.setDataProperty('level', 1);
        }
        level = data['level'];
        this.$setup.hide();
        var radios = "";
        levels = [1, 2, 3, 4, 5];
        
        for (i in levels) {
            selected = "";
            if (parseInt(level) === parseInt(levels[i])) {
                selected = ' checked="checked"';
            }
            radios += '<label><input type="radio" name="header-size-' +
                      this.dataId + '" value="' + levels[i] + '"' +
                      selected + '>H' + levels[i] + '</label>';
        }

        this.$setup.append($([
            '<label>Størrelse</label>',
            radios
        ].join('\n')));

        this.$setup.find('input[type=radio]').on('change', $.proxy(function(e) {
            this.setDataProperty('level', $(e.target).val());
            this.refreshContentBlock();
            this.$content.attr('data-header-level', $(e.target).val());
        }, this));
    },

    getData: function() {
        data = this.data;
        data.text = Villain.toMD(this.getTextBlock().html()).trim();
        return data;
    },

    getJSON: function() {
        // strip newlines
        json = {
            type: this.type,
            data: this.getData()
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
        var blockType = 'header';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-header"></i>',
            '<p>h1-6</p>',
            '</button>'].join('\n'));
        return t({
            id: afterId,
            type: blockType
        });
    }
});
