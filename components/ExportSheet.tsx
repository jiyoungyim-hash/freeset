'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Preset, CustomSetting, TextLayer } from '@/lib/types'
import { drawImageCustom } from '@/lib/canvas'

const POS_BTNS = [
  { pos: 'tl', label: '↖' }, { pos: 'tc', label: '↑' }, { pos: 'tr', label: '↗' },
  { pos: 'ml', label: '←' }, { pos: 'mc', label: '·' }, { pos: 'mr', label: '→' },
  { pos: 'bl', label: '↙' }, { pos: 'bc', label: '↓' }, { pos: 'br', label: '↘' },
]

const BG_SWATCHES = [
  { color: 'auto', style: { background: 'linear-gradient(135deg,#f9f5f0,#d4c4bc)' }, title: '자동(엣지색)' },
  { color: '#FFFFFF', style: { background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }, title: '흰색' },
  { color: '#000000', style: { background: '#000000', border: '1px solid rgba(255,255,255,0.15)' }, title: '검정' },
  { color: '#FAF8F5', style: { background: '#FAF8F5', border: '1px solid rgba(255,255,255,0.2)' }, title: '아이보리' },
  { color: '#F2EDE8', style: { background: '#F2EDE8', border: '1px solid rgba(255,255,255,0.2)' }, title: '스톤' },
  { color: '#009CDE', style: { background: '#009CDE' }, title: '라로제 블루' },
  { color: '#C8A49A', style: { background: '#C8A49A' }, title: '라로제 로즈' },
]

const TEXT_POS_BTNS = [
  { pos: 'tl', label: '좌상' }, { pos: 'tc', label: '상단' }, { pos: 'tr', label: '우상' },
  { pos: 'br', label: '우하' }, { pos: 'bc', label: '하단' }, { pos: 'bl', label: '좌하' },
  { pos: 'mc', label: '중앙' },
]

const WM_SWATCHES = [
  { color: '#FFFFFF', style: { background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }, title: '흰색' },
  { color: '#000000', style: { background: '#000000', border: '1px solid rgba(255,255,255,0.15)' }, title: '검정' },
  { color: '#009CDE', style: { background: '#009CDE' }, title: '라로제 블루' },
  { color: '#C8A49A', style: { background: '#C8A49A' }, title: '라로제 로즈' },
  { color: '#FAF8F5', style: { background: '#FAF8F5', border: '1px solid rgba(255,255,255,0.2)' }, title: '아이보리' },
]

interface Props {
  presets: Preset[]
  srcImage: HTMLImageElement
  getSettings: (id: string) => CustomSetting
  setSettings: (id: string, s: CustomSetting) => void
  onClose: () => void
  onConfirm: () => void
  defaultTextLayer: () => TextLayer
  defaultSettings: () => CustomSetting
}

