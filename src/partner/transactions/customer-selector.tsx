'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  whatsapp: string
  city: string
  bankName?: string | null
  accountNumber?: string | null
  accountOwner?: string | null
}

interface CustomerSelectorProps {
  selectedCustomerId: string
  onCustomerSelect: (customerId: string) => void
  onNewCustomer: (customer: Customer) => void
  partnerId: string
}

export function CustomerSelector({
  selectedCustomerId,
  onCustomerSelect,
  onNewCustomer,
  partnerId
}: CustomerSelectorProps) {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    city: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [partnerId])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  const handleCreateCustomer = async () => {
    // Validation
    if (!newCustomer.name || !newCustomer.whatsapp || !newCustomer.city) {
      toast({
        title: 'Validasi Error',
        description: 'Nama, WhatsApp, dan Kota wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (!newCustomer.whatsapp.match(/^08\d{8,11}$/)) {
      toast({
        title: 'Format WhatsApp Salah',
        description: 'WhatsApp harus dimulai dengan 08 dan 10-13 digit',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          whatsapp: newCustomer.whatsapp,
          bankName: newCustomer.bankName || null,
          accountNumber: newCustomer.accountNumber || null,
          accountOwner: newCustomer.accountOwner || null,
          city: newCustomer.city,
          label: 'Regular',
          partnerId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Customer Berhasil Dibuat!',
          variant: 'default'
        })
        setShowNewCustomer(false)
        onNewCustomer(data.customer)
        onCustomerSelect(data.customer.id)
        // Reset form
        setNewCustomer({
          name: '',
          whatsapp: '',
          bankName: '',
          accountNumber: '',
          accountOwner: '',
          city: ''
        })
        fetchCustomers()
      } else {
        throw new Error(data.error || 'Gagal membuat customer')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat customer',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  return (
    <div className="space-y-2">
      <Label>Customer</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Select
            value={selectedCustomerId}
            onValueChange={onCustomerSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih customer atau buat baru" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.whatsapp} - {c.city}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Tambah Customer Baru">
              <UserPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Customer Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama *</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <Label>No. WhatsApp *</Label>
                <Input
                  value={newCustomer.whatsapp}
                  onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <Label>Bank</Label>
                <Input
                  value={newCustomer.bankName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, bankName: e.target.value })}
                  placeholder="Contoh: BCA"
                />
              </div>
              <div>
                <Label>No. Rekening</Label>
                <Input
                  value={newCustomer.accountNumber}
                  onChange={(e) => setNewCustomer({ ...newCustomer, accountNumber: e.target.value })}
                  placeholder="Nomor rekening"
                />
              </div>
              <div>
                <Label>Nama Pemilik</Label>
                <Input
                  value={newCustomer.accountOwner}
                  onChange={(e) => setNewCustomer({ ...newCustomer, accountOwner: e.target.value })}
                  placeholder="Sesuai buku tabungan"
                />
              </div>
              <div>
                <Label>Kota *</Label>
                <Input
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  placeholder="Kota domisili"
                />
              </div>
              <Button
                onClick={handleCreateCustomer}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Customer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {selectedCustomer && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {selectedCustomer.name}
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {selectedCustomer.whatsapp} • {selectedCustomer.city}
          </p>
          {selectedCustomer.bankName && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {selectedCustomer.bankName} - {selectedCustomer.accountNumber}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
