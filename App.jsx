import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Home, Compass, PlusSquare, Heart, UserRound, Search, Sun, Moon,
  MessageCircle, Send, Bookmark, MoreHorizontal, ImagePlus, X, Check,
  Users, Bell, Settings, LogOut, Camera, Hash, Sparkles, Menu, ArrowUpRight
} from 'lucide-react';

const initialPosts = [
  {
    id: 1, user: 'layla.design', name: 'ليلى أحمد', avatar: 'ل',
    time: 'منذ ٢٠ دقيقة', caption: 'تفاصيل صغيرة تصنع يوماً جميلاً ✨ ما رأيكم بهذا الهدوء؟',
    image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1100&q=85',
    likes: 128, comments: [{id: 1, user: 'noor', text: 'جميل جداً! 🤍'}], liked: false, saved: false, tag: 'تصوير'
  },
  {
    id: 2, user: 'ali.travels', name: 'علي كريم', avatar: 'ع',
    time: 'منذ ساعة', caption: 'مكان يستحق الزيارة. أحياناً نحتاج فقط إلى استراحة قصيرة بعيداً عن الضجيج. 🌿',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1100&q=85',
    likes: 86, comments: [], liked: true, saved: false, tag: 'سفر'
  },
  {
    id: 3, user: 'sara.daily', name: 'سارة محمد', avatar: 'س',
    time: 'منذ ٣ ساعات', caption: 'بداية جديدة، وطاقة أجمل. يومكم سعيد يا أصدقاء ORVO',
    image: '', likes: 42, comments: [{id: 2, user: 'mohammed', text: 'يوم سعيد!'}], liked: false, saved: false, tag: 'يوميات'
  }
];

const people = [
  { user: 'noor.art', name: 'نور علي', bio: 'فن، ألوان وأفكار 🎨', avatar: 'ن', followers: '2.4k' },
  { user: 'mohammed.dev', name: 'محمد حسن', bio: 'أبني أشياء على الإنترنت 💻', avatar: 'م', followers: '1.8k' },
  { user: 'zahra.photo', name: 'زهراء كريم', bio: 'أرى العالم بعدستي 📷', avatar: 'ز', followers: '980' },
  { user: 'hassan.iraq', name: 'حسن جاسم', bio: 'لحظات من العراق 🇮🇶', avatar: 'ح', followers: '3.1k' }
];

