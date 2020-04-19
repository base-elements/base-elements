import { d as directive, A as AttributePart, c as css, L as LitElement, h as html } from './lit-element-6bb3323a.js';
import { s as sharedStyles } from './sharedstyles-fd1d7228.js';

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * For AttributeParts, sets the attribute if the value is defined and removes
 * the attribute if the value is undefined.
 *
 * For other part types, this directive is a no-op.
 */
const ifDefined = directive((value) => (part) => {
    if (value === undefined && part instanceof AttributePart) {
        if (value !== part.value) {
            const name = part.committer.name;
            part.committer.element.removeAttribute(name);
        }
    }
    else {
        part.setValue(value);
    }
});
//# sourceMappingURL=if-defined.js.map

var tokens = {
  "0": {
    pattern: /\d/,
    _default: "0"
  },
  "9": {
    pattern: /\d/,
    optional: true
  },
  "#": {
    pattern: /\d/,
    optional: true,
    recursive: true
  },
  A: {
    pattern: /[a-zA-Z0-9]/
  },
  S: {
    pattern: /[a-zA-Z]/
  },
  U: {
    pattern: /[a-zA-Z]/,
    transform: function (c) {
      return c.toLocaleUpperCase();
    }
  },
  L: {
    pattern: /[a-zA-Z]/,
    transform: function (c) {
      return c.toLocaleLowerCase();
    }
  },
  $: {
    escape: true
  }
};

function isEscaped(pattern, pos) {
  var count = 0;
  var i = pos - 1;
  var token = {
    escape: true
  };

  while (i >= 0 && token && token.escape) {
    token = tokens[pattern.charAt(i)];
    count += token && token.escape ? 1 : 0;
    i--;
  }

  return count > 0 && count % 2 === 1;
}

function calcOptionalNumbersToUse(pattern, value) {
  var numbersInP = pattern.replace(/[^0]/g, "").length;
  var numbersInV = value.replace(/[^\d]/g, "").length;
  return numbersInV - numbersInP;
}

function concatChar(text, character, options, token) {
  if (token && typeof token.transform === "function") {
    character = token.transform(character);
  }

  if (options.reverse) {
    return character + text;
  }

  return text + character;
}

function hasMoreTokens(pattern, pos, inc) {
  var pc = pattern.charAt(pos);
  var token = tokens[pc];

  if (pc === "") {
    return false;
  }

  return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
}

function hasMoreRecursiveTokens(pattern, pos, inc) {
  var pc = pattern.charAt(pos);
  var token = tokens[pc];

  if (pc === "") {
    return false;
  }

  return token && token.recursive ? true : hasMoreRecursiveTokens(pattern, pos + inc, inc);
}

function insertChar(text, char, position) {
  var t = text.split("");
  t.splice(position, 0, char);
  return t.join("");
}

function StringMask(pattern, opt) {
  this.options = opt || {};
  this.options = {
    reverse: this.options.reverse || false,
    usedefaults: this.options.usedefaults || this.options.reverse
  };
  this.pattern = pattern;
}

