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
  .main { margin-left:240px; min-height:100vh; background:linear-gradient(to right, #0f1c3f 0%, #152540 20%, #1a2e4a 60%, #1e3350 100%); }
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

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ contacts }) {
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
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {[
          ['Total Contacts',total,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d8ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,'blue'],
          ['Funnel Value',fmt(pipeline),<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ecc8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,'green'],
          ['Conversion Rate',`${winRate}%`,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0b429" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,'yellow'],
          ['Total Revenue',fmt(closed),<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d8ef0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,'purple'],
        ].map(([label,val,icon,color])=>(
          <div key={label} className="stat-card">
            <div style={{ marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:24, fontWeight:700, color:`var(--${color==='blue'?'accent':color==='green'?'success':color==='yellow'?'warning':'accent2'})` }}>{val}</div>
            <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, marginBottom:16 }}>Funnel by Stage</div>
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

      <div className="card">
        <div style={{ fontWeight:600, marginBottom:14 }}>Recent Contacts</div>
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


// SVG Icons
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  contacts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  pipeline: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  team: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  branding: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
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
    }
  };

  const loadContacts = useCallback(async (company) => {
    const { data } = await supabase.from('contacts').select('*').eq('company_id', company).order('created_at', { ascending:false });
    setContacts(data||[]);
  }, []);

  const refresh = () => profile && loadContacts(profile.company_name);

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
        <nav style={{ flex:1, padding:'12px 0' }}>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
              <span>{n.icon}</span><span className="nav-label">{n.label}</span>
            </div>
          ))}
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

      {/* Main */}
      <div className="main">
        {view==='dashboard' && <Dashboard contacts={contacts} />}
        {view==='contacts' && <ContactsView contacts={contacts} onAdd={()=>setShowForm(true)} onSelect={c=>setSelectedContact(c)} toast={toast} />}
        {view==='pipeline' && <PipelineView contacts={contacts} onSelect={c=>setSelectedContact(c)} />}
        {view==='team' && <TeamView profile={profile} toast={toast} />}
        {view==='branding' && <BrandingView profile={profile} onBrandUpdate={b=>setBrand(b)} toast={toast} />}
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

      <Toast msg={toastMsg} onClose={()=>setToastMsg('')} />
    </>
  );
}
