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
  
  export const identifyCardBrand = (cardNumber: string): CardBrand => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/,
      elo: /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^50(4175|6699|67[0-7][0-9]|9000)|^627780|^63(6297|6368)|^65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[1-9]|[3-4][0-9]|5[0-8]))/,
      hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
    }
  
    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand as CardBrand
      }
    }
  
    return 'unknown'
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
  
  type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'elo' | 'hipercard' | 'unknown'
  
  