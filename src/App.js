import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  :root {
    --bg: #152540;
    --surface: #1a2e4a;
    --surface2: #112036;
    --border: #243d5e;
    --accent: #4d8ef0;
    --accent2: #1e429f;
    --success: #2ecc8a;
    --warning: #f0b429;
    --danger: #e05252;
    --text: #ffffff;
    --muted: #9db8d4;
    --sidebar-bg: #0f1c3f;
    --sidebar-text: #c9d3e8;
    --sidebar-active: #1a56db;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Libre Baskerville',Georgia,serif; }
  h1,h2,h3 { font-family:'Playfair Display',serif; }
  input,textarea,select { background:var(--surface2); border:1px solid var(--border); color:var(--text); padding:10px 14px; border-radius:6px; font-size:14px; width:100%; outline:none; font-family:'Libre Baskerville',Georgia,serif; box-shadow:0 1px 2px rgba(0,0,0,.1); }
  input:focus,textarea:focus,select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
  button { cursor:pointer; font-family:'Libre Baskerville',Georgia,serif; border:none; border-radius:6px; font-size:14px; font-weight:700; transition:all .15s; letter-spacing:.01em; }
  .btn-primary { background:var(--accent); color:#fff; padding:10px 20px; box-shadow:0 1px 3px rgba(26,86,219,.3); }
  .btn-primary:hover { background:#1648c5; box-shadow:0 2px 6px rgba(26,86,219,.4); }
  .btn-secondary { background:var(--surface2); color:var(--text); padding:10px 20px; border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,.1); }
  .btn-secondary:hover { border-color:var(--accent); color:var(--accent); }
  .btn-danger { background:var(--danger); color:#fff; padding:8px 16px; }
  .btn-sm { padding:6px 14px; font-size:13px; }
  label { font-size:12px; color:var(--muted); display:block; margin-bottom:5px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
  .form-group { margin-bottom:16px; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .badge { display:inline-block; padding:3px 10px; border-radius:4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
  .badge-blue { background:#e1effe; color:#1a56db; }
  .badge-green { background:#def7ec; color:#057a55; }
  .badge-yellow { background:#fdf6b2; color:#92400e; }
  .badge-red { background:#fde8e8; color:#c81e1e; }
  .badge-purple { background:#edebfe; color:#5521b5; }
  .badge-accent { background:#e1effe; color:#1a56db; }
  .badge-warning { background:#fdf6b2; color:#92400e; }
  .tag { display:inline-block; background:#e1effe; color:#1a56db; padding:2px 8px; border-radius:4px; font-size:11px; margin:2px; font-weight:600; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:var(--bg); }
  ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
  .overlay { position:fixed; inset:0; background:rgba(15,28,63,.5); z-index:100; display:flex; align-items:center; justify-content:center; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:32px; width:90%; max-width:540px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.4); }
  .toast { position:fixed; bottom:24px; right:24px; background:var(--sidebar-bg); color:#fff; border-radius:8px; padding:14px 20px; z-index:999; font-size:14px; animation:slideIn .2s ease; box-shadow:0 8px 24px rgba(0,0,0,.2); }
  @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .sidebar { width:240px; min-height:100vh; background:var(--sidebar-bg); display:flex; flex-direction:column; position:fixed; top:0; left:0; z-index:50; box-shadow:2px 0 12px rgba(0,0,0,.15); font-family:'Source Sans 3',system-ui,sans-serif; }
  .main { margin-left:240px; min-height:100vh; background:linear-gradient(to right, #0f1c3f 0%, #152540 20%, #1a2e4a 60%, #1e3350 100%); padding-top:52px; }
  .topbar { position:fixed; top:0; left:240px; right:0; height:52px; background:var(--sidebar-bg); border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:flex-end; padding:0 20px; gap:4px; z-index:49; }
  .topbar-btn { background:none; border:none; color:var(--sidebar-text); cursor:pointer; padding:7px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:background .15s; }
  .topbar-btn:hover { background:rgba(255,255,255,.1); color:#fff; }
  .ws-toolbar { display:flex; align-items:center; gap:8px; padding:10px 28px; border-bottom:1px solid var(--border); background:var(--surface2); flex-wrap:wrap; }
  .ws-toolbar-btn { display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:6px; background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; font-family:'Libre Baskerville',Georgia,serif; transition:all .15s; }
  .ws-toolbar-btn:hover { background:rgba(255,255,255,.07); color:var(--text); }
  .nav-item { display:flex; align-items:center; gap:12px; padding:10px 20px; cursor:pointer; font-size:14px; color:var(--sidebar-text); transition:all .15s; border-left:3px solid transparent; font-weight:500; }
  .nav-item:hover { background:rgba(255,255,255,.07); color:#fff; }
  .nav-item.active { background:rgba(26,86,219,.25); color:#fff; border-left-color:var(--sidebar-active); }
  .header { padding:20px 32px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--surface); box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,.06); border-top:3px solid var(--accent); }
  .table { width:100%; border-collapse:collapse; }
  .table th { text-align:left; padding:12px 16px; font-size:11px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.08em; border-bottom:2px solid var(--border); background:var(--surface2); color:#9db8d4; }
  .table td { padding:13px 16px; border-bottom:1px solid var(--border); font-size:14px; }
  .table tr:hover td { background:rgba(255,255,255,.05); }
  .drawer { position:fixed; top:0; right:0; width:440px; height:100vh; background:var(--surface); border-left:1px solid var(--border); z-index:200; overflow-y:auto; transform:translateX(100%); transition:transform .25s ease; box-shadow:-4px 0 20px rgba(0,0,0,.08); }
  .drawer.open { transform:translateX(0); }
  .kanban-col { background:var(--surface2); border:1px solid var(--border); border-radius:8px; min-width:250px; max-width:250px; }
  .kanban-card { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:14px; margin:8px; cursor:pointer; transition:all .15s; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .kanban-card:hover { border-color:var(--accent); box-shadow:0 4px 12px rgba(26,86,219,.1); transform:translateY(-1px); }
  @media(max-width:768px) {
    .sidebar { width:60px; }
    .sidebar .nav-label, .sidebar .brand-name { display:none; }
    .main { margin-left:60px; }
    .drawer { width:100vw; }
  }
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-left:1px solid var(--border); border-top:1px solid var(--border); }
  .cal-cell { border-right:1px solid var(--border); border-bottom:1px solid var(--border); min-height:110px; padding:6px; cursor:pointer; transition:background .1s; position:relative; }
  .cal-cell:hover { background:rgba(77,142,240,.06); }
  .cal-cell.today { background:rgba(77,142,240,.08); }
  .cal-cell.other-month { opacity:.38; }
  .cal-cell.weekend { background:rgba(0,0,0,.06); }
  .cal-day-num { font-size:13px; font-weight:600; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-bottom:4px; flex-shrink:0; }
  .cal-cell.today .cal-day-num { background:var(--accent); color:#fff; }
  .cal-event-pill { font-size:11px; padding:2px 7px; border-radius:3px; margin-bottom:2px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; transition:opacity .1s; display:block; }
  .cal-event-pill:hover { opacity:.75; }
  .cal-header-day { text-align:center; padding:10px 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); border-right:1px solid var(--border); border-bottom:2px solid var(--border); }
  .event-type-btn { padding:7px 14px; border-radius:6px; border:1px solid var(--border); background:var(--surface2); color:var(--muted); font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; }
  .event-type-btn.active { border-color:var(--accent); background:rgba(77,142,240,.15); color:var(--accent); }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGES = ['New Lead','Contacted','Qualified','Proposal','Negotiation','Converted','Non-Conversion'];
const dueDateStatus = (dateStr) => {
  if(!dateStr) return null;
  const d = new Date(dateStr); const now = new Date(); now.setHours(0,0,0,0);
  const diff = Math.ceil((d-now)/(1000*60*60*24));
  if(diff < 0) return { label:'Overdue', color:'#e05252', bg:'rgba(224,82,82,.12)', days: Math.abs(diff) };
  if(diff <= 7) return { label:'Due soon', color:'#f0b429', bg:'rgba(240,180,41,.12)', days: diff };
  return { label:'On track', color:'#2ecc8a', bg:'transparent', days: diff };
};
const STAGE_COLORS = { 'New Lead':'blue','Contacted':'purple','Qualified':'yellow','Proposal':'accent','Negotiation':'warning','Converted':'green','Non-Conversion':'red' };
const SOURCES = ['Website','Referral','Cold Outreach','LinkedIn','Event','Other'];
const INDUSTRIES = ['Technology','Healthcare','Finance','Real Estate','Retail','Manufacturing','Other'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
const initials = (name='') => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const avatarColor = (name='') => { const colors=['#3b82f6','#06b6d4','#10b981','#8b5cf6','#f59e0b','#ef4444']; return colors[name.charCodeAt(0)%colors.length]; };

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastTimer;
function Toast({ msg, onClose }) {
  useEffect(() => { toastTimer = setTimeout(onClose, 3000); return () => clearTimeout(toastTimer); }, [onClose]);
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', company:'', email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleLogin = async () => {
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
    if (error) setErr(error.message);
    setLoading(false);
  };

  const handleReset = async () => {
    if (!resetEmail) { setErr('Please enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin
    });
    if (error) { setErr(error.message); } else { setResetSent(true); }
    setLoading(false);
  };

  const handleSignup = async () => {
    setErr(''); setLoading(true);
    if (!form.name || !form.company || !form.email || !form.password) { setErr('All fields required'); setLoading(false); return; }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.name, company_name: form.company } }
      });
      if (error) { setErr(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.name,
          company_name: form.company,
          role: 'admin'
        }, { onConflict: 'id' });
      }
    } catch(e) {
      setErr('Signup failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #0f1c3f 0%, #1a3a6e 100%)' }}>
      <div style={{ width:'100%', maxWidth:420, padding:20 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="https://www.citizensfinancial.co/wp-content/uploads/2026/01/Logo-01.png" alt="Citizens Financial" style={{ maxHeight:70, maxWidth:220, marginBottom:12, filter:'brightness(0) invert(1)' }} />
          <div style={{ color:'#fff', fontSize:18, fontWeight:700, marginTop:8, fontFamily:'Playfair Display,serif' }}>Citizens Client Hub</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:11, marginTop:6, letterSpacing:'.04em' }}>Powered by the Badges Broker</div>
        </div>
        <div className="card">
          <div style={{ display:'flex', gap:8, marginBottom:24 }}>
            {['login','signup'].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--border)', background: tab===t?'var(--accent)':'var(--surface2)', color: tab===t?'#fff':'var(--muted)', fontWeight:600, cursor:'pointer' }}>
                {t==='login'?'Sign In':'Create Account'}
              </button>
            ))}
          </div>
          {tab==='signup' && <>
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jane Smith" /></div>
            <div className="form-group"><label>Company Name</label><input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Acme Corp" /></div>
          </>}
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&(tab==='login'?handleLogin():handleSignup())} /></div>
          {showReset ? (
            <div>
              {resetSent ? (
                <div style={{ textAlign:'center', padding:'10px 0' }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>📧</div>
                  <div style={{ fontWeight:600, marginBottom:4 }}>Check your email</div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>We sent a password reset link to {resetEmail}</div>
                  <button onClick={()=>{ setShowReset(false); setResetSent(false); }} style={{ marginTop:16, background:'none', color:'var(--accent)', border:'none', cursor:'pointer', fontSize:13 }}>Back to Sign In</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight:600, marginBottom:16 }}>Reset Password</div>
                  <div className="form-group"><label>Email</label><input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="you@company.com" /></div>
                  {err && <div style={{ color:'var(--danger)', fontSize:13, marginBottom:12 }}>{err}</div>}
                  <button className="btn-primary" style={{ width:'100%', marginBottom:10 }} onClick={handleReset} disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                  <button onClick={()=>setShowReset(false)} style={{ width:'100%', background:'none', color:'var(--muted)', border:'none', cursor:'pointer', fontSize:13 }}>Back to Sign In</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {err && <div style={{ color:'var(--danger)', fontSize:13, marginBottom:12 }}>{err}</div>}
              <button className="btn-primary" style={{ width:'100%' }} onClick={tab==='login'?handleLogin:handleSignup} disabled={loading}>
                {loading ? 'Please wait...' : tab==='login' ? 'Sign In' : 'Create Account'}
              </button>
              {tab==='login' && <div style={{ textAlign:'center', marginTop:14 }}><button onClick={()=>{ setShowReset(true); setErr(''); }} style={{ background:'none', color:'var(--muted)', border:'none', cursor:'pointer', fontSize:13 }}>Forgot password?</button></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function ContactForm({ contact, onSave, onClose, companyId }) {
  const blank = { full_name:'', email:'', phone:'', company:'', title:'', deal_value:'', stage:'New Lead', source:'Website', industry:'Technology', tags:'', notes:'' };
  const [form, setForm] = useState(contact ? {...contact, tags:(contact.tags||[]).join(',')} : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    const payload = { ...form, deal_value: parseFloat(form.deal_value)||0, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [], company_id: companyId };
    if (contact?.id) { await supabase.from('contacts').update(payload).eq('id', contact.id); }
    else { await supabase.from('contacts').insert([payload]); }
    onSave();
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700 }}>{contact ? 'Edit Contact' : 'New Contact'}</h2>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20 }}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['full_name','Full Name','text'],['email','Email','email'],['phone','Phone','text'],['company','Company','text'],['title','Title','text'],['deal_value','Deal Value ($)','number']].map(([k,l,t])=>(
            <div className="form-group" key={k}><label>{l}</label><input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} /></div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          <div className="form-group"><label>Stage</label><select value={form.stage} onChange={e=>set('stage',e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Source</label><select value={form.source} onChange={e=>set('source',e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Industry</label><select value={form.industry} onChange={e=>set('industry',e.target.value)}>{INDUSTRIES.map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Tags (comma separated)</label><input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="hot lead, Q1, enterprise" /></div>
        <div className="form-group"><label>Notes</label><textarea rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save Contact</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT DRAWER ───────────────────────────────────────────────────────────
function ContactDrawer({ contact, onClose, onEdit, onDelete, companyId, toast }) {
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!contact) return;
    supabase.from('activities').select('*').eq('contact_id', contact.id).order('created_at', { ascending:false }).then(({ data }) => setActivities(data||[]));
  }, [contact]);

  const addActivity = async () => {
    if (!note.trim()) return;
    await supabase.from('activities').insert([{ contact_id:contact.id, company_id:companyId, type:noteType, body:note }]);
    setNote(''); setActivities(a=>[{type:noteType, body:note, created_at:new Date().toISOString()}, ...a]);
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) { toast('Please enter subject and message'); return; }
    if (!contact.email) { toast('Contact has no email address'); return; }
    setSendingEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(process.env.REACT_APP_SUPABASE_URL + '/functions/v1/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.REACT_APP_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ to: contact.email, subject: emailSubject, body: emailBody })
      });
      const data = await res.json();
      if (data.id) {
        const activityBody = 'Subject: ' + emailSubject + '\n\n' + emailBody;
        await supabase.from('activities').insert([{ contact_id:contact.id, company_id:companyId, type:'email', body:activityBody }]);
        setActivities(a=>[{type:'email', body:activityBody, created_at:new Date().toISOString()}, ...a]);
        setEmailSubject(''); setEmailBody('');
        toast('Email sent successfully!');
      } else { toast('Error: ' + (data.message||'Unknown error')); }
    } catch(e) { toast('Error: ' + e.message); }
    setSendingEmail(false);
  };

  const launchAICall = async () => {
    if (!contact.phone) { toast('Contact has no phone number'); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(process.env.REACT_APP_SUPABASE_URL + '/functions/v1/retell-call', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.REACT_APP_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ 
          to_number: contact.phone, 
          agent_id: 'agent_e379614ced2c13a6de7532b2ba',
          contact_name: contact.full_name,
          context: contact.notes || ''
        })
      });
      const data = await res.json();
      if (data.call_id) {
        await supabase.from('activities').insert([{ contact_id:contact.id, company_id:companyId, type:'call', body:'AI call launched to ' + contact.phone }]);
        setActivities(a=>[{type:'call', body:'AI call launched to ' + contact.phone, created_at:new Date().toISOString()}, ...a]);
        toast('AI call launched successfully!');
      } else { toast('Error: ' + (data.message || JSON.stringify(data))); }
    } catch(e) { toast('Error: ' + e.message); }
  };

  const changeStage = async (stage) => {
    await supabase.from('contacts').update({ stage }).eq('id', contact.id);
    contact.stage = stage;
    await supabase.from('activities').insert([{ contact_id:contact.id, company_id:companyId, type:'stage', body:`Stage changed to ${stage}` }]);
    setActivities(a=>[{type:'stage', body:`Stage changed to ${stage}`, created_at:new Date().toISOString()}, ...a]);
  };

  if (!contact) return null;
  return (
    <div className={`drawer ${contact ? 'open' : ''}`}>
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:avatarColor(contact.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, fontFamily:'Syne,sans-serif' }}>{initials(contact.full_name)}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:18, fontFamily:'Playfair Display,serif' }}>{contact.full_name}</div>
              <div style={{ color:'var(--muted)', fontSize:13 }}>{contact.title} {contact.company && `@ ${contact.company}`}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20 }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          <button className="btn-secondary btn-sm" onClick={onEdit}>✏️ Edit</button>
          <button className="btn-danger btn-sm" onClick={onDelete}>🗑️ Delete</button>
          <button className="btn-sm" onClick={launchAICall} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none' }}>🤖 AI Call</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[['📧','Email',contact.email],['📞','Phone',contact.phone],['💰','Deal Value',contact.deal_value?fmt(contact.deal_value):'—'],['🏭','Industry',contact.industry],['📌','Source',contact.source]].map(([icon,label,val])=>val&&(
            <div key={label} style={{ background:'var(--surface2)', borderRadius:8, padding:10 }}>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:2 }}>{icon} {label}</div>
              <div style={{ fontSize:13, fontWeight:500 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Stage</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {STAGES.map(s=>(
              <button key={s} onClick={()=>changeStage(s)} style={{ padding:'5px 12px', borderRadius:20, fontSize:12, border:'1px solid', borderColor:contact.stage===s?'var(--accent)':'var(--border)', background:contact.stage===s?'rgba(59,130,246,.2)':'transparent', color:contact.stage===s?'var(--accent)':'var(--muted)', cursor:'pointer' }}>{s}</button>
            ))}
          </div>
        </div>

        {contact.tags?.length > 0 && <div style={{ marginBottom:20 }}>{contact.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>}
        {contact.notes && <div style={{ background:'var(--surface2)', borderRadius:8, padding:12, marginBottom:20, fontSize:13, lineHeight:1.6, color:'var(--muted)' }}>{contact.notes}</div>}

        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            {['note','call','email'].map(t=>(
              <button key={t} onClick={()=>setNoteType(t)} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, border:'1px solid', borderColor:noteType===t?'var(--accent)':'var(--border)', background:noteType===t?'rgba(59,130,246,.2)':'transparent', color:noteType===t?'var(--accent)':'var(--muted)', cursor:'pointer' }}>{t==='note'?'📝 Note':t==='call'?'📞 Call':'📧 Email'}</button>
            ))}
          </div>
          {noteType==='email' ? (
            <div>
              <input value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} placeholder="Subject..." style={{ marginBottom:8 }} />
              <textarea rows={4} value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="Write your email..." style={{ marginBottom:8 }} />
              <button className="btn-primary btn-sm" onClick={sendEmail} disabled={sendingEmail}>{sendingEmail?'Sending...':'📧 Send Email'}</button>
            </div>
          ) : (
            <div>
              <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note..." style={{ marginBottom:8 }} />
              <button className="btn-primary btn-sm" onClick={addActivity}>Add</button>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Activity</div>
          {activities.map((a,i)=>(
            <div key={i} style={{ display:'flex', gap:10, marginBottom:12 }}>
              <div style={{ fontSize:16, marginTop:2 }}>{a.type==='call'?'📞':a.type==='email'?'📧':a.type==='stage'?'🔄':'📝'}</div>
              <div style={{ flex:1 }}>
                {a.type==='email' ? (
                  <div style={{ background:'var(--surface2)', borderRadius:8, padding:10 }}>
                    {a.body.split('\n\n').map((part, pi) => (
                      <div key={pi} style={{ fontSize:13, marginBottom: pi===0?6:0, fontWeight: pi===0?600:400, color: pi===0?'var(--text)':'var(--muted)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{part}</div>
                    ))}
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:13 }}>{a.body}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {activities.length===0 && <div style={{ color:'var(--muted)', fontSize:13 }}>No activity yet</div>}
        </div>
      </div>
    </div>
  );
}


// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar({ profile, onSearch, searchOpen, setSearchOpen, onNavigate, onLogout, onGetResults }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifsRead, setNotifsRead] = useState(false);

  React.useEffect(()=>{
    if(!profile?.full_name) return;
    // Load updates that @mention this user
    supabase.from('workspace_updates').select('*')
      .ilike('body', '%@'+profile.full_name+'%')
      .order('created_at',{ascending:false}).limit(20)
      .then(({data})=>{ if(data) setNotifications(data); });
    // Real-time subscription for new mentions
    const sub = supabase.channel('notifs').on('postgres_changes',{event:'INSERT',schema:'public',table:'workspace_updates'},
      (payload)=>{ if(payload.new?.body?.includes('@'+profile.full_name)) { setNotifications(n=>[payload.new,...n]); setNotifsRead(false); }}).subscribe();
    return ()=>supabase.removeChannel(sub);
  },[profile?.full_name]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPage, setHelpPage] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  React.useEffect(()=>{
    const esc = e => { if(e.key==='Escape') { setSearchOpen(false); setSearchVal(''); onSearch(''); setNotifOpen(false); setProfileOpen(false); setHelpOpen(false); setAppsOpen(false); setInviteOpen(false); }};
    document.addEventListener('keydown', esc);
    return ()=>document.removeEventListener('keydown', esc);
  },[]);
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteSending, setInviteSending] = useState(false);

  // Close all when clicking outside
  React.useEffect(() => {
    const close = () => { setNotifOpen(false); setProfileOpen(false); setHelpOpen(false); setAppsOpen(false); setInviteOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  const stop = e => e.stopPropagation();

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    try {
      await supabase.auth.admin?.inviteUserByEmail(inviteEmail);
    } catch(e) {}
    setInviteSending(false);
    setInviteEmail('');
    setInviteOpen(false);
  };

  const HELP_ARTICLES = [
    { id:'getting-started', title:'Getting Started', icon:'🚀', content: [
      { q:'How do I create a workspace?', a:'From the Dashboard, click "+ New Workspace" or use the sidebar. Workspaces are like boards — create one per team or project type (e.g. Loans In Process, LO Resources).' },
      { q:'How do I add items to a workspace?', a:'Open a workspace, then click "+ Add Item" at the bottom of any group. Type the item name and press Enter. You can then click any cell to edit inline.' },
      { q:'How do I add team members?', a:'Go to Team in the sidebar. Admin users can invite team members by email. Use the invite button (person+ icon) in the top bar as well.' },
    ]},
    { id:'workspaces', title:'Workspaces & Groups', icon:'📋', content: [
      { q:'What is a group?', a:'Groups are collapsible sections inside a workspace. Use them to categorize items — e.g. by stage, month, or team. Click "+ Add Group" in the toolbar.' },
      { q:'How do I rename a group?', a:'Double-click the group name to edit it inline. Press Enter to save.' },
      { q:'Can I move items between groups?', a:'Yes — select items using the checkboxes, then use the "Move to..." dropdown in the action bar at the bottom of the screen.' },
      { q:'How do I reorder items?', a:'Select items and use Move to... to change groups. Drag-and-drop reordering is coming soon.' },
    ]},
    { id:'statuses', title:'Statuses & Columns', icon:'🎨', content: [
      { q:'How do I customize statuses?', a:'Click "Statuses" in the workspace toolbar. Admins can add, rename, recolor, and delete status options. Changes apply to all items in that workspace.' },
      { q:'What columns are available?', a:'Each item has: Name, Owner, Status, Priority, Date, Lender, Loan Officer, Processor, Lock Expiration, Processor Contact, and Escrow Email.' },
      { q:'How do I assign someone to an item?', a:'Click the Owner column (the circle avatar area) on any row. Select team members from the dropdown or type an email address.' },
    ]},
    { id:'updates', title:'Updates & Comments', icon:'💬', content: [
      { q:'How do I post an update on an item?', a:'Click the comment icon (💬) on any row to open the Updates Panel. Type your message and click "Post Update" or press Ctrl+Enter.' },
      { q:'Can I delete my own updates?', a:'Yes — hover over your update and click the × button to remove it.' },
      { q:'What is the Activity tab?', a:'The Activity tab shows a timeline of all updates posted on an item, so you can track conversation history.' },
    ]},
    { id:'contacts', title:'Contacts & Lead Funnel', icon:'👥', content: [
      { q:'How do I add a contact?', a:'Click "Add Contact" on the Contacts page. Fill in their details including name, email, company, and deal value.' },
      { q:'What is the Lead Funnel?', a:'The Lead Funnel shows all contacts organized by stage: New Lead → Contacted → Qualified → Proposal → Negotiation → Converted.' },
      { q:'How do I send emails to contacts?', a:'Open a contact drawer by clicking on a contact. Go to the Email tab and compose your message. Emails are sent via your Resend integration.' },
    ]},
    { id:'admin', title:'Admin & Settings', icon:'⚙️', content: [
      { q:'How do I change my company branding?', a:'Go to Branding in the sidebar (admin only). You can update your company name, logo URL, and brand accent color.' },
      { q:'How do I manage team roles?', a:'On the Team page, admins can change member roles between Admin, Manager, and Member using the dropdown next to each person.' },
      { q:'What can admins do that members cannot?', a:'Admins can: create/delete workspaces, manage statuses, add groups, invite members, access Branding settings, and see all items regardless of assignment.' },
    ]},
  ];

  return (
    <>
    <div className="topbar">
      {/* Global search overlay */}
      {searchOpen && (
        <div onClick={e=>{ stop(e); }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:99998, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 }}>
          <div onClick={stop} style={{ width:620, background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', boxShadow:'0 24px 60px rgba(0,0,0,.5)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input autoFocus value={searchVal} onChange={e=>{ setSearchVal(e.target.value); onSearch(e.target.value); }}
                placeholder="Search contacts, items, workspaces..."
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:16 }} />
              <span style={{ fontSize:12, color:'var(--muted)', background:'rgba(255,255,255,.1)', padding:'2px 8px', borderRadius:4 }}>ESC</span>
            </div>
            {searchVal && (
              <div style={{ maxHeight:400, overflowY:'auto' }}>
                {onGetResults(searchVal).length === 0 ? (
                  <div style={{ padding:'32px', textAlign:'center', color:'var(--muted)', fontSize:14 }}>No results for "{searchVal}"</div>
                ) : onGetResults(searchVal).map((r,i) => (
                  <div key={i} onClick={()=>{ r.action(); setSearchOpen(false); setSearchVal(''); onSearch(''); }}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', cursor:'pointer', borderBottom:'1px solid var(--border)' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                    onMouseOut={e=>e.currentTarget.style.background=''}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500 }}>{r.title}</div>
                      <div style={{ fontSize:12, color:'var(--muted)' }}>{r.subtitle}</div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:11, color:'var(--muted)', background:'rgba(255,255,255,.08)', padding:'2px 8px', borderRadius:4 }}>{r.type}</span>
                  </div>
                ))}
              </div>
            )}
            {!searchVal && (
              <div style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Quick Actions</div>
                {[{icon:'👥',label:'Go to Contacts',nav:'contacts'},{icon:'〽️',label:'Go to Lead Funnel',nav:'pipeline'},{icon:'📋',label:'Go to Dashboard',nav:'dashboard'},{icon:'👤',label:'Go to Team',nav:'team'}].map(a=>(
                  <div key={a.nav} onClick={()=>{ onNavigate(a.nav); setSearchOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:6, cursor:'pointer', fontSize:13 }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                    onMouseOut={e=>e.currentTarget.style.background=''}>
                    <span>{a.icon}</span><span>{a.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification bell */}
      <button className="topbar-btn" title="Notifications" style={{ position:'relative' }}
        onClick={e=>{ stop(e); setNotifOpen(o=>!o); setNotifsRead(true); setProfileOpen(false); setHelpOpen(false); setAppsOpen(false); }}>
        <div style={{ position:'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {notifications.length>0 && !notifsRead && <div style={{ position:'absolute', top:-4, right:-4, width:8, height:8, borderRadius:'50%', background:'#e05252', border:'2px solid var(--sidebar-bg)' }} />}
        </div>
      </button>

      {/* Search */}
      <button className="topbar-btn" onClick={e=>{ stop(e); setSearchOpen(o=>!o); }} title="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>

      {/* Invite */}
      <button className="topbar-btn" title="Invite people" onClick={e=>{ stop(e); setInviteOpen(o=>!o); setProfileOpen(false); setHelpOpen(false); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      </button>

      {/* Help */}
      <button className="topbar-btn" title="Help & Documentation" onClick={e=>{ stop(e); setHelpOpen(o=>!o); setProfileOpen(false); setAppsOpen(false); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>

      <div style={{ width:1, height:24, background:'rgba(255,255,255,.1)', margin:'0 4px' }} />

      {/* Apps grid */}
      <button className="topbar-btn" title="Quick Navigation" onClick={e=>{ stop(e); setAppsOpen(o=>!o); setProfileOpen(false); setHelpOpen(false); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      </button>

      {/* Avatar */}
      <div onClick={e=>{ stop(e); setProfileOpen(o=>!o); setHelpOpen(false); setAppsOpen(false); setNotifOpen(false); }}
        style={{ width:34, height:34, borderRadius:'50%', background:avatarColor(profile.full_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, cursor:'pointer', marginLeft:4, border:'2px solid rgba(255,255,255,.2)' }}>
        {initials(profile.full_name||'?')}
      </div>
    </div>

    {/* ── NOTIFICATION DROPDOWN ── */}
    {notifOpen && (
      <div onClick={stop} style={{ position:'fixed', top:56, right:56, width:340, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, maxHeight:480, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span>
          {notifications.length>0 && <span onClick={()=>{setNotifications([]);setNotifsRead(true);}} style={{ fontSize:12, color:'var(--muted)', cursor:'pointer' }}>Clear all</span>}
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {notifications.length===0 ? (
            <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
              You're all caught up!
            </div>
          ) : notifications.map(n=>(
            <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, alignItems:'flex-start' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
              onMouseOut={e=>e.currentTarget.style.background=''}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor(n.author_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(n.author_name||'?')}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{n.author_name} <span style={{ fontWeight:400, color:'var(--muted)' }}>mentioned you</span></div>
                <div style={{ fontSize:12, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.body}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ── INVITE DROPDOWN ── */}
    {inviteOpen && (
      <div onClick={stop} style={{ position:'fixed', top:56, right:120, width:340, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, padding:20 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>Invite Team Member</div>
        <div style={{ color:'var(--muted)', fontSize:12, marginBottom:16 }}>They'll receive an email to join Citizens Client Hub</div>
        <div className="form-group">
          <label>Email Address</label>
          <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@company.com" onKeyDown={e=>e.key==='Enter'&&sendInvite()} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} style={{ width:'100%' }}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-primary" style={{ flex:1 }} onClick={sendInvite} disabled={inviteSending||!inviteEmail.trim()}>{inviteSending?'Sending...':'Send Invite'}</button>
          <button className="btn-secondary" onClick={()=>setInviteOpen(false)}>Cancel</button>
        </div>
        <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)', fontSize:12, color:'var(--muted)' }}>
          Or go to <span onClick={()=>{ onNavigate('team'); setInviteOpen(false); }} style={{ color:'var(--accent)', cursor:'pointer' }}>Team page</span> to manage all members
        </div>
      </div>
    )}

    {/* ── APPS / QUICK NAV ── */}
    {appsOpen && (
      <div onClick={stop} style={{ position:'fixed', top:56, right:56, width:280, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, padding:16 }}>
        <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Quick Navigation</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Dashboard', icon:'⊞', nav:'dashboard' },
            { label:'Contacts', icon:'👥', nav:'contacts' },
            { label:'Lead Funnel', icon:'〽️', nav:'pipeline' },
            { label:'Team', icon:'🏢', nav:'team' },
            { label:'Branding', icon:'🎨', nav:'branding' },
            { label:'Workspaces', icon:'📋', nav:'dashboard' },
          ].map(item=>(
            <div key={item.nav+item.label} onClick={()=>{ onNavigate(item.nav); setAppsOpen(false); }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 8px', borderRadius:8, cursor:'pointer', background:'var(--surface2)', border:'1px solid var(--border)', textAlign:'center' }}
              onMouseOver={e=>e.currentTarget.style.borderColor='var(--accent)'}
              onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <span style={{ fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:12, color:'var(--muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ── HELP CENTER ── */}
    {helpOpen && (
      <div onClick={stop} style={{ position:'fixed', top:56, right:90, width:420, maxHeight:'80vh', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {helpPage ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={()=>setHelpPage(null)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:18, padding:0 }}>←</button>
              <span style={{ fontWeight:700, fontSize:15 }}>{helpPage.icon} {helpPage.title}</span>
            </div>
          ) : <span style={{ fontWeight:700, fontSize:15 }}>📚 Help Center</span>}
          <button onClick={()=>setHelpOpen(false)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:16 }}>
          {!helpPage ? (
            <>
              <div style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ color:'var(--muted)', fontSize:13 }}>Search help articles...</span>
              </div>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Topics</div>
              {HELP_ARTICLES.map(article=>(
                <div key={article.id} onClick={()=>setHelpPage(article)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:8, cursor:'pointer', marginBottom:4, border:'1px solid var(--border)' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <span style={{ fontSize:20 }}>{article.icon}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{article.title}</div>
                    <div style={{ color:'var(--muted)', fontSize:12 }}>{article.content.length} articles</div>
                  </div>
                  <svg style={{ marginLeft:'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </>
          ) : (
            <div>
              {helpPage.content.map((item,i)=>(
                <div key={i} style={{ marginBottom:20, paddingBottom:20, borderBottom: i<helpPage.content.length-1?'1px solid var(--border)':'' }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:8, color:'var(--text)' }}>{item.q}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>{item.a}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* ── PROFILE MENU ── */}
    {profileOpen && (
      <div onClick={stop} style={{ position:'fixed', top:56, right:16, width:260, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'16px', background:'var(--surface2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
          <img src="https://www.citizensfinancial.co/wp-content/uploads/2026/01/Logo-01.png" alt="logo" style={{ height:28, filter:'brightness(0) invert(1)' }} onError={e=>e.target.style.display='none'} />
          <span style={{ fontWeight:700, fontSize:14 }}>Citizens Financial</span>
        </div>
        {/* User info */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:avatarColor(profile.full_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{initials(profile.full_name||'?')}</div>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>{profile.full_name}</div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{profile.role}</div>
          </div>
        </div>
        {/* Menu items */}
        {[
          { icon:'👤', label:'My Profile', action:()=>{ onNavigate('team'); setProfileOpen(false); } },
          { icon:'👥', label:'Teams', action:()=>{ onNavigate('team'); setProfileOpen(false); } },
          { icon:'🎨', label:'Branding & Settings', action:()=>{ onNavigate('branding'); setProfileOpen(false); } },
          { icon:'📋', label:'Workspaces', action:()=>{ onNavigate('dashboard'); setProfileOpen(false); } },
          { icon:'🗑️', label:'Trash / Archive', action:()=>{ onNavigate('trash'); setProfileOpen(false); } },
          { icon:'⚙️', label:'Administration', action:()=>{ onNavigate('team'); setProfileOpen(false); } },
        ].map(item=>(
          <div key={item.label} onClick={item.action}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', cursor:'pointer', fontSize:13 }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
            onMouseOut={e=>e.currentTarget.style.background=''}>
            <span style={{ fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div style={{ borderTop:'1px solid var(--border)' }}>
          <div onClick={()=>{ onLogout(); setProfileOpen(false); }}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', cursor:'pointer', fontSize:13, color:'var(--danger)' }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
            onMouseOut={e=>e.currentTarget.style.background=''}>
            <span style={{ fontSize:16, width:20, textAlign:'center' }}>🚪</span>
            <span>Log out</span>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ contacts, workspaces, onOpenWorkspace, profile, onCreateWorkspace, onNavigate }) {
  const [wsStats, setWsStats] = useState({});

  React.useEffect(()=>{
    if(!profile?.company_name) return;
    supabase.from('workspace_items').select('*').eq('company_id', profile.company_name).then(({data})=>{
      if(!data) return;
      const stats = {};
      data.forEach(item=>{
        if(!stats[item.group_id]) stats[item.group_id] = {total:0, overdue:0, highPri:0};
        stats[item.group_id].total++;
        const ds = dueDateStatus(item.date);
        if(ds?.label==='Overdue') stats[item.group_id].overdue++;
        if(item.priority==='High'||item.priority==='Critical') stats[item.group_id].highPri++;
      });
      setWsStats(stats);
    });
  },[profile?.company_name]);
  const [showNewWs, setShowNewWs] = useState(false);
  const total = contacts.length;
  const pipeline = contacts.filter(c=>!['Converted','Non-Conversion'].includes(c.stage)).reduce((s,c)=>s+(c.deal_value||0),0);
  const won = contacts.filter(c=>c.stage==='Converted').length;
  const winRate = total > 0 ? Math.round((won/total)*100) : 0;
  const closed = contacts.filter(c=>c.stage==='Converted').reduce((s,c)=>s+(c.deal_value||0),0);

  const stageCounts = STAGES.map(s=>({ stage:s, count:contacts.filter(c=>c.stage===s).length, value:contacts.filter(c=>c.stage===s).reduce((a,b)=>a+(b.deal_value||0),0) }));
  const maxCount = Math.max(...stageCounts.map(s=>s.count),1);

  return (
    <div style={{ padding:32 }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, marginBottom:24, color:'var(--text)' }}>Dashboard</div>

      {/* ── MAIN WORKSPACE SECTION (TOP) ── */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Main Workspace</div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700 }}>Citizens Financial</div>
          </div>
          {profile?.role==='admin' && <button className="btn-primary btn-sm" onClick={()=>setShowNewWs(true)}>+ New Workspace</button>}
        </div>
        {workspaces.length===0 ? (
          <div className="card" style={{ textAlign:'center', padding:40 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
            <div style={{ fontWeight:600, marginBottom:6 }}>No workspaces yet</div>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:16 }}>Create workspaces to manage loans, tasks, and team projects</div>
            {profile?.role==='admin' && <button className="btn-primary" onClick={()=>setShowNewWs(true)}>Create First Workspace</button>}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {workspaces.map((w,i)=>{
              const colors = ['#4d8ef0','#2ecc8a','#9b59b6','#f0b429','#e05252','#00b8c4'];
              const color = colors[i % colors.length];
              return (
                <div key={w.id} onClick={()=>onOpenWorkspace(w)} style={{ cursor:'pointer', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'20px 18px', transition:'all .2s', borderLeft:`4px solid ${color}`, position:'relative', overflow:'hidden' }}
                  onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,.2)`; }}
                  onMouseOut={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  </div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{w.name}</div>
                  <div style={{ color:'var(--muted)', fontSize:12 }}>Open workspace →</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {[
          ['Total Contacts',total,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d8ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,'blue','contacts'],
          ['Funnel Value',fmt(pipeline),<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ecc8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,'green','pipeline'],
          ['Conversion Rate',`${winRate}%`,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0b429" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,'yellow','pipeline'],
          ['Total Revenue',fmt(closed),<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d8ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,'purple','contacts'],
        ].map(([label,val,icon,color,nav])=>(
          <div key={label} className="stat-card" onClick={()=>nav&&onNavigate(nav)} style={{ cursor:nav?'pointer':'default', transition:'all .2s' }}
            onMouseOver={e=>{ if(nav) e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseOut={e=>{ e.currentTarget.style.transform='translateY(0)'; }}>
            <div style={{ marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:24, fontWeight:700, color:`var(--${color==='blue'?'accent':color==='green'?'success':color==='yellow'?'warning':'accent2'})` }}>{val}</div>
            <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>{label}</div>
            {nav && <div style={{ fontSize:11, color:'var(--accent)', marginTop:6 }}>View →</div>}
          </div>
        ))}
      </div>

      {/* ── FUNNEL BY STAGE ── */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}><span>Funnel by Stage</span><span onClick={()=>onNavigate('pipeline')} style={{ fontSize:12, color:'var(--accent)', cursor:'pointer' }}>View Lead Funnel →</span></div>
        {stageCounts.map(({ stage, count, value })=>(
          <div key={stage} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:13 }}>{stage}</span>
              <span style={{ fontSize:12, color:'var(--muted)', fontFamily:'JetBrains Mono,monospace' }}>{count} · {fmt(value)}</span>
            </div>
            <div style={{ height:6, background:'var(--surface2)', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${(count/maxCount)*100}%`, background:'var(--accent)', borderRadius:3, transition:'width .5s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── RECENT CONTACTS ── */}
      <div className="card">
        <div style={{ fontWeight:600, marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}><span>Recent Contacts</span><span onClick={()=>onNavigate('contacts')} style={{ fontSize:12, color:'var(--accent)', cursor:'pointer' }}>View All →</span></div>
        {contacts.slice(0,5).map(c=>(
          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:avatarColor(c.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{initials(c.full_name)}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500, fontSize:14 }}>{c.full_name}</div>
              <div style={{ color:'var(--muted)', fontSize:12 }}>{c.company}</div>
            </div>
            <span className={`badge badge-${STAGE_COLORS[c.stage]||'blue'}`} style={{ fontSize:11 }}>{c.stage}</span>
          </div>
        ))}
        {contacts.length===0 && <div style={{ color:'var(--muted)', fontSize:13 }}>No contacts yet. Add your first lead!</div>}
      </div>

      {showNewWs && <InputModal title="New Workspace" placeholder="e.g. Loans In Process" onConfirm={name=>{ onCreateWorkspace(name); setShowNewWs(false); }} onClose={()=>setShowNewWs(false)} />}
    </div>
  );
}

// ─── CONTACTS VIEW ────────────────────────────────────────────────────────────
function MassEmailModal({ contacts, onClose, onSent }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const send = async () => {
    const withEmail = contacts.filter(c => c.email);
    if (!subject.trim() || !body.trim()) { alert('Please enter subject and message'); return; }
    if (withEmail.length === 0) { alert('No contacts with email addresses selected'); return; }
    setSending(true);
    for (let i = 0; i < withEmail.length; i++) {
      const c = withEmail[i];
      try {
        const firstName = (c.full_name || '').split(' ')[0];
        const personalizedBody = body.replace(/{{name}}/gi, firstName);
        const personalizedSubject = subject.replace(/{{name}}/gi, firstName);
        await fetch(process.env.REACT_APP_SUPABASE_URL + '/functions/v1/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.REACT_APP_SUPABASE_ANON_KEY },
          body: JSON.stringify({ to: c.email, subject: personalizedSubject, body: personalizedBody })
        });
        await supabase.from('activities').insert([{ contact_id: c.id, company_id: c.company_id, type: 'email', body: 'Subject: ' + personalizedSubject + '\n\n' + personalizedBody }]);
      } catch(e) { console.error('Failed to send to', c.email); }
      setProgress(i + 1);
    }
    setSending(false);
    onSent(withEmail.length);
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700 }}>📧 Mass Email</h2>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20 }}>✕</button>
        </div>
        <div style={{ background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.3)', borderRadius:8, padding:12, marginBottom:16, fontSize:13, color:'#60a5fa' }}>
          Sending to <strong>{contacts.filter(c=>c.email).length}</strong> contacts with email addresses ({contacts.length - contacts.filter(c=>c.email).length} skipped — no email)
        </div>
        <div style={{ background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.3)", borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#34d399" }}>💡 Tip: Use <strong>{"{{name}}"}</strong> anywhere to insert each contact's first name</div>
        <div className="form-group"><label>Subject</label><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Email subject..." /></div>
        <div className="form-group"><label>Message</label><textarea rows={6} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your email..." /></div>
        {sending && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:6 }}>Sending {progress} of {contacts.filter(c=>c.email).length}...</div>
            <div style={{ height:6, background:'var(--surface2)', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${(progress/contacts.filter(c=>c.email).length)*100}%`, background:'var(--accent)', borderRadius:3, transition:'width .3s' }} />
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={sending}>{sending ? 'Sending...' : '📧 Send to All'}</button>
        </div>
      </div>
    </div>
  );
}

function ContactsView({ contacts, onAdd, onSelect, toast }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [showMassEmail, setShowMassEmail] = useState(false);

  const filtered = contacts.filter(c => {
    const q = (search||'').toLowerCase();
    const match = !q || c.full_name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    const stageMatch = stageFilter==='All' || c.stage===stageFilter;
    return match && stageMatch;
  });

  const toggleSelect = (id, e) => { e.stopPropagation(); setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]); };
  const toggleAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(c=>c.id));
  const selectedContacts = contacts.filter(c => selected.includes(c.id));

  return (
    <div style={{ padding:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700 }}>Contacts</div>
        <div style={{ display:'flex', gap:10 }}>
          {selected.length > 0 && <button className="btn-secondary" onClick={()=>setShowMassEmail(true)}>📧 Email {selected.length} Selected</button>}
          <button className="btn-primary" onClick={onAdd}>+ Add Contact</button>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts..." style={{ maxWidth:300 }} />
        <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} style={{ width:'auto' }}>
          <option value="All">All Stages</option>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <table className="table">
          <thead><tr>
            <th style={{ width:40 }}><input type="checkbox" checked={selected.length===filtered.length&&filtered.length>0} onChange={toggleAll} /></th>
            <th>Name</th><th>Company</th><th>Stage</th><th>Deal Value</th><th>Source</th>
          </tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{ cursor:'pointer' }} onClick={()=>onSelect(c)}>
                <td onClick={e=>toggleSelect(c.id,e)}><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>{}} /></td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor(c.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{initials(c.full_name)}</div>
                    <div>
                      <div style={{ fontWeight:500 }}>{c.full_name}</div>
                      <div style={{ color:'var(--muted)', fontSize:12 }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color:'var(--muted)' }}>{c.company||'—'}</td>
                <td><span className={`badge badge-${STAGE_COLORS[c.stage]||'blue'}`}>{c.stage}</span></td>
                <td style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13 }}>{c.deal_value?fmt(c.deal_value):'—'}</td>
                <td style={{ color:'var(--muted)', fontSize:13 }}>{c.source||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ padding:40, textAlign:'center', color:'var(--muted)' }}>No contacts found</div>}
      </div>
      {showMassEmail && <MassEmailModal contacts={selectedContacts} onClose={()=>setShowMassEmail(false)} onSent={(n)=>{ setShowMassEmail(false); setSelected([]); toast('Sent to ' + n + ' contacts!'); }} />}
    </div>
  );
}

// ─── PIPELINE VIEW ────────────────────────────────────────────────────────────
function PipelineView({ contacts, onSelect }) {
  const total = contacts.length || 1;
  const stageColors = {
    'New Lead':'#4d8ef0','Contacted':'#7c5cbf','Qualified':'#f0b429',
    'Proposal':'#4d8ef0','Negotiation':'#e07b2a','Converted':'#2ecc8a','Non-Conversion':'#e05252'
  };
  return (
    <div style={{ padding:32, maxWidth:900, margin:'0 auto' }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, marginBottom:28 }}>Lead Funnel</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
        {STAGES.map((stage, i) => {
          const stageContacts = contacts.filter(c=>c.stage===stage);
          const count = stageContacts.length;
          const pct = Math.max(20, Math.round((count / total) * 100));
          const maxWidth = 100 - (i * 6);
          const width = Math.max(40, maxWidth) + '%';
          const color = stageColors[stage] || '#4d8ef0';
          return (
            <div key={stage} style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ width, background:color, borderRadius:8, padding:'14px 20px', cursor:'pointer', transition:'all .2s', boxShadow:`0 2px 12px ${color}44`, position:'relative' }}
                onClick={()=>{}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: count>0?10:0 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'#fff', letterSpacing:'.02em' }}>{stage}</span>
                  <span style={{ background:'rgba(255,255,255,.25)', color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700 }}>{count}</span>
                </div>
                {count > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {stageContacts.map(c=>(
                      <div key={c.id} onClick={e=>{e.stopPropagation();onSelect(c);}} style={{ background:'rgba(255,255,255,.15)', borderRadius:6, padding:'5px 10px', cursor:'pointer', transition:'background .15s' }}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.3)'}
                        onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{c.full_name}</div>
                        {c.deal_value>0 && <div style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{fmt(c.deal_value)}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <div style={{ width:2, height:16, background:'var(--border)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TEAM VIEW ────────────────────────────────────────────────────────────────
function TeamView({ profile, toast }) {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

  React.useEffect(()=>{
    const esc = e => { if(e.key==='Escape') { setSearchOpen(false); setSearchVal(''); onSearch(''); setNotifOpen(false); setProfileOpen(false); setHelpOpen(false); setAppsOpen(false); setInviteOpen(false); }};
    document.addEventListener('keydown', esc);
    return ()=>document.removeEventListener('keydown', esc);
  },[]);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('*').eq('company_name', profile.company_name).then(({ data }) => setMembers(data||[]));
  }, [profile]);

  const copyInviteLink = () => {
    const link = `${window.location.origin}?invite=${encodeURIComponent(profile.company_name)}`;
    setInviteLink(link);
    navigator.clipboard.writeText(link).then(() => toast('Invite link copied!')).catch(() => setInviteLink(link));
  };

  const changeRole = async (id, role) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setMembers(m => m.map(p => p.id===id ? {...p, role} : p));
    toast('Role updated');
  };

  return (
    <div style={{ padding:28, maxWidth:700 }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, marginBottom:24 }}>Team</div>
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, marginBottom:12 }}>Invite Team Member</div>
        <div style={{ display:'flex', gap:10 }}>
          <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
          <button className="btn-primary" style={{ whiteSpace:'nowrap' }} onClick={copyInviteLink}>Copy Invite Link</button>
        </div>
        {inviteLink && <div style={{ marginTop:10, padding:10, background:'var(--surface2)', borderRadius:8, fontSize:12, color:'var(--muted)', wordBreak:'break-all' }}>{inviteLink}</div>}
        <div style={{ color:'var(--muted)', fontSize:12, marginTop:8 }}>Send this link to your teammate. They'll create their own account and automatically join your workspace.</div>
      </div>

      <div className="card">
        <div style={{ fontWeight:600, marginBottom:16 }}>Team Members ({members.length})</div>
        {members.map(m=>(
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:avatarColor(m.full_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{initials(m.full_name||'?')}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500 }}>{m.full_name}</div>
              <div style={{ color:'var(--muted)', fontSize:12 }}>{m.email||'—'}</div>
            </div>
            {profile.role==='admin' && m.id!==profile.id ? (
              <select value={m.role||'member'} onChange={e=>changeRole(m.id,e.target.value)} style={{ width:'auto', padding:'5px 10px', fontSize:13 }}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
            ) : (
              <span className={`badge ${m.role==='admin'?'badge-blue':m.role==='manager'?'badge-yellow':'badge-green'}`}>{m.role||'member'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BRANDING VIEW ────────────────────────────────────────────────────────────
function BrandingView({ profile, onBrandUpdate, toast }) {
  const [form, setForm] = useState({ company_name: profile.company_name||'', logo_url: profile.logo_url||'', brand_color: profile.brand_color||'#3b82f6' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    await supabase.from('profiles').update(form).eq('id', profile.id);
    onBrandUpdate(form);
    toast('Branding saved!');
  };

  return (
    <div style={{ padding:28, maxWidth:500 }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, marginBottom:24 }}>Branding</div>
      <div className="card">
        <div className="form-group"><label>Company Name</label><input value={form.company_name} onChange={e=>set('company_name',e.target.value)} /></div>
        <div className="form-group"><label>Logo URL (direct image link)</label><input value={form.logo_url} onChange={e=>set('logo_url',e.target.value)} placeholder="https://yoursite.com/logo.png" /></div>
        {form.logo_url && <img src={form.logo_url} alt="logo" style={{ maxHeight:60, marginBottom:16, borderRadius:8 }} onError={e=>e.target.style.display='none'} />}
        <div className="form-group"><label>Brand Color</label><div style={{ display:'flex', gap:10, alignItems:'center' }}><input type="color" value={form.brand_color} onChange={e=>set('brand_color',e.target.value)} style={{ width:50, height:40, padding:2 }} /><input value={form.brand_color} onChange={e=>set('brand_color',e.target.value)} /></div></div>
        <button className="btn-primary" onClick={save}>Save Branding</button>
      </div>
    </div>
  );
}



// ─── INPUT MODAL ──────────────────────────────────────────────────────────────
function InputModal({ title, placeholder, defaultValue='', onConfirm, onClose }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="overlay" style={{ zIndex:500 }}>
      <div className="modal" style={{ maxWidth:420 }}>
        <div style={{ fontFamily:"Playfair Display,serif", fontSize:18, fontWeight:700, marginBottom:16 }}>{title}</div>
        <input autoFocus value={value} onChange={e=>setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e=>{ if(e.key==='Enter'&&value.trim()){onConfirm(value.trim());onClose();} if(e.key==='Escape')onClose(); }}
          style={{ marginBottom:20 }} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={()=>{ if(value.trim()){onConfirm(value.trim());onClose();} }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── WORKSPACE VIEW ───────────────────────────────────────────────────────────

// ─── STATUS MANAGER ───────────────────────────────────────────────────────────
function StatusManager({ workspaceId, companyId, statuses, onUpdate, onClose }) {
  const [list, setList] = useState(statuses);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#4d8ef0');
  const [saving, setSaving] = useState(false);

  const PRESET_COLORS = [
    '#4d8ef0','#2ecc8a','#9b59b6','#f0b429','#e05252','#00b8c4',
    '#e07b2a','#2c3e50','#1abc9c','#e91e63','#795548','#607d8b'
  ];

  const addStatus = async () => {
    if(!newLabel.trim()) return;
    setSaving(true);
    const {data} = await supabase.from('workspace_statuses').insert([{
      company_id: companyId,
      workspace_id: workspaceId,
      label: newLabel.trim(),
      color: newColor,
      position: list.length
    }]).select().single();
    if(data) {
      const updated = [...list, data];
      setList(updated);
      onUpdate(updated);
      setNewLabel('');
    }
    setSaving(false);
  };

  const updateStatus = async (id, field, value) => {
    await supabase.from('workspace_statuses').update({[field]:value}).eq('id',id);
    const updated = list.map(s=>s.id===id?{...s,[field]:value}:s);
    setList(updated);
    onUpdate(updated);
  };

  const deleteStatus = async (id) => {
    await supabase.from('workspace_statuses').delete().eq('id',id);
    const updated = list.filter(s=>s.id!==id);
    setList(updated);
    onUpdate(updated);
  };

  return (
    <div className="overlay" style={{ zIndex:400 }}>
      <div className="modal" style={{ maxWidth:560, maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:"Playfair Display,serif", fontSize:20, fontWeight:700 }}>Manage Statuses</div>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20, border:'none', cursor:'pointer' }}>✕</button>
        </div>

        {/* Existing statuses */}
        <div style={{ marginBottom:24 }}>
          {list.map(s=>(
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              {/* Color picker */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:28, height:28, borderRadius:6, background:s.color, cursor:'pointer', border:'2px solid rgba(255,255,255,.2)' }}
                  onClick={e=>{ e.currentTarget.nextSibling.style.display=e.currentTarget.nextSibling.style.display==='block'?'none':'block'; }} />
                <div style={{ display:'none', position:'absolute', top:34, left:0, zIndex:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:10, width:180, boxShadow:'0 8px 24px rgba(0,0,0,.3)' }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                    {PRESET_COLORS.map(c=>(
                      <div key={c} onClick={()=>updateStatus(s.id,'color',c)} style={{ width:24, height:24, borderRadius:4, background:c, cursor:'pointer', border:s.color===c?'2px solid #fff':'2px solid transparent' }} />
                    ))}
                  </div>
                  <input type="color" value={s.color} onChange={e=>updateStatus(s.id,'color',e.target.value)} style={{ width:'100%', height:32, padding:2, borderRadius:4 }} />
                </div>
              </div>
              {/* Label */}
              <div style={{ flex:1 }}>
                <input value={s.label} onChange={e=>updateStatus(s.id,'label',e.target.value)}
                  style={{ background:'transparent', border:'none', borderBottom:'1px solid var(--border)', borderRadius:0, padding:'4px 0', fontSize:13, width:'100%' }} />
              </div>
              {/* Preview */}
              <div style={{ background:s.color, color:'#fff', padding:'3px 10px', borderRadius:4, fontSize:11, fontWeight:600, whiteSpace:'nowrap' }}>{s.label}</div>
              {/* Delete */}
              <button onClick={()=>deleteStatus(s.id)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:16, padding:'0 4px', flexShrink:0 }}>×</button>
            </div>
          ))}
        </div>

        {/* Add new status */}
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.05em' }}>Add New Status</div>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Status label..." onKeyDown={e=>e.key==='Enter'&&addStatus()} style={{ flex:1 }} />
            <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} style={{ width:44, height:44, padding:2, borderRadius:6, cursor:'pointer', flexShrink:0 }} />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {PRESET_COLORS.map(c=>(
              <div key={c} onClick={()=>setNewColor(c)} style={{ width:24, height:24, borderRadius:4, background:c, cursor:'pointer', border:newColor===c?'2px solid #fff':'2px solid transparent' }} />
            ))}
          </div>
          {newLabel && <div style={{ background:newColor, color:'#fff', display:'inline-block', padding:'4px 12px', borderRadius:4, fontSize:12, fontWeight:600, marginBottom:12 }}>{newLabel}</div>}
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-primary" onClick={addStatus} disabled={saving||!newLabel.trim()}>{saving?'Adding...':'+ Add Status'}</button>
            <button className="btn-secondary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceView({ workspace, profile, toast, onRename, onDelete, allWorkspaces, onSwitchWorkspace, onAddWorkspace }) {
  const [inputModal, setInputModal] = useState(null);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [showWsSwitcher, setShowWsSwitcher] = useState(false);
  const [showAddView, setShowAddView] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState({}); // { groupId: Set of itemIds }
  const [subItems, setSubItems] = useState({}); // { parentId: [subitems] }
  const [expandedItems, setExpandedItems] = useState({});
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [items, setItems] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [itemDetailPanel, setItemDetailPanel] = useState(null);
  const [search, setSearch] = useState(null);
  const [filterOfficer, setFilterOfficer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [teamMembers, setTeamMembers] = useState([]);
  const [hiddenCols, setHiddenCols] = useState([]);
  const [showHideCols, setShowHideCols] = useState(false);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [batchStatusOpen, setBatchStatusOpen] = useState(false);
  const [showNewItemDrop, setShowNewItemDrop] = useState(false);

  useEffect(() => {
    loadGroups();
    loadStatuses();
    supabase.from('profiles').select('*').eq('company_name', profile.company_name).then(({data})=>setTeamMembers(data||[]));
  }, [workspace.id]);

  useEffect(() => {
    if(!showWsSwitcher) return;
    const close = () => setShowWsSwitcher(false);
    setTimeout(()=>document.addEventListener('click', close), 0);
    return ()=>document.removeEventListener('click', close);
  }, [showWsSwitcher]);

  useEffect(() => {
    if(!showAddView) return;
    const close = () => setShowAddView(false);
    setTimeout(()=>document.addEventListener('click', close), 0);
    return ()=>document.removeEventListener('click', close);
  }, [showAddView]);

  useEffect(() => {
    if(!showHideCols) return;
    const close = () => setShowHideCols(false);
    setTimeout(()=>document.addEventListener('click', close), 0);
    return ()=>document.removeEventListener('click', close);
  }, [showHideCols]);

  const loadGroups = async () => {
    const {data:grps} = await supabase.from('workspace_groups').select('*').eq('workspace_id', workspace.id).order('position');
    setGroups(grps||[]);
    if(grps) grps.forEach(g => loadItems(g.id));
  };

  const loadItems = async (groupId) => {
    const {data} = await supabase.from('workspace_items').select('*').eq('group_id', groupId).is('parent_id', null).eq('archived', false).order('position');
    const filtered = (data||[]).filter(i => !i.trashed);
    setItems(prev => ({...prev, [groupId]: filtered}));
  };

  const loadSubItems = async (parentId) => {
    const {data} = await supabase.from('workspace_items').select('*').eq('parent_id', parentId).order('position');
    setSubItems(prev => ({...prev, [parentId]: data||[]}));
  };

  const loadStatuses = async () => {
    const {data} = await supabase.from('workspace_statuses').select('*').or(`workspace_id.eq.${workspace.id},workspace_id.is.null`).order('position');
    setStatuses(data||[]);
  };

  const addGroup = () => {
    setInputModal({ title:'Add Group', placeholder:'e.g. New Apps/Pre-Qual', defaultValue:'', onConfirm: async(name) => {
    const colors = ['#4d8ef0','#2ecc8a','#9b59b6','#f0b429','#e05252','#00b8c4'];
    const color = colors[groups.length % colors.length];
      const {data} = await supabase.from('workspace_groups').insert([{workspace_id:workspace.id, name, color, position:groups.length}]).select().single();
      if(data) { setGroups(g=>[...g,data]); setItems(prev=>({...prev,[data.id]:[]})); }
    }});
  };

  const addItem = (groupId) => {
    setInputModal({ title:'Add Item', placeholder:'e.g. John & Jane Smith', defaultValue:'', onConfirm: async(name) => {
      const {data} = await supabase.from('workspace_items').insert([{group_id:groupId, company_id:profile.company_name, name, position:(items[groupId]||[]).length}]).select().single();
      if(data) setItems(prev=>({...prev,[groupId]:[...(prev[groupId]||[]),data]}));
    }});
  };

  const addSubItem = (parentId, groupId) => {
    setInputModal({ title:'Add Sub-item', placeholder:'Sub-item name...', defaultValue:'', onConfirm: async(name) => {
      const {data} = await supabase.from('workspace_items').insert([{group_id:groupId, company_id:profile.company_name, name, parent_id:parentId, position:(subItems[parentId]||[]).length}]).select().single();
      if(data) { setSubItems(prev=>({...prev,[parentId]:[...(prev[parentId]||[]),data]})); setExpandedItems(prev=>({...prev,[parentId]:true})); }
    }});
  };

  const duplicateItems = async (groupId, itemIds) => {
    for(const id of itemIds) {
      const original = (items[groupId]||[]).find(i=>i.id===id);
      if(!original) continue;
      const {id:_id, created_at, ...rest} = original;
      const {data} = await supabase.from('workspace_items').insert([{...rest, name: original.name+' (copy)'}]).select().single();
      if(data) setItems(prev=>({...prev,[groupId]:[...(prev[groupId]||[]),data]}));
    }
    setSelected({});
  };

  const archiveItems = async (groupId, itemIds) => {
    for(const id of itemIds) await supabase.from('workspace_items').update({archived:true}).eq('id',id);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).filter(i=>!itemIds.includes(i.id))}));
    setSelected({});
  };

  const batchUpdateStatus = async (statusLabel, statusColor) => {
    const updates = [];
    for(const [gId, gSet] of Object.entries(selected)) {
      for(const iId of gSet) {
        await supabase.from('workspace_items').update({status:statusLabel, status_color:statusColor}).eq('id',iId);
        updates.push({gId, iId, statusLabel, statusColor});
      }
    }
    updates.forEach(({gId,iId,statusLabel,statusColor})=>{
      setItems(prev=>({...prev,[gId]:(prev[gId]||[]).map(i=>i.id===iId?{...i,status:statusLabel,status_color:statusColor}:i)}));
    });
    setSelected({});
    setBatchStatusOpen(false);
    toast('Status updated for '+updates.length+' items');
  };

  const handleDragStart = (e, groupId, itemId) => {
    e.dataTransfer.setData('itemId', itemId);
    e.dataTransfer.setData('fromGroup', groupId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, toGroupId, toIdx) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    const fromGroupId = e.dataTransfer.getData('fromGroup');
    if(!itemId) return;
    setDragOverGroup(null); setDragOverIdx(null);
    if(fromGroupId === toGroupId) {
      // Reorder within same group
      const grpItems = [...(items[fromGroupId]||[])];
      const fromIdx = grpItems.findIndex(i=>i.id===itemId);
      if(fromIdx === -1) return;
      const [moved] = grpItems.splice(fromIdx,1);
      grpItems.splice(toIdx,0,moved);
      setItems(prev=>({...prev,[fromGroupId]:grpItems}));
      for(let i=0;i<grpItems.length;i++) await supabase.from('workspace_items').update({position:i}).eq('id',grpItems[i].id);
    } else {
      // Move between groups
      const item = (items[fromGroupId]||[]).find(i=>i.id===itemId);
      if(!item) return;
      await supabase.from('workspace_items').update({group_id:toGroupId, position:toIdx}).eq('id',itemId);
      setItems(prev=>({
        ...prev,
        [fromGroupId]:(prev[fromGroupId]||[]).filter(i=>i.id!==itemId),
        [toGroupId]:[...(prev[toGroupId]||[]).slice(0,toIdx),{...item,group_id:toGroupId},...(prev[toGroupId]||[]).slice(toIdx)]
      }));
    }
  };

  const deleteSelectedItems = async (groupId, itemIds) => {
    for(const id of itemIds) await supabase.from('workspace_items').update({trashed:true, archived:false}).eq('id',id);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).filter(i=>!itemIds.includes(i.id))}));
    setSelected({});
    toast('Moved to trash — items deleted after 30 days');
  };

  const moveItemsToGroup = async (fromGroupId, itemIds, toGroupId) => {
    for(const id of itemIds) await supabase.from('workspace_items').update({group_id:toGroupId}).eq('id',id);
    const moved = (items[fromGroupId]||[]).filter(i=>itemIds.includes(i.id));
    setItems(prev=>({
      ...prev,
      [fromGroupId]:(prev[fromGroupId]||[]).filter(i=>!itemIds.includes(i.id)),
      [toGroupId]:[...(prev[toGroupId]||[]),...moved.map(i=>({...i,group_id:toGroupId}))]
    }));
    setSelected({});
  };

  const renameGroup = async (groupId, name) => {
    await supabase.from('workspace_groups').update({name}).eq('id',groupId);
    setGroups(g=>g.map(x=>x.id===groupId?{...x,name}:x));
    setEditingGroupId(null);
  };

  const deleteGroup = async (groupId) => {
    await supabase.from('workspace_groups').delete().eq('id',groupId);
    setGroups(g=>g.filter(x=>x.id!==groupId));
    setItems(prev=>{ const n={...prev}; delete n[groupId]; return n; });
  };

  const toggleSelect = (groupId, itemId) => {
    setSelected(prev => {
      const groupSet = new Set(prev[groupId]||[]);
      if(groupSet.has(itemId)) groupSet.delete(itemId); else groupSet.add(itemId);
      return {...prev, [groupId]: groupSet};
    });
  };

  const toggleSelectAll = (groupId, groupItems) => {
    setSelected(prev => {
      const groupSet = new Set(prev[groupId]||[]);
      const allSelected = groupItems.every(i=>groupSet.has(i.id));
      if(allSelected) return {...prev, [groupId]: new Set()};
      return {...prev, [groupId]: new Set(groupItems.map(i=>i.id))};
    });
  };

  const totalSelected = Object.values(selected).reduce((sum,s)=>sum+(s.size||0),0);

  const updateItem = async (groupId, itemId, field, value) => {
    await supabase.from('workspace_items').update({[field]:value}).eq('id',itemId);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).map(i=>i.id===itemId?{...i,[field]:value}:i)}));
  };

  const deleteItem = async (groupId, itemId) => {
    await supabase.from('workspace_items').update({trashed:true, archived:false}).eq('id',itemId);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).filter(i=>i.id!==itemId)}));
    toast('Moved to trash');
  };

  const exportCSV = () => {
    const rows = [['Name','Status','Priority','Date','Lender','Loan Officer','Processor','Lock Expiration','Processor Contact','Escrow Email','Assigned Officers']];
    groups.forEach(g => {
      (items[g.id]||[]).forEach(item => {
        rows.push([item.name,item.status,item.priority,item.date,item.lender,item.loan_officer,item.processor,item.lock_expiration,item.processor_contact,item.escrow_email,(item.assigned_officers||[]).join(';')]);
      });
    });
    const csv = rows.map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${workspace.name}.csv`; a.click();
  };

  const PRIORITY_COLORS = { High:'#e05252', Medium:'#f0b429', Low:'#2ecc8a', Critical:'#9b59b6' };
  const COLUMNS = ['name','assigned_officers','status','priority','date','lender','loan_officer','processor','lock_expiration','processor_contact','escrow_email'];
  const COL_LABELS = { name:'Item', status:'Status', priority:'Priority', date:'Date', lender:'Lender', loan_officer:'Loan Officer', processor:'Processor', lock_expiration:'Lock Exp.', processor_contact:'Processor Contact', escrow_email:'Escrow Email', assigned_officers:'Owner' };
  const COL_WIDTHS = { name:200, assigned_officers:100, status:180, priority:100, date:110, lender:120, loan_officer:130, processor:130, lock_expiration:110, processor_contact:150, escrow_email:160 };

  const allItems = Object.values(items).flat();
  const officers = [...new Set(allItems.flatMap(i=>i.assigned_officers||[]))];

  return (
    <div style={{ minHeight:'100vh' }}>
      {/* Workspace Title Bar */}
      <div style={{ padding:'16px 28px 0', display:'flex', alignItems:'center', gap:10, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'4px 10px', borderRadius:8, border:'1px solid transparent' }}
          onClick={()=>setShowWsSwitcher(o=>!o)}
          onMouseOver={e=>{ e.currentTarget.style.background='rgba(255,255,255,.06)'; e.currentTarget.style.borderColor='var(--border)'; }}
          onMouseOut={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.borderColor='transparent'; }}>
          <div style={{ fontFamily:"Playfair Display,serif", fontSize:24, fontWeight:700 }}>{workspace.name}</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ transform:showWsSwitcher?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {profile.role==='admin' && <>
          <button className="topbar-btn" onClick={()=>setInputModal({ title:'Rename Workspace', placeholder:'Workspace name', defaultValue:workspace.name, onConfirm:onRename })} title="Rename" style={{ padding:6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="topbar-btn" onClick={onDelete} title="Delete workspace" style={{ padding:6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </>}
        {/* Workspace switcher dropdown */}
        {showWsSwitcher && (
          <div style={{ position:'absolute', top:'100%', left:0, marginTop:4, width:260, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, overflow:'hidden' }}>
            <div style={{ padding:'8px 12px', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>Switch Workspace</div>
            {allWorkspaces.map(w=>(
              <div key={w.id} onClick={()=>{ onSwitchWorkspace(w); setShowWsSwitcher(false); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', background:w.id===workspace.id?'rgba(77,142,240,.12)':'' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
                onMouseOut={e=>e.currentTarget.style.background=w.id===workspace.id?'rgba(77,142,240,.12)':''}>
                <div style={{ width:28, height:28, borderRadius:6, background:'linear-gradient(135deg,#4d8ef0,#1a56db)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:w.id===workspace.id?700:400 }}>{w.name}</div>
                </div>
                {w.id===workspace.id && <span style={{ color:'var(--accent)', fontSize:12 }}>✓</span>}
              </div>
            ))}
            {profile.role==='admin' && (
              <div onClick={()=>{ onAddWorkspace(); setShowWsSwitcher(false); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', borderTop:'1px solid var(--border)', color:'var(--accent)' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                <span style={{ fontSize:18 }}>+</span>
                <span style={{ fontSize:13, fontWeight:600 }}>New Workspace</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ padding:'8px 28px 0', display:'flex', gap:0, borderBottom:'1px solid var(--border)', alignItems:'center' }}>
        {[{id:'table',label:'Main table',icon:'⊞'},{id:'kanban',label:'Kanban',icon:'▦'},{id:'chart',label:'Chart',icon:'📊'}].map(v=>(
          <div key={v.id} onClick={()=>setViewMode(v.id)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:viewMode===v.id?600:400, color:viewMode===v.id?'var(--accent)':'var(--muted)', borderBottom:viewMode===v.id?'2px solid var(--accent)':'2px solid transparent', cursor:'pointer', marginBottom:-1, whiteSpace:'nowrap', transition:'color .15s' }}>
            <span style={{ fontSize:14 }}>{v.icon}</span>{v.label}
          </div>
        ))}
        <div style={{ width:1, height:20, background:'var(--border)', margin:'0 8px' }} />
        <div style={{ position:'relative' }}>
          <div onClick={()=>setShowAddView(o=>!o)} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 12px', color:'var(--muted)', cursor:'pointer', fontSize:13, borderRadius:6 }}
            onMouseOver={e=>{ e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='rgba(255,255,255,.06)'; }}
            onMouseOut={e=>{ e.currentTarget.style.color='var(--muted)'; e.currentTarget.style.background=''; }}>
            <span style={{ fontSize:16 }}>+</span> Add view
          </div>
          {showAddView && (
            <div style={{ position:'absolute', top:'100%', left:0, marginTop:4, width:220, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999, overflow:'hidden' }}>
              <div style={{ padding:'8px 12px', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>Choose View Type</div>
              {[
                {id:'table', icon:'⊞', label:'Main Table', desc:'Spreadsheet-style rows'},
                {id:'kanban', icon:'▦', label:'Kanban Board', desc:'Cards by status column'},
                {id:'chart', icon:'📊', label:'Chart / Stats', desc:'Visual charts & metrics'},
              ].map(v=>(
                <div key={v.id} onClick={()=>{ setViewMode(v.id); setShowAddView(false); }}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer', background:viewMode===v.id?'rgba(77,142,240,.12)':'' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
                  onMouseOut={e=>e.currentTarget.style.background=viewMode===v.id?'rgba(77,142,240,.12)':''}>
                  <span style={{ fontSize:20, width:24, textAlign:'center' }}>{v.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{v.label}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{v.desc}</div>
                  </div>
                  {viewMode===v.id && <span style={{ marginLeft:'auto', color:'var(--accent)' }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="ws-toolbar">
        {/* New Item */}
        <div style={{ display:'flex', borderRadius:6, overflow:'hidden', boxShadow:'0 1px 3px rgba(26,86,219,.3)', position:'relative' }}>
          <button onClick={()=>{ if(groups.length>0) addItem(groups[0].id); else addGroup(); }} style={{ background:'var(--accent)', color:'#fff', border:'none', padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            + New Item
          </button>
          <button onClick={e=>{ e.stopPropagation(); setShowNewItemDrop(o=>!o); }} style={{ background:'#3a7de8', color:'#fff', border:'none', borderLeft:'1px solid rgba(255,255,255,.2)', padding:'7px 10px', cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showNewItemDrop && (
            <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'100%', left:0, marginTop:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, zIndex:9999, width:230, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, padding:'4px 8px 8px', textTransform:'uppercase', letterSpacing:'.05em' }}>Add to Group</div>
              {groups.map(g=>(
                <div key={g.id} onClick={()=>{ addItem(g.id); setShowNewItemDrop(false); }}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', cursor:'pointer', borderRadius:4 }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <div style={{ width:10, height:10, borderRadius:2, background:g.color, flexShrink:0 }} />
                  <span style={{ fontSize:13 }}>{g.name}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--border)', marginTop:6, paddingTop:6 }}>
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, padding:'4px 8px 6px', textTransform:'uppercase', letterSpacing:'.05em' }}>From Template</div>
                {[
                  {label:'Purchase Loan',     fields:{lender:'TBD', priority:'High',   status:'New Application'}},
                  {label:'Refinance Loan',    fields:{lender:'TBD', priority:'Medium', status:'Pre-Qual'}},
                  {label:'FHA Loan',          fields:{lender:'TBD', priority:'Medium', status:'New Application'}},
                  {label:'VA Loan',           fields:{lender:'TBD', priority:'High',   status:'New Application'}},
                ].map(t=>(
                  <div key={t.label} onClick={()=>{
                    if(!groups.length) return;
                    const gId = groups[0].id;
                    const statusObj = statuses.find(s=>s.label===t.fields.status);
                    setInputModal({ title:'New '+t.label, placeholder:'Borrower name', defaultValue:'', onConfirm: async(name)=>{
                      const {data} = await supabase.from('workspace_items').insert([{
                        group_id:gId, company_id:profile.company_name, name,
                        position:(items[gId]||[]).length,
                        ...t.fields, status_color: statusObj?.color||'#4d8ef0'
                      }]).select().single();
                      if(data) setItems(prev=>({...prev,[gId]:[...(prev[gId]||[]),data]}));
                    }});
                    setShowNewItemDrop(false);
                  }}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', cursor:'pointer', borderRadius:4, fontSize:13 }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(77,142,240,.1)'}
                    onMouseOut={e=>e.currentTarget.style.background=''}>
                    <span style={{ fontSize:14 }}>📋</span>{t.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ width:1, height:24, background:'var(--border)', margin:'0 4px' }} />

        {/* Search */}
        <button className="ws-toolbar-btn" onClick={()=>setSearch(s=>s===null?'':null)} style={{ color: search!==null?'var(--accent)':'var(--muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </button>
        {search!==null && <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items..." autoFocus style={{ width:180, padding:'5px 10px', fontSize:13 }} onKeyDown={e=>e.key==='Escape'&&setSearch(null)} />}

        {/* Person filter */}
        <div style={{ position:'relative' }}>
          <button className="ws-toolbar-btn" style={{ color:filterOfficer?'var(--accent)':'var(--muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Person
            <select value={filterOfficer} onChange={e=>setFilterOfficer(e.target.value)} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
              <option value="">All People</option>
              {officers.map(o=><option key={o}>{o}</option>)}
            </select>
          </button>
        </div>

        {/* Filter */}
        <div style={{ position:'relative' }}>
          <button className="ws-toolbar-btn" style={{ color:filterStatus?'var(--accent)':'var(--muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter {filterStatus && `· ${filterStatus}`}
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
              <option value="">No filter</option>
              {statuses.map(s=><option key={s.id}>{s.label}</option>)}
            </select>
          </button>
        </div>

        {/* Sort */}
        <div style={{ position:'relative' }}>
          <button className="ws-toolbar-btn" style={{ color:sortCol?'var(--accent)':'var(--muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            Sort {sortCol && `· ${COL_LABELS[sortCol]}`}
            <select value={sortCol} onChange={e=>setSortCol(e.target.value)} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%' }}>
              <option value="">None</option>
              {COLUMNS.map(c=><option key={c} value={c}>{COL_LABELS[c]}</option>)}
            </select>
          </button>
        </div>

        {/* Statuses */}
        {profile.role==='admin' && (
          <button className="ws-toolbar-btn" onClick={()=>setShowStatusManager(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Statuses
          </button>
        )}

        {/* Hide Columns */}
        <div style={{ position:'relative' }}>
          <button className="ws-toolbar-btn" onClick={()=>setShowHideCols(o=>!o)} style={{ color:hiddenCols.length>0?'var(--accent)':'var(--muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            Hide {hiddenCols.length>0?`· ${hiddenCols.length}`:''}
          </button>
          {showHideCols && (
            <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'100%', left:0, marginTop:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:10, zIndex:999, width:200, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Toggle Columns</div>
              {COLUMNS.filter(c=>c!=='name').map(c=>(
                <div key={c} onClick={()=>setHiddenCols(h=>h.includes(c)?h.filter(x=>x!==c):[...h,c])}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 4px', cursor:'pointer', borderRadius:4, fontSize:13 }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <div style={{ width:16, height:16, borderRadius:3, border:'1px solid var(--border)', background:hiddenCols.includes(c)?'':'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {!hiddenCols.includes(c) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  {COL_LABELS[c]}
                </div>
              ))}
              <div onClick={()=>setHiddenCols([])} style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)', fontSize:12, color:'var(--accent)', cursor:'pointer', textAlign:'center' }}>Show all</div>
            </div>
          )}
        </div>

        {/* Export */}
        <button className="ws-toolbar-btn" onClick={exportCSV} style={{ marginLeft:'auto' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>

      <div style={{ padding:'20px 28px' }}>

      {/* Groups */}
      {groups.length===0 && (
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <div style={{ color:'var(--muted)', marginBottom:16 }}>No groups yet. Add a group to get started.</div>
          {profile.role==='admin' && <button className="btn-primary" onClick={addGroup}>+ Add First Group</button>}
        </div>
      )}

      {viewMode==='table' && groups.map(group => {
        let groupItems = (items[group.id]||[]).filter(item => {
          const q = (search||'').toLowerCase();
          const matchSearch = !search || !q || item.name?.toLowerCase().includes(q) || item.lender?.toLowerCase().includes(q) || item.loan_officer?.toLowerCase().includes(q);
          const matchStatus = !filterStatus || item.status===filterStatus;
          const matchOfficer = !filterOfficer || (item.assigned_officers||[]).includes(filterOfficer);
          return matchSearch && matchStatus && matchOfficer;
        });
        if(sortCol) groupItems = [...groupItems].sort((a,b)=>{
          const va=(a[sortCol]||'').toString().toLowerCase(), vb=(b[sortCol]||'').toString().toLowerCase();
          return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
        });
        const isCollapsed = collapsed[group.id];
        const groupSelected = selected[group.id]||new Set();
        const allGroupSelected = groupItems.length>0 && groupItems.every(i=>groupSelected.has(i.id));

        return (
          <div key={group.id} style={{ marginBottom:28 }}>
            {/* Group Header */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:0, paddingLeft:4 }}>
              <div style={{ width:4, height:22, background:group.color, borderRadius:2, flexShrink:0 }} />
              <button onClick={()=>setCollapsed(c=>({...c,[group.id]:!c[group.id]}))} style={{ background:'none', border:'none', color:group.color, cursor:'pointer', padding:'2px 4px', display:'flex', alignItems:'center' }}>
                <span style={{ transform:isCollapsed?'rotate(-90deg)':'rotate(0)', transition:'transform .2s', display:'inline-block', fontSize:10 }}>▼</span>
              </button>
              {editingGroupId===group.id ? (
                <input autoFocus value={editingGroupName} onChange={e=>setEditingGroupName(e.target.value)}
                  onBlur={()=>renameGroup(group.id, editingGroupName)}
                  onKeyDown={e=>{ if(e.key==='Enter') renameGroup(group.id, editingGroupName); if(e.key==='Escape') setEditingGroupId(null); }}
                  style={{ fontSize:14, fontWeight:700, background:'transparent', border:'none', borderBottom:'2px solid '+group.color, color:group.color, outline:'none', width:200, padding:'2px 0' }} />
              ) : (
                <span onDoubleClick={()=>{ setEditingGroupId(group.id); setEditingGroupName(group.name); }} style={{ fontSize:14, fontWeight:700, color:group.color, cursor:'pointer' }} title="Double-click to rename">{group.name}</span>
              )}
              <span style={{ color:'var(--muted)', fontSize:12 }}>{groupItems.length} items</span>
              {profile.role==='admin' && <button onClick={()=>deleteGroup(group.id)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:12, opacity:0.5, marginLeft:4 }} title="Delete group">🗑️</button>}
            </div>

            {/* Table */}
            {!isCollapsed && (
              <div style={{ border:'1px solid var(--border)', borderRadius:8, marginTop:6, borderLeft:`3px solid ${group.color}`, position:'static' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'var(--surface2)' }}>
                      <th style={{ width:36, padding:'8px 10px', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                        <input type="checkbox" checked={allGroupSelected} onChange={()=>toggleSelectAll(group.id, groupItems)}
                          style={{ cursor:'pointer', width:14, height:14, accentColor:'var(--accent)' }} />
                      </th>
                      {COLUMNS.filter(c=>!hiddenCols.includes(c)).map(col=>(
                        <th key={col} style={{ padding:'8px 10px', textAlign:'left', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', cursor:'pointer', minWidth:COL_WIDTHS[col] }}
                          onClick={()=>{ if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortCol(col); setSortDir('asc'); } }}>
                          {COL_LABELS[col]} {sortCol===col?(sortDir==='asc'?'↑':'↓'):''}
                        </th>
                      ))}
                      <th style={{ width:40, padding:'8px 10px', borderBottom:'1px solid var(--border)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupItems.map((item,idx)=>(
                      <React.Fragment key={item.id}>
                        {dragOverGroup===group.id && dragOverIdx===idx && <tr><td colSpan={COLUMNS.filter(c=>!hiddenCols.includes(c)).length+2} style={{ padding:0 }}><div style={{ height:3, background:'var(--accent)', borderRadius:2 }} /></td></tr>}
                        <WorkspaceItemRow
                          item={item} group={group} statuses={statuses} teamMembers={teamMembers} profile={profile}
                          selected={groupSelected.has(item.id)}
                          onSelect={()=>toggleSelect(group.id, item.id)}
                          onUpdate={(field,val)=>updateItem(group.id,item.id,field,val)}
                          onDelete={()=>deleteItem(group.id,item.id)}
                          onOpenUpdates={()=>setItemDetailPanel(item)}
                          onAddSubItem={()=>{ addSubItem(item.id, group.id); loadSubItems(item.id); }}
                          onToggleExpand={()=>{ setExpandedItems(p=>({...p,[item.id]:!p[item.id]})); if(!expandedItems[item.id]) loadSubItems(item.id); }}
                          isExpanded={!!expandedItems[item.id]}
                          subItemCount={(subItems[item.id]||[]).length}
                          PRIORITY_COLORS={PRIORITY_COLORS}
                          hiddenCols={hiddenCols}
                          onDragStart={e=>handleDragStart(e,group.id,item.id)}
                          onDragOver={e=>{ e.preventDefault(); setDragOverGroup(group.id); setDragOverIdx(idx); }}
                          onDrop={e=>handleDrop(e,group.id,idx)}
                        />
                        {/* Sub-items */}
                        {expandedItems[item.id] && (subItems[item.id]||[]).map(sub=>(
                          <tr key={sub.id} style={{ background:'rgba(0,0,0,.08)', borderBottom:'1px solid var(--border)' }}>
                            <td style={{ padding:'4px 10px', paddingLeft:36, textAlign:'center' }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--border)', margin:'0 auto' }} />
                            </td>
                            <td style={{ padding:'4px 10px', paddingLeft:24 }} colSpan={2}>
                              <span style={{ fontSize:12, color:'var(--muted)', marginRight:8 }}>↳</span>
                              <span style={{ fontSize:13 }}>{sub.name}</span>
                            </td>
                            <td colSpan={COLUMNS.length-1} style={{ padding:'4px 10px' }}>
                              <div style={{ display:'inline-flex', alignItems:'center', background:sub.status_color||'#4d8ef0', color:'#fff', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{sub.status||'—'}</div>
                            </td>
                            <td style={{ padding:'4px 10px' }}>
                              <button onClick={async()=>{ await supabase.from('workspace_items').delete().eq('id',sub.id); setSubItems(p=>({...p,[item.id]:(p[item.id]||[]).filter(s=>s.id!==sub.id)})); }} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:14 }}>×</button>
                            </td>
                          </tr>
                        ))}
                        {expandedItems[item.id] && (
                          <tr style={{ background:'rgba(0,0,0,.05)' }}>
                            <td colSpan={COLUMNS.length+2} style={{ padding:'6px 10px 6px 50px' }}>
                              <button onClick={()=>addSubItem(item.id, group.id)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:12 }}>+ Add sub-item</button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {groupItems.length===0 && <tr><td colSpan={COLUMNS.length+2} style={{ padding:'16px 10px', color:'var(--muted)', textAlign:'center', fontSize:13 }}>No items yet</td></tr>}
                  </tbody>
                </table>
              </div>{/* end overflowX wrapper */}
                {/* Add item row */}
                <div style={{ padding:'8px 10px 8px 46px', borderTop:'1px solid var(--border)', background:'var(--surface2)' }}>
                  <button onClick={()=>addItem(group.id)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Item
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* KANBAN VIEW */}
      {viewMode==='kanban' && (() => {
        const allWsItems = Object.values(items).flat();
        const statusGroups = {};
        statuses.forEach(s=>{ statusGroups[s.label]=[]; });
        if(allWsItems.some(i=>!i.status)) statusGroups['No Status'] = [];
        allWsItems.forEach(item=>{ const k=item.status||'No Status'; if(!statusGroups[k]) statusGroups[k]=[]; statusGroups[k].push(item); });
        const cols = Object.entries(statusGroups).filter(([k,v])=>v.length>0||k!=='No Status');
        return (
          <div style={{ overflowX:'auto', paddingBottom:24 }}>
            <div style={{ display:'flex', gap:14, minWidth:'max-content' }}>
              {cols.map(([status, sitems])=>{
                const s = statuses.find(x=>x.label===status);
                const colColor = s?.color||'#4d8ef0';
                return (
                  <div key={status} style={{ width:270, flexShrink:0 }}>
                    {/* Column header */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 10px', borderRadius:6, background:'var(--surface2)', borderTop:`3px solid ${colColor}` }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:colColor, flexShrink:0 }} />
                      <span style={{ fontWeight:700, fontSize:13, flex:1 }}>{status}</span>
                      <span style={{ background:'rgba(255,255,255,.1)', color:'var(--muted)', fontSize:11, fontWeight:600, padding:'1px 7px', borderRadius:10 }}>{sitems.length}</span>
                    </div>
                    {/* Cards */}
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {sitems.map(item=>{
                        const grp = groups.find(g=>g.id===item.group_id);
                        return (
                          <div key={item.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all .15s', borderLeft:`3px solid ${grp?.color||colColor}` }}
                            onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.2)'; }}
                            onMouseOut={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                            onClick={()=>setItemDetailPanel(item)}>
                            {grp && <div style={{ fontSize:10, color:grp.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:5 }}>{grp.name}</div>}
                            <div style={{ fontWeight:600, fontSize:13, marginBottom:8, lineHeight:1.4 }}>{item.name}</div>
                            {item.lender && <div style={{ fontSize:11, color:'var(--muted)', marginBottom:3, display:'flex', alignItems:'center', gap:4 }}>🏦 {item.lender}</div>}
                            {item.loan_officer && <div style={{ fontSize:11, color:'var(--muted)', marginBottom:3, display:'flex', alignItems:'center', gap:4 }}>👤 {item.loan_officer}</div>}
                            {item.date && <div style={{ fontSize:11, color:'var(--muted)', marginBottom:3, display:'flex', alignItems:'center', gap:4 }}>📅 {new Date(item.date).toLocaleDateString()}</div>}
                            {item.priority && <div style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3, marginTop:6, background:PRIORITY_COLORS[item.priority]+'22', color:PRIORITY_COLORS[item.priority] }}>{item.priority}</div>}
                            {(item.assigned_officers||[]).length>0 && (
                              <div style={{ display:'flex', gap:3, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                                {(item.assigned_officers||[]).map((name,i)=>(
                                  <div key={i} title={name} style={{ width:24, height:24, borderRadius:'50%', background:avatarColor(name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff', border:'2px solid var(--surface)' }}>{initials(name)}</div>
                                ))}
                                <span style={{ fontSize:11, color:'var(--muted)', marginLeft:4, lineHeight:'24px' }}>{(item.assigned_officers||[]).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Add item to this status */}
                      <div onClick={()=>{ if(groups.length>0) addItem(groups[0].id); }}
                        style={{ padding:'10px', borderRadius:8, border:'1px dashed var(--border)', color:'var(--muted)', fontSize:13, cursor:'pointer', textAlign:'center' }}
                        onMouseOver={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='var(--text)'; }}
                        onMouseOut={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='var(--muted)'; }}>
                        + Add item
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* CHART VIEW */}
      {viewMode==='chart' && (() => {
        const allWsItems = Object.values(items).flat();
        const total = allWsItems.length;
        const statusCounts = {};
        allWsItems.forEach(item=>{ const k=item.status||'No Status'; statusCounts[k]=(statusCounts[k]||0)+1; });
        const priorityCounts = {High:0,Medium:0,Low:0,Critical:0};
        allWsItems.forEach(item=>{ if(item.priority) priorityCounts[item.priority]=(priorityCounts[item.priority]||0)+1; });
        const maxStatus = Math.max(...Object.values(statusCounts),1);
        const lenderCounts = {};
        allWsItems.forEach(item=>{ if(item.lender) lenderCounts[item.lender]=(lenderCounts[item.lender]||0)+1; });
        const maxLender = Math.max(...Object.values(lenderCounts),1);
        return (
          <div style={{ padding:'20px 0' }}>
            {/* Summary cards */}
            <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
              {[
                {label:'Total Items', value:total, icon:'📋', color:'#4d8ef0'},
                {label:'Completed', value:allWsItems.filter(i=>['Funded','Closed','Clear To Close','Converted'].some(s=>i.status?.includes(s))).length, icon:'✅', color:'#2ecc8a'},
                {label:'In Progress', value:allWsItems.filter(i=>i.status&&!['No Status',''].includes(i.status)).length, icon:'⏳', color:'#f0b429'},
                {label:'High Priority', value:(priorityCounts.High||0)+(priorityCounts.Critical||0), icon:'🔴', color:'#e05252'},
              ].map(card=>(
                <div key={card.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'18px 22px', borderTop:`3px solid ${card.color}`, minWidth:150, flex:1 }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{card.icon}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:card.color }}>{card.value}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              {/* Items by Status */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, marginBottom:16 }}>Items by Status</div>
                {Object.entries(statusCounts).length===0 && <div style={{ color:'var(--muted)', fontSize:13 }}>No items yet</div>}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {Object.entries(statusCounts).sort((a,b)=>b[1]-a[1]).map(([status,count])=>{
                    const s = statuses.find(x=>x.label===status);
                    return (
                      <div key={status}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                          <span style={{ color:'var(--text)' }}>{status}</span>
                          <span style={{ color:'var(--muted)' }}>{count} ({Math.round(count/total*100)}%)</span>
                        </div>
                        <div style={{ background:'var(--surface2)', borderRadius:4, height:22, overflow:'hidden' }}>
                          <div style={{ width:`${(count/maxStatus)*100}%`, height:'100%', background:s?.color||'#4d8ef0', borderRadius:4, transition:'width .6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items by Priority */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, marginBottom:16 }}>Items by Priority</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {Object.entries(PRIORITY_COLORS).map(([p,color])=>(
                    <div key={p} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:color, flexShrink:0 }} />
                      <span style={{ fontSize:13, width:70 }}>{p}</span>
                      <div style={{ flex:1, background:'var(--surface2)', borderRadius:4, height:22, overflow:'hidden' }}>
                        <div style={{ width:`${((priorityCounts[p]||0)/Math.max(...Object.values(priorityCounts),1))*100}%`, height:'100%', background:color+'aa', borderRadius:4, transition:'width .6s ease' }} />
                      </div>
                      <span style={{ fontSize:12, color:'var(--muted)', width:24, textAlign:'right' }}>{priorityCounts[p]||0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items by Group */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, marginBottom:16 }}>Items by Group</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {groups.map(g=>(
                    <div key={g.id} style={{ background:'var(--surface2)', borderRadius:8, padding:'12px 16px', borderLeft:`4px solid ${g.color}`, flex:'1 1 120px', minWidth:120 }}>
                      <div style={{ fontSize:24, fontWeight:700, color:g.color }}>{(items[g.id]||[]).length}</div>
                      <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{g.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items by Lender */}
              {Object.keys(lenderCounts).length>0 && (
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:20 }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:16, fontWeight:700, marginBottom:16 }}>Items by Lender</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {Object.entries(lenderCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([lender,count])=>(
                      <div key={lender}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                          <span style={{ color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{lender}</span>
                          <span style={{ color:'var(--muted)', flexShrink:0 }}>{count}</span>
                        </div>
                        <div style={{ background:'var(--surface2)', borderRadius:4, height:18, overflow:'hidden' }}>
                          <div style={{ width:`${(count/maxLender)*100}%`, height:'100%', background:'var(--accent)', borderRadius:4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* TABLE VIEW (default) */}
      {viewMode==='table' && <></>}{/* groups render above handles table */}

      {/* Add new group button */}
      {viewMode==='table' && <button onClick={addGroup} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px dashed var(--border)', color:'var(--muted)', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontSize:13, marginTop:8 }}>
        + Add new group
      </button>}

      </div>{/* end padding wrapper */}

      {/* Bottom action bar when items selected */}
      {totalSelected > 0 && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 20px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 8px 32px rgba(0,0,0,.4)', zIndex:200, minWidth:500 }}>
          <div style={{ background:'var(--accent)', color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700 }}>{totalSelected}</div>
          <span style={{ fontSize:13, color:'var(--muted)' }}>item{totalSelected>1?'s':''} selected</span>
          <div style={{ width:1, height:24, background:'var(--border)' }} />
          {Object.entries(selected).map(([gId, gSet])=> gSet.size>0 ? (
            <React.Fragment key={gId}>
              <div style={{ position:'relative' }}>
                <button onClick={()=>setBatchStatusOpen(o=>!o)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', color:'var(--text)', cursor:'pointer', padding:'4px 8px', borderRadius:6, fontSize:12 }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <span style={{ fontSize:18 }}>🏷️</span>Status
                </button>
                {batchStatusOpen && (
                  <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', bottom:'100%', left:0, marginBottom:8, width:200, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:6, boxShadow:'0 8px 24px rgba(0,0,0,.4)', zIndex:9999, maxHeight:260, overflowY:'auto' }}>
                    <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, padding:'4px 8px 8px', textTransform:'uppercase', letterSpacing:'.05em' }}>Set Status For All</div>
                    {statuses.map(s=>(
                      <div key={s.id} onClick={()=>batchUpdateStatus(s.label, s.color)}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:4, cursor:'pointer' }}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                        onMouseOut={e=>e.currentTarget.style.background=''}>
                        <div style={{ width:12, height:12, borderRadius:3, background:s.color, flexShrink:0 }} />
                        <span style={{ fontSize:13 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={()=>duplicateItems(gId,[...gSet])} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', color:'var(--text)', cursor:'pointer', padding:'4px 8px', borderRadius:6, fontSize:12 }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                <span style={{ fontSize:18 }}>⧉</span>Duplicate
              </button>
              <button onClick={()=>archiveItems(gId,[...gSet])} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', color:'var(--text)', cursor:'pointer', padding:'4px 8px', borderRadius:6, fontSize:12 }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                <span style={{ fontSize:18 }}>🗄️</span>Archive
              </button>
              <button onClick={()=>deleteSelectedItems(gId,[...gSet])} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', color:'var(--danger)', cursor:'pointer', padding:'4px 8px', borderRadius:6, fontSize:12 }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                <span style={{ fontSize:18 }}>🗑️</span>Trash
              </button>
              <select onChange={e=>{ if(e.target.value) moveItemsToGroup(gId,[...gSet],e.target.value); e.target.value=''; }}
                style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:6, padding:'6px 10px', fontSize:12, cursor:'pointer' }}>
                <option value="">Move to...</option>
                {groups.filter(g=>g.id!==gId).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </React.Fragment>
          ) : null)}
          <button onClick={()=>setSelected({})} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
      )}

      {/* Item Detail Panel */}
      {itemDetailPanel && (
        <ItemDetailPanel
          item={itemDetailPanel}
          group={groups.find(g=>g.id===itemDetailPanel.group_id)}
          statuses={statuses}
          teamMembers={teamMembers}
          profile={profile}
          allGroups={groups}
          toast={toast}
          onClose={()=>setItemDetailPanel(null)}
          onUpdate={(field,val)=>{
            const gId = itemDetailPanel.group_id;
            setItems(prev=>({ ...prev, [gId]: (prev[gId]||[]).map(i=>i.id===itemDetailPanel.id?{...i,[field]:val}:i) }));
            setItemDetailPanel(prev=>({...prev,[field]:val}));
          }}
        />
      )}
      {/* Input Modal */}
      {inputModal && <InputModal title={inputModal.title} placeholder={inputModal.placeholder} defaultValue={inputModal.defaultValue||''} onConfirm={inputModal.onConfirm} onClose={()=>setInputModal(null)} />}
      {/* Status Manager */}
      {showStatusManager && <StatusManager workspaceId={workspace.id} companyId={profile.company_name} statuses={statuses} onUpdate={setStatuses} onClose={()=>setShowStatusManager(false)} />}
    </div>
  );
}

// ─── WORKSPACE ITEM ROW ───────────────────────────────────────────────────────
function WorkspaceItemRow({ item, group, statuses, teamMembers, profile, onUpdate, onDelete, onOpenUpdates, onAddSubItem, onToggleExpand, isExpanded, subItemCount, selected, onSelect, PRIORITY_COLORS, hiddenCols=[], onDragStart, onDragOver, onDrop }) {
  const [editing, setEditing] = useState(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pickerPos, setPickerPos] = useState({top:0,left:0});
  const [assignPos, setAssignPos] = useState({top:0,left:0});

  const statusPickerRef = React.useRef();
  const assignPickerRef = React.useRef();

  React.useEffect(()=>{
    if(!showStatusPicker && !showAssignPicker) return;
    const close = (e)=>{
      if(statusPickerRef.current && statusPickerRef.current.contains(e.target)) return;
      if(assignPickerRef.current && assignPickerRef.current.contains(e.target)) return;
      setShowStatusPicker(false);
      setShowAssignPicker(false);
    };
    const t = setTimeout(()=>document.addEventListener('mousedown', close), 100);
    return ()=>{ clearTimeout(t); document.removeEventListener('mousedown', close); };
  },[showStatusPicker, showAssignPicker]);

  const statusObj = statuses.find(s=>s.label===item.status);
  const statusColor = item.status_color || statusObj?.color || '#4d8ef0';

  const EditableCell = ({field, type='text', style={}}) => {
    const [val, setVal] = useState(item[field]||'');
    if(editing===field) return (
      <input autoFocus value={val} onChange={e=>setVal(e.target.value)} type={type}
        onBlur={()=>{ onUpdate(field,val); setEditing(null); }}
        onKeyDown={e=>{ if(e.key==='Enter'){onUpdate(field,val);setEditing(null);} if(e.key==='Escape')setEditing(null); }}
        style={{ width:'100%', padding:'4px 6px', fontSize:13, background:'var(--surface2)', border:'1px solid var(--accent)', borderRadius:4, color:'var(--text)', ...style }} />
    );
    return <div onClick={e=>{ e.stopPropagation(); setEditing(field); }} style={{ cursor:'text', padding:'4px 6px', minHeight:24, borderRadius:4, ...style }}>{item[field]||<span style={{color:'var(--border)'}}>—</span>}</div>;
  };

  return (
    <tr draggable style={{ borderBottom:'1px solid var(--border)', background: selected?'rgba(77,142,240,.08)': (item.status_color ? item.status_color+'0d' : ''), cursor:'pointer', transition:'background .1s' }}
      onMouseOver={e=>{ e.currentTarget.style.background=selected?'rgba(77,142,240,.12)':'rgba(255,255,255,.04)'; setHovered(true); }}
      onMouseOut={e=>{ e.currentTarget.style.background=selected?'rgba(77,142,240,.08)':(item.status_color?item.status_color+'0d':''); setHovered(false); }}
      onClick={onOpenUpdates}
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={()=>{}}>
      <td style={{ padding:'6px 10px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
          <input type="checkbox" checked={!!selected} onChange={onSelect} onClick={e=>e.stopPropagation()}
            style={{ cursor:'pointer', width:14, height:14, accentColor:'var(--accent)' }} />
          {(hovered||subItemCount>0) && (
            <button onClick={onToggleExpand} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:2, fontSize:10, transform:isExpanded?'rotate(90deg)':'rotate(0)', transition:'transform .15s' }} title="Toggle sub-items">▶</button>
          )}
        </div>
      </td>
      <td style={{ padding:'4px 10px', minWidth:200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ flex:1 }}><EditableCell field="name" style={{ fontWeight:500 }} /></div>
          {hovered && <button onClick={e=>{ e.stopPropagation(); onOpenUpdates(); }} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:3, display:'flex', alignItems:'center', flexShrink:0, opacity:.7 }} title="Open detail panel">{Icons.comment}</button>}
          {hovered && subItemCount===0 && <button onClick={onAddSubItem} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:3, fontSize:10, flexShrink:0, opacity:.7 }} title="Add sub-item">⊕</button>}
        </div>
      </td>
      {/* OWNER — right after name to match header order */}
      <td style={{ padding:'4px 10px', position:'relative' }} onClick={e=>e.stopPropagation()}>
        <div onMouseDown={e=>{ e.stopPropagation(); const r=e.currentTarget.getBoundingClientRect(); setAssignPos({top:r.bottom+4,left:Math.max(0,r.right-240)}); setShowAssignPicker(s=>!s); setShowStatusPicker(false); }} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          {(item.assigned_officers||[]).length===0 && (
            <div style={{ width:28, height:28, borderRadius:'50%', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--border)', fontSize:14 }}>+</div>
          )}
          {(item.assigned_officers||[]).map((name,i)=>(
            <div key={i} title={name} style={{ width:28, height:28, borderRadius:'50%', background:avatarColor(name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', border:'2px solid var(--surface)', marginLeft: i>0?-8:0, zIndex: i, flexShrink:0 }}>
              {initials(name)}
            </div>
          ))}
          {(item.assigned_officers||[]).length>0 && hovered && <span style={{ fontSize:11, color:'var(--muted)', marginLeft:4 }}>+</span>}
        </div>
        {showAssignPicker && (
          <div ref={assignPickerRef} style={{ position:'fixed', top:assignPos.top, left:assignPos.left, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, width:240, boxShadow:'0 12px 32px rgba(0,0,0,.5)' }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6, fontWeight:600 }}>ASSIGN OFFICERS</div>
            {teamMembers.map(m=>{
              const assigned = (item.assigned_officers||[]).includes(m.email||m.full_name);
              return (
                <div key={m.id} onClick={()=>{
                  const name = m.email||m.full_name;
                  const curr = item.assigned_officers||[];
                  const updated = assigned ? curr.filter(x=>x!==name) : [...curr,name];
                  onUpdate('assigned_officers',updated);
                }} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:4, cursor:'pointer', background: assigned?'rgba(77,142,240,.15)':'' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                  onMouseOut={e=>e.currentTarget.style.background=assigned?'rgba(77,142,240,.15)':''}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:avatarColor(m.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>{initials(m.full_name)}</div>
                  <div style={{ fontSize:12 }}>{m.full_name}</div>
                  {assigned && <span style={{ marginLeft:'auto', color:'var(--accent)', fontSize:12 }}>✓</span>}
                </div>
              );
            })}
            <div style={{ borderTop:'1px solid var(--border)', marginTop:6, paddingTop:6 }}>
              <input placeholder="Or type email..." style={{ fontSize:12, padding:'4px 8px' }} onKeyDown={e=>{ if(e.key==='Enter'&&e.target.value){ onUpdate('assigned_officers',[...(item.assigned_officers||[]),e.target.value]); e.target.value=''; }}} />
            </div>
            <button onClick={()=>setShowAssignPicker(false)} style={{ width:'100%', marginTop:6, background:'var(--surface2)', color:'var(--muted)', border:'1px solid var(--border)', borderRadius:4, padding:'4px 8px', fontSize:12 }}>Done</button>
          </div>
        )}
      </td>
      {!hiddenCols.includes('status') && <td style={{ padding:'4px 10px', position:'relative' }} onClick={e=>e.stopPropagation()}>
        <div onClick={e=>e.stopPropagation()} onMouseDown={e=>{ e.stopPropagation(); const r=e.currentTarget.getBoundingClientRect(); const spaceBelow=window.innerHeight-r.bottom; const dropH=Math.min(320, statuses.length*40+60); const top=spaceBelow<dropH ? r.top-dropH-4 : r.bottom+4; setPickerPos({top,left:r.left}); setShowStatusPicker(s=>!s); setShowAssignPicker(false); }} style={{ display:'inline-flex', alignItems:'center', background:statusColor, color:'#fff', padding:'3px 10px', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          {item.status||'No Status'}
        </div>
        {showStatusPicker && (
          <div ref={statusPickerRef} style={{ position:'fixed', top:pickerPos.top, left:pickerPos.left, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, width:240, maxHeight:400, overflowY:'auto', boxShadow:'0 12px 32px rgba(0,0,0,.5)' }}>
            {statuses.length===0 && <div style={{ padding:'8px', color:'var(--muted)', fontSize:12 }}>No statuses yet — click 🎨 Statuses to add some</div>}
            {statuses.map(s=>(
              <div key={s.id} onClick={()=>{ onUpdate('status',s.label); onUpdate('status_color',s.color); setShowStatusPicker(false); }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:4, cursor:'pointer' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                <div style={{ width:14, height:14, borderRadius:3, background:s.color, flexShrink:0 }} />
                <span style={{ fontSize:13 }}>{s.label}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid var(--border)', marginTop:4, paddingTop:4 }}>
              <div onClick={()=>{ onUpdate('status',''); onUpdate('status_color',''); setShowStatusPicker(false); }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:4, cursor:'pointer', color:'var(--muted)', fontSize:12 }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                onMouseOut={e=>e.currentTarget.style.background=''}>
                Clear status
              </div>
            </div>
          </div>
        )}
      </td>}
      {!hiddenCols.includes('priority') && <td style={{ padding:'4px 10px' }}>
        <select value={item.priority||'Medium'} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate('priority',e.target.value)} style={{ background:'transparent', border:'none', color:PRIORITY_COLORS[item.priority||'Medium'], fontWeight:700, fontSize:12, cursor:'pointer', width:'auto', padding:'2px 4px' }}>
          {['Low','Medium','High','Critical'].map(p=><option key={p} style={{ background:'#1a2e4a', color:PRIORITY_COLORS[p] }}>{p}</option>)}
        </select>
      </td>}
      <td style={{ padding:'4px 10px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <EditableCell field="date" type="date" />
          {(() => { const ds = dueDateStatus(item.date); if(!ds||ds.label==='On track') return null;
            return <span title={ds.label} style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:3, background:ds.bg, color:ds.color, whiteSpace:'nowrap', flexShrink:0 }}>{ds.label==='Overdue'?'⚠️':''} {ds.days}d {ds.label==='Overdue'?'late':'left'}</span>;
          })()}
        </div>
      </td>
      {!hiddenCols.includes('lender') && <td style={{ padding:'4px 10px' }}><EditableCell field="lender" /></td>}
      {!hiddenCols.includes('loan_officer') && <td style={{ padding:'4px 10px' }}><EditableCell field="loan_officer" /></td>}
      {!hiddenCols.includes('processor') && <td style={{ padding:'4px 10px' }}><EditableCell field="processor" /></td>}
      {!hiddenCols.includes('lock_expiration') && <td style={{ padding:'4px 10px' }}><EditableCell field="lock_expiration" type="date" /></td>}
      {!hiddenCols.includes('processor_contact') && <td style={{ padding:'4px 10px' }}><EditableCell field="processor_contact" /></td>}
      {!hiddenCols.includes('escrow_email') && <td style={{ padding:'4px 10px' }}><EditableCell field="escrow_email" /></td>}
      <td style={{ padding:'4px 10px' }} onClick={e=>e.stopPropagation()}>
        <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:14, padding:4 }}>×</button>
      </td>
    </tr>
  );
}

// ─── UPDATES PANEL ────────────────────────────────────────────────────────────
// ─── ITEM DETAIL PANEL ───────────────────────────────────────────────────────
function ItemDetailPanel({ item: initialItem, group, statuses, teamMembers, profile, onClose, onUpdate, toast, allGroups }) {
  const [item, setItem] = useState(initialItem);
  const [tab, setTab] = useState('updates');
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [posting, setPosting] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [driveAttachments, setDriveAttachments] = useState([]);
  const { pickFile } = useGoogleDrivePicker();
  const [attachingDrive, setAttachingDrive] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState(0);
  const [editingField, setEditingField] = useState(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const textareaRef = React.useRef();
  const fileInputRef = React.useRef();
  const panelRef = React.useRef();

  useEffect(() => { loadUpdates(); loadFiles(); loadDriveAttachments(); }, [item.id]);

  // Sync item updates back to parent
  const updateField = async (field, value) => {
    const updated = { ...item, [field]: value };
    setItem(updated);
    await supabase.from('workspace_items').update({ [field]: value }).eq('id', item.id);
    onUpdate(field, value);
  };

  const loadUpdates = async () => {
    const { data } = await supabase.from('workspace_updates').select('*').eq('item_id', item.id).order('created_at', { ascending: true });
    setUpdates(data||[]);
  };

  const loadFiles = async () => {
    try {
      const { data } = await supabase.storage.from('workspace-files').list(`items/${item.id}`);
      setFiles(data||[]);
    } catch(e) { setFiles([]); }
  };

  const loadDriveAttachments = async () => {
    const { data } = await supabase.from('drive_attachments').select('*').eq('item_id', item.id).order('created_at',{ascending:false});
    setDriveAttachments(data||[]);
  };

  const attachDriveFile = async (fileInfo) => {
    setAttachingDrive(true);
    const { data } = await supabase.from('drive_attachments').insert([{
      item_id: item.id,
      company_id: profile.company_name,
      created_by: profile.id,
      creator_name: profile.full_name,
      ...fileInfo
    }]).select().single();
    if(data) setDriveAttachments(d=>[data,...d]);
    setAttachingDrive(false);
    toast('📎 Google Drive file attached!');
  };

  const removeDriveAttachment = async (id) => {
    await supabase.from('drive_attachments').delete().eq('id',id);
    setDriveAttachments(d=>d.filter(x=>x.id!==id));
    toast('Attachment removed');
  };

  const postUpdate = async () => {
    if(!newUpdate.trim()) return;
    setPosting(true);
    const { data } = await supabase.from('workspace_updates').insert([{ item_id: item.id, author_name: profile.full_name, author_id: profile.id, body: newUpdate }]).select().single();
    if(data) { setUpdates(u=>[...u,data]); setNewUpdate(''); }
    setPosting(false);
  };

  const deleteUpdate = async (id) => {
    await supabase.from('workspace_updates').delete().eq('id', id);
    setUpdates(u=>u.filter(x=>x.id!==id));
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setNewUpdate(val);
    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const atIdx = textBefore.lastIndexOf('@');
    if(atIdx !== -1) {
      const after = textBefore.slice(atIdx+1);
      if(!after.includes(' ') && !after.includes('\n')) {
        setMentionSearch(after.toLowerCase());
        setMentionStart(atIdx);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  };

  const insertMention = (member) => {
    const before = newUpdate.slice(0, mentionStart);
    const after = newUpdate.slice(mentionStart + 1 + mentionSearch.length);
    const mention = '@' + member.full_name;
    setNewUpdate(before + mention + ' ' + after);
    setMentionOpen(false);
    setMentionSearch('');
    setTimeout(()=>{ if(textareaRef.current) { textareaRef.current.focus(); const pos = (before+mention+' ').length; textareaRef.current.setSelectionRange(pos,pos); }},0);
  };

  const filteredMembers = teamMembers.filter(m=> m.id !== profile.id && (mentionSearch==='' || m.full_name.toLowerCase().includes(mentionSearch)));

  const renderBody = (body) => {
    const parts = body.split(/(@[a-zA-Z][a-zA-Z0-9 ]*)/g);
    return parts.map((part,i)=>{ if(part.startsWith('@')) return <span key={i} style={{ color:'var(--accent)', fontWeight:600 }}>{part}</span>; return part; });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    setUploadingFile(true);
    try {
      const path = `items/${item.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('workspace-files').upload(path, file);
      if(!error) { toast('File uploaded!'); loadFiles(); } else toast('Upload failed — check Supabase storage setup');
    } catch(e) { toast('Storage setup required'); }
    setUploadingFile(false);
  };

  const getFileUrl = (fileName) => { const { data } = supabase.storage.from('workspace-files').getPublicUrl(`items/${item.id}/${fileName}`); return data?.publicUrl; };
  const formatFileSize = (bytes) => { if(!bytes) return ''; if(bytes<1024) return bytes+'B'; if(bytes<1048576) return (bytes/1024).toFixed(1)+'KB'; return (bytes/1048576).toFixed(1)+'MB'; };
  const getFileIcon = (name) => { const ext=name.split('.').pop().toLowerCase(); if(['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️'; if(ext==='pdf') return '📄'; if(['doc','docx'].includes(ext)) return '📝'; if(['xls','xlsx','csv'].includes(ext)) return '📊'; return '📎'; };

  const ds = dueDateStatus(item.date);
  const PRIORITY_COLORS = { High:'#e05252', Medium:'#f0b429', Low:'#2ecc8a', Critical:'#9b59b6' };
  const statusObj = statuses.find(s=>s.label===item.status);
  const statusColor = item.status_color || statusObj?.color || '#4d8ef0';

  const FieldRow = ({ label, children }) => (
    <div style={{ display:'flex', alignItems:'flex-start', gap:16, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:130, fontSize:12, color:'var(--muted)', fontWeight:600, paddingTop:6, flexShrink:0 }}>{label}</div>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );

  return (
    <div ref={panelRef} style={{ position:'fixed', top:52, right:0, width:560, height:'calc(100vh - 52px)', background:'var(--surface)', borderLeft:'1px solid var(--border)', zIndex:300, display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,.3)' }}>

      {/* ── HEADER ── */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:12 }}>
          {editingField==='name' ? (
            <input autoFocus value={item.name} onChange={e=>setItem(i=>({...i,name:e.target.value}))}
              onBlur={()=>{ updateField('name',item.name); setEditingField(null); }}
              onKeyDown={e=>{ if(e.key==='Enter'){updateField('name',item.name);setEditingField(null);} if(e.key==='Escape')setEditingField(null); }}
              style={{ flex:1, fontSize:18, fontWeight:700, fontFamily:'Playfair Display,serif', background:'transparent', border:'none', borderBottom:'2px solid var(--accent)', outline:'none', color:'var(--text)', padding:'2px 0' }} />
          ) : (
            <div onClick={()=>setEditingField('name')} style={{ flex:1, fontSize:18, fontWeight:700, fontFamily:'Playfair Display,serif', cursor:'text', lineHeight:1.3 }} title="Click to edit">{item.name}</div>
          )}
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer', flexShrink:0, padding:4, borderRadius:4 }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
            onMouseOut={e=>e.currentTarget.style.background=''}>✕</button>
        </div>
        {/* Status + Priority badges */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <div onClick={()=>setShowStatusPicker(s=>!s)} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:6, background:statusColor, color:'#fff', padding:'4px 12px', borderRadius:5, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {item.status||'Set Status'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
            {showStatusPicker && (
              <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:6, width:220, maxHeight:300, overflowY:'auto', boxShadow:'0 12px 32px rgba(0,0,0,.5)' }}>
                {statuses.map(s=>(
                  <div key={s.id} onClick={()=>{ updateField('status',s.label); updateField('status_color',s.color); setShowStatusPicker(false); }}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:4, cursor:'pointer' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                    onMouseOut={e=>e.currentTarget.style.background=''}>
                    <div style={{ width:12, height:12, borderRadius:3, background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:13 }}>{s.label}</span>
                  </div>
                ))}
                <div onClick={()=>{ updateField('status',''); updateField('status_color',''); setShowStatusPicker(false); }}
                  style={{ padding:'6px 10px', fontSize:12, color:'var(--muted)', cursor:'pointer', borderTop:'1px solid var(--border)', marginTop:4 }}>Clear status</div>
              </div>
            )}
          </div>
          <select value={item.priority||'Medium'} onChange={e=>updateField('priority',e.target.value)}
            style={{ background:PRIORITY_COLORS[item.priority||'Medium']+'22', color:PRIORITY_COLORS[item.priority||'Medium'], border:`1px solid ${PRIORITY_COLORS[item.priority||'Medium']}44`, borderRadius:5, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {['Low','Medium','High','Critical'].map(p=><option key={p} style={{ background:'var(--surface2)', color:PRIORITY_COLORS[p] }}>{p}</option>)}
          </select>
          {ds && ds.label!=='On track' && (
            <span style={{ background:ds.bg, color:ds.color, border:`1px solid ${ds.color}44`, padding:'4px 10px', borderRadius:5, fontSize:12, fontWeight:700 }}>
              {ds.label==='Overdue'?'⚠️ ':''}{ds.days}d {ds.label==='Overdue'?'overdue':'left'}
            </span>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--surface2)', flexShrink:0 }}>
        {[{id:'details',icon:'📋',label:'Details'},{id:'updates',icon:'💬',label:'Updates'},{id:'files',icon:'📁',label:'Files'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'10px', background:'none', border:'none', borderBottom:tab===t.id?'2px solid var(--accent)':'2px solid transparent', color:tab===t.id?'var(--accent)':'var(--muted)', fontWeight:tab===t.id?700:400, cursor:'pointer', fontSize:13, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <span>{t.icon}</span>{t.label}
            {t.id==='updates' && updates.length>0 && <span style={{ background:'var(--accent)', color:'#fff', borderRadius:10, padding:'0 6px', fontSize:11, fontWeight:700 }}>{updates.length}</span>}
          </button>
        ))}
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>

        {/* DETAILS TAB */}
        {tab==='details' && (
          <div>
            <FieldRow label="Owner">
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                {(item.assigned_officers||[]).map((name,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', borderRadius:20, padding:'3px 10px 3px 4px' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:avatarColor(name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>{initials(name)}</div>
                    <span style={{ fontSize:12 }}>{name}</span>
                    <span onClick={()=>updateField('assigned_officers',(item.assigned_officers||[]).filter(x=>x!==name))} style={{ cursor:'pointer', color:'var(--muted)', fontSize:14, lineHeight:1 }}>×</span>
                  </div>
                ))}
                <div onClick={()=>setShowAssignPicker(s=>!s)} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', color:'var(--muted)', fontSize:12, padding:'3px 8px', borderRadius:20, border:'1px dashed var(--border)' }}>
                  <span style={{ fontSize:16 }}>+</span> Add person
                </div>
              </div>
              {showAssignPicker && (
                <div style={{ marginTop:8, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:8, maxHeight:200, overflowY:'auto' }}>
                  {teamMembers.map(m=>{
                    const assigned = (item.assigned_officers||[]).includes(m.full_name);
                    return (
                      <div key={m.id} onClick={()=>{ const curr=item.assigned_officers||[]; updateField('assigned_officers', assigned?curr.filter(x=>x!==m.full_name):[...curr,m.full_name]); }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:4, cursor:'pointer', background:assigned?'rgba(77,142,240,.15)':'' }}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                        onMouseOut={e=>e.currentTarget.style.background=assigned?'rgba(77,142,240,.15)':''}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:avatarColor(m.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>{initials(m.full_name)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13 }}>{m.full_name}</div>
                          <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{m.role}</div>
                        </div>
                        {assigned && <span style={{ color:'var(--accent)' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </FieldRow>
            <FieldRow label="Due Date">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="date" value={item.date||''} onChange={e=>updateField('date',e.target.value)}
                  style={{ width:'auto', padding:'4px 10px', fontSize:13, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text)' }} />
                {ds && <span style={{ fontSize:12, fontWeight:700, color:ds.color }}>{ds.label}</span>}
              </div>
            </FieldRow>
            <FieldRow label="Group">
              <select value={item.group_id||''} onChange={e=>updateField('group_id',e.target.value)}
                style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:13, padding:'4px 10px', borderRadius:5, width:'auto' }}>
                {allGroups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </FieldRow>
            {[
              {field:'lender',label:'Lender'},
              {field:'loan_officer',label:'Loan Officer'},
              {field:'processor',label:'Processor'},
              {field:'lock_expiration',label:'Lock Expiration',type:'date'},
              {field:'processor_contact',label:'Processor Contact'},
              {field:'escrow_email',label:'Escrow Email'},
            ].map(({field,label,type='text'})=>(
              <FieldRow key={field} label={label}>
                {editingField===field ? (
                  <input autoFocus type={type} value={item[field]||''}
                    onChange={e=>setItem(i=>({...i,[field]:e.target.value}))}
                    onBlur={()=>{ updateField(field,item[field]); setEditingField(null); }}
                    onKeyDown={e=>{ if(e.key==='Enter'){updateField(field,item[field]);setEditingField(null);} if(e.key==='Escape')setEditingField(null); }}
                    style={{ width:'100%', padding:'5px 10px', fontSize:13, background:'var(--surface2)', border:'1px solid var(--accent)', borderRadius:5, color:'var(--text)' }} />
                ) : (
                  <div onClick={()=>setEditingField(field)} style={{ padding:'5px 10px', fontSize:13, borderRadius:5, cursor:'text', minHeight:30, border:'1px solid transparent' }}
                    onMouseOver={e=>e.currentTarget.style.border='1px solid var(--border)'}
                    onMouseOut={e=>e.currentTarget.style.border='1px solid transparent'}>
                    {item[field]||<span style={{ color:'var(--border)' }}>Click to add...</span>}
                  </div>
                )}
              </FieldRow>
            ))}
          </div>
        )}

        {/* UPDATES TAB */}
        {tab==='updates' && (
          <div>
            <div style={{ background:'var(--surface2)', borderRadius:10, padding:14, marginBottom:20, border:'1px solid var(--border)', position:'relative' }}>
              <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor(profile.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(profile.full_name)}</div>
                <textarea ref={textareaRef} rows={3} value={newUpdate} onChange={handleTextChange}
                  placeholder="Write an update... type @ to mention a teammate"
                  onKeyDown={e=>{
                    if(mentionOpen){ if(e.key==='Escape'){setMentionOpen(false);return;} if(e.key==='Enter'&&filteredMembers.length>0){e.preventDefault();insertMention(filteredMembers[0]);return;} }
                    if(e.key==='Enter'&&e.ctrlKey) postUpdate();
                  }}
                  style={{ flex:1, resize:'vertical', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text)', lineHeight:1.6 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>Type <kbd style={{ background:'rgba(255,255,255,.1)', padding:'1px 5px', borderRadius:3, fontSize:10 }}>@</kbd> to mention · <kbd style={{ background:'rgba(255,255,255,.1)', padding:'1px 5px', borderRadius:3, fontSize:10 }}>Ctrl+Enter</kbd> to post</span>
                <button className="btn-primary btn-sm" onClick={postUpdate} disabled={posting||!newUpdate.trim()}>{posting?'Posting...':'Post Update'}</button>
              </div>
              {mentionOpen && filteredMembers.length>0 && (
                <div style={{ position:'absolute', bottom:'calc(100% + 4px)', left:0, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, width:240, boxShadow:'0 8px 24px rgba(0,0,0,.4)', overflow:'hidden' }}>
                  <div style={{ padding:'6px 10px', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>Team Members</div>
                  {filteredMembers.slice(0,6).map(m=>(
                    <div key={m.id} onMouseDown={e=>{ e.preventDefault(); insertMention(m); }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(77,142,240,.15)'}
                      onMouseOut={e=>e.currentTarget.style.background=''}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:avatarColor(m.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{initials(m.full_name)}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{m.full_name}</div>
                        <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {updates.length===0 && <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'30px 0' }}>No updates yet — be the first to post!</div>}
            {updates.map(u=>(
              <div key={u.id} style={{ display:'flex', gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:avatarColor(u.author_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(u.author_name||'?')}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{u.author_name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{new Date(u.created_at).toLocaleString()}</span>
                      {u.author_id===profile.id && <button onClick={()=>deleteUpdate(u.id)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:13, padding:0 }}>×</button>}
                    </div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', border:'1px solid var(--border)' }}>{renderBody(u.body)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FILES TAB */}
        {tab==='files' && (
          <div>
            {/* Upload buttons row */}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display:'none' }} />
              <button onClick={()=>fileInputRef.current?.click()} disabled={uploadingFile}
                style={{ flex:1, padding:'10px 0', background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                {uploadingFile ? '⏳ Uploading...' : '⬆️ Upload from Computer'}
              </button>
              <button onClick={()=>pickFile(attachDriveFile)} disabled={attachingDrive}
                style={{ flex:1, padding:'10px 0', background:'rgba(66,133,244,.1)', border:'1px solid rgba(66,133,244,.35)', color:'#7baff5', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .15s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(66,133,244,.22)'}
                onMouseOut={e=>e.currentTarget.style.background='rgba(66,133,244,.1)'}>
                <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 5-4.5 6.5v5.4h7.3c4.3-3.9 6.6-9.7 6.6-15.6z"/><path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.4l-7.3-5.4c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-3.9-12.6-9.2H3.8v5.6C7.5 41.8 15.2 46 24 46z"/><path fill="#FBBC05" d="M11.4 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-5.6H3.8C2.3 17.1 1.5 20.4 1.5 24s.8 6.9 2.3 9.8l7.6-5.6z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35.1 4.1 29.9 2 24 2 15.2 2 7.5 6.2 3.8 12.8l7.6 5.6c1.8-5.3 6.7-7.6 12.6-7.6z"/></svg>
                {attachingDrive ? 'Attaching...' : 'Attach from Google Drive'}
              </button>
            </div>

            {/* Drive attachments */}
            {driveAttachments.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 5-4.5 6.5v5.4h7.3c4.3-3.9 6.6-9.7 6.6-15.6z"/><path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.4l-7.3-5.4c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-3.9-12.6-9.2H3.8v5.6C7.5 41.8 15.2 46 24 46z"/><path fill="#FBBC05" d="M11.4 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-5.6H3.8C2.3 17.1 1.5 20.4 1.5 24s.8 6.9 2.3 9.8l7.6-5.6z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35.1 4.1 29.9 2 24 2 15.2 2 7.5 6.2 3.8 12.8l7.6 5.6c1.8-5.3 6.7-7.6 12.6-7.6z"/></svg>
                  Google Drive
                </div>
                {driveAttachments.map(da=>(
                  <div key={da.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'rgba(66,133,244,.07)', borderRadius:8, marginBottom:6, border:'1px solid rgba(66,133,244,.2)' }}>
                    {da.icon_url ? <img src={da.icon_url} width="18" height="18" alt="" style={{ flexShrink:0 }} /> : <span style={{ fontSize:18 }}>📄</span>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{da.file_name}</div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>Added by {da.creator_name} · Google Drive</div>
                    </div>
                    <a href={da.file_url} target="_blank" rel="noreferrer" style={{ color:'#7baff5', fontSize:12, fontWeight:600, textDecoration:'none', flexShrink:0 }}>Open ↗</a>
                    {(da.created_by===profile.id||profile.role==='admin') && (
                      <button onClick={()=>removeDriveAttachment(da.id)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:16, padding:'0 2px', lineHeight:1 }} title="Remove">×</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Regular uploaded files */}
            {files.length > 0 && (
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Uploaded Files</div>
            )}
            {files.length===0 && driveAttachments.length===0 && (
              <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'30px 0' }}>No files attached yet</div>
            )}
            {files.map(f=>(
              <div key={f.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--surface2)', borderRadius:8, marginBottom:8, border:'1px solid var(--border)' }}>
                <span style={{ fontSize:20 }}>{getFileIcon(f.name)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name.replace(/^[0-9]+_/,'')}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{formatFileSize(f.metadata?.size)}</div>
                </div>
                <a href={getFileUrl(f.name)} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize:12, textDecoration:'none', fontWeight:600 }}>⬇ Download</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UpdatesPanel({ item, profile, onClose, toast }) {
  const [tab, setTab] = useState('updates');
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [posting, setPosting] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionPos, setMentionPos] = useState({top:0,left:0});
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = React.useRef();
  const fileInputRef = React.useRef();

  useEffect(() => {
    loadUpdates(); loadFiles(); buildActivityLog();
    supabase.from('profiles').select('*').eq('company_name', profile.company_name).then(({data})=>setTeamMembers(data||[]));
  }, [item.id]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setNewUpdate(val);
    const cursor = e.target.selectionStart;
    // Look back from cursor for @ symbol
    const textBefore = val.slice(0, cursor);
    const atIdx = textBefore.lastIndexOf('@');
    if(atIdx !== -1) {
      const after = textBefore.slice(atIdx+1);
      // Only trigger if no space between @ and cursor
      if(!after.includes(' ') && !after.includes('\n')) {
        setMentionSearch(after.toLowerCase());
        setMentionStart(atIdx);
        setMentionOpen(true);
        // Position the dropdown near cursor
        const ta = textareaRef.current;
        if(ta) {
          const rect = ta.getBoundingClientRect();
          setMentionPos({ top: rect.top - 8, left: rect.left + 16 });
        }
        return;
      }
    }
    setMentionOpen(false);
  };

  const insertMention = (member) => {
    const before = newUpdate.slice(0, mentionStart);
    const after = newUpdate.slice(mentionStart + 1 + mentionSearch.length);
    const mention = '@' + member.full_name;
    const updated = before + mention + ' ' + after;
    setNewUpdate(updated);
    setMentionOpen(false);
    setMentionSearch('');
    setTimeout(()=>{ if(textareaRef.current) { textareaRef.current.focus(); const pos = (before+mention+' ').length; textareaRef.current.setSelectionRange(pos,pos); }}, 0);
  };

  const filteredMembers = teamMembers.filter(m=>
    m.id !== profile.id &&
    (mentionSearch==='' || m.full_name.toLowerCase().includes(mentionSearch))
  );

  // Render update body with highlighted @mentions
  const renderBody = (body) => {
    const parts = body.split(/(@[a-zA-Z][a-zA-Z0-9 ]*)/g);
    return parts.map((part,i)=>{
      if(part.startsWith('@') && teamMembers.some(m=>'@'+m.full_name===part.trim()||body.includes(part))) {
        return <span key={i} style={{ color:'var(--accent)', fontWeight:600 }}>{part}</span>;
      }
      return part;
    });
  };

  const loadUpdates = async () => {
    const {data} = await supabase.from('workspace_updates').select('*').eq('item_id', item.id).order('created_at', {ascending:true});
    setUpdates(data||[]);
  };

  const loadFiles = async () => {
    try {
      const {data} = await supabase.storage.from('workspace-files').list(`items/${item.id}`);
      setFiles(data||[]);
    } catch(e) { setFiles([]); }
  };

  const buildActivityLog = () => {
    const log = [{ type:'created', text:'Item created', date: item.created_at }];
    if(item.status) log.push({ type:'status', text:`Status set to "${item.status}"`, date: item.created_at });
    setActivityLog(log);
  };

  const postUpdate = async () => {
    if(!newUpdate.trim()) return;
    setPosting(true);
    const {data} = await supabase.from('workspace_updates').insert([{
      item_id:item.id, author_name:profile.full_name, author_id:profile.id, body:newUpdate
    }]).select().single();
    if(data) { setUpdates(u=>[...u, data]); setNewUpdate(''); toast('Update posted!'); }
    setPosting(false);
  };

  const deleteUpdate = async (id) => {
    await supabase.from('workspace_updates').delete().eq('id',id);
    setUpdates(u=>u.filter(x=>x.id!==id));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setUploadingFile(true);
    try {
      const path = `items/${item.id}/${Date.now()}_${file.name}`;
      const {error} = await supabase.storage.from('workspace-files').upload(path, file);
      if(!error) { toast('File uploaded!'); loadFiles(); }
      else { toast('Upload failed — storage may need setup'); }
    } catch(err) { toast('File upload requires Supabase Storage setup'); }
    setUploadingFile(false);
  };

  const getFileUrl = (fileName) => {
    const {data} = supabase.storage.from('workspace-files').getPublicUrl(`items/${item.id}/${fileName}`);
    return data?.publicUrl;
  };

  const formatFileSize = (bytes) => {
    if(!bytes) return '';
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if(['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
    if(['pdf'].includes(ext)) return '📄';
    if(['doc','docx'].includes(ext)) return '📝';
    if(['xls','xlsx','csv'].includes(ext)) return '📊';
    return '📎';
  };

  return (
    <div style={{ position:'fixed', top:0, right:0, width:500, height:'100vh', background:'var(--surface)', borderLeft:'1px solid var(--border)', zIndex:300, display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,.4)' }}>
      {/* Header */}
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:16, fontFamily:"Playfair Display,serif" }}>{item.name}</div>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20, border:'none', cursor:'pointer' }}>✕</button>
        </div>
        {item.status && <div style={{ display:'inline-block', background:item.status_color||'#4d8ef0', color:'#fff', padding:'3px 10px', borderRadius:4, fontSize:12, fontWeight:600, marginBottom:10 }}>{item.status}</div>}
        <div style={{ display:'flex', gap:6 }}>
          {['updates','files','activity'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'5px 14px', borderRadius:20, fontSize:12, border:'1px solid', borderColor:tab===t?'var(--accent)':'var(--border)', background:tab===t?'rgba(77,142,240,.2)':'transparent', color:tab===t?'var(--accent)':'var(--muted)', cursor:'pointer', fontWeight:600 }}>
              {t==='updates'?'💬 Updates':t==='files'?'📁 Files':'📋 Activity'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>

        {/* UPDATES TAB */}
        {tab==='updates' && (
          <div>
            {/* Post box */}
            <div style={{ background:'var(--surface2)', borderRadius:10, padding:14, marginBottom:20, border:'1px solid var(--border)', position:'relative' }}>
              <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor(profile.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(profile.full_name)}</div>
                <textarea ref={textareaRef} rows={3} value={newUpdate} onChange={handleTextChange}
                  placeholder="Write an update... type @ to mention a teammate"
                  onKeyDown={e=>{
                    if(mentionOpen) {
                      if(e.key==='Escape') { setMentionOpen(false); return; }
                      if(e.key==='ArrowDown'||e.key==='ArrowUp') { e.preventDefault(); return; }
                      if(e.key==='Enter' && filteredMembers.length>0) { e.preventDefault(); insertMention(filteredMembers[0]); return; }
                    }
                    if(e.key==='Enter'&&e.ctrlKey) postUpdate();
                  }}
                  style={{ flex:1, resize:'vertical', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text)', lineHeight:1.6 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>Type <kbd style={{ background:'rgba(255,255,255,.1)', padding:'1px 5px', borderRadius:3, fontSize:10 }}>@</kbd> to mention · <kbd style={{ background:'rgba(255,255,255,.1)', padding:'1px 5px', borderRadius:3, fontSize:10 }}>Ctrl+Enter</kbd> to post</span>
                <button className="btn-primary btn-sm" onClick={postUpdate} disabled={posting||!newUpdate.trim()}>{posting?'Posting...':'Post Update'}</button>
              </div>

              {/* @ Mention dropdown */}
              {mentionOpen && filteredMembers.length>0 && (
                <div style={{ position:'fixed', bottom: window.innerHeight - mentionPos.top + 8, left: mentionPos.left, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, width:240, boxShadow:'0 8px 24px rgba(0,0,0,.4)', overflow:'hidden' }}>
                  <div style={{ padding:'6px 10px', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
                    Team Members
                  </div>
                  {filteredMembers.slice(0,6).map(m=>(
                    <div key={m.id} onMouseDown={e=>{ e.preventDefault(); insertMention(m); }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer' }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(77,142,240,.15)'}
                      onMouseOut={e=>e.currentTarget.style.background=''}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:avatarColor(m.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{initials(m.full_name)}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{m.full_name}</div>
                        <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {updates.length===0 && <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'30px 0' }}>No updates yet — be the first to post!</div>}
            {updates.map(u=>(
              <div key={u.id} style={{ display:'flex', gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:avatarColor(u.author_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(u.author_name||'?')}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{u.author_name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{new Date(u.created_at).toLocaleString()}</span>
                      {u.author_id===profile.id && <button onClick={()=>deleteUpdate(u.id)} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:13, padding:0 }}>×</button>}
                    </div>
                  </div>
                  <div style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', border:'1px solid var(--border)' }}>{renderBody(u.body)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FILES TAB */}
        {tab==='files' && (
          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display:'none' }} />
            <button className="btn-primary btn-sm" onClick={()=>fileInputRef.current?.click()} disabled={uploadingFile} style={{ marginBottom:16, width:'100%', padding:12 }}>
              {uploadingFile ? '⏳ Uploading...' : '⬆️ Upload File'}
            </button>
            {files.length===0 && <div style={{ color:'var(--muted)', fontSize:13, textAlign:'center', padding:'30px 0' }}>No files attached yet</div>}
            {files.map(f=>(
              <div key={f.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--surface2)', borderRadius:8, marginBottom:8, border:'1px solid var(--border)' }}>
                <span style={{ fontSize:20 }}>{getFileIcon(f.name)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name.replace(/^[0-9]+_/,'')}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>{formatFileSize(f.metadata?.size)}</div>
                </div>
                <a href={getFileUrl(f.name)} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontSize:12, textDecoration:'none', fontWeight:600 }}>Download</a>
              </div>
            ))}
            <div style={{ marginTop:16, padding:12, background:'rgba(77,142,240,.08)', borderRadius:8, fontSize:12, color:'var(--muted)', border:'1px solid rgba(77,142,240,.2)' }}>
              💡 To enable file uploads, create a <strong>workspace-files</strong> storage bucket in Supabase with public access.
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab==='activity' && (
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}>Item History</div>
            {activityLog.map((entry,i)=>(
              <div key={i} style={{ display:'flex', gap:12, marginBottom:14 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', marginTop:5, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13 }}>{entry.text}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{new Date(entry.date).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {updates.length > 0 && <>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', margin:'20px 0 12px' }}>Updates ({updates.length})</div>
              {updates.map((u,i)=>(
                <div key={i} style={{ display:'flex', gap:12, marginBottom:14 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--success)', marginTop:5, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13 }}><strong>{u.author_name}</strong> posted an update</div>
                    <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.body}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{new Date(u.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </>}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── TRASH & ARCHIVE VIEW ────────────────────────────────────────────────────
function TrashArchiveView({ profile, workspaces, toast }) {
  const [tab, setTab] = useState('archive');
  const [archivedItems, setArchivedItems] = useState([]);
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ loadItems(); }, [tab]);

  const loadItems = async () => {
    setLoading(true);
    if(tab==='archive') {
      const {data} = await supabase.from('workspace_items').select('*').eq('company_id', profile.company_name).eq('archived', true).is('parent_id', null).order('created_at', {ascending:false});
      setArchivedItems(data||[]);
    } else {
      const {data} = await supabase.from('workspace_items').select('*').eq('company_id', profile.company_name).eq('trashed', true).is('parent_id', null).order('created_at', {ascending:false});
      setTrashedItems(data||[]);
    }
    setLoading(false);
  };

  const unarchive = async (item) => {
    await supabase.from('workspace_items').update({archived:false}).eq('id',item.id);
    setArchivedItems(p=>p.filter(i=>i.id!==item.id));
    toast('Item restored to workspace');
  };

  const restore = async (item) => {
    await supabase.from('workspace_items').update({trashed:false}).eq('id',item.id);
    setTrashedItems(p=>p.filter(i=>i.id!==item.id));
    toast('Item restored');
  };

  const deletePermanently = async (item) => {
    await supabase.from('workspace_items').delete().eq('id',item.id);
    setTrashedItems(p=>p.filter(i=>i.id!==item.id));
    toast('Permanently deleted');
  };

  const emptyTrash = async () => {
    for(const item of trashedItems) await supabase.from('workspace_items').delete().eq('id',item.id);
    setTrashedItems([]);
    toast('Trash emptied');
  };

  const getDaysLeft = (createdAt) => {
    const trashDate = new Date(createdAt);
    const deleteDate = new Date(trashDate.getTime() + 30*24*60*60*1000);
    const days = Math.ceil((deleteDate - new Date()) / (1000*60*60*24));
    return Math.max(0, days);
  };

  const getGroupName = (item) => {
    return item.group_id ? 'Unknown Group' : 'No Group';
  };

  const items = tab==='archive' ? archivedItems : trashedItems;

  return (
    <div style={{ padding:32 }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700, marginBottom:6 }}>
        {tab==='archive' ? '🗄️ Archive' : '🗑️ Trash'}
      </div>
      <div style={{ color:'var(--muted)', fontSize:13, marginBottom:24 }}>
        {tab==='archive' ? 'Archived items are hidden from workspaces but preserved here. Unarchive to restore.' : 'Trashed items are permanently deleted after 30 days.'}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:24 }}>
        {['archive','trash'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 20px', background:'none', border:'none', borderBottom: tab===t?'2px solid var(--accent)':'2px solid transparent', color:tab===t?'var(--accent)':'var(--muted)', fontWeight:tab===t?700:400, cursor:'pointer', fontSize:14, fontFamily:'inherit', marginBottom:-1 }}>
            {t==='archive'?'📦 Archive':'🗑️ Trash'}
          </button>
        ))}
        {tab==='trash' && trashedItems.length>0 && (
          <button onClick={emptyTrash} style={{ marginLeft:'auto', background:'var(--danger)', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
            Empty Trash
          </button>
        )}
      </div>

      {loading && <div style={{ color:'var(--muted)', textAlign:'center', padding:40 }}>Loading...</div>}
      {!loading && items.length===0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{tab==='archive'?'📦':'🗑️'}</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>{tab==='archive'?'Archive is empty':'Trash is empty'}</div>
          <div style={{ fontSize:13 }}>{tab==='archive'?'Archived items from workspaces will appear here.':'Deleted items will appear here for 30 days.'}</div>
        </div>
      )}

      {!loading && items.length>0 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)' }}>Item</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)' }}>Status</th>
                <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)' }}>
                  {tab==='trash'?'Days Until Deleted':'Date Archived'}
                </th>
                <th style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', width:200 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item=>(
                <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ fontWeight:500 }}>{item.name}</div>
                    {item.lender && <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Lender: {item.lender}</div>}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    {item.status ? <span style={{ background:item.status_color||'#4d8ef0', color:'#fff', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600 }}>{item.status}</span> : <span style={{ color:'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:12 }}>
                    {tab==='trash' ? (
                      <span style={{ color: getDaysLeft(item.created_at) < 7 ? 'var(--danger)' : 'var(--muted)' }}>
                        {getDaysLeft(item.created_at)} days left
                      </span>
                    ) : new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      {tab==='archive' ? (
                        <button onClick={()=>unarchive(item)} style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:5, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Restore to Workspace</button>
                      ) : (
                        <>
                          <button onClick={()=>restore(item)} style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:5, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Restore</button>
                          <button onClick={()=>deletePermanently(item)} style={{ background:'var(--danger)', color:'#fff', border:'none', borderRadius:5, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Delete Forever</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



// ─── GOOGLE INTEGRATION ───────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '1062524105477-sprjpqt5su4rrcgceuaodpbr1cb9il3g.apps.googleusercontent.com';
const GOOGLE_API_KEY   = 'AIzaSyC_kNTbeCmQssx8ObsYKs5jv_bq-hZ4qjw';
const GCAL_SCOPE  = 'https://www.googleapis.com/auth/calendar.events';
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function loadGoogleScript(id, src, onload) {
  if(document.getElementById(id)) { onload&&onload(); return; }
  const s = document.createElement('script');
  s.id=id; s.src=src; s.async=true; s.onload=onload;
  document.head.appendChild(s);
}

// Hook: get a Google OAuth2 access token for a given scope
function useGoogleToken(scope) {
  const storageKey = `gcal_token_${scope.replace(/[^a-z]/gi,'_')}`;
  const expiryKey  = `gcal_expiry_${scope.replace(/[^a-z]/gi,'_')}`;

  const getSaved = () => {
    try {
      const t = localStorage.getItem(storageKey);
      const e = localStorage.getItem(expiryKey);
      if(t && e && Date.now() < Number(e) - 60000) return t; // valid if >1min left
    } catch(_){}
    return null;
  };

  const [token, setToken]         = useState(getSaved);
  const [connected, setConnected] = useState(()=>!!getSaved());
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const clientRef = React.useRef(null);

  useEffect(()=>{
    if(window.google?.accounts?.oauth2) { setGsiLoaded(true); return; }
    loadGoogleScript('gsi-script','https://accounts.google.com/gsi/client',()=>setGsiLoaded(true));
  },[]);

  const hasConnectedKey = `gcal_has_connected_${scope.replace(/[^a-z]/gi,'_')}`;

  const saveToken = (t, expiresIn=3600) => {
    try {
      localStorage.setItem(storageKey, t);
      localStorage.setItem(expiryKey, String(Date.now() + expiresIn*1000));
      localStorage.setItem(hasConnectedKey, '1'); // remember user ever connected
    } catch(_){}
    setToken(t); setConnected(true);
  };

  const initClient = useCallback((onReady)=>{
    if(clientRef.current){ onReady&&onReady(); return; }
    clientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope,
      callback:(resp)=>{
        if(resp.access_token) saveToken(resp.access_token, resp.expires_in||3600);
        else console.error('Google auth failed', resp);
      },
      error_callback:(err)=>{
        // silent re-auth failed (session expired) — reset so user sees connect button
        if(err.type==='popup_failed_to_open'||err.type==='popup_closed') return;
        try { localStorage.removeItem(hasConnectedKey); } catch(_){}
        setConnected(false); setToken(null);
      },
    });
    onReady&&onReady();
  },[scope]);

  // On load: if user previously connected, silently refresh token (no popup)
  useEffect(()=>{
    if(!gsiLoaded) return;
    const hasConnected = localStorage.getItem(hasConnectedKey);
    if(!hasConnected) return;
    const saved = getSaved();
    if(saved) return; // still valid, nothing to do
    // Token expired but user has consented before — silently get a new one
    initClient(()=>{
      clientRef.current.requestAccessToken({ prompt:'' }); // prompt:'' = silent
    });
  },[gsiLoaded]);

  // Also set up a refresh timer: 5 min before expiry, silently renew
  useEffect(()=>{
    if(!token || !connected) return;
    try {
      const expiry = Number(localStorage.getItem(expiryKey)||0);
      const msUntilRefresh = expiry - Date.now() - 5*60*1000; // 5 min early
      if(msUntilRefresh <= 0) return;
      const timer = setTimeout(()=>{
        if(!clientRef.current) return;
        clientRef.current.requestAccessToken({ prompt:'' });
      }, msUntilRefresh);
      return ()=>clearTimeout(timer);
    } catch(_){}
  },[token, connected]);

  const connect = useCallback(()=>{
    if(!window.google?.accounts?.oauth2){ alert('Google Sign-In is still loading — please try again in a moment.'); return; }
    initClient(()=>{
      clientRef.current.requestAccessToken({ prompt:'consent' });
    });
  },[initClient]);

  const disconnect = useCallback(()=>{
    if(token) window.google?.accounts?.oauth2?.revoke(token,()=>{});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(expiryKey);
      localStorage.removeItem(hasConnectedKey);
    } catch(_){}
    setToken(null); setConnected(false); clientRef.current=null;
  },[token]);

  return { token, connected, gsiLoaded, connect, disconnect };
}

// Hook: Google Drive Picker
function useGoogleDrivePicker() {
  const getDriveSaved = () => {
    try {
      const t = localStorage.getItem('gdrive_token');
      const e = localStorage.getItem('gdrive_expiry');
      if(t && e && Date.now() < Number(e) - 60000) return t;
    } catch(_){}
    return null;
  };
  const [driveToken, setDriveToken] = useState(getDriveSaved);
  const [gapiReady, setGapiReady]   = useState(false);
  const clientRef = React.useRef(null);

  useEffect(()=>{
    loadGoogleScript('gsi-script','https://accounts.google.com/gsi/client',()=>{});
    loadGoogleScript('gapi-script','https://apis.google.com/js/api.js',()=>{
      window.gapi.load('picker',()=>setGapiReady(true));
    });
  },[]);

  const openPicker = useCallback((token, onPicked)=>{
    if(!gapiReady||!window.google?.picker){ alert('Google Picker is still loading — please try again in a second.'); return; }
    new window.google.picker.PickerBuilder()
      .addView(new window.google.picker.DocsView(window.google.picker.ViewId.DOCS).setIncludeFolders(false))
      .addView(window.google.picker.ViewId.PDFS)
      .addView(window.google.picker.ViewId.PRESENTATIONS)
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setTitle('Select a file from Google Drive')
      .setCallback((data)=>{
        if(data.action===window.google.picker.Action.PICKED){
          const f = data.docs[0];
          onPicked({ file_id:f.id, file_name:f.name, file_url:f.url||`https://drive.google.com/file/d/${f.id}/view`, mime_type:f.mimeType, icon_url:f.iconUrl });
        }
      })
      .build()
      .setVisible(true);
  },[gapiReady]);

  const pickFile = useCallback((onPicked)=>{
    if(driveToken){ openPicker(driveToken, onPicked); return; }
    if(!window.google?.accounts?.oauth2){ alert('Google Sign-In is still loading — please try again.'); return; }
    if(!clientRef.current){
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GDRIVE_SCOPE,
        callback:(resp)=>{
          if(resp.access_token){
            try { localStorage.setItem('gdrive_token', resp.access_token); localStorage.setItem('gdrive_expiry', String(Date.now()+(resp.expires_in||3600)*1000)); } catch(_){}
            setDriveToken(resp.access_token); openPicker(resp.access_token, onPicked);
          }
        }
      });
    }
    clientRef.current.requestAccessToken({ prompt:'consent' });
  },[driveToken, openPicker]);

  return { pickFile };
}

// ─── CALENDAR VIEW ───────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id:'meeting',    label:'Meeting',     icon:'📅', color:'#4d8ef0' },
  { id:'closing',   label:'Closing',     icon:'🏠', color:'#2ecc8a' },
  { id:'deadline',  label:'Deadline',    icon:'⚠️', color:'#e05252' },
  { id:'call',      label:'Call',        icon:'📞', color:'#f0b429' },
  { id:'followup',  label:'Follow-up',   icon:'🔄', color:'#9b59b6' },
  { id:'other',     label:'Other',       icon:'📌', color:'#00b8c4' },
];

function CalendarView({ profile, workspaces, toast }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [events, setEvents]         = useState([]);
  const [wsItems, setWsItems]       = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editEvent, setEditEvent]   = useState(null);   // null = new
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode]     = useState('month'); // 'month' | 'agenda'
  const [adminView, setAdminView]   = useState(true);    // admins default all-team

  // Google Calendar OAuth
  const { token: calToken, connected: calConnected, gsiLoaded, connect: connectGCal, disconnect: disconnectGCal } = useGoogleToken(GCAL_SCOPE);

  // form state
  const blankForm = { title:'', description:'', event_date:'', start_time:'', end_time:'', event_type:'meeting', workspace_item_id:'', is_shared:true, color:'#4d8ef0' };
  const [form, setForm] = useState(blankForm);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  // ── Google Calendar helpers ──
  const toGCalDate = (dateStr, timeStr) => {
    if(!dateStr) return '';
    const d = dateStr.replace(/-/g,'');
    if(!timeStr) return d;
    const t = timeStr.replace(':','')+'00';
    return `${d}T${t}`;
  };

  const openInGoogleCalendar = (ev) => {
    const start = toGCalDate(ev.event_date || form.event_date, ev.start_time || form.start_time);
    const end   = toGCalDate(ev.event_date || form.event_date, ev.end_time   || form.end_time) || start;
    const title = encodeURIComponent(ev.title || form.title || '');
    const desc  = encodeURIComponent(ev.description || form.description || '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}`;
    window.open(url, '_blank');
  };

  const exportICS = () => {
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Citizens Client Hub//EN','CALSCALE:GREGORIAN'];
    visibleEvents.forEach(ev => {
      const start = toGCalDate(ev.event_date, ev.start_time);
      const end   = toGCalDate(ev.event_date, ev.end_time) || start;
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.id}@citizensclienthub`);
      lines.push(`DTSTAMP:${toGCalDate(new Date().toISOString().slice(0,10), new Date().toTimeString().slice(0,5))}`);
      lines.push(`DTSTART:${start || toGCalDate(ev.event_date,'')}`);
      lines.push(`DTEND:${end || toGCalDate(ev.event_date,'')}`);
      lines.push(`SUMMARY:${ev.title}`);
      if(ev.description) lines.push(`DESCRIPTION:${ev.description.replace(/\n/g,'\\n')}`);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type:'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `citizens-calendar-${year}-${String(month+1).padStart(2,'0')}.ics`;
    a.click();
    toast('📅 Calendar exported!');
  };

  useEffect(() => { loadEvents(); loadWsItems(); loadTeam(); }, [year, month, profile.company_id]);

  const loadEvents = async () => {
    const start = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const endDate = new Date(year, month+1, 0);
    const end   = `${year}-${String(month+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
    let q = supabase.from('calendar_events').select('*')
      .eq('company_id', profile.company_name)
      .gte('event_date', start).lte('event_date', end)
      .order('start_time', { ascending: true });
    const { data } = await q;
    setEvents(data||[]);
  };

  const loadWsItems = async () => {
    const { data } = await supabase.from('workspace_items').select('id,name,date,status,group_id,trashed,archived').eq('company_id', profile.company_name).not('date','is',null).eq('archived', false);
    setWsItems((data||[]).filter(i=>i.date && !i.trashed));
  };

  const loadTeam = async () => {
    const { data } = await supabase.from('profiles').select('id,full_name,role').eq('company_name', profile.company_name);
    setTeamMembers(data||[]);
  };

  const pushToGoogleCalendar = async (payload) => {
    if(!calToken) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const gCalEvent = {
      summary: payload.title,
      description: payload.description||'',
      start: payload.start_time
        ? { dateTime:`${payload.event_date}T${payload.start_time}:00`, timeZone:tz }
        : { date: payload.event_date },
      end: payload.end_time
        ? { dateTime:`${payload.event_date}T${payload.end_time}:00`, timeZone:tz }
        : { date: payload.event_date },
    };
    try {
      const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',{
        method:'POST',
        headers:{ 'Authorization':`Bearer ${calToken}`, 'Content-Type':'application/json' },
        body:JSON.stringify(gCalEvent)
      });
      if(!r.ok) { const e=await r.json(); console.error('GCal error',e); return false; }
      return true;
    } catch(e) { console.error('GCal fetch error',e); return false; }
  };

  const saveEvent = async () => {
    if(!form.title.trim() || !form.event_date) { toast('Title and date are required'); return; }
    const payload = { ...form, company_id: profile.company_name, created_by: profile.id, creator_name: profile.full_name, workspace_item_id: form.workspace_item_id||null };
    if(editEvent) {
      await supabase.from('calendar_events').update(payload).eq('id', editEvent.id);
      const pushed = await pushToGoogleCalendar(payload);
      toast(pushed ? '✅ Event updated + synced to Google Calendar' : 'Event updated');
    } else {
      await supabase.from('calendar_events').insert([payload]);
      const pushed = await pushToGoogleCalendar(payload);
      toast(pushed ? '✅ Event created + added to Google Calendar!' : 'Event created ✅');
    }
    setShowModal(false); setEditEvent(null); setForm(blankForm);
    loadEvents();
  };

  const deleteEvent = async (id) => {
    await supabase.from('calendar_events').delete().eq('id', id);
    setEvents(e=>e.filter(x=>x.id!==id));
    setShowModal(false); setEditEvent(null); setForm(blankForm);
    toast('Event deleted');
  };

  const openNew = (dateStr) => {
    setEditEvent(null);
    setForm({...blankForm, event_date: dateStr });
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const openEdit = (e, ev) => {
    e.stopPropagation();
    setEditEvent(ev);
    setForm({ title:ev.title, description:ev.description||'', event_date:ev.event_date, start_time:ev.start_time||'', end_time:ev.end_time||'', event_type:ev.event_type||'meeting', workspace_item_id:ev.workspace_item_id||'', is_shared:ev.is_shared!==false, color:ev.color||'#4d8ef0' });
    setShowModal(true);
  };

  // Visible events filter
  const visibleEvents = events.filter(ev => {
    if(profile.role==='admin' || profile.role==='manager') return adminView ? true : ev.created_by===profile.id;
    return ev.created_by===profile.id || ev.is_shared;
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells = [];
  for(let i=0; i<totalCells; i++) {
    let d, m2, y2, isCurrentMonth = true;
    if(i < firstDay) {
      d = daysInPrev - firstDay + i + 1; m2 = month-1 < 0 ? 11 : month-1; y2 = month-1 < 0 ? year-1 : year; isCurrentMonth=false;
    } else if(i >= firstDay + daysInMonth) {
      d = i - firstDay - daysInMonth + 1; m2 = month+1 > 11 ? 0 : month+1; y2 = month+1 > 11 ? year+1 : year; isCurrentMonth=false;
    } else {
      d = i - firstDay + 1; m2 = month; y2 = year;
    }
    const dateStr = `${y2}-${String(m2+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = d===today.getDate() && m2===today.getMonth() && y2===today.getFullYear() && isCurrentMonth;
    const isWeekend = (i%7===0 || i%7===6);
    const dayEvents = visibleEvents.filter(ev=>ev.event_date===dateStr);
    const dayWsItems = wsItems.filter(wi=>wi.date===dateStr);
    cells.push({ d, dateStr, isCurrentMonth, isToday, isWeekend, dayEvents, dayWsItems });
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  // Agenda view: next 30 days of events
  const agendaEvents = [...visibleEvents].sort((a,b)=>a.event_date.localeCompare(b.event_date));

  const creatorColor = (ev) => {
    const m = teamMembers.find(t=>t.id===ev.created_by);
    return m ? avatarColor(m.full_name) : ev.color || '#4d8ef0';
  };

  const evTypeObj = (type) => EVENT_TYPES.find(t=>t.id===type) || EVENT_TYPES[0];

  return (
    <div style={{ padding:'24px 28px', minHeight:'100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:700 }}>Team Calendar</div>
          <div style={{ color:'var(--muted)', fontSize:13, marginTop:2 }}>
            {profile.role==='admin'||profile.role==='manager' ? 'All team events and loan deadlines' : 'Your events and shared team events'}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {(profile.role==='admin'||profile.role==='manager') && (
            <div style={{ display:'flex', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)', overflow:'hidden' }}>
              <button onClick={()=>setAdminView(true)} style={{ padding:'7px 16px', background:adminView?'var(--accent)':'transparent', color:adminView?'#fff':'var(--muted)', border:'none', borderRight:'1px solid var(--border)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>Team View</button>
              <button onClick={()=>setAdminView(false)} style={{ padding:'7px 16px', background:!adminView?'var(--accent)':'transparent', color:!adminView?'#fff':'var(--muted)', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>My Events</button>
            </div>
          )}
          <div style={{ display:'flex', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)', overflow:'hidden' }}>
            <button onClick={()=>setViewMode('month')} style={{ padding:'7px 16px', background:viewMode==='month'?'var(--accent)':'transparent', color:viewMode==='month'?'#fff':'var(--muted)', border:'none', borderRight:'1px solid var(--border)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>Month</button>
            <button onClick={()=>setViewMode('agenda')} style={{ padding:'7px 16px', background:viewMode==='agenda'?'var(--accent)':'transparent', color:viewMode==='agenda'?'#fff':'var(--muted)', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>Agenda</button>
          </div>
          <button onClick={exportICS} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
            onMouseOver={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)';}}
            onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export .ics
          </button>
          {/* Google Calendar Connect */}
          {calConnected ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'rgba(52,168,83,.15)', border:'1px solid rgba(52,168,83,.4)', borderRadius:6 }}>
              <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.4l-7.3-5.4c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-3.9-12.6-9.2H3.8v5.6C7.5 41.8 15.2 46 24 46z"/><path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 5-4.5 6.5v5.4h7.3c4.3-3.9 6.6-9.7 6.6-15.6z"/><path fill="#FBBC05" d="M11.4 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-5.6H3.8C2.3 17.1 1.5 20.4 1.5 24s.8 6.9 2.3 9.8l7.6-5.6z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35.1 4.1 29.9 2 24 2 15.2 2 7.5 6.2 3.8 12.8l7.6 5.6c1.8-5.3 6.7-7.6 12.6-7.6z"/></svg>
              <span style={{ fontSize:12, fontWeight:600, color:'#34A853' }}>Google Calendar On</span>
              <button onClick={disconnectGCal} style={{ background:'none', border:'none', color:'rgba(52,168,83,.7)', cursor:'pointer', fontSize:14, padding:'0 2px', lineHeight:1 }} title="Disconnect">×</button>
            </div>
          ) : (
            <button onClick={connectGCal} disabled={!gsiLoaded}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'rgba(66,133,244,.12)', border:'1px solid rgba(66,133,244,.35)', color:'#7baff5', borderRadius:6, fontSize:12, fontWeight:600, cursor:gsiLoaded?'pointer':'not-allowed', fontFamily:'inherit', transition:'all .15s' }}
              onMouseOver={e=>{ if(gsiLoaded) e.currentTarget.style.background='rgba(66,133,244,.25)'; }}
              onMouseOut={e=>e.currentTarget.style.background='rgba(66,133,244,.12)'}>
              <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 5-4.5 6.5v5.4h7.3c4.3-3.9 6.6-9.7 6.6-15.6z"/><path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.4l-7.3-5.4c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-3.9-12.6-9.2H3.8v5.6C7.5 41.8 15.2 46 24 46z"/><path fill="#FBBC05" d="M11.4 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-5.6H3.8C2.3 17.1 1.5 20.4 1.5 24s.8 6.9 2.3 9.8l7.6-5.6z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35.1 4.1 29.9 2 24 2 15.2 2 7.5 6.2 3.8 12.8l7.6 5.6c1.8-5.3 6.7-7.6 12.6-7.6z"/></svg>
              {gsiLoaded ? 'Connect Google Calendar' : 'Loading...'}
            </button>
          )}
          <button className="btn-primary btn-sm" onClick={()=>openNew(`${year}-${String(month+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`)}>+ New Event</button>
        </div>
      </div>

      {/* ── MONTH NAV ── */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', padding:'6px 12px', borderRadius:6, fontSize:16, cursor:'pointer', lineHeight:1 }}>‹</button>
        <div style={{ fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:700, minWidth:220 }}>{MONTHS[month]} {year}</div>
        <button onClick={nextMonth} style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', padding:'6px 12px', borderRadius:6, fontSize:16, cursor:'pointer', lineHeight:1 }}>›</button>
        <button onClick={()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ background:'none', border:'1px solid var(--border)', color:'var(--muted)', padding:'5px 12px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginLeft:4 }}>Today</button>

        {/* Legend */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)' }}>
            <div style={{ width:10, height:10, borderRadius:2, background:'#4d8ef0' }} /> Events
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)' }}>
            <div style={{ width:10, height:10, borderRadius:2, background:'#e05252', opacity:.7 }} /> Loan Deadlines
          </div>
          {adminView && (profile.role==='admin'||profile.role==='manager') && teamMembers.slice(0,4).map(m=>(
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--muted)' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:avatarColor(m.full_name) }} /> {m.full_name.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* ── MONTH VIEW ── */}
      {viewMode==='month' && (
        <div style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,.2)' }}>
          {/* Day headers */}
          <div className="cal-grid" style={{ minHeight:'auto' }}>
            {DAYS.map(d=>(
              <div key={d} className="cal-header-day" style={{ background:'var(--surface2)' }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="cal-grid">
            {cells.map((cell,i)=>(
              <div key={i}
                className={`cal-cell${cell.isToday?' today':''}${!cell.isCurrentMonth?' other-month':''}${cell.isWeekend?' weekend':''}`}
                onClick={()=>cell.isCurrentMonth && openNew(cell.dateStr)}>
                <div className="cal-day-num">{cell.d}</div>

                {/* Workspace item due dates */}
                {cell.dayWsItems.map(wi=>(
                  <span key={wi.id} className="cal-event-pill"
                    style={{ background:'rgba(224,82,82,.18)', color:'#e05252', borderLeft:'2px solid #e05252' }}
                    title={`Due: ${wi.name}`}
                    onClick={e=>e.stopPropagation()}>
                    ⚠ {wi.name}
                  </span>
                ))}

                {/* Calendar events */}
                {cell.dayEvents.slice(0,3).map(ev=>{
                  const color = adminView && (profile.role==='admin'||profile.role==='manager') ? creatorColor(ev) : (ev.color||'#4d8ef0');
                  const et = evTypeObj(ev.event_type);
                  return (
                    <span key={ev.id} className="cal-event-pill"
                      style={{ background:color+'28', color:color, borderLeft:`2px solid ${color}` }}
                      onClick={e=>openEdit(e,ev)}
                      title={`${ev.start_time?ev.start_time.slice(0,5)+' ':''} ${ev.title}${ev.creator_name?' · '+ev.creator_name:''}`}>
                      {et.icon} {ev.title}
                    </span>
                  );
                })}
                {cell.dayEvents.length > 3 && (
                  <span style={{ fontSize:10, color:'var(--muted)', paddingLeft:4 }}>+{cell.dayEvents.length-3} more</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AGENDA VIEW ── */}
      {viewMode==='agenda' && (
        <div style={{ background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)', overflow:'hidden' }}>
          {agendaEvents.length===0 && (
            <div style={{ padding:48, textAlign:'center', color:'var(--muted)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📅</div>
              No events this month. Click + New Event to get started.
            </div>
          )}
          {agendaEvents.map((ev,i)=>{
            const et = evTypeObj(ev.event_type);
            const color = adminView && (profile.role==='admin'||profile.role==='manager') ? creatorColor(ev) : (ev.color||'#4d8ef0');
            const prevDate = i>0 ? agendaEvents[i-1].event_date : null;
            const showDateHeader = ev.event_date !== prevDate;
            return (
              <React.Fragment key={ev.id}>
                {showDateHeader && (
                  <div style={{ padding:'10px 20px', background:'var(--surface2)', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                    {new Date(ev.event_date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
                  </div>
                )}
                <div onClick={e=>openEdit(e,ev)}
                  style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', borderBottom:'1px solid var(--border)', cursor:'pointer', borderLeft:`3px solid ${color}`, transition:'background .1s' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'}
                  onMouseOut={e=>e.currentTarget.style.background=''}>
                  <div style={{ fontSize:22, width:32, textAlign:'center', flexShrink:0 }}>{et.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{ev.title}</div>
                    {ev.description && <div style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>{ev.description}</div>}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    {ev.start_time && <div style={{ fontSize:13, fontWeight:600, color }}>{ev.start_time.slice(0,5)}{ev.end_time ? ` – ${ev.end_time.slice(0,5)}` : ''}</div>}
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{ev.is_shared ? '👥 Shared' : '🔒 Private'}</div>
                  </div>
                  {adminView && (profile.role==='admin'||profile.role==='manager') && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff' }}>{initials(ev.creator_name||'?')}</div>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{ev.creator_name}</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── EVENT MODAL ── */}
      {showModal && (
        <div className="event-modal-overlay" onClick={()=>{setShowModal(false);setEditEvent(null);setForm(blankForm);}}>
          <div className="event-modal" onClick={e=>e.stopPropagation()}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700 }}>{editEvent ? 'Edit Event' : 'New Event'}</div>
              <button onClick={()=>{setShowModal(false);setEditEvent(null);setForm(blankForm);}} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer', lineHeight:1, padding:4 }}>×</button>
            </div>

            {/* Event type selector */}
            <div style={{ marginBottom:16 }}>
              <label>Event Type</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                {EVENT_TYPES.map(t=>(
                  <button key={t.id} className={`event-type-btn${form.event_type===t.id?' active':''}`}
                    onClick={()=>{ setF('event_type',t.id); setF('color',t.color); }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={e=>setF('title',e.target.value)} placeholder="e.g. Closing — Smith Property" autoFocus />
            </div>

            {/* Date & Times */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Date *</label>
                <input type="date" value={form.event_date} onChange={e=>setF('event_date',e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>Start Time</label>
                <input type="time" value={form.start_time} onChange={e=>setF('start_time',e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>End Time</label>
                <input type="time" value={form.end_time} onChange={e=>setF('end_time',e.target.value)} />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Notes / Description</label>
              <textarea value={form.description} onChange={e=>setF('description',e.target.value)} rows={2} placeholder="Add any notes, location, or agenda..." style={{ resize:'vertical' }} />
            </div>

            {/* Link to workspace item */}
            <div className="form-group">
              <label>Link to Loan / Item (optional)</label>
              <select value={form.workspace_item_id} onChange={e=>setF('workspace_item_id',e.target.value)} style={{ width:'100%' }}>
                <option value="">— Not linked —</option>
                {wsItems.map(wi=>(
                  <option key={wi.id} value={wi.id}>{wi.name}{wi.date ? ` (due ${wi.date})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'10px 14px', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)' }}>
              <input type="checkbox" id="is_shared" checked={form.is_shared} onChange={e=>setF('is_shared',e.target.checked)} style={{ width:16, height:16, cursor:'pointer' }} />
              <label htmlFor="is_shared" style={{ margin:0, textTransform:'none', fontSize:13, color:'var(--text)', cursor:'pointer', fontWeight:400 }}>
                <span style={{ fontWeight:600 }}>Shared with team</span> — visible to all team members
              </label>
            </div>

            {/* Google Calendar banner */}
            {form.event_date && form.title && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(66,133,244,.1)', border:'1px solid rgba(66,133,244,.3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.5 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.1c-.5 2.7-2.1 5-4.5 6.5v5.4h7.3c4.3-3.9 6.6-9.7 6.6-15.6z"/><path fill="#34A853" d="M24 46c6.1 0 11.2-2 14.9-5.4l-7.3-5.4c-2 1.4-4.6 2.2-7.6 2.2-5.9 0-10.8-3.9-12.6-9.2H3.8v5.6C7.5 41.8 15.2 46 24 46z"/><path fill="#FBBC05" d="M11.4 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2v-5.6H3.8C2.3 17.1 1.5 20.4 1.5 24s.8 6.9 2.3 9.8l7.6-5.6z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35.1 4.1 29.9 2 24 2 15.2 2 7.5 6.2 3.8 12.8l7.6 5.6c1.8-5.3 6.7-7.6 12.6-7.6z"/></svg>
                  <span style={{ fontSize:12, color:'#9db8d4' }}>Add this event to your personal Google Calendar</span>
                </div>
                <button onClick={()=>openInGoogleCalendar(editEvent||form)}
                  style={{ flexShrink:0, padding:'6px 14px', background:'rgba(66,133,244,.2)', border:'1px solid rgba(66,133,244,.4)', color:'#7baff5', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all .15s' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(66,133,244,.35)'}
                  onMouseOut={e=>e.currentTarget.style.background='rgba(66,133,244,.2)'}>
                  Open in Google Calendar →
                </button>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
              <div>
                {editEvent && (ev => ev.created_by===profile.id || profile.role==='admin')(editEvent) && (
                  <button className="btn-danger btn-sm" onClick={()=>deleteEvent(editEvent.id)}>Delete</button>
                )}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn-secondary btn-sm" onClick={()=>{setShowModal(false);setEditEvent(null);setForm(blankForm);}}>Cancel</button>
                <button className="btn-primary btn-sm" onClick={saveEvent}>{editEvent?'Save Changes':'Create Event'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SVG Icons
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  contacts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  pipeline: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  team: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  branding: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  workspace: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  comment: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [view, setViewRaw] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [brand, setBrand] = useState({ company_name:'SalesForge', logo_url:'', brand_color:'#3b82f6' });
  const [workspaces, setWorkspaces] = useState([]);
  const [workspacesOpen, setWorkspacesOpen] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [sidebarNewWs, setSidebarNewWs] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Browser history navigation
  const setView = useCallback((newView, workspace=null) => {
    const state = { view: newView, workspaceId: workspace?.id||null, workspaceName: workspace?.name||null };
    window.history.pushState(state, '', `#${newView}${workspace?'-'+workspace.id:''}`);
    setViewRaw(newView);
    if(workspace !== undefined) setActiveWorkspace(workspace);
  }, []);

  useEffect(() => {
    const handlePop = (e) => {
      if(e.state) {
        setViewRaw(e.state.view||'dashboard');
        if(e.state.workspaceId) {
          setWorkspaces(prev => {
            const ws = prev.find(w=>w.id===e.state.workspaceId);
            setActiveWorkspace(ws||null);
            return prev;
          });
        } else {
          setActiveWorkspace(null);
        }
      } else {
        setViewRaw('dashboard');
        setActiveWorkspace(null);
      }
    };
    window.addEventListener('popstate', handlePop);
    // Set initial history state
    window.history.replaceState({ view:'dashboard', workspaceId:null }, '', '#dashboard');
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const toast = (msg) => { setToastMsg(msg); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setContacts([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setProfile(data);
      setBrand({ company_name: data.company_name||'SalesForge', logo_url: data.logo_url||'', brand_color: data.brand_color||'#3b82f6' });
      loadContacts(data.company_name);
      loadWorkspaces(data.company_name);
    }
  };

  const loadContacts = useCallback(async (company) => {
    const { data } = await supabase.from('contacts').select('*').eq('company_id', company).order('created_at', { ascending:false });
    setContacts(data||[]);
  }, []);

  const loadWorkspaces = useCallback(async (company) => {
    const { data } = await supabase.from('workspaces').select('*').eq('company_id', company).order('created_at', { ascending:true });
    setWorkspaces(data||[]);
  }, []);

  const refresh = () => { if(profile) { loadContacts(profile.company_name); loadWorkspaces(profile.company_name); } };

  const logout = async () => { await supabase.auth.signOut(); };

  if (!session) return <><style>{css}</style><AuthScreen onAuth={()=>{}} /></>;
  if (!profile) return <><style>{css}</style><div style={{ padding:40, textAlign:'center', color:'var(--muted)' }}>Loading...</div></>;

  const accentColor = brand.brand_color || '#3b82f6';
  const navItems = [
    { id:'dashboard', label:'Dashboard', icon:Icons.dashboard },
    { id:'contacts', label:'Contacts', icon:Icons.contacts },
    { id:'pipeline', label:'Lead Funnel', icon:Icons.pipeline },
    { id:'team', label:'Team', icon:Icons.team },
    { id:'calendar', label:'Calendar', icon:Icons.calendar },
    ...(profile.role==='admin' ? [{ id:'branding', label:'Branding', icon:Icons.branding }] : []),
  ];

  return (
    <>
      <style>{css}</style>
      <style>{`:root { --accent: ${accentColor}; }`}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding:'20px 20px', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <img src="https://www.citizensfinancial.co/wp-content/uploads/2026/01/Logo-01.png" alt="Citizens Financial" style={{ maxHeight:60, maxWidth:180, filter:'brightness(0) invert(1)' }} className="brand-name" />
        </div>
        <nav style={{ flex:1, padding:'12px 0', overflowY:'auto' }}>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${view===n.id&&!activeWorkspace?'active':''}`} onClick={()=>{ setView(n.id, null); }}>
              <span>{n.icon}</span><span className="nav-label">{n.label}</span>
            </div>
          ))}
          {/* Main Workspace Dropdown */}
          <div style={{ margin:'8px 0' }}>
            {/* Main Workspace Header */}
            <div onClick={()=>setWorkspacesOpen(o=>!o)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', cursor:'pointer', borderRadius:6, margin:'0 8px' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
              onMouseOut={e=>e.currentTarget.style.background=''}>
              <div style={{ width:24, height:24, borderRadius:6, background:'linear-gradient(135deg,#4d8ef0,#1a56db)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <span className="nav-label" style={{ flex:1, fontSize:13, fontWeight:600, color:'#fff' }}>Main Workspace</span>
              <span className="nav-label" style={{ transform:workspacesOpen?'rotate(0)':'rotate(-90deg)', transition:'transform .2s', display:'flex', color:'rgba(255,255,255,.4)' }}>{Icons.chevron}</span>
            </div>
            {/* Workspace Children */}
            {workspacesOpen && (
              <div style={{ marginLeft:8 }}>
                {workspaces.map(w=>(
                  <div key={w.id} className={`nav-item ${activeWorkspace?.id===w.id?'active':''}`}
                    onClick={()=>{ setView('workspace', w); }}
                    style={{ paddingLeft:40, fontSize:13 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span className="nav-label">{w.name}</span>
                  </div>
                ))}
                {profile.role==='admin' && (
                  <div onClick={()=>setSidebarNewWs(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 16px 6px 40px', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:12, borderRadius:6, margin:'0 8px' }}
                    onMouseOver={e=>e.currentTarget.style.color='rgba(255,255,255,.6)'}
                    onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,.3)'}>
                    <span style={{ display:'flex' }}>{Icons.plus}</span>
                    <span className="nav-label">Add Workspace</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
        <div style={{ padding:16, borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:avatarColor(profile.full_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{initials(profile.full_name||'?')}</div>
            <div className="nav-label" style={{ fontSize:13 }}>
              <div style={{ fontWeight:600, color:'#fff' }}>{profile.full_name}</div>
              <div style={{ color:'var(--sidebar-text)', fontSize:11, textTransform:'capitalize' }}>{profile.role}</div>
            </div>
          </div>
          <button style={{ width:'100%', padding:'8px', borderRadius:6, background:'rgba(255,255,255,.1)', color:'#c9d3e8', border:'1px solid rgba(255,255,255,.15)', fontSize:13, cursor:'pointer', fontWeight:500 }} onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* Top Bar */}
      <TopBar profile={profile} onSearch={setGlobalSearch} searchOpen={searchOpen} setSearchOpen={setSearchOpen} onNavigate={v=>setView(v,null)} onLogout={logout}
        onGetResults={(q)=>{
          const r = [];
          const ql = q.toLowerCase();
          contacts.filter(c=>(c.full_name||'').toLowerCase().includes(ql)||(c.email||'').toLowerCase().includes(ql)).slice(0,5).forEach(c=>r.push({icon:'👤',title:c.full_name,subtitle:c.email||c.company||'',type:'Contact',action:()=>setSelectedContact(c)}));
          workspaces.filter(w=>(w.name||'').toLowerCase().includes(ql)).forEach(w=>r.push({icon:'📋',title:w.name,subtitle:'Workspace',type:'Workspace',action:()=>setView('workspace',w)}));
          if('contacts'.includes(ql)) r.push({icon:'👥',title:'Contacts',subtitle:'View all contacts',type:'Page',action:()=>setView('contacts',null)});
          if('pipeline'.includes(ql)||'funnel'.includes(ql)) r.push({icon:'〽️',title:'Lead Funnel',subtitle:'View pipeline',type:'Page',action:()=>setView('pipeline',null)});
          if('team'.includes(ql)) r.push({icon:'🏢',title:'Team',subtitle:'Manage team members',type:'Page',action:()=>setView('team',null)});
          if('calendar'.includes(ql)||'events'.includes(ql)) r.push({icon:'📅',title:'Calendar',subtitle:'Team calendar & events',type:'Page',action:()=>setView('calendar',null)});
          return r;
        }}
      />

      {/* Main */}
      <div className="main">
        {view==='dashboard' && <Dashboard contacts={contacts} workspaces={workspaces} onOpenWorkspace={w=>{ setView('workspace', w); }} profile={profile} onCreateWorkspace={async(name)=>{ const {data}=await supabase.from('workspaces').insert([{company_id:profile.company_name,name}]).select().single(); if(data){setWorkspaces(w=>[...w,data]); setView('workspace',data);}}} onNavigate={v=>setView(v,null)} />}
        {view==='contacts' && <ContactsView contacts={contacts} onAdd={()=>setShowForm(true)} onSelect={c=>setSelectedContact(c)} toast={toast} />}
        {view==='pipeline' && <PipelineView contacts={contacts} onSelect={c=>setSelectedContact(c)} />}
        {view==='team' && <TeamView profile={profile} toast={toast} />}
        {view==='branding' && <BrandingView profile={profile} onBrandUpdate={b=>setBrand(b)} toast={toast} />}
        {view==='trash' && <TrashArchiveView profile={profile} workspaces={workspaces} toast={toast} />}
        {view==='calendar' && <CalendarView profile={profile} workspaces={workspaces} toast={toast} />}
        {view==='workspace' && activeWorkspace && <WorkspaceView workspace={activeWorkspace} profile={profile} toast={toast}
  allWorkspaces={workspaces}
  onSwitchWorkspace={w=>setView('workspace',w)}
  onAddWorkspace={()=>setSidebarNewWs(true)}
  onRename={async(name)=>{ await supabase.from('workspaces').update({name}).eq('id',activeWorkspace.id); setWorkspaces(w=>w.map(x=>x.id===activeWorkspace.id?{...x,name}:x)); setActiveWorkspace(a=>({...a,name})); }}
  onDelete={async()=>{ if(!window.confirm('Delete this workspace?')) return; await supabase.from('workspaces').delete().eq('id',activeWorkspace.id); setWorkspaces(w=>w.filter(x=>x.id!==activeWorkspace.id)); setView('dashboard', null); }} />}
      </div>

      {/* Contact Drawer */}
      <ContactDrawer
        contact={selectedContact}
        onClose={()=>setSelectedContact(null)}
        onEdit={()=>{ setEditContact(selectedContact); setSelectedContact(null); setShowForm(true); }}
        onDelete={async()=>{ await supabase.from('contacts').delete().eq('id',selectedContact.id); setSelectedContact(null); refresh(); toast('Contact deleted'); }}
        companyId={profile.company_name}
        toast={toast}
      />

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          contact={editContact}
          companyId={profile.company_name}
          onSave={()=>{ setShowForm(false); setEditContact(null); refresh(); toast(editContact?'Contact updated':'Contact added!'); }}
          onClose={()=>{ setShowForm(false); setEditContact(null); }}
        />
      )}

      {sidebarNewWs && <InputModal title="New Workspace" placeholder="e.g. Loans In Process" onConfirm={async(name)=>{ const {data}=await supabase.from('workspaces').insert([{company_id:profile.company_name,name}]).select().single(); if(data){setWorkspaces(w=>[...w,data]); setView('workspace',data); setSidebarNewWs(false);}}} onClose={()=>setSidebarNewWs(false)} />}
      <Toast msg={toastMsg} onClose={()=>setToastMsg('')} />
    </>
  );
}