StringMask.prototype.process = function proccess(value) {
  if (!value) {
    return {
      result: "",
      valid: false
    };
  }

  value = value + "";
  var pattern2 = this.pattern;
  var valid = true;
  var formatted = "";
  var valuePos = this.options.reverse ? value.length - 1 : 0;
  var patternPos = 0;
  var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
  var escapeNext = false;
  var recursive = [];
  var inRecursiveMode = false;
  var steps = {
    start: this.options.reverse ? pattern2.length - 1 : 0,
    end: this.options.reverse ? -1 : pattern2.length,
    inc: this.options.reverse ? -1 : 1
  };

  function continueCondition(options) {
    if (!inRecursiveMode && !recursive.length && hasMoreTokens(pattern2, patternPos, steps.inc)) {
      // continue in the normal iteration
      return true;
    } else if (!inRecursiveMode && recursive.length && hasMoreRecursiveTokens(pattern2, patternPos, steps.inc)) {
      // continue looking for the recursive tokens
      // Note: all chars in the patterns after the recursive portion will be handled as static string
      return true;
    } else if (!inRecursiveMode) {
      // start to handle the recursive portion of the pattern
      inRecursiveMode = recursive.length > 0;
    }

    if (inRecursiveMode) {
      var pc = recursive.shift();
      recursive.push(pc);

      if (options.reverse && valuePos >= 0) {
        patternPos++;
        pattern2 = insertChar(pattern2, pc, patternPos);
        return true;
      } else if (!options.reverse && valuePos < value.length) {
        pattern2 = insertChar(pattern2, pc, patternPos);
        return true;
      }
    }

    return patternPos < pattern2.length && patternPos >= 0;
  }
  /**
   * Iterate over the pattern's chars parsing/matching the input value chars
   * until the end of the pattern. If the pattern ends with recursive chars
   * the iteration will continue until the end of the input value.
   *
   * Note: The iteration must stop if an invalid char is found.
   */


  for (patternPos = steps.start; continueCondition(this.options); patternPos = patternPos + steps.inc) {
    // Value char
    var vc = value.charAt(valuePos); // Pattern char to match with the value char

    var pc = pattern2.charAt(patternPos);
    var token = tokens[pc];

    if (recursive.length && token && !token.recursive) {
      // In the recursive portion of the pattern: tokens not recursive must be seen as static chars
      token = null;
    } // 1. Handle escape tokens in pattern
    // go to next iteration: if the pattern char is a escape char or was escaped


    if (!inRecursiveMode || vc) {
      if (this.options.reverse && isEscaped(pattern2, patternPos)) {
        // pattern char is escaped, just add it and move on
        formatted = concatChar(formatted, pc, this.options, token); // skip escape token

        patternPos = patternPos + steps.inc;
        continue;
      } else if (!this.options.reverse && escapeNext) {
        // pattern char is escaped, just add it and move on
        formatted = concatChar(formatted, pc, this.options, token);
        escapeNext = false;
        continue;
      } else if (!this.options.reverse && token && token.escape) {
        // mark to escape the next pattern char
        escapeNext = true;
        continue;
      }
    } // 2. Handle recursive tokens in pattern
    // go to next iteration: if the value str is finished or
    //                       if there is a normal token in the recursive portion of the pattern


    if (!inRecursiveMode && token && token.recursive) {
      // save it to repeat in the end of the pattern and handle the value char now
      recursive.push(pc);
    } else if (inRecursiveMode && !vc) {
      // in recursive mode but value is finished. Add the pattern char if it is not a recursive token
      formatted = concatChar(formatted, pc, this.options, token);
      continue;
    } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
      // recursiveMode not started but already in the recursive portion of the pattern
      continue;
    } // 3. Handle the value
    // break iterations: if value is invalid for the given pattern


    if (!token) {
      // add char of the pattern
      formatted = concatChar(formatted, pc, this.options, token);

      if (!inRecursiveMode && recursive.length) {
        // save it to repeat in the end of the pattern
        recursive.push(pc);
      }
    } else if (token.optional) {
      // if token is optional, only add the value char if it matchs the token pattern
      //                       if not, move on to the next pattern char
      if (token.pattern.test(vc) && optionalNumbersToUse) {
        formatted = concatChar(formatted, vc, this.options, token);
        valuePos = valuePos + steps.inc;
        optionalNumbersToUse--;
      } else if (recursive.length > 0 && vc) {
        valid = false;
        break;
      }
    } else if (token.pattern.test(vc)) {
      // if token isn't optional the value char must match the token pattern
      formatted = concatChar(formatted, vc, this.options, token);
      valuePos = valuePos + steps.inc;
    } else if (!vc && token._default && this.options.usedefaults) {
      // if the token isn't optional and has a default value, use it if the value is finished
      formatted = concatChar(formatted, token._default, this.options, token);
    } else {
      // the string value don't match the given pattern
      valid = false;
      break;
    }
  }

  return {
    result: formatted,
    valid: valid
  };
};

StringMask.prototype.apply = function (value) {
  return this.process(value).result;
};

StringMask.prototype.validate = function (value) {
  return this.process(value).valid;
};

StringMask.process = function (value, pattern, options) {
  return new StringMask(pattern, options).process(value);
};

StringMask.apply = function (value, pattern, options) {
  return new StringMask(pattern, options).apply(value);
};

StringMask.validate = function (value, pattern, options) {
  return new StringMask(pattern, options).validate(value);
};

var styles = css`:host{min-width:200px;display:inline-block;--base-input-height:40px;--base-input-border-radius:var(--base-border-radius-md)}:host([full]){width:100%;display:block}:host [part=input]{display:-webkit-box;display:flex;-webkit-box-pack:justify;justify-content:space-between;-webkit-box-align:center;align-items:center;border-radius:var(--base-input-border-radius);height:var(--base-input-height);border:1px solid var(--base-color-ui-light)}:host [part=input]:hover{border:1px solid var(--base-color-ui)}:host([focused]) [part=input]{border:1px solid var(--base-color-focus)}:host(:not([focused])[valid]) [part=input]{border:1px solid var(--base-color-success)}:host(:not([focused])[invalid]) [part=input]{border:1px solid var(--base-color-danger)}:host [part=input-field]{width:100%;font-size:var(--base-font-size-sm);border-radius:var(--base-input-border-radius);height:100%;outline:0;border:0;padding:0 var(--base-space-sm)}[part=label]{display:block;font-size:var(--base-font-size-sm);margin-bottom:var(--base-space-sm)}::slotted([slot=help]){color:var(--base-color-font-light)}::slotted([slot=error]),::slotted([slot=help]){display:block;font-size:var(--base-font-size-xs);margin-top:var(--base-space-sm)}::slotted([slot=error]){color:var(--base-color-danger)}::slotted([slot=prepend]){padding-left:var(--base-space-sm)}::slotted([slot=append]){padding-right:var(--base-space-sm)}`;

