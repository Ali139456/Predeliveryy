import re

path = r"D:/Work/Pre Delivery App/app/admin/page.tsx"
text = open(path, encoding="utf-8").read()

text = text.replace(
    "      </PageContainer>\n    </div>\n  );\n}\n\nfunction OverviewTab",
    "      </PageContainer>\n    </AdminShell>\n  );\n}\n\nfunction OverviewTab",
    1,
)

tab_pattern = re.compile(
    r"      /\* Tabs.*?\n      <div className=\"sticky top-36.*?\n        </PageContainer>\n      </div>",
    re.DOTALL,
)
tab_repl = """      <motion.div className="sticky top-36 sm:top-32 md:top-36 lg:top-40 z-30 mb-6 sm:mb-8">
        <PageContainer className="py-0">
          <p className="sr-only">Dashboard sections. Swipe sideways on small screens to see all tabs.</p>
          <AdminTabBar
            tabs={adminTabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
          />
        </PageContainer>
      </motion.div>"""
tab_repl = tab_repl.replace("motion.div", "div")
text, n1 = tab_pattern.subn(tab_repl, text, count=1)

stats_pattern = re.compile(
    r"      \{/\* Stats Cards.*?\n      </div>\n\n      \{/\* Recent Inspections \*/\}",
    re.DOTALL,
)
stats_new = """      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AdminStatCard title="Total Inspections" value={stats?.inspections.total || 0} icon={FileText} accent="blue" />
        <AdminStatCard title="Completed" value={stats?.inspections.completed || 0} icon={CheckCircle} accent="green" />
        <AdminStatCard title="Drafts" value={stats?.inspections.draft || 0} icon={Clock} accent="amber" />
        <AdminStatCard title="Total Users" value={stats?.users.total || 0} icon={Users} accent="violet" />
      </motion.div>

      {/* Recent Inspections */""".replace("motion.div", "div")
text, n2 = stats_pattern.subn(stats_new, text, count=1)

text = text.replace(
    '<tr className="bg-[#0033FF] border-b-2 border-[#0033FF]/50">',
    '<tr className="bg-slate-50/90 border-b border-slate-200">',
)
text = text.replace(
    'className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-white',
    'className="text-left py-3.5 px-2 sm:px-4 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500',
)
text = text.replace(
    "bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-[#0033FF]/30",
    "rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm p-4 sm:p-6",
)

open(path, "w", encoding="utf-8").write(text)
print("tabs", n1, "stats", n2)
