'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CashierDashboard from '@/components/CashierDashboard';
import { supabase } from '@/lib/supabaseClient';

function PosContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  const orgParam = searchParams.get('org');
  const [resolvedOrgId, setResolvedOrgId] = useState<string>('a0000000-0000-0000-0000-000000000001');

  useEffect(() => {
    async function resolveStore() {
      if (branchId) {
        const { data } = await supabase
          .from('branches')
          .select('organization_id')
          .eq('id', branchId)
          .single();
        if (data?.organization_id) {
          setResolvedOrgId(data.organization_id);
          return;
        }
      }
      if (orgParam) {
        setResolvedOrgId(orgParam);
      }
    }
    resolveStore();
  }, [branchId, orgParam]);

  return <CashierDashboard organizationId={resolvedOrgId} />;
}

export default function PosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold">Cargando Caja...</div>}>
      <PosContent />
    </Suspense>
  );
}
