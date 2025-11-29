import { useEffect, useState } from "react"

export type Address = {
  id: string
  alias: string
  recipient_name: string
  phone_number: string
  address_line_1: string
  address_line_2?: string
  city: string
  region: string
  zip_code: string
  is_default: boolean
}

async function fetchUserAddresses(userId: string): Promise<Address[]> {
  const resp = await fetch(`/api/user/addresses?user_id=${userId}`, {
    cache: "no-store",
  })
  if (!resp.ok) return []
  return await resp.json()
}

export function useUserAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState("")

  useEffect(() => {
    if (!userId) return
    fetchUserAddresses(userId).then((addrs) => {
      setAddresses(addrs)
      if (addrs?.length) {
        const def = addrs.find((a) => a.is_default) || addrs[0]
        setSelectedAddress(def.id)
      }
    })
  }, [userId])

  return { addresses, selectedAddress, setSelectedAddress, setAddresses }
}
