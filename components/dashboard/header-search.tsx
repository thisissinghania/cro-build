"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, ActivitySquare, Compass, X, Loader2, ArrowRight } from "lucide-react";
import { searchGlobalAction, type SearchResults } from "@/actions/search";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ websites: [], audits: [], pages: [] });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ websites: [], audits: [], pages: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      const res = await searchGlobalAction(query);
      if (res.success && res.data) {
        setResults(res.data);
      }
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const hasAnyResults =
    results.websites.length > 0 || results.audits.length > 0 || results.pages.length > 0;

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search websites, audit reports, pages..."
          className="w-full h-[48px] pl-10 pr-9 text-sm bg-white border border-zinc-200 rounded-lg outline-none transition-all hover:border-zinc-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 placeholder:text-zinc-400"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults({ websites: [], audits: [], pages: [] });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Searching...</span>
            </div>
          ) : !hasAnyResults ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              No results found for &ldquo;<span className="font-semibold text-zinc-700">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 p-2">
              {/* Websites Group */}
              {results.websites.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" /> Connected Websites
                  </div>
                  {results.websites.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-zinc-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                      </div>
                      {item.badge && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Audits Group */}
              {results.audits.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ActivitySquare className="w-3.5 h-3.5 text-fuchsia-500" /> AI CRO Audits
                  </div>
                  {results.audits.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-zinc-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                      </div>
                      {item.badge && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Pages Group */}
              {results.pages.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-zinc-500" /> Quick Navigation
                  </div>
                  {results.pages.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-zinc-50 transition-colors text-left cursor-pointer group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500">{item.subtitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
