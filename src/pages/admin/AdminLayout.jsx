import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, BookOpen, Users, BarChart2, LogOut, Menu, X, Shield, ChevronRight } from 'lucide-react';

const NAV = [
  { to:'/admin',          icon:<LayoutDashboard size={18}/>, label:'Dashboard',  end:true },
  { to:'/admin/quizzes',  icon:<BookOpen size={18}/>,        label:'Quizzes' },
  { to:'/admin/users',    icon:<Users size={18}/>,            label:'Users' },
  { to:'/admin/attempts', icon:<BarChart2 size={18}/>,        label:'Attempts' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = ({ mobile = false }) => (
    <aside style={{
      width: mobile ? 240 : (collapsed ? 68 : 240),
      minHeight:'100vh', background:'#1e293b',
      borderRight:'1px solid #334155', display:'flex', flexDirection:'column',
      transition:'width .25s ease', flexShrink:0,
      position: mobile ? 'relative' : 'sticky', top:0, height:'100vh'
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 16px', borderBottom:'1px solid #334155', minHeight:64 }}>
        <div style={{ width:36, height:36, background:'var(--primary)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}>
          <Shield size={18}/>
        </div>
        {(!collapsed || mobile) && (
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'white' }}>Quizly</div>
            <div style={{ fontSize:'.65rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em' }}>Admin</div>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:4, borderRadius:4, marginLeft:'auto' }}>
            <ChevronRight size={16} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition:'transform .25s' }}/>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'16px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {(!collapsed || mobile) && (
          <div style={{ fontSize:'.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', padding:'4px 10px 8px' }}>
            Main Menu
          </div>
        )}
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={() => mobile && setMobileOpen(false)}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              borderRadius:8, color: isActive ? 'white' : '#94a3b8',
              background: isActive ? 'var(--primary)' : 'transparent',
              textDecoration:'none', fontSize:'.875rem', fontWeight:500,
              transition:'var(--transition)'
            })}>
            <span style={{ flexShrink:0 }}>{item.icon}</span>
            {(!collapsed || mobile) && <span style={{ whiteSpace:'nowrap', overflow:'hidden' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:16, borderTop:'1px solid #334155' }}>
        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.85rem', fontWeight:700, flexShrink:0 }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        {(!collapsed || mobile) && (
          <>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontSize:'.82rem', fontWeight:700, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize:'.7rem', color:'#64748b' }}>Administrator</div>
            </div>
            <button onClick={handleLogout} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:6, borderRadius:6, flexShrink:0 }}
              title="Sign Out"><LogOut size={16}/></button>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f172a' }}>
      {/* Desktop sidebar */}
      <div className="hide-mobile"><SidebarContent /></div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:200, display:'flex' }}
          onClick={() => setMobileOpen(false)}>
          <div onClick={e => e.stopPropagation()}><SidebarContent mobile /></div>
          <button onClick={() => setMobileOpen(false)}
            style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,.1)', border:'none', color:'white', borderRadius:8, padding:8, cursor:'pointer' }}>
            <X size={20}/>
          </button>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'#f8fafc' }}>
        {/* Topbar */}
        <header style={{ height:64, background:'white', borderBottom:'1px solid var(--gray-200)', display:'flex', alignItems:'center', padding:'0 24px', gap:16, position:'sticky', top:0, zIndex:50, boxShadow:'var(--shadow-sm)' }}>
          <button className="hide-desktop" onClick={() => setMobileOpen(true)}
            style={{ background:'none', border:'none', color:'var(--gray-600)', cursor:'pointer', padding:6, borderRadius:6 }}>
            <Menu size={20}/>
          </button>
          <div className="hide-mobile" style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.875rem', fontWeight:600, color:'var(--gray-600)' }}>
            <Shield size={14} style={{ color:'var(--primary)' }}/> Admin Panel
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.85rem', fontWeight:700 }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="hide-mobile">
                <div style={{ fontSize:'.875rem', fontWeight:700, color:'var(--gray-800)', lineHeight:1.2 }}>{user?.username}</div>
                <div style={{ fontSize:'.72rem', color:'var(--gray-500)' }}>Administrator</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color:'var(--danger)' }}>
              <LogOut size={16}/><span className="hide-mobile">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, padding:28, overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