function Avatar({ letter, small = false, gradient = 0 }) {
  return <div className={`avatar avatar-${gradient} ${small ? 'avatar-small' : ''}`}>{letter}</div>;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('orvo-theme') || 'light');
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orvo-posts')) || initialPosts; }
    catch { return initialPosts; }
  });
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [photo, setPhoto] = useState('');
  const [commentText, setCommentText] = useState({});
  const [activeComment, setActiveComment] = useState(null);
  const [profileTab, setProfileTab] = useState('posts');
  const fileRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('orvo-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('orvo-posts', JSON.stringify(posts));
  }, [posts]);

  const notify = (message) => {
    setNotice(message);
    window.clearTimeout(window.__orvoToast);
    window.__orvoToast = window.setTimeout(() => setNotice(''), 2400);
  };

  const toggleLike = (id) => setPosts(prev => prev.map(p => p.id === id
    ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));

  const toggleSave = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  const addComment = (id) => {
    const text = (commentText[id] || '').trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, comments: [...p.comments, { id: Date.now(), user: 'you', text }] } : p));
    setCommentText(prev => ({ ...prev, [id]: '' }));
    notify('تمت إضافة تعليقك');
  };

  const publish = () => {
    if (!caption.trim() && !photo) return notify('أضف نصاً أو صورة قبل النشر');
    const newPost = {
      id: Date.now(), user: 'you.orvo', name: 'أنت', avatar: 'أ',
      time: 'الآن', caption: caption.trim(), image: photo,
      likes: 0, comments: [], liked: false, saved: false, tag: 'جديد'
    };
    setPosts(prev => [newPost, ...prev]);
    setCaption(''); setPhoto(''); setModal(false); setPage('home');
    notify('تم نشر منشورك بنجاح');
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('اختر ملف صورة فقط');
    if (file.size > 5 * 1024 * 1024) return notify('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(p => `${p.name} ${p.user} ${p.caption} ${p.tag}`.toLowerCase().includes(q));
  }, [posts, search]);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'explore', label: 'استكشاف', icon: Compass },
    { id: 'create', label: 'إنشاء منشور', icon: PlusSquare },
    { id: 'notifications', label: 'الإشعارات', icon: Heart },
    { id: 'profile', label: 'ملفي الشخصي', icon: UserRound }
  ];

  const navigate = (id) => {
    if (id === 'create') { setModal(true); return; }
    setPage(id);
    setSearch('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => setPage('home')} aria-label="ORVO الرئيسية">
            <span className="brand-mark">O</span><span>ORVO</span>
          </button>
          <div className="top-search">
            <Search size={18} />
            <input value={search} onChange={e => {setSearch(e.target.value); if (page !== 'explore') setPage('explore');}} placeholder="ابحث عن أشخاص أو منشورات..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <button className="icon-button settings-top" onClick={() => setPage('settings')} title="الإعدادات" aria-label="الإعدادات"><Settings size={19}/></button>
            <button className="icon-button notification-top" onClick={() => setPage('notifications')} title="الإشعارات"><Bell size={19}/><i /></button>
            <Avatar letter="أ" small gradient={2}/>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-label">القائمة</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => navigate(item.id)} className={`nav-item ${page === item.id ? 'active' : ''}`}>
              <Icon size={20}/><span>{item.label}</span>{item.id === 'notifications' && <b className="nav-dot"/>}
            </button>;
          })}
          <div className="sidebar-bottom">
            <div className="sidebar-label">حسابك</div>
            <button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}><Settings size={19}/><span>الإعدادات</span></button>
            <div className="mini-profile">
              <Avatar letter="أ" small gradient={2}/>
              <div><strong>أنت</strong><small>@you.orvo</small></div>
              <MoreHorizontal size={18}/>
            </div>
          </div>
          <div className="sidebar-foot">ORVO <span>نسخة تجريبية 1.0</span></div>
        </aside>

        <main className="main-content">
          {page === 'home' && <HomePage posts={posts} toggleLike={toggleLike} toggleSave={toggleSave} setActiveComment={setActiveComment} commentText={commentText} setCommentText={setCommentText} addComment={addComment} activeComment={activeComment} setModal={setModal} />}
          {page === 'explore' && <ExplorePage posts={filteredPosts} people={people} following={following} setFollowing={setFollowing} search={search} setSearch={setSearch} toggleLike={toggleLike} />}
          {page === 'notifications' && <NotificationsPage />}
          {page === 'profile' && <ProfilePage posts={posts.filter(p => p.user === 'you.orvo')} profileTab={profileTab} setProfileTab={setProfileTab} />}
          {page === 'settings' && <SettingsPage theme={theme} setTheme={setTheme} notify={notify} />}
        </main>

        <aside className="right-rail">
          <div className="profile-card">
            <div className="profile-card-top"><span>حسابك الشخصي</span><button onClick={() => notify('تعديل الملف الشخصي سيتوفر بعد ربط قاعدة البيانات')}><MoreHorizontal size={18}/></button></div>
            <div className="profile-card-user"><Avatar letter="أ" gradient={2}/><div><strong>أنت</strong><small>@you.orvo</small></div></div>
            <div className="profile-stats"><div><strong>{posts.filter(p => p.user === 'you.orvo').length}</strong><small>منشورات</small></div><div><strong>0</strong><small>متابعون</small></div><div><strong>{following.length}</strong><small>تتابع</small></div></div>
            <button className="outline-button" onClick={() => setPage('profile')}>عرض الملف الشخصي</button>
          </div>
          <div className="suggest-card">
            <div className="section-heading"><strong>أشخاص قد تعرفهم</strong><button onClick={() => setPage('explore')}>عرض الكل</button></div>
            {people.slice(0,3).map((p,i) => <div className="suggest-person" key={p.user}><Avatar letter={p.avatar} small gradient={i}/><div className="suggest-info"><strong>{p.name}</strong><small>@{p.user}</small></div><button className={`follow-mini ${following.includes(p.user) ? 'is-following' : ''}`} onClick={() => setFollowing(old => old.includes(p.user) ? old.filter(x => x !== p.user) : [...old,p.user])}>{following.includes(p.user) ? 'تتابع' : 'متابعة'}</button></div>)}
          </div>
          <div className="rail-footer">حول ORVO · الخصوصية · الشروط<br/>© 2026 ORVO</div>
        </aside>
      </div>

      <nav className="mobile-nav">
        {navItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={page === item.id ? 'active' : ''}><Icon size={21}/><span>{item.id === 'create' ? 'إضافة' : item.label}</span></button>; })}
      </nav>

      {modal && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setModal(false);}}>
        <section className="create-modal">
          <div className="modal-head"><div><span className="eyebrow">شارك لحظتك</span><h2>منشور جديد</h2></div><button className="icon-button" onClick={() => setModal(false)}><X size={20}/></button></div>
          <div className="composer-user"><Avatar letter="أ" small gradient={2}/><div><strong>أنت</strong><small>@you.orvo</small></div></div>
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="بماذا تفكر اليوم؟ شارك شيئاً جميلاً..." rows={5}/>
          {photo && <div className="photo-preview"><img src={photo} alt="معاينة المنشور"/><button onClick={() => setPhoto('')}><X size={16}/></button></div>}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile}/>
          <div className="composer-tools"><button className="add-photo" onClick={() => fileRef.current?.click()}><ImagePlus size={19}/> إضافة صورة</button><span>حتى 5 ميغابايت</span></div>
          <button className="primary-button publish-button" onClick={publish}>نشر الآن <ArrowUpRight size={17}/></button>
        </section>
      </div>}

      {notice && <div className="toast"><Check size={17}/>{notice}</div>}
    </div>
  );
}

