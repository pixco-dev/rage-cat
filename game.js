(() => {
  "use strict";

  const MAX_WEEKS = 12;
  const AUTH_STORE = "bull-lab-accounts-v1";
  const SESSION_STORE = "bull-lab-session-v1";
  const WALLET_STORE = "bull-lab-wallets-v1";
  const AD_COST = 18;
  const MIN_SEED = 80;
  const MIN_LEND_SEED = 40;
  const MIN_BORROW = 10;
  const MAX_BORROW = 250;
  const MIN_LEND_RATE = 1;
  const MAX_LEND_RATE = 15;
  const FIREBASE_WORLD_PATH = "bull-lab/world";
  const CLIENT_BUILD = "20260904d";
  const BAN_PATH = "bull-lab/bans";
  const HALT_PATH = "bull-lab/halt";
  const CLIMATE_PATH = "bull-lab/climate";
  const GAMBLE_PATH = "bull-lab/gamble/tables";
  const GAMBLE_SETTLE_STORE = "bull-lab-gamble-settled-v1";
  const MIN_GAMBLE_STAKE = 10;
  const GAMBLE_MAX_SEATS = 5;
  const LOTTERY_PATH = "bull-lab/lottery/current";
  const LOTTERY_CLAIM_STORE = "bull-lab-lottery-claim-v1";
  const LOTTERY_BASE_POT = 500;
  const LOTTERY_TICKET_PRICE = 100;
  const LOTTERY_MAX_TICKETS = 2;
  const PROMO_DESK_STORE = "bull-lab-promo-desk-v1";
  const PRICE_BOTS = [
    { id: "tape-1", bias: 0.18 },
    { id: "tape-2", bias: -0.14 },
    { id: "tape-3", bias: 0.04 },
    { id: "tape-4", bias: 0.1 },
    { id: "tape-5", bias: -0.12 },
  ];
  const DEVICE_STORE = "bull-lab-device-v1";
  const DEVICE_ACCOUNTS_STORE = "bull-lab-device-accounts-v1";
  const DEVICE_PATH = "bull-lab/devices";
  const ACCOUNT_PATH = "bull-lab/accounts";
  const MAX_DEVICE_ACCOUNTS = 2;
  const WEALTH_SANITY = 50000;
  const FIREBASE_PRESENCE_PATH = "bull-lab/presence";
  const FIREBASE_SETTLEMENT_PATH = "bull-lab/settlements";
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyCKiq0ickfqHqMWosW7OtLG9Pp0Ptd9CBw",
    authDomain: "bull-run-lab.firebaseapp.com",
    databaseURL: "https://bull-run-lab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bull-run-lab",
    storageBucket: "bull-run-lab.firebasestorage.app",
    messagingSenderId: "399137766633",
    appId: "1:399137766633:web:947c6b198b50b770e80478",
    measurementId: "G-4PDLRCKHD5",
  };
  const FETCH_MS = 8000;
  const POLL_MS = 8000;
  const KST_POLL_MS = 45000;
  const PRESENCE_HEARTBEAT_MS = 20000;
  const PRESENCE_STALE_MS = 70000;
  const SETTLEMENT_LOCK_MS = 60000;
  const CHAT_CAP = 50;
  const PUT_DEBOUNCE_MS = 450;
  const FIREBASE_READ_TIMEOUT_MS = 1800;
  const FIREBASE_WRITE_TIMEOUT_MS = 4500;
  const MAX_AD_IMAGE_DATA_LENGTH = 60000;
  const ACTIVITY_PASS_SCORE = 0.65;
  const TICK_MS = 1000;
  const TICK_CAP = 96;
  const LIVE_W = 640;
  const LIVE_H = 180;
  const SPARK_W = 120;
  const SPARK_H = 36;

  const PERIODS = [
    { n: 0, h: 8, m: 20, label: "장전" },
    { n: 1, h: 9, m: 20, label: "1교시" },
    { n: 2, h: 10, m: 20, label: "2교시" },
    { n: 3, h: 11, m: 20, label: "3교시" },
    { n: 4, h: 12, m: 20, label: "4교시" },
    { n: 5, h: 14, m: 0, label: "5교시" },
    { n: 6, h: 15, m: 0, label: "6교시" },
    { n: 7, h: 16, m: 0, label: "7교시" },
  ];
  const FIRST_PERIOD_N = PERIODS[0].n;
  const LAST_PERIOD_N = PERIODS[PERIODS.length - 1].n;

  const MODES = {
    rookie: { name: "연습생 모드", cash: 800, goal: 1800, research: 2, energy: 4 },
  };

  const ASSET_BLUEPRINTS = [
    { id: "tech", symbol: "KTX", name: "한빛테크", sector: "기술 · 반도체", sectorKey: "tech", price: 82, trend: .008, noise: .018, risk: 3, color: "#4b79e8", dividend: 0, float: 420 },
    { id: "bio", symbol: "BIO", name: "새봄바이오", sector: "제약 · 헬스케어", sectorKey: "bio", price: 54, trend: .004, noise: .024, risk: 4, color: "#1f9d6a", dividend: 0, float: 360 },
    { id: "energy", symbol: "NRG", name: "태양에너지", sector: "에너지 · 인프라", sectorKey: "energy", price: 71, trend: .003, noise: .016, risk: 3, color: "#ef8c3f", dividend: .01, float: 400 },
    { id: "retail", symbol: "RTL", name: "모두리테일", sector: "소비재 · 유통", sectorKey: "retail", price: 39, trend: .002, noise: .012, risk: 2, color: "#8267d9", dividend: .008, float: 480 },
    { id: "gold", symbol: "GLD", name: "금 현물 ETF", sector: "안전자산 · 원자재", sectorKey: "gold", price: 96, trend: .001, noise: .008, risk: 1, color: "#d6a52d", dividend: 0, float: 520 },
    { id: "coin", symbol: "LBC", name: "럭키비트", sector: "가상자산 · 고위험", sectorKey: "coin", price: 24, trend: 0, noise: .038, risk: 5, color: "#ef5b6f", dividend: 0, float: 300 },
  ];
  const CORE_ASSET_IDS = ASSET_BLUEPRINTS.map((item) => item.id);

  const SECTORS = [
    { key: "tech", label: "기술 · 반도체" },
    { key: "bio", label: "제약 · 헬스케어" },
    { key: "energy", label: "에너지 · 인프라" },
    { key: "retail", label: "소비재 · 유통" },
    { key: "gold", label: "안전자산 · 원자재" },
    { key: "coin", label: "가상자산 · 고위험" },
    { key: "player", label: "플레이어 · 비상장 출신" },
  ];

  const PLAYER_COLORS = ["#c45c26", "#2a6f7f", "#8b3d62", "#4a6b2f", "#6b4ea1", "#b33b3b"];
  const LOCAL_WORLD_KEY = "bull-lab-shared-world-v2";
  const KST_ENDPOINTS = [
    "https://worldtimeapi.org/api/timezone/Asia/Seoul",
    "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul",
  ];

  const AD_CLAIMS = {
    growth: "성장",
    dividend: "배당",
    stable: "안정",
    none: "메시지 없음",
  };

  const EVENTS = [
    {
      category: "정부 정책", icon: "🤖", title: "정부, 미래 산업 지원책 윤곽 공개",
      description: "정책 자금이 일부 성장 산업으로 흐를 것이라는 관측이 나왔습니다. 다만 수혜 업종을 단정하기는 이릅니다.",
      effects: { tech: .13, bio: .04, gold: -.035 },
      themes: ["정책 자금", "성장 산업"],
      note: "정부가 돈을 푸는 쪽과, 그 돈에서 소외되는 쪽을 함께 보세요.",
    },
    {
      category: "기업 공시", icon: "🧬", title: "국내 제약사, 해외 임상 결과 발표",
      description: "헬스케어 업권에서 중요한 임상 소식이 나왔습니다. 호재인지 악재인지는 세부 내용을 확인해야 합니다.",
      effects: { bio: .17, tech: .025, gold: -.015 },
      themes: ["헬스케어", "연구개발"],
      note: "바이오 뉴스는 호재와 악재 해석이 갈립니다. 확인 없이 베팅하지 마세요.",
    },
    {
      category: "국제 원자재", icon: "🛢️", title: "산유국, 생산량 조정 회의 돌입",
      description: "원유 공급이 흔들릴 수 있다는 소식입니다. 에너지와 운송·유통 비용이 동시에 주목받습니다.",
      effects: { energy: .14, retail: -.075, gold: .025 },
      themes: ["원자재", "비용 전가"],
      note: "같은 유가 뉴스도 생산자와 소비 기업에는 반대로 작용할 수 있습니다.",
    },
    {
      category: "내수 정책", icon: "🛍️", title: "소비 진작 정책, 다음 달 시행 검토",
      description: "가계 지출을 늘리려는 정책이 논의됩니다. 유통 쪽 기대와 재정 부담 우려가 섞여 있습니다.",
      effects: { retail: .14, tech: .025, gold: -.025 },
      themes: ["내수", "소비"],
      note: "지갑이 열리는 업종이 어디일지, 방어 자산 선호가 식는지 나눠 보세요.",
    },
    {
      category: "거시 경제", icon: "🔥", title: "물가 지표, 시장 예상과 어긋나",
      description: "인플레이션 경로를 다시 봐야 한다는 해석이 나왔습니다. 금리와 실물자산 논쟁이 커집니다.",
      effects: { gold: .105, energy: .07, tech: -.065, bio: -.04, coin: -.055 },
      themes: ["물가", "금리"],
      note: "성장 기대가 먼 자산과 실물에 가까운 자산의 온도 차를 의심하세요.",
    },
    {
      category: "통화 정책", icon: "🏦", title: "중앙은행, 통화 기조 변경 시사",
      description: "유동성 환경이 바뀔 수 있다는 발언이 나왔습니다. 위험자산과 안전자산의 선호가 동시에 흔들립니다.",
      effects: { tech: .095, bio: .075, coin: .085, gold: -.045, retail: .04 },
      themes: ["유동성", "위험선호"],
      note: "돈이 풀리는지 조이는지에 따라 변동성 큰 자산의 반응이 갈립니다.",
    },
    {
      category: "규제", icon: "⚖️", title: "디지털 자산 감독 강화 검토",
      description: "거래 환경이 까다로워질 수 있다는 소식입니다. 제도권 밖으로 보이던 자금의 이동이 거론됩니다.",
      effects: { coin: -.18, gold: .06, tech: -.015 },
      themes: ["규제", "디지털 자산"],
      note: "규제는 한 자산만 때리지 않습니다. 돈이 어디로 피할지 생각해 보세요.",
    },
    {
      category: "보안 사고", icon: "🕵️", title: "대형 플랫폼, 보안 이슈로 조사 착수",
      description: "IT 서비스 신뢰가 시험대에 올랐습니다. 단기 투자심리와 보안 투자 확대 이야기가 동시에 나옵니다.",
      effects: { tech: -.105, retail: -.035, gold: .04, coin: -.045 },
      themes: ["신뢰", "IT"],
      note: "기술 업종 전체가 흔들릴 수도, 일부만 맞을 수도 있습니다. 확인이 필요합니다.",
    },
    {
      category: "산업 정책", icon: "🌱", title: "친환경 전력 의무, 단계적 확대 추진",
      description: "기업 전력 조달 방식이 바뀔 수 있습니다. 발전·저장과 전력 관리 수요가 거론됩니다.",
      effects: { energy: .135, tech: .045, retail: -.015 },
      themes: ["에너지 전환", "설비"],
      note: "전력과 설비가 묶인 산업을 의심하되, 수혜 기업을 단정하지는 마세요.",
    },
    {
      category: "경기 전망", icon: "🌧️", title: "성장률 전망, 기관마다 엇갈려",
      description: "수출과 소비 둔화 가능성이 제기됐습니다. 방어 심리가 커질지는 아직 의견이 갈립니다.",
      effects: { retail: -.12, tech: -.07, bio: -.035, gold: .11, coin: -.08 },
      themes: ["경기", "방어"],
      note: "숫자가 안 좋을수록 공격과 방어를 나누는 기준이 중요해집니다.",
    },
    {
      category: "수출", icon: "🚢", title: "주요 수출 품목, 월간 실적 공개",
      description: "수출 데이터가 나왔지만 업종별 온도 차가 큽니다. 설비 가동과 전력 수요도 함께 거론됩니다.",
      effects: { tech: .14, energy: .035, retail: .015 },
      themes: ["수출", "실적"],
      note: "헤드라인 호조가 모든 종목의 호조는 아닙니다. 실적 기반인지 기대인지 가르세요.",
    },
    {
      category: "임상 뉴스", icon: "🧪", title: "신약 파이프라인, 추가 데이터 요구",
      description: "상용화 일정이 불투명해졌다는 해석과, 오히려 기회가 남았다는 해석이 충돌합니다.",
      effects: { bio: -.19, gold: .025 },
      themes: ["임상", "불확실성"],
      note: "기대가 컸던 업종일수록 작은 뉴스에도 가격이 과하게 움직일 수 있습니다.",
    },
    {
      category: "제도권 편입", icon: "🪙", title: "디지털 자산 상품, 심사 결과 임박",
      description: "기관 접근 통로가 열릴 수 있다는 관측입니다. 승인 여부와 별개로 변동성은 여전합니다.",
      effects: { coin: .2, tech: .035, gold: -.025 },
      themes: ["제도권", "디지털 자산"],
      note: "승인 기대만으로 방향이 정해지진 않습니다. 변동성부터 염두에 두세요.",
    },
    {
      category: "가상자산", icon: "💻", title: "해외 거래소, 일시 출금 지연 발생",
      description: "보관 위험이 다시 거론됩니다. 공포인지 해프닝인지는 시간이 지나야 분명해집니다.",
      effects: { coin: -.22, gold: .075, tech: -.025 },
      themes: ["보관 위험", "디지털 자산"],
      note: "공포가 번지면 안전자산으로 돈이 옮을 수 있습니다. 단정은 금물입니다.",
    },
    {
      category: "소비 트렌드", icon: "🎉", title: "대규모 쇼핑 행사, 이번 주 개막",
      description: "할인 행사가 시작됐지만 매출 증가와 마진 하락이 동시에 거론됩니다.",
      effects: { retail: .125, tech: .025, energy: -.01 },
      themes: ["유통", "소비"],
      note: "매출이 늘어도 할인 비용이 커지면 주가는 따로 움직일 수 있습니다.",
    },
    {
      category: "지정학", icon: "🚨", title: "주요 자원 지역, 긴장 고조",
      description: "공급 차질과 위험 회피 심리가 동시에 거론됩니다. 소비 기업의 비용 부담도 화제입니다.",
      effects: { energy: .14, gold: .12, retail: -.085, coin: -.045 },
      themes: ["지정학", "위험 회피"],
      note: "위험 회피 장에서는 실물과 소비의 온도가 갈릴 수 있습니다.",
    },
    {
      category: "국제 정세", icon: "🕊️", title: "분쟁 지역, 협상 진전 소식",
      description: "공급망 정상화 기대가 나왔지만 합의 지속 여부는 불투명합니다.",
      effects: { energy: -.1, gold: -.075, retail: .065, tech: .035 },
      themes: ["공급망", "위험 프리미엄"],
      note: "위험이 걷히면 실물 프리미엄과 소비 심리가 반대로 움직일 수 있습니다.",
    },
    {
      category: "환율", icon: "💵", title: "환율 급변, 수출·수입 희비 교차",
      description: "원화 가치가 크게 움직였습니다. 수출 기업과 내수 기업의 손익이 갈릴 수 있습니다.",
      effects: { tech: .055, energy: .045, retail: -.06, gold: .075 },
      themes: ["환율", "수출입"],
      note: "같은 환율도 달러 매출 기업과 수입 비용 기업에는 다르게 닿습니다.",
    },
    {
      category: "노동", icon: "✊", title: "물류 현장, 집단 행동 돌입",
      description: "배송 지연과 재고 부족 가능성이 제기됐습니다. 영향 범위는 아직 분명하지 않습니다.",
      effects: { retail: -.095, tech: -.04, energy: .025 },
      themes: ["물류", "내수"],
      note: "물건이 안 움직이면 유통이 먼저 아프지만, 다른 업종으로 번질 수도 있습니다.",
    },
    {
      category: "산업 투자", icon: "🖥️", title: "대형 데이터센터 투자 계획 공개",
      description: "전력과 서버 수요가 함께 거론됩니다. 실제 발주 규모는 확인이 필요합니다.",
      effects: { tech: .105, energy: .085, gold: -.015 },
      themes: ["데이터센터", "전력"],
      note: "전력과 서버가 함께 거론되지만, 실제 수혜 범위는 아직 흐릿합니다.",
    },
    {
      category: "인구 정책", icon: "👵", title: "고령화 대응 예산, 확대 논의",
      description: "의료·돌봄 지출이 늘어날 수 있다는 관측입니다. 수혜 범위는 정책 세부안에 달려 있습니다.",
      effects: { bio: .115, retail: .025, tech: .015 },
      themes: ["헬스케어", "재정"],
      note: "장기 수요 이야기는 달콤하지만, 이번 주 가격에 얼마나 붙을지는 별개입니다.",
    },
    {
      category: "세제 개편", icon: "🧾", title: "금융투자 과세, 국회 논의 재점화",
      description: "거래 비용 증가 우려로 투자심리가 흔들립니다. 최종안은 아직 확정이 아닙니다.",
      effects: { tech: -.045, bio: -.05, energy: -.025, retail: -.02, gold: .015, coin: -.09 },
      themes: ["세제", "거래 비용"],
      note: "거래 비용 이야기는 시장 전반을 식힐 수 있습니다. 특히 변동성 큰 쪽부터요.",
    },
    {
      category: "수급", icon: "🐋", title: "기관 투자자, 국내 자산 비중 재검토",
      description: "장기 자금의 이동 가능성이 거론됩니다. 어떤 자산을 담을지는 공개되지 않았습니다.",
      effects: { tech: .055, bio: .025, energy: .045, retail: .04, gold: .015 },
      themes: ["수급", "기관"],
      note: "큰손이 움직인다는 말만으로는 종목을 고를 수 없습니다.",
    },
    {
      category: "실적 시즌", icon: "📊", title: "기업 실적, 업종별 온도 차 확대",
      description: "수출과 내수의 실적 온도가 다르다는 평가가 나왔습니다. 지수보다 선택이 중요해 보입니다.",
      effects: { tech: .085, energy: .045, retail: -.075, bio: -.015 },
      themes: ["실적", "업종 차별"],
      note: "지수보다 업종 선택이 중요해 보입니다. 실적 온도를 직접 확인해 보세요.",
    },
  ];

  const MISSIONS = [
    { id: "diversify", title: "분산 투자의 시작", detail: "동시에 3개 이상 자산 보유", reward: "+1P" },
    { id: "profit", title: "수익 궤도 진입", detail: "누적 수익률 25% 달성", reward: "+1P" },
    { id: "cash", title: "현금도 포지션", detail: "현금 30% 이상 마감 3주", reward: "+1P" },
    { id: "research", title: "정보의 가치", detail: "리서치 분석 3회 사용", reward: "+1P" },
    { id: "labor", title: "시드 모으기", detail: "알바로 80만원 벌기", reward: "+1P" },
    { id: "intel", title: "현장 정보원", detail: "정보 수집 4회 성공", reward: "+1P" },
  ];

  const BADGES = [
    { id: "first", icon: "🖱️", title: "첫 주문" },
    { id: "basket", icon: "🧺", title: "분산왕" },
    { id: "profitSell", icon: "💵", title: "익절의 맛" },
    { id: "active", icon: "⚡", title: "열혈 매매" },
    { id: "double", icon: "🚀", title: "더블업" },
    { id: "allin", icon: "🎲", title: "풀 베팅" },
    { id: "worker", icon: "🛠️", title: "알바왕" },
    { id: "spy", icon: "🕵️", title: "정보통" },
    { id: "gamer", icon: "🎮", title: "오락실" },
  ];

  const JOBS = [
    { id: "store", name: "심야 편의점", icon: "🏪", pay: [16, 26], energy: 1, game: "typing", copy: "바코드를 빠르게 찍어 시드머니를 모으세요." },
    { id: "delivery", name: "번개 배달", icon: "🛵", pay: [20, 34], energy: 1, game: "timing", copy: "초록 구간에 맞춰 도착해야 팁이 붙습니다." },
    { id: "call", name: "민원 콜센터", icon: "📞", pay: [15, 24], energy: 1, game: "memory", copy: "고객 번호를 기억해 민원을 처리하세요." },
    { id: "report", name: "야근 보고서", icon: "📝", pay: [22, 38], energy: 1, game: "typing", copy: "임원 보고 문장을 실수 없이 타이핑하세요." },
    { id: "cafe", name: "주말 카페", icon: "☕", pay: [12, 20], energy: 1, game: "timing", copy: "에스프레소 추출 타이밍이 시급을 바꿉니다." },
    { id: "warehouse", name: "물류 분류", icon: "📦", pay: [18, 30], energy: 1, game: "memory", copy: "박스 코드를 외워 올바른 벨트에 올리세요." },
    { id: "tutor", name: "학원 조교", icon: "📐", pay: [18, 32], energy: 1, game: "math", copy: "학생 숙제 답을 암산으로 빠르게 확인하세요." },
    { id: "library", name: "도서관 정리", icon: "📚", pay: [14, 24], energy: 1, game: "sort", copy: "청구기호 숫자를 작은 것부터 꽂으세요." },
    { id: "flyer", name: "전단지 알바", icon: "📰", pay: [13, 22], energy: 1, game: "catch", copy: "초록 스티커가 붙은 집만 빠르게 찍으세요." },
    { id: "parking", name: "주차 정산", icon: "🅿️", pay: [17, 28], energy: 1, game: "math", copy: "요금·거스름을 틀리면 시급이 깎입니다." },
    { id: "cinema", name: "영화관 팝콘", icon: "🍿", pay: [15, 25], energy: 1, game: "timing", copy: "기름이 터지는 순간에 불을 끄세요." },
    { id: "hotel", name: "객실 청소", icon: "🛏️", pay: [19, 31], energy: 1, game: "trace", copy: "체크리스트 번호 순서대로 방을 도세요." },
    { id: "pets", name: "반려견 산책", icon: "🐕", pay: [14, 23], energy: 1, game: "catch", copy: "목줄이 초록일 때만 앞으로 나가세요." },
    { id: "inspect", name: "부품 검수", icon: "🔍", pay: [21, 36], energy: 1, game: "spot", copy: "불량 하나만 골라내면 시급이 살아납니다." },
    { id: "ticket", name: "고속버스 매표", icon: "🎫", pay: [16, 27], energy: 1, game: "typing", copy: "목적지와 좌석 번호를 그대로 입력하세요." },
    { id: "stock", name: "편의점 발주", icon: "📋", pay: [15, 26], energy: 1, game: "sort", copy: "발주 코드를 오름차순으로 찍으세요." },
  ];

  const INTEL = [
    { id: "rumor", name: "골목 소문", icon: "👂", cost: 0, energy: 1, accuracy: .55, scope: "one", copy: "카페 소문입니다. 광고와 대조하세요. 반은 거짓입니다." },
    { id: "leak", name: "익명 제보", icon: "📩", cost: 20, energy: 1, accuracy: .78, scope: "one", copy: "광고 밖의 약한 제보. 방향을 단정하지 마세요." },
    { id: "sector", name: "업종 브리핑", icon: "📂", cost: 12, energy: 1, accuracy: .72, scope: "sector", copy: "업종 온도만 알려줍니다. 승자 종목은 비공개입니다." },
    { id: "report", name: "유료 리포트", icon: "📑", cost: 35, energy: 1, accuracy: .88, scope: "precise", copy: "한 종목 구간 추정. 광고보다 비싸지만 100%는 아닙니다." },
  ];

  const PLAYS = [
    { id: "type", name: "타이핑 질주", icon: "⌨️", energy: 1, game: "typing", reward: "cash", copy: "빠르고 정확하게 치면 용돈이 들어옵니다." },
    { id: "time", name: "타이밍 바", icon: "🎯", energy: 1, game: "timing", reward: "cash", copy: "바늘이 초록에 있을 때 클릭하세요." },
    { id: "memo", name: "기억 카드", icon: "🧠", energy: 1, game: "memory", reward: "research", copy: "순서를 맞히면 리서치 포인트를 얻습니다." },
    { id: "quiz", name: "경제 상식 퀴즈", icon: "❓", energy: 1, game: "quiz", reward: "intel", copy: "금리·환율·밸류에이션 문항을 맞히면 약한 방향 힌트를 엽니다." },
    { id: "fact", name: "루머 vs 팩트", icon: "🕵️", energy: 1, game: "rumor", reward: "intel", copy: "그럴듯한 시장 주장의 진위를 가르면 핵심 힌트를 얻습니다." },
    { id: "math", name: "암산 챌린지", icon: "🧮", energy: 1, game: "math", reward: "cash", copy: "거스름·퍼센트를 맞히면 용돈이 붙습니다." },
    { id: "sort", name: "숫자 정렬", icon: "🔢", energy: 1, game: "sort", reward: "research", copy: "작은 수부터 누르면 리서치 포인트를 얻습니다." },
    { id: "spot", name: "불량 찾기", icon: "👀", energy: 1, game: "spot", reward: "cash", copy: "다른 칸 하나를 찾아내면 용돈이 들어옵니다." },
    { id: "catch", name: "초록만 클릭", icon: "🟢", energy: 1, game: "catch", reward: "cash", copy: "초록만 빠르게 누르세요. 다른 색은 감점입니다." },
    { id: "trace", name: "순서 터치", icon: "1️⃣", energy: 1, game: "trace", reward: "research", copy: "번호 순서대로 칸을 밟으면 리서치를 얻습니다." },
  ];

  const TYPING_LINES = [
    "영수증은 정확하게, 거스름돈은 빠르게.",
    "임원보고: 이번 주 리스크는 유동성입니다.",
    "배송 완료. 다음 주소로 즉시 출발하세요.",
    "고객님, 대기 번호 47번입니다. 조금만 기다려 주세요.",
    "야근 수당은 적지만 시드머니는 쌓입니다.",
    "서울고속 · 14:20 출발 · 4A 창측.",
    "발주 코드 A-17, 우유 12, 삼각김밥 40.",
    "현금 흐름이 막히면 이익도 숫자가 아닙니다.",
    "분식 주문: 떡볶이 2, 김밥 1, 라볶이 덜맵게.",
    "객실 1208 미니바 보충, 타월 교체 완료.",
  ];

  const QUIZ_BANK = [
    {
      q: "다른 조건이 같을 때, 만기가 긴 채권이 짧은 채권보다 금리 변화에 더 민감한 이유로 가장 적절한 것은?",
      a: [
        "현금흐름이 더 먼 미래에 있어 현재가치의 금리 민감도(듀레이션)가 커지기 때문",
        "장기채는 신용등급이 항상 더 낮아 스프레드가 자동으로 확대되기 때문",
        "한국은행이 장기채만 공개시장조작 대상으로 지정하기 때문",
        "장기채는 액면가 자체가 커서 가격 변동폭이 법적으로 더 크기 때문",
      ],
      ok: 0,
    },
    {
      q: "커버되지 않은 금리평가(UIP)가 성립한다면, 고금리 통화에 대해 함의되는 기대는?",
      a: [
        "고금리 통화의 현물환율이 향후 절하(약세)될 것이라는 기대",
        "고금리 통화가 현물·선물 모두에서 반드시 절상된다는 기대",
        "양국 물가 상승률이 즉시 동일해진다는 기대",
        "외환보유액이 자동으로 무역수지를 균형 맞춘다는 기대",
      ],
      ok: 0,
    },
    {
      q: "테일러 준칙(Taylor rule)의 핵심 함의로 가장 가까운 것은?",
      a: [
        "인플레이션이 목표를 웃돌거나 산출갭이 플러스면 명목금리를 더 높이 설정한다",
        "중앙은행은 본원통화를 매년 고정 비율로만 늘려야 한다",
        "재정수지 적자 폭만큼 기준금리를 기계적으로 인하해야 한다",
        "환율 목표만 지키면 국내 물가는 자동으로 안정된다",
      ],
      ok: 0,
    },
    {
      q: "할인율(요구수익률)이 오를 때 성장주의 이론가가 가치주보다 더 크게 흔들리기 쉬운 이유는?",
      a: [
        "성장주 현금흐름이 더 후면에 치우쳐 주식의 듀레이션이 길기 때문",
        "성장주는 회계상 부채비율이 항상 더 높기 때문",
        "가치주는 배당이 금지되어 할인 대상 현금흐름이 없기 때문",
        "성장주는 자산을 공정가치로 재평가하지 못하기 때문",
      ],
      ok: 0,
    },
    {
      q: "지정가 주문과 시장가 주문의 차이로 가장 정확한 것은?",
      a: [
        "지정가는 가격을 제한하는 대신 체결을 보장하지 않고, 시장가는 즉시성을 사는 대신 슬리피지를 감수한다",
        "지정가는 항상 더 비싸고 시장가는 항상 더 싸다",
        "시장가는 정규장에서만, 지정가는 시간 외에서만 가능하다",
        "지정가 주문은 공매도 포지션에만 사용할 수 있다",
      ],
      ok: 0,
    },
    {
      q: "주택담보대출 변동금리의 준거로 쓰이는 코픽스(COFIX)에 대한 설명으로 옳은 것은?",
      a: [
        "은행 자금조달 비용을 반영한 지표로, 한은 기준금리와 방향은 비슷할 수 있으나 수준·시차는 다르다",
        "한국은행 금융통화위원회가 매월 직접 의결하는 정책금리다",
        "국고채 10년 수익률과 법령상 동일하게 고정된다",
        "예금보험공사가 정하는 예금자보호 한도 금리다",
      ],
      ok: 0,
    },
    {
      q: "국제금융의 '불가능한 삼위일체'(impossible trinity)가 뜻하는 바는?",
      a: [
        "자유로운 자본이동, 고정환율, 독립적 통화정책을 동시에 유지할 수 없다",
        "재정·통화·환율 정책을 동시에 쓰면 항상 경기 과열이 난다",
        "GDP·물가·고용을 하나의 정책 수단으로 관리할 수 없다",
        "금본위제·변동환율·자본통제를 동시에 채택해야 한다",
      ],
      ok: 0,
    },
    {
      q: "양적긴축(QT)이 기준금리 인상과 구분되는 경로로 가장 적절한 것은?",
      a: [
        "대차대조표 축소로 장기금리와 은행 지준·유동성 여건에 영향을 주는 경로가 크다",
        "시중은행 지급준비율을 0으로 만드는 조치다",
        "재정지출을 자동 삭감하는 재정준칙이다",
        "외환시장에서만 달러를 매수하는 개입이다",
      ],
      ok: 0,
    },
    {
      q: "기업 비교에서 EV/EBITDA가 PER보다 유용할 수 있는 이유로 가장 적절한 것은?",
      a: [
        "순부채 등 자본구조 차이를 보정하고, 감가상각 정책의 영향을 줄일 수 있다",
        "현금흐름표만으로 계산되므로 회계 선택이 개입할 수 없다",
        "적자 기업에는 쓸 수 없고 흑자 기업에서만 의미가 있다",
        "한국 회계기준에서 PER 사용이 금지되어 있기 때문이다",
      ],
      ok: 0,
    },
    {
      q: "FX 캐리 트레이드가 급격히 청산될 때 흔히 나타나는 패턴은?",
      a: [
        "저금리 펀딩 통화가 급등하고, 고캐리 자산·고금리 통화가 급락하는 위험회피",
        "모든 통화가 달러 대비 같은 비율로 절상된다",
        "금리가 낮은 나라의 주가지수가 반드시 상승한다",
        "중앙은행이 외환보유액을 전량 매각해야 한다",
      ],
      ok: 0,
    },
    {
      q: "호가 스프레드(bid-ask spread)가 넓어진다는 것은 일반적으로 무엇을 시사하는가?",
      a: [
        "유동성 공급 비용이나 정보비대칭이 커져 즉시 체결 비용이 늘었다",
        "해당 자산의 내재가치가 반드시 상승했다",
        "증권거래세가 폐지되었다",
        "시장조성자가 법적 의무를 완수했다는 신호다",
      ],
      ok: 0,
    },
    {
      q: "피셔 효과(Fisher effect)의 기본 관계로 옳은 것은?",
      a: [
        "명목금리 ≈ 실질금리 + 기대 인플레이션",
        "실질금리 = 명목금리 + 기대 인플레이션",
        "환율 변화율은 사후적으로 항상 명목금리 차이와 같다",
        "주가 기대수익률은 명목금리와 항상 일치한다",
      ],
      ok: 0,
    },
    {
      q: "원/달러 환율이 급등(원화 약세)할 때 정책 대응에 대한 서술로 가장 정확한 것은?",
      a: [
        "외환보유액 매도로 단기 변동을 줄일 수는 있으나, 달러 수요가 지속되면 개입만으로 추세를 막기 어렵다",
        "한국은행이 원화를 무제한 발행하면 환율은 항상 하락한다",
        "환율은 무역수지로만 결정되므로 자본유출은 무관하다",
        "기준금리를 올리면 환율은 법령상 즉시 고정된다",
      ],
      ok: 0,
    },
    {
      q: "국채 수익률 곡선이 역전(단기금리 > 장기금리)될 때 시장이 주목하는 이유로 가장 가까운 것은?",
      a: [
        "가까운 미래의 정책금리 인하와 경기 둔화 기대를 반영하는 경우가 많아서",
        "장기채 발행이 법적으로 중단되었다는 뜻이라서",
        "인플레이션이 영구히 0이 되었다는 증거라서",
        "주식 공매도가 전면 금지되었다는 신호라서",
      ],
      ok: 0,
    },
    {
      q: "환매조건부매매(Repo) 시장의 역할을 가장 잘 설명한 것은?",
      a: [
        "증권을 담보로 초단기 자금을 조달·운용하는 시장으로, 통화정책 파급과 유동성 경색의 진원지가 되기도 한다",
        "기업공개(IPO) 공모가를 결정하는 경매 시장이다",
        "가계 주택담보대출만 취급하는 소매 창구이다",
        "가상자산을 법정화폐로 교환하는 공식 창구이다",
      ],
      ok: 0,
    },
    {
      q: "CAPM에서 베타가 1보다 큰 자산의 요구수익률이 시장보다 높은 이유는?",
      a: [
        "분산으로 제거되지 않는 체계적 위험이 시장보다 크기 때문",
        "그 기업은 파산 확률이 항상 100%이기 때문",
        "무위험수익률이 음수여야만 모형이 성립하기 때문",
        "고유위험(idiosyncratic risk)만 보상받기 때문",
      ],
      ok: 0,
    },
    {
      q: "원/달러 CRS 금리가 이론적 커버드 이자율 평가에서 이탈하는 현상은 주로 무엇을 시사하는가?",
      a: [
        "달러 조달 수요, 신용·규제 마찰 등으로 무위험 차익거래가 완전히 성립하지 않음을 시사한다",
        "한국은행 기준금리가 음수가 되었다는 뜻이다",
        "원화가 기축통화가 되었다는 뜻이다",
        "선물환 시장이 폐쇄되었다는 뜻이다",
      ],
      ok: 0,
    },
    {
      q: "연준 점도표(dot plot)를 해석할 때 유의할 점으로 가장 적절한 것은?",
      a: [
        "위원 개인의 금리 전망 분포이지, 위원회가 약속한 정책 경로가 아니다",
        "다음 FOMC에서 반드시 집행되는 법적 금리 경로다",
        "시중은행 수신금리를 직접 규제하는 표다",
        "달러 인덱스 목표치를 공시한 것이다",
      ],
      ok: 0,
    },
    {
      q: "재정 지배(fiscal dominance) 논의가 가리키는 상황은?",
      a: [
        "정부 부채 부담 때문에 통화정책이 물가 안정보다 금리·재정 여건에 제약받는 상태",
        "금리를 올리면 재정적자가 자동으로 해소되는 상태",
        "중앙은행이 행정부로부터 완전히 독립된 상태만을 가리킨다",
        "모든 재정지출이 헌법으로 금지된 상태",
      ],
      ok: 0,
    },
    {
      q: "VWAP 대비 체결단가가 지속적으로 불리하다면 주로 무엇을 점검해야 하는가?",
      a: [
        "주문 분할, 시장충격, 유동성 타이밍 등 집행 비용",
        "해당 기업의 PER이 반드시 과대평가되었는지",
        "거래세가 환급되는 조건인지",
        "공시 의무가 면제되었는지",
      ],
      ok: 0,
    },
  ];

  const RUMOR_BANK = [
    { claim: "한국은행 금융통화위원회는 기준금리를 결정하지만, 가계·기업 대출금리는 은행 조달비용과 가산금리에 따라 따로 움직인다.", fact: true },
    { claim: "국채 시장에서 금리가 오르면, 이미 발행된 고정쿠폰 채권의 시장가격은 보통 하락한다.", fact: true },
    { claim: "연준이 기준금리를 동결해도, 향후 경로에 대한 가이던스만 바뀌어도 장기금리와 위험자산 가격이 움직일 수 있다.", fact: true },
    { claim: "PER이 낮다고 해서 반드시 저평가는 아니며, 이익의 지속성·성장·순부채를 함께 봐야 한다.", fact: true },
    { claim: "주가지수 선물의 이론가에는 현물 보유에 따른 이자비용과 배당 같은 보유비용이 반영된다.", fact: true },
    { claim: "VIX 같은 변동성 지수는 주가와 반대로 움직이는 경향이 있으나, 미래의 실현 변동성을 오차 없이 예고하지는 않는다.", fact: true },
    { claim: "명목금리가 양수여도 기대 인플레이션이 더 높으면 사전에 본 실질금리는 음수가 될 수 있다.", fact: true },
    { claim: "같은 만기라면 쿠폰이 낮을수록 채권 듀레이션은 보통 더 길어진다.", fact: true },
    { claim: "원화 약세는 수출기업의 달러 매출 환산에는 보탬이 될 수 있지만, 에너지·원자재 수입 비용도 함께 키울 수 있다.", fact: true },
    { claim: "ETF 시장가격과 NAV의 괴리는 설정·환매가 원활하지 않거나 기초자산 유동성이 떨어질수록 커질 수 있다.", fact: true },
    { claim: "공매도는 주가 하락 시에만 이익이 나는 포지션이며, 대차 비용과 리콜(조기 회수) 위험이 따른다.", fact: true },
    { claim: "달러가 강세일 때 신흥국 통화와 위험자산에는 자금 유출 압력이 붙는 경우가 많다.", fact: true },
    { claim: "한국 증권거래세는 원칙적으로 매도 거래에 부과되며, 양도소득 과세 논의와는 별개의 세목이다.", fact: true },
    { claim: "신용부도스와프(CDS) 스프레드가 벌어지면, 시장이 해당 준거 실체의 신용위험을 더 높게 본다는 뜻에 가깝다.", fact: true },
    { claim: "실질실효환율이 상승하면 그 나라 수출품의 가격경쟁력은 보통 약해지는 쪽으로 해석한다.", fact: true },
    { claim: "블랙-숄즈 모형에서 무위험이자율이 오르면, 다른 조건이 같을 때 콜옵션 이론가는 올라가고 풋옵션 이론가는 내려가는 경향이 있다.", fact: true },
    { claim: "한국은행이 기준금리를 인하하면 원/달러 환율은 예외 없이 당일 하락(원화 절상)한다.", fact: false },
    { claim: "커버드 이자율 평가가 성립할 때, 고금리 통화는 선물환에서 현물 대비 프리미엄(절상)으로 거래된다.", fact: false },
    { claim: "금 가격은 소비자물가가 오르는 달이면 항상 상승한다.", fact: false },
    { claim: "국채 금리가 오르면 기존에 보유한 고정금리 채권의 시장가격도 반드시 같이 오른다.", fact: false },
    { claim: "PER의 분모인 EPS가 적자면 음수 PER을 저평가 신호로 쓰는 것이 표준 실무다.", fact: false },
    { claim: "원/달러 환율이 1,300원에서 1,400원으로 가면 원화 가치는 약 7.7% 절상된 것이다.", fact: false },
    { claim: "듀레이션이 길수록 금리 하락 국면에서 채권 가격 상승폭은 더 작다.", fact: false },
    { claim: "FOMC 성명서의 data-dependent 표현은 다음 회의 금리 결정을 이미 확정했다는 뜻이다.", fact: false },
    { claim: "코스피200 선물을 매수하면 구성 종목 배당락만큼 현금이 계좌에 자동 입금된다.", fact: false },
    { claim: "변동성을 파는 전략은 꼬리 위험이 작아 장기적으로 무위험에 가까운 초과수익이다.", fact: false },
    { claim: "재정 적자가 GDP 대비 커지면 구축효과 때문에 민간 금리는 항상 하락한다.", fact: false },
    { claim: "한국 상장 ETF는 차익거래 때문에 NAV와 시장가격이 장중 항상 일치한다.", fact: false },
    { claim: "외국인 순매수는 다음 거래일 코스피 상승을 보장한다.", fact: false },
    { claim: "회사채 스프레드 확대는 해당 기업의 실적 서프라이즈(어닝 비트)를 뜻한다.", fact: false },
    { claim: "고든 성장모형에서 배당성장률이 할인율보다 높으면 그 가정을 그대로 써서 주가를 무한대로 평가하는 것이 실무 표준이다.", fact: false },
    { claim: "한국 가계대출 변동금리는 한은 기준금리와 1:1로 당일 자동 연동된다.", fact: false },
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    openSetup: $("#open-setup"),
    hero: $("#hero"),
    restart: $("#restart-button"),
    setupModal: $("#setup-modal"),
    start: $("#start-game"),
    difficulties: $$(".difficulty"),
    weekModal: $("#week-modal"),
    endModal: $("#end-modal"),
    activityModal: $("#activity-modal"),
    playStage: $("#play-stage"),
    jobsPanel: $("#jobs-panel"),
    intelPanel: $("#intel-panel"),
    playPanel: $("#play-panel"),
    energyPoints: $("#energy-points"),
    energyMax: $("#energy-max"),
    energyChip: $("#energy-chip"),
    endLabor: $("#end-labor"),
    game: $("#market"),
    marketNav: $("#market-nav"),
    weekLabel: $("#week-label"),
    difficultyLabel: $("#difficulty-label"),
    totalAssets: $("#total-assets"),
    cash: $("#cash"),
    cashRatio: $("#cash-ratio"),
    totalReturn: $("#total-return"),
    profitValue: $("#profit-value"),
    research: $("#research-points"),
    goalProgress: $("#goal-progress"),
    goalFill: $("#goal-fill"),
    newsCategory: $("#news-category"),
    newsDate: $("#news-date"),
    newsIcon: $("#news-icon"),
    newsTitle: $("#news-title"),
    newsDescription: $("#news-description"),
    newsTags: $("#news-tags"),
    analystNote: $("#analyst-note"),
    assetList: $("#asset-list"),
    closeMarket: $("#close-market"),
    holdingCount: $("#holding-count"),
    donut: $("#portfolio-donut"),
    investedRatio: $("#invested-ratio"),
    portfolioLegend: $("#portfolio-legend"),
    riskLabel: $("#risk-label"),
    riskFill: $("#risk-fill"),
    missionList: $("#mission-list"),
    missionCount: $("#mission-count"),
    badgeGrid: $("#badge-grid"),
    achievementCount: $("#achievement-count"),
    tradeLog: $("#trade-log"),
    clearLog: $("#clear-log"),
    weekResultLabel: $("#week-result-label"),
    weekResults: $("#week-results"),
    weekProfit: $("#week-profit"),
    weekTotal: $("#week-total"),
    weekSummary: $("#week-result-summary"),
    nextWeek: $("#next-week"),
    endRank: $("#end-rank"),
    endLabel: $("#end-label"),
    endTitle: $("#end-title"),
    endDescription: $("#end-description"),
    endAssets: $("#end-assets"),
    endReturn: $("#end-return"),
    endMissions: $("#end-missions"),
    endBadges: $("#end-badges"),
    playAgain: $("#play-again"),
    bestRecord: $("#best-record"),
    sound: $("#sound-button"),
    toastStack: $("#toast-stack"),
    haltScreen: $("#halt-screen"),
    accountButton: $("#account-button"),
    authModal: $("#auth-modal"),
    authForm: $("#auth-form"),
    authId: $("#auth-id"),
    authNick: $("#auth-nick"),
    authNickWrap: $("#auth-nick-wrap"),
    authPass: $("#auth-pass"),
    authError: $("#auth-error"),
    authSubmit: $("#auth-submit"),
    authTitle: $("#auth-title"),
    authLead: $("#auth-lead"),
    lobbyModal: $("#lobby-modal"),
    lobbyUser: $("#lobby-user"),
    lobbyStatus: $("#lobby-status"),
    lobbyEnter: $("#lobby-enter"),
    lobbyClock: $("#lobby-clock"),
    roomCodeLabel: $("#room-code-label"),
    periodClock: $("#period-clock"),
    playerCount: $("#player-count"),
    rankStrip: $("#rank-strip"),
    rankList: $("#rank-list"),
    foundButton: $("#found-button"),
    closeButton: $("#close-button"),
    lendButton: $("#lend-button"),
    adButton: $("#ad-button"),
    foundModal: $("#found-modal"),
    foundForm: $("#found-form"),
    foundName: $("#found-name"),
    foundSymbol: $("#found-symbol"),
    foundSector: $("#found-sector"),
    foundSeed: $("#found-seed"),
    foundError: $("#found-error"),
    closeModal: $("#close-modal"),
    closeLead: $("#close-lead"),
    closeError: $("#close-error"),
    closeConfirm: $("#close-confirm"),
    lendModal: $("#lend-modal"),
    lendForm: $("#lend-form"),
    lendTitle: $("#lend-title"),
    lendName: $("#lend-name"),
    lendRate: $("#lend-rate"),
    lendSeed: $("#lend-seed"),
    lendError: $("#lend-error"),
    lendList: $("#lend-list"),
    lendDebt: $("#lend-debt"),
    borrowModal: $("#borrow-modal"),
    borrowForm: $("#borrow-form"),
    borrowTitle: $("#borrow-title"),
    borrowLead: $("#borrow-lead"),
    borrowAmount: $("#borrow-amount"),
    borrowError: $("#borrow-error"),
    adModal: $("#ad-modal"),
    adForm: $("#ad-form"),
    adSlogan: $("#ad-slogan"),
    adClaim: $("#ad-claim"),
    adImage: $("#ad-image"),
    adError: $("#ad-error"),
    adTicker: $("#ad-ticker"),
    adList: $("#ad-list"),
    closeMarketHint: $("#close-market-hint"),
    continueSeason: $("#continue-season"),
    weekResultTitle: $("#week-result-title"),
    gambleButton: $("#gamble-button"),
    gambleModal: $("#gamble-modal"),
    gambleStatus: $("#gamble-status"),
    gambleCreate: $("#gamble-create"),
    gambleCreateForm: $("#gamble-create-form"),
    gambleStake: $("#gamble-stake"),
    gambleCreateError: $("#gamble-create-error"),
    gambleTables: $("#gamble-tables"),
    gambleActive: $("#gamble-active"),
    lotteryButton: $("#lottery-button"),
    lotteryModal: $("#lottery-modal"),
    lotteryStatus: $("#lottery-status"),
    lotteryPotValue: $("#lottery-pot-value"),
    lotteryDrawLabel: $("#lottery-draw-label"),
    lotteryMine: $("#lottery-mine"),
    lotteryBuy: $("#lottery-buy"),
    lotteryForce: $("#lottery-force"),
    lotteryError: $("#lottery-error"),
    lotteryLast: $("#lottery-last"),
    promoDeskModal: $("#promo-desk-modal"),
    promoOpenGamble: $("#promo-open-gamble"),
    promoOpenLottery: $("#promo-open-lottery"),
    chatCreateForm: $("#chat-create-form"),
    chatRoomName: $("#chat-room-name"),
    chatRoomSelect: $("#chat-room-select"),
    chatRoomCount: $("#chat-room-count"),
    chatLog: $("#chat-log"),
    chatForm: $("#chat-form"),
    chatInput: $("#chat-input"),
    liveChart: $("#live-chart"),
    liveChartLine: $("#live-chart-line"),
    liveChartArea: $("#live-chart-area"),
    liveChartPills: $("#live-chart-pills"),
    liveChartTitle: $("#live-chart-title"),
    liveChartMeta: $("#live-chart-meta"),
    liveChartPrice: $("#live-chart-price"),
  };

  let selectedMode = "rookie";
  let soundOn = true;
  let audioContext = null;
  let state;
  let session = null;
  let authMode = "login";
  let authNext = "setup";
  let pendingAdImage = "";
  let pendingBorrowLenderId = "";
  let pendingLendAction = "";
  let banMap = {};
  let serverStopped = false;
  let activeChatRoomId = "";
  let selectedChartId = "";
  const clientId = (() => {
    const key = "bull-lab-client-v1";
    try {
      let value = sessionStorage.getItem(key);
      if (!value) {
        value = window.crypto?.randomUUID?.() || `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(key, value);
      }
      return value;
    } catch {
      return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
  })();
  const worldSync = {
    revision: 0,
    updatedAt: 0,
    lastSettledPeriodId: "",
    putting: false,
    dirty: false,
    putTimer: null,
    pollTimer: null,
    clockTimer: null,
    kstTimer: null,
    chartTimer: null,
    presenceTimer: null,
    buildTimer: null,
    touched: new Set(),
    chatRooms: [],
    seenPlayers: [],
    eventDeck: [],
    eventKey: 0,
    botsSpawned: false,
    online: false,
    connected: false,
    presence: [],
    presenceRef: null,
    presenceRootRef: null,
    presenceHandler: null,
    connectedRef: null,
    connectedHandler: null,
    needsSeed: false,
    pendingTrades: new Set(),
    lastToastAt: 0,
    entering: false,
    inMarket: false,
    closed: {},
    appliedPeriodId: "",
    settling: false,
    db: null,
    applyingRemote: false,
    unsub: null,
    banUnsub: null,
    haltUnsub: null,
    climate: 0,
    climateUnsub: null,
    tradeLockUntil: 0,
    gambleTables: {},
    gambleUnsub: null,
    gambleBusy: false,
    gambleActiveId: "",
    lottery: null,
    lotteryUnsub: null,
    lotteryBusy: false,
    lotterySettleBusy: false,
  };
  const kstClock = {
    ok: false,
    serverUtcMs: 0,
    fetchedAt: 0,
    source: "",
  };

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function kstInstantMs() {
    if (!kstClock.ok) return null;
    return kstClock.serverUtcMs + (Date.now() - kstClock.fetchedAt);
  }

  function kstParts() {
    const ms = kstInstantMs();
    if (ms == null) return null;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    });
    const bag = {};
    fmt.formatToParts(new Date(ms)).forEach((part) => {
      if (part.type !== "literal") bag[part.type] = part.value;
    });
    return {
      y: Number(bag.year),
      mo: Number(bag.month),
      d: Number(bag.day),
      h: Number(bag.hour),
      mi: Number(bag.minute),
      s: Number(bag.second),
      weekday: bag.weekday,
      ms,
    };
  }

  function kstLabel() {
    const p = kstParts();
    if (!p) return "한국 표준시 확인 중";
    return `KST ${p.y}-${pad2(p.mo)}-${pad2(p.d)} ${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}`;
  }

  function isKstWeekend(parts) {
    const w = (parts.weekday || "").slice(0, 3);
    return w === "Sat" || w === "Sun";
  }

  function periodIdFromParts(parts, period) {
    return `${parts.y}-${pad2(parts.mo)}-${pad2(parts.d)}-${period.n}`;
  }

  function currentOrDuePeriod(parts) {
    if (!parts || isKstWeekend(parts)) return { kind: "closed", label: "주말 휴장" };
    const minutes = parts.h * 60 + parts.mi;
    let due = null;
    for (const period of PERIODS) {
      const end = period.h * 60 + period.m;
      if (minutes >= end && worldSync.lastSettledPeriodId !== periodIdFromParts(parts, period)) {
        due = period;
      }
    }
    const next = PERIODS.find((period) => minutes < period.h * 60 + period.m);
    if (!next && !due) return { kind: "closed", label: "오늘 정규장 종료" };
    if (due) return { kind: "due", period: due, label: `${due.label} 정산` };
    const remain = next.h * 60 + next.m - minutes;
    return { kind: "open", period: next, label: `${next.label}까지 ${remain}분`, remain };
  }

  async function fetchKst() {
    for (const url of KST_ENDPOINTS) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        let iso = data.datetime || data.dateTime;
        if (!iso && data.year) {
          iso = `${data.year}-${pad2(data.month)}-${pad2(data.day)}T${pad2(data.hour)}:${pad2(data.minute)}:${pad2(data.seconds || 0)}+09:00`;
        }
        const parsed = Date.parse(iso);
        if (!Number.isFinite(parsed)) continue;
        kstClock.ok = true;
        kstClock.serverUtcMs = parsed;
        kstClock.fetchedAt = Date.now();
        kstClock.source = url;
        return true;
      } catch {
        /* try next */
      }
    }
    kstClock.ok = false;
    return false;
  }

  function firebaseConfig() {
    const cfg = window.FIREBASE_CONFIG || DEFAULT_FIREBASE_CONFIG;
    return cfg.databaseURL && cfg.apiKey ? cfg : null;
  }

  function firebaseRestUrl(path) {
    const cfg = firebaseConfig();
    if (!cfg?.databaseURL) return "";
    return `${cfg.databaseURL.replace(/\/$/, "")}/${String(path || "").replace(/^\/+/, "")}.json`;
  }

  async function firebaseRestRequest(path, options = {}, timeoutMs = FIREBASE_WRITE_TIMEOUT_MS) {
    const url = firebaseRestUrl(path);
    if (!url) throw new Error("firebase-rest-missing");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { cache: "no-store", ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function firebaseDb() {
    if (worldSync.db) return worldSync.db;
    const cfg = firebaseConfig();
    if (!cfg || typeof firebase === "undefined") return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      worldSync.db = firebase.database();
      return worldSync.db;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function firebaseReady() {
    return !!firebaseDb();
  }

  function safeFbKey(id) {
    return String(id || "").replace(/[.#$\[\]/]/g, "_");
  }

  function isSchoolListing(asset) {
    if (!asset) return false;
    if (asset.playerCompany) return true;
    if (asset.founderId) return true;
    const id = String(asset.id || "");
    return id.startsWith("co-") && !CORE_ASSET_IDS.includes(id);
  }

  function listFromMap(map) {
    if (!map) return [];
    if (Array.isArray(map)) return map.filter(Boolean);
    return Object.keys(map).map((key) => {
      const row = map[key];
      if (!row || typeof row !== "object") return null;
      return { ...row, id: row.id || key };
    }).filter(Boolean);
  }

  function isBanned(id) {
    return !!(id && banMap[id]);
  }

  function isHiddenWealth(player) {
    if (!player || isBanned(player.id)) return true;
    const cash = Number(player.cash) || 0;
    const total = Number(player.total) || 0;
    return cash > WEALTH_SANITY || total > WEALTH_SANITY;
  }

  function applyBanMap(value) {
    banMap = {};
    listFromMap(value).forEach((row) => {
      const id = String(row?.id || "").trim();
      if (id) banMap[id] = row;
    });
    if (isBanned(session?.id) || isBanned(state?.playerId)) ejectBanned();
    renderRanking();
  }

  function ejectBanned() {
    if (!isBanned(session?.id) && !isBanned(state?.playerId)) return;
    if (state?.active || worldSync.inMarket) {
      worldSync.inMarket = false;
      if (state) state.active = false;
      hideDesk();
      stopWorldSync();
      toast("🚫", "퇴장", "이 계좌는 강퇴되어 공유 시장에 들어갈 수 없습니다.");
    }
  }

  async function fetchBans() {
    try {
      const response = await firebaseRestRequest(BAN_PATH, {}, FIREBASE_READ_TIMEOUT_MS);
      if (!response.ok) return;
      applyBanMap(await response.json());
    } catch {
      /* keep local bans */
    }
  }

  function subscribeBans() {
    const db = firebaseDb();
    if (!db) {
      fetchBans();
      return;
    }
    if (worldSync.banUnsub) db.ref(BAN_PATH).off("value", worldSync.banUnsub);
    const handler = (snap) => applyBanMap(snap.val());
    db.ref(BAN_PATH).on("value", handler);
    worldSync.banUnsub = handler;
  }

  function unsubscribeBans() {
    const db = firebaseDb();
    if (db && worldSync.banUnsub) db.ref(BAN_PATH).off("value", worldSync.banUnsub);
    worldSync.banUnsub = null;
  }

  function isServerStopped() {
    if (staffTestRequested()) return false;
    return !!serverStopped;
  }

  function haltPreviewRequested() {
    try {
      return new URLSearchParams(location.search).has("halt-preview");
    } catch {
      return false;
    }
  }

  function staffTestRequested() {
    try {
      const q = new URLSearchParams(location.search);
      return q.has("staff-test") || q.has("gamble-preview");
    } catch {
      return false;
    }
  }

  function applyHalt(value) {
    if (staffTestRequested()) {
      serverStopped = false;
      hideHaltedScreen();
      return;
    }
    if (haltPreviewRequested()) {
      serverStopped = true;
      showHaltedScreen();
      return;
    }
    const stopped = !!(value && typeof value === "object" && value.stopped === true);
    const was = serverStopped;
    serverStopped = stopped;
    if (stopped) showHaltedScreen();
    else if (was) {
      hideHaltedScreen();
      toast("📈", "서버 재개", "시장이 다시 열렸습니다. 투자 시작하기를 눌러 입장하세요.");
    }
  }

  function showHaltedScreen() {
    if (els.haltScreen) els.haltScreen.hidden = false;
    document.body.classList.add("is-halted");
    try { freezeHaltedSession(); } catch { /* keep overlay visible */ }
  }

  function hideHaltedScreen() {
    if (els.haltScreen) els.haltScreen.hidden = true;
    document.body.classList.remove("is-halted");
  }

  function freezeHaltedSession() {
    worldSync.inMarket = false;
    if (state) state.active = false;
    hideDesk();
    stopWorldSync();
    allModals().forEach(closeModal);
  }

  function ejectHalted() {
    if (!isServerStopped()) return;
    showHaltedScreen();
  }

  async function fetchHalt() {
    try {
      const response = await firebaseRestRequest(HALT_PATH, {}, FIREBASE_READ_TIMEOUT_MS);
      if (!response.ok) return;
      applyHalt(await response.json());
    } catch {
      /* keep local halt */
    }
  }

  function subscribeHalt() {
    const db = firebaseDb();
    if (!db) {
      fetchHalt();
      return;
    }
    if (worldSync.haltUnsub) return;
    const handler = (snap) => applyHalt(snap.val());
    db.ref(HALT_PATH).on("value", handler);
    worldSync.haltUnsub = handler;
  }

  function climateTone() {
    const n = Number(worldSync.climate);
    return Number.isFinite(n) ? Math.max(-10, Math.min(10, n)) : 0;
  }

  function applyClimate(value) {
    const tone = Number(value?.tone);
    const next = Number.isFinite(tone) ? Math.max(-10, Math.min(10, Math.round(tone))) : 0;
    const changed = next !== Number(worldSync.climate || 0);
    worldSync.climate = next;
    if (changed && state?.active && typeof renderAll === "function" && !isDeskEditing()) {
      liveCompanies().forEach((asset) => pushTick(asset, quotePrice(asset)));
      renderAll();
    }
  }

  async function fetchClimate() {
    try {
      const response = await firebaseRestRequest(CLIMATE_PATH, {}, FIREBASE_READ_TIMEOUT_MS);
      if (!response.ok) return;
      applyClimate(await response.json());
    } catch {
      /* keep local climate */
    }
  }

  function subscribeClimate() {
    const db = firebaseDb();
    if (!db) {
      fetchClimate();
      return;
    }
    if (worldSync.climateUnsub) return;
    const handler = (snap) => applyClimate(snap.val());
    db.ref(CLIMATE_PATH).on("value", handler);
    worldSync.climateUnsub = handler;
  }

  function readGambleSettled() {
    try {
      return JSON.parse(localStorage.getItem(GAMBLE_SETTLE_STORE) || "{}") || {};
    } catch {
      return {};
    }
  }

  function markGambleSettled(tableId) {
    if (!tableId) return;
    try {
      const all = readGambleSettled();
      all[tableId] = Date.now();
      localStorage.setItem(GAMBLE_SETTLE_STORE, JSON.stringify(all));
    } catch { /* quota */ }
  }

  function gambleSpendableCash() {
    if (!state) return 0;
    return Math.max(0, round1(state.cash));
  }

  function gambleMinutesNow() {
    try {
      const parts = kstParts() || parseKstParts(kstNowMs());
      if (!parts) return null;
      return Number(parts.h) * 60 + Number(parts.mi);
    } catch {
      return null;
    }
  }

  function isGambleHoursOpen() {
    if (staffTestRequested()) return true;
    const mins = gambleMinutesNow();
    if (mins == null) return false;
    const lunch = mins >= (12 * 60 + 20) && mins <= (13 * 60 + 10);
    const afterFour = mins >= (16 * 60);
    return lunch || afterFour;
  }

  function gambleHoursLabel() {
    if (staffTestRequested()) return "스태프 테스트 · 시간 제한 무시";
    if (isGambleHoursOpen()) {
      const mins = gambleMinutesNow();
      if (mins != null && mins >= 16 * 60) return "운영 중 · 오후 4시 이후";
      return "운영 중 · 점심 12:20~13:10";
    }
    return "닫힘 · 점심 12:20~13:10 또는 오후 4시 이후만";
  }

  function gambleSeatList(table) {
    return listFromMap(table?.seats).sort((a, b) => (Number(a.joinedAt) || 0) - (Number(b.joinedAt) || 0));
  }

  function gambleTablePath(id) {
    return `${GAMBLE_PATH}/${safeFbKey(id)}`;
  }

  async function putGambleTable(table) {
    if (!table?.id) return false;
    const response = await firebaseRestRequest(gambleTablePath(table.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    }, FIREBASE_WRITE_TIMEOUT_MS);
    return response.ok;
  }

  async function patchGambleTable(id, patch) {
    const response = await firebaseRestRequest(gambleTablePath(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }, FIREBASE_WRITE_TIMEOUT_MS);
    return response.ok;
  }

  function applyGambleTables(value) {
    const next = {};
    listFromMap(value).forEach((row) => {
      if (!row?.id) return;
      next[row.id] = row;
    });
    worldSync.gambleTables = next;
    tryApplyGambleSettlements();
    if (els.gambleModal && !els.gambleModal.hidden) renderGambleModal();
  }

  function subscribeGamble() {
    const db = firebaseDb();
    if (!db) {
      firebaseRestRequest(GAMBLE_PATH, {}, FIREBASE_READ_TIMEOUT_MS)
        .then(async (res) => { if (res.ok) applyGambleTables(await res.json()); })
        .catch(() => {});
      return;
    }
    if (worldSync.gambleUnsub) return;
    const handler = (snap) => applyGambleTables(snap.val());
    db.ref(GAMBLE_PATH).on("value", handler);
    worldSync.gambleUnsub = handler;
  }

  function openGambleModal() {
    if (isServerStopped()) {
      showHaltedScreen();
      return;
    }
    if (!state?.active) {
      toast("🎲", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    if (els.gambleCreateError) {
      els.gambleCreateError.hidden = true;
      els.gambleCreateError.textContent = "";
    }
    if (els.gambleStake) {
      const max = Math.max(MIN_GAMBLE_STAKE, Math.floor(gambleSpendableCash() / 10) * 10);
      els.gambleStake.max = String(max);
      els.gambleStake.min = String(MIN_GAMBLE_STAKE);
      els.gambleStake.value = String(Math.min(50, max));
    }
    renderGambleModal();
    openModal(els.gambleModal);
  }

  function setGambleCreateError(msg) {
    if (!els.gambleCreateError) return;
    if (!msg) {
      els.gambleCreateError.hidden = true;
      els.gambleCreateError.textContent = "";
      return;
    }
    els.gambleCreateError.hidden = false;
    els.gambleCreateError.textContent = msg;
  }

  function myOpenGambleSeat() {
    return Object.values(worldSync.gambleTables || {}).find((table) => {
      if (!table || table.status === "done" || table.status === "cancelled") return false;
      return !!seatOnTable(table, state?.playerId);
    });
  }

  function seatOnTable(table, playerId) {
    if (!table?.seats || !playerId) return null;
    return table.seats[safeFbKey(playerId)] || table.seats[playerId] || null;
  }

  function renderGambleModal() {
    if (!els.gambleModal) return;
    const hoursOpen = isGambleHoursOpen();
    const mine = myOpenGambleSeat();
    const spendable = gambleSpendableCash();
    if (els.gambleStatus) {
      els.gambleStatus.textContent = isServerStopped()
        ? "서버 정지 중 · 몰빵데스크 닫힘"
        : mine
          ? `참여 중 · 바이인 ${money(mine.stake)} · ${gambleHoursLabel()}`
          : `${gambleHoursLabel()} · 현금 ${money(spendable)}까지`;
    }
    if (els.gambleCreate) els.gambleCreate.hidden = !!(mine || !hoursOpen || isServerStopped());
    const openTables = Object.values(worldSync.gambleTables || {})
      .filter((table) => table && (table.status === "open" || table.status === "locked" || table.status === "reveal"))
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    if (els.gambleTables) {
      if (!hoursOpen && !mine) {
        els.gambleTables.innerHTML = `<p class="gamble-status">지금은 닫혀 있습니다. 점심 12:20~13:10 또는 오후 4시 이후에 오세요.</p>`;
      } else if (!openTables.length) {
        els.gambleTables.innerHTML = `<p class="gamble-status">열린 데스크가 없습니다. 위에서 새로 열 수 있습니다.</p>`;
      } else {
        els.gambleTables.innerHTML = openTables.map((table) => {
          const seats = gambleSeatList(table);
          const seated = !!seatOnTable(table, state?.playerId);
          const full = seats.length >= (table.maxSeats || GAMBLE_MAX_SEATS);
          const canJoin = !seated && !mine && hoursOpen && table.status === "open" && !full && !isServerStopped();
          const statusLabel = table.status === "open" ? "모집 중" : "시작됨 · 입장 마감";
          return `<article class="gamble-row" data-table="${esc(table.id)}">
            <div>
              <b>주사위 · ${money(table.stake)}</b>
              <span>${esc(table.hostName || table.hostId)} · ${seats.length}/${table.maxSeats || GAMBLE_MAX_SEATS}명 · ${esc(statusLabel)}</span>
            </div>
            <button type="button" data-gamble-join="${esc(table.id)}" ${canJoin ? "" : "disabled"}>${seated ? "내 자리" : table.status !== "open" ? "마감" : full ? "만원" : "참가"}</button>
          </article>`;
        }).join("");
      }
    }
    const active = mine || (worldSync.gambleActiveId && worldSync.gambleTables[worldSync.gambleActiveId]) || null;
    renderGambleActive(active);
  }

  function renderGambleActive(table) {
    if (!els.gambleActive) return;
    if (!table) {
      els.gambleActive.hidden = true;
      els.gambleActive.innerHTML = "";
      return;
    }
    els.gambleActive.hidden = false;
    const seats = gambleSeatList(table);
    const me = seatOnTable(table, state?.playerId);
    const isHost = table.hostId === state?.playerId;
    const max = table.maxSeats || GAMBLE_MAX_SEATS;
    let actions = "";
    if (table.status === "open" && me) {
      if (isHost && seats.length >= 2) {
        actions += `<button type="button" class="is-hot" data-gamble-start="${esc(table.id)}">게임 시작</button>`;
      } else if (isHost) {
        actions += `<button type="button" class="is-hot" disabled>2명 이상이면 시작</button>`;
      }
      actions += `<button type="button" class="is-ghost" data-gamble-leave="${esc(table.id)}">${isHost ? "데스크 닫기" : "나가기"}</button>`;
    }
    if (table.status === "done" || table.status === "cancelled") {
      actions += `<button type="button" class="is-ghost" data-close="gamble">닫기</button>`;
    }
    const resultHtml = table.result?.summary
      ? `<div class="gamble-result">${esc(table.result.summary)}</div>`
      : "";
    const statusCopy = table.status === "open" ? "모집 중 · 시작 전 입장 가능" : table.status === "done" ? "종료" : String(table.status);
    els.gambleActive.innerHTML = `
      <h3>주사위</h3>
      <p class="gamble-meta">바이인 ${money(table.stake)} · 팟 ${money(table.stake * seats.length)} · ${seats.length}/${max}명 · ${esc(statusCopy)}</p>
      <ul class="gamble-seats">${seats.map((seat) => {
        const bits = [];
        if (seat.roll) bits.push(`${seat.roll}`);
        if (table.result?.winners?.includes(seat.id)) bits.push("승");
        return `<li><span>${esc(seat.name || seat.id)}${seat.id === state?.playerId ? " · 나" : ""}${seat.id === table.hostId ? " · 방장" : ""}</span><em>${esc(bits.join(" · ") || "대기")}</em></li>`;
      }).join("")}</ul>
      <div class="gamble-actions">${actions}</div>
      ${resultHtml}
    `;
  }

  function deductGambleStake(stake) {
    const amount = round1(Number(stake) || 0);
    if (amount < MIN_GAMBLE_STAKE) return { ok: false, err: "stake" };
    if (gambleSpendableCash() + 1e-9 < amount) return { ok: false, err: "cash" };
    state.cash = round1(state.cash - amount);
    writeWallet();
    queuePush();
    renderSummary();
    return { ok: true, amount };
  }

  function refundGambleStake(amount) {
    const value = round1(Number(amount) || 0);
    if (value <= 0) return;
    state.cash = round1(state.cash + value);
    writeWallet();
    queuePush();
    renderSummary();
  }

  function creditGambleWin(amount) {
    const value = round1(Number(amount) || 0);
    if (value <= 0) return;
    state.cash = round1(state.cash + value);
    writeWallet();
    queuePush();
    renderSummary();
  }

  async function createGambleTable(event) {
    event.preventDefault();
    if (worldSync.gambleBusy || isServerStopped() || !state?.active) return;
    if (!isGambleHoursOpen()) {
      setGambleCreateError("점심 12:20~13:10 또는 오후 4시 이후에만 열 수 있습니다.");
      return;
    }
    if (myOpenGambleSeat()) {
      setGambleCreateError("이미 다른 데스크에 앉아 있습니다.");
      return;
    }
    let stake = Math.round(Number(els.gambleStake?.value) || 0);
    stake = Math.floor(stake / 10) * 10;
    const cashCap = Math.floor(gambleSpendableCash() / 10) * 10;
    if (stake < MIN_GAMBLE_STAKE) {
      setGambleCreateError(`바이인은 최소 ${MIN_GAMBLE_STAKE}만원입니다.`);
      return;
    }
    if (stake > cashCap) {
      setGambleCreateError(`보유 현금 ${money(cashCap)}까지 걸 수 있습니다.`);
      return;
    }
    const paid = deductGambleStake(stake);
    if (!paid.ok) {
      setGambleCreateError(paid.err === "cash" ? "현금이 부족합니다." : "바이인을 확인하세요.");
      return;
    }
    worldSync.gambleBusy = true;
    setGambleCreateError("");
    const id = makeId("gb");
    const now = Date.now();
    const table = {
      id,
      game: "dice",
      stake,
      maxSeats: GAMBLE_MAX_SEATS,
      hostId: state.playerId,
      hostName: state.playerName,
      status: "open",
      createdAt: now,
      updatedAt: now,
      seats: {
        [safeFbKey(state.playerId)]: {
          id: state.playerId,
          name: state.playerName,
          stake,
          joinedAt: now,
        },
      },
      seed: "",
      result: null,
    };
    try {
      const ok = await putGambleTable(table);
      if (!ok) throw new Error("put");
      worldSync.gambleTables[id] = table;
      worldSync.gambleActiveId = id;
      toast("🎲", "몰빵데스크", "주사위 데스크를 열었습니다. 2명 이상이면 시작할 수 있습니다.");
      renderGambleModal();
    } catch {
      refundGambleStake(stake);
      setGambleCreateError("데스크를 열지 못했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      worldSync.gambleBusy = false;
    }
  }

  async function joinGambleTable(tableId) {
    if (worldSync.gambleBusy || isServerStopped() || !state?.active) return;
    if (!isGambleHoursOpen()) {
      toast("🎲", "닫힘", "점심 12:20~13:10 또는 오후 4시 이후에만 참가할 수 있습니다.");
      return;
    }
    const table = worldSync.gambleTables[tableId];
    if (!table || table.status !== "open") {
      toast("🎲", "입장 마감", "이미 시작되어 더 이상 들어올 수 없습니다.");
      return;
    }
    if (myOpenGambleSeat()) {
      toast("🎲", "참가 중", "이미 다른 데스크에 앉아 있습니다.");
      return;
    }
    if (seatOnTable(table, state.playerId)) return;
    const seats = gambleSeatList(table);
    if (seats.length >= (table.maxSeats || GAMBLE_MAX_SEATS)) {
      toast("🎲", "만원", "자리가 없습니다.");
      return;
    }
    const paid = deductGambleStake(table.stake);
    if (!paid.ok) {
      toast("🎲", "현금 부족", "보유 현금이 바이인보다 적습니다.");
      return;
    }
    worldSync.gambleBusy = true;
    const now = Date.now();
    const seat = {
      id: state.playerId,
      name: state.playerName,
      stake: table.stake,
      joinedAt: now,
    };
    try {
      const nextSeats = { ...(table.seats || {}), [safeFbKey(state.playerId)]: seat };
      const ok = await patchGambleTable(tableId, { seats: nextSeats, updatedAt: now });
      if (!ok) throw new Error("patch");
      table.seats = nextSeats;
      table.updatedAt = now;
      worldSync.gambleActiveId = tableId;
      toast("🎲", "참가", "주사위 데스크에 앉았습니다. 방장이 시작하면 입장 마감됩니다.");
      renderGambleModal();
    } catch {
      refundGambleStake(table.stake);
      toast("🎲", "참가 실패", "다시 시도해 주세요.");
    } finally {
      worldSync.gambleBusy = false;
    }
  }

  async function leaveGambleTable(tableId) {
    if (worldSync.gambleBusy || !state?.active) return;
    const table = worldSync.gambleTables[tableId];
    if (!table || table.status !== "open") {
      toast("🎲", "진행 중", "이미 시작되어 나갈 수 없습니다.");
      return;
    }
    const me = seatOnTable(table, state.playerId);
    if (!me) return;
    worldSync.gambleBusy = true;
    try {
      if (table.hostId === state.playerId) {
        markGambleSettled(`${tableId}:refund:${state.playerId}`);
        refundGambleStake(me.stake);
        const cancelled = {
          ...table,
          status: "cancelled",
          updatedAt: Date.now(),
          result: {
            summary: "방장이 데스크를 닫아 바이인을 돌려줍니다.",
            refundAll: true,
          },
        };
        const ok = await putGambleTable(cancelled);
        if (!ok) throw new Error("put");
        worldSync.gambleTables[tableId] = cancelled;
        toast("🎲", "데스크 닫힘", "바이인을 돌려받았습니다.");
      } else {
        refundGambleStake(me.stake);
        const nextSeats = { ...(table.seats || {}) };
        delete nextSeats[safeFbKey(state.playerId)];
        delete nextSeats[state.playerId];
        await patchGambleTable(tableId, { seats: nextSeats, updatedAt: Date.now() });
        table.seats = nextSeats;
        toast("🎲", "나감", "바이인을 돌려받았습니다.");
      }
      worldSync.gambleActiveId = "";
      renderGambleModal();
    } catch {
      toast("🎲", "실패", "나가기에 실패했습니다.");
    } finally {
      worldSync.gambleBusy = false;
    }
  }

  function diceRollFromSeed(seed, playerId) {
    return 1 + Math.floor(hashUnit(`${seed}|${playerId}|roll`) * 6);
  }

  function buildDiceResult(table, seed) {
    const seats = gambleSeatList(table).map((seat) => {
      const roll = diceRollFromSeed(seed, seat.id);
      return { ...seat, roll };
    });
    const best = Math.max(...seats.map((s) => s.roll));
    const winners = seats.filter((s) => s.roll === best).map((s) => s.id);
    const pot = round1(table.stake * seats.length);
    const share = round1(pot / winners.length);
    const payouts = {};
    winners.forEach((id) => { payouts[id] = share; });
    const detail = seats.map((s) => `${s.name} ${s.roll}`).join(" · ");
    const names = seats.filter((s) => winners.includes(s.id)).map((s) => s.name).join(", ");
    return {
      seed,
      winners,
      payouts,
      pot,
      seats: seats.map((s) => ({ id: s.id, roll: s.roll })),
      summary: `${detail}. ${names} 승 · 각 ${money(share)}`,
    };
  }

  async function startGambleTable(tableId) {
    if (isServerStopped() || !state?.active) return;
    const table = worldSync.gambleTables[tableId];
    if (!table || table.status !== "open") return;
    if (table.hostId !== state.playerId) {
      toast("🎲", "방장만", "판을 연 사람만 게임을 시작할 수 있습니다.");
      return;
    }
    const seats = gambleSeatList(table);
    if (seats.length < 2) {
      toast("🎲", "인원", "최소 2명이 필요합니다.");
      return;
    }
    // Lock immediately so nobody joins mid-roll
    worldSync.gambleBusy = true;
    try {
      const lockOk = await patchGambleTable(tableId, { status: "locked", updatedAt: Date.now() });
      if (!lockOk) throw new Error("lock");
      table.status = "locked";
      const seed = `${tableId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const result = buildDiceResult(table, seed);
      const nextSeats = { ...(table.seats || {}) };
      (result.seats || []).forEach((row) => {
        const key = safeFbKey(row.id);
        if (nextSeats[key]) nextSeats[key] = { ...nextSeats[key], roll: row.roll };
      });
      const done = {
        ...table,
        seats: nextSeats,
        seed,
        status: "done",
        updatedAt: Date.now(),
        result,
      };
      const ok = await putGambleTable(done);
      if (!ok) throw new Error("put");
      worldSync.gambleTables[tableId] = done;
      tryApplyGambleSettlements();
      renderGambleModal();
      tone(440, .08, "square");
    } catch {
      toast("🎲", "실패", "게임을 시작하지 못했습니다.");
      if (table.status === "locked") {
        await patchGambleTable(tableId, { status: "open", updatedAt: Date.now() }).catch(() => {});
        table.status = "open";
      }
    } finally {
      worldSync.gambleBusy = false;
    }
  }

  function tryApplyGambleSettlements() {
    if (!state?.active || !session?.id) return;
    const me = state.playerId;
    Object.values(worldSync.gambleTables || {}).forEach((table) => {
      if (!table?.id) return;
      const seat = seatOnTable(table, me);
      if (!seat) return;

      if (table.status === "cancelled" && table.result?.refundAll) {
        const key = `${table.id}:refund:${me}`;
        if (readGambleSettled()[key]) return;
        refundGambleStake(seat.stake);
        markGambleSettled(key);
        toast("🎲", "환불", "데스크가 닫혀 바이인을 돌려받았습니다.");
        return;
      }

      if (table.status !== "done" || !table.result) return;
      const key = `${table.id}:payout:${me}`;
      if (readGambleSettled()[key]) return;
      const pay = round1(Number(table.result.payouts?.[me]) || 0);
      if (pay > 0) creditGambleWin(pay);
      markGambleSettled(key);
      const won = (table.result.winners || []).includes(me);
      toast("🎲", won ? "몰빵 승" : (pay > 0 ? "무승부 환불" : "몰빵 패"), table.result.summary || "");
      if (won) tone(660, .12, "square");
    });
  }

  function onGambleClick(event) {
    const join = event.target.closest?.("[data-gamble-join]");
    if (join) {
      joinGambleTable(join.getAttribute("data-gamble-join"));
      return;
    }
    const leave = event.target.closest?.("[data-gamble-leave]");
    if (leave) {
      leaveGambleTable(leave.getAttribute("data-gamble-leave"));
      return;
    }
    const start = event.target.closest?.("[data-gamble-start]");
    if (start) {
      startGambleTable(start.getAttribute("data-gamble-start"));
    }
  }

  function readLotteryClaims() {
    try {
      return JSON.parse(localStorage.getItem(LOTTERY_CLAIM_STORE) || "{}") || {};
    } catch {
      return {};
    }
  }

  function markLotteryClaimed(drawId) {
    if (!drawId) return;
    try {
      const all = readLotteryClaims();
      all[drawId] = Date.now();
      localStorage.setItem(LOTTERY_CLAIM_STORE, JSON.stringify(all));
    } catch { /* quota */ }
  }

  function lotteryTicketList(row) {
    return listFromMap(row?.tickets).sort((a, b) => (Number(a.boughtAt) || 0) - (Number(b.boughtAt) || 0));
  }

  function myLotteryTickets(row, playerId = state?.playerId) {
    return lotteryTicketList(row).filter((t) => t.playerId === playerId);
  }

  function nextLotteryDrawTarget(fromMs = kstClock.ok ? kstNowMs() : Date.now()) {
    const parts = parseKstParts(fromMs);
    const mins = parts.h * 60 + parts.mi + (parts.s || 0) / 60;
    // drawId = 복권 구매일(표시용 오늘). 지급은 그다음 날 08:25.
    // 아침 08:25 전이면 아직 전날 회차(지급은 오늘 08:25).
    if (mins < (8 * 60 + 25)) {
      const buyYmd = shiftYmd(parts.ymd, -1);
      return {
        drawId: buyYmd,
        drawAt: kstMsFromYmdHm(parts.ymd, 8, 25),
        payYmd: parts.ymd,
      };
    }
    return {
      drawId: parts.ymd,
      drawAt: kstMsFromYmdHm(shiftYmd(parts.ymd, 1), 8, 25),
      payYmd: shiftYmd(parts.ymd, 1),
    };
  }

  function lotteryPayYmd(row) {
    if (!row?.drawId) return "";
    if (row.drawAt) {
      try { return parseKstParts(Number(row.drawAt)).ymd; } catch { /* fall through */ }
    }
    return shiftYmd(row.drawId, 1);
  }

  function healLotteryDrawSchedule(row, fromMs = kstClock.ok ? kstNowMs() : Date.now()) {
    if (!row || row.status !== "open") return row;
    const correct = nextLotteryDrawTarget(fromMs);
    const today = parseKstParts(fromMs).ymd;
    let next = row;
    if (row.drawId !== correct.drawId || Number(row.drawAt) !== Number(correct.drawAt)) {
      next = {
        ...next,
        drawId: correct.drawId,
        drawAt: correct.drawAt,
        updatedAt: Date.now(),
      };
    }
    // Test draws left future "지난 당첨" dates — drop them if after today.
    if (next.lastDrawId && next.lastDrawId > today) {
      next = {
        ...next,
        lastWinnerId: "",
        lastWinnerName: "",
        lastWinAmount: 0,
        lastDrawId: "",
        updatedAt: Date.now(),
      };
    }
    return next;
  }

  function freshLotteryRound(fromMs) {
    const target = nextLotteryDrawTarget(fromMs);
    return {
      drawId: target.drawId,
      drawAt: target.drawAt,
      pot: LOTTERY_BASE_POT,
      tickets: {},
      status: "open",
      winnerId: "",
      winnerName: "",
      winAmount: 0,
      lastWinnerId: "",
      lastWinnerName: "",
      lastWinAmount: 0,
      lastDrawId: "",
      updatedAt: Date.now(),
    };
  }

  function normalizeLottery(row) {
    if (!row || typeof row !== "object") return null;
    const tickets = {};
    lotteryTicketList(row).forEach((t) => {
      if (!t?.id) return;
      tickets[safeFbKey(t.id)] = {
        id: String(t.id),
        playerId: String(t.playerId || ""),
        playerName: String(t.playerName || t.playerId || ""),
        boughtAt: Number(t.boughtAt) || 0,
      };
    });
    return {
      drawId: String(row.drawId || ""),
      drawAt: Number(row.drawAt) || 0,
      pot: Math.max(LOTTERY_BASE_POT, round1(Number(row.pot) || LOTTERY_BASE_POT)),
      tickets,
      status: row.status === "paid" || row.status === "drawing" ? row.status : "open",
      winnerId: String(row.winnerId || ""),
      winnerName: String(row.winnerName || ""),
      winAmount: round1(Number(row.winAmount) || 0),
      lastWinnerId: String(row.lastWinnerId || ""),
      lastWinnerName: String(row.lastWinnerName || ""),
      lastWinAmount: round1(Number(row.lastWinAmount) || 0),
      lastDrawId: String(row.lastDrawId || ""),
      pendingPay: row.pendingPay && typeof row.pendingPay === "object" ? {
        drawId: String(row.pendingPay.drawId || ""),
        playerId: String(row.pendingPay.playerId || ""),
        playerName: String(row.pendingPay.playerName || ""),
        amount: round1(Number(row.pendingPay.amount) || 0),
        at: Number(row.pendingPay.at) || 0,
      } : null,
      updatedAt: Number(row.updatedAt) || 0,
    };
  }

  function applyLottery(value) {
    const normalized = healLotteryDrawSchedule(normalizeLottery(value));
    worldSync.lottery = normalized;
    const rawId = value && typeof value === "object" ? String(value.drawId || "") : "";
    if (normalized?.drawId && rawId && normalized.drawId !== rawId) {
      const db = firebaseDb();
      if (db) {
        db.ref(LOTTERY_PATH).transaction((current) => {
          const cur = normalizeLottery(current);
          if (!cur || cur.status !== "open") return;
          const healed = healLotteryDrawSchedule(cur);
          if (healed.drawId === cur.drawId && healed.drawAt === cur.drawAt) return;
          return healed;
        }).catch(() => {});
      }
    }
    tryClaimLotteryWin();
    if (els.lotteryModal && !els.lotteryModal.hidden) renderLotteryModal();
  }

  function subscribeLottery() {
    const db = firebaseDb();
    if (!db) {
      firebaseRestRequest(LOTTERY_PATH, {}, FIREBASE_READ_TIMEOUT_MS)
        .then(async (res) => { if (res.ok) applyLottery(await res.json()); })
        .catch(() => {});
      return;
    }
    if (worldSync.lotteryUnsub) return;
    const handler = (snap) => applyLottery(snap.val());
    db.ref(LOTTERY_PATH).on("value", handler);
    worldSync.lotteryUnsub = handler;
  }

  async function ensureLotteryRound() {
    const existing = healLotteryDrawSchedule(normalizeLottery(worldSync.lottery));
    if (existing?.drawId && existing.drawAt) {
      worldSync.lottery = existing;
      return existing;
    }
    const db = firebaseDb();
    const fresh = freshLotteryRound();
    if (db) {
      const result = await db.ref(LOTTERY_PATH).transaction((current) => {
        const cur = healLotteryDrawSchedule(normalizeLottery(current));
        if (cur?.drawId && cur.drawAt) return cur;
        return fresh;
      }, undefined, false);
      const val = healLotteryDrawSchedule(normalizeLottery(result.snapshot.val()));
      worldSync.lottery = val || fresh;
      return worldSync.lottery;
    }
    const res = await firebaseRestRequest(LOTTERY_PATH, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fresh),
    }, FIREBASE_WRITE_TIMEOUT_MS);
    if (res.ok) {
      worldSync.lottery = fresh;
      return fresh;
    }
    return null;
  }

  function openLotteryModal() {
    if (isServerStopped()) {
      showHaltedScreen();
      return;
    }
    if (!state?.active) {
      toast("🎟️", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    if (els.lotteryError) {
      els.lotteryError.hidden = true;
      els.lotteryError.textContent = "";
    }
    if (els.lotteryForce) els.lotteryForce.hidden = !staffTestRequested();
    ensureLotteryRound().then(() => {
      renderLotteryModal();
      maybeSettleLottery();
    });
    openModal(els.lotteryModal);
  }

  function renderLotteryModal() {
    if (!els.lotteryModal) return;
    const row = worldSync.lottery;
    const tickets = lotteryTicketList(row);
    const mine = myLotteryTickets(row);
    const pot = row ? round1(row.pot) : LOTTERY_BASE_POT;
    if (els.lotteryPotValue) els.lotteryPotValue.textContent = money(pot);
    if (els.lotteryDrawLabel) {
      const payYmd = lotteryPayYmd(row);
      els.lotteryDrawLabel.textContent = row?.drawId
        ? `이번 회차 지급 ${payYmd || "다음날"} 08:25 · 현재 ${tickets.length}장`
        : "회차 준비 중";
    }
    if (els.lotteryStatus) {
      els.lotteryStatus.textContent = mine.length
        ? `내 복권 ${mine.length}/${LOTTERY_MAX_TICKETS}장 · 지급은 산 다음날 08:25`
        : `1인 최대 ${LOTTERY_MAX_TICKETS}장 · 장당 ${money(LOTTERY_TICKET_PRICE)}`;
    }
    if (els.lotteryMine) {
      els.lotteryMine.innerHTML = mine.length
        ? `<ul class="lottery-ticket-list">${mine.map((t, i) => `<li>내 복권 ${i + 1} · ${esc(t.id)}</li>`).join("")}</ul>`
        : `<p class="lottery-empty">아직 산 복권이 없습니다.</p>`;
    }
    if (els.lotteryBuy) {
      els.lotteryBuy.disabled = !row || row.status !== "open" || mine.length >= LOTTERY_MAX_TICKETS || round1(state.cash) < LOTTERY_TICKET_PRICE || isServerStopped();
      els.lotteryBuy.textContent = mine.length >= LOTTERY_MAX_TICKETS
        ? `최대 ${LOTTERY_MAX_TICKETS}장까지`
        : `복권 1장 사기 (${money(LOTTERY_TICKET_PRICE)}) →`;
    }
    if (els.lotteryLast) {
      if (row?.lastWinnerId) {
        els.lotteryLast.hidden = false;
        els.lotteryLast.innerHTML = `<b>지난 당첨</b><span>${esc(row.lastWinnerName || row.lastWinnerId)} · ${money(row.lastWinAmount || 0)} · 구매일 ${esc(row.lastDrawId || "")}</span>`;
      } else {
        els.lotteryLast.hidden = true;
        els.lotteryLast.innerHTML = "";
      }
    }
  }

  function setLotteryError(msg) {
    if (!els.lotteryError) return;
    if (!msg) {
      els.lotteryError.hidden = true;
      els.lotteryError.textContent = "";
      return;
    }
    els.lotteryError.hidden = false;
    els.lotteryError.textContent = msg;
  }

  async function buyLotteryTicket() {
    if (worldSync.lotteryBusy || isServerStopped() || !state?.active) return;
    setLotteryError("");
    if (round1(state.cash) < LOTTERY_TICKET_PRICE) {
      setLotteryError("현금이 부족합니다.");
      return;
    }
    worldSync.lotteryBusy = true;
    if (els.lotteryBuy) els.lotteryBuy.disabled = true;
    try {
      await ensureLotteryRound();
      const db = firebaseDb();
      const ticketId = makeId("lt");
      const now = Date.now();
      let bought = false;
      if (db) {
        const result = await db.ref(LOTTERY_PATH).transaction((current) => {
          const row = normalizeLottery(current) || freshLotteryRound();
          if (row.status !== "open") return;
          const mine = myLotteryTickets(row, state.playerId);
          if (mine.length >= LOTTERY_MAX_TICKETS) return;
          row.tickets = row.tickets || {};
          row.tickets[safeFbKey(ticketId)] = {
            id: ticketId,
            playerId: state.playerId,
            playerName: state.playerName,
            boughtAt: now,
          };
          row.pot = round1(Math.max(LOTTERY_BASE_POT, Number(row.pot) || LOTTERY_BASE_POT) + LOTTERY_TICKET_PRICE);
          row.updatedAt = now;
          row.status = "open";
          return row;
        }, undefined, false);
        bought = !!result.committed;
        if (bought) applyLottery(result.snapshot.val());
        else {
          const snap = normalizeLottery(result.snapshot.val());
          const mine = myLotteryTickets(snap, state.playerId);
          setLotteryError(mine.length >= LOTTERY_MAX_TICKETS ? "한 사람당 최대 2장입니다." : "지금은 살 수 없습니다.");
        }
      } else {
        setLotteryError("서버에 연결되지 않았습니다.");
      }
      if (bought) {
        state.cash = round1(state.cash - LOTTERY_TICKET_PRICE);
        writeWallet();
        queuePush();
        renderSummary();
        toast("🎟️", "복권 구매", `100만원을 넣고 상금이 ${money(worldSync.lottery?.pot || 0)}가 되었습니다.`);
        renderLotteryModal();
      }
    } catch {
      setLotteryError("구매에 실패했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      worldSync.lotteryBusy = false;
      renderLotteryModal();
    }
  }

  function pickLotteryWinner(tickets, seed) {
    if (!tickets.length) return null;
    const idx = Math.floor(hashUnit(`${seed}|lotto`) * tickets.length) % tickets.length;
    return tickets[idx];
  }

  async function maybeSettleLottery(force = false) {
    if (worldSync.lotterySettleBusy || isServerStopped()) return;
    const row = normalizeLottery(worldSync.lottery);
    if (!row?.drawId || row.status !== "open") return;
    const now = kstClock.ok ? kstNowMs() : Date.now();
    if (!force && now < Number(row.drawAt || 0)) return;
    const db = firebaseDb();
    if (!db) return;
    worldSync.lotterySettleBusy = true;
    try {
      const result = await db.ref(LOTTERY_PATH).transaction((current) => {
        const cur = normalizeLottery(current);
        if (!cur || cur.status !== "open") return;
        const ts = kstClock.ok ? kstNowMs() : Date.now();
        if (!force && ts < Number(cur.drawAt || 0)) return;
        const tickets = lotteryTicketList(cur);
        // Next round is always the next 08:25 from *now*, not old drawAt+1 day
        // (force/test draws were skipping an extra day).
        const nextTarget = nextLotteryDrawTarget(ts + 1000);
        if (!tickets.length) {
          return {
            ...cur,
            drawId: nextTarget.drawId,
            drawAt: nextTarget.drawAt,
            pot: LOTTERY_BASE_POT,
            tickets: {},
            status: "open",
            winnerId: "",
            winnerName: "",
            winAmount: 0,
            updatedAt: Date.now(),
          };
        }
        const winner = pickLotteryWinner(tickets, `${cur.drawId}|${cur.drawAt}|${tickets.length}`);
        const amount = round1(Number(cur.pot) || LOTTERY_BASE_POT);
        return {
          drawId: nextTarget.drawId,
          drawAt: nextTarget.drawAt,
          pot: LOTTERY_BASE_POT,
          tickets: {},
          status: "open",
          winnerId: "",
          winnerName: "",
          winAmount: 0,
          lastWinnerId: winner.playerId,
          lastWinnerName: winner.playerName || winner.playerId,
          lastWinAmount: amount,
          lastDrawId: cur.drawId,
          pendingPay: {
            drawId: cur.drawId,
            playerId: winner.playerId,
            playerName: winner.playerName || winner.playerId,
            amount,
            at: Date.now(),
          },
          updatedAt: Date.now(),
        };
      }, undefined, false);
      if (result.committed) {
        applyLottery(result.snapshot.val());
        tryClaimLotteryWin();
        if (els.lotteryModal && !els.lotteryModal.hidden) renderLotteryModal();
      }
    } catch {
      /* retry next tick */
    } finally {
      worldSync.lotterySettleBusy = false;
    }
  }

  function tryClaimLotteryWin() {
    if (!state?.active || !state.playerId) return;
    const row = worldSync.lottery;
    const pay = row?.pendingPay;
    if (!pay || pay.playerId !== state.playerId) return;
    const key = `${pay.drawId}:${pay.playerId}`;
    if (readLotteryClaims()[key]) return;
    const amount = round1(Number(pay.amount) || 0);
    if (amount <= 0) return;
    markLotteryClaimed(key);
    state.cash = round1(state.cash + amount);
    writeWallet();
    queuePush();
    renderSummary();
    toast("🎟️", "복권 당첨", `${money(amount)}을 받았습니다. (${pay.drawId} 추첨)`);
    tone(660, .14, "square");
    const db = firebaseDb();
    if (db) {
      db.ref(LOTTERY_PATH).transaction((current) => {
        if (!current?.pendingPay || current.pendingPay.playerId !== state.playerId) return;
        if (String(current.pendingPay.drawId) !== String(pay.drawId)) return;
        const next = { ...current };
        delete next.pendingPay;
        next.paidAt = Date.now();
        next.updatedAt = Date.now();
        return next;
      }).catch(() => {});
    }
  }

  async function forceLotteryDraw() {
    if (!staffTestRequested()) return;
    await maybeSettleLottery(true);
    toast("🎟️", "테스트 추첨", "강제 추첨을 실행했습니다.");
    renderLotteryModal();
  }

  function normalizeChatRoom(room) {
    if (!room || typeof room !== "object") return null;
    return {
      ...room,
      messages: listFromMap(room.messages).sort((a, b) => {
        const at = Number(a.createdAt || 0);
        const bt = Number(b.createdAt || 0);
        if (at !== bt) return at - bt;
        return String(a.id || "").localeCompare(String(b.id || ""));
      }).slice(-CHAT_CAP),
    };
  }

  function worldFromFirebase(val) {
    if (!val || typeof val !== "object") return null;
    const meta = val.meta && typeof val.meta === "object" ? val.meta : val;
    const assets = listFromMap(val.assets || meta.assets).map((asset) => ({
      ...asset,
      ad: asset.ad ? { ...asset.ad, image: safeImageUrl(asset.ad.image) } : asset.ad,
    }));
    return {
      revision: meta.revision || 0,
      updatedAt: meta.updatedAt || 0,
      week: meta.week,
      season: meta.season,
      lastSettledPeriodId: meta.lastSettledPeriodId || "",
      eventKey: meta.eventKey,
      eventDeck: meta.eventDeck || val.eventDeck || [],
      event: meta.event || val.event,
      botsSpawned: false,
      assets,
      ads: listFromMap(val.ads || meta.ads).map((ad) => ({ ...ad, image: "" })),
      players: listFromMap(val.players || meta.players),
      seenPlayers: listFromMap(val.seenPlayers || meta.seenPlayers),
      chatRooms: listFromMap(val.chatRooms || meta.chatRooms).map(normalizeChatRoom).filter(Boolean),
      lenders: listFromMap(val.lenders || meta.lenders),
      loans: listFromMap(val.loans || meta.loans),
      closed: listFromMap(val.closed || meta.closed),
    };
  }

  function firebaseUpdatesFromPayload(payload) {
    const updates = {
      meta: {
        revision: payload.revision || 0,
        updatedAt: payload.updatedAt || Date.now(),
        week: payload.week,
        season: payload.season,
        lastSettledPeriodId: payload.lastSettledPeriodId || "",
        eventKey: payload.eventKey,
        eventDeck: payload.eventDeck || [],
        event: payload.event || null,
        botsSpawned: false,
        clientBuild: CLIENT_BUILD,
      },
    };
    (payload.assets || []).forEach((asset) => {
      if (!asset?.id) return;
      if (!worldSync.needsSeed && !worldSync.touched.has(asset.id)) return;
      updates[`assets/${safeFbKey(asset.id)}`] = publicAsset(asset);
    });
    [...worldSync.touched].forEach((key) => {
      if (!String(key).startsWith("close:")) return;
      const id = String(key).slice(6);
      if (!id) return;
      const row = worldSync.closed?.[id];
      updates[`assets/${safeFbKey(id)}`] = null;
      updates[`ads/${safeFbKey(id)}`] = null;
      if (row) {
        updates[`closed/${safeFbKey(id)}`] = {
          id: row.id || id,
          founderId: row.founderId || "",
          founderName: row.founderName || "",
          name: row.name || "",
          symbol: row.symbol || "",
          at: Number(row.at) || Date.now(),
          clientBuild: CLIENT_BUILD,
        };
      }
    });
    (payload.players || []).filter((player) => player?.id === state?.playerId).forEach((player) => {
      if (!player?.id || isBanned(player.id)) return;
      updates[`players/${safeFbKey(player.id)}`] = player;
    });
    (payload.seenPlayers || []).filter((item) => item?.id === state?.playerId).forEach((item) => {
      if (!item?.id) return;
      updates[`seenPlayers/${safeFbKey(item.id)}`] = item;
    });
    (payload.ads || []).filter((ad) => worldSync.needsSeed || worldSync.touched.has(ad?.assetId)).forEach((ad, index) => {
      const key = safeFbKey(ad?.assetId || ad?.id || `ad-${index}`);
      updates[`ads/${key}`] = ad;
    });
    (payload.lenders || []).forEach((lender) => {
      if (!lender?.id) return;
      if (!worldSync.touched.has(`lend:${lender.id}`)) return;
      const row = publicLender(lender);
      if (row) updates[`lenders/${safeFbKey(lender.id)}`] = row;
    });
    (payload.loans || []).forEach((loan) => {
      if (!loan?.id) return;
      const mine = loan.borrowerId === state?.playerId || loan.lenderId === `ln-${state?.playerId}`;
      if (!mine && !worldSync.touched.has(`loan:${loan.id}`)) return;
      const row = publicLoan(loan);
      if (row) updates[`loans/${safeFbKey(loan.id)}`] = row;
    });
    return updates;
  }

  function readLocalWorld() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_WORLD_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeLocalWorld(payload) {
    try {
      localStorage.setItem(LOCAL_WORLD_KEY, JSON.stringify(payload));
    } catch {
      /* quota */
    }
  }

  async function fetchWithTimeout(url, options = {}, ms = FETCH_MS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { ...options, cache: options.cache || "no-store", signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function useDeviceKst() {
    kstClock.ok = true;
    kstClock.offsetMs = 0;
    kstClock.fetchedAt = Date.now();
    kstClock.source = "device";
    kstClock.parts = parseKstParts(Date.now());
  }

  function stripBotsFromWorld(payload) {
    if (!payload) return payload;
    payload.players = (payload.players || []).filter((player) => !player.bot && !String(player.id || "").startsWith("bot-"));
    payload.assets = (payload.assets || []).filter((asset) => !String(asset.founderId || "").startsWith("bot-") && !String(asset.id || "").startsWith("co-bot"));
    return payload;
  }

  function humansRanked() {
    if (!state) return [];
    syncLocalPlayer();
    const byId = new Map();
    (state.players || []).forEach((player) => {
      if (!player?.id || player.bot || String(player.id).startsWith("bot-")) return;
      if (String(player.id).startsWith("guest-") && player.id !== state.playerId) return;
      if (isBanned(player.id) && player.id !== state.playerId) return;
      byId.set(player.id, player);
    });
    const mine = state.players.find((item) => item.id === state.playerId);
    if (mine) byId.set(mine.id, mine);
    if (!session && !state.active) byId.delete(state.playerId);
    return [...byId.values()]
      .map((player) => {
        const total = player.id === state.playerId ? totalAssets() : playerTotal(player);
        return { ...player, total: Number.isFinite(total) ? total : 0 };
      })
      .filter((player) => player.id === state.playerId || !isHiddenWealth(player))
      .sort((a, b) => {
        const dt = (b.total || 0) - (a.total || 0);
        if (dt !== 0) return dt;
        if (a.id === state.playerId) return -1;
        if (b.id === state.playerId) return 1;
        return String(a.name || a.id).localeCompare(String(b.name || b.id), "ko");
      });
  }

  function purgeBots() {
    if (!state) return;
    state.players = (state.players || []).filter((player) => player && !player.bot && !String(player.id || "").startsWith("bot-"));
    state.assets = (state.assets || []).filter((asset) => !String(asset.founderId || "").startsWith("bot-") && !String(asset.id || "").startsWith("co-bot"));
    worldSync.botsSpawned = false;
  }

  function publicPlayer(player) {
    if (!player) return null;
    const cash = player.id === state.playerId ? state.cash : player.cash;
    const holdings = cloneHoldings(player.id === state.playerId ? state.holdings : player.holdings);
    const founded = player.id === state.playerId ? state.founded : player.founded;
    return {
      id: player.id,
      name: player.name,
      cash,
      holdings,
      founded,
      total: player.id === state.playerId ? totalAssets() : (cash || 0) + holdingsValueOf(holdings),
      bot: false,
      updatedAt: Date.now(),
      clientBuild: CLIENT_BUILD,
    };
  }

  function mergePlayers(remotePlayers) {
    const byId = new Map((state.players || []).map((item) => [item.id, item]));
    (remotePlayers || []).forEach((row) => {
      if (!row?.id || row.bot || String(row.id).startsWith("bot-")) return;
      if (String(row.id).startsWith("guest-")) return;
      if (row.id === state.playerId) return;
      if (isBanned(row.id)) return;
      const next = {
        id: row.id,
        name: row.name || row.id,
        cash: row.cash || 0,
        holdings: cloneHoldings(row.holdings),
        founded: row.founded || null,
        total: 0,
        bot: false,
        updatedAt: row.updatedAt || 0,
      };
      const local = byId.get(row.id);
      if (local) Object.assign(local, next);
      else {
        state.players.push(next);
        byId.set(row.id, next);
      }
    });
    purgeBots();
    syncLocalPlayer();
  }

  function publicLender(row) {
    if (!row) return null;
    const ownerId = String(row.ownerId || "");
    const id = String(row.id || (ownerId ? `ln-${ownerId}` : ""));
    if (!id) return null;
    const rate = Math.max(MIN_LEND_RATE, Math.min(MAX_LEND_RATE, Math.round(Number(row.rate) || MIN_LEND_RATE)));
    const pool = Math.max(0, round1(Number(row.pool) || 0));
    return {
      id,
      name: String(row.name || "대출회사").trim().slice(0, 12) || "대출회사",
      ownerId,
      ownerName: String(row.ownerName || ownerId),
      rate,
      pool,
      seed: Math.max(0, round1(Number(row.seed) || pool)),
      createdAt: Number(row.createdAt) || Date.now(),
      clientBuild: CLIENT_BUILD,
    };
  }

  function publicLoan(row) {
    if (!row?.id) return null;
    return {
      id: String(row.id),
      lenderId: String(row.lenderId || ""),
      lenderName: String(row.lenderName || ""),
      borrowerId: String(row.borrowerId || ""),
      borrowerName: String(row.borrowerName || ""),
      principal: Math.max(0, round1(Number(row.principal) || 0)),
      rate: Math.max(MIN_LEND_RATE, Math.min(MAX_LEND_RATE, Math.round(Number(row.rate) || MIN_LEND_RATE))),
      paid: Math.max(0, round1(Number(row.paid) || 0)),
      openedPeriod: String(row.openedPeriod || ""),
      status: row.status === "closed" ? "closed" : "open",
      updatedAt: Number(row.updatedAt) || Date.now(),
      clientBuild: CLIENT_BUILD,
    };
  }

  function mergeLoanList(localList, remoteList) {
    const byId = new Map();
    (localList || []).forEach((item) => {
      if (item?.id) byId.set(item.id, item);
    });
    (remoteList || []).forEach((row) => {
      const next = publicLoan(row);
      if (!next) return;
      const local = byId.get(next.id);
      if (local && worldSync.touched.has(`loan:${next.id}`)) return;
      if (local && (Number(local.updatedAt) || 0) > (Number(next.updatedAt) || 0)) return;
      if (local && (Number(local.paid) || 0) > (Number(next.paid) || 0)) {
        next.paid = Number(local.paid) || 0;
        if (local.status === "closed") next.status = "closed";
      }
      if (local) Object.assign(local, next);
      else byId.set(next.id, next);
    });
    return [...byId.values()];
  }

  function mergeLenders(remote, preferLocal) {
    const byId = new Map((state.lenders || []).map((item) => [item.id, item]));
    (remote || []).forEach((row) => {
      const next = publicLender(row);
      if (!next) return;
      const local = byId.get(next.id);
      const keepPool = preferLocal && worldSync.touched.has(`lend:${next.id}`);
      if (local) {
        local.name = next.name || local.name;
        local.ownerName = next.ownerName || local.ownerName;
        local.rate = keepPool ? local.rate : next.rate;
        if (!keepPool) local.pool = next.pool;
        local.seed = keepPool ? local.seed : next.seed;
      } else {
        state.lenders.push(next);
        byId.set(next.id, next);
      }
    });
    const mine = (state.lenders || []).find((item) => item.ownerId === state.playerId);
    if (mine) {
      state.lending = {
        id: mine.id,
        name: mine.name,
        rate: mine.rate,
        seed: mine.seed,
      };
    }
  }

  function mergeLoans(remote) {
    state.loans = mergeLoanList(state.loans, remote);
  }

  function random() {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] / 4294967296;
    }
    return Math.random();
  }

  function shuffled(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function freshAssets() {
    return ASSET_BLUEPRINTS.map((asset) => ({
      ...asset,
      initialPrice: asset.price,
      lastChange: 0,
      history: [asset.price],
      ticks: [asset.price],
      weekFlow: 0,
      lastFlow: 0,
      weekOpen: asset.price,
      playerCompany: false,
      founderId: null,
      founderName: "",
      trust: 0.72,
      adWeeks: 0,
      ad: null,
      opsNote: "",
      opsShock: 0,
    }));
  }

  function ensureCoreListings() {
    if (!state?.assets) return;
    const byId = new Map(state.assets.map((asset) => [asset.id, asset]));
    const cores = ASSET_BLUEPRINTS.map((bp) => {
      const existing = byId.get(bp.id);
      if (existing && !existing.playerCompany) {
        existing.playerCompany = false;
        existing.founderId = null;
        ensureHolding(state.holdings, bp.id);
        return existing;
      }
      const row = {
        ...bp,
        initialPrice: existing?.initialPrice || bp.price,
        lastChange: existing?.lastChange || 0,
        history: existing?.history?.length ? existing.history : [existing?.price || bp.price],
        ticks: existing?.ticks?.length ? existing.ticks : [existing?.price || bp.price],
        weekFlow: existing?.weekFlow || 0,
        lastFlow: existing?.lastFlow || 0,
        weekOpen: existing?.weekOpen || existing?.price || bp.price,
        price: existing?.price || bp.price,
        playerCompany: false,
        founderId: null,
        founderName: "",
        trust: 0.72,
        adWeeks: 0,
        ad: existing?.ad || null,
        opsNote: "",
        opsShock: 0,
      };
      ensureHolding(state.holdings, bp.id);
      return row;
    });
    const extras = state.assets.filter((asset) => !CORE_ASSET_IDS.includes(asset.id));
    state.assets = [...cores, ...extras];
    if (!selectedChartId || !state.assets.some((asset) => asset.id === selectedChartId && isSchoolListing(asset))) {
      selectedChartId = state.assets.find((asset) => isSchoolListing(asset))?.id || "";
    }
  }

  function emptyHolding() {
    return { qty: 0, avg: 0 };
  }

  function freshHoldings(assets = ASSET_BLUEPRINTS) {
    return Object.fromEntries(assets.map((asset) => [asset.id, emptyHolding()]));
  }

  function ensureHolding(holdings, id) {
    if (!holdings[id]) holdings[id] = emptyHolding();
    return holdings[id];
  }

  function createState(modeKey = "rookie", active = false) {
    const config = MODES[modeKey] || MODES.rookie;
    const assets = freshAssets();
    return {
      active,
      locked: !active,
      modeKey,
      config,
      season: 1,
      week: 1,
      cash: config.cash,
      initialCash: config.cash,
      goal: config.goal,
      research: config.research,
      energy: config.energy,
      energyMax: config.energy,
      assets,
      holdings: freshHoldings(assets),
      eventDeck: shuffled(EVENTS).slice(0, MAX_WEEKS),
      event: null,
      expected: {},
      changes: {},
      analyzed: new Set(),
      intel: {},
      weekJobs: [],
      weekPlays: [],
      jobsDone: new Set(),
      intelDone: new Set(),
      playDone: new Set(),
      missions: new Set(),
      badges: new Set(),
      trades: 0,
      log: [],
      analyses: 0,
      cashSafeWeeks: 0,
      profitableSales: 0,
      laborIncome: 0,
      intelCount: 0,
      playCount: 0,
      jobsCount: 0,
      terminal: false,
      seasonBreak: false,
      currentPlay: null,
      playMode: "global",
      roomCode: "GLOBAL",
      playerId: session?.id || "guest",
      playerName: session?.nick || session?.id || "투자자",
      founded: null,
      lending: null,
      lenders: [],
      loans: [],
      ads: [],
      players: [],
      adDone: false,
      sessionOpen: true,
    };
  }

  function isAuthority() {
    return true;
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function safeColor(value) {
    const color = String(value || "");
    return /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#c45c26";
  }

  function safeImageUrl(value) {
    const url = String(value || "");
    return url.length <= MAX_AD_IMAGE_DATA_LENGTH && /^data:image\/(?:png|jpe?g|webp);base64,/i.test(url) ? url : "";
  }

  function makeId(prefix) {
    return `${prefix}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  }

  function bufToHex(buf) {
    return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hexToBuf(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  function randomBytes(n) {
    const out = new Uint8Array(n);
    if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(out);
    else for (let i = 0; i < n; i += 1) out[i] = Math.floor(Math.random() * 256);
    return out;
  }

  function sha256Bytes(bytes) {
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;
    const bitLen = bytes.length * 8;
    const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 4, bitLen, false);
    const w = new Uint32Array(64);
    for (let i = 0; i < padded.length; i += 64) {
      for (let t = 0; t < 16; t += 1) w[t] = view.getUint32(i + t * 4, false);
      for (let t = 16; t < 64; t += 1) {
        const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
        const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;
      for (let t = 0; t < 64; t += 1) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }
      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }
    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, h0);
    outView.setUint32(4, h1);
    outView.setUint32(8, h2);
    outView.setUint32(12, h3);
    outView.setUint32(16, h4);
    outView.setUint32(20, h5);
    outView.setUint32(24, h6);
    outView.setUint32(28, h7);
    return out;
  }

  async function sha256Digest(data) {
    if (globalThis.crypto?.subtle) {
      return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
    }
    return sha256Bytes(data);
  }

  async function hashPassword(password, saltHex) {
    const enc = new TextEncoder();
    const salt = saltHex ? hexToBuf(saltHex) : randomBytes(16);
    const pass = enc.encode(password);
    const data = new Uint8Array(salt.length + pass.length);
    data.set(salt);
    data.set(pass, salt.length);
    const digest = await sha256Digest(data);
    return { hash: bufToHex(digest), salt: bufToHex(salt) };
  }

  function readAccounts() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORE) || "{}");
    } catch {
      return {};
    }
  }

  function writeAccounts(accounts) {
    localStorage.setItem(AUTH_STORE, JSON.stringify(accounts));
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_STORE) || "null");
    } catch {
      return null;
    }
  }

  function writeSession(next) {
    session = next;
    if (next) localStorage.setItem(SESSION_STORE, JSON.stringify(next));
    else localStorage.removeItem(SESSION_STORE);
    renderAccount();
  }

  function renderAccount() {
    if (!els.accountButton) return;
    if (session) {
      els.accountButton.textContent = session.nick;
      els.accountButton.classList.add("is-in");
    } else {
      els.accountButton.textContent = "로그인";
      els.accountButton.classList.remove("is-in");
    }
  }

  function setAuthMode(mode) {
    authMode = mode;
    $$(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.auth === mode));
    els.authTitle.textContent = mode === "login" ? "로그인" : "계좌 만들기";
    els.authSubmit.innerHTML = mode === "login" ? `로그인 <span>→</span>` : `계좌 만들기 <span>→</span>`;
    if (els.authLead) {
      els.authLead.textContent = mode === "login"
        ? "아이디와 비밀번호만 있으면 다른 폰에서도 로그인할 수 있습니다. 처음이면 회원가입하세요."
        : "회원가입하면 투자 계좌가 개설됩니다. 같은 기기에서는 계정을 2개까지 만들 수 있습니다.";
    }
    els.authNickWrap.hidden = mode === "login";
    els.authPass.autocomplete = mode === "login" ? "current-password" : "new-password";
    els.authError.hidden = true;
  }

  function showAuthError(message) {
    els.authError.hidden = false;
    els.authError.textContent = message;
  }

  function deviceId() {
    try {
      let value = localStorage.getItem(DEVICE_STORE);
      if (!value) {
        value = window.crypto?.randomUUID?.() || `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(DEVICE_STORE, value);
      }
      return value;
    } catch {
      return `dev-${Date.now().toString(36)}`;
    }
  }

  function readDeviceAccountIds() {
    try {
      const raw = localStorage.getItem(DEVICE_ACCOUNTS_STORE);
      if (raw == null) {
        const seeded = Object.keys(readAccounts());
        writeDeviceAccountIds(seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const ids = [];
      const seen = new Set();
      parsed.forEach((id) => {
        const key = String(id || "").trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        ids.push(key);
      });
      return ids;
    } catch {
      return [];
    }
  }

  function writeDeviceAccountIds(ids) {
    const unique = [];
    const seen = new Set();
    ids.forEach((id) => {
      const key = String(id || "").trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      unique.push(key);
    });
    try {
      localStorage.setItem(DEVICE_ACCOUNTS_STORE, JSON.stringify(unique));
    } catch {
      /* quota */
    }
    return unique;
  }

  function rememberDeviceAccount(id) {
    const ids = readDeviceAccountIds();
    if (!ids.includes(id)) ids.push(id);
    return writeDeviceAccountIds(ids);
  }

  function deviceAccountsFromNode(node) {
    const accounts = node?.accounts;
    if (!accounts || typeof accounts !== "object") return {};
    const out = {};
    Object.keys(accounts).forEach((key) => {
      const row = accounts[key];
      const id = String(row?.id || key || "").trim().toLowerCase();
      if (!id) return;
      out[safeFbKey(id)] = row && typeof row === "object"
        ? { ...row, id }
        : { id, nick: id, createdAt: Date.now() };
    });
    return out;
  }

  async function releaseGlobalHandle(id) {
    try {
      await firebaseRestRequest(`bull-lab/handles/${safeFbKey(id)}`, { method: "DELETE" }, FIREBASE_READ_TIMEOUT_MS);
    } catch {
      /* handle stays reserved */
    }
  }

  async function reserveDeviceSlot(id, nick) {
    const localIds = readDeviceAccountIds();
    if (!localIds.includes(id) && localIds.length >= MAX_DEVICE_ACCOUNTS) return false;
    const path = `${DEVICE_PATH}/${safeFbKey(deviceId())}`;
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const read = await firebaseRestRequest(path, { headers: { "X-Firebase-ETag": "true" } });
        if (!read.ok) return null;
        const etag = read.headers.get("ETag");
        const current = await read.json();
        const accounts = deviceAccountsFromNode(current);
        if (accounts[safeFbKey(id)]) {
          rememberDeviceAccount(id);
          return true;
        }
        if (Object.keys(accounts).length >= MAX_DEVICE_ACCOUNTS) return false;
        accounts[safeFbKey(id)] = {
          id,
          nick: String(nick || id).slice(0, 16),
          createdAt: Date.now(),
        };
        const body = {
          createdAt: Number(current?.createdAt) || Date.now(),
          accounts,
        };
        const headers = { "Content-Type": "application/json" };
        if (etag) headers["If-Match"] = etag;
        const write = await firebaseRestRequest(path, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        if (write.status === 412) continue;
        if (!write.ok) return null;
        rememberDeviceAccount(id);
        return true;
      }
      return null;
    } catch {
      return null;
    }
  }

  function saveLocalAccount(row) {
    if (!row?.id || !row.salt || !row.hash) return;
    const accounts = readAccounts();
    accounts[row.id] = {
      id: row.id,
      nick: String(row.nick || row.id).slice(0, 16),
      salt: row.salt,
      hash: row.hash,
      created: Number(row.created || row.createdAt) || Date.now(),
    };
    writeAccounts(accounts);
  }

  async function fetchRemoteAccount(id) {
    try {
      const response = await firebaseRestRequest(`${ACCOUNT_PATH}/${safeFbKey(id)}`, {}, FIREBASE_WRITE_TIMEOUT_MS);
      if (!response.ok) return null;
      const row = await response.json();
      if (!row || typeof row !== "object" || !row.hash || !row.salt) return null;
      return { ...row, id: row.id || id };
    } catch {
      return null;
    }
  }

  async function handleExists(id) {
    try {
      const response = await firebaseRestRequest(`bull-lab/handles/${safeFbKey(id)}`, {}, FIREBASE_WRITE_TIMEOUT_MS);
      if (!response.ok) return null;
      return !!(await response.json());
    } catch {
      return null;
    }
  }

  async function publishRemoteAccount(id, nick, hashed, created) {
    const path = `${ACCOUNT_PATH}/${safeFbKey(id)}`;
    const body = {
      id,
      nick: String(nick || id).slice(0, 16),
      salt: hashed.salt,
      hash: hashed.hash,
      createdAt: Number(created) || Date.now(),
    };
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const read = await firebaseRestRequest(path, { headers: { "X-Firebase-ETag": "true" } });
        if (!read.ok) return null;
        const etag = read.headers.get("ETag");
        const current = await read.json();
        if (current?.hash && current?.salt) return current;
        const headers = { "Content-Type": "application/json" };
        if (etag) headers["If-Match"] = etag;
        const write = await firebaseRestRequest(path, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        if (write.status === 412) continue;
        return write.ok ? body : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function verifyPassword(row, password) {
    if (!row?.salt || !row?.hash) return false;
    const hashed = await hashPassword(password, row.salt);
    return hashed.hash === row.hash;
  }

  async function reserveGlobalHandle(id, nick) {
    try {
      const key = safeFbKey(id);
      const playerResponse = await firebaseRestRequest(`${FIREBASE_WORLD_PATH}/players/${key}`, {}, FIREBASE_READ_TIMEOUT_MS);
      if (playerResponse.ok && await playerResponse.json()) return false;
      const path = `bull-lab/handles/${key}`;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const read = await firebaseRestRequest(path, { headers: { "X-Firebase-ETag": "true" } });
        if (!read.ok) return null;
        const etag = read.headers.get("ETag");
        if (await read.json()) return false;
        const headers = { "Content-Type": "application/json" };
        if (etag) headers["If-Match"] = etag;
        const write = await firebaseRestRequest(path, {
          method: "PUT",
          headers,
          body: JSON.stringify({ id, nick, createdAt: Date.now() }),
        });
        if (write.status === 412) continue;
        return write.ok;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    const id = (els.authId.value || "").trim().toLowerCase();
    const nick = (els.authNick.value || "").trim() || id;
    const password = els.authPass.value || "";
    if (!/^[a-z0-9_]{3,16}$/.test(id)) {
      showAuthError("아이디는 3–16자의 영문·숫자·밑줄만 가능합니다.");
      return;
    }
    if (password.length < 4) {
      showAuthError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    const accounts = readAccounts();
    if (authMode === "register") {
      if (accounts[id]) {
        showAuthError("이미 있는 아이디입니다.");
        return;
      }
      const localSlots = readDeviceAccountIds();
      writeDeviceAccountIds(localSlots);
      if (localSlots.length >= MAX_DEVICE_ACCOUNTS && !localSlots.includes(id)) {
        showAuthError("이 기기에서는 계정을 2개까지만 만들 수 있습니다. 이미 만든 아이디로 로그인하세요.");
        return;
      }
      const taken = await fetchRemoteAccount(id);
      if (taken) {
        showAuthError("이미 다른 투자자가 사용 중인 아이디입니다. 로그인하세요.");
        return;
      }
      const reserved = await reserveGlobalHandle(id, nick);
      if (reserved === false) {
        showAuthError("이미 다른 투자자가 사용 중인 아이디입니다. 로그인하세요.");
        return;
      }
      if (reserved === null) {
        showAuthError("공유 시장에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const slotted = await reserveDeviceSlot(id, nick);
      if (slotted === false) {
        await releaseGlobalHandle(id);
        showAuthError("이 기기에서는 계정을 2개까지만 만들 수 있습니다. 이미 만든 아이디로 로그인하세요.");
        return;
      }
      if (slotted === null) {
        await releaseGlobalHandle(id);
        showAuthError("공유 시장에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const hashed = await hashPassword(password);
      const created = Date.now();
      accounts[id] = { id, nick, salt: hashed.salt, hash: hashed.hash, created };
      writeAccounts(accounts);
      rememberDeviceAccount(id);
      await publishRemoteAccount(id, nick, hashed, created);
      writeSession({ id, nick });
      seedNewWallet(id);
    } else {
      let row = accounts[id];
      if (!row) {
        const remote = await fetchRemoteAccount(id);
        if (!remote) {
          const exists = await handleExists(id);
          if (exists) {
            showAuthError("이 아이디는 처음 만든 폰에서 한 번 로그인해야 다른 기기에서도 쓸 수 있습니다.");
            return;
          }
          if (exists === null) {
            showAuthError("공유 시장에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
            return;
          }
          showAuthError("계정을 찾을 수 없습니다. 회원가입을 먼저 하세요.");
          return;
        }
        if (!(await verifyPassword(remote, password))) {
          showAuthError("비밀번호가 맞지 않습니다.");
          return;
        }
        saveLocalAccount(remote);
        writeSession({ id, nick: remote.nick || id });
      } else {
        if (!(await verifyPassword(row, password))) {
          showAuthError("비밀번호가 맞지 않습니다.");
          return;
        }
        writeSession({ id, nick: row.nick || id });
        publishRemoteAccount(id, row.nick || id, { salt: row.salt, hash: row.hash }, row.created).catch(() => {});
      }
    }
    await fetchBans();
    if (isBanned(id)) {
      writeSession(null);
      showAuthError("이 계좌는 강퇴되어 로그인할 수 없습니다.");
      return;
    }
    els.authPass.value = "";
    closeModal(els.authModal);
    toast("🪪", authMode === "register" ? "계좌 개설" : "로그인", authMode === "register"
      ? `${session.nick} 님, 투자 계좌가 만들어졌습니다.`
      : `${session.nick} 님, 다시 오신 것을 환영합니다.`);
    if (authNext === "setup") startGame();
    authNext = "setup";
  }

  function logout() {
    if (state?.active) writeWallet();
    writeSession(null);
    destroyNet();
    worldSync.inMarket = false;
    hideDesk();
    state = createState("rookie", false);
    prepareWeek();
    renderStartCta();
    toast("👋", "로그아웃", "세션을 종료했습니다.");
  }

  function requireSession() {
    if (session) return true;
    authNext = "setup";
    setAuthMode("login");
    openModal(els.authModal);
    return false;
  }

  function sectorLabel(key) {
    return SECTORS.find((item) => item.key === key)?.label || "플레이어 · 비상장 출신";
  }

  function publicEvent(event) {
    if (!event) return null;
    return {
      category: event.category,
      icon: event.icon,
      title: event.title,
      description: event.description,
      themes: event.themes || [],
      note: event.note,
    };
  }

  function cloneHoldings(holdings) {
    const out = {};
    Object.keys(holdings || {}).forEach((id) => {
      out[id] = { qty: holdings[id].qty || 0, avg: holdings[id].avg || 0 };
    });
    return out;
  }

  function holdingsValueOf(holdings) {
    return state.assets.reduce((sum, asset) => {
      const qty = holdings?.[asset.id]?.qty || 0;
      return sum + quotePrice(asset) * qty;
    }, 0);
  }

  function playerTotal(player) {
    if (!player) return 0;
    if (player.id === state.playerId) return totalAssets();
    return round1((player.cash || 0) + holdingsValueOf(player.holdings) + lendingNetFor(player.id));
  }

  function syncLocalPlayer() {
    if (!state) return;
    if (session?.id) state.playerId = session.id;
    if (session?.nick) state.playerName = session.nick;
    const existing = state.players.find((item) => item.id === state.playerId);
    const snapshot = {
      id: state.playerId,
      name: state.playerName || session?.nick || state.playerId,
      cash: Number.isFinite(state.cash) ? state.cash : 0,
      holdings: cloneHoldings(state.holdings),
      founded: state.founded,
      total: totalAssets(),
      bot: false,
      updatedAt: Date.now(),
    };
    if (existing) Object.assign(existing, snapshot);
    else state.players.unshift(snapshot);
    state.players = state.players.filter((player, index, list) => {
      if (!player?.id || player.bot || String(player.id).startsWith("bot-")) return false;
      if (String(player.id).startsWith("guest-") && player.id !== state.playerId) return false;
      return list.findIndex((item) => item.id === player.id) === index;
    });
    if (!state.players.some((item) => item.id === state.playerId)) state.players.unshift(snapshot);
    state.players.forEach((player) => {
      player.total = playerTotal(player);
    });
    writeWallet();
  }

  function readWallets() {
    try {
      return JSON.parse(localStorage.getItem(WALLET_STORE) || "{}");
    } catch {
      return {};
    }
  }

  function readWallet(id) {
    if (!id) return null;
    return readWallets()[id] || null;
  }

  function writeWallet() {
    if (!session?.id || !state?.active) return;
    try {
      const all = readWallets();
      all[session.id] = {
        cash: state.cash,
        holdings: cloneHoldings(state.holdings),
        founded: state.founded,
        lending: state.lending,
        loans: (state.loans || []).filter((loan) => loan.borrowerId === session.id || loan.lenderId === `ln-${session.id}` || loan.lenderId === session.id),
        laborIncome: state.laborIncome,
        initialCash: state.initialCash,
        modeKey: state.modeKey,
        research: state.research,
        energy: state.energy,
        energyMax: state.energyMax,
        missions: [...state.missions],
        badges: [...state.badges],
        trades: state.trades,
        analyses: state.analyses,
        jobsCount: state.jobsCount,
        intelCount: state.intelCount,
        playCount: state.playCount,
        profitableSales: state.profitableSales,
        cashSafeWeeks: state.cashSafeWeeks,
        activityWeek: activityWeekKey(),
        week: state.week,
        season: state.season,
        jobsDone: [...(state.jobsDone || [])],
        intelDone: [...(state.intelDone || [])],
        playDone: [...(state.playDone || [])],
        weekJobIds: (state.weekJobs || []).map((item) => item.id),
        weekPlayIds: (state.weekPlays || []).map((item) => item.id),
        adDone: !!state.adDone,
        analyzed: [...(state.analyzed || [])],
        intel: state.intel && typeof state.intel === "object" ? state.intel : {},
        updatedAt: Date.now(),
      };
      localStorage.setItem(WALLET_STORE, JSON.stringify(all));
    } catch {
      /* quota */
    }
  }

  function applyWallet(row) {
    if (!row) return false;
    if (Number.isFinite(Number(row.cash))) state.cash = Number(row.cash);
    if (row.holdings) {
      state.holdings = cloneHoldings(row.holdings);
      (state.assets || []).forEach((asset) => ensureHolding(state.holdings, asset.id));
    }
    if (row.founded) state.founded = row.founded;
    if (row.lending) state.lending = row.lending;
    if (Array.isArray(row.loans) && row.loans.length) {
      state.loans = mergeLoanList(state.loans, row.loans);
    }
    if (Number.isFinite(row.laborIncome)) state.laborIncome = row.laborIncome;
    if (Number.isFinite(row.initialCash)) state.initialCash = row.initialCash;
    if (Number.isFinite(row.research)) state.research = row.research;
    applyWeekActivity(row);
    if (Number.isFinite(row.trades)) state.trades = row.trades;
    if (Number.isFinite(row.analyses)) state.analyses = row.analyses;
    if (Number.isFinite(row.jobsCount)) state.jobsCount = row.jobsCount;
    if (Number.isFinite(row.intelCount)) state.intelCount = row.intelCount;
    if (Number.isFinite(row.playCount)) state.playCount = row.playCount;
    if (Number.isFinite(row.profitableSales)) state.profitableSales = row.profitableSales;
    if (Number.isFinite(row.cashSafeWeeks)) state.cashSafeWeeks = row.cashSafeWeeks;
    if (Array.isArray(row.missions)) state.missions = new Set(row.missions);
    if (Array.isArray(row.badges)) state.badges = new Set(row.badges);
    return true;
  }

  function seedNewWallet(id) {
    if (!id || readWallet(id)) return;
    try {
      const all = readWallets();
      const cash = MODES.rookie.cash;
      all[id] = {
        cash,
        holdings: {},
        founded: null,
        laborIncome: 0,
        initialCash: cash,
        modeKey: "rookie",
        research: MODES.rookie.research,
        missions: [],
        badges: [],
        trades: 0,
        analyses: 0,
        jobsCount: 0,
        intelCount: 0,
        playCount: 0,
        profitableSales: 0,
        cashSafeWeeks: 0,
        updatedAt: Date.now(),
      };
      localStorage.setItem(WALLET_STORE, JSON.stringify(all));
    } catch {
      /* quota */
    }
  }

  function pickWealthRow(localRow, worldRow) {
    const localCash = Number(localRow?.cash);
    const worldCash = Number(worldRow?.cash);
    const localOk = Number.isFinite(localCash) && localCash > 0;
    const worldOk = Number.isFinite(worldCash) && worldCash > 0;
    if (localOk && !worldOk) return localRow;
    if (worldOk && !localOk) return worldRow;
    const localAt = localRow?.updatedAt || 0;
    const worldAt = worldRow?.updatedAt || 0;
    if (localOk && worldOk) return localAt >= worldAt ? localRow : worldRow;
    return localRow || worldRow || null;
  }

  function restoreAccountWealth(remote) {
    const worldRow = (remote?.players || []).find((item) => item.id === state.playerId);
    const localRow = readWallet(state.playerId);
    const chosen = pickWealthRow(localRow, worldRow);
    if (chosen) applyWallet(chosen);
    ensureTradableCash();
    syncLocalPlayer();
  }

  function ensureTradableCash() {
    if (!state) return;
    if (!Number.isFinite(state.cash)) state.cash = Number(state.initialCash) || Number(state.config?.cash) || 800;
    const invested = holdingsValue();
    if (state.cash < 1 && invested < 1) {
      const wallet = readWallet(state.playerId);
      const wCash = Number(wallet?.cash);
      if (Number.isFinite(wCash) && wCash >= 1) applyWallet(wallet);
      else state.cash = Number(state.initialCash) || Number(state.config?.cash) || 800;
    }
  }

  function flowImpact(asset, signedQty) {
    const float = Math.max(40, asset.float || 400);
    const k = isSchoolListing(asset) ? 0.85 : 0.3;
    const signed = signedQty >= 0 ? 1 : -1;
    const mag = Math.max(0.004, Math.min(0.1, Math.abs((signedQty / float) * k)));
    return signed * mag;
  }

  function currentBotBucket() {
    return Math.floor((kstClock.ok ? kstNowMs() : Date.now()) / 7000);
  }

  function botFlowFor(asset, bucket = currentBotBucket()) {
    if (!asset || !isSchoolListing(asset)) return 0;
    const climate = climateTone();
    let qty = 0;
    PRICE_BOTS.forEach((bot) => {
      const fire = hashUnit(`${asset.id}|${bot.id}|${bucket}|fire`);
      if (fire > 0.24) return;
      const buyP = Math.max(0.12, Math.min(0.88, 0.5 + bot.bias * 0.28 + climate * 0.035));
      const dir = hashUnit(`${asset.id}|${bot.id}|${bucket}|dir`) < buyP ? 1 : -1;
      qty += dir * (1 + Math.floor(hashUnit(`${asset.id}|${bot.id}|${bucket}|qty`) * 3));
    });
    return qty;
  }

  function quotePrice(asset) {
    if (!asset) return 0;
    let price = Number(asset.price) || 0;
    const climate = climateTone();
    if (isSchoolListing(asset)) {
      price *= (1 + climate * 0.007);
      price *= (1 + Math.max(-0.055, Math.min(0.055, flowImpact(asset, botFlowFor(asset)))));
    } else {
      price *= (1 + climate * 0.003);
    }
    return Math.max(5, round1(price));
  }

  function applyFlow(asset, signedQty) {
    asset.weekFlow = (asset.weekFlow || 0) + signedQty;
    if (!isSchoolListing(asset)) return;
    asset.price = Math.max(5, round1(asset.price * (1 + flowImpact(asset, signedQty))));
    pushTick(asset);
  }

  function hashUnit(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    return (h >>> 0) / 4294967296;
  }

  function chartPrice(asset) {
    const sec = Math.floor((kstClock.ok ? kstNowMs() : Date.now()) / 1000);
    const unit = hashUnit(`${asset.id}:${sec}`) * 2 - 1;
    const flow = (asset.weekFlow || 0) / Math.max(40, asset.float || 400);
    const noise = (asset.noise || 0.01) * (asset.playerCompany ? 0.65 : 1);
    const climate = climateTone() * (isSchoolListing(asset) ? 0.0011 : 0.0005);
    const bots = isSchoolListing(asset) ? Math.max(-0.012, Math.min(0.012, flowImpact(asset, botFlowFor(asset)) * 0.4)) : 0;
    const wiggle = flow * 0.01 + unit * noise * 0.055 + climate + bots;
    return Math.max(5, round1(asset.price * (1 + Math.max(-0.018, Math.min(0.018, wiggle)))));
  }

  function ensureTicks(asset) {
    if (!asset) return [];
    if (!Array.isArray(asset.ticks) || asset.ticks.length < 1) {
      const hist = asset.history?.length ? asset.history.slice(-12) : [asset.price];
      asset.ticks = hist.map((price) => price);
    }
    return asset.ticks;
  }

  function pushTick(asset, value) {
    if (!asset) return;
    const ticks = ensureTicks(asset);
    const next = Number.isFinite(value) ? value : chartPrice(asset);
    if (ticks.length && Math.abs(ticks[ticks.length - 1] - next) < 0.0001) {
      ticks[ticks.length - 1] = next;
    } else {
      ticks.push(next);
    }
    if (ticks.length > TICK_CAP) ticks.splice(0, ticks.length - TICK_CAP);
  }

  function sampleLiveTicks() {
    if (!state?.active) return;
    liveCompanies().forEach((asset) => pushTick(asset));
  }

  function sparkPath(values, w, h, pad = 3) {
    const pts = values.length < 2 ? [values[0] || 0, values[0] || 0] : values;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = Math.max(0.08, max - min);
    return pts.map((value, index) => {
      const x = pad + (index / Math.max(1, pts.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (value - min) / span) * (h - pad * 2);
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  function sparkArea(values, w, h) {
    const line = sparkPath(values, w, h);
    if (!line) return "";
    return `${line} L${w} ${h} L0 ${h} Z`;
  }

  function tickToneClass(values) {
    if (!values.length) return "flat";
    const first = values[0];
    const last = values[values.length - 1];
    if (last > first * 1.001) return "up";
    if (last < first * 0.999) return "down";
    return "flat";
  }

  function flowHint(asset) {
    const flow = (asset.weekFlow || asset.lastFlow || 0) + (isSchoolListing(asset) ? botFlowFor(asset) : 0);
    if (flow > 2) return { text: "매수세", type: "up" };
    if (flow < -2) return { text: "매도세", type: "down" };
    return { text: "보합 수급", type: "flat" };
  }

  function getActor(playerId) {
    if (playerId === state.playerId) {
      return {
        id: playerId,
        isLocal: true,
        get cash() { return state.cash; },
        set cash(value) { state.cash = value; },
        holdings: state.holdings,
      };
    }
    const player = state.players.find((item) => item.id === playerId);
    if (!player) return null;
    player.holdings = player.holdings || {};
    return {
      id: playerId,
      isLocal: false,
      get cash() { return player.cash; },
      set cash(value) { player.cash = value; },
      holdings: player.holdings,
      player,
    };
  }

  function executeTrade(playerId, assetId, side, qty, options = {}) {
    const actor = getActor(playerId);
    const asset = assetById(assetId);
    qty = Math.floor(Number(qty) || 0);
    if (!actor || !asset || qty < 1 || !state.active) return { ok: false, err: "locked" };
    if (actor.isLocal && Date.now() < (worldSync.tradeLockUntil || 0)) return { ok: false, err: "busy" };
    const holding = ensureHolding(actor.holdings, assetId);
    const signedQty = side === "buy" ? qty : -qty;
    const px = isSchoolListing(asset)
      ? Math.max(5, round1(asset.price * (1 + flowImpact(asset, signedQty))))
      : asset.price;
    if (side === "buy") {
      const cost = round1(px * qty);
      if (cost > actor.cash + 1e-9) return { ok: false, err: "cash" };
      holding.avg = (holding.avg * holding.qty + cost) / (holding.qty + qty);
      holding.qty += qty;
      actor.cash = round1(actor.cash - cost);
      applyFlow(asset, qty);
      if (actor.isLocal && !options.silent) recordTrade("buy", asset, qty, cost);
    } else {
      if (qty > holding.qty) return { ok: false, err: "qty" };
      const proceeds = round1(px * qty);
      if (actor.isLocal && px > holding.avg) state.profitableSales += 1;
      holding.qty -= qty;
      actor.cash = round1(actor.cash + proceeds);
      if (holding.qty === 0) holding.avg = 0;
      applyFlow(asset, -qty);
      if (actor.isLocal && !options.silent) recordTrade("sell", asset, qty, proceeds);
    }
    if (actor.isLocal) worldSync.tradeLockUntil = Date.now() + 320;
    syncLocalPlayer();
    writeWallet();
    if (state.active) markTouched(assetId);
    return { ok: true };
  }

  function nextTradedAsset(source, fallback, side, qty) {
    const asset = source && typeof source === "object"
      ? JSON.parse(JSON.stringify(source))
      : JSON.parse(JSON.stringify(publicAsset(fallback)));
    const currentPrice = Number(asset.price);
    if (!(currentPrice > 0)) return null;
    const signedQty = side === "buy" ? qty : -qty;
    const live = isSchoolListing(asset);
    const impact = live ? flowImpact(asset, signedQty) : 0;
    const fillPrice = Math.max(5, round1(currentPrice * (1 + impact)));
    if (live) asset.price = fillPrice;
    asset.weekFlow = (Number(asset.weekFlow) || 0) + signedQty;
    asset.clientBuild = CLIENT_BUILD;
    return { asset, fillPrice };
  }

  async function tradeAssetWithRest(assetId, side, qty, localAsset) {
    const path = `${FIREBASE_WORLD_PATH}/assets/${safeFbKey(assetId)}`;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const read = await firebaseRestRequest(path, { headers: { "X-Firebase-ETag": "true" } });
      if (!read.ok) throw new Error(`firebase-rest-read-${read.status}`);
      const etag = read.headers.get("ETag");
      const traded = nextTradedAsset(await read.json(), localAsset, side, qty);
      if (!traded) throw new Error("firebase-rest-invalid-asset");
      if (side === "buy" && traded.fillPrice * qty > state.cash + 1e-9) return { ok: false, err: "cash" };
      if (side === "sell" && qty > ensureHolding(state.holdings, assetId).qty) return { ok: false, err: "qty" };
      const headers = { "Content-Type": "application/json" };
      if (etag) headers["If-Match"] = etag;
      const write = await firebaseRestRequest(path, {
        method: "PUT",
        headers,
        body: JSON.stringify(traded.asset),
      });
      if (write.status === 412) continue;
      if (!write.ok) throw new Error(`firebase-rest-write-${write.status}`);
      const saved = await write.json();
      return { ok: true, asset: hydrateAsset(saved || traded.asset), fillPrice: traded.fillPrice };
    }
    throw new Error("firebase-rest-conflict");
  }

  async function executeSharedTrade(assetId, side, qty) {
    qty = Math.floor(Number(qty) || 0);
    if (isBanned(state?.playerId) || isBanned(session?.id)) {
      ejectBanned();
      return { ok: false, err: "locked" };
    }
    if (isServerStopped()) {
      ejectHalted();
      return { ok: false, err: "locked" };
    }
    if (worldSync.closed?.[assetId]) return { ok: false, err: "locked" };
    const localAsset = assetById(assetId);
    const localHolding = ensureHolding(state.holdings, assetId);
    if (!localAsset || qty < 1 || !state.active) return { ok: false, err: "locked" };
    if (side === "buy" && Math.max(quotePrice(localAsset), Number(localAsset.price) || 0) * qty > state.cash + 1e-9) return { ok: false, err: "cash" };
    if (side === "sell" && qty > localHolding.qty) return { ok: false, err: "qty" };
    if (worldSync.pendingTrades.has(assetId)) return { ok: false, err: "pending" };

    worldSync.pendingTrades.add(assetId);
    try {
      const result = await tradeAssetWithRest(assetId, side, qty, localAsset);
      if (!result.ok) return result;

      const asset = assetById(assetId);
      Object.assign(asset, result.asset);
      pushTick(asset, quotePrice(asset));
      const holding = ensureHolding(state.holdings, assetId);
      const fillPrice = isSchoolListing(asset) ? quotePrice(asset) : result.fillPrice;
      const total = round1(fillPrice * qty);
      if (side === "buy") {
        holding.avg = (holding.avg * holding.qty + total) / (holding.qty + qty);
        holding.qty += qty;
        state.cash = round1(state.cash - total);
      } else {
        if (fillPrice > holding.avg) state.profitableSales += 1;
        holding.qty -= qty;
        state.cash = round1(state.cash + total);
        if (holding.qty === 0) holding.avg = 0;
      }
      worldSync.online = true;
      recordTrade(side, asset, qty, total);
      queuePush();
      return {
        ok: true,
        assetName: asset.name,
        fillPrice,
        total,
        holdingQty: holding.qty,
        cash: state.cash,
      };
    } catch {
      noteWorldError();
      return { ok: false, err: "network" };
    } finally {
      worldSync.pendingTrades.delete(assetId);
    }
  }

  function dropAssetEverywhere(id) {
    if (!id || !state) return;
    state.assets = (state.assets || []).filter((asset) => asset.id !== id);
    if (state.holdings) delete state.holdings[id];
    (state.players || []).forEach((player) => {
      if (player?.holdings) delete player.holdings[id];
      if (player?.founded?.assetId === id) player.founded = null;
    });
    state.ads = (state.ads || []).filter((ad) => ad.assetId !== id);
    if (selectedChartId === id) selectedChartId = "";
  }

  function rememberClosed(row) {
    if (!row?.id) return;
    worldSync.closed = worldSync.closed || {};
    worldSync.closed[row.id] = { ...worldSync.closed[row.id], ...row, id: row.id };
    dropAssetEverywhere(row.id);
  }

  function applyClosedRecords(rows) {
    worldSync.closed = worldSync.closed || {};
    listFromMap(rows).forEach(rememberClosed);
    Object.keys(worldSync.closed).forEach((id) => dropAssetEverywhere(id));
    (state.players || []).forEach((player) => {
      if (player?.founded?.assetId && worldSync.closed[player.founded.assetId]) player.founded = null;
    });
    if (state.founded?.assetId && (worldSync.closed[state.founded.assetId] || !assetById(state.founded.assetId))) {
      state.founded = null;
    }
  }

  function nextCompanyId(ownerId) {
    const base = `co-${ownerId}`;
    if (!assetById(base) && !worldSync.closed?.[base]) return base;
    for (let n = 2; n < 80; n += 1) {
      const id = `${base}-${n}`;
      if (!assetById(id) && !worldSync.closed?.[id]) return id;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  function closeCompany() {
    const founded = state.founded;
    if (!founded?.assetId) return { ok: false, err: "missing" };
    const asset = assetById(founded.assetId);
    if (!asset || asset.founderId !== state.playerId) return { ok: false, err: "missing" };
    const id = asset.id;
    const holding = ensureHolding(state.holdings, id);
    const lost = round1((Number(holding.qty) || 0) * (Number(asset.price) || 0));
    worldSync.closed = worldSync.closed || {};
    worldSync.closed[id] = {
      id,
      founderId: state.playerId,
      founderName: state.playerName || state.playerId,
      name: asset.name,
      symbol: asset.symbol,
      at: Date.now(),
    };
    dropAssetEverywhere(id);
    state.founded = null;
    const player = (state.players || []).find((item) => item.id === state.playerId);
    if (player) player.founded = null;
    syncLocalPlayer();
    markTouched(`close:${id}`);
    return { ok: true, name: asset.name, symbol: asset.symbol, lost };
  }

  function listCompany(spec) {
    const { ownerId, ownerName, name, symbol, sectorKey, seed } = spec;
    const owner = getActor(ownerId);
    if (!owner) return { ok: false, err: "player" };
    const player = state.players.find((item) => item.id === ownerId);
    if ((ownerId === state.playerId && state.founded) || player?.founded) {
      return { ok: false, err: "once" };
    }
    const ticker = String(symbol || "").trim().toUpperCase();
    if (!/^[A-Z]{2,4}$/.test(ticker)) return { ok: false, err: "ticker" };
    if (state.assets.some((asset) => asset.symbol === ticker)) return { ok: false, err: "dup" };
    const firmName = String(name || "").trim().slice(0, 12);
    if (firmName.length < 2) return { ok: false, err: "name" };
    const availableCash = round1(Math.max(0, Number(owner.cash) || 0));
    if (availableCash < MIN_SEED) return { ok: false, err: "cash" };
    const requestedSeed = Math.round(Number(seed) || MIN_SEED);
    const spend = Math.max(MIN_SEED, Math.min(availableCash, requestedSeed));
    const founderQty = Math.max(8, Math.ceil(spend / 76));
    const price = Math.max(10, Math.min(76, Math.floor((spend / founderQty) * 10) / 10));
    const cost = round1(founderQty * price);
    const id = nextCompanyId(ownerId);
    if (state.assets.some((asset) => asset.id === id) || worldSync.closed?.[id]) return { ok: false, err: "once" };
    const asset = {
      id,
      symbol: ticker,
      name: firmName,
      sector: sectorLabel(sectorKey),
      sectorKey: sectorKey || "player",
      price,
      initialPrice: price,
      lastChange: 0,
      history: [price],
      ticks: [price],
      trend: 0.001,
      noise: 0.022,
      risk: 4,
      color: PLAYER_COLORS[state.assets.length % PLAYER_COLORS.length],
      dividend: sectorKey === "retail" || sectorKey === "gold" ? 0.006 : 0,
      float: Math.max(90, founderQty * 3),
      weekFlow: 0,
      lastFlow: 0,
      weekOpen: price,
      playerCompany: true,
      founderId: ownerId,
      founderName: ownerName || ownerId,
      trust: 0.78,
      adWeeks: 0,
      ad: null,
      opsNote: "상장 직후, 실적은 아직 짧습니다.",
      opsShock: 0,
    };
    state.assets.push(asset);
    state.players.forEach((item) => ensureHolding(item.holdings || (item.holdings = {}), id));
    ensureHolding(state.holdings, id);
    owner.cash = round1(owner.cash - cost);
    const holding = ensureHolding(owner.holdings, id);
    holding.qty = founderQty;
    holding.avg = price;
    const founded = { assetId: id, name: firmName, symbol: ticker, sectorKey, seed: cost };
    if (ownerId === state.playerId) state.founded = founded;
    if (player) player.founded = founded;
    syncLocalPlayer();
    if (state.active) markTouched(id);
    return { ok: true, asset, cost, founderQty };
  }

  function lenderById(id) {
    return (state.lenders || []).find((item) => item.id === id);
  }

  function currentSettledPeriodId() {
    if (worldSync.lastSettledPeriodId) return worldSync.lastSettledPeriodId;
    try {
      const parts = kstParts() || parseKstParts(kstNowMs());
      return lastEndedPeriodId(parts);
    } catch {
      return "";
    }
  }

  function schoolPeriodsBetween(fromId, toId) {
    if (!fromId || !toId || toId <= fromId) return 0;
    let n = 0;
    let cursor = fromId;
    for (let i = 0; i < 400; i += 1) {
      cursor = nextPeriodAfter(cursor);
      n += 1;
      if (!cursor || cursor >= toId) break;
    }
    return n;
  }

  function loanPeriodsElapsed(loan) {
    return schoolPeriodsBetween(loan?.openedPeriod, currentSettledPeriodId());
  }

  function loanRemaining(loan) {
    if (!loan || loan.status === "closed") return 0;
    const principal = Number(loan.principal) || 0;
    const rate = Number(loan.rate) || 0;
    const paid = Number(loan.paid) || 0;
    const due = round1(principal + principal * (rate / 100) * loanPeriodsElapsed(loan));
    return Math.max(0, round1(due - paid));
  }

  function openLoanFor(lenderId, borrowerId) {
    return (state.loans || []).find((loan) => (
      loan.lenderId === lenderId
      && loan.borrowerId === borrowerId
      && loan.status !== "closed"
      && loanRemaining(loan) > 0
    ));
  }

  function lendingNetFor(playerId) {
    if (!playerId) return 0;
    const lender = (state.lenders || []).find((item) => item.ownerId === playerId);
    let net = lender ? (Number(lender.pool) || 0) : 0;
    (state.loans || []).forEach((loan) => {
      if (loan.status === "closed") return;
      const rem = loanRemaining(loan);
      if (lender && loan.lenderId === lender.id) net += rem;
      if (loan.borrowerId === playerId) net -= rem;
    });
    return net;
  }

  function listLender(spec) {
    const { ownerId, ownerName, name, rate, seed } = spec;
    if ((ownerId === state.playerId && state.lending) || (state.lenders || []).some((item) => item.ownerId === ownerId || item.id === `ln-${ownerId}`)) {
      return { ok: false, err: "once" };
    }
    const firmName = String(name || "").trim().slice(0, 12);
    if (firmName.length < 2) return { ok: false, err: "name" };
    const pct = Math.round(Number(rate) || 0);
    if (pct < MIN_LEND_RATE || pct > MAX_LEND_RATE) return { ok: false, err: "rate" };
    const actor = getActor(ownerId);
    if (!actor) return { ok: false, err: "player" };
    const availableCash = round1(Math.max(0, Number(actor.cash) || 0));
    if (availableCash < MIN_LEND_SEED) return { ok: false, err: "cash" };
    const requested = Math.round(Number(seed) || MIN_LEND_SEED);
    const spend = Math.max(MIN_LEND_SEED, Math.min(availableCash, requested));
    const id = `ln-${ownerId}`;
    actor.cash = round1(actor.cash - spend);
    const lender = {
      id,
      name: firmName,
      ownerId,
      ownerName: ownerName || ownerId,
      rate: pct,
      pool: spend,
      seed: spend,
      createdAt: Date.now(),
      clientBuild: CLIENT_BUILD,
    };
    state.lenders = state.lenders || [];
    state.lenders.push(lender);
    if (ownerId === state.playerId) {
      state.lending = { id, name: firmName, rate: pct, seed: spend };
    }
    syncLocalPlayer();
    if (state.active) markTouched(`lend:${id}`);
    return { ok: true, lender, cost: spend };
  }

  async function updateLenderDesk(spec) {
    const lender = (state.lenders || []).find((item) => item.ownerId === state.playerId);
    if (!lender) return { ok: false, err: "missing" };
    const firmName = String(spec.name || lender.name).trim().slice(0, 12);
    if (firmName.length < 2) return { ok: false, err: "name" };
    const pct = Math.round(Number(spec.rate) || lender.rate);
    if (pct < MIN_LEND_RATE || pct > MAX_LEND_RATE) return { ok: false, err: "rate" };
    const extra = Math.max(0, Math.round(Number(spec.seed) || 0));
    if (extra > 0) {
      if (state.cash + 1e-9 < extra) return { ok: false, err: "cash" };
      const moved = await syncLenderPool(lender.id, extra);
      if (!moved.ok) return moved;
      applyLenderRow(moved.lender);
      state.cash = round1(state.cash - extra);
    }
    const live = lenderById(lender.id) || lender;
    live.name = firmName;
    live.rate = pct;
    live.ownerName = state.playerName;
    if (extra > 0) live.seed = round1((Number(live.seed) || 0) + extra);
    state.lending = { id: live.id, name: firmName, rate: pct, seed: live.seed };
    syncLocalPlayer();
    markTouched(`lend:${live.id}`);
    return { ok: true, lender: live, extra };
  }

  async function adjustLenderPoolWithRest(lenderId, delta) {
    const path = `${FIREBASE_WORLD_PATH}/lenders/${safeFbKey(lenderId)}`;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const read = await firebaseRestRequest(path, { headers: { "X-Firebase-ETag": "true" } });
      if (!read.ok) throw new Error(`firebase-rest-read-${read.status}`);
      const etag = read.headers.get("ETag");
      const remote = await read.json();
      const lender = publicLender(remote || lenderById(lenderId));
      if (!lender?.id) return { ok: false, err: "missing" };
      const nextPool = round1((Number(lender.pool) || 0) + delta);
      if (delta < 0 && nextPool < -1e-9) return { ok: false, err: "pool" };
      lender.pool = Math.max(0, nextPool);
      lender.clientBuild = CLIENT_BUILD;
      const headers = { "Content-Type": "application/json" };
      if (etag) headers["If-Match"] = etag;
      const write = await firebaseRestRequest(path, {
        method: "PUT",
        headers,
        body: JSON.stringify(lender),
      });
      if (write.status === 412) continue;
      if (!write.ok) throw new Error(`firebase-rest-write-${write.status}`);
      const saved = await write.json();
      return { ok: true, lender: publicLender(saved || lender) };
    }
    throw new Error("firebase-rest-conflict");
  }

  async function syncLenderPool(lenderId, delta) {
    if (firebaseConfig()) {
      try {
        return await adjustLenderPoolWithRest(lenderId, delta);
      } catch {
        return { ok: false, err: "network" };
      }
    }
    const lender = lenderById(lenderId);
    if (!lender) return { ok: false, err: "missing" };
    const nextPool = round1((Number(lender.pool) || 0) + delta);
    if (delta < 0 && nextPool < -1e-9) return { ok: false, err: "pool" };
    lender.pool = Math.max(0, nextPool);
    return { ok: true, lender };
  }

  function applyLenderRow(row) {
    const next = publicLender(row);
    if (!next) return null;
    const local = lenderById(next.id);
    if (local) Object.assign(local, next);
    else {
      state.lenders = state.lenders || [];
      state.lenders.push(next);
    }
    return lenderById(next.id);
  }

  function upsertLoan(row) {
    const next = publicLoan(row);
    if (!next) return null;
    state.loans = state.loans || [];
    const local = state.loans.find((item) => item.id === next.id);
    if (local) Object.assign(local, next);
    else state.loans.push(next);
    return next;
  }

  async function borrowFromLender(lenderId, amount) {
    amount = Math.round(Number(amount) || 0);
    if (!state?.active) return { ok: false, err: "locked" };
    const lender = lenderById(lenderId);
    if (!lender) return { ok: false, err: "missing" };
    if (lender.ownerId === state.playerId) return { ok: false, err: "self" };
    if (amount < MIN_BORROW) return { ok: false, err: "min" };
    if (amount > MAX_BORROW) return { ok: false, err: "max" };
    if (openLoanFor(lenderId, state.playerId)) return { ok: false, err: "open" };
    const pooled = round1(Number(lender.pool) || 0);
    if (pooled + 1e-9 < amount) return { ok: false, err: "pool" };
    const result = await syncLenderPool(lenderId, -amount);
    if (!result.ok) return result;
    applyLenderRow(result.lender);
    const loan = upsertLoan({
      id: `loan-${lender.ownerId}-${state.playerId}`,
      lenderId: lender.id,
      lenderName: lender.name,
      borrowerId: state.playerId,
      borrowerName: state.playerName,
      principal: amount,
      rate: lender.rate,
      paid: 0,
      openedPeriod: currentSettledPeriodId(),
      status: "open",
      updatedAt: Date.now(),
    });
    state.cash = round1(state.cash + amount);
    syncLocalPlayer();
    markTouched(`lend:${lender.id}`);
    markTouched(`loan:${loan.id}`);
    return { ok: true, loan, amount, lender: lenderById(lender.id) };
  }

  async function repayLoan(lenderId, amount) {
    amount = round1(Math.max(0, Number(amount) || 0));
    if (!state?.active) return { ok: false, err: "locked" };
    const loan = openLoanFor(lenderId, state.playerId);
    if (!loan) return { ok: false, err: "missing" };
    const remaining = loanRemaining(loan);
    if (!(remaining > 0)) return { ok: false, err: "missing" };
    const pay = round1(Math.min(amount, remaining, state.cash));
    if (!(pay > 0)) return { ok: false, err: "cash" };
    const result = await syncLenderPool(lenderId, pay);
    if (!result.ok) return result;
    applyLenderRow(result.lender);
    state.cash = round1(state.cash - pay);
    loan.paid = round1((Number(loan.paid) || 0) + pay);
    if (loanRemaining(loan) <= 0) loan.status = "closed";
    loan.updatedAt = Date.now();
    upsertLoan(loan);
    syncLocalPlayer();
    markTouched(`lend:${lenderId}`);
    markTouched(`loan:${loan.id}`);
    return { ok: true, loan, amount: pay, remaining: loanRemaining(loan) };
  }

  async function moveOwnPool(delta) {
    const lender = (state.lenders || []).find((item) => item.ownerId === state.playerId);
    if (!lender) return { ok: false, err: "missing" };
    delta = round1(Number(delta) || 0);
    if (!delta) return { ok: false, err: "min" };
    if (delta > 0 && state.cash + 1e-9 < delta) return { ok: false, err: "cash" };
    if (delta < 0 && (Number(lender.pool) || 0) + delta < -1e-9) return { ok: false, err: "pool" };
    const result = await syncLenderPool(lender.id, delta);
    if (!result.ok) return result;
    applyLenderRow(result.lender);
    state.cash = round1(state.cash - delta);
    if (delta > 0) lender.seed = round1((Number(lender.seed) || 0) + delta);
    state.lending = { id: lender.id, name: lender.name, rate: lender.rate, seed: lender.seed };
    syncLocalPlayer();
    markTouched(`lend:${lender.id}`);
    return { ok: true, lender, delta };
  }

  function rollCompanyOps(asset) {
    const shock = (random() * 2 - 1) * 0.085 + 0.006;
    const up = ["주간 매출이 예상보다 단단했습니다.", "신규 주문이 늘었습니다.", "고정비를 잘 막았습니다."];
    const down = ["고정비가 발목을 잡았습니다.", "수주가 한 박자 밀렸습니다.", "재고가 조금 쌓였습니다."];
    const flat = ["큰 이슈 없이 운영됐습니다.", "현금흐름은 평범했습니다.", "광고와 별개로 현장은 조용했습니다."];
    asset.opsShock = shock;
    asset.opsNote = shock > 0.012 ? up[Math.floor(random() * up.length)] : shock < -0.008 ? down[Math.floor(random() * down.length)] : flat[Math.floor(random() * flat.length)];
    return shock;
  }

  function creditFounderOps(asset) {
    if (!asset?.playerCompany || !asset.founderId) return 0;
    const shock = asset.opsShock || 0;
    const payout = round1(Math.max(0.8, asset.price * 0.045 * (1.2 + shock * 6)));
    const actor = getActor(asset.founderId);
    if (!actor || !(payout > 0)) return 0;
    actor.cash = round1(actor.cash + payout);
    if (actor.isLocal) {
      toast("🏢", `${asset.name} 영업입금`, `창업 계좌로 ${money(payout)}이 들어왔습니다.`);
    }
    return payout;
  }

  function publishAd(playerId, slogan, claim, image) {
    const player = state.players.find((item) => item.id === playerId);
    const founded = playerId === state.playerId ? state.founded : player?.founded;
    if (!founded) return { ok: false, err: "company" };
    const asset = assetById(founded.assetId);
    const actor = getActor(playerId);
    if (!asset || !actor) return { ok: false, err: "company" };
    if (playerId === state.playerId && state.adDone) return { ok: false, err: "once" };
    if (asset.ad && asset.ad.week === state.week && asset.ad.season === state.season) {
      return { ok: false, err: "once" };
    }
    if (actor.cash < AD_COST) return { ok: false, err: "cash" };
    if (playerId === state.playerId) {
      if (state.energy < 1) return { ok: false, err: "energy" };
      state.energy -= 1;
      state.adDone = true;
    }
    actor.cash = round1(actor.cash - AD_COST);
    const text = String(slogan || "").trim().slice(0, 28);
    asset.ad = {
      slogan: text,
      claim: AD_CLAIMS[claim] ? claim : "none",
      week: state.week,
      season: state.season,
      owner: playerId,
      image: safeImageUrl(image),
    };
    asset.adWeeks = (asset.adWeeks || 0) + 1;
    state.ads = state.assets.filter((item) => item.ad && item.ad.week === state.week && item.ad.season === state.season).map((item) => ({
      assetId: item.id,
      symbol: item.symbol,
      name: item.name,
      slogan: item.ad.slogan,
      claim: item.ad.claim,
      image: item.ad.image || "",
    }));
    attractAdFlow(asset);
    syncLocalPlayer();
    if (state.active) markTouched(asset.id);
    return { ok: true, asset };
  }

  function attractAdFlow(asset) {
    const trust = asset.trust ?? 0.7;
    const over = (asset.adWeeks || 0) >= 3;
    applyFlow(asset, over ? -2 : Math.max(1, Math.round(trust * 4)));
    if (over) asset.trust = Math.max(0.15, (asset.trust || 0.7) - 0.12);
  }

  function resolveAdTruth(asset) {
    if (!asset.ad || asset.ad.week !== state.week) return;
    const claim = asset.ad.claim;
    let lie = false;
    if (claim === "growth" && (asset.opsShock || 0) < -0.01) lie = true;
    if (claim === "stable" && Math.abs(asset.opsShock || 0) > 0.03) lie = true;
    if (claim === "dividend" && !(asset.dividend > 0)) lie = true;
    if (lie) {
      asset.trust = Math.max(0.12, (asset.trust || 0.7) * 0.72);
      const dump = 2 + Math.floor(random() * 6);
      applyFlow(asset, -dump);
      asset.opsNote = `${asset.opsNote} 광고 주장과 실적이 어긋난다는 이야기가 돌았습니다.`;
    } else if (claim !== "none") {
      asset.trust = Math.min(1, (asset.trust || 0.7) + 0.04);
    }
  }

  function spawnBots() {
    /* bots removed: only student players move the market */
  }

  function clearBotTimers() {}

  function scheduleBots() {}

  function botTick() {
    /* price bots stay off the ranking and never found companies; they only tilt school quotes */
  }

  function stopWorldSync() {
    unsubscribeWorld();
    unsubscribeBans();
    stopPresence();
    if (worldSync.pollTimer) clearInterval(worldSync.pollTimer);
    if (worldSync.clockTimer) clearInterval(worldSync.clockTimer);
    if (worldSync.kstTimer) clearInterval(worldSync.kstTimer);
    if (worldSync.chartTimer) clearInterval(worldSync.chartTimer);
    if (worldSync.presenceTimer) clearInterval(worldSync.presenceTimer);
    if (worldSync.buildTimer) clearInterval(worldSync.buildTimer);
    if (worldSync.putTimer) clearTimeout(worldSync.putTimer);
    worldSync.pollTimer = null;
    worldSync.clockTimer = null;
    worldSync.kstTimer = null;
    worldSync.chartTimer = null;
    worldSync.presenceTimer = null;
    worldSync.buildTimer = null;
    worldSync.putTimer = null;
  }

  function kstNowMs() {
    return Date.now() + (kstClock.offsetMs || 0);
  }

  function parseKstParts(ms) {
    const instant = new Date(ms);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    });
    const map = {};
    fmt.formatToParts(instant).forEach((part) => {
      if (part.type !== "literal") map[part.type] = part.value;
    });
    return {
      y: Number(map.year),
      mo: Number(map.month),
      d: Number(map.day),
      h: Number(map.hour),
      mi: Number(map.minute),
      s: Number(map.second),
      weekday: String(map.weekday || "").slice(0, 3),
      ymd: `${map.year}-${String(map.month).padStart(2, "0")}-${String(map.day).padStart(2, "0")}`,
    };
  }

  function kstStamp(ms = kstNowMs()) {
    const p = parseKstParts(ms);
    return `${p.mo}/${p.d} ${String(p.h).padStart(2, "0")}:${String(p.mi).padStart(2, "0")}`;
  }

  async function refreshKst() {
    const sources = [
      {
        url: "https://worldtimeapi.org/api/timezone/Asia/Seoul",
        parse(data) {
          if (Number.isFinite(data.unixtime)) return data.unixtime * 1000;
          const ms = Date.parse(data.datetime);
          return Number.isFinite(ms) ? ms : null;
        },
      },
      {
        url: "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul",
        parse(data) {
          if (data?.year) {
            const iso = `${data.year}-${String(data.month).padStart(2, "0")}-${String(data.day).padStart(2, "0")}T${String(data.hour).padStart(2, "0")}:${String(data.minute).padStart(2, "0")}:${String(data.seconds || 0).padStart(2, "0")}+09:00`;
            const ms = Date.parse(iso);
            if (Number.isFinite(ms)) return ms;
          }
          if (data?.dateTime) {
            const raw = String(data.dateTime);
            const ms = Date.parse(raw.includes("+") || raw.endsWith("Z") ? raw : `${raw}+09:00`);
            return Number.isFinite(ms) ? ms : null;
          }
          return null;
        },
      },
      {
        url: "https://timeapi.io/api/time/current/zone?timeZone=Asia/Seoul",
        parse(data) {
          if (data?.dateTime) {
            const raw = String(data.dateTime);
            const ms = Date.parse(raw.includes("+") || raw.endsWith("Z") ? raw : `${raw}+09:00`);
            return Number.isFinite(ms) ? ms : null;
          }
          return null;
        },
      },
      {
        url: "https://worldclockapi.com/api/json/kst/now",
        parse(data) {
          const ms = Date.parse(data.currentDateTime);
          return Number.isFinite(ms) ? ms : null;
        },
      },
    ];
    for (const src of sources) {
      try {
        const res = await fetchWithTimeout(src.url, { cache: "no-store" }, 4000);
        if (!res.ok) continue;
        const data = await res.json();
        const serverMs = src.parse(data);
        if (!Number.isFinite(serverMs)) continue;
        kstClock.offsetMs = serverMs - Date.now();
        kstClock.ok = true;
        kstClock.fetchedAt = Date.now();
        kstClock.source = src.url;
        kstClock.parts = parseKstParts(serverMs);
        return true;
      } catch {
        // try next public KST endpoint
      }
    }
    useDeviceKst();
    return true;
  }

  function isWeekend(parts) {
    return parts.weekday === "Sat" || parts.weekday === "Sun";
  }

  function minutesOf(h, m) {
    return h * 60 + m;
  }

  function periodId(ymd, n) {
    return `${ymd}-p${n}`;
  }

  function parsePeriodId(id) {
    const match = /^(\d{4}-\d{2}-\d{2})-p(\d+)$/.exec(id || "");
    if (!match) return null;
    return { ymd: match[1], n: Number(match[2]) };
  }

  function shiftYmd(ymd, days) {
    const [y, mo, d] = ymd.split("-").map(Number);
    const utc = Date.UTC(y, mo - 1, d + days, 4, 0, 0);
    return parseKstParts(utc).ymd;
  }

  function weekdayOfYmd(ymd) {
    const [y, mo, d] = ymd.split("-").map(Number);
    const utc = Date.UTC(y, mo - 1, d, 4, 0, 0);
    return parseKstParts(utc).weekday;
  }

  function previousSchoolYmd(ymd) {
    let cursor = shiftYmd(ymd, -1);
    while (weekdayOfYmd(cursor) === "Sat" || weekdayOfYmd(cursor) === "Sun") {
      cursor = shiftYmd(cursor, -1);
    }
    return cursor;
  }

  function nextSchoolYmd(ymd) {
    let cursor = shiftYmd(ymd, 1);
    while (weekdayOfYmd(cursor) === "Sat" || weekdayOfYmd(cursor) === "Sun") {
      cursor = shiftYmd(cursor, 1);
    }
    return cursor;
  }

  function ymdDayDiff(from, to) {
    const [y1, m1, d1] = from.split("-").map(Number);
    const [y2, m2, d2] = to.split("-").map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  }

  function kstMsFromYmdHm(ymd, h, m) {
    return Date.parse(`${ymd}T${pad2(h)}:${pad2(m)}:00+09:00`);
  }

  function weekdayKo(ymd) {
    const map = { Sun: "일요일", Mon: "월요일", Tue: "화요일", Wed: "수요일", Thu: "목요일", Fri: "금요일", Sat: "토요일" };
    return map[weekdayOfYmd(ymd)] || ymd;
  }

  function lastEndedPeriodId(parts) {
    if (!isWeekend(parts)) {
      const nowMin = minutesOf(parts.h, parts.mi) + parts.s / 60;
      let last = null;
      PERIODS.forEach((slot) => {
        if (nowMin >= minutesOf(slot.h, slot.m)) last = periodId(parts.ymd, slot.n);
      });
      if (last) return last;
    }
    return periodId(previousSchoolYmd(parts.ymd), LAST_PERIOD_N);
  }

  function nextPeriodAfter(id) {
    const parsed = parsePeriodId(id);
    if (!parsed) return periodId(parseKstParts(kstNowMs()).ymd, FIRST_PERIOD_N);
    if (parsed.n < LAST_PERIOD_N) return periodId(parsed.ymd, parsed.n + 1);
    return periodId(nextSchoolYmd(parsed.ymd), FIRST_PERIOD_N);
  }

  function duePeriodId(lastSettled, parts) {
    const latest = lastEndedPeriodId(parts);
    if (!lastSettled) return null;
    const next = nextPeriodAfter(lastSettled);
    return next <= latest ? next : null;
  }

  function nextSettlement(parts) {
    if (!isWeekend(parts)) {
      const nowMin = minutesOf(parts.h, parts.mi) + parts.s / 60;
      const upcoming = PERIODS.find((slot) => nowMin < minutesOf(slot.h, slot.m));
      if (upcoming) return { ymd: parts.ymd, slot: upcoming };
    }
    const ymd = isWeekend(parts) || minutesOf(parts.h, parts.mi) >= minutesOf(16, 0)
      ? nextSchoolYmd(parts.ymd)
      : parts.ymd;
    return { ymd, slot: PERIODS[0] };
  }

  function isMarketOpen(parts) {
    if (isWeekend(parts)) return false;
    return minutesOf(parts.h, parts.mi) + parts.s / 60 < minutesOf(16, 0);
  }

  function clockLabel() {
    if (!kstClock.ok || !kstClock.parts) {
      return { line: "한국 표준시 확인 중", hint: "기본 종목은 교시가 끝나면 정산됩니다. 학생 회사도 그 사이 사고팔 수 있습니다.", open: true };
    }
    const parts = kstClock.parts;
    const next = nextSettlement(parts);
    const targetMs = kstMsFromYmdHm(next.ymd, next.slot.h, next.slot.m);
    const mins = Math.max(0, Math.floor((targetMs - kstNowMs()) / 60000));
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    const count = hh > 0 ? `${hh}시간 ${mm}분` : `${mm}분`;
    const kst = `KST ${pad2(parts.h)}:${pad2(parts.mi)}`;
    const slot = `${next.slot.label} ${pad2(next.slot.h)}:${pad2(next.slot.m)}`;
    const when = weekdayKo(next.ymd);
    return {
      line: `${kst} · 다음 주가 공개 ${when} ${slot}까지 ${count}`,
      hint: "기본 종목은 교시가 끝나면 정산됩니다. 한빛테크와 학생 회사 모두 그 사이에도 사고팔 수 있습니다.",
      open: true,
    };
  }

  function publicAsset(asset) {
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      sector: asset.sector,
      sectorKey: asset.sectorKey,
      price: asset.price,
      initialPrice: asset.initialPrice,
      lastChange: asset.lastChange,
      history: asset.history?.slice(-16) || [asset.price],
      trend: asset.trend,
      noise: asset.noise,
      risk: asset.risk,
      color: asset.color,
      dividend: asset.dividend,
      float: asset.float,
      weekFlow: asset.weekFlow,
      lastFlow: asset.lastFlow,
      weekOpen: asset.weekOpen,
      playerCompany: asset.playerCompany,
      founderId: asset.founderId,
      founderName: asset.founderName,
      trust: asset.trust,
      adWeeks: asset.adWeeks,
      ad: asset.ad ? { ...asset.ad, image: safeImageUrl(asset.ad.image) } : null,
      opsNote: asset.opsNote,
      opsShock: asset.opsShock || 0,
      clientBuild: CLIENT_BUILD,
    };
  }

  function hydrateAsset(row) {
    const asset = {
      trend: 0.002,
      noise: 0.01,
      risk: 4,
      color: PLAYER_COLORS[0],
      dividend: 0,
      float: 120,
      history: [row.price],
      lastChange: 0,
      weekFlow: 0,
      lastFlow: 0,
      trust: 0.72,
      adWeeks: 0,
      ad: null,
      opsNote: "",
      opsShock: 0,
      playerCompany: false,
      founderId: null,
      founderName: "",
      ...row,
    };
    if (isSchoolListing(asset)) asset.playerCompany = true;
    return asset;
  }

  function eventIndex(event) {
    if (!event) return 0;
    const idx = EVENTS.findIndex((item) => item.title === event.title);
    return idx >= 0 ? idx : 0;
  }

  function hydrateEvent(key, fallback) {
    if (Number.isInteger(key) && EVENTS[key]) return EVENTS[key];
    if (fallback?.title) {
      const found = EVENTS.find((item) => item.title === fallback.title);
      if (found) return found;
    }
    return fallback || EVENTS[0];
  }

  function touchPresence() {
    if (!state || !session) return;
    const stamp = kstClock.ok ? kstStamp() : "";
    const next = { id: state.playerId, name: state.playerName, lastSeen: stamp };
    const list = worldSync.seenPlayers.filter((item) => item.id !== next.id && item.id);
    list.unshift(next);
    worldSync.seenPlayers = list.slice(0, 24);
  }

  function buildWorldPayload() {
    touchPresence();
    const deck = (worldSync.eventDeck && worldSync.eventDeck.length)
      ? worldSync.eventDeck
      : state.eventDeck.map((event) => eventIndex(event));
    return {
      revision: (worldSync.revision || 0) + 1,
      updatedAt: kstClock.ok ? kstNowMs() : Date.now(),
      week: state.week,
      season: state.season,
      lastSettledPeriodId: worldSync.lastSettledPeriodId || "",
      eventKey: eventIndex(state.event),
      eventDeck: deck,
      event: publicEvent(state.event),
      assets: state.assets.map(publicAsset),
      ads: state.ads,
      players: humansRanked().map(publicPlayer).filter(Boolean).slice(0, 40),
      botsSpawned: false,
      seenPlayers: worldSync.seenPlayers.map((item) => ({
        id: item.id,
        name: item.name,
        lastSeen: item.lastSeen || "",
      })),
      chatRooms: (worldSync.chatRooms || []).map((room) => ({
        id: room.id,
        name: room.name,
        createdBy: room.createdBy,
        createdByName: room.createdByName,
        createdAt: room.createdAt,
        messages: (room.messages || []).slice(-CHAT_CAP).map((msg) => ({
          id: msg.id,
          authorId: msg.authorId,
          authorName: msg.authorName,
          text: msg.text,
          ts: msg.ts,
        })),
      })),
      lenders: (state.lenders || []).map(publicLender).filter(Boolean),
      loans: (state.loans || []).map(publicLoan).filter(Boolean),
      closed: Object.values(worldSync.closed || {}).filter((row) => row?.id),
    };
  }

  function mergeChatRooms(remoteRooms) {
    const byId = new Map((worldSync.chatRooms || []).map((room) => [room.id, room]));
    (remoteRooms || []).map(normalizeChatRoom).filter(Boolean).forEach((room) => {
      const local = byId.get(room.id);
      if (!local) {
        byId.set(room.id, {
          ...room,
          messages: [...(room.messages || [])].slice(-CHAT_CAP),
        });
        return;
      }
      const msgs = new Map((local.messages || []).map((msg) => [msg.id, msg]));
      (room.messages || []).forEach((msg) => {
        if (msg?.id) msgs.set(msg.id, msg);
      });
      local.name = room.name || local.name;
      local.messages = [...msgs.values()].sort((a, b) => {
        const at = Number(a.createdAt || 0);
        const bt = Number(b.createdAt || 0);
        if (at !== bt) return at - bt;
        return String(a.id || "").localeCompare(String(b.id || ""));
      }).slice(-CHAT_CAP);
    });
    worldSync.chatRooms = [...byId.values()];
    if (activeChatRoomId && !byId.has(activeChatRoomId)) activeChatRoomId = "";
    if (!activeChatRoomId && worldSync.chatRooms[0]) activeChatRoomId = worldSync.chatRooms[0].id;
  }

  function remoteCoresLookSettled(remote) {
    const rows = remote?.assets || [];
    const moved = CORE_ASSET_IDS.filter((id) => {
      const row = rows.find((item) => item.id === id);
      return ((row?.history || []).length > 1);
    }).length;
    return moved >= 4;
  }

  function coresLookUnsettled() {
    const unset = CORE_ASSET_IDS.filter((id) => ((assetById(id)?.history || []).length <= 1)).length;
    return unset >= 4;
  }

  function mergeWorld(remote, options = {}) {
    if (!remote || typeof remote !== "object") return { settled: false };
    const preferLocal = !!options.preferLocal;
    const prevSettled = worldSync.lastSettledPeriodId;
    worldSync.revision = Math.max(worldSync.revision || 0, remote.revision || 0);
    worldSync.updatedAt = Math.max(worldSync.updatedAt || 0, remote.updatedAt || 0);
    if (remote.lastSettledPeriodId && remoteCoresLookSettled(remote)) {
      if (!worldSync.lastSettledPeriodId || remote.lastSettledPeriodId > worldSync.lastSettledPeriodId) {
        worldSync.lastSettledPeriodId = remote.lastSettledPeriodId;
      }
      if (!worldSync.appliedPeriodId || remote.lastSettledPeriodId > worldSync.appliedPeriodId) {
        worldSync.appliedPeriodId = remote.lastSettledPeriodId;
      }
    }
    if (remote.eventDeck?.length) worldSync.eventDeck = remote.eventDeck;
    worldSync.botsSpawned = worldSync.botsSpawned || !!remote.botsSpawned;
    const seen = new Map((worldSync.seenPlayers || []).map((item) => [item.id, item]));
    (remote.seenPlayers || []).forEach((item) => {
      if (item?.id) seen.set(item.id, item);
    });
    worldSync.seenPlayers = [...seen.values()];
    mergeChatRooms(remote.chatRooms);
    applyClosedRecords(remote.closed);

    const byId = new Map(state.assets.map((asset) => [asset.id, asset]));
    (remote.assets || []).forEach((row) => {
      if (!row?.id) return;
      if (worldSync.closed?.[row.id]) return;
      if (row.bot || String(row.founderId || "").startsWith("bot-") || String(row.id || "").startsWith("co-bot")) return;
      const local = byId.get(row.id);
      if (!local) {
        const added = hydrateAsset(row);
        if (isSchoolListing(added)) added.playerCompany = true;
        state.assets.push(added);
        byId.set(row.id, added);
        ensureHolding(state.holdings, row.id);
        return;
      }
      const remoteSettled = remote.lastSettledPeriodId || "";
      const localApplied = worldSync.appliedPeriodId || "";
      const keepPrice = worldSync.touched.has(row.id) && (preferLocal || (localApplied && localApplied >= remoteSettled));
      local.symbol = row.symbol || local.symbol;
      local.name = row.name || local.name;
      local.sector = row.sector || local.sector;
      local.sectorKey = row.sectorKey || local.sectorKey;
      local.founderId = row.founderId || local.founderId;
      local.founderName = row.founderName || local.founderName;
      local.playerCompany = !!row.playerCompany || local.playerCompany;
      local.float = row.float || local.float;
      local.ad = row.ad || local.ad;
      local.adWeeks = row.adWeeks ?? local.adWeeks;
      local.trust = row.trust ?? local.trust;
      local.opsNote = row.opsNote || local.opsNote;
      if (!keepPrice) {
        local.price = row.price;
        local.lastChange = row.lastChange;
        local.weekFlow = row.weekFlow;
        local.lastFlow = row.lastFlow;
        local.weekOpen = row.weekOpen;
        local.history = row.history || local.history;
        pushTick(local, local.price);
      }
    });

    const weekChanged = remote.week && (remote.week !== state.week || remote.season !== state.season);
    if (!preferLocal) {
      if (remote.week) state.week = remote.week;
      if (remote.season) state.season = remote.season;
      if (remote.event || Number.isInteger(remote.eventKey)) {
        state.event = hydrateEvent(remote.eventKey, remote.event);
      }
      state.ads = remote.ads || state.assets.filter((asset) => asset.ad && asset.ad.week === state.week).map((asset) => ({
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        slogan: asset.ad.slogan,
        claim: asset.ad.claim,
        image: asset.ad.image || "",
      }));
    }

    mergePlayers(remote.players);
    mergeLenders(remote.lenders, preferLocal);
    mergeLoans(remote.loans, preferLocal);
    purgeBots();
    ensureCoreListings();
    applyClosedRecords(remote.closed);

    state.assets.forEach((asset) => ensureHolding(state.holdings, asset.id));
    if (state.founded?.assetId && !assetById(state.founded.assetId)) state.founded = null;
    if (state.assets.some((asset) => asset.founderId === state.playerId)) {
      const mine = state.assets.find((asset) => asset.founderId === state.playerId);
      state.founded = state.founded || { assetId: mine.id, name: mine.name, symbol: mine.symbol, sectorKey: mine.sectorKey, seed: 0 };
    }
    const mineLender = (state.lenders || []).find((item) => item.ownerId === state.playerId);
    if (mineLender) {
      state.lending = state.lending || { id: mineLender.id, name: mineLender.name, rate: mineLender.rate, seed: mineLender.seed };
    }
    const settled = !preferLocal && prevSettled && worldSync.lastSettledPeriodId && worldSync.lastSettledPeriodId !== prevSettled;
    return { settled, weekChanged };
  }

  function slimWorldPayload(payload) {
    return {
      ...payload,
      ads: (payload.ads || []).map((ad) => ({ ...ad, image: "" })),
      assets: (payload.assets || []).map((asset) => ({
        ...asset,
        ad: asset.ad ? { ...asset.ad, image: safeImageUrl(asset.ad.image) } : asset.ad,
      })),
    };
  }

  async function fetchWorld() {
    const db = firebaseDb();
    try {
      const response = await firebaseRestRequest(FIREBASE_WORLD_PATH, {}, FIREBASE_READ_TIMEOUT_MS);
      if (!response.ok) throw new Error(`firebase-rest-${response.status}`);
      const world = worldFromFirebase(await response.json());
      if (world) writeLocalWorld(world);
      return world;
    } catch {
      /* fall through to the realtime SDK or local cache */
    }

    if (!db) return readLocalWorld();
    try {
      const snap = await Promise.race([
        db.ref(FIREBASE_WORLD_PATH).once("value"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("firebase-sdk-timeout")), FIREBASE_READ_TIMEOUT_MS)),
      ]);
      const world = worldFromFirebase(snap.val());
      if (world) writeLocalWorld(world);
      return world;
    } catch {
      return readLocalWorld();
    }
  }

  async function putWorld(payload) {
    writeLocalWorld(payload);
    const db = firebaseDb();
    const slim = slimWorldPayload(payload);
    const updates = JSON.parse(JSON.stringify(firebaseUpdatesFromPayload(slim)));
    let saved = false;
    if (db && worldSync.connected) {
      try {
        await Promise.race([
          db.ref(FIREBASE_WORLD_PATH).update(updates),
          new Promise((_, reject) => setTimeout(() => reject(new Error("firebase-write-timeout")), FIREBASE_WRITE_TIMEOUT_MS)),
        ]);
        saved = true;
      } catch {
        saved = false;
      }
    }
    if (!saved) {
      const response = await firebaseRestRequest(FIREBASE_WORLD_PATH, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`firebase-rest-write-${response.status}`);
    }
    worldSync.revision = payload.revision;
    worldSync.updatedAt = payload.updatedAt;
    worldSync.needsSeed = false;
    worldSync.touched.clear();
    worldSync.online = true;
    return true;
  }

  function noteWorldError() {
    worldSync.online = false;
    renderSyncStatus();
    const now = Date.now();
    if (now - worldSync.lastToastAt < 25000) return;
    worldSync.lastToastAt = now;
    toast("📡", "공유 시장", firebaseReady()
      ? "Firebase에 잠시 닿지 못했습니다. 곧 다시 시도합니다."
      : "Firebase 설정이 없습니다. firebase-config.js에 프로젝트 값을 넣어 주세요.");
  }

  function applyRemoteWorld(remote, preferLocal) {
    if (!remote || !state?.active) return;
    worldSync.applyingRemote = true;
    try {
      const before = totalAssets();
      const weekBefore = activityWeekKey();
      const result = mergeWorld(remote, { preferLocal });
      if (activityWeekKey() !== weekBefore) {
        computeWeekExpectations();
        startWeekActivities(true);
      } else if (result.weekChanged) {
        computeWeekExpectations();
      }
      if (result.settled) showWeekResult(totalAssets() - before, totalAssets(), 0);
      ensureCoreListings();
      renderAll();
    } finally {
      worldSync.applyingRemote = false;
    }
  }

  function unsubscribeWorld() {
    const db = firebaseDb();
    if (db && worldSync.unsub) db.ref(FIREBASE_WORLD_PATH).off("value", worldSync.unsub);
    worldSync.unsub = null;
  }

  function presenceRows(value) {
    const rows = [];
    if (!value || typeof value !== "object") return rows;
    Object.values(value).forEach((sessions) => {
      listFromMap(sessions).forEach((entry) => {
        if (entry?.playerId) rows.push(entry);
      });
    });
    return rows;
  }

  function presenceRestPath() {
    if (!state?.playerId) return "";
    return `${FIREBASE_PRESENCE_PATH}/${safeFbKey(state.playerId)}/${safeFbKey(clientId)}`;
  }

  async function refreshPresenceRest() {
    try {
      const response = await firebaseRestRequest(FIREBASE_PRESENCE_PATH, {}, FIREBASE_READ_TIMEOUT_MS);
      if (!response.ok) return;
      worldSync.presence = presenceRows(await response.json());
      worldSync.online = true;
      renderSyncStatus();
    } catch {
      /* the next heartbeat retries */
    }
  }

  function stopPresence() {
    const restPath = presenceRestPath();
    if (worldSync.presenceRootRef && worldSync.presenceHandler) {
      worldSync.presenceRootRef.off("value", worldSync.presenceHandler);
    }
    if (worldSync.connectedRef && worldSync.connectedHandler) {
      worldSync.connectedRef.off("value", worldSync.connectedHandler);
    }
    if (worldSync.presenceRef) worldSync.presenceRef.remove().catch(() => {});
    worldSync.presenceRef = null;
    worldSync.presenceRootRef = null;
    worldSync.presenceHandler = null;
    worldSync.connectedRef = null;
    worldSync.connectedHandler = null;
    worldSync.connected = false;
    worldSync.presence = [];
    if (restPath) firebaseRestRequest(restPath, { method: "DELETE" }).catch(() => {});
  }

  async function writePresence() {
    if (!state?.active || !session) return;
    const payload = {
      playerId: state.playerId,
      playerName: state.playerName,
      clientId,
      online: true,
      lastSeen: Date.now(),
    };
    if (worldSync.presenceRef && worldSync.connected) {
      worldSync.presenceRef.update({ ...payload, lastSeen: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
      return;
    }
    try {
      const response = await firebaseRestRequest(presenceRestPath(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return;
      worldSync.online = true;
      await refreshPresenceRest();
    } catch {
      /* the next heartbeat retries */
    }
  }

  function syncChatRoomsDirect() {
    const db = firebaseDb();
    if (!db || !worldSync.chatRooms?.length) return;
    const updates = {};
    worldSync.chatRooms.slice(0, 24).forEach((room) => {
      if (!room?.id) return;
      const roomKey = safeFbKey(room.id);
      updates[`chatRooms/${roomKey}/id`] = room.id;
      updates[`chatRooms/${roomKey}/name`] = String(room.name || "").slice(0, 16);
      updates[`chatRooms/${roomKey}/createdBy`] = room.createdBy || "";
      updates[`chatRooms/${roomKey}/createdByName`] = room.createdByName || "";
      updates[`chatRooms/${roomKey}/createdAt`] = room.createdAt || "";
      updates[`chatRooms/${roomKey}/createdAtMs`] = Number(room.createdAtMs || 0);
      (room.messages || []).slice(-CHAT_CAP).forEach((message) => {
        if (message?.id) updates[`chatRooms/${roomKey}/messages/${safeFbKey(message.id)}`] = message;
      });
    });
    db.ref(FIREBASE_WORLD_PATH).update(updates).catch(() => {});
  }

  function startPresence() {
    const db = firebaseDb();
    if (!state?.playerId) return;
    stopPresence();
    if (db) {
      worldSync.presenceRootRef = db.ref(FIREBASE_PRESENCE_PATH);
      worldSync.presenceHandler = (snap) => {
        worldSync.presence = presenceRows(snap.val());
        renderSyncStatus();
      };
      worldSync.presenceRootRef.on("value", worldSync.presenceHandler);
      worldSync.connectedRef = db.ref(".info/connected");
      worldSync.connectedHandler = (snap) => {
        worldSync.connected = snap.val() === true;
        if (!worldSync.connected) {
          writePresence();
          renderSyncStatus();
          return;
        }
        const playerKey = safeFbKey(state.playerId);
        const tabKey = safeFbKey(clientId);
        worldSync.presenceRef = db.ref(`${FIREBASE_PRESENCE_PATH}/${playerKey}/${tabKey}`);
        worldSync.presenceRef.onDisconnect().remove().catch(() => {});
        writePresence();
        syncChatRoomsDirect();
        renderSyncStatus();
      };
      worldSync.connectedRef.on("value", worldSync.connectedHandler);
    }
    writePresence();
    worldSync.presenceTimer = setInterval(writePresence, PRESENCE_HEARTBEAT_MS);
  }

  function subscribeWorld() {
    const db = firebaseDb();
    if (!db) return;
    unsubscribeWorld();
    const handler = (snap) => {
      if (worldSync.putting) return;
      const remote = worldFromFirebase(snap.val());
      if (!remote) return;
      worldSync.online = true;
      applyRemoteWorld(remote, true);
      renderSyncStatus();
    };
    db.ref(FIREBASE_WORLD_PATH).on("value", handler);
    worldSync.unsub = handler;
  }

  async function pushWorld() {
    if (worldSync.putting || worldSync.applyingRemote || !state?.active) return false;
    if (isBanned(state.playerId) || isBanned(session?.id)) {
      ejectBanned();
      return false;
    }
    if (isServerStopped()) {
      ejectHalted();
      return false;
    }
    if (!firebaseReady()) {
      noteWorldError();
      return false;
    }
    worldSync.putting = true;
    try {
      let remote = null;
      try { remote = await fetchWorld(); } catch { remote = null; }
      if (remote) mergeWorld(remote, { preferLocal: true });
      else worldSync.needsSeed = true;
      const payload = buildWorldPayload();
      await putWorld(payload);
      renderSyncStatus();
      return true;
    } catch {
      noteWorldError();
      return false;
    } finally {
      worldSync.putting = false;
      if (worldSync.dirty) {
        worldSync.dirty = false;
        queuePush();
      }
    }
  }

  function queuePush() {
    worldSync.dirty = true;
    if (worldSync.putTimer) clearTimeout(worldSync.putTimer);
    worldSync.putTimer = setTimeout(() => {
      worldSync.dirty = false;
      pushWorld();
    }, PUT_DEBOUNCE_MS);
  }

  function markTouched(assetId) {
    if (assetId) worldSync.touched.add(assetId);
    queuePush();
  }

  async function pullWorld() {
    if (!state?.active || worldSync.putting || worldSync.applyingRemote || isDeskEditing()) return;
    try {
      const remote = await fetchWorld();
      if (!remote) return;
      worldSync.online = true;
      applyRemoteWorld(remote, true);
      renderSyncStatus();
    } catch {
      /* listener will retry */
    }
  }

  function computeWeekExpectations() {
    state.expected = {};
    state.changes = {};
    const event = state.event || EVENTS[0];
    state.assets.forEach((asset) => {
      asset.weekOpen = asset.weekOpen || asset.price;
      const eventEffect = event.effects?.[asset.sectorKey || asset.id] || event.effects?.[asset.id] || 0;
      const newsWeight = asset.playerCompany ? 0.28 : 1;
      const momentum = (asset.lastChange || 0) * .08;
      const expected = eventEffect * newsWeight + (asset.trend || 0) + momentum;
      const noise = (random() * 2 - 1) * (asset.noise || 0.01) * (asset.playerCompany ? 0.45 : 1);
      state.expected[asset.id] = expected;
      state.changes[asset.id] = Math.max(-.28, Math.min(.28, expected + noise));
    });
  }

  async function claimSettlement(periodKey) {
    const db = firebaseDb();
    if (!db) return true;
    const owner = `${state.playerId}:${clientId}`;
    const now = kstClock.ok ? kstNowMs() : Date.now();
    try {
      const result = await db.ref(`${FIREBASE_SETTLEMENT_PATH}/${safeFbKey(periodKey)}`).transaction((current) => {
        if (current?.status === "done") return;
        const claimedAt = Number(current?.claimedAt || 0);
        if (current?.owner && current.owner !== owner && now - claimedAt < SETTLEMENT_LOCK_MS) return;
        return { owner, periodKey, claimedAt: now, status: "running" };
      }, undefined, false);
      return !!result.committed && result.snapshot.val()?.owner === owner;
    } catch {
      return false;
    }
  }

  async function completeSettlement(periodKey) {
    const db = firebaseDb();
    if (!db) return;
    await db.ref(`${FIREBASE_SETTLEMENT_PATH}/${safeFbKey(periodKey)}`).update({
      status: "done",
      completedAt: firebase.database.ServerValue.TIMESTAMP,
    }).catch(() => {});
  }

  function applySettlementPrices() {
    botTick();
    ensureCoreListings();
    computeWeekExpectations();
    state.assets.forEach((asset) => {
      if (asset.playerCompany) {
        rollCompanyOps(asset);
        creditFounderOps(asset);
      }
      const newsChange = state.changes[asset.id] || 0;
      const flow = (asset.weekFlow || 0) / Math.max(40, asset.float || 400) * (asset.playerCompany ? 0.2 : 0.3);
      let extra = asset.playerCompany ? (asset.opsShock || 0) + newsChange : newsChange + flow;
      extra += climateTone() * (asset.playerCompany ? 0.003 : 0.008);
      if (!asset.playerCompany && Math.abs(extra) < 0.003) {
        extra = (extra >= 0 ? 1 : -1) * (0.004 + random() * 0.01);
      }
      asset.price = Math.max(5, round1(asset.price * (1 + extra)));
      if (asset.playerCompany) resolveAdTruth(asset);
      const open = asset.weekOpen || asset.history[asset.history.length - 1] || asset.price;
      asset.lastChange = open > 0 ? (asset.price - open) / open : extra;
      asset.lastFlow = asset.weekFlow || 0;
      asset.history = [...(asset.history || []), asset.price].slice(-16);
      pushTick(asset, asset.price);
      worldSync.touched.add(asset.id);
    });
  }

  function advanceSharedWeek() {
    if (state.week >= MAX_WEEKS) {
      state.season += 1;
      state.week = 1;
      const deckIdx = shuffled(EVENTS.map((_, i) => i)).slice(0, MAX_WEEKS);
      worldSync.eventDeck = deckIdx;
      state.eventDeck = deckIdx.map((i) => EVENTS[i]);
      state.goal = Math.round(state.goal * 1.12);
    } else {
      state.week += 1;
    }
    const deck = worldSync.eventDeck?.length ? worldSync.eventDeck : state.eventDeck.map((event) => eventIndex(event));
    worldSync.eventDeck = deck;
    state.event = EVENTS[deck[(state.week - 1) % deck.length]] || shuffled(EVENTS)[0];
    state.assets.forEach((asset) => {
      asset.weekOpen = asset.price;
      asset.weekFlow = 0;
      if (asset.ad && (asset.ad.week !== state.week || asset.ad.season !== state.season)) asset.ad = null;
    });
    computeWeekExpectations();
    resetLocalWeek();
  }

  async function settlePeriod(periodKey, options = {}) {
    if (!state?.active) return false;
    if (!kstClock.ok) useDeviceKst();
    const applied = worldSync.appliedPeriodId || "";
    if (!options.force && !options.manual && applied && applied >= periodKey) return false;
    const before = totalAssets();
    applySettlementPrices();
    worldSync.appliedPeriodId = periodKey;
    worldSync.lastSettledPeriodId = periodKey;
    let localDividend = 0;
    if (state.week % 4 === 0) {
      state.assets.forEach((asset) => {
        if (!(asset.dividend > 0)) return;
        const qty = state.holdings[asset.id]?.qty || 0;
        localDividend += asset.price * qty * asset.dividend;
      });
      if (localDividend > 0) {
        state.cash = round1(state.cash + localDividend);
        toast("💰", "분기 배당 입금", `${money(localDividend)}이 현금 계좌에 들어왔습니다.`);
      }
    }
    const after = totalAssets();
    if (after > 0 && state.cash / after >= .3) state.cashSafeWeeks += 1;
    checkMissions();
    checkBadges();
    showWeekResult(after - before, after, localDividend);
    advanceSharedWeek();
    state.locked = false;
    syncLocalPlayer();
    const pushed = await pushWorld();
    if (options.claimed && pushed) await completeSettlement(periodKey);
    renderAll();
    return true;
  }

  async function maybeSettleFromClock() {
    if (!worldSync.inMarket || !state?.active || worldSync.settling) return;
    if (!kstClock.ok) useDeviceKst();
    kstClock.parts = parseKstParts(kstNowMs());
    const ended = lastEndedPeriodId(kstClock.parts);
    const marker = worldSync.appliedPeriodId || worldSync.lastSettledPeriodId || "";
    const caughtUp = marker >= ended && !coresLookUnsettled();
    if (caughtUp) return;
    worldSync.settling = true;
    try {
      const claimed = await claimSettlement(ended);
      if (!claimed) {
        await pullWorld();
        return;
      }
      await settlePeriod(ended, { force: coresLookUnsettled() || marker < ended, claimed: true });
    } finally {
      worldSync.settling = false;
    }
  }

  function renderSyncStatus() {
    if (!els.playerCount) return;
    const cutoff = Date.now() - PRESENCE_STALE_MS;
    const onlineIds = new Set(
      (worldSync.presence || [])
        .filter((item) => item?.online !== false && Number(item.lastSeen || 0) >= cutoff)
        .map((item) => item.playerId),
    );
    if (worldSync.connected && state?.playerId) onlineIds.add(state.playerId);
    const n = Math.max(worldSync.inMarket ? 1 : 0, onlineIds.size);
    const sync = worldSync.connected && worldSync.online
      ? "실시간 연결"
      : (worldSync.online ? "공유 연결" : (firebaseReady() ? "재연결 중" : "오프라인 저장"));
    els.playerCount.textContent = `${n}명 접속 · ${sync}`;
    els.playerCount.classList.toggle("is-online", worldSync.connected && worldSync.online);
    els.playerCount.classList.toggle("is-reconnecting", firebaseReady() && !(worldSync.connected && worldSync.online));
  }

  function renderClock() {
    const info = clockLabel();
    if (state) state.sessionOpen = true;
    if (els.periodClock) els.periodClock.textContent = info.line;
    if (els.closeMarketHint) els.closeMarketHint.textContent = info.hint;
    if (els.lobbyClock) els.lobbyClock.textContent = info.line;
    renderSyncStatus();
  }

  async function tickClock() {
    if (kstClock.ok) kstClock.parts = parseKstParts(kstNowMs());
    renderClock();
    if (isDeskEditing()) return;
    await maybeSettleFromClock();
    if (state?.active) {
      maybeSettleLottery();
      tryClaimLotteryWin();
      renderRoom();
    }
  }

  function startWorldLoop() {
    stopWorldSync();
    subscribeWorld();
    subscribeBans();
    subscribeHalt();
    subscribeClimate();
    startPresence();
    worldSync.pollTimer = setInterval(pullWorld, POLL_MS);
    worldSync.clockTimer = setInterval(() => { tickClock(); }, 1000);
    worldSync.kstTimer = setInterval(() => { refreshKst().then(() => tickClock()); }, KST_POLL_MS);
    worldSync.chartTimer = setInterval(() => {
      if (!state?.active) return;
      sampleLiveTicks();
      updateLiveCharts();
    }, TICK_MS);
    window.addEventListener("focus", onWorldFocus);
    watchClientBuild();
    if (worldSync.buildTimer) clearInterval(worldSync.buildTimer);
    worldSync.buildTimer = setInterval(watchClientBuild, 20000);
  }

  function watchClientBuild() {
    if (isDeskEditing() || state?.active || worldSync.inMarket) return;
    fetch(`build.json?t=${Date.now()}`, { cache: "no-store" }).then((res) => {
      if (!res.ok) return null;
      return res.json();
    }).then((row) => {
      if (!row?.build || String(row.build) === CLIENT_BUILD) return;
      const key = `bull-lab-reload-${row.build}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      location.reload();
    }).catch(() => {});
  }

  function onWorldFocus() {
    if (isDeskEditing()) return;
    refreshKst().then(() => tickClock());
    pullWorld();
  }

  async function enterGlobalMarket() {
    if (worldSync.entering) return;
    worldSync.entering = true;
    try {
      if (!requireSession()) {
        if (els.lobbyStatus) els.lobbyStatus.textContent = "먼저 로그인한 뒤 시장에 입장하세요.";
        return;
      }
      await fetchBans();
      await fetchHalt();
      await fetchClimate();
      if (isBanned(session.id)) {
        if (els.lobbyStatus) els.lobbyStatus.textContent = "이 계좌는 강퇴되어 시장에 들어갈 수 없습니다.";
        toast("🚫", "입장 거부", "강퇴된 아이디입니다. 다른 계좌를 만드세요.");
        return;
      }
      if (isServerStopped()) {
        showHaltedScreen();
        return;
      }
      if (worldSync.inMarket && state?.active) {
        closeModal(els.lobbyModal);
        closeModal(els.setupModal);
        revealDesk();
        renderAll();
        els.game.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("📈", "거래 중", "이미 시장에 들어가 있습니다. 지금 사고팔 수 있습니다.");
        return;
      }
      if (els.lobbyStatus) els.lobbyStatus.textContent = "시장에 들어가는 중… 이 화면이 닫히면 거래가 시작된 것입니다.";
      if (!kstClock.ok) useDeviceKst();
      if (!state || state.active) bootRun();
      state.playerId = session.id;
      state.playerName = session.nick;
      applyWallet(readWallet(session.id));
      const local = readLocalWorld();
      if (local) {
        try { mergeWorld(local, { preferLocal: true }); } catch { /* ignore bad cache */ }
      }
      let fetched = null;
      try { fetched = await fetchWorld(); } catch { fetched = null; }
      if (fetched) {
        try { mergeWorld(fetched, { preferLocal: false }); } catch { /* keep local listings */ }
      }
      try { restoreAccountWealth(fetched || local); } catch { ensureTradableCash(); }
      purgeBots();
      ensureCoreListings();
      ensureTradableCash();
      computeWeekExpectations();
      if (worldSync.eventDeck?.length) {
        state.eventDeck = worldSync.eventDeck.map((i) => EVENTS[i] || EVENTS[0]);
        state.event = hydrateEvent(worldSync.eventDeck[state.week - 1], state.event);
      }
      beginLocalGame();
      startWorldLoop();
      queuePush();
      toast("📈", "시장 입장", firebaseReady()
        ? "거래가 시작됐습니다. 다른 학생이 만든 회사도 Firebase에서 바로 보입니다."
        : "거래는 열렸지만 Firebase 설정이 없어 다른 학생 회사는 아직 안 보입니다.");
      closeModal(els.lobbyModal);
      closeModal(els.setupModal);
      await maybeSettleFromClock();
      refreshKst().catch(() => useDeviceKst());
    } catch (err) {
      console.error(err);
      if (els.lobbyStatus) els.lobbyStatus.textContent = "입장에 실패했습니다. 시장 입장을 다시 눌러 주세요.";
      try {
        if (!state) bootRun();
        ensureTradableCash();
        beginLocalGame();
        closeModal(els.lobbyModal);
        closeModal(els.setupModal);
        toast("📈", "로컬 입장", "공유 연결 전이지만 지금 사고팔 수 있습니다.");
      } catch {
        revealDesk();
        if (state) {
          state.active = true;
          worldSync.inMarket = true;
        }
        try { renderAll(); } catch { /* ignore */ }
      }
    } finally {
      setTimeout(() => { worldSync.entering = false; }, 400);
    }
  }

  function compressAdImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve("");
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const max = 360;
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          const scale = max / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        let canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        let quality = 0.58;
        let data = canvas.toDataURL("image/jpeg", quality);
        while (data.length > MAX_AD_IMAGE_DATA_LENGTH && quality > 0.3) {
          quality -= 0.1;
          data = canvas.toDataURL("image/jpeg", quality);
        }
        while (data.length > MAX_AD_IMAGE_DATA_LENGTH && canvas.width > 120 && canvas.height > 120) {
          const smaller = document.createElement("canvas");
          smaller.width = Math.max(120, Math.round(canvas.width * 0.8));
          smaller.height = Math.max(120, Math.round(canvas.height * 0.8));
          smaller.getContext("2d").drawImage(canvas, 0, 0, smaller.width, smaller.height);
          canvas = smaller;
          data = canvas.toDataURL("image/jpeg", 0.3);
        }
        if (data.length > MAX_AD_IMAGE_DATA_LENGTH) {
          reject(new Error("image-size"));
          return;
        }
        resolve(data);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      img.src = url;
    });
  }

  function renderChat() {
    if (!els.chatLog) return;
    const rooms = worldSync.chatRooms || [];
    if (els.chatRoomCount) els.chatRoomCount.textContent = `${rooms.length}개 방`;
    if (els.chatRoomSelect) {
      els.chatRoomSelect.innerHTML = rooms.length
        ? rooms.map((room) => `<option value="${esc(room.id)}" ${room.id === activeChatRoomId ? "selected" : ""}>${esc(room.name)}</option>`).join("")
        : `<option value="">방 없음</option>`;
    }
    const room = rooms.find((item) => item.id === activeChatRoomId);
    if (!room) {
      els.chatLog.innerHTML = `<li class="empty-log">방을 만들거나 골라 대화를 시작하세요.</li>`;
      return;
    }
    if (!room.messages?.length) {
      els.chatLog.innerHTML = `<li class="empty-log">아직 메시지가 없습니다.</li>`;
      return;
    }
    els.chatLog.innerHTML = room.messages.map((msg) => `
      <li>
        <b>${esc(msg.authorName || "익명")}</b>
        <span>${esc(msg.text)}</span>
        <time>${esc(msg.ts || "")}</time>
      </li>
    `).join("");
    els.chatLog.scrollTop = els.chatLog.scrollHeight;
  }

  function createChatRoom(name) {
    const title = String(name || "").trim().slice(0, 16);
    if (title.length < 2) return false;
    const room = {
      id: makeId("chat"),
      name: title,
      createdBy: state.playerId,
      createdByName: state.playerName,
      createdAt: kstStamp(),
      createdAtMs: kstClock.ok ? kstNowMs() : Date.now(),
      messages: [],
    };
    worldSync.chatRooms = worldSync.chatRooms || [];
    worldSync.chatRooms.push(room);
    activeChatRoomId = room.id;
    const db = firebaseDb();
    if (db) {
      const stored = { ...room };
      delete stored.messages;
      db.ref(`${FIREBASE_WORLD_PATH}/chatRooms/${safeFbKey(room.id)}`).set(stored).catch(() => {
        noteWorldError();
        queuePush();
      });
    } else {
      queuePush();
    }
    renderChat();
    return true;
  }

  function sendChat(text) {
    const body = String(text || "").trim().slice(0, 80);
    if (!body || !activeChatRoomId) return false;
    const room = (worldSync.chatRooms || []).find((item) => item.id === activeChatRoomId);
    if (!room) return false;
    room.messages = room.messages || [];
    const message = {
      id: makeId("msg"),
      authorId: state.playerId,
      authorName: state.playerName,
      text: body,
      ts: kstClock.ok ? kstStamp() : "",
      createdAt: kstClock.ok ? kstNowMs() : Date.now(),
    };
    room.messages.push(message);
    room.messages = room.messages.slice(-CHAT_CAP);
    const db = firebaseDb();
    if (db) {
      db.ref(`${FIREBASE_WORLD_PATH}/chatRooms/${safeFbKey(room.id)}/messages/${safeFbKey(message.id)}`).set(message).catch(() => {
        noteWorldError();
        queuePush();
      });
    } else {
      queuePush();
    }
    renderChat();
    return true;
  }

  function destroyNet() {
    stopWorldSync();
    window.removeEventListener("focus", onWorldFocus);
  }

  function sendWallet() {
    writeWallet();
    if (state?.active) queuePush();
  }

  function broadcastState() {
    queuePush();
  }

  function buildSnapshot() {
    return buildWorldPayload();
  }

  function applySnapshot(snapshot) {
    mergeWorld(snapshot, { preferLocal: false });
  }

  function hideDesk() {
    els.game.hidden = true;
    els.game.classList.add("is-locked");
    if (els.marketNav) els.marketNav.hidden = true;
    document.body.classList.remove("in-play");
    if (els.hero) els.hero.hidden = false;
  }

  function fillFoundSectors() {
    els.foundSector.innerHTML = SECTORS.map((item) => `<option value="${item.key}">${item.label}</option>`).join("");
  }

  function openFoundModal() {
    if (!state?.active) {
      toast("📈", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    if (state.founded) {
      toast("🏢", "이미 설립함", "한 곳에 한 회사만 운영할 수 있습니다. 새로 만들려면 먼저 폐업하세요.");
      return;
    }
    els.foundError.hidden = true;
    els.foundName.value = "";
    els.foundSymbol.value = "";
    const availableSeed = Math.floor(round1(Math.max(0, state.cash)) / 10) * 10;
    const suggestedSeed = Math.floor(Math.min(120, Math.max(MIN_SEED, state.cash * 0.18)) / 10) * 10;
    els.foundSeed.max = String(Math.max(MIN_SEED, availableSeed));
    els.foundSeed.value = String(Math.min(Math.max(MIN_SEED, availableSeed), suggestedSeed));
    fillFoundSectors();
    openModal(els.foundModal);
  }

  function openCloseModal() {
    if (!state?.active) {
      toast("📈", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    if (!state.founded) {
      toast("🏢", "회사 없음", "폐업할 회사가 없습니다.");
      return;
    }
    const asset = assetById(state.founded.assetId);
    const name = asset?.name || state.founded.name || "회사";
    const symbol = asset?.symbol || state.founded.symbol || "";
    if (els.closeLead) {
      els.closeLead.textContent = `${name}${symbol ? `(${symbol})` : ""}를 폐업하면 이 회사 주식은 즉시 사라집니다. 산 사람은 돈을 돌려받지 못하고, 창업 시드와 남은 지분도 현금으로 바뀌지 않습니다. 이후 새 회사를 만들 수 있습니다.`;
    }
    if (els.closeError) els.closeError.hidden = true;
    openModal(els.closeModal);
  }

  function submitCloseCompany() {
    const result = closeCompany();
    if (!result.ok) {
      if (els.closeError) {
        els.closeError.hidden = false;
        els.closeError.textContent = result.err === "missing" ? "폐업할 회사가 없습니다." : "폐업하지 못했습니다.";
      }
      return;
    }
    closeModal(els.closeModal);
    toast("🏚️", "폐업", `${result.name}(${result.symbol}) 상장 폐지 · 내 지분 ${money(result.lost)} 소각 · 투자금 반환 없음`);
    renderAll();
  }

  function openAdModal() {
    if (!state?.active) {
      toast("📈", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    if (!state.founded) {
      toast("📢", "회사 없음", "먼저 회사를 설립해야 광고를 집행할 수 있습니다.");
      return;
    }
    if (state.adDone) {
      toast("📢", "이번 주 완료", "광고는 주당 한 번입니다.");
      return;
    }
    els.adError.hidden = true;
    els.adSlogan.value = "";
    pendingAdImage = "";
    if (els.adImage) els.adImage.value = "";
    openModal(els.adModal);
  }

  function showLendError(message) {
    if (!els.lendError) return;
    els.lendError.hidden = false;
    els.lendError.textContent = message;
  }

  function showBorrowError(message) {
    if (!els.borrowError) return;
    els.borrowError.hidden = false;
    els.borrowError.textContent = message;
  }

  function openLendModal() {
    if (!state?.active) {
      toast("📈", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    const existing = (state.lenders || []).find((item) => item.ownerId === state.playerId);
    els.lendError.hidden = true;
    if (els.lendTitle) els.lendTitle.textContent = existing ? "대출회사 운영" : "대출회사 설립";
    if (els.lendName) els.lendName.value = existing?.name || "";
    if (els.lendRate) els.lendRate.value = String(existing?.rate || 5);
    const seedLabel = els.lendSeed?.closest("label");
    if (seedLabel && seedLabel.firstChild) {
      seedLabel.firstChild.textContent = existing ? "추가 출자금 (만원)" : "출자금 (만원)";
    }
    if (els.lendSeed) {
      els.lendSeed.min = existing ? "0" : String(MIN_LEND_SEED);
      const available = Math.floor(round1(Math.max(0, state.cash)) / 10) * 10;
      if (existing) {
        els.lendSeed.value = "0";
        els.lendSeed.max = String(Math.max(0, available));
      } else {
        const suggested = Math.floor(Math.min(120, Math.max(MIN_LEND_SEED, state.cash * 0.12)) / 10) * 10;
        els.lendSeed.max = String(Math.max(MIN_LEND_SEED, available));
        els.lendSeed.value = String(Math.min(Math.max(MIN_LEND_SEED, available), suggested));
      }
    }
    const submit = els.lendForm?.querySelector("button[type='submit']");
    if (submit) submit.innerHTML = existing ? `저장하기 <span>→</span>` : `대출회사 열기 <span>→</span>`;
    openModal(els.lendModal);
  }

  function openBorrowDesk(action, lenderId) {
    if (!state?.active) {
      toast("📈", "시장 입장 전", "먼저 투자 시작하기를 눌러 시장에 들어가 주세요.");
      return;
    }
    pendingLendAction = action;
    pendingBorrowLenderId = lenderId || "";
    els.borrowError.hidden = true;
    const lender = lenderById(lenderId) || (state.lenders || []).find((item) => item.ownerId === state.playerId);
    const titles = {
      borrow: "대출 받기",
      repay: "대출 갚기",
      fund: "출자금 넣기",
      withdraw: "출자금 출금",
    };
    if (els.borrowTitle) els.borrowTitle.textContent = titles[action] || "대출";
    const amountEl = els.borrowAmount;
    if (action === "borrow") {
      const max = Math.min(MAX_BORROW, Math.floor((Number(lender?.pool) || 0)));
      els.borrowLead.textContent = `${lender?.name || "대출회사"} · 교시당 ${lender?.rate || 0}% · 재원 ${money(lender?.pool || 0)}. 주식처럼 사고파는 회사가 아닙니다.`;
      if (amountEl) {
        amountEl.min = String(MIN_BORROW);
        amountEl.step = "1";
        amountEl.max = String(Math.max(MIN_BORROW, max));
        amountEl.value = String(Math.min(40, Math.max(MIN_BORROW, max)));
      }
    } else if (action === "repay") {
      const loan = openLoanFor(lenderId, state.playerId);
      const remaining = loanRemaining(loan);
      const cap = round1(Math.min(Number(state.cash) || 0, remaining));
      els.borrowLead.textContent = `${lender?.name || "대출회사"}에 ${money(remaining)}이 남아 있습니다. 한 번에 전액까지 갚을 수 있고, 갚은 돈은 회사 재원으로 들어갑니다.`;
      if (amountEl) {
        amountEl.min = "0.1";
        amountEl.step = "0.1";
        amountEl.max = String(Math.max(0.1, cap));
        amountEl.value = String(Math.max(0.1, cap));
      }
    } else if (action === "fund") {
      els.borrowLead.textContent = "현금에서 대출 재원으로 옮깁니다. 상장 주식과는 별개입니다.";
      if (amountEl) {
        amountEl.min = "10";
        amountEl.step = "1";
        amountEl.max = String(Math.max(10, Math.floor(state.cash)));
        amountEl.value = String(Math.min(20, Math.max(10, Math.floor(state.cash))));
      }
    } else {
      const pool = Number(lender?.pool) || 0;
      els.borrowLead.textContent = `재원 ${money(pool)}을 내 현금으로 옮깁니다.`;
      if (amountEl) {
        amountEl.min = "1";
        amountEl.step = "1";
        amountEl.max = String(Math.max(1, Math.floor(pool)));
        amountEl.value = String(Math.max(1, Math.floor(pool)));
      }
    }
    const submit = els.borrowForm?.querySelector("button[type='submit']");
    if (submit) {
      submit.innerHTML = action === "borrow" ? `빌리기 <span>→</span>`
        : action === "repay" ? `갚기 <span>→</span>`
          : action === "fund" ? `출자하기 <span>→</span>`
            : `출금하기 <span>→</span>`;
    }
    openModal(els.borrowModal);
  }

  async function submitLend(event) {
    event.preventDefault();
    const spec = {
      ownerId: state.playerId,
      ownerName: state.playerName,
      name: els.lendName.value,
      rate: Number(els.lendRate.value),
      seed: Number(els.lendSeed.value),
    };
    const result = state.lending ? await updateLenderDesk(spec) : listLender(spec);
    if (!result.ok) {
      const map = {
        once: "대출회사는 계정당 한 곳입니다.",
        name: "상호를 2자 이상 입력하세요.",
        rate: `이자는 교시당 ${MIN_LEND_RATE}–${MAX_LEND_RATE}%입니다.`,
        cash: "출자할 현금이 부족합니다.",
        missing: "대출회사가 없습니다.",
        pool: "대출 재원이 부족합니다.",
        network: "공유 시장에 닿지 못했습니다. 잠시 후 다시 눌러 주세요.",
      };
      showLendError(map[result.err] || "저장에 실패했습니다.");
      return;
    }
    closeModal(els.lendModal);
    if (result.cost) toast("🏦", "대출회사", `${result.lender.name} · 재원 ${money(result.cost)} · 교시당 ${result.lender.rate}%`);
    else toast("🏦", "대출 운영", `${result.lender.name} · 교시당 ${result.lender.rate}%${result.extra ? ` · 추가 ${money(result.extra)}` : ""}`);
    renderAll();
  }

  async function submitBorrow(event) {
    event.preventDefault();
    const amount = round1(Number(els.borrowAmount.value));
    if (!(amount > 0)) {
      showBorrowError("금액을 입력하세요.");
      return;
    }
    const action = pendingLendAction;
    const lenderId = pendingBorrowLenderId;
    let result;
    if (action === "borrow") result = await borrowFromLender(lenderId, amount);
    else if (action === "repay") result = await repayLoan(lenderId, amount);
    else if (action === "fund") result = await moveOwnPool(amount);
    else if (action === "withdraw") result = await moveOwnPool(-amount);
    else result = { ok: false, err: "locked" };
    if (!result.ok) {
      const map = {
        locked: "시장에 들어간 뒤 이용하세요.",
        missing: "대상 대출을 찾지 못했습니다.",
        self: "자기 회사에서는 빌릴 수 없습니다.",
        min: "금액이 너무 작습니다.",
        max: `한 번에 ${money(MAX_BORROW)}까지입니다.`,
        open: "이 회사에서 이미 갚지 않은 대출이 있습니다.",
        pool: "대출 재원이 부족합니다.",
        cash: "현금이 부족합니다.",
        network: "공유 시장에 닿지 못했습니다. 잠시 후 다시 눌러 주세요.",
      };
      showBorrowError(map[result.err] || "처리하지 못했습니다.");
      return;
    }
    closeModal(els.borrowModal);
    if (action === "borrow") toast("💸", "대출 실행", `${result.lender?.name || "대출회사"}에서 ${money(result.amount)}을 빌렸습니다.`);
    else if (action === "repay") toast("🧾", "상환", `${money(result.amount)}을 갚았습니다.${result.remaining > 0 ? ` 남은 빚 ${money(result.remaining)}` : " 완납"}`);
    else if (action === "fund") toast("🏦", "추가 출자", `재원에 ${money(result.delta)}을 넣었습니다.`);
    else toast("🏦", "출금", `재원에서 ${money(-result.delta)}을 현금으로 옮겼습니다.`);
    renderAll();
  }

  function renderLenders() {
    if (!els.lendList) return;
    const lenders = (state.lenders || []).slice().sort((a, b) => (b.pool || 0) - (a.pool || 0));
    const myDebt = (state.loans || []).reduce((sum, loan) => (
      loan.borrowerId === state.playerId ? sum + loanRemaining(loan) : sum
    ), 0);
    if (els.lendDebt) {
      els.lendDebt.hidden = !(myDebt > 0);
      els.lendDebt.textContent = myDebt > 0 ? `내가 갚을 돈 ${money(myDebt)} · 이자는 교시가 끝날 때마다 붙습니다.` : "";
    }
    if (!lenders.length) {
      els.lendList.innerHTML = `<li class="lend-empty">아직 대출회사가 없습니다. 주식 회사와 별도로, 돈을 빌려주는 창구만 열 수 있습니다.</li>`;
      return;
    }
    els.lendList.innerHTML = lenders.map((lender) => {
      const mine = lender.ownerId === state.playerId;
      const loan = openLoanFor(lender.id, state.playerId);
      const remaining = loanRemaining(loan);
      const issued = (state.loans || []).reduce((sum, row) => (
        row.lenderId === lender.id && row.status !== "closed" ? sum + loanRemaining(row) : sum
      ), 0);
      const actions = mine
        ? `<button type="button" data-lend-action="fund" data-id="${esc(lender.id)}">출자</button>
           <button type="button" data-lend-action="withdraw" data-id="${esc(lender.id)}">출금</button>`
        : remaining > 0
          ? `<button type="button" data-lend-action="repay" data-id="${esc(lender.id)}">갚기</button>`
          : `<button type="button" data-lend-action="borrow" data-id="${esc(lender.id)}" ${Number(lender.pool) < MIN_BORROW ? "disabled" : ""}>빌리기</button>`;
      return `
        <li class="${mine ? "is-mine" : ""}">
          <span class="lend-sym">${mine ? "내 회사" : "대출"} · 교시당 ${esc(lender.rate)}%</span>
          <b>${esc(lender.name)}</b>
          <small>${esc(lender.ownerName || "사장")} · 재원 ${money(lender.pool)}${issued > 0 ? ` · 빌려준 잔액 ${money(issued)}` : ""}${remaining > 0 ? ` · 내 빚 ${money(remaining)}` : ""}</small>
          <div class="lend-actions">${actions}</div>
        </li>`;
    }).join("");
  }

  function submitFound(event) {
    event.preventDefault();
    const spec = {
      ownerId: state.playerId,
      ownerName: state.playerName,
      name: els.foundName.value,
      symbol: els.foundSymbol.value,
      sectorKey: els.foundSector.value,
      seed: Number(els.foundSeed.value),
    };
    const result = listCompany(spec);
    if (!result.ok) {
      const map = {
        once: "이미 회사를 운영 중입니다. 새로 만들려면 먼저 폐업하세요.",
        ticker: "티커는 영문 2–4자입니다.",
        dup: "이미 있는 티커입니다.",
        name: "상호를 2자 이상 입력하세요.",
        cash: "시드 현금이 부족합니다.",
      };
      els.foundError.hidden = false;
      els.foundError.textContent = map[result.err] || "설립에 실패했습니다.";
      return;
    }
    closeModal(els.foundModal);
    toast("🏛️", "상장", `${result.asset.name}(${result.asset.symbol}) · 창업 ${result.founderQty}주`);
    selectChart(result.asset.id);
    renderAll();
  }

  async function submitAd(event) {
    event.preventDefault();
    let image = pendingAdImage;
    if (els.adImage?.files?.[0]) {
      try {
        image = await compressAdImage(els.adImage.files[0]);
      } catch {
        image = "";
      }
    }
    const result = publishAd(state.playerId, els.adSlogan.value, els.adClaim.value, image);
    if (!result.ok) {
      const map = {
        company: "설립한 회사가 없습니다.",
        once: "이번 주 광고는 이미 집행했습니다.",
        cash: "광고비 18만원이 필요합니다.",
        energy: "에너지가 부족합니다.",
      };
      els.adError.hidden = false;
      els.adError.textContent = map[result.err] || "광고를 올리지 못했습니다.";
      return;
    }
    closeModal(els.adModal);
    pendingAdImage = "";
    toast("📣", "광고 게재", `${result.asset.symbol} · ${els.adSlogan.value}`);
    renderAll();
  }

  function renderRanking() {
    const ranked = humansRanked();
    const meIndex = ranked.findIndex((player) => player.id === state?.playerId);
    let top = ranked.slice(0, 5);
    if (meIndex >= 5) top = [...ranked.slice(0, 4), ranked[meIndex]];
    const place = (player) => ranked.findIndex((item) => item.id === player.id) + 1;
    const rows = top.map((player) => {
      const me = player.id === state?.playerId;
      const firm = player.founded?.symbol || "";
      return `
        <li class="${me ? "is-me" : ""}">
          <span class="rank-n">${place(player)}</span>
          <b>${esc(player.name || player.id)}${me ? `<span class="me-tag">나</span>` : ""}</b>
          <small>${firm ? `${esc(firm)} · ` : ""}${money(player.total || 0)}</small>
        </li>`;
    }).join("");
    if (els.rankStrip) {
      els.rankStrip.innerHTML = top.map((player) => {
        const me = player.id === state?.playerId;
        return `<li class="${me ? "is-me" : ""}"><b>${place(player)} ${esc(player.name || player.id)}${me ? `<span class="me-tag">나</span>` : ""}</b><small>${money(player.total || 0)}</small></li>`;
      }).join("");
    }
    if (els.rankList) {
      els.rankList.innerHTML = top.length ? rows : `<li class="empty-log">시장에 입장하면 순위가 집계됩니다.</li>`;
    }
  }

  async function loadPublicRanking() {
    try {
      await fetchBans();
      const remote = await fetchWorld();
      if (!remote?.players) return;
      mergePlayers(remote.players);
      purgeBots();
      worldSync.online = true;
      renderRanking();
      renderSyncStatus();
    } catch {
      /* keep the locally cached ranking */
    }
  }

  function renderRoom() {
    if (els.roomCodeLabel) els.roomCodeLabel.textContent = state.active ? "거래 중 · 전 세계 단일 시장" : "입장 전";
    renderRanking();
    renderClock();
    const closed = !state.active;
    if (els.closeMarket) els.closeMarket.disabled = !state.active;
    if (els.foundButton) {
      const off = closed || !!state.founded;
      els.foundButton.disabled = false;
      els.foundButton.classList.toggle("is-off", off);
      els.foundButton.setAttribute("aria-disabled", off ? "true" : "false");
    }
    if (els.closeButton) {
      const off = closed || !state.founded;
      els.closeButton.disabled = false;
      els.closeButton.classList.toggle("is-off", off);
      els.closeButton.setAttribute("aria-disabled", off ? "true" : "false");
    }
    if (els.lendButton) {
      els.lendButton.disabled = false;
      els.lendButton.classList.toggle("is-off", closed);
      els.lendButton.setAttribute("aria-disabled", closed ? "true" : "false");
      els.lendButton.textContent = state.lending ? "대출 운영" : "대출회사";
    }
    if (els.adButton) {
      const off = closed || !state.founded || state.adDone;
      els.adButton.disabled = false;
      els.adButton.classList.toggle("is-off", off);
      els.adButton.setAttribute("aria-disabled", off ? "true" : "false");
    }
    if (!isDeskEditing()) {
      renderRanking();
      renderChat();
    }
  }

  function renderAds() {
    const ads = state.assets.filter((asset) => asset.ad && asset.ad.week === state.week && asset.ad.season === state.season);
    if (!els.adTicker) return;
    if (!ads.length) {
      els.adTicker.textContent = "아직 올라온 광고가 없습니다. 창업자가 집행하면 이곳에 뜹니다.";
      els.adList.innerHTML = "";
      return;
    }
    els.adTicker.textContent = ads.map((asset) => `[${asset.symbol}] ${asset.ad.slogan}`).join("   ·   ");
    els.adList.innerHTML = ads.map((asset) => {
      const image = safeImageUrl(asset.ad.image);
      const img = image ? `<img class="ad-thumb" alt="" src="${esc(image)}">` : "";
      return `
      <li>
        <span class="ad-sym">${esc(asset.symbol)} · ${esc(AD_CLAIMS[asset.ad.claim] || "")}</span>
        <b>${esc(asset.ad.slogan)}</b>
        <small>${esc(asset.founderName || "창업자")} 집행 · 사실 여부는 미확인</small>
        ${img}
      </li>
    `;
    }).join("");
  }

  function activityWeekKey() {
    return `s${state?.season || 1}-w${state?.week || 1}`;
  }

  function applyWeekActivity(row) {
    if (!row || !state) return false;
    const key = row.activityWeek || (Number.isFinite(row.season) && Number.isFinite(row.week) ? `s${row.season}-w${row.week}` : "");
    if (key && key !== activityWeekKey()) return false;
    if (Number.isFinite(Number(row.energy))) {
      state.energy = Math.max(0, Math.min(state.energyMax, Math.floor(Number(row.energy))));
    }
    if (Array.isArray(row.jobsDone)) state.jobsDone = new Set(row.jobsDone);
    if (Array.isArray(row.intelDone)) state.intelDone = new Set(row.intelDone);
    if (Array.isArray(row.playDone)) state.playDone = new Set(row.playDone);
    const jobsById = Object.fromEntries(JOBS.map((item) => [item.id, item]));
    const playsById = Object.fromEntries(PLAYS.map((item) => [item.id, item]));
    if (Array.isArray(row.weekJobIds) && row.weekJobIds.length) {
      state.weekJobs = row.weekJobIds.map((id) => jobsById[id]).filter(Boolean);
    }
    if (Array.isArray(row.weekPlayIds) && row.weekPlayIds.length) {
      state.weekPlays = row.weekPlayIds.map((id) => playsById[id]).filter(Boolean);
    }
    if (typeof row.adDone === "boolean") state.adDone = row.adDone;
    if (Array.isArray(row.analyzed)) state.analyzed = new Set(row.analyzed);
    if (row.intel && typeof row.intel === "object") state.intel = row.intel;
    return true;
  }

  function resetLocalWeek() {
    state.analyzed = new Set();
    state.intel = {};
    state.jobsDone = new Set();
    state.intelDone = new Set();
    state.playDone = new Set();
    state.energy = state.energyMax;
    state.weekJobs = shuffled(JOBS).slice(0, 4);
    state.weekPlays = shuffled(PLAYS).slice(0, 5);
    state.adDone = false;
    state.locked = false;
  }

  function startWeekActivities(fresh = false) {
    if (!fresh && applyWeekActivity(readWallet(state.playerId))) {
      if (!state.weekJobs.length) state.weekJobs = shuffled(JOBS).slice(0, 4);
      if (!state.weekPlays.length) state.weekPlays = shuffled(PLAYS).slice(0, 5);
      writeWallet();
      return;
    }
    resetLocalWeek();
    writeWallet();
  }

  function beginLocalGame() {
    state.playMode = "global";
    state.roomCode = "GLOBAL";
    state.active = true;
    state.locked = false;
    worldSync.inMarket = true;
    ensureCoreListings();
    ensureTradableCash();
    syncLocalPlayer();
    if (!state.event) prepareWeek();
    else {
      computeWeekExpectations();
      startWeekActivities(false);
      state.ads = state.assets.filter((asset) => asset.ad && asset.ad.week === state.week && asset.ad.season === state.season).map((asset) => ({
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        slogan: asset.ad.slogan,
        claim: asset.ad.claim,
        image: asset.ad.image || "",
      }));
    }
    renderAll();
    revealDesk();
    renderStartCta();
    els.game.scrollIntoView({ behavior: "smooth", block: "start" });
    tone(440, .08, "square");
    setTimeout(() => tone(660, .12, "square"), 80);
  }

  function money(value) {
    const rounded = Math.round(value * 10) / 10;
    return `${rounded.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만원`;
  }

  function signedMoney(value) {
    if (Math.abs(value) < .05) return "0만원";
    return `${value > 0 ? "+" : "−"}${money(Math.abs(value))}`;
  }

  function percent(value, signed = true) {
    const sign = signed && value > 0 ? "+" : "";
    return `${sign}${(value * 100).toFixed(1)}%`;
  }

  function assetById(id) {
    return state.assets.find((asset) => asset.id === id);
  }

  function totalAssets() {
    const stocks = state.assets.reduce((sum, asset) => {
      const holding = ensureHolding(state.holdings, asset.id);
      return sum + quotePrice(asset) * holding.qty;
    }, 0);
    return round1(state.cash + stocks + lendingNetFor(state.playerId));
  }

  function holdingsValue() {
    return state.assets.reduce((sum, asset) => {
      const holding = ensureHolding(state.holdings, asset.id);
      return sum + quotePrice(asset) * holding.qty;
    }, 0);
  }

  function returnRate() {
    return (totalAssets() - state.initialCash) / state.initialCash;
  }

  function prepareWeek() {
    state.event = state.eventDeck[state.week - 1] || shuffled(EVENTS)[0];
    state.expected = {};
    state.changes = {};
    startWeekActivities(false);
    state.assets.forEach((asset) => {
      asset.weekOpen = asset.price;
      asset.weekFlow = 0;
      if (asset.ad && (asset.ad.week !== state.week || asset.ad.season !== state.season)) {
        asset.ad = null;
      }
      const eventEffect = state.event.effects?.[asset.sectorKey || asset.id] || state.event.effects?.[asset.id] || 0;
      const newsWeight = asset.playerCompany ? 0.28 : 1;
      const momentum = (asset.lastChange || 0) * .08;
      const expected = eventEffect * newsWeight + (asset.trend || 0) + momentum;
      const noise = (random() * 2 - 1) * (asset.noise || 0.01) * (asset.playerCompany ? 0.45 : 1);
      state.expected[asset.id] = expected;
      state.changes[asset.id] = Math.max(-.28, Math.min(.28, expected + noise));
    });
    state.ads = state.assets.filter((asset) => asset.ad && asset.ad.week === state.week && asset.ad.season === state.season).map((asset) => ({
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      slogan: asset.ad.slogan,
      claim: asset.ad.claim,
    }));
    syncLocalPlayer();
    if (isAuthority()) scheduleBots();
    renderAll();
  }

  function forecastFor(asset) {
    const info = state.intel[asset.id];
    if (info) return { text: info.text, type: info.type || "hidden-info" };
    return { text: "미확인", type: "hidden-info" };
  }

  function renderAll() {
    if (!state) return;
    renderSummary();
    if (els.closeMarket) els.closeMarket.disabled = !state.active;
    if (isDeskEditing()) {
      patchAssetRows();
      updateLiveCharts();
      renderClock();
      renderSyncStatus();
      return;
    }
    renderNews();
    renderAssets();
    renderLiveBoard();
    updateLiveCharts();
    renderPortfolio();
    renderMissions();
    renderBadges();
    renderLog();
    renderActivities();
    renderRoom();
    renderAds();
    renderLenders();
    renderChat();
  }

  function renderSummary() {
    const total = totalAssets();
    const profit = total - state.initialCash;
    const rate = profit / state.initialCash;
    const cashRatio = total > 0 ? state.cash / total : 0;
    const progress = total / state.goal;

    els.weekLabel.textContent = `시즌 ${state.season} · ${state.week}주차`;
    els.difficultyLabel.textContent = state.config.name;
    els.totalAssets.textContent = money(total);
    els.cash.textContent = money(state.cash);
    els.cashRatio.textContent = `현금 비중 ${Math.round(cashRatio * 100)}%`;
    els.totalReturn.textContent = percent(rate);
    els.totalReturn.style.color = rate > 0 ? "var(--red)" : rate < 0 ? "var(--green)" : "";
    els.profitValue.textContent = `평가 손익 ${signedMoney(profit)}`;
    els.research.textContent = state.research;
    els.energyPoints.textContent = String(state.energy);
    els.energyMax.textContent = String(state.energyMax);
    els.energyChip.textContent = String(state.energy);
    els.goalProgress.textContent = `목표 ${money(state.goal)} · ${Math.round(progress * 100)}%`;
    els.goalFill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }

  function renderNews() {
    const event = state.event;
    if (!event) return;
    els.newsCategory.textContent = event.category;
    els.newsDate.textContent = `S${state.season} · WEEK ${String(state.week).padStart(2, "0")}`;
    els.newsIcon.textContent = event.icon;
    els.newsTitle.textContent = event.title;
    els.newsDescription.textContent = event.description;
    els.analystNote.textContent = event.note;

    const themes = event.themes || [];
    els.newsTags.innerHTML = themes.map((theme) => `<span class="theme">${theme}</span>`).join("");
  }

  function riskDots(asset) {
    return Array.from({ length: 5 }, (_, index) => `<i class="${index < asset.risk ? "on" : ""}"></i>`).join("");
  }

  function liveCompanies() {
    return (state?.assets || []).filter(isSchoolListing);
  }

  function ensureLiveChartSelection() {
    const list = liveCompanies();
    if (!list.some((asset) => asset.id === selectedChartId)) {
      selectedChartId = list[0]?.id || "";
    }
    return list;
  }

  function sparkSvg(asset, w, h) {
    const values = ensureTicks(asset);
    const tone = tickToneClass(values);
    return `<svg class="asset-spark ${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${sparkPath(values, w, h)}"></path></svg>`;
  }

  function isDeskEditing() {
    const el = document.activeElement;
    if (!el || !el.tagName) return false;
    const tag = el.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
      return !!(el.closest && el.closest(".quantity"));
    }
    if (els.assetList?.contains(el)) return true;
    if (el.closest?.(".quantity, .trade-box, .found-form, .chat-form, .modal")) return true;
    return el.id === "chat-input" || el.id === "chat-room-name" || el.id === "borrow-amount";
  }

  function qtyFieldFocused() {
    return isDeskEditing();
  }

  function readQtyMap() {
    const map = {};
    els.assetList?.querySelectorAll(".asset-row").forEach((row) => {
      const input = row.querySelector(".quantity input");
      if (row.dataset.id && input) map[row.dataset.id] = input.value;
    });
    return map;
  }

  function assetRowMarkup(asset, qtyValue) {
    const holding = ensureHolding(state.holdings, asset.id);
    const forecast = forecastFor(asset);
    const maxBuy = Math.floor(state.cash / Math.max(1, quotePrice(asset)));
    const disabled = !state.active;
    const changeType = asset.lastChange > .0005 ? "up" : asset.lastChange < -.0005 ? "down" : "flat";
    const positionProfit = holding.qty > 0 ? (quotePrice(asset) - holding.avg) * holding.qty : 0;
    const flow = flowHint(asset);
    const founder = asset.playerCompany ? `<span class="founder-tag">${esc(asset.founderId === state.playerId ? "내 회사" : (asset.founderName || "창업"))} 상장</span>` : `<span class="core-tag">기본 종목</span>`;
    const adMark = asset.ad && asset.ad.week === state.week ? `<span class="ad-badge">AD ${esc(asset.ad.slogan)}</span>` : "";
    const adImage = safeImageUrl(asset.ad?.image);
    const adImg = asset.ad && asset.ad.week === state.week && adImage ? `<img class="ad-thumb" alt="" src="${esc(adImage)}">` : "";
    const ops = asset.playerCompany && asset.opsNote ? `<span class="ops-note">${esc(asset.opsNote)}</span>` : "";
    const qty = qtyValue == null || qtyValue === "" ? "1" : String(qtyValue);
    return `
      <article class="asset-row ${asset.playerCompany ? "is-player" : "is-core"}" data-id="${esc(asset.id)}" style="--asset-color:${safeColor(asset.color)}">
        <div class="asset-name">
          <span class="asset-symbol">${esc(asset.symbol)}</span>
          <strong>${esc(asset.name)}</strong>
          <small>${esc(asset.sector)}</small>
          ${founder}${adMark}${ops}${adImg}
          <span class="risk-dots" title="위험도 ${asset.risk}/5">${riskDots(asset)}</span>
        </div>
        <div class="asset-price">
          <strong class="asset-last">${money(quotePrice(asset))}</strong>
          ${sparkSvg(asset, SPARK_W, SPARK_H)}
          <span class="asset-change ${changeType}">${asset.lastChange === 0 ? "신규" : percent(asset.lastChange)} 지난 공개</span>
          <span class="flow-pill ${flow.type}">${flow.text}</span>
        </div>
        <div class="asset-forecast">
          <span class="forecast-pill ${forecast.type}">${forecast.text}</span>
          <button class="research-button" data-action="research" type="button" ${disabled || state.research <= 0 || state.analyzed.has(asset.id) ? "disabled" : ""}>
            ${state.analyzed.has(asset.id) ? "분석 완료" : "1P 정밀 분석"}
          </button>
        </div>
        <div class="trade-box">
          <div class="position-info">
            <span>보유 <b class="pos-qty">${holding.qty}주</b></span>
            <span class="pos-meta">${holding.qty ? `손익 <b>${signedMoney(positionProfit)}</b>` : `최대 ${maxBuy}주`}</span>
          </div>
          <div class="quantity">
            <button data-action="minus" type="button" ${disabled ? "disabled" : ""}>−</button>
            <input type="number" min="1" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" value="${esc(qty)}" aria-label="${esc(asset.name)} 거래 수량" ${disabled ? "disabled" : ""}>
            <button data-action="plus" type="button" ${disabled ? "disabled" : ""}>+</button>
          </div>
          <div class="trade-actions">
            <button data-action="buy" type="button" ${disabled ? "disabled" : ""} ${maxBuy < 1 ? `title="현금이 부족합니다"` : ""}>매수</button>
            <button class="sell" data-action="sell" type="button" ${disabled || holding.qty < 1 ? "disabled" : ""}>매도</button>
          </div>
        </div>
      </article>
    `;
  }

  function patchAssetRow(row, asset) {
    if (!row || !asset) return;
    const holding = ensureHolding(state.holdings, asset.id);
    const forecast = forecastFor(asset);
    const maxBuy = Math.floor(state.cash / Math.max(1, quotePrice(asset)));
    const disabled = !state.active;
    const changeType = asset.lastChange > .0005 ? "up" : asset.lastChange < -.0005 ? "down" : "flat";
    const positionProfit = holding.qty > 0 ? (quotePrice(asset) - holding.avg) * holding.qty : 0;
    const flow = flowHint(asset);
    const last = row.querySelector(".asset-last");
    if (last) last.textContent = money(quotePrice(asset));
    const change = row.querySelector(".asset-change");
    if (change) {
      change.className = `asset-change ${changeType}`;
      change.textContent = `${asset.lastChange === 0 ? "신규" : percent(asset.lastChange)} 지난 공개`;
    }
    const flowEl = row.querySelector(".flow-pill");
    if (flowEl) {
      flowEl.className = `flow-pill ${flow.type}`;
      flowEl.textContent = flow.text;
    }
    const forecastEl = row.querySelector(".forecast-pill");
    if (forecastEl) {
      forecastEl.className = `forecast-pill ${forecast.type}`;
      forecastEl.textContent = forecast.text;
    }
    const research = row.querySelector("[data-action='research']");
    if (research) {
      const done = state.analyzed.has(asset.id);
      research.disabled = disabled || state.research <= 0 || done;
      research.textContent = done ? "분석 완료" : "1P 정밀 분석";
    }
    const qtyEl = row.querySelector(".pos-qty");
    if (qtyEl) qtyEl.textContent = `${holding.qty}주`;
    const meta = row.querySelector(".pos-meta");
    if (meta) meta.innerHTML = holding.qty ? `손익 <b>${signedMoney(positionProfit)}</b>` : `최대 ${maxBuy}주`;
    row.querySelectorAll("[data-action='minus'], [data-action='plus']").forEach((button) => {
      button.disabled = disabled;
    });
    const input = row.querySelector(".quantity input");
    if (input) input.disabled = disabled;
    const buyBtn = row.querySelector("[data-action='buy']");
    if (buyBtn && buyBtn.getAttribute("aria-busy") !== "true") {
      buyBtn.disabled = disabled;
      buyBtn.textContent = "매수";
      if (maxBuy < 1) buyBtn.setAttribute("title", "현금이 부족합니다");
      else buyBtn.removeAttribute("title");
    }
    const sellBtn = row.querySelector("[data-action='sell']");
    if (sellBtn && sellBtn.getAttribute("aria-busy") !== "true") {
      sellBtn.disabled = disabled || holding.qty < 1;
      sellBtn.textContent = "매도";
    }
  }

  function patchAssetRows() {
    if (!els.assetList || !state?.assets) return false;
    const rows = [...els.assetList.querySelectorAll(".asset-row")];
    if (!rows.length) return false;
    const ids = state.assets.map((asset) => asset.id);
    const sameOrder = rows.length === ids.length && rows.every((row, index) => row.dataset.id === ids[index]);
    if (!sameOrder) return false;
    rows.forEach((row) => {
      const asset = assetById(row.dataset.id);
      if (asset) patchAssetRow(row, asset);
    });
    updateLiveCharts();
    return true;
  }

  function renderAssets() {
    ensureCoreListings();
    if (!els.assetList) return;
    if (patchAssetRows()) {
      if (!qtyFieldFocused()) renderLiveBoard();
      return;
    }
    if (qtyFieldFocused()) {
      const have = new Set([...els.assetList.querySelectorAll(".asset-row")].map((row) => row.dataset.id));
      state.assets.forEach((asset) => {
        if (have.has(asset.id)) {
          const row = [...els.assetList.querySelectorAll(".asset-row")].find((item) => item.dataset.id === asset.id);
          if (row) patchAssetRow(row, asset);
          return;
        }
        els.assetList.insertAdjacentHTML("beforeend", assetRowMarkup(asset, "1"));
      });
      updateLiveCharts();
      return;
    }
    const qtyMap = readQtyMap();
    els.assetList.innerHTML = state.assets.map((asset) => assetRowMarkup(asset, qtyMap[asset.id])).join("");
    renderLiveBoard();
    updateLiveCharts();
  }

  function selectChart(id) {
    const asset = state?.assets?.find((item) => item.id === id);
    if (!isSchoolListing(asset)) return;
    selectedChartId = id;
    if (els.liveChartPills) {
      els.liveChartPills.querySelectorAll("[data-chart-id]").forEach((pill) => {
        pill.classList.toggle("active", pill.dataset.chartId === id);
      });
    }
    updateLiveCharts();
  }

  function renderLiveEmpty() {
    if (els.liveChartPills) els.liveChartPills.innerHTML = "";
    if (els.liveChartTitle) els.liveChartTitle.textContent = "학교 기업 시세";
    if (els.liveChartMeta) els.liveChartMeta.textContent = "학생들이 만든 학교 회사만 보입니다. 아직 상장된 회사가 없습니다.";
    if (els.liveChartPrice) els.liveChartPrice.textContent = "";
    if (els.liveChartLine) els.liveChartLine.setAttribute("d", "");
    if (els.liveChartArea) els.liveChartArea.setAttribute("d", "");
  }

  function renderLiveBoard() {
    if (!els.liveChartPills || !state?.assets) return;
    const list = ensureLiveChartSelection();
    if (!list.length) {
      renderLiveEmpty();
      return;
    }
    els.liveChartPills.innerHTML = list.map((asset) => `
      <button type="button" data-chart-id="${esc(asset.id)}" class="${asset.id === selectedChartId ? "active" : ""}" style="--asset-color:${safeColor(asset.color)}">
        <b>${esc(asset.symbol)}</b>
        <span>${esc(asset.name)}</span>
      </button>
    `).join("");
  }

  function updateLiveCharts() {
    if (!state?.assets) return;
    liveCompanies().forEach((asset) => {
      const row = [...(els.assetList?.querySelectorAll(".asset-row") || [])].find((item) => item.dataset.id === asset.id);
      if (!row) return;
      const values = ensureTicks(asset);
      const tone = tickToneClass(values);
      const spark = row.querySelector(".asset-spark path");
      if (spark) spark.setAttribute("d", sparkPath(values, SPARK_W, SPARK_H));
      const svg = row.querySelector(".asset-spark");
      if (svg) svg.setAttribute("class", `asset-spark ${tone}`);
      const last = row.querySelector(".asset-last");
      if (last) last.textContent = money(quotePrice(asset));
    });
    const list = ensureLiveChartSelection();
    const asset = list.find((item) => item.id === selectedChartId) || list[0];
    if (!asset) {
      renderLiveEmpty();
      return;
    }
    const values = ensureTicks(asset);
    const tone = tickToneClass(values);
    if (els.liveChartLine) els.liveChartLine.setAttribute("d", sparkPath(values, LIVE_W, LIVE_H));
    if (els.liveChartArea) els.liveChartArea.setAttribute("d", sparkArea(values, LIVE_W, LIVE_H));
    if (els.liveChart) {
      els.liveChart.classList.remove("up", "down", "flat");
      els.liveChart.classList.add(tone);
      els.liveChart.style.setProperty("--live-color", asset.color);
    }
    if (els.liveChartTitle) els.liveChartTitle.textContent = `${asset.symbol} · ${asset.name}`;
    if (els.liveChartMeta) {
      const first = values[0] || asset.price;
      const last = values[values.length - 1] || asset.price;
      const change = first ? (last - first) / first : 0;
      els.liveChartMeta.textContent = `학교 기업 · ${asset.founderName || "창업"} · 최근 ${percent(change)}`;
    }
    if (els.liveChartPrice) {
      els.liveChartPrice.textContent = money(quotePrice(asset));
      els.liveChartPrice.className = tickToneClass(values);
    }
  }

  function renderPortfolio() {
    const total = totalAssets();
    const invested = holdingsValue();
    const ratio = total > 0 ? invested / total : 0;
    const held = state.assets.filter((asset) => ensureHolding(state.holdings, asset.id).qty > 0);
    els.holdingCount.textContent = `${held.length}개 자산`;
    els.investedRatio.textContent = `${Math.round(ratio * 100)}%`;

    let cursor = 0;
    const segments = [];
    const legend = [];
    held.forEach((asset) => {
      const value = quotePrice(asset) * state.holdings[asset.id].qty;
      const share = total > 0 ? value / total * 100 : 0;
      segments.push(`${safeColor(asset.color)} ${cursor}% ${cursor + share}%`);
      cursor += share;
      legend.push(`
        <div style="--color:${safeColor(asset.color)}">
          <i></i><span>${esc(asset.name)}</span><b>${Math.round(share)}%</b>
        </div>
      `);
    });
    segments.push(`#d9d7cf ${cursor}% 100%`);
    els.donut.style.background = `conic-gradient(${segments.join(",")})`;
    els.portfolioLegend.innerHTML = legend.length
      ? `${legend.join("")}<div style="--color:#d9d7cf"><i></i><span>현금</span><b>${Math.round((1 - ratio) * 100)}%</b></div>`
      : `<p class="portfolio-empty">아직 투자한 자산이 없습니다.<br>뉴스를 읽고 첫 주문을 내보세요.</p>`;

    let weightedRisk = 0;
    held.forEach((asset) => {
      weightedRisk += asset.risk * (quotePrice(asset) * state.holdings[asset.id].qty / Math.max(1, invested));
    });
    const riskPercent = invested > 0 ? weightedRisk / 5 * 100 * ratio : 0;
    const riskText = riskPercent > 70 ? "매우 높음" : riskPercent > 48 ? "높음" : riskPercent > 25 ? "보통" : "안전";
    const riskColor = riskPercent > 70 ? "var(--red)" : riskPercent > 48 ? "#ef8c3f" : "var(--green)";
    els.riskLabel.textContent = riskText;
    els.riskLabel.style.color = riskColor;
    els.riskFill.style.width = `${riskPercent}%`;
    els.riskFill.style.background = riskColor;
  }

  function missionComplete(id) {
    if (id === "diversify") return state.assets.filter((asset) => ensureHolding(state.holdings, asset.id).qty > 0).length >= 3;
    if (id === "profit") return returnRate() >= .25;
    if (id === "cash") return state.cashSafeWeeks >= 3;
    if (id === "research") return state.analyses >= 3;
    if (id === "labor") return state.laborIncome >= 80;
    if (id === "intel") return state.intelCount >= 4;
    return false;
  }

  function checkMissions() {
    MISSIONS.forEach((mission) => {
      if (!state.missions.has(mission.id) && missionComplete(mission.id)) {
        state.missions.add(mission.id);
        state.research += 1;
        toast("🎯", "미션 완료", `${mission.title} · 리서치 1P 획득`);
        tone(740, .12);
      }
    });
  }

  function renderMissions() {
    els.missionList.innerHTML = MISSIONS.map((mission) => {
      const done = state.missions.has(mission.id);
      let progress = mission.detail;
      if (mission.id === "cash") progress = `현금 30% 이상 마감 ${Math.min(3, state.cashSafeWeeks)} / 3주`;
      if (mission.id === "research") progress = `리서치 분석 ${Math.min(3, state.analyses)} / 3회`;
      if (mission.id === "labor") progress = `알바 수입 ${Math.min(80, Math.round(state.laborIncome))} / 80만원`;
      if (mission.id === "intel") progress = `정보 수집 ${Math.min(4, state.intelCount)} / 4회`;
      return `
        <li class="${done ? "done" : ""}">
          <span class="mission-check">${done ? "✓" : ""}</span>
          <div><b>${mission.title}</b><small>${progress}</small></div>
          <span class="mission-reward">${done ? "완료" : mission.reward}</span>
        </li>
      `;
    }).join("");
    els.missionCount.textContent = `${state.missions.size} / ${MISSIONS.length}`;
  }

  function unlockBadge(id) {
    if (state.badges.has(id)) return;
    const badge = BADGES.find((item) => item.id === id);
    state.badges.add(id);
    toast(badge.icon, "새 업적 획득", badge.title);
  }

  function checkBadges() {
    const heldCount = state.assets.filter((asset) => ensureHolding(state.holdings, asset.id).qty > 0).length;
    if (state.trades >= 1) unlockBadge("first");
    if (heldCount >= 4) unlockBadge("basket");
    if (state.profitableSales >= 1) unlockBadge("profitSell");
    if (state.trades >= 10) unlockBadge("active");
    if (returnRate() >= 1) unlockBadge("double");
    if (totalAssets() > 0 && state.cash / totalAssets() < .05) unlockBadge("allin");
    if (state.jobsCount >= 5) unlockBadge("worker");
    if (state.intelCount >= 5) unlockBadge("spy");
    if (state.playCount >= 4) unlockBadge("gamer");
  }

  function renderBadges() {
    els.badgeGrid.innerHTML = BADGES.map((badge) => `
      <div class="badge ${state.badges.has(badge.id) ? "unlocked" : ""}" title="${badge.title}">
        <i>${badge.icon}</i><b>${badge.title}</b>
      </div>
    `).join("");
    els.achievementCount.textContent = `${state.badges.size} / ${BADGES.length}`;
  }

  function renderLog() {
    if (!state.log.length) {
      els.tradeLog.innerHTML = `<li class="empty-log">아직 거래가 없습니다.</li>`;
      return;
    }
    els.tradeLog.innerHTML = state.log.map((item) => `
      <li>
        <time>W${String(item.week).padStart(2, "0")}</time>
        <span><b class="${item.type}">${item.type === "buy" ? "매수" : "매도"}</b> ${esc(item.name)} ${item.qty}주</span>
        <b>${money(item.total)}</b>
      </li>
    `).join("");
  }

  function quantityFrom(row) {
    const input = $("input", row);
    return Math.max(1, Math.floor(Number(input.value) || 1));
  }

  function setOrderBusy(id, side, busy) {
    const row = [...(els.assetList?.querySelectorAll(".asset-row") || [])].find((item) => item.dataset.id === id);
    const button = row?.querySelector(`[data-action="${side}"]`);
    if (!button) return;
    button.disabled = busy;
    button.setAttribute("aria-busy", busy ? "true" : "false");
    button.textContent = busy ? "주문 중…" : (side === "buy" ? "매수" : "매도");
  }

  async function buy(id, qty) {
    if (!state.active) {
      toast("⚠️", "주문 실패", "시장에 들어간 뒤 주문하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    setOrderBusy(id, "buy", true);
    try {
      const result = await executeSharedTrade(id, "buy", qty);
      if (result.ok) {
        toast("✅", "매수 완료", `${result.assetName} ${qty}주 · ${money(result.total)} · 보유 ${result.holdingQty}주`);
        return;
      }
      const message = result.err === "network"
        ? "공유 주문 서버가 응답하지 않았습니다. 잠시 후 다시 눌러 주세요."
        : result.err === "pending"
          ? "같은 종목의 이전 주문을 처리하고 있습니다."
          : result.err === "cash"
            ? "현금이 부족합니다. 수량을 줄여 주세요."
            : "시장 입장 상태와 주문 수량을 확인하세요.";
      toast("⚠️", "매수 실패", message);
      tone(130, .12, "sawtooth");
    } finally {
      setOrderBusy(id, "buy", false);
    }
  }

  async function sell(id, qty) {
    if (!state.active) {
      toast("⚠️", "주문 실패", "시장에 들어간 뒤 주문하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    setOrderBusy(id, "sell", true);
    try {
      const result = await executeSharedTrade(id, "sell", qty);
      if (result.ok) {
        toast("✅", "매도 완료", `${result.assetName} ${qty}주 · ${money(result.total)} · 보유 ${result.holdingQty}주`);
        return;
      }
      const message = result.err === "network"
        ? "공유 주문 서버가 응답하지 않았습니다. 잠시 후 다시 눌러 주세요."
        : result.err === "pending"
          ? "같은 종목의 이전 주문을 처리하고 있습니다."
          : "보유 수량을 확인하세요.";
      toast("⚠️", "매도 실패", message);
      tone(130, .12, "sawtooth");
    } finally {
      setOrderBusy(id, "sell", false);
    }
  }

  function recordTrade(type, asset, qty, total) {
    state.trades += 1;
    state.log.unshift({ week: state.week, type, name: asset.name, qty, total });
    state.log = state.log.slice(0, 30);
    tone(type === "buy" ? 480 : 330, .07, "square");
    checkBadges();
    checkMissions();
    syncLocalPlayer();
    renderAll();
  }

  function analyze(id) {
    if (!state.active || state.research < 1 || state.analyzed.has(id)) return;
    state.research -= 1;
    state.analyses += 1;
    state.analyzed.add(id);
    const asset = assetById(id);
    const info = setIntel(id, random() < .9, true);
    toast("🔎", "정밀 분석 완료", `${asset.name} · ${info.text} · 오차 있음`);
    tone(650, .1);
    checkMissions();
    renderAll();
  }

  function strongestAssets(count = 3) {
    return [...state.assets].sort((a, b) => Math.abs(state.expected[b.id] || 0) - Math.abs(state.expected[a.id] || 0)).slice(0, count);
  }

  function directionOf(value) {
    if (value > .012) return { word: "상승 기류", type: "up" };
    if (value < -.012) return { word: "약세 조짐", type: "down" };
    return { word: "혼조", type: "" };
  }

  function setIntel(assetId, truthful, precise) {
    const actual = state.changes[assetId] != null
      ? state.changes[assetId]
      : ((assetById(assetId)?.weekFlow || 0) / Math.max(40, assetById(assetId)?.float || 400)) * 0.4;
    const used = truthful ? actual : -actual * (.6 + random() * .5);
    const asset = assetById(assetId);
    if (precise) {
      const err = (random() * 2 - 1) * .03;
      const mid = used + err;
      const lo = mid - .02;
      const hi = mid + .02;
      const type = mid > .008 ? "up" : mid < -.008 ? "down" : "";
      state.intel[assetId] = { text: `예상 ${percent(lo)} ~ ${percent(hi)}`, type, name: asset.name };
    } else {
      const dir = directionOf(used);
      state.intel[assetId] = { text: dir.word, type: dir.type, name: asset.name };
    }
    return state.intel[assetId];
  }

  function pickIntelTarget() {
    const ranked = strongestAssets(4);
    return ranked[Math.floor(random() * Math.min(2, ranked.length))] || state.assets[0];
  }

  function grantIntel(spec, forcedAsset) {
    const truthful = random() < spec.accuracy;
    if (spec.scope === "sector") {
      const target = pickIntelTarget();
      const info = setIntel(target.id, truthful, false);
      toast(spec.icon || "📂", "업종 브리핑", `${target.sector.split(" · ")[0]} 쪽이 ${info.text}`);
      return info;
    }
    const target = forcedAsset || pickIntelTarget();
    const info = setIntel(target.id, truthful, spec.scope === "precise");
    toast(spec.icon || "🔎", "정보 입수", `${target.name} · ${info.text}`);
    return info;
  }

  function canAct() {
    return !!state?.active;
  }

  function spendEnergy(amount = 1) {
    if (state.energy < amount) {
      toast("⚠️", "에너지 부족", "이번 주 활동 횟수가 끝났습니다.");
      tone(130, .12, "sawtooth");
      return false;
    }
    state.energy -= amount;
    writeWallet();
    return true;
  }

  function payJob(job, score) {
    const passed = Number(score) >= ACTIVITY_PASS_SCORE;
    state.jobsDone.add(job.id);
    if (!passed) {
      toast(job.icon, "알바 실패", `${job.name} · 급여 0만원`);
      tone(180, .12, "sawtooth");
      renderAll();
      sendWallet();
      return 0;
    }
    const [minPay, maxPay] = job.pay;
    const reward = Math.round((minPay + (maxPay - minPay) * Math.max(0, Math.min(1, score))) * 10) / 10;
    state.cash += reward;
    state.laborIncome += reward;
    state.jobsCount += 1;
    toast(job.icon, "시드 입금", `${job.name} · ${money(reward)}`);
    tone(520, .1, "square");
    checkMissions();
    checkBadges();
    renderAll();
    sendWallet();
    return reward;
  }

  function renderActivities() {
    const busy = !canAct();
    els.jobsPanel.innerHTML = state.weekJobs.map((job) => {
      const done = state.jobsDone.has(job.id);
      const disabled = busy || done || state.energy < job.energy;
      return `
        <article class="job-card ${done ? "done" : ""}">
          <header><span class="job-icon">${job.icon}</span><div><b>${job.name}</b><small>에너지 ${job.energy}</small></div></header>
          <p>${job.copy}</p>
          <div class="job-meta"><span>시드 ${job.pay[0]}~${job.pay[1]}만원</span><em>${done ? "완료" : "노동"}</em></div>
          <button type="button" data-kind="job" data-id="${job.id}" ${disabled ? "disabled" : ""}>${done ? "오늘 퇴근" : "일하러 가기"}</button>
        </article>
      `;
    }).join("");

    els.intelPanel.innerHTML = INTEL.map((item) => {
      const done = state.intelDone.has(item.id);
      const disabled = busy || done || state.energy < item.energy || state.cash < item.cost;
      return `
        <article class="job-card ${done ? "done" : ""}">
          <header><span class="job-icon">${item.icon}</span><div><b>${item.name}</b><small>에너지 ${item.energy}</small></div></header>
          <p>${item.copy}</p>
          <div class="job-meta"><span>${item.cost ? `비용 ${item.cost}만원` : "무료"} · 신뢰 ${Math.round(item.accuracy * 100)}%</span><em>${done ? "입수함" : "정보"}</em></div>
          <button type="button" data-kind="intel" data-id="${item.id}" ${disabled ? "disabled" : ""}>${done ? "이미 들음" : "정보 얻기"}</button>
        </article>
      `;
    }).join("");

    els.playPanel.innerHTML = (state.weekPlays || PLAYS).map((item) => {
      const done = state.playDone.has(item.id);
      const disabled = busy || done || state.energy < item.energy;
      return `
        <article class="job-card ${done ? "done" : ""}">
          <header><span class="job-icon">${item.icon}</span><div><b>${item.name}</b><small>에너지 ${item.energy}</small></div></header>
          <p>${item.copy}</p>
          <div class="job-meta"><span>${item.reward === "cash" ? "용돈" : item.reward === "research" ? "리서치" : "힌트"}</span><em>${done ? "플레이함" : "미니게임"}</em></div>
          <button type="button" data-kind="play" data-id="${item.id}" ${disabled ? "disabled" : ""}>${done ? "이번 주 완료" : "플레이"}</button>
        </article>
      `;
    }).join("");
  }

  function startActivity(kind, id) {
    if (!canAct()) return;
    if (kind === "job") {
      const job = JOBS.find((item) => item.id === id);
      if (!job || state.jobsDone.has(id) || !spendEnergy(job.energy)) return;
      openMiniGame({ kind, id, game: job.game, title: job.name, copy: job.copy, pay: job.pay });
    } else if (kind === "intel") {
      const item = INTEL.find((entry) => entry.id === id);
      if (!item || state.intelDone.has(id)) return;
      if (item.cost > state.cash) {
        toast("⚠️", "현금 부족", "정보 비용을 먼저 벌어야 합니다.");
        return;
      }
      if (!spendEnergy(item.energy)) return;
      state.cash -= item.cost;
      state.intelDone.add(id);
      state.intelCount += 1;
      grantIntel(item);
      checkMissions();
      checkBadges();
      renderAll();
      sendWallet();
    } else if (kind === "play") {
      const item = PLAYS.find((entry) => entry.id === id);
      if (!item || state.playDone.has(id) || !spendEnergy(item.energy)) return;
      openMiniGame({ kind, id, game: item.game, title: item.name, copy: item.copy, reward: item.reward });
    }
  }

  function openMiniGame(spec) {
    state.currentPlay = spec;
    if (spec.game === "typing") renderTyping(spec);
    if (spec.game === "timing") renderTiming(spec);
    if (spec.game === "memory") renderMemory(spec);
    if (spec.game === "quiz") renderQuiz(spec);
    if (spec.game === "rumor") renderRumor(spec);
    if (spec.game === "math") renderMath(spec);
    if (spec.game === "sort") renderSort(spec);
    if (spec.game === "spot") renderSpot(spec);
    if (spec.game === "catch") renderCatch(spec);
    if (spec.game === "trace") renderTrace(spec);
    openModal(els.activityModal);
  }

  function finishMiniGame(score) {
    const spec = state.currentPlay;
    state.currentPlay = null;
    closeModal(els.activityModal);
    if (!spec) return;
    state.playCount += 1;
    if (spec.kind === "job") {
      const job = JOBS.find((item) => item.id === spec.id);
      payJob(job, score);
    } else {
      state.playDone.add(spec.id);
      if (spec.reward === "cash") {
        if (score >= ACTIVITY_PASS_SCORE) {
          const cash = Math.round((8 + score * 18) * 10) / 10;
          state.cash += cash;
          state.laborIncome += cash;
          toast("🎮", "용돈 획득", `${money(cash)}이 들어왔습니다.`);
        } else {
          toast("🎮", "미니게임 실패", "보상은 0만원입니다.");
        }
      } else if (spec.reward === "research") {
        if (score >= .7) {
          state.research += 1;
          toast("🧠", "리서치 +1P", "기억력이 정보를 열었습니다.");
        } else {
          toast("🧠", "아쉬운 기억", "포인트는 못 얻었지만 경험은 남았습니다.");
        }
      } else if (score >= .6) {
        grantIntel({ accuracy: .8 + score * .1, scope: score >= .85 ? "precise" : "one", icon: "🕵️" });
      } else {
        toast("❓", "힌트 실패", "정보를 열어내지 못했습니다.");
      }
      tone(score >= .6 ? 640 : 180, .12, score >= .6 ? "square" : "sawtooth");
      checkMissions();
      checkBadges();
      renderAll();
      sendWallet();
    }
    state.currentPlay = null;
  }

  function renderTyping(spec) {
    const line = TYPING_LINES[Math.floor(random() * TYPING_LINES.length)];
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <div class="play-prompt">${line}</div>
      <input class="play-input" id="type-input" type="text" autocomplete="off" placeholder="그대로 입력">
      <p class="play-score" id="play-timer">10초</p>
      <div class="play-actions"><button class="cta-button" id="type-submit" type="button">제출 <span>→</span></button></div>
    `;
    const input = $("#type-input");
    let left = 10;
    const timer = setInterval(() => {
      left -= 1;
      const label = $("#play-timer");
      if (label) label.textContent = `${left}초`;
      if (left <= 0) {
        clearInterval(timer);
        submit();
      }
    }, 1000);
    function submit() {
      clearInterval(timer);
      const typed = (input?.value || "").trim();
      let hit = 0;
      const max = Math.max(line.length, typed.length) || 1;
      for (let i = 0; i < Math.min(line.length, typed.length); i += 1) {
        if (line[i] === typed[i]) hit += 1;
      }
      const score = hit / max;
      finishMiniGame(score);
    }
    $("#type-submit").addEventListener("click", submit);
    input?.focus();
  }

  function renderTiming(spec) {
    let round = 0;
    let total = 0;
    function roundView() {
      els.playStage.innerHTML = `
        <span class="overline">MINI GAME</span>
        <h2 id="play-title">${spec.title}</h2>
        <p class="play-copy">${spec.copy} (${round + 1}/3)</p>
        <div class="timing-track"><i class="timing-zone"></i><i class="timing-needle" id="needle"></i></div>
        <div class="play-actions"><button class="cta-button" id="timing-hit" type="button">지금! <span>→</span></button></div>
      `;
      $("#timing-hit").addEventListener("click", () => {
        const track = $(".timing-track");
        const needle = $("#needle");
        const zone = $(".timing-zone");
        needle.style.animationPlayState = "paused";
        const n = needle.getBoundingClientRect();
        const z = zone.getBoundingClientRect();
        const mid = n.left + n.width / 2;
        const hit = mid >= z.left && mid <= z.right;
        const dist = Math.abs(mid - (z.left + z.width / 2)) / Math.max(1, track.getBoundingClientRect().width);
        total += hit ? Math.max(.45, 1 - dist * 2.2) : Math.max(0, .35 - dist);
        round += 1;
        if (round >= 3) finishMiniGame(total / 3);
        else roundView();
      });
    }
    roundView();
  }

  function renderMemory(spec) {
    const pool = ["🔵", "🔴", "🟡", "🟢", "🟣", "🟠", "⚪", "⬛"];
    const seq = Array.from({ length: 5 }, () => pool[Math.floor(random() * pool.length)]);
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <p class="play-score" id="memory-status">순서를 기억하세요</p>
      <div class="memory-grid" id="memory-grid">${pool.map((icon, index) => `<button class="memory-cell" data-i="${index}" type="button">${icon}</button>`).join("")}</div>
    `;
    const cells = $$(".memory-cell");
    let showing = true;
    let step = 0;
    let pick = [];
    async function flash() {
      for (const icon of seq) {
        const cell = cells[pool.indexOf(icon)];
        cell.classList.add("lit");
        await new Promise((resolve) => setTimeout(resolve, 420));
        cell.classList.remove("lit");
        await new Promise((resolve) => setTimeout(resolve, 160));
      }
      showing = false;
      $("#memory-status").textContent = "같은 순서로 누르세요";
    }
    flash();
    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        if (showing) return;
        const icon = pool[Number(cell.dataset.i)];
        pick.push(icon);
        cell.classList.add("picked");
        setTimeout(() => cell.classList.remove("picked"), 180);
        if (pick[pick.length - 1] !== seq[pick.length - 1]) {
          finishMiniGame(pick.filter((item, index) => item === seq[index]).length / seq.length);
      return;
    }
        if (pick.length === seq.length) finishMiniGame(1);
        step += 1;
      });
    });
  }

  function renderMath(spec) {
    const kind = Math.floor(random() * 3);
    let question;
    let answer;
    if (kind === 0) {
      const a = 20 + Math.floor(random() * 80);
      const b = 10 + Math.floor(random() * 40);
      question = `${a} + ${b} = ?`;
      answer = a + b;
    } else if (kind === 1) {
      const a = 50 + Math.floor(random() * 80);
      const b = 8 + Math.floor(random() * 30);
      question = `${a} − ${b} = ?`;
      answer = a - b;
    } else {
      const base = [80, 100, 120, 160, 200][Math.floor(random() * 5)];
      const pct = [5, 10, 15, 20, 25][Math.floor(random() * 5)];
      question = `${base}의 ${pct}%는?`;
      answer = Math.round((base * pct) / 100);
    }
    const opts = new Set([answer]);
    while (opts.size < 4) {
      const delta = (Math.floor(random() * 17) - 8) || 6;
      opts.add(answer + delta);
    }
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <p class="play-prompt">${question}</p>
      <div class="quiz-options">${shuffled([...opts]).map((value) => `<button type="button" data-v="${value}">${value}</button>`).join("")}</div>
    `;
    $$(".quiz-options button", els.playStage).forEach((button) => {
      button.addEventListener("click", () => {
        finishMiniGame(Number(button.dataset.v) === answer ? 1 : 0.12);
      });
    });
  }

  function renderSort(spec) {
    const nums = [];
    while (nums.length < 5) {
      const n = 10 + Math.floor(random() * 90);
      if (!nums.includes(n)) nums.push(n);
    }
    const order = [...nums].sort((a, b) => a - b);
    const picked = [];
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <p class="play-score" id="sort-status">작은 수부터 누르세요</p>
      <div class="play-chip-row" id="sort-row">${shuffled(nums).map((n) => `<button type="button" class="play-chip" data-n="${n}">${n}</button>`).join("")}</div>
    `;
    $$(".play-chip", els.playStage).forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        const n = Number(button.dataset.n);
        if (n !== order[picked.length]) {
          finishMiniGame(picked.length / order.length);
          return;
        }
        picked.push(n);
        button.disabled = true;
        button.classList.add("is-on");
        if (picked.length === order.length) finishMiniGame(1);
        else $("#sort-status").textContent = `다음: ${order[picked.length]} 근처`;
      });
    });
  }

  function renderSpot(spec) {
    const pairs = [["O", "0"], ["I", "l"], ["8", "B"], ["ㅡ", "—"], ["6", "9"]];
    const pair = pairs[Math.floor(random() * pairs.length)];
    const common = pair[0];
    const odd = pair[1];
    const cellCount = 20;
    const oddAt = Math.floor(random() * cellCount);
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <div class="spot-grid">${Array.from({ length: cellCount }, (_, i) => `<button type="button" class="spot-cell" data-odd="${i === oddAt ? "1" : "0"}">${i === oddAt ? odd : common}</button>`).join("")}</div>
    `;
    $$(".spot-cell", els.playStage).forEach((button) => {
      button.addEventListener("click", () => {
        finishMiniGame(button.dataset.odd === "1" ? 1 : 0.1);
      });
    });
  }

  function renderCatch(spec) {
    let round = 0;
    let hits = 0;
    function roundView() {
      const ok = Math.floor(random() * 4);
      els.playStage.innerHTML = `
        <span class="overline">MINI GAME</span>
        <h2 id="play-title">${spec.title}</h2>
        <p class="play-copy">${spec.copy} (${round + 1}/3)</p>
        <div class="catch-row">${Array.from({ length: 4 }, (_, i) => `<button type="button" class="catch-btn ${i === ok ? "is-ok" : ""}" data-ok="${i === ok ? "1" : "0"}">${i === ok ? "GO" : "—"}</button>`).join("")}</div>
        <p class="play-score" id="catch-timer">1.0초</p>
      `;
      let done = false;
      const timer = setTimeout(() => finishRound(false), 1000);
      function finishRound(hit) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (hit) hits += 1;
        round += 1;
        if (round >= 3) finishMiniGame(hits / 3);
        else roundView();
      }
      $$(".catch-btn", els.playStage).forEach((button) => {
        button.addEventListener("click", () => {
          if (done) return;
          finishRound(button.dataset.ok === "1");
        });
      });
    }
    roundView();
  }

  function renderTrace(spec) {
    const count = 7;
    const slots = shuffled(Array.from({ length: 9 }, (_, i) => i));
    const map = {};
    for (let n = 1; n <= count; n += 1) map[slots[n - 1]] = n;
    let expect = 1;
    let ok = 0;
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <div class="trace-grid">${Array.from({ length: 9 }, (_, i) => {
        const n = map[i];
        return n ? `<button type="button" class="trace-cell" data-n="${n}">${n}</button>` : `<span class="trace-empty"></span>`;
      }).join("")}</div>
    `;
    $$(".trace-cell", els.playStage).forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        const n = Number(button.dataset.n);
        if (n !== expect) {
          finishMiniGame(ok / count);
          return;
        }
        button.disabled = true;
        button.classList.add("is-on");
        ok += 1;
        expect += 1;
        if (expect > count) finishMiniGame(1);
      });
    });
  }

  const quizSeen = new Set();
  const rumorSeen = new Set();

  function pickUnused(bank, seen) {
    if (seen.size >= bank.length) seen.clear();
    const pool = bank.filter((item) => !seen.has(item));
    const item = pool[Math.floor(random() * pool.length)];
    seen.add(item);
    return item;
  }

  function bindQuizChoice(onScore) {
    const buttons = $$(".quiz-options button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        if (buttons.some((item) => item.disabled)) return;
        buttons.forEach((item) => { item.disabled = true; });
        const ok = button.dataset.ok === "1";
        button.classList.add(ok ? "correct" : "wrong");
        if (!ok) {
          const right = buttons.find((item) => item.dataset.ok === "1");
          if (right) right.classList.add("correct");
        }
        setTimeout(() => onScore(ok), 450);
      });
    });
  }

  function renderQuiz(spec) {
    const quiz = pickUnused(QUIZ_BANK, quizSeen);
    const options = shuffled(quiz.a.map((choice, index) => ({ choice, ok: index === quiz.ok })));
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">중간~고급 경제·금융 문항입니다. 하나만 고르세요.</p>
      <p class="play-prompt">${quiz.q}</p>
      <div class="quiz-options">${options.map((item) => `<button type="button" data-ok="${item.ok ? "1" : "0"}">${item.choice}</button>`).join("")}</div>
    `;
    bindQuizChoice((ok) => finishMiniGame(ok ? 1 : 0));
  }

  function renderRumor(spec) {
    const item = pickUnused(RUMOR_BANK, rumorSeen);
    const choices = shuffled([
      { label: "팩트 — 타당한 경제·금융 서술입니다", ok: item.fact },
      { label: "루머 — 사실과 다르거나 과장된 주장입니다", ok: !item.fact },
    ]);
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">시장에서 도는 주장입니다. 지식으로 진위를 가르세요.</p>
      <p class="play-prompt">${item.claim}</p>
      <div class="quiz-options">${choices.map((choice) => `<button type="button" data-ok="${choice.ok ? "1" : "0"}">${choice.label}</button>`).join("")}</div>
    `;
    bindQuizChoice((ok) => finishMiniGame(ok ? 1 : .15));
  }

  async function closeMarket() {
    if (!state.active) return;
    if (!kstClock.ok) useDeviceKst();
    if (!kstClock.ok || !kstClock.parts) {
      toast("⏰", "시각 없음", "지금은 정산할 수 없습니다.");
      return;
    }
    const key = lastEndedPeriodId(kstClock.parts);
    if ((worldSync.appliedPeriodId || "") >= key && !coresLookUnsettled()) {
      toast("⏳", "이미 정산됨", "이번 교시 기본 종목 정산은 이미 반영됐습니다. 다음 수업 종료를 기다리세요.");
      return;
    }
    const claimed = await claimSettlement(key);
    if (!claimed) {
      await pullWorld();
      toast("⏳", "정산 진행 중", "다른 접속자가 이번 교시를 정산하고 있습니다. 잠시 후 자동 반영됩니다.");
      return;
    }
    await settlePeriod(key, { manual: true, force: coresLookUnsettled(), claimed: true });
  }

  function showWeekResult(weekProfit, total, dividend) {
    els.weekResultLabel.textContent = `S${state.season} · WEEK ${String(state.week).padStart(2, "0")} CLOSED`;
    if (els.weekResultTitle) {
      els.weekResultTitle.textContent = state.week >= MAX_WEEKS ? `시즌 ${state.season} 기본 종목 정산` : "기본 종목 정산 · 이번 교시 주가 공개";
    }
    els.weekSummary.textContent = dividend > 0
      ? `시장 변동과 함께 ${money(dividend)}의 분기 배당이 반영되었습니다.`
      : "뉴스·수급·광고가 가격에 반영되었습니다. 매수세는 다음 주를 보장하지 않습니다.";
    els.weekResults.innerHTML = state.assets.map((asset) => {
      const type = asset.lastChange > 0 ? "up" : asset.lastChange < 0 ? "down" : "";
      const extra = asset.playerCompany && asset.opsNote ? `<small>${esc(asset.opsNote)}</small>` : "";
      return `
        <div class="week-result-item" style="--color:${safeColor(asset.color)}">
          <i>${esc(asset.symbol)}</i>
          <div><span>${esc(asset.name)}</span><b class="${type}">${percent(asset.lastChange)}</b>${extra}</div>
        </div>
      `;
    }).join("");
    els.weekProfit.textContent = signedMoney(weekProfit);
    els.weekProfit.style.color = weekProfit >= 0 ? "var(--red)" : "var(--green)";
    els.weekTotal.textContent = money(total);
    state.seasonBreak = state.week >= MAX_WEEKS;
    state.terminal = false;
    els.nextWeek.innerHTML = state.seasonBreak ? `다음 시즌 투자 <span>→</span>` : `계속 투자하기 <span>→</span>`;
    openModal(els.weekModal);
    tone(weekProfit >= 0 ? 620 : 170, .14, weekProfit >= 0 ? "square" : "sawtooth");
  }

  function startNextSeason() {
    saveBest(returnRate());
    state.season += 1;
    state.week = 1;
    state.seasonBreak = false;
    state.eventDeck = shuffled(EVENTS).slice(0, MAX_WEEKS);
    state.goal = Math.round(state.goal * 1.12);
    toast("🌅", `시즌 ${state.season} 개장`, "현금·보유·회사는 그대로입니다. 목표만 조금 높아졌습니다.");
    prepareWeek();
    els.game.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextWeek() {
    closeModal(els.weekModal);
    state.locked = false;
    state.seasonBreak = false;
    renderAll();
    els.game.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function rankFor(rate) {
    if (rate >= 1.3) return "S";
    if (rate >= .75) return "A";
    if (rate >= .35) return "B";
    if (rate >= 0) return "C";
    return "D";
  }

  function finishGame() {
    writeWallet();
    state.active = false;
    state.locked = true;
    const total = totalAssets();
    const rate = returnRate();
    const success = total >= state.goal;
    const rank = rankFor(rate);
    els.endRank.textContent = rank;
    els.endRank.style.background = success ? "var(--red)" : "var(--green)";
    els.endLabel.textContent = success ? "TARGET ACHIEVED" : "12-WEEK REPORT";
    els.endTitle.textContent = success ? "목표 달성!" : "시장은 만만치 않았다";
    els.endDescription.textContent = success
      ? "뉴스와 숫자를 읽은 선택이 결과를 만들었습니다."
      : "목표에는 못 미쳤지만 다음 투자에는 경험이 남습니다.";
    els.endAssets.textContent = money(total);
    els.endReturn.textContent = percent(rate);
    els.endReturn.style.color = rate >= 0 ? "var(--red)" : "var(--green)";
    els.endMissions.textContent = `${state.missions.size} / ${MISSIONS.length}`;
    els.endBadges.textContent = `${state.badges.size} / ${BADGES.length}`;
    els.endLabor.textContent = money(state.laborIncome);
    saveBest(rate);
    openModal(els.endModal);
    if (success) {
      tone(520, .12, "square");
      setTimeout(() => tone(660, .12, "square"), 110);
      setTimeout(() => tone(880, .2, "square"), 220);
    }
  }

  function revealDesk() {
    els.game.hidden = false;
    els.game.classList.remove("is-locked");
    if (els.marketNav) els.marketNav.hidden = false;
    document.body.classList.add("in-play");
    if (els.hero) els.hero.hidden = true;
    maybeShowDeskPromo();
  }

  function readDeskPromoSeen() {
    try {
      return JSON.parse(localStorage.getItem(PROMO_DESK_STORE) || "{}") || {};
    } catch {
      return {};
    }
  }

  function markDeskPromoSeen(id) {
    if (!id) return;
    try {
      const all = readDeskPromoSeen();
      all[id] = Date.now();
      localStorage.setItem(PROMO_DESK_STORE, JSON.stringify(all));
    } catch { /* quota */ }
  }

  function hasSeenDeskPromo(id) {
    return !!(id && readDeskPromoSeen()[id]);
  }

  function closeDeskPromo() {
    const id = session?.id || state?.playerId;
    markDeskPromoSeen(id);
    closeModal(els.promoDeskModal);
  }

  function maybeShowDeskPromo() {
    if (isServerStopped()) return;
    if (!state?.active) return;
    const id = session?.id || state?.playerId;
    if (!id || hasSeenDeskPromo(id)) return;
    if (!els.promoDeskModal || !els.promoDeskModal.hidden) return;
    requestAnimationFrame(() => {
      if (!state?.active || hasSeenDeskPromo(id)) return;
      openModal(els.promoDeskModal);
    });
  }

  function bootRun() {
    destroyNet();
    clearBotTimers();
    worldSync.inMarket = false;
    worldSync.appliedPeriodId = "";
    worldSync.settling = false;
    state = createState(selectedMode, false);
    state.playerId = session.id;
    state.playerName = session.nick;
    applyWallet(readWallet(session.id));
    ensureTradableCash();
    syncLocalPlayer();
    renderStartCta();
  }

  function fillLobby() {
    const nick = session?.nick || "투자자";
    if (els.lobbyUser) {
      els.lobbyUser.textContent = `${nick} 님, 투자 시작을 눌렀습니다. 아직 거래는 시작되지 않았습니다.`;
    }
    if (els.lobbyStatus) {
      els.lobbyStatus.textContent = "시장 입장을 눌러야 거래 창이 열리고 사고팔 수 있습니다.";
    }
    renderClock();
  }

  function renderStartCta() {
    if (!els.openSetup) return;
    if (worldSync.inMarket && state?.active) {
      els.openSetup.innerHTML = `거래 창으로 <span>↗</span>`;
    } else {
      els.openSetup.innerHTML = `투자 시작하기 <span>↗</span>`;
    }
  }

  function openSetupFlow() {
    if (isServerStopped()) {
      showHaltedScreen();
      return;
    }
    if (worldSync.inMarket && state?.active) {
      closeModal(els.setupModal);
      closeModal(els.lobbyModal);
      revealDesk();
      els.game.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!requireSession()) return;
    startGame();
  }

  function startGame() {
    if (isServerStopped()) {
      showHaltedScreen();
      return;
    }
    if (!requireSession()) return;
    closeModal(els.setupModal);
    closeModal(els.lobbyModal);
    bootRun();
    enterGlobalMarket();
  }

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      const primary = modal === els.lobbyModal
        ? els.lobbyEnter
        : modal === els.setupModal
          ? els.start
          : $("button:not(.modal-x)", modal) || $("button", modal);
      primary?.focus();
    });
  }

  function allModals() {
    return [els.setupModal, els.weekModal, els.endModal, els.activityModal, els.authModal, els.lobbyModal, els.foundModal, els.closeModal, els.lendModal, els.borrowModal, els.adModal, els.gambleModal, els.lotteryModal, els.promoDeskModal].filter(Boolean);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (allModals().every((item) => item.hidden)) {
      document.body.classList.remove("modal-open");
    }
  }

  function toast(icon, title, copy) {
    if (!els.toastStack) return;
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<i>${icon}</i><b>${title}</b><p>${copy}</p>`;
    els.toastStack.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  }

  function tone(frequency, duration, type = "sine") {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      soundOn = false;
    }
  }

  function readBest() {
    try {
      return Number(localStorage.getItem("bull-lab-best") || 0);
    } catch {
      return 0;
    }
  }

  function saveBest(rate) {
    const best = Math.max(readBest(), rate);
    try {
      localStorage.setItem("bull-lab-best", String(best));
    } catch {
      // Storage is optional.
    }
    renderBest(best);
  }

  function renderBest(rate = readBest()) {
    els.bestRecord.textContent = percent(rate);
  }

  els.openSetup?.addEventListener("click", openSetupFlow);
  els.restart?.addEventListener("click", () => {
    if (!requireSession()) return;
    startGame();
  });
  els.playAgain?.addEventListener("click", () => {
    closeModal(els.endModal);
    if (!requireSession()) return;
    startGame();
  });
  if (els.continueSeason) {
    els.continueSeason.addEventListener("click", () => {
      closeModal(els.endModal);
      state.active = true;
      startNextSeason();
    });
  }
  els.difficulties.forEach((button) => {
    button.addEventListener("click", () => {
      selectedMode = button.dataset.mode;
      els.difficulties.forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  els.start?.addEventListener("click", startGame);
  $$("[data-close='setup']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.setupModal));
  });
  $$("[data-close='auth']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.authModal));
  });
  $$("[data-close='lobby']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.lobbyModal));
  });
  $$("[data-close='found']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.foundModal));
  });
  $$("[data-close='close']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.closeModal));
  });
  $$("[data-close='lend']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.lendModal));
  });
  $$("[data-close='borrow']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.borrowModal));
  });
  $$("[data-close='ad']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.adModal));
  });
  $$("[data-close='gamble']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.gambleModal));
  });
  $$("[data-close='lottery']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.lotteryModal));
  });
  $$("[data-close='promo-desk']").forEach((button) => {
    button.addEventListener("click", () => closeDeskPromo());
  });
  els.promoOpenGamble?.addEventListener("click", () => {
    closeDeskPromo();
    openGambleModal();
  });
  els.promoOpenLottery?.addEventListener("click", () => {
    closeDeskPromo();
    openLotteryModal();
  });
  els.lotteryBuy?.addEventListener("click", buyLotteryTicket);
  els.lotteryForce?.addEventListener("click", forceLotteryDraw);
  els.gambleCreateForm?.addEventListener("submit", createGambleTable);
  els.gambleModal?.addEventListener("click", onGambleClick);
  els.nextWeek?.addEventListener("click", nextWeek);
  els.closeMarket?.addEventListener("click", closeMarket);
  els.clearLog?.addEventListener("click", () => {
    state.log = [];
    renderLog();
  });
  els.sound?.addEventListener("click", () => {
    soundOn = !soundOn;
    els.sound.classList.toggle("muted", !soundOn);
    els.sound.textContent = soundOn ? "◖))" : "×";
    els.sound.setAttribute("aria-label", soundOn ? "효과음 끄기" : "효과음 켜기");
    if (soundOn) tone(520, .07);
  });
  els.accountButton?.addEventListener("click", () => {
    if (session) logout();
    else {
      authNext = null;
      setAuthMode("login");
      openModal(els.authModal);
    }
  });
  $$(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => setAuthMode(tab.dataset.auth));
  });
  els.authForm?.addEventListener("submit", (event) => {
    if (els.authSubmit.disabled) {
      event.preventDefault();
      return;
    }
    els.authSubmit.disabled = true;
    submitAuth(event)
      .catch(() => showAuthError("인증에 실패했습니다."))
      .finally(() => { els.authSubmit.disabled = false; });
  });
  els.lobbyEnter?.addEventListener("click", () => {
    enterGlobalMarket();
  });
  els.foundButton?.addEventListener("click", openFoundModal);
  els.closeButton?.addEventListener("click", openCloseModal);
  els.closeConfirm?.addEventListener("click", submitCloseCompany);
  els.lendButton?.addEventListener("click", openLendModal);
  els.gambleButton?.addEventListener("click", openGambleModal);
  els.lotteryButton?.addEventListener("click", openLotteryModal);
  els.adButton?.addEventListener("click", openAdModal);
  els.foundForm?.addEventListener("submit", submitFound);
  els.lendForm?.addEventListener("submit", submitLend);
  els.borrowForm?.addEventListener("submit", submitBorrow);
  els.adForm?.addEventListener("submit", submitAd);
  els.foundSymbol?.addEventListener("input", () => {
    els.foundSymbol.value = els.foundSymbol.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  });
  if (els.adImage) {
    els.adImage.addEventListener("change", () => {
      const file = els.adImage.files?.[0];
      if (!file) {
        pendingAdImage = "";
        return;
      }
      compressAdImage(file).then((data) => {
        pendingAdImage = data;
      }).catch(() => {
        pendingAdImage = "";
        toast("🖼️", "이미지 실패", "다른 사진을 골라 보세요. 글만으로도 광고할 수 있습니다.");
      });
    });
  }
  if (els.chatCreateForm) {
    els.chatCreateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state?.active) return;
      if (!createChatRoom(els.chatRoomName.value)) {
        toast("💬", "방 이름", "방 이름은 2자 이상으로 적어 주세요.");
        return;
      }
      els.chatRoomName.value = "";
      toast("💬", "채팅방", "새 방이 열렸습니다. 같은 시장의 누구나 볼 수 있습니다.");
    });
  }
  if (els.chatRoomSelect) {
    els.chatRoomSelect.addEventListener("change", () => {
      activeChatRoomId = els.chatRoomSelect.value;
      renderChat();
    });
  }
  if (els.chatForm) {
    els.chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state?.active) return;
      if (!activeChatRoomId) {
        toast("💬", "방 없음", "먼저 채팅방을 만들거나 고르세요.");
        return;
      }
      if (sendChat(els.chatInput.value)) els.chatInput.value = "";
    });
  }

  document.querySelectorAll(".activity-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".activity-tab").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".activity-panel-list").forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.panel !== tab.dataset.tab);
      });
    });
  });
  [els.jobsPanel, els.intelPanel, els.playPanel].forEach((panel) => {
    panel.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-kind]");
      if (!button) return;
      startActivity(button.dataset.kind, button.dataset.id);
    });
  });
  document.querySelectorAll("[data-close='activity']").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.currentPlay) finishMiniGame(0.12);
      else closeModal(els.activityModal);
    });
  });

  els.lendList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lend-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.lendAction;
    const id = button.dataset.id;
    if (action === "borrow" || action === "repay" || action === "fund" || action === "withdraw") {
      openBorrowDesk(action, id);
    }
  });

  els.assetList.addEventListener("click", (event) => {
    const row = event.target.closest(".asset-row");
    if (!row) return;
    if (row.dataset.id) selectChart(row.dataset.id);
    const button = event.target.closest("button");
    if (!button) return;
    const action = button.dataset.action;
    const input = $("input", row);
    let qty = quantityFrom(row);
    if (action === "minus") input.value = Math.max(1, qty - 1);
    if (action === "plus") input.value = qty + 1;
    if (action === "buy") buy(row.dataset.id, qty);
    if (action === "sell") sell(row.dataset.id, qty);
    if (action === "research") analyze(row.dataset.id);
  });
  if (els.liveChartPills) {
    els.liveChartPills.addEventListener("click", (event) => {
      const pill = event.target.closest("[data-chart-id]");
      if (pill) selectChart(pill.dataset.chartId);
    });
  }

  window.addEventListener("beforeunload", () => {
    if (state?.active) writeWallet();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.setupModal.hidden) closeModal(els.setupModal);
    if (event.key === "Escape" && !els.authModal.hidden) closeModal(els.authModal);
    if (event.key === "Escape" && !els.lobbyModal.hidden) closeModal(els.lobbyModal);
    if (event.key === "Escape" && !els.foundModal.hidden) closeModal(els.foundModal);
    if (event.key === "Escape" && !els.closeModal?.hidden) closeModal(els.closeModal);
    if (event.key === "Escape" && !els.lendModal?.hidden) closeModal(els.lendModal);
    if (event.key === "Escape" && !els.borrowModal?.hidden) closeModal(els.borrowModal);
    if (event.key === "Escape" && !els.adModal.hidden) closeModal(els.adModal);
    if (event.key === "Escape" && !els.gambleModal?.hidden) closeModal(els.gambleModal);
    if (event.key === "Escape" && !els.lotteryModal?.hidden) closeModal(els.lotteryModal);
    if (event.key === "Escape" && !els.promoDeskModal?.hidden) closeDeskPromo();
    if (event.key === "Escape" && !els.activityModal.hidden) {
      if (state.currentPlay) finishMiniGame(0.12);
      else closeModal(els.activityModal);
    }
    if ((event.key === "Enter" || event.key === " ") && !els.weekModal.hidden) {
      event.preventDefault();
      nextWeek();
    }
  });

  session = readSession();
  renderAccount();
  fillFoundSectors();
  state = createState("rookie", false);
  hideDesk();
  renderStartCta();
  try {
    prepareWeek();
    renderBest();
  } catch (err) {
    console.error(err);
  }
  refreshKst().then(() => renderClock()).catch(() => {});
  fetchBans().then(() => loadPublicRanking());
  fetchHalt();
  subscribeHalt();
  fetchClimate();
  subscribeClimate();
  subscribeGamble();
  subscribeLottery();
  if (staffTestRequested()) {
    hideHaltedScreen();
    toast("🛠️", "스태프 테스트", "서버는 정지된 채로, 이 창만 정지를 무시합니다.");
  } else if (haltPreviewRequested()) {
    applyHalt({ stopped: true });
  }
})();
