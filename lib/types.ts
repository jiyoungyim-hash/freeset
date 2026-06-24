export interface Preset {
  id: string;
  name: string;
  w: number;
  h: number;
  ch: string;
  icon: string;
  ratio: string;
  url?: string;
}

export interface TextLayer {
  text: string;
  size: number;
  opacity: number;
  pos: string;
  color: string;
  bold: boolean;
  offsetX: number;
  offsetY: number;
}

export interface CustomSetting {
  posH: string;
  posV: string;
  bgColor: string;
  brightness: number;
  contrast: number;
  saturation: number;
  imgOpacity: number;
  imgZoom: number;
  textLayers: TextLayer[];
}

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'pop_a3';
export type CropMode = 'contain' | 'stretch' | 'smart-fill';
export type ActiveTab = 'upload' | 'channel' | 'preview';
