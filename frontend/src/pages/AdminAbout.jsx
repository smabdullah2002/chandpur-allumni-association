import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlertCircle,
  Award,
  Bold,
  CheckCircle,
  Edit2,
  FileText,
  Info,
  Italic,
  Link,
  Link2,
  List,
  RotateCcw,
  RotateCw,
  Save,
  Star,
  TrendingUp,
  Type,
  Underline,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { trustPoints as defaultTrustPoints } from "../data/siteData";

/* ─── defaults ─────────────────────────────────────────── */
const defaultStats = [
  { value: "100%", label: "Transparent Operations" },
  { value: "24/7", label: "Volunteer Coordination" },
  { value: "1k+", label: "Community Reach" },
];

const defaultAbout = {
  title: "ভূমিকা",
  body: "চাঁদপুর অ্যালামনাই অ্যাসোসিয়েশন একটি ঐক্যবদ্ধ, অরাজনৈতিক ও মানবিক সংগঠন, যেখানে বিভিন্ন প্রজন্মের প্রাক্তন শিক্ষার্থীরা সমাজের কল্যাণে একসাথে কাজ করে। শিক্ষা, মানবিক সহায়তা, সামাজিক উন্নয়ন ও দুর্যোগকালীন সহযোগিতার মাধ্যমে এই প্ল্যাটফর্ম মানুষের পাশে থাকার অঙ্গীকার বহন করে।",
  trustPoints: defaultTrustPoints,
  stats: defaultStats,
};

