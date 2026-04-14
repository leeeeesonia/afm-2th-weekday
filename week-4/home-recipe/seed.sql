-- Master ingredients
INSERT INTO ingredients_master (name, category, default_unit) VALUES
  ('양파',     '채소',  '개'),
  ('대파',     '채소',  '대'),
  ('마늘',     '채소',  '쪽'),
  ('당근',     '채소',  '개'),
  ('감자',     '채소',  '개'),
  ('애호박',   '채소',  '개'),
  ('김치',     '반찬',  'g'),
  ('달걀',     '유제품','개'),
  ('우유',     '유제품','ml'),
  ('치즈',     '유제품','장'),
  ('돼지고기', '육류',  'g'),
  ('소고기',   '육류',  'g'),
  ('닭고기',   '육류',  'g'),
  ('베이컨',   '육류',  'g'),
  ('밥',       '곡물',  '공기'),
  ('라면',     '곡물',  '봉지'),
  ('스파게티면','곡물', 'g'),
  ('식용유',   '양념',  'ml'),
  ('간장',     '양념',  'ml'),
  ('고추장',   '양념',  'g'),
  ('된장',     '양념',  'g'),
  ('소금',     '양념',  'g'),
  ('후추',     '양념',  'g'),
  ('설탕',     '양념',  'g'),
  ('참기름',   '양념',  'ml');

-- Fridge items (current inventory)
INSERT INTO fridge_items (ingredient_id, amount, unit, expiry_date) VALUES
  ((SELECT id FROM ingredients_master WHERE name='양파'),     2,   '개', '2026-04-25'),
  ((SELECT id FROM ingredients_master WHERE name='대파'),     1,   '대', '2026-04-18'),
  ((SELECT id FROM ingredients_master WHERE name='마늘'),     10,  '쪽', '2026-05-01'),
  ((SELECT id FROM ingredients_master WHERE name='김치'),     500, 'g',  '2026-06-30'),
  ((SELECT id FROM ingredients_master WHERE name='달걀'),     6,   '개', '2026-04-20'),
  ((SELECT id FROM ingredients_master WHERE name='돼지고기'), 300, 'g',  '2026-04-16'),
  ((SELECT id FROM ingredients_master WHERE name='밥'),       3,   '공기', NULL),
  ((SELECT id FROM ingredients_master WHERE name='식용유'),   500, 'ml',  '2027-01-01'),
  ((SELECT id FROM ingredients_master WHERE name='간장'),     300, 'ml',  '2027-06-01'),
  ((SELECT id FROM ingredients_master WHERE name='고추장'),   200, 'g',   '2027-03-01'),
  ((SELECT id FROM ingredients_master WHERE name='참기름'),   150, 'ml',  '2026-12-01'),
  ((SELECT id FROM ingredients_master WHERE name='라면'),     2,   '봉지', '2026-11-01');

-- Recipes
INSERT INTO recipes (id, name, description, servings, cook_time) VALUES
  (1, '김치볶음밥',   '남은 김치와 밥으로 만드는 든든한 한 끼', 1, 15),
  (2, '계란말이',     '부드럽고 폭신한 기본 계란말이',           2, 10),
  (3, '제육볶음',     '매콤달콤한 돼지고기 볶음',                 2, 20),
  (4, '라면',         '기본 라면 끓이기',                         1, 5),
  (5, '까르보나라',   '베이컨과 치즈의 풍미 가득 파스타',         2, 20),
  (6, '감자볶음',     '간단한 감자채 볶음 반찬',                   2, 15);
SELECT setval('recipes_id_seq', (SELECT MAX(id) FROM recipes));

-- Recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, is_optional) VALUES
  -- 1. 김치볶음밥
  (1, (SELECT id FROM ingredients_master WHERE name='김치'),       200, 'g',    FALSE),
  (1, (SELECT id FROM ingredients_master WHERE name='밥'),         1,   '공기', FALSE),
  (1, (SELECT id FROM ingredients_master WHERE name='식용유'),     15,  'ml',   FALSE),
  (1, (SELECT id FROM ingredients_master WHERE name='대파'),       0.5, '대',   FALSE),
  (1, (SELECT id FROM ingredients_master WHERE name='달걀'),       1,   '개',   TRUE),
  (1, (SELECT id FROM ingredients_master WHERE name='참기름'),     5,   'ml',   TRUE),
  -- 2. 계란말이
  (2, (SELECT id FROM ingredients_master WHERE name='달걀'),       3,   '개',   FALSE),
  (2, (SELECT id FROM ingredients_master WHERE name='소금'),       2,   'g',    FALSE),
  (2, (SELECT id FROM ingredients_master WHERE name='식용유'),     10,  'ml',   FALSE),
  (2, (SELECT id FROM ingredients_master WHERE name='대파'),       0.3, '대',   TRUE),
  -- 3. 제육볶음
  (3, (SELECT id FROM ingredients_master WHERE name='돼지고기'),   300, 'g',    FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='고추장'),     30,  'g',    FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='간장'),       15,  'ml',   FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='양파'),       1,   '개',   FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='마늘'),       4,   '쪽',   FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='설탕'),       10,  'g',    FALSE),
  (3, (SELECT id FROM ingredients_master WHERE name='참기름'),     5,   'ml',   TRUE),
  -- 4. 라면
  (4, (SELECT id FROM ingredients_master WHERE name='라면'),       1,   '봉지', FALSE),
  (4, (SELECT id FROM ingredients_master WHERE name='달걀'),       1,   '개',   TRUE),
  (4, (SELECT id FROM ingredients_master WHERE name='대파'),       0.3, '대',   TRUE),
  -- 5. 까르보나라
  (5, (SELECT id FROM ingredients_master WHERE name='스파게티면'), 200, 'g',    FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='베이컨'),     100, 'g',    FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='달걀'),       2,   '개',   FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='치즈'),       2,   '장',   FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='우유'),       50,  'ml',   FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='후추'),       1,   'g',    FALSE),
  (5, (SELECT id FROM ingredients_master WHERE name='마늘'),       2,   '쪽',   TRUE),
  -- 6. 감자볶음
  (6, (SELECT id FROM ingredients_master WHERE name='감자'),       2,   '개',   FALSE),
  (6, (SELECT id FROM ingredients_master WHERE name='당근'),       0.3, '개',   FALSE),
  (6, (SELECT id FROM ingredients_master WHERE name='식용유'),     15,  'ml',   FALSE),
  (6, (SELECT id FROM ingredients_master WHERE name='소금'),       2,   'g',    FALSE);

-- Recipe steps
INSERT INTO recipe_steps (recipe_id, step_no, description) VALUES
  (1, 1, '팬에 식용유를 두르고 다진 대파를 볶아 파기름을 낸다.'),
  (1, 2, '김치를 넣고 2~3분 볶는다.'),
  (1, 3, '밥을 넣고 김치와 잘 섞어 볶는다.'),
  (1, 4, '기호에 따라 계란 프라이를 올리고 참기름을 둘러 마무리한다.'),

  (2, 1, '달걀을 풀고 소금으로 간한다 (원하면 다진 대파 추가).'),
  (2, 2, '달군 팬에 식용유를 두르고 약불로 달걀물을 얇게 붓는다.'),
  (2, 3, '반쯤 익으면 한쪽에서부터 돌돌 말아준다.'),
  (2, 4, '한 김 식힌 뒤 먹기 좋게 썬다.'),

  (3, 1, '돼지고기를 고추장·간장·설탕·다진 마늘로 재운다 (15분).'),
  (3, 2, '양파는 채 썰어 준비한다.'),
  (3, 3, '팬을 달궈 고기를 볶다가 양파를 넣고 함께 볶는다.'),
  (3, 4, '마지막에 참기름을 둘러 마무리한다.'),

  (4, 1, '물 550ml를 끓인다.'),
  (4, 2, '면과 스프를 넣고 4분 30초간 끓인다.'),
  (4, 3, '기호에 따라 달걀·대파를 추가한다.'),

  (5, 1, '스파게티면을 소금 넣은 끓는 물에 삶는다 (8분).'),
  (5, 2, '베이컨을 잘라 팬에 바삭하게 볶는다 (다진 마늘 추가 가능).'),
  (5, 3, '볼에 달걀, 치즈, 우유, 후추를 섞어 소스를 만든다.'),
  (5, 4, '불을 끈 팬에 면·베이컨·소스를 넣고 빠르게 버무린다.'),

  (6, 1, '감자와 당근을 가늘게 채 썬다.'),
  (6, 2, '감자는 찬물에 5분 담가 전분기를 뺀다.'),
  (6, 3, '팬에 식용유를 두르고 당근→감자 순으로 볶는다.'),
  (6, 4, '소금으로 간하고 감자가 투명해질 때까지 볶는다.');
