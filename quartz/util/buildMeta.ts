// 빌드마다 갱신되는 에셋 캐시버스팅 토큰.
// emitContent(processors/emit.ts)가 병렬 emitter 시작 전에 채우고,
// renderPage가 index.css 링크에 ?v=<assetVersion>으로 붙인다.
// 목적: 빌드/배포가 바뀌면 링크 URL이 바뀌어 브라우저가 새 CSS를 받도록(하드 리로드 불필요).
export const buildMeta = { assetVersion: "" }
