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
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGES = ['New Lead','Contacted','Qualified','Proposal','Negotiation','Converted','Non-Conversion'];
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
function TopBar({ profile, onSearch, searchOpen, setSearchOpen, onNavigate, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPage, setHelpPage] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
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
      {/* Global search */}
      {searchOpen && (
        <div style={{ position:'relative', marginRight:'auto' }} onClick={stop}>
          <input autoFocus value={searchVal} onChange={e=>{ setSearchVal(e.target.value); onSearch(e.target.value); }}
            placeholder="Search everything..." onBlur={()=>{ if(!searchVal) setSearchOpen(false); }}
            style={{ width:280, paddingLeft:36, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', fontSize:13 }} />
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
      )}

      {/* Notification bell */}
      <button className="topbar-btn" title="Notifications" style={{ position:'relative' }}
        onClick={e=>{ stop(e); setNotifOpen(o=>!o); setProfileOpen(false); setHelpOpen(false); setAppsOpen(false); }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
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
      <div onClick={stop} style={{ position:'fixed', top:56, right:56, width:320, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 12px 32px rgba(0,0,0,.4)', zIndex:9999 }}>
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14 }}>Notifications</div>
        <div style={{ padding:'32px 16px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
          You're all caught up!
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
          { icon:'🗑️', label:'Trash / Archive', action:()=>{ onNavigate('dashboard'); setProfileOpen(false); } },
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
  const [search, setSearch] = useState(null);
  const [stageFilter, setStageFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [showMassEmail, setShowMassEmail] = useState(false);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
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

function WorkspaceView({ workspace, profile, toast, onRename, onDelete }) {
  const [inputModal, setInputModal] = useState(null);
  const [showStatusManager, setShowStatusManager] = useState(false);
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
  const [updatesPanel, setUpdatesPanel] = useState(null);
  const [search, setSearch] = useState(null);
  const [filterOfficer, setFilterOfficer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    loadGroups();
    loadStatuses();
    supabase.from('profiles').select('*').eq('company_name', profile.company_name).then(({data})=>setTeamMembers(data||[]));
  }, [workspace.id]);

  const loadGroups = async () => {
    const {data:grps} = await supabase.from('workspace_groups').select('*').eq('workspace_id', workspace.id).order('position');
    setGroups(grps||[]);
    if(grps) grps.forEach(g => loadItems(g.id));
  };

  const loadItems = async (groupId) => {
    const {data} = await supabase.from('workspace_items').select('*').eq('group_id', groupId).is('parent_id', null).eq('archived', false).order('position');
    setItems(prev => ({...prev, [groupId]: data||[]}));
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

  const deleteSelectedItems = async (groupId, itemIds) => {
    for(const id of itemIds) await supabase.from('workspace_items').delete().eq('id',id);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).filter(i=>!itemIds.includes(i.id))}));
    setSelected({});
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
    await supabase.from('workspace_items').delete().eq('id',itemId);
    setItems(prev=>({...prev,[groupId]:(prev[groupId]||[]).filter(i=>i.id!==itemId)}));
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
      <div style={{ padding:'16px 28px 0', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontFamily:"Playfair Display,serif", fontSize:24, fontWeight:700 }}>{workspace.name}</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        {profile.role==='admin' && <>
          <button className="topbar-btn" onClick={()=>setInputModal({ title:'Rename Workspace', placeholder:'Workspace name', defaultValue:workspace.name, onConfirm:onRename })} title="Rename" style={{ padding:6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="topbar-btn" onClick={onDelete} title="Delete workspace" style={{ padding:6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </>}
      </div>

      {/* Tab bar */}
      <div style={{ padding:'8px 28px 0', display:'flex', gap:0, borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:'6px 16px', fontSize:13, fontWeight:600, color:'var(--accent)', borderBottom:'2px solid var(--accent)', cursor:'pointer', marginBottom:-1 }}>Main table</div>
        <div style={{ padding:'6px 16px', fontSize:13, color:'var(--muted)', cursor:'pointer' }}>+ Add view</div>
      </div>

      {/* Toolbar */}
      <div className="ws-toolbar">
        {/* New Item */}
        <div style={{ display:'flex', borderRadius:6, overflow:'hidden', boxShadow:'0 1px 3px rgba(26,86,219,.3)' }}>
          <button onClick={()=>{ if(groups.length>0) addItem(groups[0].id); else addGroup(); }} style={{ background:'var(--accent)', color:'#fff', border:'none', padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            + New Item
          </button>
          <button onClick={addGroup} style={{ background:'#3a7de8', color:'#fff', border:'none', borderLeft:'1px solid rgba(255,255,255,.2)', padding:'7px 10px', cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
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

      {groups.map(group => {
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
                      {COLUMNS.map(col=>(
                        <th key={col} style={{ padding:'8px 10px', textAlign:'left', fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', cursor:'pointer', minWidth:COL_WIDTHS[col] }}
                          onClick={()=>{ if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortCol(col); setSortDir('asc'); } }}>
                          {COL_LABELS[col]} {sortCol===col?(sortDir==='asc'?'↑':'↓'):''}
                        </th>
                      ))}
                      <th style={{ width:40, padding:'8px 10px', borderBottom:'1px solid var(--border)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupItems.map(item=>(
                      <React.Fragment key={item.id}>
                        <WorkspaceItemRow
                          item={item} group={group} statuses={statuses} teamMembers={teamMembers} profile={profile}
                          selected={groupSelected.has(item.id)}
                          onSelect={()=>toggleSelect(group.id, item.id)}
                          onUpdate={(field,val)=>updateItem(group.id,item.id,field,val)}
                          onDelete={()=>deleteItem(group.id,item.id)}
                          onOpenUpdates={()=>setUpdatesPanel(item)}
                          onAddSubItem={()=>{ addSubItem(item.id, group.id); loadSubItems(item.id); }}
                          onToggleExpand={()=>{ setExpandedItems(p=>({...p,[item.id]:!p[item.id]})); if(!expandedItems[item.id]) loadSubItems(item.id); }}
                          isExpanded={!!expandedItems[item.id]}
                          subItemCount={(subItems[item.id]||[]).length}
                          PRIORITY_COLORS={PRIORITY_COLORS}
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

      {/* Add new group button */}
      <button onClick={addGroup} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px dashed var(--border)', color:'var(--muted)', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontSize:13, marginTop:8 }}>
        + Add new group
      </button>

      </div>{/* end padding wrapper */}

      {/* Bottom action bar when items selected */}
      {totalSelected > 0 && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 20px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 8px 32px rgba(0,0,0,.4)', zIndex:200, minWidth:500 }}>
          <div style={{ background:'var(--accent)', color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700 }}>{totalSelected}</div>
          <span style={{ fontSize:13, color:'var(--muted)' }}>item{totalSelected>1?'s':''} selected</span>
          <div style={{ width:1, height:24, background:'var(--border)' }} />
          {Object.entries(selected).map(([gId, gSet])=> gSet.size>0 ? (
            <React.Fragment key={gId}>
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
                <span style={{ fontSize:18 }}>🗑️</span>Delete
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

      {/* Updates Panel */}
      {updatesPanel && <UpdatesPanel item={updatesPanel} profile={profile} onClose={()=>setUpdatesPanel(null)} toast={toast} />}
      {/* Input Modal */}
      {inputModal && <InputModal title={inputModal.title} placeholder={inputModal.placeholder} defaultValue={inputModal.defaultValue||''} onConfirm={inputModal.onConfirm} onClose={()=>setInputModal(null)} />}
      {/* Status Manager */}
      {showStatusManager && <StatusManager workspaceId={workspace.id} companyId={profile.company_name} statuses={statuses} onUpdate={setStatuses} onClose={()=>setShowStatusManager(false)} />}
    </div>
  );
}

// ─── WORKSPACE ITEM ROW ───────────────────────────────────────────────────────
function WorkspaceItemRow({ item, group, statuses, teamMembers, profile, onUpdate, onDelete, onOpenUpdates, onAddSubItem, onToggleExpand, isExpanded, subItemCount, selected, onSelect, PRIORITY_COLORS }) {
  const [editing, setEditing] = useState(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pickerPos, setPickerPos] = useState({top:0,left:0});
  const [assignPos, setAssignPos] = useState({top:0,left:0});

  React.useEffect(()=>{
    if(!showStatusPicker && !showAssignPicker) return;
    const close = ()=>{ setShowStatusPicker(false); setShowAssignPicker(false); };
    document.addEventListener('click', close, true);
    return ()=>document.removeEventListener('click', close, true);
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
    return <div onClick={()=>setEditing(field)} style={{ cursor:'text', padding:'4px 6px', minHeight:24, borderRadius:4, ...style }}>{item[field]||<span style={{color:'var(--border)'}}>—</span>}</div>;
  };

  return (
    <tr style={{ borderBottom:'1px solid var(--border)', background: selected?'rgba(77,142,240,.08)':'' }}
      onMouseOver={e=>{ e.currentTarget.style.background=selected?'rgba(77,142,240,.12)':'rgba(255,255,255,.03)'; setHovered(true); }}
      onMouseOut={e=>{ e.currentTarget.style.background=selected?'rgba(77,142,240,.08)':''; setHovered(false); }}>
      <td style={{ padding:'6px 10px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
          <input type="checkbox" checked={!!selected} onChange={onSelect}
            style={{ cursor:'pointer', width:14, height:14, accentColor:'var(--accent)' }} />
          {(hovered||subItemCount>0) && (
            <button onClick={onToggleExpand} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:2, fontSize:10, transform:isExpanded?'rotate(90deg)':'rotate(0)', transition:'transform .15s' }} title="Toggle sub-items">▶</button>
          )}
        </div>
      </td>
      <td style={{ padding:'4px 10px', minWidth:200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ flex:1 }}><EditableCell field="name" style={{ fontWeight:500 }} /></div>
          {hovered && <button onClick={onOpenUpdates} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:3, display:'flex', alignItems:'center', flexShrink:0, opacity:.7 }} title="Updates">{Icons.comment}</button>}
          {hovered && subItemCount===0 && <button onClick={onAddSubItem} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:3, fontSize:10, flexShrink:0, opacity:.7 }} title="Add sub-item">⊕</button>}
        </div>
      </td>
      <td style={{ padding:'4px 10px', position:'relative' }}>
        <div onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); const spaceBelow=window.innerHeight-r.bottom; const dropH=Math.min(320, statuses.length*40+60); const top=spaceBelow<dropH ? r.top-dropH-4 : r.bottom+4; setPickerPos({top,left:r.left}); setShowStatusPicker(s=>!s); setShowAssignPicker(false); }} style={{ display:'inline-flex', alignItems:'center', background:statusColor, color:'#fff', padding:'3px 10px', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          {item.status||'No Status'}
        </div>
        {showStatusPicker && (
          <div style={{ position:'fixed', top:pickerPos.top, left:pickerPos.left, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, width:240, maxHeight:400, overflowY:'auto', boxShadow:'0 12px 32px rgba(0,0,0,.5)' }}>
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
      </td>
      <td style={{ padding:'4px 10px' }}>
        <select value={item.priority||'Medium'} onChange={e=>onUpdate('priority',e.target.value)} style={{ background:'transparent', border:'none', color:PRIORITY_COLORS[item.priority||'Medium'], fontWeight:700, fontSize:12, cursor:'pointer', width:'auto', padding:'2px 4px' }}>
          {['Low','Medium','High','Critical'].map(p=><option key={p} style={{ background:'#1a2e4a', color:PRIORITY_COLORS[p] }}>{p}</option>)}
        </select>
      </td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="date" type="date" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="lender" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="loan_officer" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="processor" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="lock_expiration" type="date" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="processor_contact" /></td>
      <td style={{ padding:'4px 10px' }}><EditableCell field="escrow_email" /></td>
      <td style={{ padding:'4px 10px', position:'relative' }}>
        <div onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); setAssignPos({top:r.bottom+4,left:Math.max(0,r.right-240)}); setShowAssignPicker(s=>!s); setShowStatusPicker(false); }} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
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
          <div style={{ position:'fixed', top:assignPos.top, left:assignPos.left, zIndex:9999, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:8, width:240, boxShadow:'0 12px 32px rgba(0,0,0,.5)' }}>
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
      <td style={{ padding:'4px 10px' }}>
        <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:14, padding:4 }}>×</button>
      </td>
    </tr>
  );
}

// ─── UPDATES PANEL ────────────────────────────────────────────────────────────
function UpdatesPanel({ item, profile, onClose, toast }) {
  const [tab, setTab] = useState('updates');
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [posting, setPosting] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const fileInputRef = React.useRef();

  useEffect(() => { loadUpdates(); loadFiles(); buildActivityLog(); }, [item.id]);

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
            <div style={{ background:'var(--surface2)', borderRadius:10, padding:14, marginBottom:20, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:avatarColor(profile.full_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{initials(profile.full_name)}</div>
                <textarea rows={3} value={newUpdate} onChange={e=>setNewUpdate(e.target.value)}
                  placeholder="Write an update... mention teammates with @name"
                  onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) postUpdate(); }}
                  style={{ flex:1, resize:'vertical', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text)', lineHeight:1.6 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>Ctrl+Enter to post</span>
                <button className="btn-primary btn-sm" onClick={postUpdate} disabled={posting||!newUpdate.trim()}>{posting?'Posting...':'Post Update'}</button>
              </div>
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
                  <div style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', fontSize:13, lineHeight:1.7, whiteSpace:'pre-wrap', border:'1px solid var(--border)' }}>{u.body}</div>
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
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name.replace(/^\d+_/,'')}</div>
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
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [view, setView] = useState('dashboard');
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
            <div key={n.id} className={`nav-item ${view===n.id&&!activeWorkspace?'active':''}`} onClick={()=>{ setView(n.id); setActiveWorkspace(null); }}>
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
                    onClick={()=>{ setActiveWorkspace(w); setView('workspace'); }}
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
      <TopBar profile={profile} onSearch={setGlobalSearch} searchOpen={searchOpen} setSearchOpen={setSearchOpen} onNavigate={v=>{ setView(v); setActiveWorkspace(null); }} onLogout={logout} />

      {/* Main */}
      <div className="main">
        {view==='dashboard' && <Dashboard contacts={contacts} workspaces={workspaces} onOpenWorkspace={w=>{ setActiveWorkspace(w); setView('workspace'); }} profile={profile} onCreateWorkspace={async(name)=>{ const {data}=await supabase.from('workspaces').insert([{company_id:profile.company_name,name}]).select().single(); if(data){setWorkspaces(w=>[...w,data]); setActiveWorkspace(data); setView('workspace');}}} onNavigate={v=>{ setView(v); setActiveWorkspace(null); }} />}
        {view==='contacts' && <ContactsView contacts={contacts} onAdd={()=>setShowForm(true)} onSelect={c=>setSelectedContact(c)} toast={toast} />}
        {view==='pipeline' && <PipelineView contacts={contacts} onSelect={c=>setSelectedContact(c)} />}
        {view==='team' && <TeamView profile={profile} toast={toast} />}
        {view==='branding' && <BrandingView profile={profile} onBrandUpdate={b=>setBrand(b)} toast={toast} />}
        {view==='workspace' && activeWorkspace && <WorkspaceView workspace={activeWorkspace} profile={profile} toast={toast} onRename={async(name)=>{ await supabase.from('workspaces').update({name}).eq('id',activeWorkspace.id); setWorkspaces(w=>w.map(x=>x.id===activeWorkspace.id?{...x,name}:x)); setActiveWorkspace(a=>({...a,name})); }} onDelete={async()=>{ if(!window.confirm('Delete this workspace?')) return; await supabase.from('workspaces').delete().eq('id',activeWorkspace.id); setWorkspaces(w=>w.filter(x=>x.id!==activeWorkspace.id)); setActiveWorkspace(null); setView('dashboard'); }} />}
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

      {sidebarNewWs && <InputModal title="New Workspace" placeholder="e.g. Loans In Process" onConfirm={async(name)=>{ const {data}=await supabase.from('workspaces').insert([{company_id:profile.company_name,name}]).select().single(); if(data){setWorkspaces(w=>[...w,data]); setActiveWorkspace(data); setView('workspace'); setSidebarNewWs(false);}}} onClose={()=>setSidebarNewWs(false)} />}
      <Toast msg={toastMsg} onClose={()=>setToastMsg('')} />
    </>
  );
}
