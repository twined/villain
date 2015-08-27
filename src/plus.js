Villain.Plus = Backbone.View.extend({
    tagName: 'div',
    className: 'villain-add-block villain-droppable',
    blockSelectionTemplate: _.template(
        '<div class="villain-block-selection"><%= content %></div>'
    ),
    events: {
        'click .villain-add-block-button': 'onClickAddBlock',
        'click .villain-block-button': 'onClickBlockButton'
    },

    initialize: function(store) {
        this.store = store;
        this.$el.attr('data-blockstore', store);
        this.$el.attr('id', _.uniqueId('villain-plus-'));
        this.render();
    },

    render: function() {
        this.$el.append('<button class="villain-add-block-button">+</button>');
        return this;
    },

    onClickBlockButton: function(e) {
        /* clicked a button in the add new block container */
        e.preventDefault();

        $button = $(e.currentTarget);

        blockType = $button.data('type');
        blockStore = this.store;
        BlockClass = Villain.BlockRegistry.getBlockClassByType(blockType);

        // get a new block with no data, and the specified blockStore
        block = new BlockClass(false, blockStore);
        block.$el.insertAfter($button.parent().parent());
        block.$el.after(block.renderPlus().$el);
        // if the block has a textblock, set the caret to the end
        if (block.hasTextBlock()) {
            block.setCaret();
        }
        // scroll to element position
        block.scrollTo();
        // show the plus
        $button.parent().prev().show();
        // hide the buttons
        $button.parent().remove();
    },

    onClickAddBlock: function(e) {
        // in case it tries to submit.
        e.preventDefault();
        $addBlockButton = $(e.currentTarget);
        $addBlockButton.hide();
        blockId = $addBlockButton.parent().data('after-block-id');
        blockSelection = this.blockSelectionTemplate({content: this.getButtons(blockId)});
        $addBlockButton.parent().append(blockSelection);
    },

    getButtons: function(id) {
        // iterate through block types in the block registry
        // and get buttons for each type.
        html = '';
        for (i = 0; i < Villain.BlockRegistry.Map.length; ++i) {
            blockName = Villain.BlockRegistry.Map[i];
            b = Villain.BlockRegistry.getBlockClassByType(blockName);
            if (_.isUndefined(b)) {
                console.error("Villain: Undefined block ", blockName);
                continue;
            }
            if (b.hasOwnProperty('getButton')) {
                html += b.getButton(id);
            } else {
                console.log("// No button found for " + blockName);
            }
        }
        return html;
    }
});
