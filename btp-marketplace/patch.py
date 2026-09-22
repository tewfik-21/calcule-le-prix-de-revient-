import sys
import re

# App.tsx updates
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace('<JobsView mobileView={mobileView} jobs={jobs} />', '<JobsView mobileView={mobileView} jobs={jobs} onAddJobClick={() => { if (!user) setShowAuthModal(true); else setShowAddJobModal(true); }} />')
app = app.replace('<StoresView stores={stores} mobileView={mobileView} setActiveView={setActiveView} setSelectedStore={setSelectedStore} t={t} />', '<StoresView stores={stores} mobileView={mobileView} setActiveView={setActiveView} setSelectedStore={setSelectedStore} t={t} onAddStoreClick={() => { if (!user) setShowAuthModal(true); else if (!user.isPremium) setShowPremiumModal(true); else setShowAddStoreModal(true); }} />')
app = app.replace('<AuctionsView auctions={auctions} t={t} />', '<AuctionsView auctions={auctions} t={t} onAddAuctionClick={() => { if (!user) setShowAuthModal(true); else setShowAddAuctionModal(true); }} />')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

# JobsView.tsx updates
with open('src/components/views/JobsView.tsx', 'r', encoding='utf-8') as f:
    jobs = f.read()
jobs = jobs.replace('interface JobsViewProps {\n  mobileView: \'map\' | \'list\';\n  jobs: JobOffer[];\n}', 'interface JobsViewProps {\n  mobileView: \'map\' | \'list\';\n  jobs: JobOffer[];\n  onAddJobClick?: () => void;\n}')
jobs = jobs.replace('export const JobsView: React.FC<JobsViewProps> = ({ mobileView, jobs }) => {', 'export const JobsView: React.FC<JobsViewProps> = ({ mobileView, jobs, onAddJobClick }) => {')
jobs = jobs.replace('<button className=\"bg-orange-500 hover:bg-orange-600', '<button onClick={onAddJobClick} className=\"bg-orange-500 hover:bg-orange-600')
with open('src/components/views/JobsView.tsx', 'w', encoding='utf-8') as f:
    f.write(jobs)

# StoresView.tsx updates
with open('src/components/views/StoresView.tsx', 'r', encoding='utf-8') as f:
    stores = f.read()
stores = stores.replace('t: any;\n}', 't: any;\n  onAddStoreClick?: () => void;\n}')
stores = stores.replace('({ stores, mobileView, setActiveView, setSelectedStore, t }) => {', '({ stores, mobileView, setActiveView, setSelectedStore, t, onAddStoreClick }) => {')
stores = stores.replace('<button\n          className=\"bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20\"\n        >', '<button onClick={onAddStoreClick} className=\"bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20\">')
stores = stores.replace('<button onClick={() => setActiveView(\'store_pricing\')}', '<button onClick={onAddStoreClick}')
with open('src/components/views/StoresView.tsx', 'w', encoding='utf-8') as f:
    f.write(stores)

# AuctionsView.tsx updates
with open('src/components/views/AuctionsView.tsx', 'r', encoding='utf-8') as f:
    auctions = f.read()
auctions = auctions.replace('t: any;\n}', 't: any;\n  onAddAuctionClick?: () => void;\n}')
auctions = auctions.replace('({ auctions, t }) => {', '({ auctions, t, onAddAuctionClick }) => {')
auctions = auctions.replace('Mazaad BTP <span className=\"text-rose-400\">(Enchères)</span>\n          </h2>\n          <p className=\"text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1\">\n            Matériel d\'occasion et liquidations\n          </p>\n        </div>\n      </div>', 'Mazaad BTP <span className=\"text-rose-400\">(Enchères)</span>\n          </h2>\n          <p className=\"text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1\">\n            Matériel d\'occasion et liquidations\n          </p>\n        </div>\n        <button onClick={onAddAuctionClick} className=\"bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20\">\n          + Publier\n        </button>\n      </div>')
with open('src/components/views/AuctionsView.tsx', 'w', encoding='utf-8') as f:
    f.write(auctions)
