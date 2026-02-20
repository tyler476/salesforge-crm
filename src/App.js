// src/App.js
// Full multi-tenant Sales CRM with auth, team accounts, white-label branding
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  supabase, signIn, signUp, signOut, getProfile,
  getContacts, createContact, updateContact, deleteContact,
  getCompany, updateCompany, createCompany, updateProfile,
  getTeamMembers, logActivity, getActivities
} from './lib/supabase';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const BASE = {
  bg0: '#0a0c10', bg1: '#10141c', bg2: '#161b27', bg3: '#1e2535',
  border: '#232b3e', green: '#22c55e', yellow: '#eab308',
  red: '#ef4444', orange: '#f97316', purple: '#a855f7', cyan: '#06b6d4',
  text: '#e2e8f0', textMuted: '#64748b', textSub: '#94a3b8',
};

// ── App Context ───────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ── Stages & Sources ──────────────────────────────────────────────────────────
const STAGES = ['New Lead','Contacted','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'];
const STAGE_COLORS = {
  'New Lead': BASE.textMuted, 'Contacted': BASE.cyan,
  'Qualified': '#3b82f6', 'Proposal': BASE.yellow,
  'Negotiation': BASE.orange, 'Closed Won': BASE.green, 'Closed Lost': BASE.red,
};
const SOURCES = ['Website','Referral','Cold Outreach','LinkedIn','Event','Paid Ad','Other'];
const INDUSTRIES = ['Technology','Finance','Healthcare','Retail','Manufacturing','Education','Real Estate','Other'];
const ROLES = ['admin','manager','member'];

// ── Utilities ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,10);
const fmt$ = v => '$' + Number(v||0).toLocaleString();
const initials = name => name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '??';
const avatarBg = str => {
  const hues = [210,160,280,30,190,340,260];
  let h=0; for (let c of (str||'')) h=(h*31+c.charCodeAt(0))%hues.length;
  return `hsl(${hues[h]},65%,48%)`;
};

