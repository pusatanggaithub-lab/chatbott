/* ChatDesk — logika dashboard (vanilla JS + Supabase) */
const SUPABASE_URL = "https://lmsgunuqsigdpnagkmjq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtc2d1bnVxc2lnZHBuYWdrbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NjE5NzMsImV4cCI6MjEwMjMzNzk3M30.-sl-P0_Mr7hakna5XYq0hj_Q0g-EgM0ef5nAeX6iqKA";
// URL tempat widget.js dihosting (ganti sesuai domain Anda)
const WIDGET_HOST = location.origin;

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
let profile = null;

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hide");
  setTimeout(() => t.classList.add("hide"), 2500);
}

function show(view) {
  ["landing", "auth", "dash"].forEach((v) => {
    const el = $("view-" + v);
    el.classList.toggle("hide", v !== view);
    if (v === "auth") el.classList.toggle("grid", v === view);
  });
}

document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => show(b.dataset.go)));

/* ---------------- AUTH ---------------- */
$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithPassword({ email: $("email").value, password: $("password").value });
  if (error) return toast(error.message);
  initDashboard();
};

$("btnRegister").onclick = async () => {
  const email = $("email").value, password = $("password").value;
  if (!email || password.length < 6) return toast("Email wajib & password minimal 6 karakter.");
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return toast(error.message);
  if (data.session) initDashboard();
  else toast("Cek email Anda untuk verifikasi akun.");
};

$("btnLogout").onclick = async () => {
  await sb.auth.signOut();
  profile = null;
  show("landing");
};

/* ---------------- TAB ---------------- */
document.querySelectorAll("#nav button").forEach((b) => {
  b.onclick = () => {
    ["faq", "logs", "widget", "embed"].forEach((t) => $("tab-" + t).classList.toggle("hide", t !== b.dataset.tab));
    document.querySelectorAll("#nav button").forEach((x) =>
      x.classList.toggle("bg-teal", x === b) || x.classList.toggle("text-white", x === b));
    document.querySelectorAll("#nav button").forEach((x) => {
      x.classList.toggle("bg-teal", x === b);
      x.classList.toggle("text-white", x === b);
    });
    if (b.dataset.tab === "logs") loadLogs();
  };
});

/* ---------------- INIT ---------------- */
async function initDashboard() {
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return show("auth");
  // Profil dibuat otomatis oleh trigger; fallback upsert bila belum ada.
  let { data: p } = await sb.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  if (!p) {
    await sb.from("profiles").upsert({ id: u.user.id, email: u.user.email });
    ({ data: p } = await sb.from("profiles").select("*").eq("id", u.user.id).maybeSingle());
  }
  profile = p;
  show("dash");
  fillWidgetForm();
  fillEmbed();
  loadFaqs();
}

sb.auth.getSession().then(({ data }) => (data.session ? initDashboard() : show("landing")));

/* ---------------- FAQ CRUD ---------------- */
async function loadFaqs() {
  const { data } = await sb.from("faqs").select("*").order("created_at", { ascending: false });
  $("faqList").innerHTML = (data || []).length
    ? data.map((f) => `
      <div class="rounded-2xl border bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-teal">${f.kategori || "Umum"}</p>
            <p class="mt-1 text-sm">${f.jawaban}</p>
            <p class="mt-2 text-xs text-slate-500">${(f.keywords || []).join(", ")}</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button class="rounded-lg border px-3 py-1 text-xs font-semibold" onclick='editFaq(${JSON.stringify(f)})'>Edit</button>
            <button class="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600" onclick="delFaq('${f.id}')">Hapus</button>
          </div>
        </div>
      </div>`).join("")
    : `<p class="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500">Belum ada FAQ.</p>`;
}

window.editFaq = (f) => {
  $("faqId").value = f.id;
  $("faqKategori").value = f.kategori || "";
  $("faqKeywords").value = (f.keywords || []).join(", ");
  $("faqJawaban").value = f.jawaban;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.delFaq = async (id) => {
  if (!confirm("Hapus FAQ ini?")) return;
  const { error } = await sb.from("faqs").delete().eq("id", id);
  toast(error ? error.message : "FAQ dihapus.");
  loadFaqs();
};

$("faqReset").onclick = () => $("faqForm").reset();

$("faqForm").onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    user_id: profile.id,
    kategori: $("faqKategori").value || null,
    keywords: $("faqKeywords").value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    jawaban: $("faqJawaban").value,
  };
  const id = $("faqId").value;
  const { error } = id
    ? await sb.from("faqs").update(payload).eq("id", id)
    : await sb.from("faqs").insert(payload);
  if (error) return toast(error.message);
  toast("FAQ tersimpan.");
  $("faqForm").reset();
  $("faqId").value = "";
  loadFaqs();
};

/* ---------------- LOGS ---------------- */
async function loadLogs() {
  const { data } = await sb.from("unanswered_logs").select("*").order("created_at", { ascending: false }).limit(100);
  $("tab-logs").innerHTML = (data || []).length
    ? data.map((l) => `
      <div class="flex items-center justify-between gap-3 rounded-2xl border bg-white p-4">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">${l.pertanyaan}</p>
          <p class="text-xs text-slate-500">${new Date(l.created_at).toLocaleString("id-ID")} ${l.resolved ? "• selesai" : ""}</p>
        </div>
        ${l.resolved ? "" : `<button class="shrink-0 rounded-lg bg-teal px-3 py-1 text-xs font-semibold text-white" onclick="toFaq('${l.id}', ${JSON.stringify(l.pertanyaan)})">Tambahkan ke FAQ</button>`}
      </div>`).join("")
    : `<p class="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500">Belum ada pertanyaan tak terjawab.</p>`;
}

window.toFaq = async (id, pertanyaan) => {
  await sb.from("unanswered_logs").update({ resolved: true }).eq("id", id);
  document.querySelector('#nav [data-tab="faq"]').click();
  $("faqKeywords").value = pertanyaan.toLowerCase();
  $("faqJawaban").focus();
  toast("Log ditandai selesai — lengkapi jawabannya.");
};

/* ---------------- WIDGET ---------------- */
function fillWidgetForm() {
  $("wBot").value = profile.bot_name;
  $("wWelcome").value = profile.welcome_message;
  $("wColor").value = profile.primary_color;
  $("wIcon").value = profile.icon_type;
  preview();
}

function preview() {
  $("pvHeader").textContent = $("wBot").value;
  $("pvHeader").style.background = $("wColor").value;
  $("pvWelcome").textContent = $("wWelcome").value;
  $("pvUser").style.background = $("wColor").value;
}
["wBot", "wWelcome", "wColor"].forEach((id) => $(id).addEventListener("input", preview));

$("widgetForm").onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    bot_name: $("wBot").value,
    welcome_message: $("wWelcome").value,
    primary_color: $("wColor").value,
    icon_type: $("wIcon").value,
  };
  const { error } = await sb.from("profiles").update(payload).eq("id", profile.id);
  if (error) return toast(error.message);
  profile = { ...profile, ...payload };
  toast("Pengaturan widget disimpan.");
};

/* ---------------- EMBED ---------------- */
function fillEmbed() {
  $("apiKey").textContent = profile.api_key;
  $("embedCode").textContent = `<script src="${WIDGET_HOST}/widget.js" data-api-key="${profile.api_key}"><\/script>`;
}
$("btnCopy").onclick = () => {
  navigator.clipboard.writeText($("embedCode").textContent);
  toast("Script disalin.");
};
