document.addEventListener('DOMContentLoaded', () => {
  const eyebrow = document.getElementById('hero-eyebrow');
  const title = document.getElementById('hero-title');
  const description = document.getElementById('hero-description');

  eyebrow.addEventListener('click', () => {
    alert('안녕하세요');
  });

  title.addEventListener('click', () => {
    alert('제목 1');
  });

  description.addEventListener('click', () => {
    alert('간결함의 궁극. 당신의 웹 경험을 완전히 새로운 차원으로 끌어올립니다.');
  });
});
