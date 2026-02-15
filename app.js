// ---------------- CONFIG ----------------
const supabaseUrl = "https://your-project.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "your-anon-key"; // Replace with your anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
// ----------------------------------------

let currentPage = 1;
const pageSize = 50;

// Populate language dropdown
async function loadLanguages() {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('name');

  if (error) {
    console.error("Error loading languages:", error);
    return;
  }

  const select = document.getElementById("languageFilter");
  data.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang.id;
    option.textContent = lang.name;
    select.appendChild(option);
  });
}

// Main search function
async function searchBooks() {
  const query = document.getElementById("searchInput").value;
  const languageId = document.getElementById("languageFilter").value;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let booksQuery = supabase
    .from("books")
    .select(`
      id,
      title,
      external_links,
      publication_year,
      hijri_year,
      isbn,
      authors(name),
      publishers(name),
      languages(name)
    `)
    .ilike("title", `%${query}%`)
    .range(from, to)
    .order("title", { ascending: true });

  if (languageId) {
    booksQuery = booksQuery.eq("language_id", languageId);
  }

  const { data, error } = await booksQuery;

  if (error) {
    console.error("Error fetching books:", error);
    return;
  }

  displayResults(data);
  document.getElementById("pageInfo").textContent = `Page ${currentPage}`;
}

// Display results
function displayResults(books) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!books || books.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  books.forEach(book => {
    const linksHtml = (book.external_links || []).map(
      l => `<a href="${l.url}" target="_blank">${l.format || "link"}</a>`
    ).join(" | ");

    resultsDiv.innerHTML += `
      <div class="book">
        <h3>${book.title}</h3>
        <p>Author: ${book.authors?.name || "Unknown"}</p>
        <p>Publisher: ${book.publishers?.name || "Unknown"}</p>
        <p>Language: ${book.languages?.name || "Unknown"}</p>
        <p>Year: ${book.publication_year || "-"} / ${book.hijri_year || "-"}</p>
        <p>ISBN: ${book.isbn || "-"}</p>
        <p>Links: ${linksHtml || "N/A"}</p>
      </div>
    `;
  });
}

// Pagination
function nextPage() {
  currentPage++;
  searchBooks();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    searchBooks();
  }
}

// Event listeners
document.getElementById("searchInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") searchBooks();
});

// Initial load
loadLanguages();
searchBooks();