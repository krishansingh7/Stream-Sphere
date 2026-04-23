import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, toggleTheme } from "../../../store/slices/uiSlice";
import { setQuery } from "../../../store/slices/searchSlice";
import { useVoiceSearch } from "../../../hooks/utils/useVoiceSearch";
import { signInWithGoogle, signOutUser } from "../../../services/firebase";
import { getSearchSuggestions } from "../../../services/youtube";
import VoiceSearchModal from "../../search/VoiceSearchModal";
import toast from "react-hot-toast";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);
const MicIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
// fill="currentColor" on the text so it follows the parent's text color
// (white in dark mode, black in light mode — set via className on the wrapper)
function YTLogo({ showText = true }) {
  // Use a tighter viewBox when text is shown to remove dead space on the right,
  // allowing the "IN" badge to sit tightly against the 'e'.
  return (
    <svg height="20" viewBox={showText ? "0 0 90 20" : "0 0 29 20"} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M27.97 3.12C27.64 1.89 26.68.93 25.45.6 23.22 0 14.28 0 14.28 0S5.35 0 3.12.6C1.89.93.93 1.89.6 3.12 0 5.35 0 10 0 10s0 4.65.6 6.88c.33 1.23 1.29 2.19 2.52 2.52C5.35 20 14.28 20 14.28 20s8.94 0 11.17-.6c1.23-.33 2.19-1.29 2.52-2.52C28.57 14.65 28.57 10 28.57 10s0-4.65-.6-6.88z"
        fill="#FF0000"
      />
      {/* Play triangle — always white inside the red box */}
      <path d="M11.43 14.29L18.86 10l-7.43-4.29v8.58z" fill="white" />
      {/* "YouTube" text — inherits color from parent (text-yt-text) */}
      {showText && (
        <text x="32" y="15" fill="currentColor" fontFamily="Roboto,sans-serif" fontSize="14" fontWeight="700">
          YouTube
        </text>
      )}
    </svg>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);

  const [inputVal, setInputVal]           = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex]     = useState(-1);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  // Mobile search overlay state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchQueryRef   = useRef(searchParams.get("q") || "");
  const inputRef         = useRef(null);
  const mobileInputRef   = useRef(null);
  const suggestRef       = useRef(null);
  const isNavigatingRef  = useRef(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQueryRef.current);

  // Auto-focus mobile input on open
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) { setSuggestions([]); setActiveIndex(-1); return; }
    getSearchSuggestions(debouncedQuery).then((s) => {
      if (!isNavigatingRef.current) { setSuggestions(s); setActiveIndex(-1); }
    });
  }, [debouncedQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!suggestRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { listening, supported, browserWarning, startListening, stopListening } =
    useVoiceSearch((transcript) => {
      setInputVal(transcript);
      searchQueryRef.current = transcript;
      dispatch(setQuery(transcript));
      navigate(`/search?q=${encodeURIComponent(transcript)}`);
      setMobileSearchOpen(false);
    });

  const doSearch = useCallback(
    (q) => {
      if (!q?.trim()) return;
      setShowSuggestions(false);
      setActiveIndex(-1);
      isNavigatingRef.current = false;
      dispatch(setQuery(q));
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearchOpen(false);
    },
    [dispatch, navigate]
  );

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = activeIndex >= 0 ? suggestions[activeIndex] : inputVal;
    if (q?.trim()) { setInputVal(q); doSearch(q); }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    searchQueryRef.current = val;
    isNavigatingRef.current = false;
    setShowSuggestions(true);
    setActiveIndex(-1);
    clearTimeout(window._searchDebounce);
    window._searchDebounce = setTimeout(() => setDebouncedQuery(val), 300);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      isNavigatingRef.current = true;
      setActiveIndex((prev) => { const next = prev < suggestions.length - 1 ? prev + 1 : 0; setInputVal(suggestions[next]); return next; });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      isNavigatingRef.current = true;
      setActiveIndex((prev) => { const next = prev > 0 ? prev - 1 : suggestions.length - 1; setInputVal(suggestions[next]); return next; });
    } else if (e.key === "Escape") {
      setInputVal(searchQueryRef.current);
      setShowSuggestions(false);
      setActiveIndex(-1);
      isNavigatingRef.current = false;
      setMobileSearchOpen(false);
    }
  };

  const handleMicClick = () => {
    if (!supported) {
      toast.error(browserWarning || "Voice search not available in this browser", { duration: 4000 });
      return;
    }
    startListening();
  };

  const handleSignIn = async () => {
    try { await signInWithGoogle(); toast.success("Signed in!"); }
    catch (e) { toast.error(e.message || "Sign in failed"); }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setShowUserMenu(false);
    toast.success("Signed out");
  };

  // Shared suggestion list renderer
  const SuggestionList = ({ refProp, mobile = false }) =>
    showSuggestions && suggestions.length > 0 ? (
      <div
        ref={refProp}
        className={`absolute left-0 right-0 bg-yt-bg2 border border-yt-border shadow-2xl z-50 overflow-hidden py-2 ${
          mobile ? "top-0 rounded-none" : "top-12 rounded-xl"
        }`}
      >
        {suggestions.slice(0, 10).map((s, i) => (
          <button
            key={i}
            onMouseDown={(e) => { e.preventDefault(); setInputVal(s); searchQueryRef.current = s; doSearch(s); }}
            onMouseEnter={() => setActiveIndex(i)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-yt-text transition-colors text-left ${
              i === activeIndex ? "bg-yt-bg3" : "hover:bg-yt-bg3"
            }`}
          >
            <SearchIcon className="w-4 h-4 text-yt-text3 flex-shrink-0" />
            <span>{s}</span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <>
      {listening && <VoiceSearchModal listening={listening} onClose={stopListening} />}

      {/* ═══════════════════════════════════════════════════
          DESKTOP HEADER (md and up)
      ═══════════════════════════════════════════════════ */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-yt-bg z-50 items-center px-2 gap-2">
        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-3 min-w-[180px] xl:min-w-[220px] flex-shrink-0">
          <button onClick={() => dispatch(toggleSidebar())} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
          </button>
          <div className="flex items-center cursor-pointer text-yt-text" onClick={() => navigate("/")}>
            <YTLogo showText />
            <span className="text-[10px] text-yt-text2 self-start mt-0.5 ml-0.5 font-medium">IN</span>
          </div>
        </div>

        {/* Center — search bar, absolutely centered */}
        <div className="flex-1 flex justify-center px-4">
          <div className="flex items-center gap-2 w-full max-w-xl lg:max-w-2xl">
            <div className="relative flex-1">
              <form onSubmit={handleSearch} className="flex h-10 border border-yt-border rounded-full overflow-visible focus-within:border-yt-blue focus-within:shadow-[0_0_0_2px_rgba(62,166,255,0.15)]">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search"
                  autoComplete="off"
                  className="flex-1 w-full min-w-0 bg-yt-bg px-5 pr-2 text-sm text-yt-text placeholder-yt-text3 outline-none rounded-l-full"
                />
                {inputVal && (
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); setInputVal(""); searchQueryRef.current = ""; setSuggestions([]); setShowSuggestions(false); setActiveIndex(-1); setDebouncedQuery(""); inputRef.current?.focus(); }} className="flex-shrink-0 w-8 h-8 self-center mr-1 flex items-center justify-center rounded-full hover:bg-yt-bg3 text-yt-text2 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                )}
                <button type="submit" className="px-5 bg-yt-bg2 rounded-r-full hover:bg-yt-bg3 transition-colors flex items-center justify-center border-l border-yt-border">
                  <SearchIcon />
                </button>
              </form>
              <SuggestionList refProp={suggestRef} />
            </div>
            <button onClick={handleMicClick} className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border border-yt-border transition-colors ${supported ? "bg-yt-bg2 hover:bg-yt-bg3" : "bg-yt-bg2 opacity-50 cursor-not-allowed"}`}>
              <MicIcon />
            </button>
          </div>
        </div>

        {/* Right — theme + user */}
        <div className="flex items-center gap-1.5 min-w-[180px] xl:min-w-[220px] flex-shrink-0 justify-end">
          <button onClick={() => dispatch(toggleTheme())} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors">
            {theme === "dark"
              ? <svg className="w-5 h-5 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-5 h-5 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
          {user ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu((p) => !p)} className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-yt-border transition-all">
                {user.photoURL ? <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yt-text3 bg-yt-bg3"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-11 w-56 bg-yt-bg2 border border-yt-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-yt-border">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">{user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yt-text3 bg-yt-bg3"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}</div>
                    <div className="min-w-0"><p className="text-sm font-medium text-yt-text truncate">{user.displayName}</p><p className="text-xs text-yt-text2 truncate">{user.email}</p></div>
                  </div>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-yt-text hover:bg-yt-bg3 transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleSignIn} className="flex items-center gap-2 px-4 py-1.5 border border-yt-blue text-yt-blue rounded-full text-sm font-medium hover:bg-blue-900/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MOBILE HEADER (below md) — matches real YouTube mobile
          Left: hamburger + YT logo (icon only, no text)
          Right: theme + search icon only (avatar is in bottom "You" tab)
      ═══════════════════════════════════════════════════ */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-yt-bg z-50 flex items-center justify-between px-2">
        {/* Left: hamburger + YouTube logo icon only */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          {/* Logo icon only — no text, matches real YouTube mobile header */}
          <div className="flex items-center cursor-pointer pl-1" onClick={() => navigate("/")}>
            <YTLogo showText={false} />
          </div>
        </div>

        {/* Right: theme toggle + search icon — no avatar (it's in the bottom You tab) */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors"
          >
            {theme === "dark"
              ? <svg className="w-6 h-6 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-6 h-6 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors"
          >
            <SearchIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MOBILE FULL-SCREEN SEARCH OVERLAY
          Slides in from the top when search icon is tapped
      ═══════════════════════════════════════════════════ */}
      <div className={`md:hidden fixed inset-0 bg-yt-bg z-[100] flex flex-col transition-transform duration-200 ${mobileSearchOpen ? "translate-y-0" : "-translate-y-full"}`}>
        {/* Search bar row */}
        <div className="flex items-center h-14 px-2 gap-2 border-b border-yt-border flex-shrink-0">
          <button onClick={() => { setMobileSearchOpen(false); setShowSuggestions(false); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors flex-shrink-0 text-yt-text">
            <BackIcon />
          </button>
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <input
              ref={mobileInputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search YouTube"
              autoComplete="off"
              spellCheck="false"
              className="flex-1 min-w-0 bg-transparent text-yt-text text-base placeholder-yt-text3 outline-none py-2"
            />
            {inputVal && (
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setInputVal(""); searchQueryRef.current = ""; setSuggestions([]); setShowSuggestions(false); setActiveIndex(-1); setDebouncedQuery(""); mobileInputRef.current?.focus(); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yt-bg3 text-yt-text2 transition-colors flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            )}
          </form>
          <button onClick={handleMicClick} className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${supported ? "text-yt-text hover:bg-yt-bg3" : "text-yt-text3 cursor-not-allowed"}`}>
            <MicIcon />
          </button>
        </div>

        {/* Suggestion results — full screen list */}
        <div className="flex-1 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={(e) => { e.preventDefault(); setInputVal(s); searchQueryRef.current = s; doSearch(s); }}
              onTouchEnd={(e) => { e.preventDefault(); setInputVal(s); searchQueryRef.current = s; doSearch(s); }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-yt-text transition-colors text-left border-b border-yt-border/30 ${i === activeIndex ? "bg-yt-bg3" : "hover:bg-yt-bg2 active:bg-yt-bg3"}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Search icon — matches real YouTube suggestion list */}
                <svg className="w-5 h-5 text-yt-text3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <span className="truncate">{s}</span>
              </div>
              {/* Arrow-up-left to fill input without searching */}
              {/* ↗ arrow — tap to fill input with suggestion without navigating */}
              <button
                type="button"
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setInputVal(s); searchQueryRef.current = s; setDebouncedQuery(s); mobileInputRef.current?.focus(); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setInputVal(s); searchQueryRef.current = s; setDebouncedQuery(s); mobileInputRef.current?.focus(); }}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-yt-text3 active:bg-yt-bg3"
              >
                {/* Northwest arrow: fills search input with this term */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z" />
                </svg>
              </button>
            </button>
          ))}
          {/* Empty state */}
          {inputVal && suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <SearchIcon className="w-12 h-12 text-yt-text3 mb-3" />
              <p className="text-yt-text2 text-sm">Search for "{inputVal}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
