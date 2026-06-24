'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Preset, TextLayer, CustomSetting, OutputFormat, CropMode, ActiveTab } from '@/lib/types'
import { PRESETS, CH_LABELS, CH_ORDER, MIME, EXT } from '@/lib/constants'
import { drawImage, drawImageCustom, aiExpandImage } from '@/lib/canvas'
import Header from './Header'
import ExportSheet from './ExportSheet'

const LOGO_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOsAAABHCAYAAADm1LBAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAv+SURBVHhe7Z09V9tYGsf/8TiIBAz28jIJziY2zThN7BRJxZwxS5Vp4lSpNkC9BfAJgE8AFNvtOTiZKhWm2a1YnBMqUsROs94GKyxm5gQzyBEvluNxtpB0LQvbkvwCKH5+5+jEkcXV2/3f597nee71ta8l6SsIgrjyOPQ7CIK4mpBYCcImkFgJwiaQWAnCJpBYCcImkFgJwiaQWAnCJpBYiY5HkEpYSeb0u68cJFaio4ln8nj4eg+zW4dY+XC1BUtiJToSQSphbusQ47F98GIRYW83ggOc/rArxTVKNyQ6DV4s4tk/f0MiW4DP5cTqxDDC3m79YVcOsqxEx/HyPyJ4sYilsQGkX9y1hVBBlpXoRASpBABwc/ayVSRWiySyEhLZLwgNXkdo8HLGOIJUglCQK5yKu8txIZWPF4tIHBTY+d1dDvj6nAgNdukPbRr9uXwuJ9ycoy3n0j7Tdj1LXiwCTZRvO7GOx/YRz+T1uxlhbzc2IyP63S3j4es9JLKFtp9Hz+L2ERbeHel3n8PnciI01IWIvweTAZf+64bgxSJWEjlE/ysyq6TH53JiNtSPp/6b8Lmu6782jSCVsPIhh+Vkru653j+/Y1jhr/19R7/LFGberSCV4PkHr99tishoD9aefK/fbYjtxBpNHePj5y+IZ84Q35dF63M5MaVUzHt95c+tJpEt4OHrPfb/98/vtKWVr0Y8c4Y3mTwShxJiO6eA5r7v9V3Hx89fwItFxDNnrAX3uZxY+/n7hnsAglTC4rsjLCsxSDfnwNQPLgSHOPhcTghSCcmshGhKHgNCOefqxBDC3hu60oxJZCWMx36FIJUqzuXucoAXv2AlmWPn2YyM1B1ramOn8f0z1sBPBVzwuZzsOF78Ih9fKCFxUAAvFuFzOZF+cZcdUw0z5cvW+g/5s6b80CCH98+9mtLMYTuxqsQzeYzH9gEAU4FerE4M6w9pOdMbB4imRPb/hUcezD/2VBzTbnixCP+rXaDOfS8nc5jbOgQUgW1GblsWrCCVMB7bRyJbgJtzYP6RB7PBfv1hjGjqGHNbWWYNoxNDliw7LxYxviaHUSYDLiyPDZyznIJUgv+XXQhSyVL52l5JPZFHU8eY3vhkSqxa2l2+Sv1+BMEQpBJi6ZOKMdPyFQ2izwb7sTQ2AGjiiVbRCnUzcruuUKE0HJuR2+z/s1uHzGqZYXH7iFm1akKF0vBorWKrUUWmWu9W02wv7PwTIaoSS59CkEqI+HtYN1uQSohnzvSHXglmg/2swscz+Zrjv2sovjtCIlsAAC...'

const defaultTextLayer = (): TextLayer => ({
  text: '', size: 24, opacity: 100, pos: 'br',
  color: '#FFFFFF', bold: false, offsetX: 0, offsetY: 0,
})

const defaultSettings = (): CustomSetting => ({
  posH: 'mc', posV: 'mc', bgColor: 'auto',
  brightness: 100, contrast: 100, saturation: 100, imgOpacity: 100, imgZoom: 100,
  textLayers: [defaultTextLayer()],
})