function HomePage({posts, toggleLike, toggleSave, setActiveComment, commentText, setCommentText, addComment, activeComment, setModal}) {
  return <div className="feed-column">
    <div className="welcome-row"><div><span className="eyebrow">مساحتك الاجتماعية</span><h1>مرحباً بك في ORVO <span>👋</span></h1><p>اكتشف ما يشاركه أصدقاؤك اليوم.</p></div><div className="welcome-spark"><Sparkles size={25}/></div></div>
    <div className="stories-card">
      <div className="stories-title"><strong>القصص</strong><span>تختفي بعد 24 ساعة</span></div>
      <div className="stories-list">
        <button className="story-item add-story" onClick={() => setModal(true)}><div className="story-ring own-story"><Avatar letter="أ" small gradient={2}/><i>+</i></div><span>قصتك</span></button>
        {people.map((p,i) => <button className="story-item" key={p.user}><div className={`story-ring ring-${i}`}><Avatar letter={p.avatar} small gradient={i}/></div><span>{p.name.split(' ')[0]}</span></button>)}
      </div>
    </div>
    <div className="feed-heading"><div><h2>آخر المنشورات</h2><p>محتوى جديد من مجتمعك</p></div><button className="sort-button">الأحدث <span>⌄</span></button></div>
    {posts.map(post => <PostCard key={post.id} post={post} toggleLike={toggleLike} toggleSave={toggleSave} setActiveComment={setActiveComment} commentText={commentText} setCommentText={setCommentText} addComment={addComment} activeComment={activeComment}/>)}
    {posts.length === 0 && <div className="empty-state"><Sparkles size={30}/><h3>لا توجد منشورات بعد</h3><p>كن أول من يشارك لحظة جميلة.</p></div>}
  </div>;
}

