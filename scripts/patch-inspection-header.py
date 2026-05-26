from pathlib import Path

p = Path(__file__).resolve().parents[1] / "app/inspections/[id]/page.tsx"
text = p.read_text(encoding="utf-8")
marker_start = '          <motion.div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">'
marker_start = '          <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">'
start = text.index(marker_start)
end = text.index("          {showReport ? (", start)

new = r'''          <div
            className={`no-print mb-5 sm:mb-6 ${showReport ? 'px-4 pt-4 sm:px-5 sm:pt-5' : ''}`}
          >
            {(() => {
              const isOwner =
                user &&
                inspection &&
                String(user.email || '').toLowerCase() ===
                  String(inspection.inspectorEmail || '').toLowerCase();
              const readOnly = !user
                ? false
                : isReadOnlyView || (!isOwner && user.role !== 'admin');
              const statusLabel = inspection.status === 'completed' ? 'Completed' : 'Draft';

              return (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100/80">
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0033FF] via-[#3366FF] to-[#FF6600]"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 pl-5 sm:pl-6">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center shadow-md shadow-[#0033FF]/25 shrink-0 ring-2 ring-[#0033FF]/10">
                        {showReport ? (
                          <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
                        ) : (
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0033FF]">
                            {showReport ? 'Pre-delivery report' : 'Inspection workspace'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
                                : 'bg-slate-100 text-slate-600 ring-slate-200/80'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                          {showReport
                            ? 'Inspection Report'
                            : `Inspection ${inspection.inspectionNumber}`}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
                            {inspection.inspectionNumber}
                          </span>
                          {inspection.inspectorName ? (
                            <>
                              <span className="text-slate-300 hidden sm:inline" aria-hidden>
                                ·
                              </span>
                              <span className="truncate max-w-[14rem] sm:max-w-none">
                                {inspection.inspectorName}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
                      {readOnly ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 shadow-sm">
                          <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          View only
                        </span>
                      ) : user?.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0033FF]/10 text-[#0033FF] ring-1 ring-[#0033FF]/20 shadow-sm">
                          <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          Edit mode
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
'''

new = new.replace("motion.div", "motion.div")  # no-op placeholder
new = new.replace('<motion.div\n                    className="absolute', '<div\n                    className="absolute')
p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("patched", start, end)
