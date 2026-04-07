const http = require('http');

const PORT = 3030;

// ========================================
// Pokemon Data
// ========================================
const POKEMON_DATA = [
  {
    id: 1,
    nameKr: '이상해씨',
    nameEn: 'Bulbasaur',
    types: ['풀', '독'],
    stats: { HP: 45, 공격: 49, 방어: 49, 특수공격: 65, 특수방어: 65, 스피드: 45 },
    description: '태어났을 때부터 등에 식물의 씨앗이 있으며, 씨앗은 몸과 함께 조금씩 자란다.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  },
  {
    id: 4,
    nameKr: '파이리',
    nameEn: 'Charmander',
    types: ['불꽃'],
    stats: { HP: 39, 공격: 52, 방어: 43, 특수공격: 60, 특수방어: 50, 스피드: 65 },
    description: '꼬리에 타오르는 불꽃은 생명력의 상징이다. 기운이 넘치면 불꽃이 더욱 세차게 타오른다.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
  },
  {
    id: 7,
    nameKr: '꼬부기',
    nameEn: 'Squirtle',
    types: ['물'],
    stats: { HP: 44, 공격: 48, 방어: 65, 특수공격: 50, 특수방어: 64, 스피드: 43 },
    description: '긴 목을 등껍질 안에 집어넣고 입에서 물을 세차게 뿜어 공격한다.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
  },
  {
    id: 25,
    nameKr: '피카츄',
    nameEn: 'Pikachu',
    types: ['전기'],
    stats: { HP: 35, 공격: 55, 방어: 40, 특수공격: 50, 특수방어: 50, 스피드: 90 },
    description: '볼에 전기 주머니가 있다. 잘 때 양 볼에서 전기가 나오는 경우가 있다.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    id: 133,
    nameKr: '이브이',
    nameEn: 'Eevee',
    types: ['노말'],
    stats: { HP: 55, 공격: 55, 방어: 50, 특수공격: 45, 특수방어: 65, 스피드: 55 },
    description: '불안정한 유전자를 가지고 있어 주변 환경에 따라 다양한 모습으로 진화한다.',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
  },
];

// ========================================
// Helper Functions
// ========================================
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseURL(url) {
  const [path, queryString] = url.split('?');
  const params = new URLSearchParams(queryString || '');
  return { path, params };
}

// ========================================
// Server
// ========================================
const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const { path, params } = parseURL(req.url);

  // GET /api/pokemon — 전체 목록 또는 검색
  if (path === '/api/pokemon' && req.method === 'GET') {
    const query = params.get('q');

    if (!query) {
      return sendJSON(res, 200, POKEMON_DATA);
    }

    const q = query.trim().toLowerCase();
    const filtered = POKEMON_DATA.filter((p) =>
      p.nameKr.includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      String(p.id) === q ||
      String(p.id).padStart(3, '0').includes(q)
    );

    return sendJSON(res, 200, filtered);
  }

  // GET /api/pokemon/:id — 개별 포켓몬
  const idMatch = path.match(/^\/api\/pokemon\/(\d+)$/);
  if (idMatch && req.method === 'GET') {
    const id = parseInt(idMatch[1], 10);
    const pokemon = POKEMON_DATA.find((p) => p.id === id);

    if (!pokemon) {
      return sendJSON(res, 404, { error: '포켓몬을 찾을 수 없습니다.' });
    }

    return sendJSON(res, 200, pokemon);
  }

  // 404
  sendJSON(res, 404, { error: '존재하지 않는 API 경로입니다.' });
});

server.listen(PORT, () => {
  console.log(`포켓몬 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('');
  console.log('API 엔드포인트:');
  console.log(`  GET /api/pokemon         — 전체 포켓몬 목록`);
  console.log(`  GET /api/pokemon?q=피카츄  — 포켓몬 검색`);
  console.log(`  GET /api/pokemon/25       — 개별 포켓몬 조회`);
});
