import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(products) {
    return products.map(product => {
        return `
            <a href="/product/${product.slug}" class="search__result">
                <strong>${product.name}</strong>
            </a>`;
    }).join('');
}


function typeAhead(search) {
    if (!search) return;
    
    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');
    
    searchInput.addEventListener('input', function(e) {
        //there is no input, hide div for search results
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        //show the div for search results
        searchResults.style.display = 'block';
        console.log(`${this.value}`);
        axios.get(`/api/v1/search?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    const html = searchResultsHTML(res.data.products);
                    searchResults.innerHTML = dompurify.sanitize(html);
                } else {
                    searchResults.innerHTML = `
                        <div class="search__result">
                            <strong>No results found</strong>
                        </div>`;
                }
            })
            .catch(err => {
                console.log(err);
            });
    });
}

export default typeAhead;