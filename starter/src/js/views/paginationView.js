import icons from 'url:../../img/icons.svg';
import View from "./View";

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler){
        // Event delegation - We will add the event listener to the common parent of the prev and next button.
        this._parentElement.addEventListener('click', function (e) {
            // e.preventDefault();

            // Clicked element
            // .closest will search down to the DOM tree.
            const btn = e.target.closest('.btn--inline');

            // If there's no button clicked then do nothong / return.
            if (!btn) return;

            const gotoPage = +btn.dataset.goto;

            
            handler(gotoPage);
        });
    }

    _generateMarkup() {
        const curPage = this._data.page;

        // Page 1, and there are other pages
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        // console.log(numPages, curPage);

        if (curPage === 1 && numPages > 1) 
            return this._generateMarkupBtn('next');

        // Last page
        if (curPage === numPages && numPages > 1) 
            return this._generateMarkupBtn('prev');
        

        // Other page
        if (curPage < numPages) 
            return `${this._generateMarkupBtn('prev')} ${this._generateMarkupBtn('next')}`;

        // Page 1, and there are no other pages
        return '';
    }

    _generateMarkupBtn(direction) { // direction can be prev or next
        const curPage = this._data.page;
        const gotoPage = direction === 'prev' ? curPage - 1 : curPage + 1;

        return `
            <button data-goto="${gotoPage}" class="btn--inline pagination__btn--${direction === 'prev' ? direction : 'next'}">
                <span>Page ${gotoPage}</span>
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-${direction === 'prev' ? 'left' : 'right'}"></use>
                </svg>
            </button>     
        `;
    }
}

export default new PaginationView();