// ── Global CSS ────────────────────────────────────────────────────────────────
const GlobalStyle = ({ accent }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:${BASE.bg0};color:${BASE.text};font-family:'DM Sans',sans-serif;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:${BASE.bg1}}
    ::-webkit-scrollbar-thumb{background:${BASE.border};border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:${accent}}
    input,select,textarea{outline:none;font-family:inherit}
    button{cursor:pointer;font-family:inherit}
    ::placeholder{color:${BASE.textMuted}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-in{animation:fadeIn .25s ease forwards}
    .slide-in{animation:slideIn .3s ease forwards}
  `}</style>
);

// ── Reusable UI Components ────────────────────────────────────────────────────
function Avatar({ name, size=36 }) {
  return (
    <div style={{
      width:size,height:size,borderRadius:'50%',background:avatarBg(name),
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*.35,fontWeight:700,color:'#fff',flexShrink:0,
      fontFamily:'Syne',letterSpacing:1,
    }}>{initials(name)}</div>
  );
}

function Spinner() {
  return <div style={{width:20,height:20,border:`2px solid ${BASE.border}`,borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin .7s linear infinite'}} />;
}

function Btn({ children, variant='primary', small, loading, accent='#3b82f6', ...props }) {
  const s = {
    primary:{background:accent,color:'#fff',border:'none'},
    ghost:{background:'transparent',color:BASE.textSub,border:`1px solid ${BASE.border}`},
    danger:{background:BASE.red+'22',color:BASE.red,border:`1px solid ${BASE.red}40`},
    success:{background:BASE.green+'22',color:BASE.green,border:`1px solid ${BASE.green}40`},
  };
  return (
    <button {...props} disabled={loading||props.disabled} style={{
      ...s[variant],borderRadius:10,padding:small?'6px 14px':'10px 20px',
      fontSize:small?12:14,fontWeight:600,display:'inline-flex',alignItems:'center',gap:6,
      transition:'all .2s',opacity:(loading||props.disabled)?.6:1,...(props.style||{}),
    }}>
      {loading?<Spinner/>:children}
    </button>
  );
}

function Input({ label, error, ...props }) {
  const { company } = useApp() || {};
  const accent = company?.primary_color || '#3b82f6';
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:11,color:BASE.textMuted,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>{label}</label>}
      <input {...props} style={{
        background:BASE.bg3,border:`1px solid ${error?BASE.red:BASE.border}`,borderRadius:10,
        padding:'10px 14px',color:BASE.text,fontSize:14,width:'100%',transition:'border .2s',...(props.style||{})
      }} onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor=error?BASE.red:BASE.border}/>
      {error && <span style={{fontSize:11,color:BASE.red}}>{error}</span>}
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:11,color:BASE.textMuted,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>{label}</label>}
      <select {...props} style={{
        background:BASE.bg3,border:`1px solid ${BASE.border}`,borderRadius:10,
        padding:'10px 14px',color:BASE.text,fontSize:14,width:'100%',appearance:'none',cursor:'pointer',...(props.style||{})
      }}>{options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <label style={{fontSize:11,color:BASE.textMuted,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>{label}</label>}
      <textarea {...props} rows={3} style={{
        background:BASE.bg3,border:`1px solid ${BASE.border}`,borderRadius:10,
        padding:'10px 14px',color:BASE.text,fontSize:14,resize:'vertical',
        fontFamily:'DM Sans',width:'100%',...(props.style||{})
      }}/>
    </div>
  );
}

function Toast({ message, type='success' }) {
  const col = type==='error'?BASE.red:type==='warn'?BASE.yellow:BASE.green;
  return (
    <div className="fade-in" style={{
      position:'fixed',bottom:28,right:28,zIndex:999,
      background:col,color:'#fff',padding:'12px 20px',borderRadius:12,
      fontSize:14,fontWeight:600,boxShadow:`0 4px 24px ${col}44`,
    }}>{message}</div>
  );
}

function StagePill({ stage }) {
  const col = STAGE_COLORS[stage]||BASE.textMuted;
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
      borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:.3,textTransform:'uppercase',
      color:col,background:col+'1a',border:`1px solid ${col}40`,
    }}>
      <span style={{width:5,height:5,borderRadius:'50%',background:col,display:'inline-block'}}/>
      {stage}
    </span>
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('signin'); // signin | signup | setup
  const [form, setForm] = useState({ email:'',password:'',fullName:'',companyName:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSignIn = async () => {
    setLoading(true); setErr('');
    const { data, error } = await signIn({ email: form.email, password: form.password });
    if (error) { setErr(error.message); setLoading(false); return; }
    onAuth(data.user);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!form.fullName || !form.email || !form.password || !form.companyName) {
      setErr('All fields are required.'); return;
    }
    setLoading(true); setErr('');
    // 1) Create auth user
    const { data, error } = await signUp({ email:form.email, password:form.password, fullName:form.fullName });
    if (error) { setErr(error.message); setLoading(false); return; }
    // 2) Create company
    const { data: company, error: ce } = await createCompany({ name: form.companyName });
    if (ce) { setErr(ce.message); setLoading(false); return; }
    // 3) Link profile to company with admin role
    await supabase.from('profiles').update({ company_id: company.id, role: 'admin', full_name: form.fullName })
      .eq('id', data.user.id);
    onAuth(data.user);
    setLoading(false);
  };

  const accent = '#3b82f6';

  return (
    <div style={{
      minHeight:'100vh',background:BASE.bg0,display:'flex',alignItems:'center',justifyContent:'center',
      padding:20, backgroundImage:`radial-gradient(ellipse at 20% 50%, ${accent}10 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${BASE.cyan}08 0%, transparent 50%)`
    }}>
      <div className="fade-in" style={{
        width:'100%',maxWidth:420,background:BASE.bg1,border:`1px solid ${BASE.border}`,
        borderRadius:24,padding:36,display:'flex',flexDirection:'column',gap:22,
      }}>
        {/* Logo */}
        <div style={{textAlign:'center',paddingBottom:4}}>
          <div style={{fontFamily:'Syne',fontWeight:800,fontSize:28,color:BASE.text}}>
            <span style={{color:accent}}>⚡</span> SalesForge
          </div>
          <div style={{fontSize:13,color:BASE.textMuted,marginTop:4}}>
            {mode==='signup' ? 'Create your team account' : 'Sign in to your workspace'}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:BASE.bg2,borderRadius:12,padding:4}}>
          {[['signin','Sign In'],['signup','Create Account']].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr('');}} style={{
              flex:1,padding:'8px',borderRadius:9,border:'none',fontSize:13,fontWeight:600,
              background:mode===m?accent:'transparent',color:mode===m?'#fff':BASE.textMuted,transition:'all .2s',
            }}>{l}</button>
          ))}
        </div>

        {/* Fields */}
        {mode==='signup' && <>
          <Input label="Full Name" placeholder="Jane Smith" value={form.fullName} onChange={e=>set('fullName',e.target.value)} />
          <Input label="Company Name" placeholder="Acme Corp" value={form.companyName} onChange={e=>set('companyName',e.target.value)} />
        </>}
        <Input label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={e=>set('email',e.target.value)} />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&(mode==='signin'?handleSignIn():handleSignUp())} />

        {err && <div style={{fontSize:13,color:BASE.red,background:BASE.red+'12',padding:'10px 14px',borderRadius:8}}>{err}</div>}

        <Btn loading={loading} onClick={mode==='signin'?handleSignIn:handleSignUp} style={{width:'100%',justifyContent:'center'}}>
          {mode==='signin' ? '→ Sign In' : '🚀 Create Account'}
        </Btn>

        <div style={{fontSize:12,color:BASE.textMuted,textAlign:'center',lineHeight:1.5}}>
          {mode==='signup'
            ? 'Creating an account makes you the Admin of a new company workspace.'
            : 'Team members: use the invite link your admin sent you.'}
        </div>
      </div>
    </div>
  );
}

// ── Branding Settings ─────────────────────────────────────────────────────────
function BrandingSettings({ onClose }) {
  const { company, profile, setCompany, toast } = useApp();
  const [form, setForm] = useState({
    name: company?.name || '',
    primary_color: company?.primary_color || '#3b82f6',
    logo_url: company?.logo_url || '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setLoading(true);
    const { data, error } = await updateCompany(company.id, form);
    if (error) { toast(error.message,'error'); } else { setCompany(data); toast('Branding saved ✓'); }
    setLoading(false);
    onClose();
  };

  if (profile?.role !== 'admin') return (
    <div style={{padding:24,textAlign:'center',color:BASE.textMuted}}>Only admins can edit branding.</div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <Input label="Company / Workspace Name" value={form.name} onChange={e=>set('name',e.target.value)} />
      <Input label="Logo URL (direct image link)" placeholder="https://your-site.com/logo.png" value={form.logo_url} onChange={e=>set('logo_url',e.target.value)} />
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <label style={{fontSize:11,color:BASE.textMuted,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>Primary Accent Color</label>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <input type="color" value={form.primary_color} onChange={e=>set('primary_color',e.target.value)}
            style={{width:48,height:40,borderRadius:8,border:`1px solid ${BASE.border}`,background:'none',cursor:'pointer',padding:2}} />
          <Input value={form.primary_color} onChange={e=>set('primary_color',e.target.value)} style={{flex:1}} />
        </div>
      </div>
      {form.logo_url && (
        <div style={{background:BASE.bg2,borderRadius:12,padding:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={form.logo_url} alt="logo preview" style={{maxHeight:60,maxWidth:200,objectFit:'contain'}} onError={e=>e.target.style.display='none'} />
        </div>
      )}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} accent={form.primary_color} onClick={save}>💾 Save Branding</Btn>
      </div>
    </div>
  );
}

// ── Team Management ───────────────────────────────────────────────────────────
function TeamManagement() {
  const { company, profile, toast } = useApp();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const accent = company?.primary_color || '#3b82f6';

  useEffect(() => {
    if (!company?.id) return;
    getTeamMembers(company.id).then(({ data }) => { setMembers(data||[]); setLoading(false); });
  }, [company]);

  const updateRole = async (memberId, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', memberId);
    if (error) { toast(error.message,'error'); return; }
    setMembers(m => m.map(x => x.id===memberId?{...x,role}:x));
    toast('Role updated ✓');
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this team member?')) return;
    await supabase.from('profiles').update({ company_id: null }).eq('id', memberId);
    setMembers(m => m.filter(x => x.id!==memberId));
    toast('Member removed');
  };

  // Generate invite link (in production, send via email)
  const inviteLink = `${window.location.origin}?invite=${company?.id}&email=${encodeURIComponent(inviteEmail)}`;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:20}}>👥 Team Members</div>
        <span style={{fontSize:12,color:BASE.textMuted}}>{members.length} members</span>
      </div>

      {/* Invite */}
      {profile?.role==='admin' && (
        <div style={{background:BASE.bg2,border:`1px solid ${BASE.border}`,borderRadius:14,padding:18}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:BASE.textSub}}>📨 Invite a Team Member</div>
          <div style={{display:'flex',gap:10}}>
            <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
              placeholder="teammate@company.com" style={{
                flex:1,background:BASE.bg3,border:`1px solid ${BASE.border}`,borderRadius:10,
                padding:'10px 14px',color:BASE.text,fontSize:13,
              }}/>
            <Btn accent={accent} onClick={()=>{
              navigator.clipboard.writeText(inviteLink);
              toast('Invite link copied! Share it with your teammate.');
            }}>Copy Invite Link</Btn>
          </div>
          <div style={{fontSize:11,color:BASE.textMuted,marginTop:8}}>
            The invite link lets them sign up and automatically join your company workspace as a member.
          </div>
        </div>
      )}

      {/* Members List */}
      {loading ? <Spinner/> : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {members.map(m=>(
            <div key={m.id} style={{
              background:BASE.bg2,border:`1px solid ${BASE.border}`,borderRadius:14,
              padding:'14px 18px',display:'flex',alignItems:'center',gap:14,
            }}>
              <Avatar name={m.full_name||m.email||'?'} size={40}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{m.full_name||'—'}</div>
                <div style={{fontSize:12,color:BASE.textMuted}}>{m.email}</div>
              </div>
              {profile?.role==='admin' && m.id!==profile.id ? (
                <select value={m.role} onChange={e=>updateRole(m.id,e.target.value)} style={{
                  background:BASE.bg3,border:`1px solid ${BASE.border}`,borderRadius:8,
                  padding:'6px 10px',color:BASE.text,fontSize:12,cursor:'pointer',
                }}>
                  {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              ) : (
                <span style={{fontSize:12,padding:'4px 10px',borderRadius:99,background:accent+'22',color:accent,fontWeight:700}}>
                  {m.role||'member'}
                </span>
              )}
              {profile?.role==='admin' && m.id!==profile.id && (
                <Btn small variant="danger" onClick={()=>removeMember(m.id)}>Remove</Btn>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ contacts }) {
  const { company } = useApp();
  const accent = company?.primary_color || '#3b82f6';
  const total = contacts.reduce((s,c)=>s+(c.deal_value||0),0);
  const won = contacts.filter(c=>c.stage==='Closed Won');
  const wonVal = won.reduce((s,c)=>s+(c.deal_value||0),0);
  const hot = contacts.filter(c=>['Proposal','Negotiation'].includes(c.stage));
  const convRate = contacts.length ? Math.round(won.length/contacts.length*100) : 0;

  const stageData = STAGES.map(s=>({
    stage:s, count:contacts.filter(c=>c.stage===s).length,
    val:contacts.filter(c=>c.stage===s).reduce((a,c)=>a+(c.deal_value||0),0),
    color:STAGE_COLORS[s],
  }));
  const maxCount = Math.max(...stageData.map(d=>d.count),1);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:22}}>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14}}>
        {[
          {label:'Total Pipeline',val:fmt$(total),sub:`${contacts.length} leads`,icon:'💼',col:accent},
          {label:'Closed Won',val:fmt$(wonVal),sub:`${won.length} deals`,icon:'🏆',col:BASE.green},
          {label:'Hot Leads',val:hot.length,sub:'Proposal + Negotiation',icon:'🔥',col:BASE.orange},
          {label:'Win Rate',val:`${convRate}%`,sub:'all time',icon:'🎯',col:BASE.purple},
        ].map(({label,val,sub,icon,col})=>(
          <div key={label} className="fade-in" style={{
            background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:16,padding:'18px 22px',
            position:'relative',overflow:'hidden',
          }}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${col},transparent)`}}/>
            <div style={{fontSize:20,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:26,fontWeight:800,fontFamily:'Syne',color:col,lineHeight:1}}>{val}</div>
            <div style={{fontSize:12,color:BASE.textMuted,marginTop:6}}>{label}</div>
            <div style={{fontSize:11,color:col,fontWeight:600,marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:16,padding:24}}>
        <div style={{fontFamily:'Syne',fontWeight:700,fontSize:16,marginBottom:20}}>Pipeline Breakdown</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {stageData.map(({stage,count,val,color})=>(
            <div key={stage} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:130,fontSize:12,color:BASE.textMuted,textAlign:'right',flexShrink:0}}>{stage}</div>
              <div style={{flex:1,background:BASE.bg3,borderRadius:99,height:9,overflow:'hidden'}}>
                <div style={{width:`${(count/maxCount)*100}%`,background:color,height:'100%',borderRadius:99,transition:'width .6s',minWidth:count>0?6:0}}/>
              </div>
              <div style={{width:65,fontSize:12,fontFamily:'JetBrains Mono',color}}>{count} lead{count!==1?'s':''}</div>
              <div style={{width:90,fontSize:12,fontFamily:'JetBrains Mono',color:BASE.textMuted,textAlign:'right'}}>{val>0?fmt$(val):'—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:16,padding:24}}>
        <div style={{fontFamily:'Syne',fontWeight:700,fontSize:16,marginBottom:16}}>Recent Contacts</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[...contacts].sort((a,b)=>b.created_at>a.created_at?1:-1).slice(0,6).map(c=>(
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:12}}>
              <Avatar name={c.name} size={32}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                <div style={{fontSize:11,color:BASE.textMuted}}>{c.company_name}</div>
              </div>
              <StagePill stage={c.stage}/>
              {c.deal_value>0 && <span style={{fontFamily:'JetBrains Mono',fontSize:12,color:BASE.green}}>{fmt$(c.deal_value)}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm({ initial, onSave, onCancel }) {
  const { company, profile } = useApp();
  const accent = company?.primary_color || '#3b82f6';
  const empty = { name:'',email:'',phone:'',company_name:'',title:'',industry:INDUSTRIES[0],source:SOURCES[0],stage:STAGES[0],deal_value:'',notes:'',tags:'' };
  const [form, setForm] = useState(initial ? {...initial, tags:(initial.tags||[]).join(', ')} : empty);
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Name required.'); return; }
    setLoading(true);
    const payload = {
      ...form, deal_value:parseFloat(form.deal_value)||0,
      tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
      company_id: company.id, owner_id: profile.id,
      last_contact: new Date().toISOString().slice(0,10),
    };
    delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.profiles;
    await onSave(payload, initial?.id);
    setLoading(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Input label="Full Name *" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jane Smith"/>
        <Input label="Email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="jane@co.com"/>
        <Input label="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 555 000 0000"/>
        <Input label="Company" value={form.company_name} onChange={e=>set('company_name',e.target.value)} placeholder="Acme Corp"/>
        <Input label="Job Title" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="VP of Sales"/>
        <Input label="Deal Value ($)" type="number" value={form.deal_value} onChange={e=>set('deal_value',e.target.value)} placeholder="25000"/>
        <Select label="Stage" value={form.stage} onChange={e=>set('stage',e.target.value)} options={STAGES}/>
        <Select label="Source" value={form.source} onChange={e=>set('source',e.target.value)} options={SOURCES}/>
        <Select label="Industry" value={form.industry} onChange={e=>set('industry',e.target.value)} options={INDUSTRIES}/>
        <Input label="Tags (comma-separated)" value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="hot, enterprise"/>
      </div>
      <Textarea label="Notes" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Notes..."/>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:4}}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn loading={loading} accent={accent} onClick={handleSave}>💾 Save</Btn>
      </div>
    </div>
  );
}

// ── Contact Drawer ────────────────────────────────────────────────────────────
function ContactDrawer({ contact, onClose, onEdit, onDelete, onStageChange }) {
  const { company } = useApp();
  const accent = company?.primary_color || '#3b82f6';
  const [activities, setActivities] = useState([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { profile } = useApp();

  useEffect(() => {
    if (!contact||!company) return;
    getActivities(company.id, contact.id).then(({data})=>setActivities(data||[]));
  }, [contact, company]);

  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const { data } = await logActivity({
      contact_id:contact.id, user_id:profile.id,
      company_id:company.id, type:'note', description:note,
    });
    if (data) setActivities(a=>[data,...a]);
    setNote(''); setSaving(false);
  };

  if (!contact) return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:100,display:'flex'}}>
      <div onClick={onClose} style={{flex:1,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)'}}/>
      <div className="slide-in" style={{
        width:460,background:BASE.bg1,borderLeft:`1px solid ${BASE.border}`,
        overflowY:'auto',padding:26,display:'flex',flexDirection:'column',gap:18,
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <Avatar name={contact.name} size={50}/>
            <div>
              <div style={{fontSize:19,fontWeight:800,fontFamily:'Syne'}}>{contact.name}</div>
              <div style={{fontSize:12,color:BASE.textMuted}}>{contact.title} @ {contact.company_name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:BASE.textMuted,fontSize:22}}>×</button>
        </div>

        {/* Stage Stepper */}
        <div>
          <div style={{fontSize:11,color:BASE.textMuted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Pipeline Stage</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {STAGES.map((s,i)=>{
              const col=STAGE_COLORS[s]; const active=s===contact.stage; const past=i<STAGES.indexOf(contact.stage);
              return (
                <button key={s} onClick={()=>onStageChange(s)} style={{
                  padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,cursor:'pointer',
                  border:`1px solid ${active?col:past?col+'40':BASE.border}`,
                  background:active?col+'22':'transparent',
                  color:active?col:past?col+'77':BASE.textMuted,transition:'all .15s',
                }}>{s}</button>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            ['📧','Email',contact.email],['📞','Phone',contact.phone],
            ['🏢','Company',contact.company_name],['🌐','Industry',contact.industry],
            ['📣','Source',contact.source],['💰','Deal Value',fmt$(contact.deal_value)],
            ['📅','Added',contact.created_at?.slice(0,10)],['🕐','Last Contact',contact.last_contact],
          ].filter(([,,v])=>v).map(([icon,k,v])=>(
            <div key={k} style={{background:BASE.bg2,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:11,color:BASE.textMuted,marginBottom:3}}>{icon} {k}</div>
              <div style={{fontSize:13,fontWeight:500,wordBreak:'break-all'}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {contact.notes && (
          <div style={{background:BASE.bg2,borderRadius:12,padding:14}}>
            <div style={{fontSize:11,color:BASE.textMuted,marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>📝 Notes</div>
            <div style={{fontSize:13,color:BASE.textSub,lineHeight:1.6}}>{contact.notes}</div>
          </div>
        )}

        {/* Tags */}
        {contact.tags?.length>0 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {contact.tags.map(t=>(
              <span key={t} style={{padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:600,background:BASE.bg3,color:BASE.textSub,border:`1px solid ${BASE.border}`}}>{t}</span>
            ))}
          </div>
        )}

        {/* Add Note */}
        <div style={{background:BASE.bg2,borderRadius:12,padding:14}}>
          <div style={{fontSize:11,color:BASE.textMuted,marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>➕ Add Note</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2}
            placeholder="Log a call, email, or update..."
            style={{width:'100%',background:BASE.bg3,border:`1px solid ${BASE.border}`,borderRadius:8,padding:'8px 12px',color:BASE.text,fontSize:13,fontFamily:'DM Sans',resize:'vertical'}}/>
          <div style={{marginTop:8,textAlign:'right'}}>
            <Btn small loading={saving} accent={accent} onClick={addNote}>Log Note</Btn>
          </div>
        </div>

        {/* Activity Feed */}
        {activities.length>0 && (
          <div>
            <div style={{fontSize:11,color:BASE.textMuted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Activity Log</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {activities.slice(0,8).map(a=>(
                <div key={a.id} style={{display:'flex',gap:10,fontSize:12}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:accent,marginTop:5,flexShrink:0}}/>
                  <div>
                    <div style={{color:BASE.textSub}}>{a.description}</div>
                    <div style={{color:BASE.textMuted,fontSize:11,marginTop:2}}>{a.profiles?.full_name||'User'} · {a.created_at?.slice(0,10)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex',gap:10,paddingTop:4}}>
          <Btn onClick={onEdit} accent={accent} style={{flex:1}}>✏️ Edit</Btn>
          <Btn variant="danger" onClick={onDelete}>🗑</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Board ────────────────────────────────────────────────────────────
function PipelineBoard({ contacts, onSelect }) {
  const byStage = STAGES.reduce((a,s)=>({...a,[s]:contacts.filter(c=>c.stage===s)}),{});
  return (
    <div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:12}}>
      {STAGES.map(stage=>{
        const items=byStage[stage]; const total=items.reduce((s,c)=>s+(c.deal_value||0),0); const col=STAGE_COLORS[stage];
        return (
          <div key={stage} style={{minWidth:230,flexShrink:0}}>
            <div style={{marginBottom:10,padding:'8px 12px',background:BASE.bg2,borderRadius:10,border:`1px solid ${BASE.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700,fontSize:12,color:col,fontFamily:'Syne'}}>{stage}</span>
                <span style={{fontSize:11,background:col+'22',color:col,borderRadius:99,padding:'2px 8px',fontWeight:700}}>{items.length}</span>
              </div>
              {total>0 && <div style={{fontSize:11,color:BASE.textMuted,marginTop:3}}>{fmt$(total)}</div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {items.map(c=>(
                <div key={c.id} onClick={()=>onSelect(c)} className="fade-in" style={{
                  background:BASE.bg2,border:`1px solid ${BASE.border}`,borderRadius:12,padding:12,
                  cursor:'pointer',transition:'all .15s',borderLeft:`3px solid ${col}`,
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background=BASE.bg3;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=BASE.bg2;}}
                >
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                    <Avatar name={c.name} size={26}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                      <div style={{fontSize:11,color:BASE.textMuted}}>{c.company_name}</div>
                    </div>
                  </div>
                  {c.deal_value>0 && <div style={{fontSize:12,color:BASE.green,fontWeight:700,fontFamily:'JetBrains Mono'}}>{fmt$(c.deal_value)}</div>}
                </div>
              ))}
              {items.length===0 && <div style={{padding:20,textAlign:'center',color:BASE.textMuted,fontSize:11,border:`1px dashed ${BASE.border}`,borderRadius:8}}>No leads</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [company, setCompany]   = useState(null);
  const [contacts, setContacts] = useState([]);
  const [view, setView]         = useState('dashboard');
  const [modal, setModal]       = useState(null); // null | 'branding' | 'team' | 'profile'
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [search, setSearch]     = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [toastMsg, setToastMsg] = useState(null);
  const [loading, setLoading]   = useState(true);

  const toast = useCallback((msg, type='success') => {
    setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3000);
  }, []);

  // ── Auth Init ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await loadUser(session.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await loadUser(session.user);
      else { setUser(null); setProfile(null); setCompany(null); setContacts([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (u) => {
    setUser(u);
    const { data: p } = await getProfile(u.id);
    setProfile(p);
    if (p?.company_id) {
      setCompany(p.companies);
      const { data: c } = await getContacts(p.company_id);
      setContacts(c||[]);
    }
  };

  // ── Contact CRUD ──────────────────────────────────────────
  const saveContact = async (payload, existingId) => {
    if (existingId) {
      const { data, error } = await updateContact(existingId, payload);
      if (error) { toast(error.message,'error'); return; }
      setContacts(cs=>cs.map(c=>c.id===existingId?data:c));
      if (selected?.id===existingId) setSelected(data);
      await logActivity({ contact_id:existingId, user_id:profile.id, company_id:company.id, type:'note', description:`Contact updated` });
      toast('Contact updated ✓');
    } else {
      const { data, error } = await createContact(payload);
      if (error) { toast(error.message,'error'); return; }
      setContacts(cs=>[data,...cs]);
      await logActivity({ contact_id:data.id, user_id:profile.id, company_id:company.id, type:'note', description:`Contact created` });
      toast('Contact added ✓');
    }
    setShowForm(false); setEditing(null);
  };

  const deleteContactHandler = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    const { error } = await deleteContact(id);
    if (error) { toast(error.message,'error'); return; }
    setContacts(cs=>cs.filter(c=>c.id!==id));
    setSelected(null); toast('Contact deleted');
  };

  const changeStage = async (contact, stage) => {
    const { data, error } = await updateContact(contact.id, { stage });
    if (error) { toast(error.message,'error'); return; }
    setContacts(cs=>cs.map(c=>c.id===contact.id?data:c));
    setSelected(data);
    await logActivity({ contact_id:contact.id, user_id:profile.id, company_id:company.id, type:'stage_change', description:`Stage changed to ${stage}` });
  };

  const handleSignOut = async () => {
    await signOut(); setUser(null); setProfile(null); setCompany(null); setContacts([]);
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const mq = !q || [c.name,c.email,c.company_name,c.title].some(f=>f?.toLowerCase().includes(q));
    const ms = filterStage==='All' || c.stage===filterStage;
    return mq && ms;
  });

  const accent = company?.primary_color || '#3b82f6';

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <>
      <GlobalStyle accent="#3b82f6"/>
      <div style={{minHeight:'100vh',background:BASE.bg0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
        <div style={{fontFamily:'Syne',fontWeight:800,fontSize:24,color:BASE.text}}><span style={{color:'#3b82f6'}}>⚡</span> SalesForge</div>
        <Spinner/>
      </div>
    </>
  );

  // ── Auth ──────────────────────────────────────────────────
  if (!user) return (
    <>
      <GlobalStyle accent="#3b82f6"/>
      <AuthScreen onAuth={u=>loadUser(u)}/>
    </>
  );

  // ── No Company Yet ────────────────────────────────────────
  if (!company) return (
    <>
      <GlobalStyle accent="#3b82f6"/>
      <div style={{minHeight:'100vh',background:BASE.bg0,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:20,padding:32,maxWidth:400,textAlign:'center'}}>
          <div style={{fontFamily:'Syne',fontWeight:800,fontSize:20,marginBottom:12}}>Almost there!</div>
          <div style={{color:BASE.textMuted,fontSize:14,marginBottom:20}}>Your account is set up. Ask your admin to add you to the company workspace, or create a new one.</div>
          <Btn onClick={handleSignOut} variant="ghost">Sign Out</Btn>
        </div>
      </div>
    </>
  );

  // ── App ───────────────────────────────────────────────────
  const NAV = [
    {id:'dashboard',label:'Dashboard',icon:'📊'},
    {id:'contacts',label:'Contacts',icon:'👥'},
    {id:'pipeline',label:'Pipeline',icon:'🔀'},
    {id:'team',label:'Team',icon:'🤝'},
  ];

  const appCtxValue = { user, profile, company, setCompany, toast };

  return (
    <AppCtx.Provider value={appCtxValue}>
      <GlobalStyle accent={accent}/>
      <div style={{display:'flex',minHeight:'100vh',background:BASE.bg0}}>

        {/* ── Sidebar ── */}
        <aside style={{
          width:220,flexShrink:0,background:BASE.bg1,borderRight:`1px solid ${BASE.border}`,
          display:'flex',flexDirection:'column',padding:'18px 12px',gap:4,
          position:'sticky',top:0,height:'100vh',
        }}>
          {/* Logo / Branding */}
          <div style={{padding:'6px 10px 20px',display:'flex',alignItems:'center',gap:10}}>
            {company?.logo_url
              ? <img src={company.logo_url} alt="logo" style={{height:32,maxWidth:100,objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
              : <div style={{fontFamily:'Syne',fontWeight:800,fontSize:17,color:BASE.text}}><span style={{color:accent}}>⚡</span> {company?.name||'SalesForge'}</div>
            }
          </div>

          {/* Nav */}
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>n.id==='team'?setModal('team'):setView(n.id)} style={{
              background:(view===n.id&&modal===null)?accent+'18':'transparent',
              border:(view===n.id&&modal===null)?`1px solid ${accent}28`:'1px solid transparent',
              borderRadius:10,padding:'10px 14px',textAlign:'left',
              color:(view===n.id&&modal===null)?accent:BASE.textMuted,
              fontSize:14,fontWeight:(view===n.id&&modal===null)?700:500,
              display:'flex',alignItems:'center',gap:10,transition:'all .15s',
            }}
              onMouseEnter={e=>view!==n.id&&(e.currentTarget.style.background=BASE.bg3)}
              onMouseLeave={e=>view!==n.id&&(e.currentTarget.style.background='transparent')}
            ><span style={{fontSize:15}}>{n.icon}</span>{n.label}</button>
          ))}

          <div style={{flex:1}}/>

          {/* Bottom: profile + settings */}
          <div style={{borderTop:`1px solid ${BASE.border}`,paddingTop:12,display:'flex',flexDirection:'column',gap:6}}>
            {profile?.role==='admin' && (
              <button onClick={()=>setModal('branding')} style={{
                background:'transparent',border:'1px solid transparent',borderRadius:10,
                padding:'9px 14px',textAlign:'left',color:BASE.textMuted,fontSize:13,
                display:'flex',alignItems:'center',gap:8,transition:'all .15s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background=BASE.bg3}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >🎨 Branding</button>
            )}
            <button onClick={handleSignOut} style={{
              background:'transparent',border:'1px solid transparent',borderRadius:10,
              padding:'9px 14px',textAlign:'left',color:BASE.textMuted,fontSize:13,
              display:'flex',alignItems:'center',gap:8,transition:'all .15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background=BASE.bg3}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >🚪 Sign Out</button>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:BASE.bg2,borderRadius:10,marginTop:2}}>
              <Avatar name={profile?.full_name||profile?.email||'?'} size={30}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.full_name||'You'}</div>
                <div style={{fontSize:10,color:BASE.textMuted}}>{profile?.role||'member'}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {/* Header */}
          <header style={{
            position:'sticky',top:0,zIndex:50,background:BASE.bg0+'ee',backdropFilter:'blur(12px)',
            borderBottom:`1px solid ${BASE.border}`,padding:'13px 26px',
            display:'flex',alignItems:'center',gap:14,
          }}>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:20}}>
                {view==='dashboard'?'📊 Dashboard':view==='contacts'?'👥 Contacts & Leads':'🔀 Pipeline'}
              </div>
              {view==='contacts' && <div style={{fontSize:11,color:BASE.textMuted}}>{filtered.length} of {contacts.length} contacts</div>}
            </div>
            {view!=='dashboard' && (
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search..."
                style={{background:BASE.bg2,border:`1px solid ${BASE.border}`,borderRadius:10,padding:'8px 14px',color:BASE.text,fontSize:13,width:220}}/>
            )}
            {view==='contacts' && (
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{
                background:BASE.bg2,border:`1px solid ${BASE.border}`,borderRadius:10,padding:'8px 12px',color:BASE.text,fontSize:12,cursor:'pointer',
              }}>
                <option>All</option>
                {STAGES.map(s=><option key={s}>{s}</option>)}
              </select>
            )}
            <Btn accent={accent} onClick={()=>{setEditing(null);setShowForm(true);}}>＋ Add Contact</Btn>
          </header>

          {/* Content */}
          <div style={{padding:26,flex:1,overflowY:'auto',overflowX:'hidden'}}>
            {view==='dashboard' && <Dashboard contacts={contacts}/>}

            {view==='contacts' && (
              <div className="fade-in" style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:16,overflow:'hidden'}}>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${BASE.border}`}}>
                        {['Contact','Company','Stage','Deal Value','Owner','Last Contact',''].map(h=>(
                          <th key={h} style={{padding:'13px 16px',textAlign:'left',fontSize:11,color:BASE.textMuted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length===0 ? (
                        <tr><td colSpan={7} style={{padding:48,textAlign:'center',color:BASE.textMuted,fontSize:14}}>No contacts found. Add one to get started!</td></tr>
                      ) : filtered.map((c,i)=>(
                        <tr key={c.id} className="fade-in" onClick={()=>setSelected(c)} style={{
                          borderBottom:`1px solid ${BASE.border}`,cursor:'pointer',transition:'background .15s',
                          animationDelay:`${i*20}ms`,
                        }}
                          onMouseEnter={e=>e.currentTarget.style.background=BASE.bg2}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                        >
                          <td style={{padding:'12px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <Avatar name={c.name} size={32}/>
                              <div>
                                <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                                <div style={{fontSize:11,color:BASE.textMuted}}>{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:'12px 16px'}}><div style={{fontSize:13}}>{c.company_name}</div><div style={{fontSize:11,color:BASE.textMuted}}>{c.title}</div></td>
                          <td style={{padding:'12px 16px'}}><StagePill stage={c.stage}/></td>
                          <td style={{padding:'12px 16px',fontFamily:'JetBrains Mono',fontSize:13,color:c.deal_value?BASE.green:BASE.textMuted}}>{c.deal_value?fmt$(c.deal_value):'—'}</td>
                          <td style={{padding:'12px 16px',fontSize:12,color:BASE.textMuted}}>{c.profiles?.full_name||'—'}</td>
                          <td style={{padding:'12px 16px',fontSize:12,color:BASE.textMuted,fontFamily:'JetBrains Mono'}}>{c.last_contact||'—'}</td>
                          <td style={{padding:'12px 16px'}}>
                            <Btn small variant="ghost" onClick={e=>{e.stopPropagation();setEditing(c);setShowForm(true);}}>Edit</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view==='pipeline' && (
              <div className="fade-in"><PipelineBoard contacts={filtered} onSelect={setSelected}/></div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div className="fade-in" style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:20,padding:28,width:'100%',maxWidth:modal==='team'?600:480,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:18}}>
                {modal==='branding'?'🎨 Branding Settings':modal==='team'?'👥 Team Management':'👤 Profile'}
              </div>
              <button onClick={()=>setModal(null)} style={{background:'none',border:'none',color:BASE.textMuted,fontSize:22}}>×</button>
            </div>
            {modal==='branding' && <BrandingSettings onClose={()=>setModal(null)}/>}
            {modal==='team' && <TeamManagement/>}
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.8)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div className="fade-in" style={{background:BASE.bg1,border:`1px solid ${BASE.border}`,borderRadius:20,padding:26,width:'100%',maxWidth:700,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <div style={{fontFamily:'Syne',fontWeight:800,fontSize:18}}>{editing?'✏️ Edit Contact':'＋ New Contact'}</div>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{background:'none',border:'none',color:BASE.textMuted,fontSize:22}}>×</button>
            </div>
            <ContactForm initial={editing} onSave={saveContact} onCancel={()=>{setShowForm(false);setEditing(null);}}/>
          </div>
        </div>
      )}

      {/* Contact Drawer */}
      {selected && !showForm && (
        <ContactDrawer contact={selected} onClose={()=>setSelected(null)}
          onEdit={()=>{setEditing(selected);setShowForm(true);}}
          onDelete={()=>deleteContactHandler(selected.id)}
          onStageChange={(stage)=>changeStage(selected,stage)}/>
      )}

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg.msg} type={toastMsg.type}/>}
    </AppCtx.Provider>
  );
}