function PostCard({post, toggleLike, toggleSave, setActiveComment, commentText, setCommentText, addComment, activeComment}) {
  return <article className="post-card">
    <div className="post-header"><div className="post-author"><Avatar letter={post.avatar} small gradient={post.id % 3}/><div><strong>{post.name}</strong><small>@{post.user} <span>·</span> {post.time}</small></div></div><button className="icon-button" aria-label="المزيد"><MoreHorizontal size={21}/></button></div>
    {post.caption && <p className="post-caption">{post.caption}</p>}
    {post.image && <div className="post-image"><img src={post.image} alt="صورة المنشور" loading="lazy"/></div>}
    {!post.image && <div className="text-post-art"><span>“</span><p>{post.caption}</p><small>ORVO MOMENTS</small></div>}
    <div className="post-actions"><div className="post-action-group"><button className={post.liked ? 'liked' : ''} onClick={() => toggleLike(post.id)}><Heart size={21} fill={post.liked ? 'currentColor' : 'none'}/></button><button onClick={() => setActiveComment(activeComment === post.id ? null : post.id)}><MessageCircle size={21}/></button><button onClick={() => navigator.clipboard?.writeText(window.location.href).catch(()=>{})}><Send size={20}/></button></div><button className={post.saved ? 'saved' : ''} onClick={() => toggleSave(post.id)}><Bookmark size={20} fill={post.saved ? 'currentColor' : 'none'}/></button></div>
    <div className="post-meta"><strong>{post.likes.toLocaleString('en-US')} إعجاب</strong><button onClick={() => setActiveComment(activeComment === post.id ? null : post.id)}>عرض {post.comments.length} تعليق</button></div>
    {post.comments.slice(-2).map(c => <div className="comment-preview" key={c.id}><strong>{c.user === 'you' ? 'أنت' : `@${c.user}`}</strong> {c.text}</div>)}
    {activeComment === post.id && <div className="comment-box"><input value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({...prev,[post.id]:e.target.value}))} onKeyDown={e => e.key === 'Enter' && addComment(post.id)} placeholder="اكتب تعليقاً..."/><button onClick={() => addComment(post.id)}><Send size={17}/></button></div>}
  </article>;
}

function ExplorePage({posts, people, following, setFollowing, search, setSearch, toggleLike}) {
  return <div className="page-column"><div className="page-title"><span className="eyebrow">اكتشف مجتمعك</span><h1>استكشاف</h1><p>اعثر على أشخاص وأفكار تلهمك.</p></div>
    <div className="explore-search"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن اسم أو كلمة أو وسم..."/></div>
    <div className="section-heading explore-heading"><strong><Users size={18}/> أشخاص مقترحون</strong><span>قد يهمك متابعتهم</span></div>
    <div className="people-grid">{people.map((p,i) => <div className="person-card" key={p.user}><Avatar letter={p.avatar} gradient={i}/><strong>{p.name}</strong><small>@{p.user}</small><p>{p.bio}</p><button className={`primary-button ${following.includes(p.user) ? 'following-button' : ''}`} onClick={() => setFollowing(old => old.includes(p.user) ? old.filter(x => x !== p.user) : [...old,p.user])}>{following.includes(p.user) ? 'تتابع ✓' : 'متابعة'}</button></div>)}</div>
    <div className="section-heading explore-heading"><strong><Hash size={18}/> منشورات تستحق المشاهدة</strong><span>{posts.length} منشور</span></div>
    <div className="explore-grid">{posts.map(p => <button key={p.id} className="explore-tile" onClick={() => toggleLike(p.id)}>{p.image ? <img src={p.image} alt="منشور"/> : <div className="tile-text">{p.caption}</div>}<div className="tile-overlay"><Heart size={17}/> {p.likes}</div></button>)}</div>
    {posts.length === 0 && <div className="empty-state"><Search size={28}/><h3>لم نعثر على نتائج</h3><p>جرّب كلمة بحث مختلفة.</p></div>}
  </div>;
}

function NotificationsPage() {
  const items = [
    {letter:'ن',name:'نور علي',action:'أعجبت بمنشورك',time:'منذ ١٠ دقائق',color:0},
    {letter:'م',name:'محمد حسن',action:'بدأ بمتابعتك',time:'منذ ساعة',color:1},
    {letter:'ز',name:'زهراء كريم',action:'علّقت على منشورك: صورة جميلة! 💜',time:'منذ ٣ ساعات',color:2}
  ];
  return <div className="page-column"><div className="page-title"><span className="eyebrow">ابقَ على اطلاع</span><h1>الإشعارات</h1><p>آخر التفاعلات مع حسابك.</p></div><div className="notifications-card">{items.map((n,i)=><div className="notification-row" key={i}><Avatar letter={n.letter} small gradient={n.color}/><div className="notification-copy"><p><strong>{n.name}</strong> {n.action}</p><small>{n.time}</small></div><span className="notification-unread"/>{i===0 && <div className="notification-thumb"><Heart size={19}/></div>}</div>)}</div><div className="demo-note">هذه إشعارات تجريبية. ستصبح حقيقية بعد ربط قاعدة البيانات.</div></div>;
}

