
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const mountainId = params.get('id');

  if (!mountainId) {
    document.getElementById('mountain-detail').innerHTML = '<h1>山が見つかりません</h1><p><a href="index.html">一覧に戻る</a></p>';
    return;
  }

  fetch('data/mountains.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(mountains => {
      const mountain = mountains.find(m => m.id.toString() === mountainId);

      if (!mountain) {
        document.getElementById('mountain-detail').innerHTML = '<h1>山が見つかりません</h1><p><a href="index.html">一覧に戻る</a></p>';
        return;
      }

      // Update page title
      document.title = `${mountain.name} | 日本の3000m峰`;

      // Populate header
      const mountainImage = document.getElementById('mountain-image');
      if (mountainImage instanceof HTMLImageElement) {
        mountainImage.src = mountain.image;
        mountainImage.alt = mountain.name;
      }
      document.getElementById('mountain-name').textContent = mountain.name;
      document.getElementById('mountain-elevation').textContent = `${mountain.elevation}m`;
      const difficultyBadge = document.getElementById('difficulty-badge');
      difficultyBadge.textContent = `難易度: ${mountain.difficulty}`;
      difficultyBadge.className = `difficulty ${mountain.difficulty}`;

      // Populate highlights
      const highlightsList = document.getElementById('highlights-list');
      highlightsList.innerHTML = mountain.highlights.map(item => `<li>${item}</li>`).join('');

      // Populate routes
      const routesContainer = document.getElementById('routes-container');
      routesContainer.innerHTML = mountain.routes.map(route => {
        const totalDuration = route.details.reduce((total, detail) => total + detail.duration, 0);
        const formatDuration = (minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
        };

        const detailsHtml = route.details.map(detail => `
          <tr>
            <td>${detail.from} → ${detail.to}</td>
            <td>${formatDuration(detail.duration)}</td>
          </tr>
        `).join('');

        return `
          <div class="route-card-detail">
            <h3>${route.name}</h3>
            <p>${route.description}</p>
            <p class="time-info"><strong>所要時間目安:</strong> ${route.time_required} / 合計 ${formatDuration(totalDuration)}</p>
            <table class="route-table-detail">
              <thead>
                <tr>
                  <th>区間</th>
                  <th>所要時間</th>
                </tr>
              </thead>
              <tbody>
                ${detailsHtml}
              </tbody>
            </table>
          </div>
        `;
      }).join('');

      // Populate dangers
      const dangersList = document.getElementById('dangers-list');
      dangersList.innerHTML = mountain.dangers.map(item => `<li>${item}</li>`).join('');
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      document.getElementById('mountain-detail').innerHTML = '<h1>情報の読み込みに失敗しました</h1><p><a href="index.html">一覧に戻る</a></p>';
    });
});
