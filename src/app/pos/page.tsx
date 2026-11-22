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
        return;
      }

      // Si el dueño abrió la caja desde su sesión activa
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (orgData?.id) {
          setResolvedOrgId(orgData.id);
          return;
        }
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
