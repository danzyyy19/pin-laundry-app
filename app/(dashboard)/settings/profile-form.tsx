// app/(dashboard)/settings/profile-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Upload, User as UserIcon } from 'lucide-react'
import Image from 'next/image'

type User = {
  id: string
  name: string
  email: string
  image: string | null
}

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [imageUrl, setImageUrl] = useState(user.image)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return imageUrl

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      return data.url
    } catch (error) {
      toast.error('Gagal upload gambar')
      return imageUrl
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadImage()
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          image: finalImageUrl
        })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast.success('Profile berhasil diupdate')
      router.refresh()
    } catch (error) {
      toast.error('Gagal update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Informasi Profil</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" />
            Upload Foto
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading || isUploading}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            JPG, PNG atau GIF. Maksimal 5MB.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            required
            disabled={isLoading || isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            required
            disabled={isLoading || isUploading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(isLoading || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading ? 'Mengupload...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}