export default function ExportSheet({
  presets, srcImage, getSettings, setSettings, onClose, onConfirm,
  defaultTextLayer, defaultSettings,
}: Props) {
  const [idx, setIdx] = useState(0)
  const [scopeAll, setScopeAll] = useState(false)
  const [activeLayerIdx, setActiveLayerIdx] = useState(0)
  const [, forceUpdate] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const preset = presets[idx]
  const s = getSettings(preset.id)

  const mutate = useCallback((updater: (s: CustomSetting) => void) => {
    const ids = scopeAll ? presets.map(p => p.id) : [preset.id]
    ids.forEach(id => {
      const copy: CustomSetting = JSON.parse(JSON.stringify(getSettings(id)))
      updater(copy)
      setSettings(id, copy)
    })
    forceUpdate(n => n + 1)
  }, [scopeAll, presets, preset.id, getSettings, setSettings])

  const mutateLayer = useCallback((updater: (l: TextLayer) => void) => {
    mutate(s => {
      const li = Math.min(activeLayerIdx, s.textLayers.length - 1)
      updater(s.textLayers[li])
    })
  }, [mutate, activeLayerIdx])

  // draw preview canvas
  useEffect(() => {
    if (!canvasRef.current) return
    const MAX = 280
    const scale = Math.min(MAX / preset.w, MAX / preset.h, 1)
    const pw = Math.round(preset.w * scale)
    const ph = Math.round(preset.h * scale)
    drawImageCustom(canvasRef.current, srcImage, pw, ph, s)
  })

  const activeLayer = s.textLayers[Math.min(activeLayerIdx, s.textLayers.length - 1)]

  const posKey = (posH: string, posV: string) => {
    const h = posH === 'ml' ? 'l' : posH === 'mr' ? 'r' : 'c'
    const v = posV === 'tc' ? 't' : posV === 'bc' ? 'b' : 'm'
    return v + h
  }

  return (
    <>
      <div className="sheet-overlay open" onClick={onClose} />
      <div className="custom-sheet open">
        <div className="sheet-header">
          <div className="sheet-title">내보내기 설정</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        <div className="sheet-split">
          {/* 미리보기 */}
          <div className="sheet-preview-pane">
            <div className="sheet-canvas-center">
              <canvas ref={canvasRef} />
            </div>
            <div className="custom-preview-nav">
              <div>
                <div className="custom-preset-name">{preset.name}</div>
                <div className="custom-preset-dim">{preset.w} × {preset.h}px</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="nav-counter">{idx + 1} / {presets.length}</span>
                <div className="nav-btns">
                  <button className="nav-btn" onClick={() => setIdx((idx - 1 + presets.length) % presets.length)}>‹</button>
                  <button className="nav-btn" onClick={() => setIdx((idx + 1) % presets.length)}>›</button>
                </div>
              </div>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="sheet-controls-pane">

            {/* 이미지 위치 */}
            <div className="ctrl-section">
              <div className="ctrl-label">이미지 위치</div>
              <div className="ctrl-card">
                <div className="pos-grid">
                  {POS_BTNS.map(({ pos, label }) => {
                    const active = posKey(s.posH, s.posV) === pos
                    return (
                      <button
                        key={pos}
                        className={`pos-btn${active ? ' active' : ''}`}
                        onClick={() => {
                          const pH = pos[1] === 'l' ? 'ml' : pos[1] === 'r' ? 'mr' : 'mc'
                          const pV = pos[0] === 't' ? 'tc' : pos[0] === 'b' ? 'bc' : 'mc'
                          mutate(s => { s.posH = pH; s.posV = pV })
                        }}
                      >{label}</button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 배경색 */}
            <div className="ctrl-section">
              <div className="ctrl-label">여백 배경색</div>
              <div className="ctrl-card">
                <div className="bg-color-row">
                  {BG_SWATCHES.map(sw => (
                    <div
                      key={sw.color}
                      className={`color-swatch${s.bgColor === sw.color ? ' active' : ''}`}
                      style={sw.style as React.CSSProperties}
                      title={sw.title}
                      onClick={() => mutate(s => { s.bgColor = sw.color })}
                    />
                  ))}
                  <div className="color-custom" title="직접 선택">
                    🎨<input type="color" defaultValue="#ffffff"
                      onChange={e => mutate(s => { s.bgColor = e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* 이미지 보정 */}
            <div className="ctrl-section">
              <div className="ctrl-label">이미지 보정</div>
              <div className="ctrl-card">
                {([
                  { key: 'brightness', label: '밝기', min: 50, max: 150 },
                  { key: 'contrast', label: '대비', min: 50, max: 150 },
                  { key: 'saturation', label: '채도', min: 0, max: 200 },
                  { key: 'imgOpacity', label: '투명도', min: 10, max: 100, step: 5 },
                  { key: 'imgZoom', label: '줌', min: 50, max: 200 },
                ] as const).map(({ key, label, min, max, ...rest }) => (
                  <div key={key} className="slider-row">
                    <label>{label}</label>
                    <input type="range" min={min} max={max}
                      value={s[key] ?? 100}
                      step={'step' in rest ? (rest as any).step : 1}
                      onChange={e => mutate(s => { (s as any)[key] = Number(e.target.value) })}
                    />
                    <span className="slider-val">{s[key] ?? 100}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 텍스트 레이어 */}
            <div className="ctrl-section">
              <div className="ctrl-label">텍스트 레이어</div>
              <div className="ctrl-card">
                <div className="text-layer-list">
                  {s.textLayers.map((layer, i) => (
                    <div
                      key={i}
                      className={`text-layer-item${i === activeLayerIdx ? ' active' : ''}`}
                      onClick={() => setActiveLayerIdx(i)}
                    >
                      <span className="text-layer-num">{i + 1}</span>
                      <span className="text-layer-preview">
                        {layer.text ? layer.text.replace(/\n/g, ' ↵ ') : '(빈 텍스트)'}
                      </span>
                      {s.textLayers.length > 1 && (
                        <button
                          className="text-layer-del"
                          onClick={e => {
                            e.stopPropagation()
                            mutate(s => {
                              if (s.textLayers.length > 1) s.textLayers.splice(i, 1)
                            })
                            if (activeLayerIdx >= s.textLayers.length - 1)
                              setActiveLayerIdx(Math.max(0, s.textLayers.length - 2))
                          }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="btn-add-layer"
                  onClick={() => {
                    mutate(s => s.textLayers.push(defaultTextLayer()))
                    setActiveLayerIdx(s.textLayers.length)
                  }}
                >+ 텍스트 추가</button>

                {/* 활성 레이어 편집 */}
                {activeLayer && (
                  <div className="active-layer-controls">
                    <div className="text-input-wrap">
                      <textarea
                        placeholder={"텍스트를 입력하세요\n줄바꿈(Enter)을 사용할 수 있어요"}
                        maxLength={300}
                        rows={3}
                        value={activeLayer.text}
                        onChange={e => mutateLayer(l => { l.text = e.target.value })}
                      />
                    </div>
                    <div className="slider-row">
                      <label>크기</label>
                      <input type="range" min={10} max={120} value={activeLayer.size}
                        onChange={e => mutateLayer(l => { l.size = Number(e.target.value) })} />
                      <span className="slider-val">{activeLayer.size}px</span>
                    </div>
                    <div className="slider-row">
                      <label>투명도</label>
                      <input type="range" min={5} max={100} step={5} value={activeLayer.opacity}
                        onChange={e => mutateLayer(l => { l.opacity = Number(e.target.value) })} />
                      <span className="slider-val">{activeLayer.opacity}%</span>
                    </div>

                    <div className="ctrl-sub-label">색상</div>
                    <div className="bg-color-row">
                      {WM_SWATCHES.map(sw => (
                        <div
                          key={sw.color}
                          className={`color-swatch${activeLayer.color === sw.color ? ' active' : ''}`}
                          style={sw.style as React.CSSProperties}
                          title={sw.title}
                          onClick={() => mutateLayer(l => { l.color = sw.color })}
                        />
                      ))}
                      <div className="color-custom" title="직접 선택">
                        🎨<input type="color" defaultValue="#ffffff"
                          onChange={e => mutateLayer(l => { l.color = e.target.value })} />
                      </div>
                    </div>

                    <div className="ctrl-sub-label">굵기</div>
                    <div className="scope-row">
                      <button className={`scope-btn${!activeLayer.bold ? ' active' : ''}`}
                        onClick={() => mutateLayer(l => { l.bold = false })}>보통</button>
                      <button className={`scope-btn${activeLayer.bold ? ' active' : ''}`}
                        onClick={() => mutateLayer(l => { l.bold = true })}>굵게</button>
                    </div>

                    <div className="ctrl-sub-label">위치</div>
                    <div className="text-pos-row">
                      {TEXT_POS_BTNS.map(({ pos, label }) => (
                        <button
                          key={pos}
                          className={`text-pos-btn${activeLayer.pos === pos ? ' active' : ''}`}
                          onClick={() => mutateLayer(l => { l.pos = pos })}
                        >{label}</button>
                      ))}
                    </div>

                    <div className="ctrl-sub-label" style={{ marginTop: 4 }}>수동 위치 조정</div>
                    <div className="slider-row">
                      <label>X</label>
                      <input type="range" min={-500} max={500} value={activeLayer.offsetX}
                        onChange={e => mutateLayer(l => { l.offsetX = Number(e.target.value) })} />
                      <span className="slider-val">{activeLayer.offsetX}px</span>
                    </div>
                    <div className="slider-row">
                      <label>Y</label>
                      <input type="range" min={-500} max={500} value={activeLayer.offsetY}
                        onChange={e => mutateLayer(l => { l.offsetY = Number(e.target.value) })} />
                      <span className="slider-val">{activeLayer.offsetY}px</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 적용 범위 */}
            <div className="ctrl-section">
              <div className="ctrl-label">설정 적용 범위</div>
              <div className="scope-row">
                <button className={`scope-btn${!scopeAll ? ' active' : ''}`}
                  onClick={() => setScopeAll(false)}>현재 채널만</button>
                <button className={`scope-btn${scopeAll ? ' active' : ''}`}
                  onClick={() => setScopeAll(true)}>전체 채널 일괄</button>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div style={{ display: 'flex', gap: 8, paddingBottom: 'calc(var(--safe-bottom) + 4px)', marginTop: 4 }}>
              <button className="btn-reset" onClick={() => {
                const ids = scopeAll ? presets.map(p => p.id) : [preset.id]
                ids.forEach(id => setSettings(id, defaultSettings()))
                setActiveLayerIdx(0)
                forceUpdate(n => n + 1)
              }}>초기화</button>
              <button className="btn-confirm" onClick={onConfirm}>⬇ 이 설정으로 내보내기</button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
