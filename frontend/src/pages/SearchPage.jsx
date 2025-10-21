// src/pages/SearchPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getApiBaseUrl } from '../api/baseUrl';

const API_BASE = getApiBaseUrl();

const PAGE_SIZE = 24;

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchPage() {
    const q = useQuery();
    const keyword = q.get('keyword') || '';
    const page = Number(q.get('page') || '0');

    const [data, setData] = useState({
        content: [],
        totalElements: 0,
        number: 0,
        size: PAGE_SIZE,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const url = `${API_BASE}/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${PAGE_SIZE}`;

        (async () => {
            try {
                const res = await fetch(url, { signal: controller.signal });
                const ct = res.headers.get('content-type') || '';
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (!ct.includes('application/json')) {
                    // helpful for catching accidental HTML from port 3000
                    const text = await res.text();
                    throw new Error(`Expected JSON, got: ${ct}. Body: ${text.slice(0, 200)}`);
                }
                const json = await res.json();
                setData(json);
                setError('');
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.warn('Search fetch failed:', e);
                    setError('Could not load search results.');
                    setData(d => ({ ...d, content: [] }));
                }
            }
        })();

        return () => controller.abort();
    }, [keyword, page]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Search results for “{keyword}”</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {data.content.length === 0 ? (
                <p className="text-gray-600">No products found.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.content.map(p => (
                        <div key={p.id} className="border rounded-xl p-3 shadow-sm hover:shadow">
                            <img src={p.thumbnailUrl} alt={p.name} className="w-full h-40 object-cover rounded-lg"/>
                            <div className="mt-2">
                                <div className="font-semibold">{p.name}</div>
                                {p?.price != null && (
                                    <div className="text-sm text-gray-500">${Number(p.price).toFixed(2)}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
