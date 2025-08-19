"use client";

import React, { useEffect, useState } from 'react';
import { rfqService, type RFQ } from '@/lib/api/services/rfq.service';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ReceivedRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const router = useRouter();

  const loadData = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await rfqService.getRelevantRFQs({ page: p, limit: 10, search });
      setRfqs(res.rfqs || []);
      setPages(res.pagination?.pages || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Received RFQs</h1>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search RFQs" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => loadData(1)} disabled={loading}>Search</Button>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : rfqs.length === 0 ? (
          <div className="text-muted-foreground">No relevant RFQs found.</div>
        ) : (
          rfqs.map(r => (
            <Card key={r.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/rfqs/${r.id}`)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{r.title}</span>
                  <span className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-2">{r.description}</div>
                <div className="text-xs mt-2">Budget: {r.budgetMin ?? '-'} - {r.budgetMax ?? '-'}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => { const np = page - 1; setPage(np); loadData(np); }}>Prev</Button>
          <div className="text-sm">Page {page} of {pages}</div>
          <Button variant="outline" disabled={page >= pages} onClick={() => { const np = page + 1; setPage(np); loadData(np); }}>Next</Button>
        </div>
      )}
    </div>
  );
}
