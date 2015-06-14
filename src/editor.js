Villain.Editor = Backbone.View.extend({
    el: '#villain',
    textArea: '#id_body',
    data: {},
    blocks: {},

    events: {
        'submit form': 'clickSubmit',
        'dragover .villain-droppable': 'onDragOverDroppable',
        'dragenter .villain-droppable': 'onDragEnterDroppable',
        'dragleave .villain-droppable': 'onDragLeaveDroppable',
        'drop .villain-droppable': 'onDropDroppable',
        'drop .villain-text-block': 'onDropTextblock'
    },

    getJSON: function() {
        var json = [];
        this.$('.villain-block-wrapper').each(function() {
            // check the main block store for the id. if it's not there
            // it probably belongs to a superblock
            if ((block = Villain.BlockStore.getBlockById('main', $(this).data('block-id'))) !== false) {
                blockJson = block.getJSON();
                json.push(blockJson);
            }
        });
        ret = JSON.stringify(json);
        return ret != "[]" ? ret : "";
    },

   onDragEnterDroppable: function(e) {
        $('.villain-add-block-button', e.currentTarget).addClass('drop-hover');
        e.preventDefault();
        e.stopPropagation();
    },

    onDragLeaveDroppable: function(e) {
        $('.villain-add-block-button', e.currentTarget).removeClass('drop-hover');
        e.preventDefault();
        e.stopPropagation();
    },

    onDragOverDroppable: function(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    onDropDroppable: function(e) {
        //do something
        target = e.currentTarget;
        if ($(target).hasClass('villain-droppable') !== true) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        $('.villain-add-block-button', target).removeClass('drop-hover');
        sourceId = e.originalEvent.dataTransfer.getData('text/plain');
        $source = $('[data-block-id=' + sourceId + ']');
        $sourceAdd = $source.next();
        $source.detach();
        $sourceAdd.detach();

        // move the block
        // we have to remove it from its current blockstore,
        // and add it to the new blockstore!
        $source.insertAfter($(target));
        oldBlockStore = $source.attr('data-blockstore');
        newBlockStore = $(target).attr('data-blockstore');
        // get the block from old blockstore
        block = Villain.BlockStore.getBlockById(oldBlockStore, sourceId);
        block.store = newBlockStore;
        Villain.BlockStore.del(oldBlockStore, sourceId);
        Villain.BlockStore.add(newBlockStore, sourceId, block);
        $source.attr('data-blockstore', newBlockStore);
        $sourceAdd.insertAfter($source);
        $sourceAdd.attr('data-blockstore', newBlockStore);
        // get the block store
    },

    onDropTextblock: function(e) {
        $target = $(e.currentTarget).closest('.villain-block-wrapper').shake();
        e.preventDefault();
        e.stopPropagation();
        return false;
    },

    clickSubmit: function(e) {
        Villain.EventBus.trigger('posts:submit', e);
        form = this.checkForm();
        if (form.valid === false) {
            e.preventDefault();
        }
        window.onbeforeunload = $.noop();
    },

    checkForm: function() {
        var form = {
            valid: true,
            errors: []
        };
        if ($titleEl.val() === '') {
            form.errors.push('Overskrift kan ikke være blank.');
            form.valid = false;
            $titleEl.parent().parent().addClass('error');
            $titleEl.parent().parent().append(
                '<span class="help-inline"><strong><i class="icon-hand-up"></i> Feltet er påkrevet.</strong></span>'
            );
            $('html, body').animate({
                scrollTop: 0
            }, 5);
        }
        // clean body text here?
        return form;
    },

    markDirty: function() {
        this.isDirty = true;
    },

    initialize: function(options) {
        _this = this;
        this.$textArea = $(options.textArea) || this.textArea;
        $('<div id="villain"></div>').insertAfter(this.$textArea);
        this.el = "#villain";
        this.$el = $(this.el);

        this.$textArea.hide();
        this.isDirty = false;
        try {
            this.data = JSON.parse(this.$textArea.val());
        } catch (e) {
            console.log('editor/init: No usable JSON found in textarea.');
            this.data = null;
        }
        // inject json to textarea before submitting.
        $('form').submit(function( event ) {
            _this.$textArea.val(_this.getJSON());
        });
        // create a blockstore
        Villain.BlockStore.create('main');
        Villain.setOptions(options);
        this.render();
    },

    render: function() {
        // add + block
        addblock = new Villain.Plus('main');
        this.$el.append(addblock.$el);
        // add format popup
        formatPopUp = new Villain.FormatPopUp();
        this.$el.append(formatPopUp.$el);
        // parse json
        if (!this.data) {
            return false;
        }
        for (var i = 0; i <= this.data.length - 1; i++) {
            blockJson = this.data[i];
            if ((BlockClass = Villain.BlockRegistry.getBlockClassByType(blockJson.type)) !== false) {
                block = new BlockClass(blockJson.data);
                this.$el.append(block.$el);
                this.$el.append(block.renderPlus().$el);
            } else {
                console.error('Villain: No class found for type: ' + blockJson.type);
            }
        }
    }
});
