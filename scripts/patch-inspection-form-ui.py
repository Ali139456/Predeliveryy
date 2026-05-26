path = r"D:/Work/Pre Delivery App/components/InspectionForm.tsx"
text = open(path, encoding="utf-8").read()

replacements = [
    (
        "bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30 min-w-0",
        f"{'{formPanelClass}'} space-y-4",
    ),
    (
        "bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 min-w-0 max-w-full",
        f"{{formPanelClass}} max-w-full",
    ),
    (
        "`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? '' : 'mb-4'}`",
        "`${formPanelClass} ${readOnly ? '' : 'mb-4'}`",
    ),
    (
        "`bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30 ${readOnly ? 'mt-6' : ''}`",
        "`${formPanelClass} space-y-4 ${readOnly ? 'mt-6' : ''}`",
    ),
    (
        "`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? '' : 'mb-4'}`",
        "`${formPanelClass} ${readOnly ? '' : 'mb-4'}`",
    ),
    (
        "`bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-[#0033FF]/30 ${readOnly ? 'mt-6' : ''}`",
        "`${formPanelClass} ${readOnly ? 'mt-6' : ''}`",
    ),
    (
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4 px-1 mb-4 border-b-2 border-[#0033FF]/30 min-w-0",
        "{formStepHeaderClass}",
    ),
    (
        "w-12 h-12 rounded-xl bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-3 sm:mr-4 shadow-lg shadow-[#0033FF]/50 flex-shrink-0 ring-2 ring-[#0033FF]/30",
        "{formStepBadgeClass}",
    ),
    (
        "text-lg sm:text-xl font-bold text-black min-w-0 pr-2 break-words",
        "{formStepTitleClass}",
    ),
    (
        "flex items-center justify-center px-4 py-2 bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0 w-fit self-start sm:self-auto",
        "{formSaveBtnClass}",
    ),
    (
        "flex items-center justify-center px-3 py-2 text-sm bg-[#0033FF] text-white rounded-lg hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0 w-fit self-start sm:self-auto",
        "{formSaveBtnClass} text-sm",
    ),
    (
        "sticky top-0 z-30 -mx-0.5 px-2 py-2.5 mb-1 bg-slate-900/95 backdrop-blur-sm border border-slate-600/60 rounded-xl shadow-lg",
        "{formProgressShellClass}",
    ),
    (
        "className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black placeholder-gray-400 ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}",
        "className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}",
    ),
    (
        "className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0033FF] focus:border-[#0033FF] focus:bg-white transition-all bg-white text-black ${readOnly ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-white focus:hover:bg-white'}`}",
        "className={`${formFieldClass} ${readOnly ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}",
    ),
    (
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t-2 border-slate-700/50 overflow-hidden",
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200 overflow-hidden",
    ),
    (
        "className={`flex items-center justify-center px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-md w-full sm:w-auto ${\n              currentStep === 1\n                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'\n                : 'bg-gray-700 text-white hover:bg-gray-800'\n            }`}",
        "className={`flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold transition-all w-full sm:w-auto ${currentStep === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'}`}",
    ),
    (
        "className=\"flex items-center justify-center px-4 py-2 text-sm bg-[#0033FF] text-white rounded-lg font-semibold hover:bg-[#0033FF]/90 transition-all shadow-lg shadow-[#0033FF]/50 w-full sm:w-auto\"",
        "className=\"flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-md shadow-[#0033FF]/20 hover:brightness-105 transition-all w-full sm:w-auto\"",
    ),
    (
        "className=\"flex items-center justify-center px-4 py-2 text-sm bg-[#0033FF] text-white rounded-lg font-bold shadow-lg shadow-[#0033FF]/50 hover:bg-[#0033FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto\"",
        "className=\"flex items-center justify-center px-4 py-2 text-sm rounded-xl font-bold bg-gradient-to-r from-[#0033FF] to-[#0029CC] text-white shadow-lg shadow-[#0033FF]/25 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto\"",
    ),
]

for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
    else:
        print("miss:", old[:60])

# Progress bar inner text colors
text = text.replace("text-[11px] sm:text-xs text-slate-200", "text-[11px] sm:text-xs text-slate-600")
text = text.replace("font-semibold text-white", "font-semibold text-slate-900")
text = text.replace("text-slate-400 font-normal", "text-slate-500 font-normal")
text = text.replace("text-[#9ec5ff]", "text-[#0033FF]")
text = text.replace("mt-2 h-2 w-full rounded-full bg-slate-700 overflow-hidden", "mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden")
text = text.replace(
    "currentStep === s.number\n                      ? 'bg-[#0033FF] text-white border-[#0033FF]'\n                      : 'bg-slate-800/80 text-slate-400 border-slate-600/50'",
    "currentStep === s.number\n                      ? 'bg-[#0033FF] text-white border-[#0033FF] shadow-sm'\n                      : 'bg-slate-100 text-slate-600 border-slate-200'",
)

# Wrap form in app-surface
text = text.replace(
    '<form onSubmit={(e) => { e.preventDefault(); }} className="w-full max-w-7xl mx-auto space-y-4 px-3 sm:px-4 min-w-0 max-w-full">',
    '<form onSubmit={(e) => { e.preventDefault(); }} className="app-surface w-full max-w-7xl mx-auto space-y-4 px-3 sm:px-4 min-w-0 max-w-full pb-8">',
)

open(path, "w", encoding="utf-8").write(text)
print("done")
