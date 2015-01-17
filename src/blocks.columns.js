/* Columns */

Villain.Blocks.Columns = Villain.Block.extend({
    type: 'columns',
    template: _.template('<div class="row"></div>'),
    columnTemplate: _.template('<div class="<%= columnClass %>"></div>'),

    events: {
        'keyup input[name="villain-columns-number"]': '_updateColumnCount',
        'click button.villain-columns-apply': '_applyColumnCount'
    },

    initialize: function(json, store) {
        Villain.Block.prototype.initialize.apply(this, [json, store]);
        _.extend(this.events, Villain.Block.prototype.events);
    },

    deleteBlock: function() {
        // delete the store containing all the child blocks
        if (Villain.BlockStore.hasOwnProperty(this.store)) {
            Villain.BlockStore.delStore(this.store);
        }
        // delete the block from mainstore
        Villain.BlockStore.del('main', this.dataId);
        // destroy block
        this.destroy();
    },

    renderBlock: function(block) {
        // overrides the editors renderer, since we want the blocks to
        // render inside the column view.
        // But only if we're the parent!
        if (!block.$parent) {
            return false;
        }
        if (block.$parent.attr('id') === this.$el.attr('id')) {
            this.$el.append(block.el);
        }
    },

    // override render
    render: function() {
        // create a blockstore for these columns
        Villain.BlockStore.create(this.id);
        this.store = this.id;
        this.$el.attr('data-blockstore', this.store);

        blockTemplate = this.template({content: this.data});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        this.el.innerHTML = wrapperTemplate;

        this.$inner = this.$('.villain-block-inner');
        if (this.data) {
            // we got passed data. render editorhtml
            this.renderEditorHtml();
        } else {
            // no data, probably want a blank block
            this.renderEmpty();
        }

        if (this.setup) {
            // the block has a setup method - add the setupTemplate
            // and call setup()
            this.$inner.prepend(this.setupTemplate());
            this.$setup = this.$('.villain-setup-block');
            this.setup();
        }

        return this;
    },

    renderEditorHtml: function() {
        this.parseRow();
        blockTemplate = this.template({content: this.data});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        //TODO: add plus
        return this;
    },

    renderEmpty: function() {
        blockTemplate = this.template({content: this.data});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        //TODO: add plus
        return this;
    },

    getRow: function() {
        if (this.$row) {
            return this.$row;
        }
        this.$row = this.$('.row');
        return this.$row;
    },

    getColumns: function(filter) {
      return this.getRow().children(filter);
    },

    getColumn: function(index) {
      return this.getRow().children(':eq(' + index + ')');
    },

    parseRow: function() {
        // create the columns
        $row = this.getRow();
        for (var i = 0; i <= this.data.length - 1; i++) {
            columnClass = this.data[i].class;
            columnData = this.data[i].data;
            $column = $('<div class="' + columnClass + '"></div>');
            $row.append($column);
            $column = this.getColumn(i);
            addblock = new Villain.Plus(this.store);
            $column.append(addblock.$el);
            for (var j = 0; j < columnData.length; j++) {
                if ((BlockClass = Villain.BlockRegistry.getBlockClassByType(columnData[j].type)) !== false) {
                    block = new BlockClass(columnData[j].data, this.store);
                    $column.append(block.$el);
                    addblock = new Villain.Plus(this.store);
                    $column.append(addblock.$el);
                }
            }
        }
    },

    getJSON: function() {
        var json = {
            type: this.type,
            data: [],
        };
        this.getColumns().each(function(i) {
            var blocksData = [];
            $(this).children('.villain-block-wrapper').each(function() {
                var block = Villain.BlockStore.getBlockById(
                    $(this).attr('data-blockstore'), $(this).attr('data-block-id'));
                blocksData.push(block.getJSON());
            });
            json.data.push({'class': $(this).attr('class'), data: blocksData});
        });

        return json;
    },

    setup: function() {
        // check if this block has data
        // if not, show the setup div
        if (!this.hasData()) {
            this.getRow().hide();
            this.$setup.append([
                '<label for="villain-columns-number">Antall kolonner</label>',
                '<input type="text" class="villain-columns-number" name="villain-columns-number" />'
            ].join('\n'));
            this.$setup.show();
            this.$('.villain-columns-number').attr('autofocus', 'autofocus');
        }
    },

    _updateColumnCount: function(e) {
        var columnCount = $(e.target).val();
        this.$('.villain-column-widths').remove();
        columnCountWrapper = $('<div class="villain-column-widths" />');
        for (var i = 1; i < (parseInt(columnCount) + 1); i++) {
            columnCountWrapper.append([
                '<label for="villain-column-width-' + i + '">' +
                'Kolonne ' + i + ' klassenavn (one, two, three ...)</label>',
                '<input type="text" name="villain-column-width-' + i + '" class="villain-column-width" />'
            ].join('\n'));
        }
        columnCountWrapper.append('<button class="villain-columns-apply">Sett opp kolonner</button>');
        this.$setup.append(columnCountWrapper);
    },

    _applyColumnCount: function(e) {
        columnCount = this.$('input[name="villain-columns-number"]').val();
        for (var i = 1; i < (parseInt(columnCount) + 1); i++) {
            columnClass = this.$('input[name="villain-column-width-' + i + '"]').val();
            this.getRow().append(this.columnTemplate({columnClass: columnClass}));
            addblock = new Villain.Plus(this.store);
            this.getColumn(i - 1).append(addblock.$el);
        }
        // hide the setup
        this.$setup.hide();
        // show the row
        this.getRow().show();
    },
    renderPlus: function() {
        addblock = new Villain.Plus('main');
        return addblock;
    }
},
{
    /* Static methods */
    getButton: function(afterId) {
        blockType = 'columns';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-columns"></i>',
            '</button>'
        ].join('\n'));

        return t({id: afterId, type: blockType});
    }
});
