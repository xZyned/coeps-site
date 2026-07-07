'use client'

import { useEffect, useState } from 'react'
import { AreaCongressista } from '@/components/cieps'

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null)
  const [nome, setNome] = useState('Congressista')

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/get/usuariosInformacoes')
        const data = await response.json()

        setUserId(data?.data?._id || null)
        setNome(data?.data?.nome || data?.data?.name || 'Congressista')
      } catch {
        setUserId(null)
        setNome('Congressista')
      }
    }

    fetchUserInfo()
  }, [])

  return <AreaCongressista nome={nome} userId={userId} />
}
