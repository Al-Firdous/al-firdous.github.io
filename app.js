// ---------------- CONFIG ----------------
const supabaseUrl = "https://dsffwzyvfoshksbjvpwt.supabase.co";
const supabaseKey = "sb_publishable_Cx2kjary3lueImlzBP0sDQ_vxFeKNzv";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
// ----------------------------------------

let currentPage = 1;
const pageSize = 50;

// DOM elements
const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");
const resultsDiv = document.getElementById("results");
const pageInfo = document.getElementById("pageInfo");
const searchButton = document.getElementById("searchButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

// Load language dropdown
async function loadLanguages() {
  const { data, error } = await supabase.from("languages").select("*").order("name");
  if (error) {
    console.error("Error loading languages:", error);
    return;
  }
  data.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang.id;
    option.textContent = lang.name;
    languageFilter.appendChild(option);
  });
}

// Search books
async function searchBooks() {
  const query = searchInput.value;
  const langId = languageFilter.value;

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

  if (langId) {
    booksQuery = booksQuery.eq("language_id", langId);
  }

  const { data, error } = await booksQuery;
  if (error) {
    console.error("Error fetching books:", error);
    return;
  }

  displayResults(data);
  pageInfo.textContent = `Page ${currentPage}`;
}

// Display results
function displayResults(books) {
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
searchButton.addEventListener("click", () => { currentPage = 1; searchBooks(); });
prevButton.addEventListener("click", prevPage);
nextButton.addEventListener("click", nextPage);
searchInput.addEventListener("keypress", e => { if(e.key === "Enter"){ currentPage=1; searchBooks(); } });

// Initial load
loadLanguages();
searchBooks();