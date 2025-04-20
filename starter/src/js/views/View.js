import icons from 'url:../../img/icons.svg';

export default class View {
    _data;

    // JSDocs documentation example
    // More info with jsdoc.app
    // When you now hover render() in calling it, it will save this info.
    /**
     * Render the received object to the DOM
     * @param {Object || Object[]} data The data to be rendered (e.g. recipe)
     * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
     * @returns {undefined | string} A markup string is returned if render=false
     * @this {Object} View instance
     * @author Richard Sahagun
     * @todo Finish implementation
     */
    render(data, render = true) {
        // If resultsView called this class, then there's no need to pass a message param
        // cuz renderError will get the resultsView's errorMessage.
        if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data;                
        const markup = this._generateMarkup();

        if (!render) return markup;

        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    update(data) {
      this._data = data;
      const newMarkup = this._generateMarkup();

      // Convert the newMarkup string into a DOM node objects which only lives in the memory (not in the web).
      const newDOM = document.createRange().createContextualFragment(newMarkup);

      const newElements = Array.from(newDOM.querySelectorAll('*'));
      // console.log(newElements);
      
      const curElements = Array.from(this._parentElement.querySelectorAll('*'));

      // console.log(curElements);
      
      newElements.forEach((newEl, i) => {
        const curEl = curElements[i];
        // console.log(curEl, newEl.isEqualNode(curEl));
 
        // Updates changed TEXT
        // If newEl != curEl && if it only contains text
        if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
          // console.log('💥', newEl.firstChild.nodeValue.trim());
          
          curEl.textContent = newEl.textContent;
        }

        // Updates changed ATTRIBUTES
        if (!newEl.isEqualNode(curEl)) {
          // console.log(Array.from(newEl.attributes) );
          
          // Replace the curEl's attributes by newE's attributes.
          Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value))
        }
      });
    }

    _clear() { 
        this._parentElement.innerHTML = '';
    }

    renderSpinner() {
        const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
      `;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    };

    renderError(message = this._errorMessage) {
        const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div>
      `;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    renderMessage(message = this._message) {
        const markup = `
        <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div>
      `;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }
}