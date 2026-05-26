import re

p = r"D:/Work/Pre Delivery App/components/InspectionForm.tsx"
t = open(p, encoding="utf-8").read()

t = re.sub(r'className="\{(\w+)\}"', r"className={\1}", t)
t = re.sub(r'className="\{(\w+)\} ([^"]+)"', r"className={`\${\1} \2`}", t)
t = t.replace("className={formPanelClass} space-y-4", "className={`${formPanelClass} space-y-4`}")

# Fix step 6 panel
t = t.replace(
    "bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-[#0033FF]/30",
    "${formPanelClass}",
)
# step 4 outer
t = t.replace(
    '<motion.div className="bg-white rounded-xl p-4 md:p-6 space-y-4 border border-gray-200">',
    f'<div className={{`${{formPanelClass}} space-y-4`}}>',
)
t = t.replace(
    'className="bg-white rounded-xl p-4 md:p-6 space-y-4 border border-gray-200"',
    'className={`${formPanelClass} space-y-4`}',
)

open(p, "w", encoding="utf-8").write(t)
print("ok")
