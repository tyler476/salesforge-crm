import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --surface2: #263245;
    --border: #334155;
    --accent: #3b82f6;
    --accent2: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --brand: #3b82f6;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; }
  input,textarea,select { background:var(--surface2); border:1px solid var(--border); color:var(--text); padding:10px 14px; border-radius:8px; font-size:14px; width:100%; outline:none; font-family:'Inter',sans-serif; }
  input:focus,textarea:focus,select:focus { border-color:var(--accent); }
  button { cursor:pointer; font-family:'Inter',sans-serif; border:none; border-radius:8px; font-size:14px; font-weight:500; transition:all .15s; }
  .btn-primary { background:var(--accent); color:#fff; padding:10px 20px; }
  .btn-primary:hover { background:#2563eb; }
  .btn-secondary { background:var(--surface2); color:var(--text); padding:10px 20px; border:1px solid var(--border); }
  .btn-secondary:hover { border-color:var(--accent); }
  .btn-danger { background:var(--danger); color:#fff; padding:8px 16px; }
  .btn-sm { padding:6px 12px; font-size:13px; }
  label { font-size:13px; color:var(--muted); display:block; margin-bottom:5px; }
  .form-group { margin-bottom:16px; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .badge-blue { background:rgba(59,130,246,.2); color:#60a5fa; }
  .badge-green { background:rgba(16,185,129,.2); color:#34d399; }
  .badge-yellow { background:rgba(245,158,11,.2); color:#fbbf24; }
  .badge-red { background:rgba(239,68,68,.2); color:#f87171; }
  .badge-purple { background:rgba(139,92,246,.2); color:#a78bfa; }
  .tag { display:inline-block; background:rgba(59,130,246,.15); color:#60a5fa; padding:2px 8px; border-radius:4px; font-size:11px; margin:2px; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:var(--surface); }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:100; display:flex; align-items:center; justify-content:center; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:28px; width:90%; max-width:520px; max-height:90vh; overflow-y:auto; }
  .toast { position:fixed; bottom:24px; right:24px; background:var(--surface2); border:1px solid var(--border); padding:14px 20px; border-radius:10px; z-index:999; font-size:14px; animation:slideIn .2s ease; }
  @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
  .sidebar { width:220px; min-height:100vh; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; position:fixed; top:0; left:0; z-index:50; }
  .main { margin-left:220px; min-height:100vh; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:14px; color:var(--muted); transition:all .15s; margin:2px 8px; }
  .nav-item:hover { background:var(--surface2); color:var(--text); }
  .nav-item.active { background:rgba(59,130,246,.15); color:var(--accent); }
  .header { padding:20px 28px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--surface); }
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; }
  .table { width:100%; border-collapse:collapse; }
  .table th { text-align:left; padding:10px 14px; font-size:12px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid var(--border); }
  .table td { padding:12px 14px; border-bottom:1px solid var(--border); font-size:14px; }
  .table tr:hover td { background:rgba(255,255,255,.02); }
  .drawer { position:fixed; top:0; right:0; width:420px; height:100vh; background:var(--surface); border-left:1px solid var(--border); z-index:200; overflow-y:auto; transform:translateX(100%); transition:transform .25s ease; }
  .drawer.open { transform:translateX(0); }
  .kanban-col { background:var(--surface); border:1px solid var(--border); border-radius:12px; min-width:240px; max-width:240px; }
  .kanban-card { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:12px; margin:8px; cursor:pointer; transition:border-color .15s; }
  .kanban-card:hover { border-color:var(--accent); }
  @media(max-width:768px) {
    .sidebar { width:60px; }
    .sidebar .nav-label, .sidebar .brand-name { display:none; }
    .main { margin-left:60px; }
    .drawer { width:100vw; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGES = ['New Lead','Contacted','Qualified','Proposal','Negotiation','Won','Lost'];
const STAGE_COLORS = { 'New Lead':'blue','Contacted':'purple','Qualified':'yellow','Proposal':'accent','Negotiation':'warning','Won':'green','Lost':'red' };
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

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleLogin = async () => {
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password });
    if (error) setErr(error.message);
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
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:420, padding:20 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'var(--accent)', marginBottom:4 }}>⚡ SalesForge</div>
          <div style={{ color:'var(--muted)', fontSize:14 }}>Your team's sales command center</div>
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
          {err && <div style={{ color:'var(--danger)', fontSize:13, marginBottom:12 }}>{err}</div>}
          <button className="btn-primary" style={{ width:'100%' }} onClick={tab==='login'?handleLogin:handleSignup} disabled={loading}>
            {loading ? 'Please wait...' : tab==='login' ? 'Sign In' : 'Create Account'}
          </button>
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
function ContactDrawer({ contact, onClose, onEdit, onDelete, companyId }) {
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('note');

  useEffect(() => {
    if (!contact) return;
    supabase.from('activities').select('*').eq('contact_id', contact.id).order('created_at', { ascending:false }).then(({ data }) => setActivities(data||[]));
  }, [contact]);

  const addActivity = async () => {
    if (!note.trim()) return;
    await supabase.from('activities').insert([{ contact_id:contact.id, company_id:companyId, type:noteType, body:note }]);
    setNote(''); setActivities(a=>[{type:noteType, body:note, created_at:new Date().toISOString()}, ...a]);
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
              <div style={{ fontWeight:700, fontSize:18, fontFamily:'Syne,sans-serif' }}>{contact.full_name}</div>
              <div style={{ color:'var(--muted)', fontSize:13 }}>{contact.title} {contact.company && `@ ${contact.company}`}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', color:'var(--muted)', fontSize:20 }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <button className="btn-secondary btn-sm" onClick={onEdit}>✏️ Edit</button>
          <button className="btn-danger btn-sm" onClick={onDelete}>🗑️ Delete</button>
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
          <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note..." style={{ marginBottom:8 }} />
          <button className="btn-primary btn-sm" onClick={addActivity}>Add</button>
        </div>

        <div>
          <div style={{ fontSize:12, color:'var(--muted)', marginBottom:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Activity</div>
          {activities.map((a,i)=>(
            <div key={i} style={{ display:'flex', gap:10, marginBottom:12 }}>
              <div style={{ fontSize:16, marginTop:2 }}>{a.type==='call'?'📞':a.type==='email'?'📧':a.type==='stage'?'🔄':'📝'}</div>
              <div>
                <div style={{ fontSize:13 }}>{a.body}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{new Date(a.created_at).toLocaleString()}</div>
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
  const pipeline = contacts.filter(c=>!['Won','Lost'].includes(c.stage)).reduce((s,c)=>s+(c.deal_value||0),0);
  const won = contacts.filter(c=>c.stage==='Won').length;
  const winRate = total > 0 ? Math.round((won/total)*100) : 0;
  const closed = contacts.filter(c=>c.stage==='Won').reduce((s,c)=>s+(c.deal_value||0),0);

  const stageCounts = STAGES.map(s=>({ stage:s, count:contacts.filter(c=>c.stage===s).length, value:contacts.filter(c=>c.stage===s).reduce((a,b)=>a+(b.deal_value||0),0) }));
  const maxCount = Math.max(...stageCounts.map(s=>s.count),1);

  return (
    <div style={{ padding:28 }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>Dashboard</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {[['Total Contacts',total,'👥','blue'],['Pipeline Value',fmt(pipeline),'💰','green'],['Win Rate',`${winRate}%`,'🎯','yellow'],['Revenue Won',fmt(closed),'🏆','purple']].map(([label,val,icon,color])=>(
          <div key={label} className="stat-card">
            <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:24, fontWeight:700, color:`var(--${color==='blue'?'accent':color==='green'?'success':color==='yellow'?'warning':'accent2'})` }}>{val}</div>
            <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, marginBottom:16 }}>Pipeline by Stage</div>
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
function ContactsView({ contacts, onAdd, onSelect }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const match = !q || c.full_name?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    const stageMatch = stageFilter==='All' || c.stage===stageFilter;
    return match && stageMatch;
  });

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800 }}>Contacts</div>
        <button className="btn-primary" onClick={onAdd}>+ Add Contact</button>
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
          <thead><tr><th>Name</th><th>Company</th><th>Stage</th><th>Deal Value</th><th>Source</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{ cursor:'pointer' }} onClick={()=>onSelect(c)}>
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
    </div>
  );
}

// ─── PIPELINE VIEW ────────────────────────────────────────────────────────────
function PipelineView({ contacts, onSelect }) {
  return (
    <div style={{ padding:28 }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:20 }}>Pipeline Board</div>
      <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:16 }}>
        {STAGES.map(stage=>{
          const cols = contacts.filter(c=>c.stage===stage);
          return (
            <div key={stage} className="kanban-col">
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{stage}</span>
                <span style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'2px 8px', fontSize:12, color:'var(--muted)' }}>{cols.length}</span>
              </div>
              <div style={{ padding:8, minHeight:80 }}>
                {cols.map(c=>(
                  <div key={c.id} className="kanban-card" onClick={()=>onSelect(c)}>
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{c.full_name}</div>
                    <div style={{ color:'var(--muted)', fontSize:12, marginBottom:6 }}>{c.company}</div>
                    {c.deal_value>0 && <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--success)' }}>{fmt(c.deal_value)}</div>}
                  </div>
                ))}
              </div>
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
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>Team</div>
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
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>🎨 Branding</div>
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
    { id:'dashboard', label:'Dashboard', icon:'📊' },
    { id:'contacts', label:'Contacts', icon:'👥' },
    { id:'pipeline', label:'Pipeline', icon:'⚡' },
    { id:'team', label:'Team', icon:'🤝' },
    ...(profile.role==='admin' ? [{ id:'branding', label:'Branding', icon:'🎨' }] : []),
  ];

  return (
    <>
      <style>{css}</style>
      <style>{`:root { --accent: ${accentColor}; }`}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--border)' }}>
          {brand.logo_url ? <img src={brand.logo_url} alt="logo" style={{ maxHeight:36, maxWidth:150 }} onError={e=>e.target.style.display='none'} /> :
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, color:accentColor }} className="brand-name">⚡ {brand.company_name}</div>}
        </div>
        <nav style={{ flex:1, padding:'12px 0' }}>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
              <span>{n.icon}</span><span className="nav-label">{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding:16, borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:avatarColor(profile.full_name||''), display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>{initials(profile.full_name||'?')}</div>
            <div className="nav-label" style={{ fontSize:13 }}>
              <div style={{ fontWeight:500, color:'var(--text)' }}>{profile.full_name}</div>
              <div style={{ color:'var(--muted)', fontSize:11 }}>{profile.role}</div>
            </div>
          </div>
          <button className="btn-secondary btn-sm" style={{ width:'100%' }} onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {view==='dashboard' && <Dashboard contacts={contacts} />}
        {view==='contacts' && <ContactsView contacts={contacts} onAdd={()=>setShowForm(true)} onSelect={c=>setSelectedContact(c)} />}
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
