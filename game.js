(() => {
  "use strict";

  const MAX_WEEKS = 12;
  const PEER_PREFIX = "bullab-";
  const AUTH_STORE = "bull-lab-accounts-v1";
  const SESSION_STORE = "bull-lab-session-v1";
  const AD_COST = 18;
  const MIN_SEED = 80;
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const MODES = {
    rookie: { name: "연습생 모드", cash: 800, goal: 1800, research: 2, energy: 4 },
    trader: { name: "트레이더 모드", cash: 650, goal: 1800, research: 2, energy: 3 },
    wolf: { name: "여의도 늑대", cash: 450, goal: 2000, research: 1, energy: 3 },
  };

  const ASSET_BLUEPRINTS = [
    { id: "tech", symbol: "KTX", name: "한빛테크", sector: "기술 · 반도체", sectorKey: "tech", price: 82, trend: .008, noise: .018, risk: 3, color: "#4b79e8", dividend: 0, float: 420 },
    { id: "bio", symbol: "BIO", name: "새봄바이오", sector: "제약 · 헬스케어", sectorKey: "bio", price: 54, trend: .004, noise: .024, risk: 4, color: "#1f9d6a", dividend: 0, float: 360 },
    { id: "energy", symbol: "NRG", name: "태양에너지", sector: "에너지 · 인프라", sectorKey: "energy", price: 71, trend: .003, noise: .016, risk: 3, color: "#ef8c3f", dividend: .01, float: 400 },
    { id: "retail", symbol: "RTL", name: "모두리테일", sector: "소비재 · 유통", sectorKey: "retail", price: 39, trend: .002, noise: .012, risk: 2, color: "#8267d9", dividend: .008, float: 480 },
    { id: "gold", symbol: "GLD", name: "금 현물 ETF", sector: "안전자산 · 원자재", sectorKey: "gold", price: 96, trend: .001, noise: .008, risk: 1, color: "#d6a52d", dividend: 0, float: 520 },
    { id: "coin", symbol: "LBC", name: "럭키비트", sector: "가상자산 · 고위험", sectorKey: "coin", price: 24, trend: 0, noise: .038, risk: 5, color: "#ef5b6f", dividend: 0, float: 300 },
  ];

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

  const BOT_INVESTORS = [
    { id: "bot-kim", name: "김봇서" },
    { id: "bot-lee", name: "이봇윤" },
    { id: "bot-park", name: "박봇준" },
    { id: "bot-choi", name: "최봇하" },
    { id: "bot-jung", name: "정봇우" },
    { id: "bot-han", name: "한봇별" },
  ];

  const BOT_FIRMS = [
    { name: "달맞이소프트", symbol: "DMS", sectorKey: "tech", seed: 120 },
    { name: "북극성바이오", symbol: "PSB", sectorKey: "bio", seed: 110 },
    { name: "한울전력", symbol: "HUL", sectorKey: "energy", seed: 100 },
    { name: "골목마켓", symbol: "GMK", sectorKey: "retail", seed: 90 },
    { name: "모래금맥", symbol: "MGM", sectorKey: "gold", seed: 95 },
    { name: "별똥코인랩", symbol: "BCL", sectorKey: "coin", seed: 85 },
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
  ];

  const TYPING_LINES = [
    "영수증은 정확하게, 거스름돈은 빠르게.",
    "임원보고: 이번 주 리스크는 유동성입니다.",
    "배송 완료. 다음 주소로 즉시 출발하세요.",
    "고객님, 대기 번호 47번입니다. 조금만 기다려 주세요.",
    "야근 수당은 적지만 시드머니는 쌓입니다.",
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
    lobbyModal: $("#lobby-modal"),
    lobbyUser: $("#lobby-user"),
    lobbyStatus: $("#lobby-status"),
    lobbySolo: $("#lobby-solo"),
    lobbyHost: $("#lobby-host"),
    lobbyJoin: $("#lobby-join"),
    joinCode: $("#join-code"),
    roomCodeLabel: $("#room-code-label"),
    playerList: $("#player-list"),
    copyRoom: $("#copy-room"),
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
    adError: $("#ad-error"),
    adTicker: $("#ad-ticker"),
    adList: $("#ad-list"),
    closeMarketHint: $("#close-market-hint"),
    continueSeason: $("#continue-season"),
    weekResultTitle: $("#week-result-title"),
  };

  let selectedMode = "rookie";
  let soundOn = true;
  let audioContext = null;
  let state;
  let session = null;
  let authMode = "login";
  let authNext = "setup";
  let botTimers = [];
  const net = { peer: null, conns: [], hostConn: null, connecting: false };

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
    const config = MODES[modeKey];
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
      playMode: "solo",
      roomCode: "",
      playerId: session?.id || "guest",
      playerName: session?.nick || session?.id || "투자자",
      founded: null,
      ads: [],
      players: [],
      adDone: false,
    };
  }

  function isAuthority() {
    return state.playMode !== "client";
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function makeRoomCode() {
    return Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(random() * CODE_CHARS.length)]).join("");
  }

  function bufToHex(buf) {
    return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hexToBuf(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  async function hashPassword(password, saltHex) {
    const enc = new TextEncoder();
    const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
    const pass = enc.encode(password);
    const data = new Uint8Array(salt.length + pass.length);
    data.set(salt);
    data.set(pass, salt.length);
    const digest = await crypto.subtle.digest("SHA-256", data);
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
    els.authTitle.textContent = mode === "login" ? "로그인" : "회원가입";
    els.authSubmit.innerHTML = mode === "login" ? `로그인 <span>→</span>` : `가입하고 입장 <span>→</span>`;
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
    toast("🪪", "로그인", `${session.nick} 님, 데스크에 오신 것을 환영합니다.`);
    if (authNext === "setup") openModal(els.setupModal);
    authNext = "setup";
  }

  function logout() {
    writeSession(null);
    destroyNet();
    if (state?.active) {
      hideDesk();
      state = createState("rookie", false);
      prepareWeek();
    }
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
    };
    if (existing) Object.assign(existing, snapshot);
    else state.players.unshift(snapshot);
    state.players.forEach((player) => {
      player.total = playerTotal(player);
    });
  }

  function applyFlow(asset, signedQty) {
    const float = Math.max(40, asset.float || 400);
    const k = asset.playerCompany ? 0.62 : 0.3;
    const impact = Math.max(-0.1, Math.min(0.1, (signedQty / float) * k));
    asset.price = Math.max(5, round1(asset.price * (1 + impact)));
    asset.weekFlow = (asset.weekFlow || 0) + signedQty;
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
    if (!actor || !asset || qty < 1 || state.locked) return { ok: false, err: "locked" };
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
    return { ok: true };
  }

  function listCompany(spec) {
    const { ownerId, ownerName, name, symbol, sectorKey, seed, bot } = spec;
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
      trend: 0.002,
      noise: bot ? 0.012 : 0.01,
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
    return { ok: true, asset, cost, founderQty };
  }

  function rollCompanyOps(asset) {
    const shock = (random() * 2 - 1) * 0.045;
    const up = ["주간 매출이 예상보다 단단했습니다.", "신규 주문이 소폭 늘었습니다.", "고정비를 잘 막았습니다."];
    const down = ["고정비가 발목을 잡았습니다.", "수주가 한 박자 밀렸습니다.", "재고가 조금 쌓였습니다."];
    const flat = ["큰 이슈 없이 운영됐습니다.", "현금흐름은 평범했습니다.", "광고와 별개로 현장은 조용했습니다."];
    asset.opsShock = shock;
    asset.opsNote = shock > 0.012 ? up[Math.floor(random() * up.length)] : shock < -0.012 ? down[Math.floor(random() * down.length)] : flat[Math.floor(random() * flat.length)];
    return shock;
  }

  function publishAd(playerId, slogan, claim) {
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
    };
    asset.adWeeks = (asset.adWeeks || 0) + 1;
    state.ads = state.assets.filter((item) => item.ad && item.ad.week === state.week && item.ad.season === state.season).map((item) => ({
      assetId: item.id,
      symbol: item.symbol,
      name: item.name,
      slogan: item.ad.slogan,
      claim: item.ad.claim,
    }));
    attractAdFlow(asset);
    syncLocalPlayer();
    return { ok: true, asset };
  }

  function attractAdFlow(asset) {
    const trust = asset.trust ?? 0.7;
    const over = (asset.adWeeks || 0) >= 3;
    const buyChance = Math.max(0.08, trust * 0.55 - (over ? 0.18 : 0));
    state.players.filter((player) => player.bot && player.id !== asset.founderId).forEach((bot) => {
      if (random() > buyChance) return;
      const qty = 1 + Math.floor(random() * 5);
      executeTrade(bot.id, asset.id, "buy", qty, { silent: true });
    });
    if (over && random() < 0.35) {
      asset.trust = Math.max(0.15, (asset.trust || 0.7) - 0.12);
      state.players.filter((player) => player.bot).slice(0, 2).forEach((bot) => {
        const qty = Math.min(4, bot.holdings?.[asset.id]?.qty || 0);
        if (qty > 0) executeTrade(bot.id, asset.id, "sell", qty, { silent: true });
      });
    }
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

  function spawnBots(count) {
    const n = Math.max(3, Math.min(6, count || 4));
    shuffled(BOT_INVESTORS).slice(0, n).forEach((bot, index) => {
      if (state.players.some((item) => item.id === bot.id)) return;
      const cash = 420 + Math.floor(random() * 220);
      const player = {
        id: bot.id,
        name: bot.name,
        cash,
        holdings: freshHoldings(state.assets),
        founded: null,
        total: cash,
        bot: true,
      };
      state.players.push(player);
      const firm = BOT_FIRMS[index % BOT_FIRMS.length];
      listCompany({
        ownerId: bot.id,
        ownerName: bot.name,
        name: firm.name,
        symbol: firm.symbol,
        sectorKey: firm.sectorKey,
        seed: Math.min(player.cash - 40, firm.seed),
        bot: true,
      });
    });
    syncLocalPlayer();
  }

  function clearBotTimers() {
    botTimers.forEach((id) => clearTimeout(id));
    botTimers = [];
  }

  function scheduleBots() {
    clearBotTimers();
    if (!isAuthority() || !state.active) return;
    [900, 2400, 4800].forEach((delay) => {
      botTimers.push(setTimeout(() => {
        botTick();
        renderAll();
        if (state.playMode === "host") broadcastState();
      }, delay));
    });
  }

  function botTick() {
    if (!isAuthority() || !state.active || state.locked) return;
    state.players.filter((player) => player.bot).forEach((bot) => {
      if (random() > 0.62) return;
      const advertised = state.assets.filter((asset) => asset.ad && asset.ad.week === state.week);
      const pool = advertised.length && random() < 0.45 ? advertised : state.assets;
      const asset = pool[Math.floor(random() * pool.length)];
      if (!asset) return;
      const holding = ensureHolding(bot.holdings, asset.id);
      let side = random() > 0.5 ? "buy" : "sell";
      if (asset.ad && (asset.trust || 0) > 0.6 && random() < 0.55) side = "buy";
      if (asset.ad && (asset.trust || 0) < 0.35) side = "sell";
      const qty = 1 + Math.floor(random() * 6);
      if (side === "sell" && holding.qty < 1) side = "buy";
      executeTrade(bot.id, asset.id, side, qty, { silent: true });
    });
    syncLocalPlayer();
  }

  function fallbackToSolo(reason) {
    destroyNet();
    state.playMode = "solo";
    state.roomCode = "SOLO";
    if (!state.players.some((item) => item.bot)) spawnBots(4);
    toast("📡", "솔로로 전환", reason || "연결이 끊어져 봇 시장으로 이어갑니다.");
    renderAll();
  }

  function destroyNet() {
    try { net.conns.forEach((conn) => conn.close()); } catch { /* ignore */ }
    try { net.hostConn?.close(); } catch { /* ignore */ }
    try { net.peer?.destroy(); } catch { /* ignore */ }
    net.peer = null;
    net.conns = [];
    net.hostConn = null;
    net.connecting = false;
  }

  function sendTo(conn, payload) {
    try { conn.send(payload); } catch { /* ignore */ }
  }

  function broadcastState(extra = {}) {
    if (state.playMode !== "host") return;
    syncLocalPlayer();
    const snapshot = buildSnapshot();
    net.conns.forEach((conn) => sendTo(conn, { type: "state", snapshot, ...extra }));
  }

  function buildSnapshot() {
    return {
      week: state.week,
      season: state.season,
      locked: state.locked,
      seasonBreak: state.seasonBreak,
      roomCode: state.roomCode,
      modeKey: state.modeKey,
      event: publicEvent(state.event),
      assets: state.assets.map((asset) => ({
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
      })),
      ads: state.ads,
      players: state.players.map((player) => ({
        id: player.id,
        name: player.name,
        cash: player.cash,
        holdings: cloneHoldings(player.holdings),
        founded: player.founded,
        total: playerTotal(player),
        bot: !!player.bot,
      })),
    };
  }

  function applySnapshot(snapshot) {
    if (!snapshot) return;
    state.week = snapshot.week;
    state.season = snapshot.season;
    state.locked = snapshot.locked;
    state.seasonBreak = snapshot.seasonBreak;
    state.roomCode = snapshot.roomCode || state.roomCode;
    state.event = snapshot.event;
    state.assets = snapshot.assets || state.assets;
    state.ads = snapshot.ads || [];
    state.players = snapshot.players || state.players;
    state.expected = {};
    state.changes = {};
    state.assets.forEach((asset) => ensureHolding(state.holdings, asset.id));
    const me = state.players.find((item) => item.id === state.playerId);
    if (me) {
      state.cash = me.cash;
      state.holdings = cloneHoldings(me.holdings);
      state.founded = me.founded;
      state.playerName = me.name || state.playerName;
    }
  }

  function handleHostMessage(message, conn) {
    if (!message || !isAuthority()) return;
    if (message.type === "join") {
      const incoming = message.player;
      if (!incoming?.id) return;
      if (incoming.id === state.playerId || state.players.some((item) => item.id === incoming.id && !item.bot)) {
        sendTo(conn, { type: "reject", reason: "duplicate" });
        return;
      }
      incoming.bot = false;
      incoming.holdings = incoming.holdings || freshHoldings(state.assets);
      state.assets.forEach((asset) => ensureHolding(incoming.holdings, asset.id));
      incoming.total = playerTotal(incoming);
      state.players.push(incoming);
      broadcastState();
      renderAll();
      toast("🤝", "참가", `${incoming.name} 님이 방에 들어왔습니다.`);
      return;
    }
    if (message.type === "trade") {
      const result = executeTrade(message.playerId, message.assetId, message.side, message.qty, { silent: true });
      if (message.playerId === state.playerId && result.ok) {
        const asset = assetById(message.assetId);
        if (asset) recordTrade(message.side, asset, message.qty, asset.price * message.qty);
      }
      broadcastState();
      renderAll();
      return;
    }
    if (message.type === "found") {
      listCompany({ ...message.spec, ownerId: message.playerId });
      broadcastState();
      renderAll();
      return;
    }
    if (message.type === "ad") {
      publishAd(message.playerId, message.slogan, message.claim);
      broadcastState();
      renderAll();
      return;
    }
    if (message.type === "wallet") {
      const player = state.players.find((item) => item.id === message.playerId);
      if (player && message.playerId !== state.playerId) {
        player.cash = message.cash;
        player.total = playerTotal(player);
        broadcastState();
        renderAll();
      }
    }
  }

  function handleClientMessage(message) {
    if (!message) return;
    if (message.type === "reject") {
      toast("⛔", "입장 거부", message.reason === "duplicate" ? "이 아이디는 이미 방에 있습니다." : "방에 들어갈 수 없습니다.");
      fallbackToSolo("중복 로그인으로 솔로로 전환합니다.");
      return;
    }
    if (message.type === "state") {
      const before = totalAssets();
      applySnapshot(message.snapshot);
      if (message.weekClosed) {
        showWeekResult(totalAssets() - before, totalAssets(), message.dividend || 0);
      }
      if (message.weekStart) {
        closeModal(els.weekModal);
        resetLocalWeek();
      }
      renderAll();
    }
  }

  function bindConn(conn, asHost) {
    conn.on("data", (message) => {
      if (asHost) handleHostMessage(message, conn);
      else handleClientMessage(message);
    });
    conn.on("close", () => {
      net.conns = net.conns.filter((item) => item !== conn);
      if (!asHost) fallbackToSolo("방장과의 연결이 끊어졌습니다.");
      else {
        renderAll();
        broadcastState();
      }
    });
    conn.on("error", () => {
      if (!asHost) fallbackToSolo("PeerJS 오류로 솔로로 전환합니다.");
    });
  }

  function waitPeerOpen(peer) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 8000);
      peer.on("open", (id) => {
        clearTimeout(timer);
        resolve(id);
      });
      peer.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  async function startHostRoom() {
    if (typeof Peer === "undefined") {
      fallbackToSolo("PeerJS를 불러오지 못해 솔로로 시작합니다.");
      beginLocalGame("solo");
      return;
    }
    els.lobbyStatus.textContent = "방을 여는 중…";
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const code = makeRoomCode();
      destroyNet();
      try {
        net.peer = new Peer(PEER_PREFIX + code);
        await waitPeerOpen(net.peer);
        state.playMode = "host";
        state.roomCode = code;
        net.peer.on("connection", (conn) => {
          net.conns.push(conn);
          bindConn(conn, true);
          conn.on("open", () => broadcastState());
        });
        net.peer.on("disconnected", () => {
          if (state.active) fallbackToSolo("방장 연결이 끊겼습니다.");
        });
        spawnBots(3);
        closeModal(els.lobbyModal);
        beginLocalGame("host");
        toast("🔑", "방 생성", `참가 코드 ${code}`);
        return;
      } catch (err) {
        lastErr = err;
      }
    }
    fallbackToSolo(lastErr ? "방을 열지 못해 솔로로 시작합니다." : "방 생성 실패");
    beginLocalGame("solo");
  }

  async function joinHostRoom(code) {
    const clean = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length < 4) {
      els.lobbyStatus.textContent = "4–6자 코드를 입력하세요.";
      return;
    }
    if (typeof Peer === "undefined") {
      fallbackToSolo("PeerJS를 불러오지 못했습니다.");
      beginLocalGame("solo");
      return;
    }
    els.lobbyStatus.textContent = "방에 접속하는 중…";
    destroyNet();
    try {
      net.peer = new Peer();
      await waitPeerOpen(net.peer);
      net.hostConn = net.peer.connect(PEER_PREFIX + clean, { reliable: true });
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), 8000);
        net.hostConn.on("open", () => {
          clearTimeout(timer);
          resolve();
        });
        net.hostConn.on("error", reject);
      });
      bindConn(net.hostConn, false);
      state.playMode = "client";
      state.roomCode = clean;
      resetLocalWeek();
      sendTo(net.hostConn, {
        type: "join",
        player: {
          id: state.playerId,
          name: state.playerName,
          cash: state.cash,
          holdings: cloneHoldings(state.holdings),
          founded: state.founded,
          bot: false,
        },
      });
      closeModal(els.lobbyModal);
      if (!state.event) {
        state.event = {
          category: "연결", icon: "📡", title: "호스트 시세를 받는 중",
          description: "방장의 시장 상태가 곧 동기화됩니다.",
          themes: ["멀티플레이"], note: "광고와 수급을 보고 판단하세요.",
        };
      }
      revealDesk();
      toast("🚪", "입장", `방 ${clean}에 참가했습니다.`);
    } catch {
      fallbackToSolo("방을 찾지 못해 솔로로 시작합니다.");
      beginLocalGame("solo");
    }
  }

  function sendWallet() {
    if (state.playMode !== "client" || !net.hostConn) return;
    sendTo(net.hostConn, {
      type: "wallet",
      playerId: state.playerId,
      cash: state.cash,
    });
  }

  function hideDesk() {
    els.game.hidden = true;
    els.game.classList.add("is-locked");
    if (els.marketNav) els.marketNav.hidden = true;
  }

  function fillFoundSectors() {
    els.foundSector.innerHTML = SECTORS.map((item) => `<option value="${item.key}">${item.label}</option>`).join("");
  }

  function openFoundModal() {
    if (!state.active || state.locked) return;
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
    if (!state.active || state.locked) return;
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
    if (state.playMode === "client") {
      sendTo(net.hostConn, { type: "found", playerId: state.playerId, spec });
      closeModal(els.foundModal);
      return;
    }
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
    if (state.playMode === "host") broadcastState();
    renderAll();
  }

  function submitAd(event) {
    event.preventDefault();
    if (state.playMode === "client") {
      if (state.energy < 1) {
        els.adError.hidden = false;
        els.adError.textContent = "에너지가 부족합니다.";
        return;
      }
      if (state.cash < AD_COST) {
        els.adError.hidden = false;
        els.adError.textContent = "광고비 18만원이 필요합니다.";
        return;
      }
      state.energy -= 1;
      state.adDone = true;
      sendTo(net.hostConn, {
        type: "ad",
        playerId: state.playerId,
        slogan: els.adSlogan.value,
        claim: els.adClaim.value,
      });
      closeModal(els.adModal);
      renderAll();
      return;
    }
    const result = publishAd(state.playerId, els.adSlogan.value, els.adClaim.value);
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
    toast("📣", "광고 게재", `${result.asset.symbol} · ${els.adSlogan.value}`);
    if (state.playMode === "host") broadcastState();
    renderAll();
  }

  function renderRoom() {
    if (!els.roomCodeLabel) return;
    els.roomCodeLabel.textContent = state.roomCode || (state.playMode === "solo" ? "SOLO" : "—");
    els.playerList.innerHTML = state.players.map((player) => {
      const company = player.founded?.symbol || "미상장";
      const tag = player.bot ? `<span class="bot-tag">봇</span>` : (player.id === state.playerId ? `<span class="bot-tag">나</span>` : "");
      return `<li><b>${player.name}${tag}</b><small>${company} · ${money(player.total || 0)}</small></li>`;
    }).join("");
    if (els.closeMarketHint) {
      els.closeMarketHint.textContent = state.playMode === "client"
        ? "방장이 장을 마감하면 뉴스와 수급이 가격에 반영됩니다."
        : "장 마감 후 이번 주 뉴스와 수급이 가격에 반영됩니다.";
    }
    if (els.closeMarket) {
      els.closeMarket.disabled = !state.active || state.locked || state.playMode === "client";
    }
    if (els.foundButton) els.foundButton.disabled = !state.active || state.locked || !!state.founded;
    if (els.adButton) els.adButton.disabled = !state.active || state.locked || !state.founded || state.adDone;
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
    els.adList.innerHTML = ads.map((asset) => `
      <li>
        <span class="ad-sym">${asset.symbol} · ${AD_CLAIMS[asset.ad.claim] || ""}</span>
        <b>${asset.ad.slogan}</b>
        <small>${asset.founderName || "창업자"} 집행 · 사실 여부는 미확인</small>
      </li>
    `).join("");
  }

  function resetLocalWeek() {
    state.analyzed = new Set();
    state.intel = {};
    state.jobsDone = new Set();
    state.intelDone = new Set();
    state.playDone = new Set();
    state.energy = state.energyMax;
    state.weekJobs = shuffled(JOBS).slice(0, 3);
    state.adDone = false;
    state.locked = false;
  }

  function beginLocalGame(mode) {
    state.playMode = mode === "host" ? "host" : "solo";
    if (!state.roomCode) state.roomCode = mode === "host" ? state.roomCode : "SOLO";
    if (mode !== "host" && mode !== "client") state.roomCode = "SOLO";
    if (!state.players.some((item) => item.bot) && state.playMode === "solo") spawnBots(4);
    syncLocalPlayer();
    prepareWeek();
    revealDesk();
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
      const momentum = asset.lastChange * .08;
      const expected = eventEffect * newsWeight + asset.trend + momentum;
      const noise = (random() * 2 - 1) * asset.noise * (asset.playerCompany ? 0.45 : 1);
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
    if (state.playMode === "host") broadcastState({ weekStart: true });
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
    renderPortfolio();
    renderMissions();
    renderBadges();
    renderLog();
    renderActivities();
    renderRoom();
    renderAds();
    els.closeMarket.disabled = !state.active || state.locked || state.playMode === "client";
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

  function renderAssets() {
    els.assetList.innerHTML = state.assets.map((asset) => {
      const holding = ensureHolding(state.holdings, asset.id);
      const forecast = forecastFor(asset);
      const maxBuy = Math.floor(state.cash / asset.price);
      const disabled = !state.active || state.locked;
      const changeType = asset.lastChange > .0005 ? "up" : asset.lastChange < -.0005 ? "down" : "flat";
      const positionProfit = holding.qty > 0 ? (asset.price - holding.avg) * holding.qty : 0;
      const flow = flowHint(asset);
      const founder = asset.playerCompany ? `<span class="founder-tag">${asset.founderId === state.playerId ? "내 회사" : (asset.founderName || "창업")} 상장</span>` : "";
      const adMark = asset.ad && asset.ad.week === state.week ? `<span class="ad-badge">AD ${asset.ad.slogan}</span>` : "";
      const ops = asset.playerCompany && asset.opsNote ? `<span class="ops-note">${asset.opsNote}</span>` : "";

      return `
        <article class="asset-row ${asset.playerCompany ? "is-player" : ""}" data-id="${asset.id}" style="--asset-color:${asset.color}">
          <div class="asset-name">
            <span class="asset-symbol">${asset.symbol}</span>
            <strong>${asset.name}</strong>
            <small>${asset.sector}</small>
            ${founder}${adMark}${ops}
            <span class="risk-dots" title="위험도 ${asset.risk}/5">${riskDots(asset)}</span>
          </div>
          <div class="asset-price">
            <strong>${money(asset.price)}</strong>
            <span class="${changeType}">${asset.lastChange === 0 ? "신규" : percent(asset.lastChange)} 지난주</span>
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
    if (!state.active || state.locked) {
      toast("⚠️", "주문 실패", "장이 열려 있는지 확인하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    if (state.playMode === "client") {
      const asset = assetById(id);
      sendTo(net.hostConn, { type: "trade", playerId: state.playerId, assetId: id, side: "buy", qty });
      if (asset) recordTrade("buy", asset, qty, asset.price * qty);
      return;
    }
    const result = executeTrade(state.playerId, id, "buy", qty);
    if (!result.ok) {
      toast("⚠️", "주문 실패", "보유 현금과 주문 수량을 확인하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    if (state.playMode === "host") broadcastState();
  }

  function sell(id, qty) {
    if (!state.active || state.locked) {
      toast("⚠️", "주문 실패", "장이 열려 있는지 확인하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    if (state.playMode === "client") {
      const asset = assetById(id);
      sendTo(net.hostConn, { type: "trade", playerId: state.playerId, assetId: id, side: "sell", qty });
      if (asset) recordTrade("sell", asset, qty, asset.price * qty);
      return;
    }
    const result = executeTrade(state.playerId, id, "sell", qty);
    if (!result.ok) {
      toast("⚠️", "주문 실패", "보유 수량을 확인하세요.");
      tone(130, .12, "sawtooth");
      return;
    }
    if (state.playMode === "host") broadcastState();
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
    if (!state.active || state.locked || state.research < 1 || state.analyzed.has(id)) return;
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
    return state.active && !state.locked;
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

    els.playPanel.innerHTML = PLAYS.map((item) => {
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

  function closeMarket() {
    if (!state.active || state.locked) return;
    if (state.playMode === "client") {
      toast("⏳", "대기", "방장이 장을 마감합니다.");
      return;
    }
    clearBotTimers();
    botTick();
    state.locked = true;
    const before = totalAssets();
    let localDividend = 0;

    state.assets.forEach((asset) => {
      if (asset.playerCompany) rollCompanyOps(asset);
      const newsChange = state.changes[asset.id] || 0;
      const extra = asset.playerCompany ? (asset.opsShock || 0) + newsChange : newsChange;
      asset.price = Math.max(5, round1(asset.price * (1 + extra)));
      if (asset.playerCompany) resolveAdTruth(asset);
      const open = asset.weekOpen || asset.history[asset.history.length - 1] || asset.price;
      asset.lastChange = open > 0 ? (asset.price - open) / open : extra;
      asset.lastFlow = asset.weekFlow || 0;
      asset.history.push(asset.price);
    });

    if (state.week % 4 === 0) {
      state.players.forEach((player) => {
        let dividend = 0;
        state.assets.forEach((asset) => {
          if (!(asset.dividend > 0)) return;
          const qty = (player.id === state.playerId ? state.holdings : player.holdings)?.[asset.id]?.qty || 0;
          dividend += asset.price * qty * asset.dividend;
        });
        if (dividend > 0) {
          if (player.id === state.playerId) {
            state.cash += dividend;
            localDividend += dividend;
          } else {
            player.cash += dividend;
          }
        }
      });
      if (localDividend > 0) toast("💰", "분기 배당 입금", `${money(localDividend)}이 현금 계좌에 들어왔습니다.`);
    }

    const after = totalAssets();
    const cashRatio = after > 0 ? state.cash / after : 0;
    if (cashRatio >= .3) state.cashSafeWeeks += 1;
    checkMissions();
    checkBadges();
    syncLocalPlayer();
    showWeekResult(after - before, after, localDividend);
    if (state.playMode === "host") broadcastState({ weekClosed: true, dividend: localDividend });
    renderAll();
  }

  function showWeekResult(weekProfit, total, dividend) {
    els.weekResultLabel.textContent = `S${state.season} · WEEK ${String(state.week).padStart(2, "0")} CLOSED`;
    if (els.weekResultTitle) {
      els.weekResultTitle.textContent = state.week >= MAX_WEEKS ? `시즌 ${state.season} 폐장` : "이번 주 시장 마감";
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
    els.nextWeek.innerHTML = state.seasonBreak ? `다음 시즌 개장 <span>→</span>` : `다음 주 뉴스 확인 <span>→</span>`;
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
    if (state.playMode === "client") return;
    if (state.seasonBreak) {
      startNextSeason();
      return;
    }
    state.week += 1;
    prepareWeek();
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
      : "목표에는 못 미쳤지만 다음 계좌에는 경험이 남습니다.";
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
  }

  function bootRun() {
    destroyNet();
    clearBotTimers();
    state = createState(selectedMode, true);
    state.playerId = session.id;
    state.playerName = session.nick;
    syncLocalPlayer();
  }

  function startGame() {
    if (!requireSession()) return;
    closeModal(els.setupModal);
    closeModal(els.endModal);
    if (els.lobbyUser) els.lobbyUser.textContent = `${session.nick} 님, 솔로 또는 멀티플레이를 고르세요.`;
    if (els.lobbyStatus) els.lobbyStatus.textContent = "";
    openModal(els.lobbyModal);
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => $("button", modal)?.focus());
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

  els.openSetup.addEventListener("click", () => {
    if (!requireSession()) return;
    openModal(els.setupModal);
  });
  els.restart.addEventListener("click", () => {
    if (!requireSession()) return;
    openModal(els.setupModal);
  });
  els.playAgain.addEventListener("click", () => {
    closeModal(els.endModal);
    if (!requireSession()) return;
    openModal(els.setupModal);
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
  els.start.addEventListener("click", startGame);
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
  els.nextWeek.addEventListener("click", nextWeek);
  els.closeMarket.addEventListener("click", closeMarket);
  els.clearLog.addEventListener("click", () => {
    state.log = [];
    renderLog();
  });
  els.sound.addEventListener("click", () => {
    soundOn = !soundOn;
    els.sound.classList.toggle("muted", !soundOn);
    els.sound.textContent = soundOn ? "◖))" : "×";
    els.sound.setAttribute("aria-label", soundOn ? "효과음 끄기" : "효과음 켜기");
    if (soundOn) tone(520, .07);
  });
  els.accountButton.addEventListener("click", () => {
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
  els.authForm.addEventListener("submit", (event) => {
    submitAuth(event).catch(() => showAuthError("인증에 실패했습니다."));
  });
  els.lobbySolo.addEventListener("click", () => {
    if (!requireSession()) return;
    bootRun();
    closeModal(els.lobbyModal);
    beginLocalGame("solo");
  });
  els.lobbyHost.addEventListener("click", () => {
    if (!requireSession()) return;
    bootRun();
    startHostRoom();
  });
  els.lobbyJoin.addEventListener("click", () => {
    if (!requireSession()) return;
    bootRun();
    joinHostRoom(els.joinCode.value);
  });
  els.copyRoom.addEventListener("click", async () => {
    const code = state.roomCode || "";
    try {
      await navigator.clipboard.writeText(code);
      toast("📋", "복사됨", `방 코드 ${code}`);
    } catch {
      toast("📋", "방 코드", code || "SOLO");
    }
  });
  els.foundButton.addEventListener("click", openFoundModal);
  els.adButton.addEventListener("click", openAdModal);
  els.foundForm.addEventListener("submit", submitFound);
  els.adForm.addEventListener("submit", submitAd);
  els.foundSymbol.addEventListener("input", () => {
    els.foundSymbol.value = els.foundSymbol.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  });

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
    const button = event.target.closest("button");
    const row = event.target.closest(".asset-row");
    if (!button || !row) return;
    const action = button.dataset.action;
    const input = $("input", row);
    let qty = quantityFrom(row);
    if (action === "minus") input.value = Math.max(1, qty - 1);
    if (action === "plus") input.value = qty + 1;
    if (action === "buy") buy(row.dataset.id, qty);
    if (action === "sell") sell(row.dataset.id, qty);
    if (action === "research") analyze(row.dataset.id);
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
  prepareWeek();
  renderBest();
})();