class BaseInput extends LitElement {
  constructor() {
    super();
    /**
     * Full input
     * @type {Boolean}
     * @attr
     */

    this.full = false;
    this._value = "";
    this.required = false;
    this.full = false;
    this.valid = false;
    this.invalid = false;
    /**
     * Button state
     * @type {"text"|"password"|"email"|"tel"|"number"}
     * @attr
     */

    this.type = "text";
    this.mask = "";
    this.errormessage = "";
    this.max = undefined;
    this.maxlength = undefined;
    this.min = undefined;
    this.minlength = undefined;
    this.pattern = undefined;
    this.readonly = false;
    this.autovalidate = false;
    this.focused = false;
    this.autofocus = false;
    this._handleInvalidEvent = this._handleInvalidEvent.bind(this);
    this.checkValidity = this.checkValidity.bind(this);
    this._handleInputEvent = this._handleInputEvent.bind(this);
    this._handleChangeEvent = this._handleChangeEvent.bind(this);
    this._handleKeypress = this._handleKeypress.bind(this);
    this._handleBlurEvent = this._handleBlurEvent.bind(this);
    this._handleFocusEvent = this._handleFocusEvent.bind(this);
  }

  static get properties() {
    return {
      errormessage: {
        type: String
      },
      max: {
        type: String
      },
      maxlength: {
        type: String
      },
      min: {
        type: String
      },
      minlength: {
        type: String
      },
      pattern: {
        type: String
      },
      readonly: {
        type: Boolean
      },
      full: {
        type: Boolean
      },
      full: {
        type: Boolean,
        reflect: true
      },
      autovalidate: {
        type: Boolean
      },
      valid: {
        type: Boolean,
        reflect: true
      },
      invalid: {
        type: Boolean,
        reflect: true
      },
      type: {
        type: String
      },
      value: {
        type: String
      },
      mask: {
        type: String
      },
      focused: {
        type: Boolean,
        reflect: true
      },
      required: {
        type: Boolean,
        reflect: true
      },
      autofocus: {
        type: Boolean,
        reclect: true
      }
    };
  }

  static get styles() {
    return [styles, sharedStyles];
  }

  connectedCallback() {
    super.connectedCallback();
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.requestUpdate();
  }

  get inputEl() {
    return this.shadowRoot.querySelector("input");
  }

  checkValidity() {
    const valid = this.inputEl.checkValidity();

    if (valid) {
      this.invalid = false;
      this.valid = true;
    } else {
      this.valid = false;
      this.invalid = true;
    }
  }

  reportValidity() {
    let valid;
    const slot = this.querySelector('[slot="error"]');

    if (slot && slot.innerHTML) {
      valid = this.inputEl.checkValidity();
    } else {
      valid = this.inputEl.reportValidity();
    }

    if (valid) {
      this.invalid = false;
      this.valid = true;
    } else {
      this.valid = false;
      this.invalid = true;
    }
  }

  _handleFocusEvent() {
    this.focused = true;
    this.showSuggestions = true;
  }

  _handleBlurEvent() {
    this.focused = false;

    if (this.autovalidate) {
      this.checkValidity();
    }
  }

  _handleInvalidEvent(e) {} // keypress is run before value is changed


  _handleKeypress(e) {
    // First stop default input event to bubble up
    e.stopPropagation(); // Set the value to the target value
    // this will then become the e.target.value of the custom event

    if (this.mask) {
      const formatter = new StringMask(this.mask);
      this.value = formatter.apply(e.target.value.replace(/[^\d\p{L}]/g, ""));
    } else {
      this.value = e.target.value;
    }

    this.dispatchEvent(new CustomEvent("keypress", e));
  }

  _handleInputEvent(e) {
    // First stop default input event to bubble up
    e.stopPropagation(); // Set the value to the target value
    // this will then become the e.target.value of the custom event

    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent("input", e));
  }

  _handleChangeEvent(e) {
    if (this.autovalidate) {
      this.reportValidity();
    } // First stop default input event to bubble up


    e.stopPropagation(); // Set the value to the target value
    // this will then become the e.target.value of the custom event

    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent("change", e));
  }

  render() {
    return html`
      <slot part="label"></slot>
      <div part="input">
        <slot part="prepend" name="prepend"></slot>
        <input
          @invalid=${this._handleInvalidEvent}
          ?readonly=${this.readonly}
          min=${ifDefined(this.min)}
          minlength=${ifDefined(this.minlength)}
          max=${ifDefined(this.max)}
          maxlength=${ifDefined(this.maxlength)}
          pattern=${ifDefined(this.pattern)}
          @keypress=${this._handleKeypress}
          @input=${this._handleInputEvent}
          @change=${this._handleChangeEvent}
          @focus=${this._handleFocusEvent}
          @blur=${this._handleBlurEvent}
          ?required=${this.required}
          part="input-field"
          type=${this.type}
          .value=${this.value}
        />
        <slot part="append" name="append"></slot>
      </div>
      <slot part="help" name="help"></slot>
      ${this.invalid ? html`<slot part="error" name="error"></slot>` : null}
    `;
  }

}

if (!customElements.get("base-input")) {
  customElements.define("base-input", BaseInput);
}

export default BaseInput;