import React from "react";

export default function Footer(props) {
  // ✅ NUNCA quebra, mesmo se props vier vazio ou undefined
  const brand = props?.brand ?? props?.footer?.brand ?? null;

  const safeName = brand?.name ?? "BW1";
  const safeDesc =
    brand?.description ??
    "Conectando você aos melhores veículos e imóveis do mercado com segurança e transparência.";
  const safeEmail = brand?.email ?? "contato@bw1.com.br";
  const safePhone = brand?.phone ?? "0800 123 4567";
  const year = brand?.year ?? new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="text-2xl font-bold text-white tracking-tighter">
              {safeName}
            </span>
            <p className="mt-4 text-sm">{safeDesc}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>{safeEmail}</li>
              <li>{safePhone}</li>
              <li className="flex gap-3 mt-4">
                <a className="w-9 h-9 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" href="#">IG</a>
                <a className="w-9 h-9 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" href="#">FB</a>
                <a className="w-9 h-9 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" href="#">LN</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; {year} {safeName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
