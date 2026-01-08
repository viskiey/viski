"use client"
import useSWR from "swr"

interface DownloadData {
  file_name: string
  download_count: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const files = {
  bat: [
    { name: "j_player.bat", label: "j_player.bat" },
    { name: "jw_player.bat", label: "jw_player.bat" },
  ],
  txt: [
    { name: "link.txt", label: "link.txt" },
    { name: "link2.txt", label: "link2.txt" },
    { name: "link3.txt", label: "link3.txt" },
    { name: "link4.txt", label: "link4.txt" },
  ],
  zip: [
    { name: "comment.zip", label: "comment.zip" },
    { name: "comnent.zip", label: "comnent.zip" },
  ],
}

export default function DownloadPage() {
  const { data: downloads, mutate } = useSWR<DownloadData[]>("/api/download", fetcher, {
    refreshInterval: 5000,
  })

  const getCount = (fileName: string) => {
    const item = downloads?.find((d) => d.file_name === fileName)
    return item?.download_count ?? 0
  }

  const handleDownload = (fileName: string) => {
    // Sayacı hemen güncelle (optimistic update)
    mutate()
    // Dosyayı indir - API sayacı artırıp dosyaya yönlendirir
    window.location.href = `/api/download?file=${fileName}`
  }

  const getDownloadLink = (fileName: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/download?file=${fileName}`
    }
    return `/api/download?file=${fileName}`
  }

  const totalDownloads = downloads?.reduce((acc, d) => acc + d.download_count, 0) ?? 0

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">File Download</h1>
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <span className="text-muted-foreground">Toplam İndirme:</span>
            <span className="font-bold text-primary text-xl">{totalDownloads}</span>
          </div>
        </div>

        {/* BAT ve TXT Dosyaları */}
        <div className="mb-6 bg-card border-l-4 border-amber-500 rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>Batch & Text Files</span>
          </h3>
          <div className="grid gap-3">
            {[...files.bat, ...files.txt].map((file) => (
              <div key={file.name} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <span className="font-medium text-foreground">{file.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
                    {getCount(file.name)} indirme
                  </span>
                  <a
                    href={`/api/download?file=${file.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleDownload(file.name)
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    İndir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZIP Dosyaları */}
        <div className="bg-card border-l-4 border-emerald-500 rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>ZIP Files</span>
          </h3>
          <div className="grid gap-3">
            {files.zip.map((file) => (
              <div key={file.name} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <span className="font-medium text-foreground">{file.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
                    {getCount(file.name)} indirme
                  </span>
                  <a
                    href={`/api/download?file=${file.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleDownload(file.name)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    İndir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">Sayaç her 5 saniyede bir otomatik güncellenir</p>
        <p className="text-center text-muted-foreground text-xs mt-2">
          İndir butonuna sağ tıklayıp "Bağlantı adresini kopyala" yapabilirsiniz
        </p>
      </div>
    </div>
  )
}
