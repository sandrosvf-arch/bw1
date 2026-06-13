/**
 * ============================================================
 *  BANNERS DO FULLBANNER — TROCA AQUI
 * ============================================================
 *  Tamanhos recomendados (entregar ao time de design):
 *
 *  Desktop → 1440 × 560 px  (ratio 18:7)
 *  Mobile  →  390 × 520 px  (ratio 3:4)
 *
 *  Formatos aceitos: .webp (preferido), .jpg, .png
 *  Resolução: 72 dpi, qualidade 85–90 %
 *  Peso máximo por banner: 300 KB (desktop) / 150 KB (mobile)
 *
 *  Como trocar:
 *    1. Coloque os arquivos na pasta /public/banners/
 *    2. Edite o array BANNERS abaixo (desktop + mobile)
 *    3. Salve — o site atualiza automaticamente
 * ============================================================
 */

const BANNERS = [
  // ── BANNER 1 ──────────────────────────────────────────────
  {
    id: 1,
    desktop: "/banners/banner-1-desktop.jpg",   // 1440 × 560 px
    mobile:  "/banners/banner-1-mobile.jpg",    //  390 × 520 px
    alt:  "Banner principal BW1",
    link: "",  // URL ao clicar (deixe "" para nenhum)
  },

  // ── BANNER 2 — descomente e adicione a imagem quando pronto ─
  // {
  //   id: 2,
  //   desktop: "/banners/banner-2-desktop.jpg",
  //   mobile:  "/banners/banner-2-mobile.jpg",
  //   alt:  "Ofertas de imóveis BW1",
  //   link: "",
  // },

  // ── BANNER 3 — descomente e adicione a imagem quando pronto ─
  // {
  //   id: 3,
  //   desktop: "/banners/banner-3-desktop.jpg",
  //   mobile:  "/banners/banner-3-mobile.jpg",
  //   alt:  "Ofertas de veículos BW1",
  //   link: "",
  // },
];

const HERO = {
  banners: BANNERS,
  searchPlaceholder: "Busque por modelo, cidade ou tipo...",
  /** Intervalo em ms entre a troca automática dos banners */
  intervalMs: 6000,
};

export default HERO;
