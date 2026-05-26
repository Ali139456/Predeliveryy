path = r"D:/Work/Pre Delivery App/app/admin/page.tsx"
text = open(path, encoding="utf-8").read()
old = """      <motion.div className="flex items-center">
        <motion.div className="w-12 h-12 rounded-xl bg-[#0033FF] flex items-center justify-center mr-4 shadow-lg shadow-[#0033FF]/50">
          <Users className="w-6 h-6 text-white" />
        </motion.div>
        <motion.div>
          <h2 className="text-2xl font-bold text-black">
            {userRole === 'admin' ? 'Organisation & users' : 'Users'}
          </h2>
          {userRole === 'admin' && (
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Manage organisations in the table below, then add users to each organisation.
            </p>
          )}
        </motion.div>
      </motion.div>"""
old = old.replace("motion.div", "div")
new = """      <AdminPageHeader
        icon={Users}
        title={userRole === 'admin' ? 'Organisation & users' : 'Users'}
        subtitle={
          userRole === 'admin'
            ? 'Manage organisations in the table below, then add users to each organisation.'
            : 'Manage team accounts for your organisation.'
        }
      />"""
if old not in text:
    raise SystemExit("block not found")
text = text.replace(old, new, 1)
text = text.replace('    <div className="space-y-6">', '    <div className="space-y-8">', 1)
open(path, "w", encoding="utf-8").write(text)
print("ok")
