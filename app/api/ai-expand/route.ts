import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'STABILITY_API_KEY가 설정되지 않았습니다. .env.local 파일에 키를 추가해주세요.' },
      { status: 500 }
    )
  }

  const form = await req.formData()
  const image = form.get('image') as File
  const left = Number(form.get('left') ?? 0)
  const right = Number(form.get('right') ?? 0)
  const up = Number(form.get('up') ?? 0)
  const down = Number(form.get('down') ?? 0)

  if (!image) {
    return NextResponse.json({ error: '이미지가 없습니다.' }, { status: 400 })
  }

  const apiForm = new FormData()
  apiForm.append('image', image)
  if (left > 0) apiForm.append('left', String(left))
  if (right > 0) apiForm.append('right', String(right))
  if (up > 0) apiForm.append('up', String(up))
  if (down > 0) apiForm.append('down', String(down))
  apiForm.append('output_format', 'png')

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/edit/outpaint', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    },
    body: apiForm,
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Stability AI 오류: ${text}` }, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return NextResponse.json({ dataUrl: `data:image/png;base64,${base64}` })
}
