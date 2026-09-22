import sys
import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Fix session -> user
app = app.replace('if (session) {', 'if (user) {')
app = app.replace('session.user.id', 'user.id')
app = app.replace('session?.user?.id', 'user?.id')

# Ensure JSX is added
if '{showAddJobModal && (' not in app:
    idx = app.rfind('      {showAddTenderModal && (')
    if idx != -1:
        end_idx = app.find('</AddTenderModal>', idx)
        if end_idx != -1:
            insertion_point = app.find(')}', end_idx) + 2
            modals_jsx = '''
      {showAddJobModal && (
        <AddJobModal user={user} onClose={() => setShowAddJobModal(false)} onSubmit={handlePostJob} t={t} lang={lang} />
      )}
      {showAddAuctionModal && (
        <AddAuctionModal user={user} onClose={() => setShowAddAuctionModal(false)} onSubmit={handlePostAuction} t={t} lang={lang} />
      )}
      {showAddStoreModal && (
        <AddStoreModal user={user} onClose={() => setShowAddStoreModal(false)} onSubmit={handlePostStore} t={t} lang={lang} />
      )}
'''
            app = app[:insertion_point] + modals_jsx + app[insertion_point:]

# Fix JobsView missing props
app = re.sub(r'<JobsView\s+mobileView=\{mobileView\}\s*/>', r'<JobsView mobileView={mobileView} jobs={jobs} onAddJobClick={() => { if (!user) setShowAuthModal(true); else setShowAddJobModal(true); }} />', app)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

# Fix JobsView.tsx
with open('src/components/views/JobsView.tsx', 'r', encoding='utf-8') as f:
    jobs = f.read()
if 'onAddJobClick?: () => void;' not in jobs:
    jobs = jobs.replace('interface JobsViewProps {\\n  mobileView: \\\'map\\\' | \\\'list\\\';\\n  jobs: JobOffer[];\\n}', 'interface JobsViewProps {\\n  mobileView: \\\'map\\\' | \\\'list\\\';\\n  jobs: JobOffer[];\\n  onAddJobClick?: () => void;\\n}')
if '({ mobileView, jobs })' in jobs:
    jobs = jobs.replace('({ mobileView, jobs })', '({ mobileView, jobs, onAddJobClick })')
if '<button className=\"bg-orange-500' in jobs:
    jobs = jobs.replace('<button className=\"bg-orange-500', '<button onClick={onAddJobClick} className=\"bg-orange-500')
with open('src/components/views/JobsView.tsx', 'w', encoding='utf-8') as f:
    f.write(jobs)

# Fix StoresView.tsx
with open('src/components/views/StoresView.tsx', 'r', encoding='utf-8') as f:
    stores = f.read()
stores = stores.replace('<button onClick={() => setActiveView(\'store_pricing\')}', '<button onClick={onAddStoreClick}')
with open('src/components/views/StoresView.tsx', 'w', encoding='utf-8') as f:
    f.write(stores)

# Fix AuctionsView.tsx
with open('src/components/views/AuctionsView.tsx', 'r', encoding='utf-8') as f:
    auctions = f.read()
if '({ auctions, t })' in auctions:
    auctions = auctions.replace('({ auctions, t })', '({ auctions, t, onAddAuctionClick })')
with open('src/components/views/AuctionsView.tsx', 'w', encoding='utf-8') as f:
    f.write(auctions)
