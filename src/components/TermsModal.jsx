import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function TermsModal({ isOpen, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <ShieldAlert size={28} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Termos de Responsabilidade
            </h2>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-900 leading-relaxed mb-3">
                <strong>⚠️ Atenção: leia antes de continuar</strong>
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                A BW1 é uma plataforma de anúncios e não se responsabiliza por transações realizadas entre usuários. Ao utilizar a plataforma, você concorda em seguir as diretrizes de segurança abaixo. O descumprimento dessas práticas é de total responsabilidade do usuário.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="text-red-500 mt-0.5 font-bold text-lg">✕</span>
                <p className="text-sm text-slate-700">
                  <strong>Nunca</strong> faça pagamentos antecipados, depósitos ou transferências antes de ver o produto pessoalmente.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="text-red-500 mt-0.5 font-bold text-lg">✕</span>
                <p className="text-sm text-slate-700">
                  <strong>Desconfie</strong> de preços muito abaixo do mercado, facilidades excessivas ou urgência para fechar negócio.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="text-green-500 mt-0.5 font-bold text-lg">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Sempre</strong> encontre o vendedor em local público e seguro para verificar o produto.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="text-green-500 mt-0.5 font-bold text-lg">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Verifique</strong> a documentação original do veículo ou imóvel antes de fechar qualquer negócio.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="text-green-500 mt-0.5 font-bold text-lg">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Prefira</strong> pagamentos seguros e formalize a transação com recibo ou contrato.
                </p>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Termo de responsabilidade:</strong> A BW1 atua exclusivamente como plataforma de conexão entre anunciantes e interessados. Não participamos, intermediamos ou garantimos nenhuma transação. Golpes, fraudes ou prejuízos decorrentes de negociações que não seguiram as diretrizes de segurança são de responsabilidade exclusiva dos envolvidos.
              </p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onAccept}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-lg"
          >
            Li e aceito os termos
          </button>
        </div>
      </div>
    </div>
  );
}
