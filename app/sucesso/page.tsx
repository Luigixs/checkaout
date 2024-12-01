'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SucessoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Pagamento Realizado com Sucesso!</h1>
        <p className="text-gray-600 mb-4">Obrigado por sua compra.</p>
        <button 
          onClick={() => router.push('/')} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Voltar para a página inicial
        </button>
      </div>
    </div>
  )
}