export default function KvResizer() {
  const [srcImage, setSrcImage] = useState<HTMLImageElement | null>(null)
  const [srcDataUrl, setSrcDataUrl] = useState<string>('')
  const [previewMeta, setPreviewMeta] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cropMode, setCropMode] = useState<CropMode>('contain')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [currentCh, setCurrentCh] = useState('all')
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetIdx, setSheetIdx] = useState(0)
  const [scopeAll, setScopeAll] = useState(false)
  const [activeLayerIdx, setActiveLayerIdx] = useState(0)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [dragover, setDragover] = useState(false)
  const [fileKey, setFileKey] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [customSettings, setCustomSettings] = useState<Record<string, CustomSetting>>({})

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }, [])

  const getSettings = useCallback((id: string): CustomSetting => {
    return customSettings[id] ?? defaultSettings()
  }, [customSettings])

  const setSettings = useCallback((id: string, s: CustomSetting) => {
    setCustomSettings(prev => ({ ...prev, [id]: s }))
  }, [])

  const loadImageFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      const img = new Image()
      img.onload = () => {
        setSrcImage(img)
        setSrcDataUrl(dataUrl)
        setPreviewMeta(`${img.naturalWidth} × ${img.naturalHeight}px · ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [])

  const removeImage = useCallback(() => {
    setSrcImage(null)
    setSrcDataUrl('')
    setPreviewMeta('')
    setFileKey(k => k + 1)
  }, [])

  const togglePreset = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id); else next.delete(id)
      return next
    })
  }, [])

  const sheetPresets = PRESETS.filter(p => selectedIds.has(p.id))

  const triggerDownload = useCallback((dataUrl: string, filename: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }, [])

  const downloadOne = useCallback(async (preset: Preset, s?: CustomSetting) => {
    if (!srcImage) return
    const filename = `larosee_kv_${preset.id}_${preset.w}x${preset.h}.${EXT[outputFormat]}`

    if (!s && cropMode === 'ai-expand') {
      setAiProcessing(true)
      showToast(`${preset.name} AI 처리 중...`)
      try {
        const dataUrl = await aiExpandImage(srcImage, preset.w, preset.h)
        triggerDownload(dataUrl, filename)
        showToast(`${preset.name} 저장 완료`)
      } catch (e: unknown) {
        showToast(`오류: ${e instanceof Error ? e.message : 'AI 처리 실패'}`)
      } finally {
        setAiProcessing(false)
      }
      return
    }

    const canvas = document.createElement('canvas')
    if (s) {
      drawImageCustom(canvas, srcImage, preset.w, preset.h, s)
    } else {
      drawImage(canvas, srcImage, preset.w, preset.h, cropMode)
    }
    canvas.toBlob(blob => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
      showToast(`${preset.name} 저장 완료`)
    }, MIME[outputFormat], 0.92)
  }, [srcImage, cropMode, outputFormat, showToast, triggerDownload])

  const handleExport = useCallback(async () => {
    if (!srcImage || sheetOpen) return
    setSheetOpen(true)
  }, [srcImage, sheetOpen])

  const handleSheetConfirm = useCallback(async () => {
    setSheetOpen(false)
    setExporting(true)
    let done = 0
    for (const p of sheetPresets) {
      const s = getSettings(p.id)
      const filename = `larosee_kv_${p.id}_${p.w}x${p.h}.${EXT[outputFormat]}`

      if (cropMode === 'ai-expand') {
        showToast(`AI 처리 중... (${done + 1}/${sheetPresets.length})`)
        try {
          const dataUrl = await aiExpandImage(srcImage!, p.w, p.h)
          const a = document.createElement('a')
          a.href = dataUrl
          a.download = filename
          a.click()
        } catch (e: unknown) {
          showToast(`오류: ${e instanceof Error ? e.message : 'AI 처리 실패'}`)
        }
        done++
        await new Promise(r => setTimeout(r, 300))
        continue
      }

      await new Promise<void>(resolve => {
        const canvas = document.createElement('canvas')
        drawImageCustom(canvas, srcImage!, p.w, p.h, s)
        canvas.toBlob(blob => {
          if (!blob) { resolve(); return }
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = filename
          a.click()
          URL.revokeObjectURL(a.href)
          done++
          setTimeout(resolve, 150)
        }, MIME[outputFormat], 0.92)
      })
    }
    setExporting(false)
    showToast(`${sheetPresets.length}개 파일 내보내기 완료`)
  }, [sheetPresets, srcImage, getSettings, outputFormat, showToast, cropMode])

  const actionBarVisible = !!(srcImage && selectedIds.size > 0)

  const filteredPresets = currentCh === 'all' ? PRESETS : PRESETS.filter(p => p.ch === currentCh)

  return (
    <>
      <Header logoSrc={LOGO_B64} />

      {/* 탭 */}
      <nav className="tabs">
        {(['upload', 'channel', 'preview'] as const).map(tab => (
          <button
            key={tab}
            className={`tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'upload' ? '비주얼' : tab === 'channel' ? '채널 선택' : '내보내기'}
          </button>
        ))}
      </nav>

      {/* 탭 1: 업로드 */}
      <div className={`panel${activeTab === 'upload' ? ' active' : ''}`} id="tab-upload">
        <div className="upload-panel">
          <div
            className={`upload-zone${srcImage ? ' has-image' : ''}${dragover ? ' dragover' : ''}`}
            onClick={() => !srcImage && document.getElementById('fileInput')?.click()}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => {
              e.preventDefault(); setDragover(false)
              if (e.dataTransfer.files[0]) loadImageFile(e.dataTransfer.files[0])
            }}
          >
            <input
              key={fileKey}
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              onChange={e => e.target.files?.[0] && loadImageFile(e.target.files[0])}
            />
            {!srcImage ? (
              <div>
                <div className="upload-title">Upload Key Visual</div>
                <div className="upload-hint">JPG · PNG · WEBP<br />Drag or tap to select</div>
              </div>
            ) : (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={srcDataUrl} className="preview-img" alt="preview" />
                <div className="preview-bar">
                  <span className="preview-meta">{previewMeta}</span>
                  <button
                    className="remove-btn"
                    onClick={e => { e.stopPropagation(); removeImage() }}
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 출력 포맷 */}
          <div className="setting-block">
            <div className="setting-head">출력 포맷</div>
            <div className="chip-row">
              {(['jpeg', 'png', 'webp', 'pop_a3'] as const).map(fmt => (
                <button
                  key={fmt}
                  className={`chip${outputFormat === fmt ? ' active' : ''}`}
                  onClick={() => setOutputFormat(fmt)}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt === 'pop_a3' ? 'POP A3' : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 비율 변환 방식 */}
          <div className="setting-block">
            <div className="setting-head">비율 변환 방식</div>
            <div className="crop-rows">
              <label className="crop-row">
                <input type="radio" name="crop" value="contain" checked={cropMode === 'contain'} onChange={() => setCropMode('contain')} />
                <div>
                  <div className="crop-label">이미지 보존 <span style={{ fontSize: 10, color: 'var(--rose-deep)', fontWeight: 500 }}>권장</span></div>
                  <div className="crop-desc">이미지 전체 보존, 여백은 배경색으로 자연스럽게 채움</div>
                </div>
              </label>
              <label className="crop-row">
                <input type="radio" name="crop" value="ai-expand" checked={cropMode === 'ai-expand'} onChange={() => setCropMode('ai-expand')} />
                <div>
                  <div className="crop-label">
                    AI 배경 확장
                    <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, marginLeft: 6, background: 'rgba(124,58,237,0.1)', padding: '1px 6px', borderRadius: 4 }}>AI</span>
                  </div>
                  <div className="crop-desc">비율이 바뀌는 영역을 AI가 이미지에 맞게 자연스럽게 생성</div>
                  {cropMode === 'ai-expand' && (
                    <div style={{ fontSize: 10, color: '#7c3aed', marginTop: 4 }}>
                      .env.local에 STABILITY_API_KEY 필요
                    </div>
                  )}
                </div>
              </label>
              <label className="crop-row">
                <input type="radio" name="crop" value="stretch" checked={cropMode === 'stretch'} onChange={() => setCropMode('stretch')} />
                <div>
                  <div className="crop-label">늘리기</div>
                  <div className="crop-desc">이미지를 프레임에 맞게 늘림 (비율 변형)</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 2: 채널 선택 */}
      <div className={`panel${activeTab === 'channel' ? ' active' : ''}`} id="tab-channel">
        <div className="channel-panel">
          <div className="ch-scroll">
            {['all', 'web', 'online', 'offline', 'sns', 'ad'].map(ch => (
              <button
                key={ch}
                className={`ch-pill${currentCh === ch ? ' active' : ''}`}
                onClick={() => setCurrentCh(ch)}
              >
                {CH_LABELS[ch] ?? ch}
              </button>
            ))}
          </div>
          <div className="sel-bar">
            <span>{selectedIds.size}개 선택</span>
            <div className="sel-actions">
              <button className="sel-btn" onClick={() => {
                setSelectedIds(prev => {
                  const next = new Set(prev)
                  filteredPresets.forEach(p => next.add(p.id))
                  return next
                })
              }}>전체 선택</button>
              <button className="sel-btn" onClick={() => {
                setSelectedIds(prev => {
                  const next = new Set(prev)
                  filteredPresets.forEach(p => next.delete(p.id))
                  return next
                })
              }}>해제</button>
            </div>
          </div>
          <div className="preset-list">
            {(currentCh === 'all' ? CH_ORDER : [currentCh] as const).map(ch => {
              const items = PRESETS.filter(p => p.ch === ch)
              if (!items.length) return null
              return (
                <div key={ch} className="ch-group">
                  <div className="ch-group-title">{CH_LABELS[ch]}</div>
                  <div className="ch-group-items">
                    {items.map(preset => (
                      <div
                        key={preset.id}
                        className={`preset-item${selectedIds.has(preset.id) ? ' selected' : ''}`}
                        onClick={() => togglePreset(preset.id, !selectedIds.has(preset.id))}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(preset.id)}
                          onChange={e => togglePreset(preset.id, e.target.checked)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="preset-info">
                          <div className="preset-name">{preset.name}</div>
                          <div className="preset-dim">
                            {preset.w} × {preset.h}px
                            {preset.url && <> · <span style={{ color: 'var(--rose-deep)' }}>{preset.url}</span></>}
                          </div>
                        </div>
                        <span className="preset-ratio">{preset.ratio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 탭 3: 미리보기 */}
      <div className={`panel${activeTab === 'preview' ? ' active' : ''}`} id="tab-preview">
        <div className="preview-panel-wrap">
          {(!srcImage || selectedIds.size === 0) ? (
            <div className="preview-empty">
              <div className="preview-empty-icon">✦</div>
              <div className="preview-empty-title">아직 선택이 없어요</div>
              <div className="preview-empty-hint">비주얼을 올리고 채널을 선택하면 여기에 표시돼요</div>
            </div>
          ) : (
            <>
              {CH_ORDER.map(ch => {
                const group = PRESETS.filter(p => p.ch === ch && selectedIds.has(p.id))
                if (!group.length) return null
                return (
                  <div key={ch}>
                    <div className="preview-section-title">{CH_LABELS[ch]}</div>
                    <div className="preview-grid">
                      {group.map(preset => (
                        <PreviewCard
                          key={preset.id}
                          preset={preset}
                          srcImage={srcImage}
                          cropMode={cropMode}
                          onDownload={() => downloadOne(preset)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* 하단 액션바 */}
      <div className={`action-bar${actionBarVisible ? ' visible' : ''}`}>
        <div className="action-info">
          <div className="action-count"><span>{selectedIds.size}</span>개 채널 준비됨</div>
          <div className="action-hint">탭해서 전체 다운로드</div>
        </div>
        <button
          className="btn-export"
          disabled={exporting || aiProcessing}
          onClick={handleExport}
        >
          {exporting ? (cropMode === 'ai-expand' ? 'AI 처리 중...' : '내보내는 중...') : aiProcessing ? 'AI 처리 중...' : '⬇ 내보내기'}
        </button>
      </div>

      {/* 내보내기 시트 */}
      {sheetOpen && srcImage && (
        <ExportSheet
          presets={sheetPresets}
          srcImage={srcImage}
          getSettings={getSettings}
          setSettings={setSettings}
          onClose={() => setSheetOpen(false)}
          onConfirm={handleSheetConfirm}
          defaultTextLayer={defaultTextLayer}
          defaultSettings={defaultSettings}
        />
      )}

      {/* 토스트 */}
      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </>
  )
}

// ── 미리보기 카드 (캔버스 렌더) ──
function PreviewCard({
  preset, srcImage, cropMode, onDownload,
}: {
  preset: Preset
  srcImage: HTMLImageElement
  cropMode: CropMode
  onDownload: () => void | Promise<void>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const MAX = 160
  const s = Math.min(MAX / preset.w, MAX / preset.h, 1)
  const pw = Math.round(preset.w * s)
  const ph = Math.round(preset.h * s)

  useEffect(() => {
    if (canvasRef.current) {
      // AI expand 미리보기는 contain 방식으로 표시 (실제 AI는 다운로드 시 적용)
      const previewMode = cropMode === 'ai-expand' ? 'contain' : cropMode
      drawImage(canvasRef.current, srcImage, pw, ph, previewMode)
    }
  }, [srcImage, pw, ph, cropMode])

  return (
    <div className="pv-card">
      <div className="pv-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div className="pv-body">
        <div className="pv-ch">{CH_LABELS[preset.ch]}</div>
        <div className="pv-name">{preset.name}</div>
        <div className="pv-dim">{preset.w} × {preset.h}px</div>
        <button className="pv-dl" onClick={onDownload}>
          {cropMode === 'ai-expand' ? '✦ AI 저장' : '⬇ 개별 저장'}
        </button>
      </div>
    </div>
  )
}
