'use client';

import { MapProvider } from '@/contexts/map-context';
import { FullMap } from '@/components/map/full-map';
import { MapControls } from '@/components/map/map-controls';
import { FieldSidePanel } from '@/components/map/field-side-panel';
import { useAuth } from '@/contexts/auth-context';

export default function MapLayout({ children }: { children: React.ReactNode }) {
  const { johnDeereConnection } = useAuth();

  // Don't render map infrastructure until we have an org selected
  if (!johnDeereConnection?.selected_org_id) {
    return (
      <div className="h-[calc(100vh-48px)] bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Connect and select an organization to view your fields.</p>
      </div>
    );
  }

  return (
    <MapProvider>
      <div className="h-[calc(100vh-48px)] relative overflow-hidden">
        <FullMap />
        <MapControls />
        <FieldSidePanel />
        {children}
      </div>
    </MapProvider>
  );
}
