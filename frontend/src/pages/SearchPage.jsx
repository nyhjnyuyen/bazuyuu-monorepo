import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/productApi';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = (searchParams.get('keyword') || '').trim();
    const [page, setPage] = useState(Number(searchParams.get('page') || 0));

    const [result, setResult] = useState(null); // will hold the Page object
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    useEffect(() => {
        if (!keyword) {
            setResult(null);
            return;
        }

        setLoading(true);
        setError('');

        searchProducts({ keyword, page, size: 24 })
            .then(setResult)
            .catch(err => {
                console.error(err);
                setError('Something went wrong, please try again.');
            })
            .finally(() => setLoading(false));
    }, [keyword, page]);

    const products = result?.content || [];
    const totalPages = result?.totalPages || 0;

    const handlePageChange = (newPage) => {
        setPage(newPage);
        setSearchParams({ keyword, page: newPage });
    };

    return (
        <div className="min-h-screen px-4 md:px-10 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Search results for “{keyword}”
            </h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && keyword && products.length === 0 && (
                <p>No products found.</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="border rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                        <img
                            src={p.imageUrls?.[0]}
                            alt={p.name}
                            className="w-full h-40 object-cover rounded-md mb-2"
                        />
                        <div className="font-semibold text-sm md:text-base">{p.name}</div>
                        <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {p.description}
                        </div>
                        <div className="mt-2 font-bold text-base">
                            ${Number(p.price).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center gap-3 mt-6">
                    <button
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>
            Page {page + 1} / {totalPages}
          </span>
                    <button
                        disabled={page + 1 >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
