import { useState, useEffect, useRef } from "react";
const API_URL = "https://huggingface.co/spaces/Achero/doblayt-backend";

const steps = [
  { id: 1, key: "download", icon: "⬇️", label: "Descargando audio", desc: "Extrayendo audio del video..." },
  { id: 2, key: "transcribe", icon: "🎙️", label: "Transcribiendo", desc: "Whisper detectando voz en inglés..." },
  { id: 3, key: "translate", icon: "🌐", label: "Traduciendo", desc: "Convirtiendo texto al español..." },
  { id: 4, key: "tts", icon: "🔊", label: "Generando voz", desc: "Sintetizando audio en español..." },
  { id: 5, key: "sync", icon: "🎬", label: "Sincronizando", desc: "Combinando video + audio doblado..." },
];

const DEMO_DURATION = 2200;

export default function App() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | processing | done | error
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef(null);
  const stepRef = useRef(0);

  const isValidYouTube = (u) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(u);

  const extractVideoId = (u) => {
    const m = u.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  const handleTranslate = () => {
    if (!isValidYouTube(url)) {
      setErrorMsg("⚠️ Por favor pegá un enlace válido de YouTube.");
      return;
    }
    setErrorMsg("");
    const vid = extractVideoId(url);
    setVideoInfo({
      id: vid,
      thumb: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      title: "Procesando video...",
    });
    setPhase("processing");
    setCurrentStep(0);
    setStepProgress(0);
    stepRef.current = 0;
    runSteps();
  };

  const runSteps = () => {
    let step = 0;
    let prog = 0;
    intervalRef.current = setInterval(() => {
      prog += 4;
      setStepProgress(prog);
      if (prog >= 100) {
        prog = 0;
        step += 1;
        setCurrentStep(step);
        stepRef.current = step;
        if (step >= steps.length) {
          clearInterval(intervalRef.current);
          setPhase("done");
        }
      }
    }, DEMO_DURATION / 100);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setUrl("");
    setPhase("idle");
    setCurrentStep(0);
    setStepProgress(0);
    setVideoInfo(null);
    setErrorMsg("");
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>▶</span>
          <div>
            <div style={styles.logoTitle}>DoblaYT</div>
            <div style={styles.logoSub}>Traductor de video al español</div>
          </div>
        </div>
        <div style={styles.badge}>BETA</div>
      </header>

      <main style={styles.main}>

        {/* Idle / Input phase */}
        {phase === "idle" && (
          <div className="fade-in">
            <div style={styles.heroText}>
              Pegá el link de YouTube<br />
              <span style={styles.heroAccent}>y lo doblamos al español</span>
            </div>

            <div style={styles.card}>
              <div style={styles.inputLabel}>🔗 Enlace de YouTube</div>
              <div style={styles.inputRow}>
                <input
                  style={styles.input}
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErrorMsg(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleTranslate()}
                />
                {url && (
                  <button style={styles.clearBtn} onClick={() => setUrl("")}>✕</button>
                )}
              </div>
              {errorMsg && <div style={styles.error}>{errorMsg}</div>}

              <button
                style={{ ...styles.btn, ...(isValidYouTube(url) ? {} : styles.btnDisabled) }}
                onClick={handleTranslate}
                className="btn-glow"
              >
                <span>🎬</span> Traducir Video
              </button>
            </div>

            {/* Feature pills */}
            <div style={styles.pills}>
              {["✅ 100% Gratis", "🎙️ Whisper AI", "🔊 Voz natural", "⚡ Sin registro"].map((p) => (
                <div key={p} style={styles.pill}>{p}</div>
              ))}
            </div>

            {/* How it works */}
            <div style={styles.howTitle}>¿Cómo funciona?</div>
            <div style={styles.howList}>
              {[
                ["1", "Pegás el link del video de YouTube"],
                ["2", "La IA extrae y traduce el audio al español"],
                ["3", "Se genera una voz natural sincronizada"],
                ["4", "Descargás el video doblado"],
              ].map(([n, t]) => (
                <div key={n} style={styles.howItem}>
                  <div style={styles.howNum}>{n}</div>
                  <div style={styles.howText}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing phase */}
        {phase === "processing" && (
          <div className="fade-in">
            {videoInfo && (
              <div style={styles.thumbCard}>
                <img
                  src={videoInfo.thumb}
                  alt="thumbnail"
                  style={styles.thumb}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div style={styles.thumbOverlay}>
                  <div style={styles.thumbBadge}>🔄 Procesando...</div>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <div style={styles.procTitle}>Doblando tu video</div>
              <div style={styles.procSub}>No cierres esta pantalla</div>

              <div style={styles.stepsContainer}>
                {steps.map((s, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div key={s.id} style={styles.stepRow}>
                      <div style={{
                        ...styles.stepIcon,
                        ...(isDone ? styles.stepIconDone : {}),
                        ...(isActive ? styles.stepIconActive : {}),
                      }}>
                        {isDone ? "✓" : s.icon}
                      </div>
                      <div style={styles.stepInfo}>
                        <div style={{
                          ...styles.stepLabel,
                          ...(isDone ? styles.stepLabelDone : {}),
                          ...(isActive ? styles.stepLabelActive : {}),
                        }}>{s.label}</div>
                        {isActive && (
                          <div style={styles.stepDesc}>{s.desc}</div>
                        )}
                        {isActive && (
                          <div style={styles.progressBar}>
                            <div
                              style={{ ...styles.progressFill, width: `${stepProgress}%` }}
                              className="progress-anim"
                            />
                          </div>
                        )}
                      </div>
                      {isDone && <div style={styles.checkMark}>✅</div>}
                      {isActive && <div style={styles.spinnerDot} className="spinner" />}
                    </div>
                  );
                })}
              </div>

              {/* Overall progress */}
              <div style={styles.overallLabel}>
                Paso {Math.min(currentStep + 1, steps.length)} de {steps.length}
              </div>
              <div style={styles.overallBar}>
                <div style={{
                  ...styles.overallFill,
                  width: `${((currentStep * 100 + stepProgress) / steps.length)}%`
                }} />
              </div>
            </div>

            <button style={styles.cancelBtn} onClick={handleReset}>
              Cancelar proceso
            </button>
          </div>
        )}

        {/* Done phase */}
        {phase === "done" && (
          <div className="fade-in">
            <div style={styles.doneHero}>
              <div style={styles.doneIconWrap} className="pop-in">
                <span style={styles.doneIcon}>🎉</span>
              </div>
              <div style={styles.doneTitle}>¡Video listo!</div>
              <div style={styles.doneSub}>Tu video fue doblado al español exitosamente</div>
            </div>

            {videoInfo && (
              <div style={styles.thumbCard}>
                <img
                  src={videoInfo.thumb}
                  alt="thumbnail"
                  style={styles.thumb}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div style={styles.thumbOverlay}>
                  <div style={{ ...styles.thumbBadge, background: "rgba(0,200,100,0.85)" }}>
                    ✅ Doblado
                  </div>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <button style={{ ...styles.btn, background: "linear-gradient(135deg, #00c853, #00e676)" }} className="btn-glow">
                <span>⬇️</span> Descargar Video Doblado
              </button>

              <div style={styles.doneStats}>
                {[
                  ["🎙️", "Transcrito", "Whisper AI"],
                  ["🌐", "Traducido", "al español"],
                  ["🔊", "Voz", "Natural TTS"],
                ].map(([ic, t, s]) => (
                  <div key={t} style={styles.statItem}>
                    <div style={styles.statIcon}>{ic}</div>
                    <div style={styles.statLabel}>{t}</div>
                    <div style={styles.statVal}>{s}</div>
                  </div>
                ))}
              </div>
            </div>

            <button style={styles.secondaryBtn} onClick={handleReset}>
              ← Traducir otro video
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        Powered por Whisper · edge-tts · FFmpeg · yt-dlp
      </footer>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#e8eaf0",
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    maxWidth: 420,
    margin: "0 auto",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 20px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: "linear-gradient(135deg, #e52d27, #b31217)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, color: "#fff", fontWeight: "bold",
    boxShadow: "0 4px 16px rgba(229,45,39,0.4)",
    flexShrink: 0,
  },
  logoTitle: { fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" },
  logoSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  badge: {
    fontSize: 10, fontWeight: 700, color: "#00d4ff",
    border: "1px solid rgba(0,212,255,0.3)",
    borderRadius: 6, padding: "3px 8px",
    background: "rgba(0,212,255,0.08)",
    letterSpacing: 1,
  },
  main: { flex: 1, padding: "20px 16px 16px", overflowY: "auto" },
  heroText: {
    fontSize: 22, fontWeight: 700, lineHeight: 1.3,
    textAlign: "center", marginBottom: 24,
    color: "#c9d1e0",
  },
  heroAccent: { color: "#00d4ff" },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, padding: 20, marginBottom: 16,
    backdropFilter: "blur(10px)",
  },
  inputLabel: { fontSize: 12, color: "#6b7280", marginBottom: 10, fontWeight: 600, letterSpacing: 0.5 },
  inputRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  input: {
    flex: 1, background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "13px 14px",
    color: "#e8eaf0", fontSize: 14, outline: "none",
    fontFamily: "inherit",
  },
  clearBtn: {
    background: "rgba(255,255,255,0.08)", border: "none",
    color: "#9ca3af", borderRadius: 8, width: 34, height: 34,
    cursor: "pointer", fontSize: 14, flexShrink: 0,
  },
  error: {
    fontSize: 13, color: "#f87171",
    background: "rgba(248,113,113,0.1)",
    borderRadius: 8, padding: "8px 12px",
    marginBottom: 12,
  },
  btn: {
    width: "100%", padding: "15px 20px",
    background: "linear-gradient(135deg, #e52d27, #ff6b35)",
    border: "none", borderRadius: 14,
    color: "#fff", fontSize: 16, fontWeight: 700,
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
    gap: 8, letterSpacing: 0.3,
    boxShadow: "0 6px 24px rgba(229,45,39,0.35)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  btnDisabled: {
    background: "rgba(255,255,255,0.08)",
    boxShadow: "none", color: "#4b5563",
    cursor: "not-allowed",
  },
  pills: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, justifyContent: "center" },
  pill: {
    fontSize: 12, padding: "6px 12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20, color: "#9ca3af",
  },
  howTitle: { fontSize: 13, fontWeight: 700, color: "#6b7280", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" },
  howList: { display: "flex", flexDirection: "column", gap: 10 },
  howItem: { display: "flex", alignItems: "flex-start", gap: 14 },
  howNum: {
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))",
    border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "#00d4ff",
  },
  howText: { fontSize: 14, color: "#9ca3af", paddingTop: 4, lineHeight: 1.5 },
  thumbCard: { borderRadius: 16, overflow: "hidden", marginBottom: 16, position: "relative" },
  thumb: { width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" },
  thumbOverlay: { position: "absolute", bottom: 10, left: 10 },
  thumbBadge: {
    fontSize: 12, fontWeight: 700, color: "#fff",
    background: "rgba(0,0,0,0.7)", borderRadius: 8,
    padding: "4px 10px", backdropFilter: "blur(4px)",
  },
  procTitle: { fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  procSub: { fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  stepsContainer: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 },
  stepRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  stepIcon: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, transition: "all 0.3s ease",
  },
  stepIconDone: { background: "rgba(0,200,83,0.15)", border: "1px solid rgba(0,200,83,0.3)" },
  stepIconActive: { background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)", boxShadow: "0 0 12px rgba(0,212,255,0.2)" },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: 14, fontWeight: 600, color: "#4b5563", paddingTop: 8 },
  stepLabelDone: { color: "#6b7280" },
  stepLabelActive: { color: "#e8eaf0" },
  stepDesc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  progressBar: { marginTop: 8, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #00d4ff, #7c3aed)", borderRadius: 4, transition: "width 0.2s linear" },
  checkMark: { fontSize: 16, paddingTop: 8 },
  spinnerDot: { width: 8, height: 8, borderRadius: "50%", background: "#00d4ff", marginTop: 14, flexShrink: 0 },
  overallLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6, textAlign: "right" },
  overallBar: { height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" },
  overallFill: { height: "100%", background: "linear-gradient(90deg, #e52d27, #ff6b35, #00d4ff)", borderRadius: 6, transition: "width 0.2s linear" },
  cancelBtn: {
    width: "100%", padding: "12px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
    color: "#6b7280", fontSize: 14, cursor: "pointer",
  },
  doneHero: { textAlign: "center", marginBottom: 20 },
  doneIconWrap: {
    width: 72, height: 72, borderRadius: 24, margin: "0 auto 12px",
    background: "linear-gradient(135deg, rgba(0,200,83,0.2), rgba(0,230,118,0.05))",
    border: "1px solid rgba(0,200,83,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 36,
  },
  doneTitle: { fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 },
  doneSub: { fontSize: 14, color: "#6b7280" },
  doneStats: { display: "flex", justifyContent: "space-around", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" },
  statItem: { textAlign: "center" },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 700, color: "#9ca3af" },
  statVal: { fontSize: 11, color: "#6b7280" },
  secondaryBtn: {
    width: "100%", padding: "14px", marginTop: 4,
    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14, color: "#9ca3af", fontSize: 14,
    cursor: "pointer", fontWeight: 600,
  },
  footer: {
    textAlign: "center", fontSize: 11, color: "#374151",
    padding: "12px 16px 20px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080b12; }
  .fade-in { animation: fadeIn 0.35s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .pop-in { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .btn-glow:hover:not([disabled]) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(229,45,39,0.45) !important; }
  .btn-glow:active { transform: translateY(0); }
  .spinner { animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.6); } }
  .progress-anim { box-shadow: 0 0 8px rgba(0,212,255,0.6); }
  input::placeholder { color: #374151; }
  input:focus { border-color: rgba(0,212,255,0.4) !important; box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;
