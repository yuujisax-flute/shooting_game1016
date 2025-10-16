
document.addEventListener('DOMContentLoaded', () => {
  const mountainGrid = document.getElementById('mountain-grid');

  if (!mountainGrid) return;

  fetch('data/mountains.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(mountains => {
      let gridHtml = '';
      mountains.forEach(mountain => {
        gridHtml += `
          <a href="mountain.html?id=${mountain.id}" class="card">
            <img src="${mountain.image}" alt="${mountain.name}" class="card-image">
            <div class="card-content">
              <h2>${mountain.name}</h2>
              <div class="card-info">
                <span>${mountain.elevation}m</span>
                <span class="difficulty ${mountain.difficulty}">
                  ${mountain.difficulty}
                </span>
              </div>
            </div>
          </a>
        `;
      });
      mountainGrid.innerHTML = gridHtml;
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      mountainGrid.innerHTML = '<p>山のデータの読み込みに失敗しました。</p>';
    });
});
