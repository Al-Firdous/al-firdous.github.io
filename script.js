// Replace <username> and <repo-name> with your GitHub info
const chunkFiles = [
  'https://al-firdous.github.io/books/books-1.json',
  'https://al-firdous.github.io/books/books-2.json',
  'https://al-firdous.github.io/books/books-3.json',
  // Add more chunks as needed
];

let books = [];
let fuse = null;

// Load all chunks
async function loadBooks() {
  for (const file of chunkFiles) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error('Failed to load ' + file);
      const data = await res.json();
      books = books.concat(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Initialize Fuse.js
  fuse = new Fuse(books, {
    keys: ['title', 'author', 'tags', 'year'],
    includeScore: true,
    threshold: 0.4 // adjust fuzziness
  });

  displayBooks(books.slice(0, 50)); // show first 50 by default
}

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

// Search with Fuse.js
document.getElementById('search').addEventListener('input', function() {
  const query = this.value.trim();
  if (!query) {
    displayBooks(books.slice(0, 50));
    return;
  }

  const results = fuse.search(query);
  const matchedBooks = results.map(r => r.item);
  displayBooks(matchedBooks.slice(0, 50)); // paginate first 50
});

// Start
loadBooks();