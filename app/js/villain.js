'use strict';

import Editor from './editor';

import Text from './blocks/text';
import Header from './blocks/header';
import Blockquote from './blocks/blockquote';
import List from './blocks/list';
import Image from './blocks/image';
import Slideshow from './blocks/slideshow';
import Video from './blocks/video';
import Gmap from './blocks/gmap';
import Divider from './blocks/divider';
import Html from './blocks/html';
import Markdown from './blocks/markdown';
import Columns from './blocks/columns';

const Blocks = {
  Text,
  Header,
  Blockquote,
  List,
  Image,
  Slideshow,
  Video,
  Gmap,
  Divider,
  Html,
  Markdown,
  Columns,
};

window.Villain = { Editor, Blocks };

export {
  Blocks,
  Editor,
};
