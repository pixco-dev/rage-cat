(() => {
  "use strict";

  const MAX_WEEKS = 12;
  const AUTH_STORE = "bull-lab-accounts-v1";
  const SESSION_STORE = "bull-lab-session-v1";
  const WALLET_STORE = "bull-lab-wallets-v1";
  const AD_COST = 18;
  const MIN_SEED = 80;
  // JSONBlob PUT-create only accepts IDs it can parse: ObjectId, snowflake, or UUID v1.
  const WORLD_BLOB_ID = "b011ab00-7a6e-11ab-8c00-00b011ab0001";
  const WORLD_CREATE_URL = "https://jsonblob.com/api/jsonBlob";
  const WORLD_URL_STORE = "bull-lab-world-url-v1";
  const WORLD_HEADERS = { "Content-Type": "application/json", Accept: "application/json" };
  const FETCH_MS = 6000;
  const POLL_MS = 2500;
  const KST_POLL_MS = 45000;
  const CHAT_CAP = 50;
  const PUT_DEBOUNCE_MS = 450;
  const TICK_MS = 1000;
  const TICK_CAP = 96;
  const LIVE_W = 640;
  const LIVE_H = 180;
  const SPARK_W = 120;
  const SPARK_H = 36;

  const PERIODS = [
    { n: 1, h: 9, m: 20, label: "1교시" },
    { n: 2, h: 10, m: 20, label: "2교시" },
    { n: 3, h: 11, m: 20, label: "3교시" },
    { n: 4, h: 12, m: 20, label: "4교시" },
    { n: 5, h: 14, m: 0, label: "5교시" },
    { n: 6, h: 15, m: 0, label: "6교시" },
    { n: 7, h: 16, m: 0, label: "7교시" },
  ];

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
    adButton: $("#ad-button"),
    foundModal: $("#found-modal"),
    foundForm: $("#found-form"),
    foundName: $("#found-name"),
    foundSymbol: $("#found-symbol"),
    foundSector: $("#found-sector"),
    foundSeed: $("#found-seed"),
    foundError: $("#found-error"),
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
  let activeChatRoomId = "";
  let selectedChartId = "";
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
    touched: new Set(),
    chatRooms: [],
    seenPlayers: [],
    eventDeck: [],
    eventKey: 0,
    botsSpawned: false,
    online: false,
    lastToastAt: 0,
    worldUrl: "",
    entering: false,
    inMarket: false,
    appliedPeriodId: "",
    settling: false,
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

  function defaultWorldUrl() {
    return `https://jsonblob.com/api/jsonBlob/${WORLD_BLOB_ID}`;
  }

  function activeWorldUrl() {
    if (worldSync.worldUrl) return worldSync.worldUrl;
    try {
      const saved = localStorage.getItem(WORLD_URL_STORE);
      if (saved) worldSync.worldUrl = saved;
    } catch {
      /* ignore */
    }
    return worldSync.worldUrl || defaultWorldUrl();
  }

  function rememberWorldUrl(url) {
    if (!url) return;
    worldSync.worldUrl = url;
    try { localStorage.setItem(WORLD_URL_STORE, url); } catch { /* ignore */ }
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
    syncLocalPlayer();
    return [...(state.players || [])]
      .filter((player) => player && !player.bot && !String(player.id || "").startsWith("bot-"))
      .map((player) => ({ ...player, total: playerTotal(player) }))
      .sort((a, b) => (b.total || 0) - (a.total || 0));
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
    };
  }

  function mergePlayers(remotePlayers) {
    const byId = new Map((state.players || []).map((item) => [item.id, item]));
    (remotePlayers || []).forEach((row) => {
      if (!row?.id || row.bot || String(row.id).startsWith("bot-")) return;
      if (row.id === state.playerId) return;
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
    if (!selectedChartId || !state.assets.some((asset) => asset.id === selectedChartId)) {
      selectedChartId = state.assets[0]?.id || "";
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
        ? "이미 계좌가 있으면 로그인하세요. 처음이면 회원가입에서 투자 계좌가 만들어집니다."
        : "회원가입하면 투자 계좌가 개설됩니다. 아이디는 시장에서 투자자 이름과 창업자 명의로 쓰입니다.";
    }
    els.authNickWrap.hidden = mode === "login";
    els.authPass.autocomplete = mode === "login" ? "current-password" : "new-password";
    els.authError.hidden = true;
  }

  function showAuthError(message) {
    els.authError.hidden = false;
    els.authError.textContent = message;
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
      const hashed = await hashPassword(password);
      accounts[id] = { id, nick, salt: hashed.salt, hash: hashed.hash, created: Date.now() };
      writeAccounts(accounts);
      writeSession({ id, nick });
      seedNewWallet(id);
    } else {
      const row = accounts[id];
      if (!row) {
        showAuthError("계정을 찾을 수 없습니다. 회원가입을 먼저 하세요.");
        return;
      }
      const hashed = await hashPassword(password, row.salt);
      if (hashed.hash !== row.hash) {
        showAuthError("비밀번호가 맞지 않습니다.");
        return;
      }
      writeSession({ id, nick: row.nick || id });
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
      return sum + asset.price * qty;
    }, 0);
  }

  function playerTotal(player) {
    if (!player) return 0;
    if (player.id === state.playerId) return totalAssets();
    return (player.cash || 0) + holdingsValueOf(player.holdings);
  }

  function syncLocalPlayer() {
    if (!state) return;
    const existing = state.players.find((item) => item.id === state.playerId);
    const snapshot = {
      id: state.playerId,
      name: state.playerName,
      cash: state.cash,
      holdings: cloneHoldings(state.holdings),
      founded: state.founded,
      total: totalAssets(),
      bot: false,
      updatedAt: Date.now(),
    };
    if (existing) Object.assign(existing, snapshot);
    else state.players.unshift(snapshot);
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
        laborIncome: state.laborIncome,
        initialCash: state.initialCash,
        modeKey: state.modeKey,
        research: state.research,
        missions: [...state.missions],
        badges: [...state.badges],
        trades: state.trades,
        analyses: state.analyses,
        jobsCount: state.jobsCount,
        intelCount: state.intelCount,
        playCount: state.playCount,
        profitableSales: state.profitableSales,
        cashSafeWeeks: state.cashSafeWeeks,
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
    if (Number.isFinite(row.laborIncome)) state.laborIncome = row.laborIncome;
    if (Number.isFinite(row.initialCash)) state.initialCash = row.initialCash;
    if (Number.isFinite(row.research)) state.research = row.research;
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

  function applyFlow(asset, signedQty) {
    const float = Math.max(40, asset.float || 400);
    const k = asset.playerCompany ? 0.85 : 0.3;
    const impact = Math.max(-0.1, Math.min(0.1, (signedQty / float) * k));
    asset.price = Math.max(5, round1(asset.price * (1 + impact)));
    asset.weekFlow = (asset.weekFlow || 0) + signedQty;
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
    const noise = (asset.noise || 0.01) * (asset.playerCompany ? 0.4 : 1);
    const wiggle = flow * 0.01 + unit * noise * 0.055;
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
    state.assets.forEach((asset) => pushTick(asset));
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
    const flow = asset.weekFlow || asset.lastFlow || 0;
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
    const holding = ensureHolding(actor.holdings, assetId);
    if (side === "buy") {
      const cost = asset.price * qty;
      if (cost > actor.cash + 1e-9) return { ok: false, err: "cash" };
      holding.avg = (holding.avg * holding.qty + cost) / (holding.qty + qty);
      holding.qty += qty;
      actor.cash = round1(actor.cash - cost);
      applyFlow(asset, qty);
      if (actor.isLocal && !options.silent) recordTrade("buy", asset, qty, cost);
    } else {
      if (qty > holding.qty) return { ok: false, err: "qty" };
      const proceeds = asset.price * qty;
      if (actor.isLocal && asset.price > holding.avg) state.profitableSales += 1;
      holding.qty -= qty;
      actor.cash = round1(actor.cash + proceeds);
      if (holding.qty === 0) holding.avg = 0;
      applyFlow(asset, -qty);
      if (actor.isLocal && !options.silent) recordTrade("sell", asset, qty, proceeds);
    }
    syncLocalPlayer();
    if (state.active) markTouched(assetId);
    return { ok: true };
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
    const spend = Math.max(MIN_SEED, Math.min(owner.cash, Math.round(Number(seed) || MIN_SEED)));
    if (spend > owner.cash) return { ok: false, err: "cash" };
    const price = Math.max(28, Math.min(76, round1(spend / 2.1)));
    const founderQty = Math.max(8, Math.floor(spend / price));
    const cost = round1(founderQty * price);
    if (cost > owner.cash) return { ok: false, err: "cash" };
    const id = `co-${ownerId}`;
    if (state.assets.some((asset) => asset.id === id)) return { ok: false, err: "once" };
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

  function rollCompanyOps(asset) {
    const shock = (random() * 2 - 1) * 0.07 + 0.022;
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
      image: image || "",
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

  function botTick() {}

  function stopWorldSync() {
    if (worldSync.pollTimer) clearInterval(worldSync.pollTimer);
    if (worldSync.clockTimer) clearInterval(worldSync.clockTimer);
    if (worldSync.kstTimer) clearInterval(worldSync.kstTimer);
    if (worldSync.chartTimer) clearInterval(worldSync.chartTimer);
    if (worldSync.putTimer) clearTimeout(worldSync.putTimer);
    worldSync.pollTimer = null;
    worldSync.clockTimer = null;
    worldSync.kstTimer = null;
    worldSync.chartTimer = null;
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
    return periodId(previousSchoolYmd(parts.ymd), 7);
  }

  function nextPeriodAfter(id) {
    const parsed = parsePeriodId(id);
    if (!parsed) return periodId(parseKstParts(kstNowMs()).ymd, 1);
    if (parsed.n < 7) return periodId(parsed.ymd, parsed.n + 1);
    return periodId(nextSchoolYmd(parsed.ymd), 1);
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
      ad: asset.ad,
      opsNote: asset.opsNote,
      opsShock: asset.opsShock || 0,
    };
  }

  function hydrateAsset(row) {
    return {
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
    };
  }

  function mergeChatRooms(remoteRooms) {
    const byId = new Map((worldSync.chatRooms || []).map((room) => [room.id, room]));
    (remoteRooms || []).forEach((room) => {
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
      local.messages = [...msgs.values()].sort((a, b) => String(a.ts).localeCompare(String(b.ts))).slice(-CHAT_CAP);
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

    const byId = new Map(state.assets.map((asset) => [asset.id, asset]));
    (remote.assets || []).forEach((row) => {
      if (!row?.id) return;
      if (row.bot || String(row.founderId || "").startsWith("bot-") || String(row.id || "").startsWith("co-bot")) return;
      const local = byId.get(row.id);
      if (!local) {
        const added = hydrateAsset(row);
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
    purgeBots();
    ensureCoreListings();

    state.assets.forEach((asset) => ensureHolding(state.holdings, asset.id));
    if (state.assets.some((asset) => asset.founderId === state.playerId)) {
      const mine = state.assets.find((asset) => asset.founderId === state.playerId);
      state.founded = state.founded || { assetId: mine.id, name: mine.name, symbol: mine.symbol, sectorKey: mine.sectorKey, seed: 0 };
    }
    const settled = !preferLocal && prevSettled && worldSync.lastSettledPeriodId && worldSync.lastSettledPeriodId !== prevSettled;
    return { settled, weekChanged };
  }

  function slimWorldPayload(payload) {
    const stripAd = (ad) => (ad ? { ...ad, image: "" } : ad);
    return {
      ...payload,
      ads: (payload.ads || []).map((ad) => ({ ...ad, image: "" })),
      assets: (payload.assets || []).map((asset) => ({ ...asset, ad: stripAd(asset.ad) })),
    };
  }

  async function fetchWorld() {
    const url = activeWorldUrl();
    const res = await fetchWithTimeout(url, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("world-get");
    const data = await res.json();
    writeLocalWorld(data);
    rememberWorldUrl(url);
    return data;
  }

  function blobUrlFromResponse(res) {
    const headerId = res.headers.get("X-jsonblob") || res.headers.get("X-jsonblob-id");
    const loc = res.headers.get("Location") || "";
    const id = headerId || loc.split("/").filter(Boolean).pop();
    return id ? `https://jsonblob.com/api/jsonBlob/${id}` : "";
  }

  async function putWorld(payload) {
    writeLocalWorld(payload);
    let body = JSON.stringify(payload);
    if (body.length > 90000) body = JSON.stringify(slimWorldPayload(payload));
    const headers = WORLD_HEADERS;
    let url = activeWorldUrl();
    let res = await fetchWithTimeout(url, { method: "PUT", headers, body });
    if (res.status === 404 || res.status === 405) {
      res = await fetchWithTimeout(WORLD_CREATE_URL, { method: "POST", headers, body });
      const created = blobUrlFromResponse(res);
      if (created) {
        rememberWorldUrl(created);
        url = created;
        const seeded = await fetchWithTimeout(defaultWorldUrl(), { method: "PUT", headers, body });
        if (seeded.ok || seeded.status === 201) {
          rememberWorldUrl(defaultWorldUrl());
          url = defaultWorldUrl();
          res = seeded;
        }
      }
    }
    if (res.status === 413) {
      body = JSON.stringify(slimWorldPayload(payload));
      res = await fetchWithTimeout(url, { method: "PUT", headers, body });
    }
    if (!res.ok && res.status !== 201) throw new Error("world-put");
    worldSync.revision = payload.revision;
    worldSync.updatedAt = payload.updatedAt;
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
    toast("📡", "동기화 지연", "공유 시장에 잠시 닿지 못했습니다. 곧 다시 시도합니다.");
  }

  async function pushWorld() {
    if (worldSync.putting || !state?.active) return;
    worldSync.putting = true;
    try {
      let remote = null;
      try { remote = await fetchWorld(); } catch { remote = null; }
      if (remote) mergeWorld(remote, { preferLocal: true });
      const payload = buildWorldPayload();
      await putWorld(payload);
      renderSyncStatus();
    } catch {
      noteWorldError();
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
    if (!state?.active || worldSync.putting) return;
    try {
      const remote = await fetchWorld();
      if (!remote) {
        queuePush();
        return;
      }
      worldSync.online = true;
      renderSyncStatus();
      if ((remote.revision || 0) < worldSync.revision) return;
      const before = totalAssets();
      const result = mergeWorld(remote, { preferLocal: false });
      if (result.weekChanged) {
        computeWeekExpectations();
        resetLocalWeek();
      }
      if (result.settled) {
        showWeekResult(totalAssets() - before, totalAssets(), 0);
      }
      renderAll();
    } catch {
      // poll again later
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
      let extra = asset.playerCompany ? (asset.opsShock || 0) + newsChange : newsChange;
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
    useDeviceKst();
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
    await pushWorld();
    renderAll();
    return true;
  }

  async function maybeSettleFromClock() {
    if (!worldSync.inMarket || !state?.active || worldSync.settling) return;
    useDeviceKst();
    kstClock.parts = parseKstParts(kstNowMs());
    const ended = lastEndedPeriodId(kstClock.parts);
    const marker = worldSync.appliedPeriodId || worldSync.lastSettledPeriodId || "";
    const caughtUp = marker >= ended && !coresLookUnsettled();
    if (caughtUp) return;
    worldSync.settling = true;
    try {
      await settlePeriod(ended, { force: coresLookUnsettled() || marker < ended });
    } finally {
      worldSync.settling = false;
    }
  }

  function renderSyncStatus() {
    if (!els.playerCount) return;
    const n = worldSync.seenPlayers?.length || state?.players?.filter((item) => !item.bot).length || 0;
    const sync = worldSync.online ? "공유됨" : "연결 중";
    els.playerCount.textContent = n ? `접속 ${n}명 · ${sync}` : sync;
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
    await maybeSettleFromClock();
    if (state?.active) renderRoom();
  }

  function startWorldLoop() {
    stopWorldSync();
    worldSync.pollTimer = setInterval(pullWorld, POLL_MS);
    worldSync.clockTimer = setInterval(() => { tickClock(); }, 1000);
    worldSync.kstTimer = setInterval(() => { refreshKst().then(() => tickClock()); }, KST_POLL_MS);
    worldSync.chartTimer = setInterval(() => {
      if (!state?.active) return;
      sampleLiveTicks();
      updateLiveCharts();
    }, TICK_MS);
    window.addEventListener("focus", onWorldFocus);
  }

  function onWorldFocus() {
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
      useDeviceKst();
      if (!state || state.active) bootRun();
      state.playerId = session.id;
      state.playerName = session.nick;
      applyWallet(readWallet(session.id));
      const local = readLocalWorld();
      if (local) {
        try { mergeWorld(local, { preferLocal: false }); } catch { /* ignore bad cache */ }
      }
      try { restoreAccountWealth(local); } catch { ensureTradableCash(); }
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
      toast("📈", "시장 입장", "거래가 시작됐습니다. 한빛테크와 학생 회사 모두 지금 사고팔 수 있습니다.");
      closeModal(els.lobbyModal);
      closeModal(els.setupModal);
      await maybeSettleFromClock();
      refreshKst().catch(() => useDeviceKst());
      fetchWorld().then((fetched) => {
        if (!fetched || !state?.active) return;
        worldSync.online = true;
        mergeWorld(fetched, { preferLocal: true });
        restoreAccountWealth(fetched);
        ensureCoreListings();
        ensureTradableCash();
        renderAll();
        maybeSettleFromClock();
      }).catch(() => {});
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
        const max = 400;
        let w = img.width;
        let h = img.height;
        if (w > max || h > max) {
          const scale = max / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        let quality = 0.6;
        let data = canvas.toDataURL("image/jpeg", quality);
        while (data.length > 80000 && quality > 0.28) {
          quality -= 0.1;
          data = canvas.toDataURL("image/jpeg", quality);
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
        ? rooms.map((room) => `<option value="${room.id}" ${room.id === activeChatRoomId ? "selected" : ""}>${room.name}</option>`).join("")
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
        <b>${msg.authorName || "익명"}</b>
        <span>${msg.text}</span>
        <time>${msg.ts || ""}</time>
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
      messages: [],
    };
    worldSync.chatRooms = worldSync.chatRooms || [];
    worldSync.chatRooms.push(room);
    activeChatRoomId = room.id;
    queuePush();
    renderChat();
    return true;
  }

  function sendChat(text) {
    const body = String(text || "").trim().slice(0, 80);
    if (!body || !activeChatRoomId) return false;
    const room = (worldSync.chatRooms || []).find((item) => item.id === activeChatRoomId);
    if (!room) return false;
    room.messages = room.messages || [];
    room.messages.push({
      id: makeId("msg"),
      authorId: state.playerId,
      authorName: state.playerName,
      text: body,
      ts: kstClock.ok ? kstStamp() : "",
    });
    room.messages = room.messages.slice(-CHAT_CAP);
    queuePush();
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
    if (!state.active) return;
    if (state.founded) {
      toast("🏢", "이미 설립함", "회사는 계정당 한 곳만 상장할 수 있습니다.");
      return;
    }
    els.foundError.hidden = true;
    els.foundName.value = "";
    els.foundSymbol.value = "";
    els.foundSeed.value = String(Math.min(120, Math.max(MIN_SEED, Math.round(state.cash * 0.18))));
    fillFoundSectors();
    openModal(els.foundModal);
  }

  function openAdModal() {
    if (!state.active) return;
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
        once: "이미 회사를 보유하고 있습니다.",
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
    const top = humansRanked().slice(0, 5);
    const rows = top.map((player, index) => {
      const me = player.id === state.playerId;
      const firm = player.founded?.symbol || "";
      return `
        <li class="${me ? "is-me" : ""}">
          <span class="rank-n">${index + 1}</span>
          <b>${esc(player.name || player.id)}${me ? `<span class="me-tag">나</span>` : ""}</b>
          <small>${firm ? `${esc(firm)} · ` : ""}${money(player.total || 0)}</small>
        </li>`;
    }).join("");
    if (els.rankStrip) {
      els.rankStrip.innerHTML = top.map((player, index) => {
        const me = player.id === state.playerId;
        return `<li><b>${index + 1} ${esc(player.name || player.id)}${me ? `<span class="me-tag">나</span>` : ""}</b><small>${money(player.total || 0)}</small></li>`;
      }).join("");
    }
    if (els.rankList) {
      els.rankList.innerHTML = top.length ? rows : `<li class="empty-log">시장에 입장하면 순위가 집계됩니다.</li>`;
    }
  }

  function renderRoom() {
    if (els.roomCodeLabel) els.roomCodeLabel.textContent = state.active ? "거래 중 · 전 세계 단일 시장" : "입장 전";
    renderRanking();
    renderClock();
    const closed = !state.active;
    if (els.closeMarket) els.closeMarket.disabled = !state.active;
    if (els.foundButton) els.foundButton.disabled = closed || !!state.founded;
    if (els.adButton) els.adButton.disabled = closed || !state.founded || state.adDone;
    renderChat();
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
      const img = asset.ad.image ? `<img class="ad-thumb" alt="" src="${asset.ad.image}">` : "";
      return `
      <li>
        <span class="ad-sym">${asset.symbol} · ${AD_CLAIMS[asset.ad.claim] || ""}</span>
        <b>${asset.ad.slogan}</b>
        <small>${asset.founderName || "창업자"} 집행 · 사실 여부는 미확인</small>
        ${img}
      </li>
    `;
    }).join("");
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
      resetLocalWeek();
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
    return state.cash + state.assets.reduce((sum, asset) => {
      const holding = ensureHolding(state.holdings, asset.id);
      return sum + asset.price * holding.qty;
    }, 0);
  }

  function holdingsValue() {
    return totalAssets() - state.cash;
  }

  function returnRate() {
    return (totalAssets() - state.initialCash) / state.initialCash;
  }

  function prepareWeek() {
    state.event = state.eventDeck[state.week - 1] || shuffled(EVENTS)[0];
    state.expected = {};
    state.changes = {};
    resetLocalWeek();
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
    renderSummary();
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
    renderChat();
    if (els.closeMarket) els.closeMarket.disabled = !state.active;
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

  function sparkSvg(asset, w, h) {
    const values = ensureTicks(asset);
    const tone = tickToneClass(values);
    return `<svg class="asset-spark ${tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${sparkPath(values, w, h)}"></path></svg>`;
  }

  function selectChart(id) {
    if (!id || !state?.assets?.some((asset) => asset.id === id)) return;
    selectedChartId = id;
    if (els.liveChartPills) {
      els.liveChartPills.querySelectorAll("[data-chart-id]").forEach((pill) => {
        pill.classList.toggle("active", pill.dataset.chartId === id);
      });
    }
    updateLiveCharts();
  }

  function renderLiveBoard() {
    if (!els.liveChartPills || !state?.assets) return;
    ensureCoreListings();
    if (!selectedChartId) selectedChartId = state.assets[0]?.id || "";
    els.liveChartPills.innerHTML = state.assets.map((asset) => `
      <button type="button" data-chart-id="${asset.id}" class="${asset.id === selectedChartId ? "active" : ""}" style="--asset-color:${asset.color}">
        <b>${asset.symbol}</b>
        <span>${asset.name}</span>
      </button>
    `).join("");
  }

  function updateLiveCharts() {
    if (!state?.assets) return;
    state.assets.forEach((asset) => {
      const row = els.assetList?.querySelector(`[data-id="${asset.id}"]`);
      if (!row) return;
      const values = ensureTicks(asset);
      const tone = tickToneClass(values);
      const spark = row.querySelector(".asset-spark path");
      if (spark) spark.setAttribute("d", sparkPath(values, SPARK_W, SPARK_H));
      const svg = row.querySelector(".asset-spark");
      if (svg) svg.className = `asset-spark ${tone}`;
      const last = row.querySelector(".asset-last");
      if (last) last.textContent = money(asset.price);
    });
    const asset = state.assets.find((item) => item.id === selectedChartId) || state.assets[0];
    if (!asset) return;
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
      els.liveChartMeta.textContent = asset.playerCompany
        ? `학생 회사 · 최근 ${percent(change)}`
        : `기본 종목 · 최근 ${percent(change)}`;
    }
    if (els.liveChartPrice) {
      els.liveChartPrice.textContent = money(asset.price);
      els.liveChartPrice.className = tickToneClass(values);
    }
  }

  function renderAssets() {
    ensureCoreListings();
    els.assetList.innerHTML = state.assets.map((asset) => {
      const holding = ensureHolding(state.holdings, asset.id);
      const forecast = forecastFor(asset);
      const maxBuy = Math.floor(state.cash / asset.price);
      const disabled = !state.active;
      const changeType = asset.lastChange > .0005 ? "up" : asset.lastChange < -.0005 ? "down" : "flat";
      const positionProfit = holding.qty > 0 ? (asset.price - holding.avg) * holding.qty : 0;
      const flow = flowHint(asset);
      const founder = asset.playerCompany ? `<span class="founder-tag">${asset.founderId === state.playerId ? "내 회사" : (asset.founderName || "창업")} 상장</span>` : `<span class="core-tag">기본 종목</span>`;
      const adMark = asset.ad && asset.ad.week === state.week ? `<span class="ad-badge">AD ${asset.ad.slogan}</span>` : "";
      const adImg = asset.ad && asset.ad.week === state.week && asset.ad.image ? `<img class="ad-thumb" alt="" src="${asset.ad.image}">` : "";
      const ops = asset.playerCompany && asset.opsNote ? `<span class="ops-note">${asset.opsNote}</span>` : "";

      return `
        <article class="asset-row ${asset.playerCompany ? "is-player" : "is-core"}" data-id="${asset.id}" style="--asset-color:${asset.color}">
          <div class="asset-name">
            <span class="asset-symbol">${asset.symbol}</span>
            <strong>${asset.name}</strong>
            <small>${asset.sector}</small>
            ${founder}${adMark}${ops}${adImg}
            <span class="risk-dots" title="위험도 ${asset.risk}/5">${riskDots(asset)}</span>
          </div>
          <div class="asset-price">
            <strong class="asset-last">${money(asset.price)}</strong>
            ${sparkSvg(asset, SPARK_W, SPARK_H)}
            <span class="${changeType}">${asset.lastChange === 0 ? "신규" : percent(asset.lastChange)} 지난 공개</span>
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
              <span>보유 <b>${holding.qty}주</b></span>
              <span>${holding.qty ? `손익 <b>${signedMoney(positionProfit)}</b>` : `최대 ${maxBuy}주`}</span>
            </div>
            <div class="quantity">
              <button data-action="minus" type="button" ${disabled ? "disabled" : ""}>−</button>
              <input type="number" min="1" value="1" aria-label="${asset.name} 거래 수량" ${disabled ? "disabled" : ""}>
              <button data-action="plus" type="button" ${disabled ? "disabled" : ""}>+</button>
            </div>
            <div class="trade-actions">
              <button data-action="buy" type="button" ${disabled || maxBuy < 1 ? "disabled" : ""}>매수</button>
              <button class="sell" data-action="sell" type="button" ${disabled || holding.qty < 1 ? "disabled" : ""}>매도</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
    renderLiveBoard();
    updateLiveCharts();
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
      const value = asset.price * state.holdings[asset.id].qty;
      const share = total > 0 ? value / total * 100 : 0;
      segments.push(`${asset.color} ${cursor}% ${cursor + share}%`);
      cursor += share;
      legend.push(`
        <div style="--color:${asset.color}">
          <i></i><span>${asset.name}</span><b>${Math.round(share)}%</b>
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
      weightedRisk += asset.risk * (asset.price * state.holdings[asset.id].qty / Math.max(1, invested));
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
        <span><b class="${item.type}">${item.type === "buy" ? "매수" : "매도"}</b> ${item.name} ${item.qty}주</span>
        <b>${money(item.total)}</b>
      </li>
    `).join("");
  }

  function quantityFrom(row) {
    const input = $("input", row);
    return Math.max(1, Math.floor(Number(input.value) || 1));
  }

  function buy(id, qty) {
    if (!state.active) {
      toast("⚠️", "주문 실패", "시장에 들어간 뒤 주문하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    const result = executeTrade(state.playerId, id, "buy", qty);
    if (!result.ok) {
      toast("⚠️", "주문 실패", "보유 현금과 주문 수량을 확인하세요.");
      tone(130, .12, "sawtooth");
    }
  }

  function sell(id, qty) {
    if (!state.active) {
      toast("⚠️", "주문 실패", "시장에 들어간 뒤 주문하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    const result = executeTrade(state.playerId, id, "sell", qty);
    if (!result.ok) {
      toast("⚠️", "주문 실패", "보유 수량을 확인하세요.");
      tone(130, .12, "sawtooth");
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
    return true;
  }

  function payJob(job, score) {
    const [minPay, maxPay] = job.pay;
    const reward = Math.round((minPay + (maxPay - minPay) * Math.max(0, Math.min(1, score))) * 10) / 10;
    state.cash += reward;
    state.laborIncome += reward;
    state.jobsCount += 1;
    state.jobsDone.add(job.id);
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
        const cash = Math.round((8 + score * 18) * 10) / 10;
        state.cash += cash;
        state.laborIncome += cash;
        toast("🎮", "용돈 획득", `${money(cash)}이 들어왔습니다.`);
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
      <p class="play-score" id="play-timer">12초</p>
      <div class="play-actions"><button class="cta-button" id="type-submit" type="button">제출 <span>→</span></button></div>
    `;
    const input = $("#type-input");
    let left = 12;
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
    const seq = Array.from({ length: 4 }, () => pool[Math.floor(random() * pool.length)]);
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
    while (nums.length < 4) {
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
    const oddAt = Math.floor(random() * 16);
    els.playStage.innerHTML = `
      <span class="overline">MINI GAME</span>
      <h2 id="play-title">${spec.title}</h2>
      <p class="play-copy">${spec.copy}</p>
      <div class="spot-grid">${Array.from({ length: 16 }, (_, i) => `<button type="button" class="spot-cell" data-odd="${i === oddAt ? "1" : "0"}">${i === oddAt ? odd : common}</button>`).join("")}</div>
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
        <p class="play-score" id="catch-timer">1.2초</p>
      `;
      let done = false;
      const timer = setTimeout(() => finishRound(false), 1200);
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
    const count = 6;
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
    useDeviceKst();
    if (!kstClock.ok || !kstClock.parts) {
      toast("⏰", "시각 없음", "지금은 정산할 수 없습니다.");
      return;
    }
    const key = lastEndedPeriodId(kstClock.parts);
    if ((worldSync.appliedPeriodId || "") >= key && !coresLookUnsettled()) {
      toast("⏳", "이미 정산됨", "이번 교시 기본 종목 정산은 이미 반영됐습니다. 다음 수업 종료를 기다리세요.");
      return;
    }
    await settlePeriod(key, { manual: true, force: coresLookUnsettled() });
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
      const extra = asset.playerCompany && asset.opsNote ? `<small>${asset.opsNote}</small>` : "";
      return `
        <div class="week-result-item" style="--color:${asset.color}">
          <i>${asset.symbol}</i>
          <div><span>${asset.name}</span><b class="${type}">${percent(asset.lastChange)}</b>${extra}</div>
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
    return [els.setupModal, els.weekModal, els.endModal, els.activityModal, els.authModal, els.lobbyModal, els.foundModal, els.adModal].filter(Boolean);
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
  $$("[data-close='ad']").forEach((button) => {
    button.addEventListener("click", () => closeModal(els.adModal));
  });
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
    submitAuth(event).catch(() => showAuthError("인증에 실패했습니다."));
  });
  els.lobbyEnter?.addEventListener("click", () => {
    enterGlobalMarket();
  });
  els.foundButton?.addEventListener("click", openFoundModal);
  els.adButton?.addEventListener("click", openAdModal);
  els.foundForm?.addEventListener("submit", submitFound);
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
    if (event.key === "Escape" && !els.adModal.hidden) closeModal(els.adModal);
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
})();
