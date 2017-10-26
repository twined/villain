'use strict';

import $ from 'jquery';

class HTMLUtils {
  static createRadios(labelName, inputName, choices, initialValue, events) {
    const radios = choices.map(({
      name: choiceName,
      val: choiceValue,
    }) => {
      let selected = '';
      if (choiceValue === initialValue) {
        selected = ' checked="checked"';
      }
      return `
          <label>
            <input type="radio"
                   name="${inputName}"
                   value="${choiceValue}"${selected}>${choiceName}
          </label>`;
    });

    const $radios = $(`
      <div class="villain-form-input-wrapper">
        <div class="villain-form-label-wrapper">
          <label>
            ${labelName}
          </label>
        </div>
        ${radios.join('\n')}
      </div>
    `);

    if (events) {
      events.forEach(({ ev, fn }) => {
        $radios.on(ev, fn);
      });
    }

    return $radios;
  }

  static createInput(labelName, inputName, initialValue, event) {
    const $input = $(`
      <div class="villain-form-input-wrapper">
        <div class="villain-form-label-wrapper">
          <label>${labelName}</label>
        </div>
        <input type="text" value="${initialValue}" name="${inputName}" />
      </div>
    `);

    if (event) {
      const { ev, fn } = event;
      $input.on(ev, fn);
    }

    return $input;
  }
}

export default HTMLUtils;
