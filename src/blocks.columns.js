/* Columns */

Villain.Blocks.Columns = Villain.Block.extend({
    type: 'columns',
    template: _.template('<div id="villain-column-row-<%= columnId %>" class="row"></div>'),
    columnTemplate: _.template('<div class="<%= columnClass %>"></div>'),

    events: {},

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

        blockTemplate = this.template({columnId: this.dataId});
        actionsTemplate = this.actionsTemplate();
        wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});
        this.el.innerHTML = wrapperTemplate;

        this.$inner = this.$('.villain-block-inner');
        this.$content = this.$('.row');

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
        this.parseRow(this.getRow());
        var blockTemplate = this.template({columnId: this.dataId}),
            actionsTemplate = this.actionsTemplate(),
            wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});

        return this;
    },

    renderEmpty: function() {
        var blockTemplate = this.template({columnId: this.dataId}),
            actionsTemplate = this.actionsTemplate(),
            wrapperTemplate = this.wrapperTemplate({content: blockTemplate, actions: actionsTemplate});

        return this;
    },

    getRow: function() {
        if (this.$row) {
            return this.$row;
        }
        this.$row = this.$('#villain-column-row-' + this.dataId);
        return this.$row;
    },

    getColumns: function(filter) {
        return this.getRow().children(filter);
    },

    getColumn: function(index) {
        return this.getRow().children(':eq(' + index + ')');
    },

    parseRow: function($row) {
        // create the columns
        return this.createColumns($row, this.data, this.store);
    },

    createColumns: function($row, data, store) {
        for (var i = 0; i <= data.length - 1; i++) {
            var addblock = new Villain.Plus(store),
                columnClass = data[i].class,
                columnData = data[i].data,
                $column = $('<div class="' + columnClass + '"></div>');

            $row.append($column);
            $column = $row.children(':eq(' + i + ')');
            $column.append(addblock.$el);

            for (var j = 0; j < columnData.length; j++) {
                if ((BlockClass = Villain.BlockRegistry.getBlockClassByType(columnData[j].type)) !== false) {
                    var block = new BlockClass(columnData[j].data, store);
                    $column.append(block.$el);

                    addblock = new Villain.Plus(store);
                    $column.append(addblock.$el);
                }
            }
        }

        return $row;
    },

    getJSON: function() {
        return this.parseColumns(this.getColumns());
    },

    parseColumns: function(columns) {
        var _this = this;
        var json = {
            type: this.type,
            data: []
        };

        columns.each(function() {
            var blocksData = _this.parseBlocks(this);

            json.data.push({'class': $(this).attr('class'), data: blocksData});
        });

        return json;
    },

    parseBlocks: function(blocks) {
        var blocksData = [];
        var _this = this;

        $(blocks).children('.villain-block-wrapper').each(function() {
            // loop through all blocks inside this column
            var json = _this.parseBlock(this);
            blocksData.push(json);
        });

        return blocksData;
    },

    parseBlock: function(block) {
        if ($(block).attr('data-block-type') == 'columns') {
            var id = $(block).attr('data-block-id');
            var subCols = $('#villain-column-row-' + id, $(block)).children();
            return this.parseColumns(subCols);
        }

        var blockStore = $(block).attr('data-blockstore'),
            blockId = $(block).attr('data-block-id'),
            blockObj = Villain.BlockStore.getBlockById(blockStore, blockId),
            blockJson = blockObj.getJSON();

        return blockJson;
    },

    parseCol: function(i) {},

    setup: function() {
        // check if this block has data
        // if not, show the setup div
        var _this = this;
        if (!this.hasData()) {
            this.getRow().hide();
            this.$setup.append([
                '<label for="villain-columns-number">Antall kolonner</label>',
                '<input type="text" id="villain-columns-number-' + this.dataId +  '" class="villain-columns-number" name="villain-columns-number" />'
            ].join('\n'));

            this.$setup.on('keyup', 'input#villain-columns-number-' + this.dataId, function(e) {_this.updateColumnCount(e)});

            this.$setup.show();
            this.$('.villain-columns-number').attr('autofocus', 'autofocus');
        } else {
            this.$setup.hide();
        }
    },

    updateColumnCount: function(e) {
        var _this = this;
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
        columnCountWrapper.append('<button id="villain-columns-apply-' + this.dataId + '" class="villain-columns-apply">Sett opp kolonner</button>');
        this.$setup.append(columnCountWrapper);
        this.$setup.on('click', 'button#villain-columns-apply-' + this.dataId, function(e) {_this.applyColumnCount(e)});

    },

    applyColumnCount: function(e) {
        e.preventDefault();
        columnCount = this.$('input#villain-columns-number-' + this.dataId).val();
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

    onSetupClick: function(e) {
        e.stopPropagation();
        // is it active now?
        $button = this.$('.villain-action-button-setup');
        if ($button.hasClass('active')) {
            // hide the setup
            $button.removeClass('active');
            this.hideSetup();
        } else {
            $button.addClass('active');
            this.showSetup();
        }
    },

    renderPlus: function() {
        addblock = new Villain.Plus('main');
        return addblock;
    }
},
{
    /* Static methods */
    getButton: function(afterId) {
        var blockType = 'columns';
        t = _.template([
            '<button class="villain-block-button" data-type="<%= type %>" data-after-block-id="<%= id %>">',
            '<i class="fa fa-columns"></i>',
            '<p>cols</p>',
            '</button>'
        ].join('\n'));

        return t({id: afterId, type: blockType});
    }
});
