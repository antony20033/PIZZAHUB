export default async function callApi(path, options = {}) {
  const url = `/.netlify/functions/proxy?path=${encodeURIComponent(path)}`
  return fetch(url, options)
}
