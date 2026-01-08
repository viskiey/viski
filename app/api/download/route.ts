import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const EXTERNAL_BASE_URL = "https://polite-cranachan-0afedf.netlify.app"

function cleanFileName(fileName: string): string {
  // ?t=123456 gibi query parametrelerini kaldır
  return fileName.split("?")[0]
}

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json()

    if (!fileName) {
      return NextResponse.json({ error: "File name required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Sayacı artır
    const { data, error } = await supabase.rpc("increment_download", {
      file_name_param: fileName,
    })

    if (error) {
      // RPC fonksiyonu yoksa manuel güncelle
      const { data: current } = await supabase
        .from("downloads")
        .select("download_count")
        .eq("file_name", fileName)
        .single()

      if (current) {
        const { error: updateError } = await supabase
          .from("downloads")
          .update({
            download_count: current.download_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("file_name", fileName)

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawFileName = searchParams.get("file")

    // Eğer file parametresi varsa, sayacı artır ve dosyayı proxy olarak döndür
    if (rawFileName) {
      const fileName = cleanFileName(rawFileName)

      const supabase = await createClient()

      console.log("[v0] GET request for file:", rawFileName, "-> cleaned:", fileName)

      const { data: current, error: selectError } = await supabase
        .from("downloads")
        .select("download_count")
        .eq("file_name", fileName)
        .single()

      console.log("[v0] Current record:", current, "Error:", selectError)

      if (current) {
        // Kayıt varsa güncelle
        const { error: updateError } = await supabase
          .from("downloads")
          .update({
            download_count: current.download_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("file_name", fileName)

        console.log("[v0] Update result, error:", updateError)
      } else {
        // Kayıt yoksa yeni oluştur
        const { error: insertError } = await supabase.from("downloads").insert({
          file_name: fileName,
          download_count: 1,
        })

        console.log("[v0] Insert result, error:", insertError)
      }

      const fileUrl = `${EXTERNAL_BASE_URL}/${rawFileName}`
      console.log("[v0] Fetching file from:", fileUrl)

      const fileResponse = await fetch(fileUrl)

      if (!fileResponse.ok) {
        console.log("[v0] File fetch failed:", fileResponse.status)
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      const fileContent = await fileResponse.arrayBuffer()
      const contentType = fileResponse.headers.get("content-type") || "application/octet-stream"

      console.log("[v0] Returning file, size:", fileContent.byteLength)

      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // file parametresi yoksa tüm sayaçları listele
    const supabase = await createClient()
    const { data, error } = await supabase.from("downloads").select("file_name, download_count").order("file_name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.log("[v0] Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
