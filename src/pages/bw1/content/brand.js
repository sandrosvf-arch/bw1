const BRAND = {
  name: "BW1",
  tagline: "CARROS & IMÓVEIS",
  logoSrc: "/logo-bw1.png",

  colors: {
    carros: "#243746",
    and: "#243746",
    imoveis: "#FF6A00",
  },

  mobileTaglineClass: "text-[12px]",
  desktopTaglineClass: "text-sm",
};

// ✅ export nomeado + export default (funciona em qualquer import)
export { BRAND };
export default BRAND;
