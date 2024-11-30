import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2')
  if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
}

export const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return `(${numbers}`
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

export const formatCardNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19)
}

export const formatExpiryDate = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`
}

export const validateCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
  const cpfArray = cpf.split('').map(el => +el)
  const rest = (count: number) => (
    cpfArray.slice(0, count-12)
      .reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10
  ) % 11 % 10
  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10]
}

export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '')
  
  if (digits.length < 13 || digits.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export const identifyCardBrand = (cardNumber: string): CardBrand => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    elo: /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-7][0-9]|9000)|^627780|^63(6297|6368)|^65/,
    hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
    maestro: /^(5018|5020|5038|6304|6759|6761|6763)[0-9]{8,15}$/,
    paypal: /^(4485|4532|4716)[0-9]{12}$/
  }

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand as CardBrand;
    }
  }

  return 'unknown';
}

export const validateExpiryDate = (value: string): string | null => {
  const [month, year] = value.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last two digits of current year
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  if (month > 12 || month < 1) {
    return 'Mês inválido';
  }
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Data de validade expirada';
  }
  return null;
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'maestro' | 'paypal' | 'unknown';

