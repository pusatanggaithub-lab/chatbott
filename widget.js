/**
 * ChatDesk Widget — multi-tenant.
 * Pemakaian di website klien:
 * <script src="https://testing-theta-gold.vercel.app/widget.js" data-api-key="API_KEY_PENGGUNA"></script>
 */
(function () {
  var SUPABASE_URL = "https://lmsgunuqsigdpnagkmjq.supabase.co";
  var SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtc2d1bnVxc2lnZHBuYWdrbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NjE5NzMsImV4cCI6MjEwMjMzNzk3M30.-sl-P0_Mr7hakna5XYq0hj_Q0g-EgM0ef5nAeX6iqKA";

  var script = document.currentScript;
  var API_KEY = script && script.getAttribute("data-api-key");
  if (!API_KEY) {
    console.error("[ChatDesk] data-api-key wajib diisi.");
    return;
  }

  function rpc(fn, body) {
    return fetch(SUPABASE_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json();
    });
  }

  var ICONS = {
    chat: "M12 3C7 3 3 6.6 3 11c0 2.4 1.2 4.5 3.2 5.9L5.5 21l4.3-2.2c.7.1 1.4.2 2.2.2 5 0 9-3.6 9-8s-4-8-9-8Z",
    bot: "M12 2v3m-7 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z",
    help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15h.01M12 8a2 2 0 0 1 1 3.7c-.6.4-1 .8-1 1.3",
  };

  rpc("widget_config", { p_api_key: API_KEY }).then(function (cfg) {
    var c = cfg && !cfg.code && !cfg.error ? cfg : {};
    var color = c.primary_color || "#0F8A78";
    var botName = c.bot_name || "Asisten AI";
    var welcome = c.welcome_message || "Halo! Ada yang bisa saya bantu?";
    var iconHtml =
      c.icon_type === "custom" && c.icon_url
        ? '<img src="' + c.icon_url + '" alt="" style="width:28px;height:28px;border-radius:50%">'
        : '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="' +
          (ICONS[c.icon_type] || ICONS.chat) +
          '"/></svg>';

    var style = document.createElement("style");
    style.textContent = [
      ".cd-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border:none;border-radius:50%;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:2147483000;display:flex;align-items:center;justify-content:center;background:" +
        color +
        "}",
      ".cd-box{display:none;position:fixed;bottom:92px;right:20px;width:340px;max-width:calc(100vw - 32px);height:460px;background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.22);flex-direction:column;overflow:hidden;z-index:2147483000;font-family:'Plus Jakarta Sans',system-ui,sans-serif}",
      ".cd-hdr{padding:14px 16px;color:#fff;font-weight:700;font-size:15px;background:" + color + "}",
      ".cd-logs{flex:1;padding:14px;overflow-y:auto;background:#F5F8F7;display:flex;flex-direction:column;gap:8px}",
      ".cd-msg{max-width:80%;padding:9px 13px;border-radius:14px;font-size:14px;line-height:1.45}",
      ".cd-msg.bot{background:#fff;color:#10201E;align-self:flex-start;border-top-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06)}",
      ".cd-msg.user{color:#fff;align-self:flex-end;border-top-right-radius:4px;background:" + color + "}",
      ".cd-inp{display:flex;gap:8px;padding:10px;border-top:1px solid #E2EAE8;background:#fff}",
      ".cd-inp input{flex:1;padding:10px 14px;border:1px solid #D2DEDB;border-radius:999px;outline:none;font-size:14px;font-family:inherit}",
      ".cd-inp button{border:none;border-radius:999px;padding:0 16px;color:#fff;cursor:pointer;font-weight:600;background:" +
        color +
        "}",
    ].join("");
    document.head.appendChild(style);

    var btn = document.createElement("button");
    btn.className = "cd-btn";
    btn.innerHTML = iconHtml;

    var box = document.createElement("div");
    box.className = "cd-box";
    box.innerHTML =
      '<div class="cd-hdr">' +
      botName +
      '</div><div class="cd-logs" id="cdLogs"><div class="cd-msg bot">' +
      welcome +
      '</div></div><div class="cd-inp"><input id="cdInput" placeholder="Ketik pesan..."><button id="cdSend">Kirim</button></div>';

    document.body.appendChild(btn);
    document.body.appendChild(box);

    btn.onclick = function () {
      box.style.display = box.style.display === "flex" ? "none" : "flex";
    };

    var logs = box.querySelector("#cdLogs");
    var input = box.querySelector("#cdInput");

    function push(text, who) {
      var d = document.createElement("div");
      d.className = "cd-msg " + who;
      d.textContent = text;
      logs.appendChild(d);
      logs.scrollTop = logs.scrollHeight;
      return d;
    }

    function send() {
      var text = input.value.trim();
      if (!text) return;
      push(text, "user");
      input.value = "";
      var typing = push("...", "bot");
      rpc("widget_ask", { p_api_key: API_KEY, p_message: text })
        .then(function (res) {
          typing.textContent = (res && res.reply) || "Maaf, terjadi kesalahan.";
        })
        .catch(function () {
          typing.textContent = "Koneksi bermasalah. Coba lagi nanti.";
        });
    }

    box.querySelector("#cdSend").onclick = send;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  });
})();
