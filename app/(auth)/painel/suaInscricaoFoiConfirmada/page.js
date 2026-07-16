'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Confirmacao } from '@/components/cieps'

export default function SuaInscricaoFoiConfirmada() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const confirmarAnimacaoInscricao = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/post/confirmarAnimacaoInscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`)
      }

      router.push('/painel')
    } catch (error) {
      console.error('Erro ao confirmar animação de inscrição:', error)
      setIsLoading(false)
    }
  }

  return <Confirmacao onContinue={confirmarAnimacaoInscricao} isLoading={isLoading} />
}
