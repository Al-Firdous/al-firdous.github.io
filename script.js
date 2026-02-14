// Replace <username> and <repo-name> with your GitHub username and repo name
const jsonUrl = 'https://al-firdous.github.io/books.json';

let books = [];

// Load books JSON
fetch(jsonUrl)
  .then(response => {
    if (!response.ok) throw new Error('Failed to load JSON');
    return response.json();
  })
  .then(data => {
    books = data;
    displayBooks(books);
  })
  .catch(err => console.error(err));

// Display books in list
function displayBooks(list) {
  const ul = document.getElementById('book-list');
  ul.innerHTML = '';
  list.forEach(book => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${book.title}</strong> by ${book.author} (${book.year})<br>
                    Tags: ${book.tags.join(', ')}<br>
                    <a href="${book.url}" target="_blank">Read / Download</a>`;
    ul.appendChild(li);
  });
}

// Search functionality
document.getElementById('search').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const filtered = books.filter(book => 
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.year.toString().includes(query) ||
    book.tags.some(tag => tag.toLowerCase().includes(query))
  );
  displayBooks(filtered);
});