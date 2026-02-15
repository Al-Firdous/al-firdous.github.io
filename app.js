// ----- CONFIGURE THIS -----
const supabaseUrl = "https://dsffwzyvfoshksbjvpwt.supabase.co"; // replace with your Supabase URL
const supabaseKey = "sb_publishable_Cx2kjary3lueImlzBP0aDQ_vxFeKNzv"; // replace with your anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
// ----------------------------

let currentPage = 1;
const pageSize = 50;

async function searchBooks() {
  const query = document.getElementById("searchInput").value;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("books")
    .select(`
      id,
      title,
      external_links,
      author_id,
      language_id,
      publication_year,
      hijri_year,
      publisher_id,
      isbn
    `)
    .ilike("title", `%${query}%`)
    .range(from, to)
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  displayResults(data);
  document.getElementById("pageInfo").textContent = `Page ${currentPage}`;
}

function displayResults(books) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!books || books.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  books.forEach((book) => {
    const linksHtml = (book.external_links || []).map(
      (l) => `<a href="${l.url}" target="_blank">${l.format || "link"}</a>`
    ).join(" | ");

    resultsDiv.innerHTML += `
      <div class="book">
        <h3>${book.title}</h3>
        <p>Author ID: ${book.author_id}</p>
        <p>Language ID: ${book.language_id}</p>
        <p>Year: ${book.publication_year} / ${book.hijri_year}</p>
        <p>Publisher ID: ${book.publisher_id}</p>
        <p>ISBN: ${book.isbn}</p>
        <p>Links: ${linksHtml}</p>
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
  if (currentPage > 1) currentPage--;
  searchBooks();
}

// Optional: search on enter key
document.getElementById("searchInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") searchBooks();
});