/* ─── Link Modal ────────────────────────────────────────── */
function LinkModal({ open, onClose, onInsert }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const urlRef = useRef();

  useEffect(() => {
    if (open) {
      setUrl("");
      setText("");
      setTimeout(() => urlRef.current?.focus(), 80);
    }
  }, [open]);

  function handleInsert() {
    onInsert(url.trim(), text.trim());
    onClose();
  }

  return (
    <>
      <style>{`
        .link-overlay{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s;}
        .link-overlay.open{opacity:1;pointer-events:all;}
        .link-modal{background:#fff;border-radius:18px;padding:26px 30px;width:380px;box-shadow:0 24px 64px rgba(0,0,0,.22);display:flex;flex-direction:column;gap:14px;transform:translateY(12px);transition:transform .2s;}
        .link-overlay.open .link-modal{transform:translateY(0);}
        .link-modal h3{font-size:16px;font-weight:800;color:#0f172a;margin:0;}
        .link-modal input{width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid #e8e5f7;font-size:13px;outline:none;font-family:inherit;color:#1a1235;background:#f8f7ff;transition:border-color .2s;}
        .link-modal input:focus{border-color:#3b4fd8;background:#fff;}
        .link-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:4px;}
        .link-cancel{padding:9px 20px;border-radius:9px;border:1.5px solid #e8e5f7;background:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;color:#475569;transition:all .15s;}
        .link-cancel:hover{border-color:#cbd5e1;}
        .link-ok{padding:9px 20px;border-radius:9px;border:none;background:linear-gradient(135deg,#1a1f6e,#3b4fd8);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;}
        .link-ok:hover{opacity:.9;}
      `}</style>
      <div
        className={`link-overlay${open ? " open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="link-modal">
          <h3>Insert Link</h3>
          <input
            placeholder="Display text (optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <input
            ref={urlRef}
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <div className="link-actions">
            <button className="link-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="link-ok" onClick={handleInsert}>
              Insert
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Rich Toolbar ──────────────────────────────────────── */
function RichToolbar({ editorRef, onLinkOpen }) {
  const [activeStates, setActiveStates] = useState({});

  const updateActive = useCallback(() => {
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.addEventListener("mouseup", updateActive);
    el.addEventListener("keyup", updateActive);
    return () => {
      el.removeEventListener("mouseup", updateActive);
      el.removeEventListener("keyup", updateActive);
    };
  }, [editorRef, updateActive]);

  function exec(cmd, val) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? null);
    updateActive();
  }

  const TbBtn = ({ cmd, val, title, children, style = {} }) => (
    <button
      type="button"
      className={`tb-btn${activeStates[cmd] ? " active" : ""}`}
      title={title}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault();
        exec(cmd, val);
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="toolbar">
      {/* Font size */}
      <select
        className="tb-select"
        defaultValue=""
        onChange={(e) => {
          exec("fontSize", e.target.value);
          e.target.value = "";
        }}
        title="Font Size"
      >
        <option value="" disabled>
          Size
        </option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="4">Large</option>
        <option value="5">XL</option>
        <option value="6">XXL</option>
      </select>

      <span className="tb-sep" />

      <TbBtn cmd="bold" title="Bold">
        <b>B</b>
      </TbBtn>
      <TbBtn cmd="italic" title="Italic">
        <i>I</i>
      </TbBtn>
      <TbBtn cmd="underline" title="Underline">
        <u>U</u>
      </TbBtn>
      <TbBtn cmd="strikeThrough" title="Strikethrough">
        <s>S</s>
      </TbBtn>

      <span className="tb-sep" />

      {/* Highlight */}
      <button
        type="button"
        className="tb-btn"
        title="Highlight"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("hiliteColor", "#fef08a");
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 3L5 7l10 10 4-4L9 3z" />
          <line x1="5" y1="21" x2="19" y2="21" />
        </svg>
      </button>

      {/* Text color */}
      <label className="color-btn" title="Text Color">
        <Type size={12} style={{ marginBottom: 2 }} />
        <input
          type="color"
          defaultValue="#1a1235"
          onChange={(e) => exec("foreColor", e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
        />
      </label>

      {/* BG color */}
      <label
        className="color-btn"
        title="Background Color"
        style={{ background: "#fef08a33" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
        </svg>
        <input
          type="color"
          defaultValue="#fef08a"
          onChange={(e) => exec("hiliteColor", e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
        />
      </label>

      <span className="tb-sep" />

      <TbBtn cmd="justifyLeft" title="Align Left">
        <AlignLeft size={13} />
      </TbBtn>
      <TbBtn cmd="justifyCenter" title="Align Center">
        <AlignCenter size={13} />
      </TbBtn>
      <TbBtn cmd="justifyRight" title="Align Right">
        <AlignRight size={13} />
      </TbBtn>

      <span className="tb-sep" />

      <TbBtn cmd="insertUnorderedList" title="Bullet List">
        <List size={13} />
      </TbBtn>
      <TbBtn cmd="insertOrderedList" title="Numbered List">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="10" y1="6" x2="21" y2="6" />
          <line x1="10" y1="12" x2="21" y2="12" />
          <line x1="10" y1="18" x2="21" y2="18" />
          <text
            x="1"
            y="8"
            fontSize="7"
            fill="currentColor"
            stroke="none"
            fontWeight="bold"
          >
            1.
          </text>
          <text
            x="1"
            y="14"
            fontSize="7"
            fill="currentColor"
            stroke="none"
            fontWeight="bold"
          >
            2.
          </text>
          <text
            x="1"
            y="20"
            fontSize="7"
            fill="currentColor"
            stroke="none"
            fontWeight="bold"
          >
            3.
          </text>
        </svg>
      </TbBtn>

      <span className="tb-sep" />

      <button
        type="button"
        className="tb-btn"
        title="Insert Link"
        onMouseDown={(e) => {
          e.preventDefault();
          onLinkOpen();
        }}
      >
        <Link size={13} />
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Remove Link"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("unlink");
        }}
      >
        <Link2 size={13} />
      </button>

      <span className="tb-sep" />

      <button
        type="button"
        className="tb-btn"
        title="Clear Formatting"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("removeFormat");
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Undo"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("undo");
        }}
      >
        <RotateCcw size={13} />
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Redo"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("redo");
        }}
      >
        <RotateCw size={13} />
      </button>
    </div>
  );
}

/* ─── Mini Toolbar (Trust Points) ───────────────────────── */
function MiniToolbar({ editorRef }) {
  function exec(cmd, val) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? null);
  }

  return (
    <div className="toolbar">
      <select
        className="tb-select"
        defaultValue=""
        onChange={(e) => {
          exec("fontSize", e.target.value);
          e.target.value = "";
        }}
      >
        <option value="" disabled>
          Size
        </option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="4">Large</option>
        <option value="5">XL</option>
      </select>
      <span className="tb-sep" />
      <button
        type="button"
        className="tb-btn"
        title="Bold"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("bold");
        }}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Italic"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("italic");
        }}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Underline"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("underline");
        }}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Strikethrough"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("strikeThrough");
        }}
      >
        <s>S</s>
      </button>
      <span className="tb-sep" />
      <label className="color-btn" title="Text Color">
        <Type size={12} />
        <input
          type="color"
          defaultValue="#475569"
          onChange={(e) => exec("foreColor", e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
        />
      </label>
      <label className="color-btn" title="Highlight">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M9 3L5 7l10 10 4-4L9 3z" />
          <line x1="5" y1="21" x2="19" y2="21" />
        </svg>
        <input
          type="color"
          defaultValue="#fef08a"
          onChange={(e) => exec("hiliteColor", e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
        />
      </label>
      <span className="tb-sep" />
      <button
        type="button"
        className="tb-btn"
        title="Clear Formatting"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("removeFormat");
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      </button>
      <button
        type="button"
        className="tb-btn"
        title="Undo"
        onMouseDown={(e) => {
          e.preventDefault();
          exec("undo");
        }}
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function AdminAbout() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Form state
  const [title, setTitle] = useState(defaultAbout.title);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

  // Rich editor refs
  const bodyRef = useRef(null);
  const trustRef = useRef(null);
  const membersRef = useRef(null);
  const committeeRef = useRef(null);
  const savedRangeRef = useRef(null);

  // Trust preview
  const [trustLines, setTrustLines] = useState([]);

  // Link modal
  const [linkOpen, setLinkOpen] = useState(false);

  // Simple list editors for trust points, members and committee
  const [trustItems, setTrustItems] = useState([]);
  const [newTrustItem, setNewTrustItem] = useState("");

  const [membersList, setMembersList] = useState([]);
  const [newMember, setNewMember] = useState("");

  const [committeeList, setCommitteeList] = useState([]);
  const [newCommittee, setNewCommittee] = useState("");

  /* ── fetch on mount ── */
  useEffect(() => {
    fetchAbout();
  }, []);

  async function fetchAbout() {
    try {
      setStatus("loading");
      const res = await fetch(`${apiBaseUrl}/api/admin/about`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json"))
        throw new Error("Unexpected response from server");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to load about content");
      if (data.about) {
        setTitle(data.about.title || defaultAbout.title);
        if (bodyRef.current)
          bodyRef.current.innerHTML = data.about.body || defaultAbout.body;

        // trustPoints is stored as an array on the server
        setTrustItems(data.about.trustPoints || defaultAbout.trustPoints);

        // members and committee may be HTML; convert to plain lines for simple editors
        const htmlToLines = (html) => {
          try {
            const div = document.createElement("div");
            div.innerHTML = html || "";
            return div.innerText.split(/\n|\r|\u2028/).map((l) => l.trim()).filter(Boolean);
          } catch (err) {
            return [];
          }
        };

        setMembersList(htmlToLines(data.about.members || ""));
        setCommitteeList(htmlToLines(data.about.committee || ""));
      }
      setError("");
      setStatus("idle");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  /* ── init editors with defaults ── */
  useEffect(() => {
    if (bodyRef.current && !bodyRef.current.innerHTML)
      bodyRef.current.innerHTML = defaultAbout.body;

    // if no trust items yet, seed defaults
    if (!trustItems || trustItems.length === 0) setTrustItems(defaultAbout.trustPoints);

    // if members/committee empty, keep as empty arrays
    updateCharCount();
  }, []);

  function updateCharCount() {
    setCharCount(bodyRef.current?.innerText?.length ?? 0);
  }

  // helper to turn a list into server-friendly HTML (lines separated by <br/>)
  function listToHtml(lines) {
    return (lines || []).map((l) => l.trim()).filter(Boolean).join("<br/>");
  }

  // list manipulation helpers for the simple editors
  function addTrustItem() {
    const v = (newTrustItem || "").trim();
    if (!v) return;
    setTrustItems((s) => [...s, v]);
    setNewTrustItem("");
  }
  function removeTrustItem(idx) {
    setTrustItems((s) => s.filter((_, i) => i !== idx));
  }

  function addMember() {
    const v = (newMember || "").trim();
    if (!v) return;
    setMembersList((s) => [...s, v]);
    setNewMember("");
  }
  function removeMember(idx) {
    setMembersList((s) => s.filter((_, i) => i !== idx));
  }

  function addCommittee() {
    const v = (newCommittee || "").trim();
    if (!v) return;
    setCommitteeList((s) => [...s, v]);
    setNewCommittee("");
  }
  function removeCommittee(idx) {
    setCommitteeList((s) => s.filter((_, i) => i !== idx));
  }

  /* (stats editing removed per request) */

  /* ── link modal ── */
  function openLinkModal() {
    const sel = window.getSelection();
    if (sel?.rangeCount) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    setLinkOpen(true);
  }

  function insertLink(url, text) {
    if (!url) return;
    const editor = bodyRef.current;
    if (!editor) return;
    editor.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    if (text && savedRangeRef.current?.collapsed) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
      );
    } else {
      document.execCommand("createLink", false, url);
      // open in new tab
      const links = editor.querySelectorAll(`a[href="${url}"]`);
      links.forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    }
  }

  /* ── save ── */
  async function handleSave(e) {
    e.preventDefault();
    try {
      setStatus("saving");
      setError("");
      const payload = {
        title,
        body: bodyRef.current?.innerHTML || "",
        trustPoints: trustItems.length ? trustItems : [],
        members: membersList.length ? listToHtml(membersList) : membersRef.current?.innerHTML || "",
        committee: committeeList.length ? listToHtml(committeeList) : committeeRef.current?.innerHTML || "",
      };
      const res = await fetch(`${apiBaseUrl}/api/admin/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json"))
        throw new Error("Unexpected response from server");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setTitle(data.about.title);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  const isSaving = status === "saving";
  const isSaved = status === "saved";
  const isLoading = status === "loading";

  /* ── styles ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
    .aa-root * { font-family: 'Plus Jakarta Sans','Segoe UI',sans-serif; box-sizing: border-box; }
    .rich-area { font-family: 'Hind Siliguri','Plus Jakarta Sans',sans-serif !important; }

    /* Hero */
    .aa-hero {
      background: linear-gradient(135deg,#1a1f6e 0%,#2d3282 40%,#3b4fd8 100%);
      border-radius: 24px; padding: 36px 44px;
      position: relative; overflow: hidden;
      box-shadow: 0 20px 60px rgba(45,50,130,.35);
    }
    .aa-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; background:rgba(255,255,255,.06); border-radius:50%; }
    .aa-hero::after  { content:''; position:absolute; bottom:-60px; right:140px; width:150px; height:150px; background:rgba(255,255,255,.04); border-radius:50%; }

    /* Cards */
    .section-card { background:#fff; border-radius:20px; border:1.5px solid #f1f5f9; box-shadow:0 2px 16px rgba(0,0,0,.05); overflow:hidden; }
    .card-header { padding:20px 28px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:14px; }
    .card-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
    .card-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; }

    /* Field */
    .field-label { display:block; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#94a3b8; margin-bottom:7px; }
    .field-input {
      width:100%; padding:13px 15px; border-radius:12px;
      border:1.5px solid #e8e5f7; background:#f8f7ff;
      font-size:14px; color:#1a1235;
      font-family:'Plus Jakarta Sans',sans-serif; outline:none;
      transition:border-color .2s,box-shadow .2s; resize:vertical;
    }
    .field-input:focus { border-color:#3b4fd8; box-shadow:0 0 0 3px rgba(59,79,216,.10); background:#fff; }
    .field-input::placeholder { color:#b0aac8; }

    /* Rich editor wrapper */
    .editor-wrap {
      border:1.5px solid #e8e5f7; border-radius:14px; overflow:hidden;
      background:#f8f7ff; transition:border-color .2s,box-shadow .2s;
    }
    .editor-wrap:focus-within { border-color:#3b4fd8; box-shadow:0 0 0 3px rgba(59,79,216,.10); background:#fff; }

    /* Toolbar */
    .toolbar {
      display:flex; align-items:center; flex-wrap:wrap; gap:2px;
      padding:8px 10px; background:#fff; border-bottom:1px solid #eee8ff;
    }
    .tb-sep { width:1px; height:22px; background:#e2dff5; margin:0 4px; flex-shrink:0; }
    .tb-btn {
      display:inline-flex; align-items:center; justify-content:center;
      width:30px; height:30px; border-radius:7px; border:none; background:transparent;
      color:#475569; font-size:13px; font-weight:700; cursor:pointer;
      transition:all .15s; font-family:'Plus Jakarta Sans',sans-serif;
      position:relative; padding:0;
    }
    .tb-btn:hover { background:#eef1ff; color:#3b4fd8; }
    .tb-btn.active { background:#3b4fd8; color:#fff; }
    .tb-select {
      height:30px; border-radius:7px; border:1.5px solid #e8e5f7; background:#f8f7ff;
      font-size:12px; font-weight:600; color:#475569; padding:0 6px; cursor:pointer; outline:none;
      font-family:'Plus Jakarta Sans',sans-serif; transition:border-color .15s;
    }
    .tb-select:hover { border-color:#3b4fd8; }

    /* Color picker button */
    .color-btn {
      display:inline-flex; align-items:center; justify-content:center; gap:1px; flex-direction:column;
      width:30px; height:30px; border-radius:7px; cursor:pointer;
      color:#475569; font-size:11px; position:relative;
      transition:background .15s; background:transparent;
    }
    .color-btn:hover { background:#eef1ff; color:#3b4fd8; }

    /* ContentEditable area */
    .rich-area {
      min-height:120px; padding:14px 16px; outline:none;
      font-size:14px; line-height:1.65; color:#1a1235; background:transparent;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .rich-area:empty::before { content:attr(data-placeholder); color:#b0aac8; pointer-events:none; }
    .rich-area a { color:#3b4fd8; text-decoration:underline; }
    .char-row { display:flex; justify-content:flex-end; font-size:11px; color:#b0aac8; padding:4px 12px 8px; }

    /* Trust preview */
    .trust-preview { display:flex; flex-direction:column; gap:6px; }
    .trust-item { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#475569; }

    /* Stats preview */
    .preview-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
    .preview-stat { background:#f8f7ff; border:1.5px solid #e8e5f7; border-radius:12px; padding:14px 16px; }
    .hint-row { display:flex; align-items:center; gap:6px; font-size:12px; color:#94a3b8; }

    /* Save button */
    .save-btn {
      display:inline-flex; align-items:center; gap:9px;
      padding:14px 32px; border-radius:13px; border:none;
      background:linear-gradient(135deg,#1a1f6e 0%,#3b4fd8 100%);
      color:#fff; font-size:14px; font-weight:800; cursor:pointer;
      box-shadow:0 6px 24px rgba(45,50,130,.35); transition:all .22s;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .save-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(45,50,130,.45); }
    .save-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
    .save-btn.saved { background:linear-gradient(135deg,#059669 0%,#10b981 100%); box-shadow:0 6px 24px rgba(16,185,129,.35); }

    /* Error / loading */
    .error-banner {
      background:#fef2f2; border:1.5px solid #fca5a5; border-radius:12px;
      padding:12px 18px; font-size:13px; color:#dc2626; display:flex; align-items:center; gap:8px;
    }
    .loading-card { padding:48px 20px; text-align:center; color:#94a3b8; font-size:14px; }

    /* Tooltip */
    .tb-btn[title]:hover::after {
      content:attr(title);
      position:absolute; bottom:-26px; left:50%; transform:translateX(-50%);
      background:#1a1235; color:#fff; font-size:10px; font-weight:600;
      padding:3px 7px; border-radius:5px; white-space:nowrap; z-index:10;
      pointer-events:none;
    }

    @media(max-width:640px){
      .aa-hero { padding:24px 20px; }
      .preview-grid { grid-template-columns:1fr 1fr; }
    }
  `;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f0f4ff 0%,#fafafa 50%,#f5f0ff 100%)",
        fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      }}
    >
      <style>{css}</style>

      <LinkModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onInsert={insertLink}
      />

      <div
        className="aa-root"
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Hero */}
        <div className="aa-hero">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Edit2 style={{ color: "#a5b4fc", fontSize: 15 }} />
              <span
                style={{
                  color: "#a5b4fc",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                Admin Panel
              </span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 4px",
              }}
            >
              About Us Content
            </h1>
            <p
              style={{ color: "rgba(255,255,255,.6)", fontSize: 14, margin: 0 }}
            >
              Update the About Us section shown to all visitors.
            </p>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/admin/executive')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Manage Executive Committee
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <AlertCircle style={{ fontSize: 15, flexShrink: 0 }} />
            {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: 14,
                padding: 0,
              }}
            >
              <X />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="section-card">
            <div className="loading-card">Loading content…</div>
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* ── Main Content ── */}
            <div className="section-card">
              <div className="card-header">
                <div
                  className="card-icon"
                  style={{ background: "#eef1ff", color: "#3b4fd8" }}
                >
                  <FileText />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "0 0 2px",
                    }}
                  >
                    Main Content
                  </p>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                    Section heading and body paragraph — with rich text
                    formatting
                  </p>
                </div>
              </div>
              <div className="card-body">
                {/* Title */}
                <div>
                  <label className="field-label">Section Title</label>
                  <input
                    className="field-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ভূমিকা"
                    style={{ display: "block" }}
                  />
                </div>

                {/* Body rich editor */}
                <div>
                  <label className="field-label">Body Text</label>
                  <div className="editor-wrap">
                    <RichToolbar
                      editorRef={bodyRef}
                      onLinkOpen={openLinkModal}
                    />
                    <div
                      ref={bodyRef}
                      className="rich-area"
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="Enter the about us description…"
                      onInput={updateCharCount}
                    />
                    <div className="char-row">{charCount} chars</div>
                  </div>
                </div>
              </div>
            </div>

         

           

            {/* ── Save ── */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className={`save-btn${isSaved ? " saved" : ""}`}
                disabled={isSaving}
              >
                {isSaved ? (
                  <>
                    <CheckCircle style={{ fontSize: 15 }} /> Saved!
                  </>
                ) : isSaving ? (
                  "Saving…"
                ) : (
                  <>
                    <Save style={{ fontSize: 15 }} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
