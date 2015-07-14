/* Block Registry */

Villain.BlockRegistry = {};

Villain.BlockRegistry.Map = {
    text: Villain.Blocks.Text,
    header: Villain.Blocks.Header,
    list: Villain.Blocks.List,
    image: Villain.Blocks.Image,
    video: Villain.Blocks.Video,
    divider: Villain.Blocks.Divider,
    columns: Villain.Blocks.Columns
};

Villain.BlockRegistry.getBlockClassByType = function(type) {
    if (Villain.BlockRegistry.Map.hasOwnProperty(type)) {
        return Villain.BlockRegistry.Map[type];
    }
    return false;
};
