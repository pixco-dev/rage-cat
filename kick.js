(() => {
  "use strict";

  const WORLD_PATH = "bull-lab/world";
  const BAN_PATH = "bull-lab/bans";
  const PRESENCE_PATH = "bull-lab/presence";
  const WEALTH_SANITY = 50000;
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

  const playersEl = document.querySelector("#kick-players");
  const bannedEl = document.querySelector("#kick-banned");
  const statusEl = document.querySelector("#kick-status");
  const toastStack = document.querySelector("#toast-stack");

  function firebaseConfig() {
    const cfg = window.FIREBASE_CONFIG || DEFAULT_FIREBASE_CONFIG;
    return cfg.databaseURL && cfg.apiKey ? cfg : null;
  }

  function restUrl(path) {
    const cfg = firebaseConfig();
    if (!cfg?.databaseURL) return "";
    return `${cfg.databaseURL.replace(/\/$/, "")}/${String(path || "").replace(/^\/+/, "")}.json`;
  }

  async function rest(path, options = {}) {
    const url = restUrl(path);
    if (!url) throw new Error("firebase-rest-missing");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      return await fetch(url, { cache: "no-store", ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function safeKey(id) {
    return String(id || "").replace(/[.#$\[\]/]/g, "_");
  }

  function listFromMap(map) {
    if (!map) return [];
    if (Array.isArray(map)) return map.filter(Boolean);
    return Object.keys(map).map((key) => {
      const row = map[key];
      if (!row || typeof row !== "object") return { id: key };
      return { ...row, id: row.id || key };
    }).filter((row) => row && row.id);
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

  function money(value) {
    const rounded = Math.round(Number(value || 0) * 10) / 10;
    return `${rounded.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만원`;
  }

  function toast(title, copy) {
    if (!toastStack) return;
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<i>🛡️</i><b>${esc(title)}</b><p>${esc(copy)}</p>`;
    toastStack.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  }

  function holdingsValue(player, assets) {
    const holdings = player?.holdings || {};
    return (assets || []).reduce((sum, asset) => {
      const qty = Number(holdings[asset.id]?.qty) || 0;
      return sum + (Number(asset.price) || 0) * qty;
    }, 0);
  }

  function wealthOf(player, assets) {
    const listed = Number(player.total);
    if (Number.isFinite(listed) && listed > 0) return listed;
    return (Number(player.cash) || 0) + holdingsValue(player, assets);
  }

  async function loadDesk() {
    statusEl.textContent = "불러오는 중…";
    try {
      const [playersRes, bansRes, assetsRes] = await Promise.all([
        rest(`${WORLD_PATH}/players`),
        rest(BAN_PATH),
        rest(`${WORLD_PATH}/assets`),
      ]);
      const players = listFromMap(await playersRes.json());
      const bans = listFromMap(await bansRes.json());
      const assets = listFromMap(await assetsRes.json());
      const banIds = new Set(bans.map((row) => row.id));
      const ranked = players
        .filter((player) => player.id && !String(player.id).startsWith("bot-") && !String(player.id).startsWith("guest-"))
        .map((player) => ({ ...player, total: wealthOf(player, assets) }))
        .sort((a, b) => (b.total || 0) - (a.total || 0));

      if (!ranked.length) {
        playersEl.innerHTML = `<li class="kick-empty">아직 공유 계좌가 없습니다.</li>`;
      } else {
        playersEl.innerHTML = ranked.map((player, index) => {
          const flagged = (player.cash || 0) > WEALTH_SANITY || (player.total || 0) > WEALTH_SANITY;
          const banned = banIds.has(player.id);
          return `
            <li class="${flagged ? "is-flagged" : ""} ${banned ? "is-banned" : ""}">
              <span class="kick-n">${index + 1}</span>
              <div>
                <b>${esc(player.name || player.id)}${flagged ? `<span class="me-tag">이상</span>` : ""}</b>
                <small>${esc(player.id)} · 현금 ${money(player.cash)} · 총 ${money(player.total)}</small>
              </div>
              ${banned
                ? `<span class="kick-done">강퇴됨</span>`
                : `<button type="button" class="kick-button" data-kick="${esc(player.id)}" data-name="${esc(player.name || player.id)}">강퇴</button>`}
            </li>`;
        }).join("");
      }

      if (!bans.length) {
        bannedEl.innerHTML = `<li class="kick-empty">강퇴된 계좌가 없습니다.</li>`;
      } else {
        bannedEl.innerHTML = bans.map((row) => `
          <li class="is-banned">
            <span class="kick-n">×</span>
            <div>
              <b>${esc(row.name || row.id)}</b>
              <small>${esc(row.id)}${row.reason ? ` · ${esc(row.reason)}` : ""}</small>
            </div>
            <button type="button" class="unkick-button" data-unkick="${esc(row.id)}" data-name="${esc(row.name || row.id)}">해제</button>
          </li>`).join("");
      }

      statusEl.textContent = `시장 ${ranked.length}명 · 강퇴 ${bans.length}명`;
    } catch {
      statusEl.textContent = "공유 시장에 닿지 못했습니다.";
      toast("연결 실패", "잠시 후 다시 불러와 주세요.");
    }
  }

  async function kickPlayer(id, name) {
    const playerId = String(id || "").trim();
    if (!playerId) return;
    const label = name || playerId;
    if (!window.confirm(`${label} 계좌를 강퇴할까요?\n공유 순위에서 빠지고, 이 아이디로는 다시 못 들어옵니다.`)) return;
    const key = safeKey(playerId);
    const headers = { "Content-Type": "application/json" };
    try {
      await rest(`${BAN_PATH}/${key}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          id: playerId,
          name: label,
          reason: "staff-kick",
          at: Date.now(),
          by: "kick-desk",
        }),
      });
      await rest(`${WORLD_PATH}/players/${key}`, { method: "DELETE" });
      await rest(`${WORLD_PATH}/lenders/${safeKey(`ln-${playerId}`)}`, { method: "DELETE" });
      await rest(`${PRESENCE_PATH}/${key}`, { method: "DELETE" });
      toast("강퇴", `${label}을 공유 시장에서 뺐습니다.`);
      await loadDesk();
    } catch {
      toast("강퇴 실패", "공유 시장에 닿지 못했습니다.");
    }
  }

  async function unkickPlayer(id, name) {
    const playerId = String(id || "").trim();
    if (!playerId) return;
    const label = name || playerId;
    if (!window.confirm(`${label} 강퇴를 해제할까요?`)) return;
    try {
      await rest(`${BAN_PATH}/${safeKey(playerId)}`, { method: "DELETE" });
      toast("해제", `${label}은 다시 입장할 수 있습니다.`);
      await loadDesk();
    } catch {
      toast("해제 실패", "공유 시장에 닿지 못했습니다.");
    }
  }

  document.querySelector("#kick-refresh")?.addEventListener("click", () => {
    loadDesk();
  });

  playersEl?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kick]");
    if (!button) return;
    kickPlayer(button.dataset.kick, button.dataset.name);
  });

  bannedEl?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-unkick]");
    if (!button) return;
    unkickPlayer(button.dataset.unkick, button.dataset.name);
  });

  loadDesk();
  setInterval(loadDesk, 12000);
})();
