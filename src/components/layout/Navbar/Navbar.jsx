import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar, toggleTheme } from "../../../store/slices/uiSlice";
import { setQuery } from "../../../store/slices/searchSlice";
import { useDebounce } from "../../../hooks/utils/useDebounce";
import { useVoiceSearch } from "../../../hooks/utils/useVoiceSearch";
import { signInWithGoogle, signOutUser } from "../../../services/firebase";
import { getSearchSuggestions } from "../../../services/youtube";
import VoiceSearchModal from "../../search/VoiceSearchModal";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);

  // inputVal = what shows in the text box (changes on typing AND arrow keys)
  const [inputVal, setInputVal] = useState(searchParams.get("q") || "");
  // ✅ FIX: searchQuery = ONLY changes on actual typing, NOT on arrow key nav
  // Suggestions are fetched based on this, so they don't reset during navigation
  const searchQueryRef = useRef(searchParams.get("q") || "");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const inputRef = useRef(null);
  const suggestRef = useRef(null);
  const isNavigatingRef = useRef(false); // tracks if user is using arrow keys

  // ✅ Debounce the SEARCH QUERY ref value, not inputVal
  const [debouncedQuery, setDebouncedQuery] = useState(searchQueryRef.current);

  // Fetch suggestions only when real typing happens
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }
    getSearchSuggestions(debouncedQuery).then((s) => {
      // ✅ Only update suggestions if NOT navigating with arrows
      if (!isNavigatingRef.current) {
        setSuggestions(s);
        setActiveIndex(-1);
      }
    });
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        !suggestRef.current?.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const {
    listening,
    supported,
    browserWarning,
    startListening,
    stopListening,
  } = useVoiceSearch((transcript) => {
    setInputVal(transcript);
    searchQueryRef.current = transcript;
    dispatch(setQuery(transcript));
    navigate(`/search?q=${encodeURIComponent(transcript)}`);
  });

  const doSearch = useCallback(
    (q) => {
      if (!q?.trim()) return;
      setShowSuggestions(false);
      setActiveIndex(-1);
      isNavigatingRef.current = false;
      dispatch(setQuery(q));
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [dispatch, navigate],
  );

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = activeIndex >= 0 ? suggestions[activeIndex] : inputVal;
    if (q?.trim()) {
      setInputVal(q);
      doSearch(q);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    // ✅ Only update search query on real typing
    searchQueryRef.current = val;
    isNavigatingRef.current = false;
    setShowSuggestions(true);
    setActiveIndex(-1);

    // Debounce: update debouncedQuery after 300ms
    clearTimeout(window._searchDebounce);
    window._searchDebounce = setTimeout(() => {
      setDebouncedQuery(val);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      isNavigatingRef.current = true; // ✅ Mark as navigating — don't reset suggestions
      setActiveIndex((prev) => {
        const next = prev < suggestions.length - 1 ? prev + 1 : 0;
        // ✅ Update input display WITHOUT triggering suggestion fetch
        setInputVal(suggestions[next]);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      isNavigatingRef.current = true; // ✅ Mark as navigating
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : suggestions.length - 1;
        setInputVal(suggestions[next]);
        return next;
      });
    } else if (e.key === "Escape") {
      // ✅ Restore original typed query on Escape
      setInputVal(searchQueryRef.current);
      setShowSuggestions(false);
      setActiveIndex(-1);
      isNavigatingRef.current = false;
    }
    // Enter handled by form submit
  };

  const handleMicClick = () => {
    if (!supported) {
      toast.error(
        browserWarning ||
          "Voice search not available. In Brave: go to brave://flags → enable Web Speech API",
        { duration: 5000 },
      );
      return;
    }
    startListening();
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in!");
    } catch (e) {
      toast.error(e.message || "Sign in failed");
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setShowUserMenu(false);
    toast.success("Signed out");
  };

  return (
    <>
      {listening && (
        <VoiceSearchModal listening={listening} onClose={stopListening} />
      )}

      <header className="fixed top-0 left-0 right-0 h-14 bg-yt-bg z-50 flex items-center justify-between px-4 gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
          <div
            className="flex items-center gap-0.5 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <svg
              height="20"
              viewBox="0 0 90 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M27.97 3.12C27.64 1.89 26.68.93 25.45.6 23.22 0 14.28 0 14.28 0S5.35 0 3.12.6C1.89.93.93 1.89.6 3.12 0 5.35 0 10 0 10s0 4.65.6 6.88c.33 1.23 1.29 2.19 2.52 2.52C5.35 20 14.28 20 14.28 20s8.94 0 11.17-.6c1.23-.33 2.19-1.29 2.52-2.52C28.57 14.65 28.57 10 28.57 10s0-4.65-.6-6.88z"
                fill="#FF0000"
              />
              <path d="M11.43 14.29L18.86 10l-7.43-4.29v8.58z" fill="white" />
              <text
                x="32"
                y="15"
                fill="white"
                fontFamily="Roboto,sans-serif"
                fontSize="14"
                fontWeight="700"
              >
                YouTube
              </text>
            </svg>
            <span className="text-[10px] text-yt-text2 self-start mt-0.5 font-medium">
              IN
            </span>
          </div>
        </div>

        {/* CENTER — search + suggestions */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <form
              onSubmit={handleSearch}
              className="flex h-10 border border-yt-border rounded-full overflow-visible focus-within:border-yt-blue"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search"
                autoComplete="off"
                className="flex-1 bg-yt-bg px-5 pr-2 text-sm text-yt-text placeholder-yt-text3 outline-none rounded-l-full"
              />
              {/* ✕ Clear button — only shows when input has text */}
              {inputVal && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInputVal("");
                    searchQueryRef.current = "";
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setActiveIndex(-1);
                    clearTimeout(window._searchDebounce);
                    setDebouncedQuery("");
                    inputRef.current?.focus();
                  }}
                  className="flex-shrink-0 w-8 h-8 self-center mr-1 flex items-center justify-center rounded-full hover:bg-yt-bg3 text-yt-text2 transition-colors"
                  title="Clear"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="px-5 bg-yt-bg2 rounded-r-full hover:bg-yt-bg3 transition-colors flex items-center justify-center border-l border-yt-border"
              >
                <svg
                  className="w-5 h-5 text-yt-text"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestRef}
                className="absolute top-12 left-0 right-0 bg-yt-bg2 border border-yt-border rounded-xl shadow-2xl z-50 overflow-hidden py-2"
              >
                {suggestions.slice(0, 10).map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setInputVal(s);
                      searchQueryRef.current = s;
                      doSearch(s);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-yt-text transition-colors text-left ${
                      i === activeIndex ? "bg-yt-bg3" : "hover:bg-yt-bg3"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-yt-text3 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mic */}
          <button
            type="button"
            onClick={handleMicClick}
            title={supported ? "Voice search" : "Not available in this browser"}
            className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border border-yt-border transition-colors ${
              supported
                ? "bg-yt-bg2 hover:bg-yt-bg3"
                : "bg-yt-bg2 opacity-50 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-5 h-5 text-yt-text"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        </div>

        {/* RIGHT — auth & theme */}
        <div className="flex items-center gap-2 min-w-[160px] justify-end">
          <button
            onClick={() => dispatch(toggleTheme())}
            title="Toggle Light/Dark Theme"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-yt-bg3 transition-colors flex-shrink-0 mr-2"
          >
            {theme === "dark" ? (
              <svg className="w-6 h-6 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            ) : (
              <svg className="w-6 h-6 text-yt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            )}
          </button>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-yt-border transition-all"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-yt-red flex items-center justify-center text-white text-sm font-medium">
                    {user.displayName?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-11 w-56 bg-yt-bg2 border border-yt-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-yt-border">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-yt-red flex items-center justify-center text-white font-medium">
                          {user.displayName?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-yt-text truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-yt-text2 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-yt-text hover:bg-yt-bg3 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-1.5 border border-yt-blue text-yt-blue rounded-full text-sm font-medium hover:bg-blue-900/20 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Sign in
            </button>
          )}
        </div>
      </header>
    </>
  );
}
