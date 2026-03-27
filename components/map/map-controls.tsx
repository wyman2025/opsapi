'use client';

import { useMemo } from 'react';
import { useMapContext } from '@/contexts/map-context';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RefreshCw, MapPin, X } from 'lucide-react';

export function MapControls() {
  const {
    fields,
    filteredFields,
    fieldsLoading,
    fieldsError,
    importFields,
    isImporting,
    syncOperations,
    isSyncingOps,
    selectedClient,
    setSelectedClient,
    selectedFarm,
    setSelectedFarm,
  } = useMapContext();

  const hasFields = fields.length > 0;
  const withBoundaries = filteredFields.filter(f => f.boundary_geojson).length;
  const withoutBoundaries = filteredFields.length - withBoundaries;

  const clients = useMemo(() => {
    const set = new Set<string>();
    fields.forEach(f => { if (f.client_name) set.add(f.client_name); });
    return Array.from(set).sort();
  }, [fields]);

  const farms = useMemo(() => {
    let source = fields;
    if (selectedClient) source = source.filter(f => f.client_name === selectedClient);
    const set = new Set<string>();
    source.forEach(f => { if (f.farm_name) set.add(f.farm_name); });
    return Array.from(set).sort();
  }, [fields, selectedClient]);

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5 max-w-[280px]">
      {/* Main control panel */}
      <div className="glass rounded-xl p-3 space-y-3">
        {/* Import button */}
        <button
          onClick={importFields}
          disabled={isImporting || fieldsLoading}
          className="w-full flex items-center gap-2.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-400 transition-colors disabled:opacity-50"
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          ) : (
            <Download className="w-4 h-4 flex-shrink-0" />
          )}
          {isImporting ? 'Importing...' : hasFields ? 'Re-import Fields' : 'Import Fields'}
        </button>

        {/* Sync operations */}
        {hasFields && (
          <button
            onClick={syncOperations}
            disabled={isSyncingOps}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-sm text-slate-300 transition-colors disabled:opacity-50"
          >
            {isSyncingOps ? (
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
            )}
            {isSyncingOps ? 'Syncing...' : 'Sync Operations'}
          </button>
        )}

        {/* Field count */}
        {hasFields && (
          <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              <span className="font-mono-data text-slate-300">{filteredFields.length}</span> field{filteredFields.length !== 1 ? 's' : ''}
              {withoutBoundaries > 0 && (
                <span className="text-slate-500"> · {withoutBoundaries} no boundary</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Filter chips */}
      {hasFields && (clients.length > 0 || farms.length > 0) && (
        <div className="glass rounded-xl p-3 space-y-2">
          {/* Clients */}
          {clients.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium px-0.5">Client</p>
              <div className="flex flex-wrap gap-1">
                {clients.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedClient(selectedClient === c ? null : c);
                      setSelectedFarm(null);
                    }}
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all
                      ${selectedClient === c
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    {c}
                    {selectedClient === c && <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Farms */}
          {farms.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium px-0.5">Farm</p>
              <div className="flex flex-wrap gap-1">
                {farms.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFarm(selectedFarm === f ? null : f)}
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all
                      ${selectedFarm === f
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                      }
                    `}
                  >
                    {f}
                    {selectedFarm === f && <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {fieldsError && (
        <div className="glass rounded-xl p-3 border-red-500/20 bg-red-500/10">
          <p className="text-xs text-red-400">{fieldsError}</p>
        </div>
      )}
    </div>
  );
}
