import type { Preset } from './types';

export const PRESETS: Preset[] = [
  // 온라인몰
  { id: 'ss_main',      name: '스마트스토어 대표이미지',  w: 1000, h: 1000, ch: 'online', icon: '🛒', ratio: '1:1' },
  { id: 'ss_detail',    name: '스마트스토어 상세 배너',    w: 860,  h: 430,  ch: 'online', icon: '🛒', ratio: '2:1' },
  { id: 'coupang_main', name: '쿠팡 대표이미지',           w: 1000, h: 1000, ch: 'online', icon: '🛒', ratio: '1:1' },
  { id: 'coupang_ban',  name: '쿠팡 브랜드관 배너',        w: 1920, h: 400,  ch: 'online', icon: '🛒', ratio: 'Wide' },
  { id: 'oliveyoung',   name: '올리브영 메인 배너',        w: 1920, h: 600,  ch: 'online', icon: '🛒', ratio: 'Wide' },
  { id: 'oliveyoung_s', name: '올리브영 상품이미지',       w: 1200, h: 1200, ch: 'online', icon: '🛒', ratio: '1:1' },
  { id: 'musinsa_main', name: '무신사 브랜드관 배너',      w: 1920, h: 640,  ch: 'online', icon: '🛒', ratio: '3:1' },
  { id: 'kakao_shop',   name: '카카오쇼핑 대표이미지',     w: 800,  h: 800,  ch: 'online', icon: '🛒', ratio: '1:1' },
  { id: 'naver_place',  name: '네이버 플레이스 커버',       w: 1080, h: 566,  ch: 'online', icon: '🛒', ratio: '16:9' },

  // 오프라인
  { id: 'dept_main',    name: '백화점 전시 패널 세로',     w: 2480, h: 3508, ch: 'offline', icon: '🏪', ratio: 'A4V' },
  { id: 'dept_wide',    name: '백화점 전시 패널 가로',     w: 3508, h: 2480, ch: 'offline', icon: '🏪', ratio: 'A4H' },
  { id: 'dept_banner',  name: '매장 행잉 배너 (60×180)',   w: 1772, h: 5315, ch: 'offline', icon: '🏪', ratio: '1:3' },
  { id: 'dept_pop',     name: 'POP 세로형 (A3)',           w: 3508, h: 4961, ch: 'offline', icon: '🏪', ratio: 'A3V' },
  { id: 'counter_top',  name: '카운터 탑 배너 (10×20cm)',  w: 1181, h: 2362, ch: 'offline', icon: '🏪', ratio: '1:2' },
  { id: 'window',       name: '쇼윈도우 시트 (100×150)',   w: 2953, h: 4429, ch: 'offline', icon: '🏪', ratio: '2:3' },

  // SNS
  { id: 'ig_feed_sq',   name: '인스타그램 피드 (정방)',    w: 1080, h: 1080, ch: 'sns', icon: '📸', ratio: '1:1' },
  { id: 'ig_feed_pt',   name: '인스타그램 피드 (세로)',    w: 1080, h: 1350, ch: 'sns', icon: '📸', ratio: '4:5' },
  { id: 'ig_story',     name: '인스타그램 스토리/릴스',   w: 1080, h: 1920, ch: 'sns', icon: '📸', ratio: '9:16' },
  { id: 'ig_cover',     name: '인스타그램 프로필 커버',    w: 1080, h: 566,  ch: 'sns', icon: '📸', ratio: '16:9' },
  { id: 'ka_channel',   name: '카카오채널 커버',           w: 1200, h: 675,  ch: 'sns', icon: '💛', ratio: '16:9' },
  { id: 'ka_post',      name: '카카오채널 포스트',         w: 800,  h: 800,  ch: 'sns', icon: '💛', ratio: '1:1' },
  { id: 'ka_story',     name: '카카오스토리',              w: 1080, h: 1080, ch: 'sns', icon: '💛', ratio: '1:1' },
  { id: 'naver_blog',   name: '네이버 블로그 썸네일',      w: 1200, h: 900,  ch: 'sns', icon: '🟢', ratio: '4:3' },
  { id: 'naver_post',   name: '네이버 포스트 커버',        w: 1080, h: 607,  ch: 'sns', icon: '🟢', ratio: '16:9' },
  { id: 'yt_thumb',     name: '유튜브 썸네일',             w: 1280, h: 720,  ch: 'sns', icon: '▶️', ratio: '16:9' },
  { id: 'yt_banner',    name: '유튜브 채널 아트',          w: 2560, h: 1440, ch: 'sns', icon: '▶️', ratio: '16:9' },

  // 공식홈페이지
  { id: 'web_main_banner',  name: '메인 풀배너',            w: 1920, h: 1080, ch: 'web', icon: '🌐', ratio: '16:9', url: 'larosee.co.kr' },
  { id: 'web_wide_banner',  name: '와이드 섹션 배너',       w: 1920, h: 604,  ch: 'web', icon: '🌐', ratio: 'Wide', url: 'larosee.co.kr' },
  { id: 'web_brand_photo',  name: '브랜드·매장 사진',       w: 1920, h: 1280, ch: 'web', icon: '🌐', ratio: '3:2',  url: 'larosee.co.kr' },
  { id: 'web_story_banner', name: '스토리 배너',            w: 1600, h: 480,  ch: 'web', icon: '🌐', ratio: '10:3', url: 'larosee.co.kr' },
  { id: 'web_sub_banner',   name: '서브 섹션 배너',         w: 1280, h: 720,  ch: 'web', icon: '🌐', ratio: '16:9', url: 'larosee.co.kr' },
  { id: 'web_card_banner',  name: '콘텐츠 카드 배너',       w: 1000, h: 500,  ch: 'web', icon: '🌐', ratio: '2:1',  url: 'larosee.co.kr' },
  { id: 'web_benefit_bar',  name: '멤버십·혜택 배너',       w: 1080, h: 274,  ch: 'web', icon: '🌐', ratio: '4:1',  url: 'larosee.co.kr' },

  // 광고매체
  { id: 'disp_300x250',  name: '디스플레이 광고 (300×250)', w: 300,  h: 250,  ch: 'ad', icon: '📺', ratio: '6:5' },
  { id: 'disp_728x90',   name: '디스플레이 광고 (728×90)',  w: 728,  h: 90,   ch: 'ad', icon: '📺', ratio: '8:1' },
  { id: 'disp_320x100',  name: '모바일 배너 (320×100)',     w: 320,  h: 100,  ch: 'ad', icon: '📺', ratio: '16:5' },
  { id: 'disp_970x250',  name: '빌보드 광고 (970×250)',     w: 970,  h: 250,  ch: 'ad', icon: '📺', ratio: 'Wide' },
  { id: 'kakao_moment',  name: '카카오모먼트 네이티브',      w: 800,  h: 800,  ch: 'ad', icon: '📺', ratio: '1:1' },
  { id: 'naver_gfa',     name: '네이버 GFA 피드형',         w: 1200, h: 628,  ch: 'ad', icon: '📺', ratio: '~2:1' },
  { id: 'outdoor_6x2',   name: '옥외광고 현수막 (6×2m)',    w: 3543, h: 1181, ch: 'ad', icon: '📺', ratio: '3:1' },
  { id: 'outdoor_mega',  name: '옥외광고 메가보드',         w: 5906, h: 3937, ch: 'ad', icon: '📺', ratio: '3:2' },
];

export const CH_LABELS: Record<string, string> = {
  all:     '전체',
  online:  '브랜드스토어',
  web:     '공식홈페이지',
  offline: '오프라인',
  sns:     'SNS',
  ad:      '광고매체',
};

export const CH_ORDER = ['web', 'online', 'offline', 'sns', 'ad'] as const;

export const MIME: Record<string, string> = {
  jpeg:   'image/jpeg',
  png:    'image/png',
  webp:   'image/webp',
  pop_a3: 'image/jpeg',
};

export const EXT: Record<string, string> = {
  jpeg:   'jpg',
  png:    'png',
  webp:   'webp',
  pop_a3: 'jpg',
};
