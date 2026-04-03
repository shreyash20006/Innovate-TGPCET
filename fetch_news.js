async function fetchNews() {
  try {
    const url = 'https://gnews.io/api/v4/search?q="artificial+intelligence"+OR+"machine+learning"+OR+"internship"+OR+"fresher"+OR+"hiring"&lang=en&apikey=ebcc84b6d91abd52a5ba32c34b492e82&max=10';
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data.articles, null, 2));
  } catch (err) {
    console.error(err);
  }
}
fetchNews();
