// The setup half of Google's gtag.js snippet (measurement ID G-BY3GNKJKDY).
// Kept out of index.html so the Content-Security-Policy can keep refusing
// inline script. The loader itself is the <script async> tag in index.html.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'G-BY3GNKJKDY');
