import React from "react";

export default function CTA() {
  return (
    <div className="mt-12 mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4">
            Quer vender seu carro ou imóvel?
          </h2>
          <p className="text-blue-100 max-w-xl text-lg">
            Anuncie na BW1 e alcance milhares de compradores qualificados hoje
            mesmo.
          </p>
        </div>

        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap">
          Anunciar Agora
        </button>
      </div>

      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
    </div>
  );
}