function SettingsPage({theme, setTheme, notify}) {
  return <div className="page-column settings-page">
    <div className="page-title"><span className="eyebrow">خصص تجربتك</span><h1>الإعدادات</h1><p>تحكم بمظهر ORVO وطريقة استخدامك له.</p></div>
    <section className="settings-section">
      <div className="settings-section-heading"><div><span className="settings-kicker">المظهر</span><h2>المظهر العام</h2><p>اختر الشكل الذي يريح عينيك. سيتم حفظ اختيارك على هذا الجهاز.</p></div><div className="settings-heading-icon"><Settings size={21}/></div></div>
      <div className="theme-options">
        <button className={`theme-option ${theme === 'light' ? 'chosen' : ''}`} onClick={() => {setTheme('light'); notify('تم تفعيل المظهر النهاري');}}>
          <span className="theme-preview theme-preview-light"><i/><i/><i/></span><span className="theme-option-copy"><strong><Sun size={17}/> المظهر النهاري</strong><small>خلفية فاتحة وألوان هادئة</small></span>{theme === 'light' && <Check className="theme-check" size={18}/>}
        </button>
        <button className={`theme-option ${theme === 'dark' ? 'chosen' : ''}`} onClick={() => {setTheme('dark'); notify('تم تفعيل المظهر الليلي');}}>
          <span className="theme-preview theme-preview-dark"><i/><i/><i/></span><span className="theme-option-copy"><strong><Moon size={17}/> المظهر الليلي</strong><small>درجات داكنة مريحة في الإضاءة المنخفضة</small></span>{theme === 'dark' && <Check className="theme-check" size={18}/>}
        </button>
      </div>
    </section>
    <section className="settings-section settings-about"><span className="settings-kicker">عن المنصة</span><h2>ORVO</h2><p>مساحة تجمعك بالأشخاص والأفكار واللحظات التي تستحق المشاركة.</p><div className="settings-version">الإصدار التجريبي <b>1.1</b></div></section>
  </div>;
}

function ProfilePage({posts, profileTab, setProfileTab}) {
  return <div className="page-column"><div className="page-title"><span className="eyebrow">مساحتك الخاصة</span><h1>الملف الشخصي</h1></div><div className="profile-cover"><div className="cover-orb orb-one"/><div className="cover-orb orb-two"/></div><div className="profile-detail"><Avatar letter="أ" gradient={2}/><button className="outline-button edit-profile" onClick={() => alert('تعديل الملف الشخصي سيتوفر بعد ربط قاعدة البيانات')}>تعديل الملف</button><h2>أنت</h2><span className="profile-handle">@you.orvo</span><p>أهلاً بكم في عالمي على ORVO</p><div className="profile-counts"><span><strong>{posts.length}</strong> منشورات</span><span><strong>0</strong> متابعون</span><span><strong>0</strong> تتابع</span></div></div><div className="profile-tabs"><button className={profileTab === 'posts' ? 'selected' : ''} onClick={() => setProfileTab('posts')}><ImagePlus size={17}/> المنشورات</button><button className={profileTab === 'saved' ? 'selected' : ''} onClick={() => setProfileTab('saved')}><Bookmark size={17}/> المحفوظات</button></div><div className="profile-post-grid">{(profileTab === 'posts' ? posts : []).map(p => <div key={p.id} className="profile-post">{p.image ? <img src={p.image} alt="منشور"/> : <div>{p.caption}</div>}</div>)}</div>{posts.length===0 && <div className="empty-state"><Camera size={28}/><h3>لم تنشر شيئاً بعد</h3><p>ستظهر منشوراتك هنا عندما تبدأ المشاركة.</p></div>}</div>;
}

export default App;
