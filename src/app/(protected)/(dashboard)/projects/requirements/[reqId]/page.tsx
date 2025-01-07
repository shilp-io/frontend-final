'use client';

import { useParams } from 'next/navigation';
import { useRequirement } from '@/hooks/db/useRequirement';
import { RequirementView } from '@/components/private';

export default function RequirementPage() {
  const params = useParams();
  const reqId = params.reqId as string;
  const { requirement, isLoading, error } = useRequirement(reqId);

  return (
    <RequirementView
      requirement={requirement ?? null}
      isLoading={isLoading}
      error={error}
    />
  );
}
