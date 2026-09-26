/* ---------------------------------------------
   Post Explorer — fetch logic
   Loads the first 5 posts from JSONPlaceholder
   without reloading the page.
--------------------------------------------- */

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const POST_LIMIT = 5;

// Flip to true to test the empty-state branch without touching the API.
const SIMULATE_EMPTY = false;

const loadBtn = document.getElementById("load-btn");
const statusBox = document.getElementById("status");
const postsBox = document.getElementById("posts");

loadBtn.addEventListener("click", loadPosts);

/**
 * Main flow: request posts, then render them or an error.
 */
async function loadPosts() {
  setLoading(true);
  clear(postsBox);

  try {
    const posts = await fetchPosts();

    if (posts.length === 0) {
      showEmpty();
      return;
    }

    renderPosts(posts);
    showMessage(`Showing ${posts.length} of the newest posts.`);
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
}

/**
 * Requests the posts and returns the first few as an array.
 * Throws when the network fails or the server answers with an error status.
 */
async function fetchPosts() {
  const response = await fetch(API_URL);

  // fetch only rejects on network failure, so check the status ourselves.
  if (!response.ok) {
    throw new Error(`The server responded with ${response.status}.`);
  }

  const data = await response.json();

  if (SIMULATE_EMPTY) {
    return [];
  }

  if (!Array.isArray(data)) {
    throw new Error("The response was not in the expected format.");
  }

  return data.slice(0, POST_LIMIT);
}

/* --- Rendering --- */
function renderPosts(posts) {
  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const id = document.createElement("p");
    id.className = "post__id";
    id.textContent = `Post ${post.id}`;

    const title = document.createElement("h2");
    title.className = "post__title";
    title.textContent = post.title;

    const body = document.createElement("p");
    body.className = "post__body";
    body.textContent = post.body;

    article.append(id, title, body);
    fragment.append(article);
  });

  postsBox.append(fragment);
}

/* --- Status states --- */

function setLoading(isLoading) {
  loadBtn.disabled = isLoading;
  loadBtn.textContent = isLoading ? "Loading…" : "Load posts";

  if (isLoading) {
    statusBox.className = "status";
    clear(statusBox);

    const spinner = document.createElement("span");
    spinner.className = "spinner";

    const label = document.createElement("span");
    label.textContent = "Fetching posts…";

    statusBox.append(spinner, label);
  }
}

function showMessage(text) {
  statusBox.className = "status";
  clear(statusBox);
  statusBox.textContent = text;
}

function showEmpty() {
  statusBox.className = "status status--empty";
  clear(statusBox);
  statusBox.textContent = "No posts came back. Try again in a moment.";
}

/**
 * Explains what failed and offers a retry that re-runs the same request.
 */
function showError(error) {
  statusBox.className = "status status--error";
  clear(statusBox);

  const message = document.createElement("p");
  message.textContent = `Couldn't load the posts. ${error.message}`;

  const retry = document.createElement("button");
  retry.className = "button";
  retry.type = "button";
  retry.textContent = "Try again";
  retry.addEventListener("click", loadPosts);

  statusBox.append(message, retry);
}

function clear(element) {
  element.replaceChildren();
}