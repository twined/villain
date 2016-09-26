/* Columns */
import _ from 'underscore';
import $ from 'jquery';

import Block from '../block';
import Plus from '../plus';

const Columns = Block.extend({
  type: 'columns',
  blockName: 'cols',
  blockIcon: 'fa-columns',
  template: _.template('<div id="villain-column-row-<%= columnId %>" class="row"></div>'),
  columnTemplate: _.template('<div class="<%= columnClass %>"></div>'),

  deleteBlock() {
    // delete the store containing all the child blocks
    if ({}.hasOwnProperty.call(this.editor.blockStore, this.store)) {
      this.editor.blockStore.delStore(this.store);
    }
    // delete the block from mainstore
    this.editor.blockStore.del('main', this.dataId);
    // destroy block
    this.destroy();
  },

  renderBlock(block) {
    // overrides the editors renderer, since we want the blocks to
    // render inside the column view.
    // But only if we're the parent!
    if (!block.$parent) {
      return false;
    }
    if (block.$parent.attr('id') === this.$el.attr('id')) {
      this.$el.append(block.el);
    }
    return true;
  },

  render() {
    // create a blockstore for these columns
    this.editor.blockStore.create(this.id);
    this.store = this.id;
    this.$el.attr('data-blockstore', this.store);

    const blockTemplate = this.template({
      columnId: this.dataId,
    });
    const actionsTemplate = this.actionsTemplate();
    const wrapperTemplate = this.wrapperTemplate({
      content: blockTemplate,
      actions: actionsTemplate,
    });

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

  renderEditorHtml() {
    this.parseRow(this.getRow());
    return this;
  },

  renderEmpty() {
    return this;
  },

  getRow() {
    if (this.$row) {
      return this.$row;
    }
    this.setRow();
    return this.$row;
  },

  setRow() {
    this.$row = this.$(`#villain-column-row-${this.dataId}`);
    return this.$row;
  },

  getColumns(filter) {
    return this.getRow()
      .children(filter);
  },

  getColumn(index) {
    return this.getRow()
      .children(`:eq(${index})`);
  },

  parseRow($row) {
    return this.createColumns($row, this.data, this.store);
  },

  createColumns($row, data, store) {
    for (let i = 0; i <= data.length - 1; i += 1) {
      let addblock = new Plus({
        store,
        editor: this.editor,
      });
      const columnClass = data[i].class;
      const columnData = data[i].data;
      let $column = $(`<div class="${columnClass}"></div>`);

      $row.append($column);
      $column = $row.children(`:eq(${i})`);
      $column.append(addblock.$el);

      for (let j = 0; j < columnData.length; j += 1) {
        const BlockClass = this.editor.blockRegistry.getBlockClassByType(columnData[j].type);
        if ((BlockClass) !== false) {
          const block = new BlockClass({
            store,
            data: columnData[j].data,
            editor: this.editor,
          });
          $column.append(block.$el);

          addblock = new Plus({
            store,
            editor: this.editor,
          });
          $column.append(addblock.$el);
        }
      }
    }

    return $row;
  },

  getJSON() {
    return this.parseColumns(this.getColumns());
  },

  parseColumns(columns) {
    const self = this;
    const json = {
      type: this.type,
      data: [],
    };

    columns.each(function reduceColumns() {
      const blocksData = self.parseBlocks(this);

      json.data.push({
        class: $(this).attr('class'),
        data: blocksData,
      });
    });

    return json;
  },

  parseBlocks(blocks) {
    const blocksData = [];
    const self = this;

    $(blocks)
      .children('.villain-block-wrapper')
      .each(function parseAndPushBlocks() {
        // loop through all blocks inside this column
        const json = self.parseBlock(this);
        blocksData.push(json);
      });

    return blocksData;
  },

  parseBlock(block) {
    if ($(block).attr('data-block-type') === 'columns') {
      const id = $(block).attr('data-block-id');
      const subCols = $(`#villain-column-row-${id}`, $(block)).children();
      return this.parseColumns(subCols);
    }

    const blockStore = $(block).attr('data-blockstore');
    const blockId = $(block).attr('data-block-id');
    const blockObj = this.editor.blockStore.getBlockById(blockStore, blockId);
    const blockJson = blockObj.getJSON();

    return blockJson;
  },

  setup() {
    // check if this block has data. if not, show the setup div
    const self = this;
    if (!this.hasData()) {
      this.getRow().hide();
      this.$setup.append(`
        <label for="villain-columns-number">Antall kolonner</label>
        <input type="text" id="villain-columns-number-${this.dataId}"
         class="villain-columns-number" name="villain-columns-number" />`
      );

      this.$setup.on('keyup', `input#villain-columns-number-${this.dataId}`, (e) => {
        self.updateColumnCount(e);
      });

      this.$setup.show();
      this.$('.villain-columns-number').attr('autofocus', 'autofocus');
    } else {
      this.$setup.hide();
    }
  },

  updateColumnCount(e) {
    const self = this;
    const columnCount = $(e.target).val();
    this.$('.villain-column-widths').remove();
    const columnCountWrapper = $('<div class="villain-column-widths" />');

    for (let i = 1; i < (parseInt(columnCount, 10) + 1); i += 1) {
      columnCountWrapper.append(
        `<label for="villain-column-width-${i}">
           Kolonne ${i} klassenavn (col-md-6...)
         </label>
         <input type="text" name="villain-column-width-${i}" class="villain-column-width" />`
      );
    }
    columnCountWrapper.append(
      `<button id="villain-columns-apply-${this.dataId}" class="villain-columns-apply">
         Sett opp kolonner
      </button>`
    );
    this.$setup.append(columnCountWrapper);
    this.$setup.on('click', `button#villain-columns-apply-${this.dataId}`, (ev) => {
      self.applyColumnCount(ev);
    });
  },

  applyColumnCount(e) {
    e.preventDefault();
    const columnCount = this.$(`input#villain-columns-number-${this.dataId}`).val();

    for (let i = 1; i < (parseInt(columnCount, 10) + 1); i += 1) {
      const columnClass = this.$(`input[name="villain-column-width-${i}"]`).val();
      this.getRow().append(this.columnTemplate({
        columnClass,
      }));
      const addblock = new Plus({
        editor: this.editor,
        store: this.store,
      });
      this.getColumn(i - 1).append(addblock.$el);
    }

    this.$setup.hide();
    this.getRow().show();
  },

  onSetupClick(e) {
    e.stopPropagation();
    const $button = this.$('.villain-action-button-setup');

    if ($button.hasClass('active')) {
      $button.removeClass('active');
      this.hideSetup();
    } else {
      $button.addClass('active');
      this.showSetup();
    }
  },

  renderPlus() {
    const addblock = new Plus({
      editor: this.editor,
      store: 'main',
    });

    return addblock;
  },
});

export default Columns;
