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
        <label>${labelName}</label>
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

  static createInput(labelName, inputName, initialValue) {
    return `
      <div class="villain-form-input-wrapper">
        <label>${labelName}</label>
        <input type="text" value="${initialValue}" name="${inputName}" />
      </div>
    `;
  }
}

export default HTMLUtils;
