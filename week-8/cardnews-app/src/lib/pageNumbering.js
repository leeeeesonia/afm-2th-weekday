// 페이지 번호 계산 — 인덱스+총 페이지 수로 자동 산출. 페이지 추가/삭제/재정렬 시 즉시 반영.
export function computedPageNumber(index, total, format = '{n} / {total}') {
  return format.replace('{n}', String(index + 1)).replace('{total}', String(total));
}

// 표지 페이지는 보통 "1 / 10"으로 시작. 어떤 표지는 페이지 번호 자체를 안 보여줌.
// variant가 page prop을 받지 않으면 자동 주입은 무해.
export function effectivePropsForRender({ page, pageIndex, total, numberingFormat }) {
  return {
    ...page.props,
    page: computedPageNumber(pageIndex, total, numberingFormat),
  };
}
