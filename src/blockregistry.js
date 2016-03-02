/* Block Registry */

Villain.BlockRegistry = {};

Villain.BlockRegistry.initialize = function (extraBlocks) {
    // add defaults
    Villain.BlockRegistry.Map = [
        "Text",
        "Header",
        "Blockquote",
        "List",
        "Image",
        "Slideshow",
        "Video",
        "Divider",
        "Html",
        "Markdown",
        "Columns",
    ];
    if (!_.isUndefined(extraBlocks)) {
        Villain.BlockRegistry.addExtraBlocks(extraBlocks);
    }
    Villain.BlockRegistry.checkBlocks();
};

Villain.BlockRegistry.addExtraBlocks = function(extraBlocks) {
    Villain.BlockRegistry.Map = Villain.BlockRegistry.Map.concat(extraBlocks);
};

Villain.BlockRegistry.add = function(block) {
    Villain.BlockRegistry.Map.push(block);
};

Villain.BlockRegistry.checkBlocks = function() {
    for (i = 0; i < Villain.BlockRegistry.Map.length; ++i) {
        type = Villain.BlockRegistry.Map[i];
        if (_.isUndefined(Villain.Blocks[_(type).capitalize()])) {
            console.error("Villain: Missing block source for " + type + "! Please ensure it is included.");
        }
    }
};

Villain.BlockRegistry.getBlockClassByType = function(type) {
    if (Villain.BlockRegistry.Map.indexOf(_(type).capitalize()) !== -1) {
        return Villain.Blocks[_(type).capitalize()];
    }
    return false;
};
