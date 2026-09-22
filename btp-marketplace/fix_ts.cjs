const fs = require('fs');

// 1. Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix 'user' is possibly 'null'
app = app.replace(/user\.id/g, 'user?.id');
app = app.replace(/user\.adsPostedCount/g, 'user?.adsPostedCount');
app = app.replace(/user\.isPremium/g, 'user?.isPremium');

// Ensure modals JSX is in App.tsx
if (!app.includes('<AddJobModal')) {
    const modalsJSX = `
      {showAddJobModal && (
        <AddJobModal user={user} onClose={() => setShowAddJobModal(false)} onSubmit={handlePostJob} t={t} lang={lang} />
      )}
      {showAddAuctionModal && (
        <AddAuctionModal user={user} onClose={() => setShowAddAuctionModal(false)} onSubmit={handlePostAuction} t={t} lang={lang} />
      )}
      {showAddStoreModal && (
        <AddStoreModal user={user} onClose={() => setShowAddStoreModal(false)} onSubmit={handlePostStore} t={t} lang={lang} />
      )}
`;
    // Insert before closing main div or after AddTenderModal
    const insertPoint = app.lastIndexOf('</AddTenderModal>');
    if (insertPoint !== -1) {
        const insertionIndex = app.indexOf(')}', insertPoint) + 2;
        app = app.slice(0, insertionIndex) + modalsJSX + app.slice(insertionIndex);
    }
}

// Fix <JobsView> props
app = app.replace(/<JobsView\s+mobileView={mobileView}\s+jobs={jobs}\s*\/>/g, '<JobsView mobileView={mobileView} jobs={jobs} onAddJobClick={() => { if (!user) setShowAuthModal(true); else setShowAddJobModal(true); }} />');
app = app.replace(/<JobsView\s+mobileView={mobileView}\s*\/>/g, '<JobsView mobileView={mobileView} jobs={jobs} onAddJobClick={() => { if (!user) setShowAuthModal(true); else setShowAddJobModal(true); }} />');

fs.writeFileSync('src/App.tsx', app);


// 2. Fix JobsView.tsx
let jobs = fs.readFileSync('src/components/views/JobsView.tsx', 'utf-8');
if (!jobs.includes('onAddJobClick?: () => void;')) {
    jobs = jobs.replace('jobs: JobOffer[];', 'jobs: JobOffer[];\n  onAddJobClick?: () => void;');
}
jobs = jobs.replace(/\{ mobileView, jobs \}/g, '{ mobileView, jobs, onAddJobClick }');
jobs = jobs.replace('<button className="bg-orange-500 hover:bg-orange-600', '<button onClick={onAddJobClick} className="bg-orange-500 hover:bg-orange-600');
fs.writeFileSync('src/components/views/JobsView.tsx', jobs);


// 3. Fix StoresView.tsx
let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');
if (!stores.includes('onAddStoreClick?: () => void;')) {
    stores = stores.replace('t: any;\n}', 't: any;\n  onAddStoreClick?: () => void;\n}');
}
stores = stores.replace(/\{ stores, mobileView, setActiveView, setSelectedStore, t \}/g, '{ stores, mobileView, setActiveView, setSelectedStore, t, onAddStoreClick }');
stores = stores.replace(/<button\s*onClick=\{\(\) => setActiveView\('store_pricing'\)\}/g, '<button onClick={onAddStoreClick}');
fs.writeFileSync('src/components/views/StoresView.tsx', stores);


// 4. Fix AuctionsView.tsx
let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
if (!auctions.includes('onAddAuctionClick?: () => void;')) {
    auctions = auctions.replace('t: any;\n}', 't: any;\n  onAddAuctionClick?: () => void;\n}');
}
auctions = auctions.replace(/\{ auctions, t \}/g, '{ auctions, t, onAddAuctionClick }');
auctions = auctions.replace('<button className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20">', '<button onClick={onAddAuctionClick} className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20">');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);


// 5. Fix AddJobModal.tsx
let addJob = fs.readFileSync('src/components/modals/AddJobModal.tsx', 'utf-8');
addJob = addJob.replace('const [type, setType] = useState<\'demand\' | \'offer\'>(\'offer\');', 'const [type, setType] = useState<any>(\'offer\');');
addJob = addJob.replace(/user,\s*/, '');
fs.writeFileSync('src/components/modals/AddJobModal.tsx', addJob);

// 6. Fix AddAuctionModal.tsx
let addAuction = fs.readFileSync('src/components/modals/AddAuctionModal.tsx', 'utf-8');
addAuction = addAuction.replace('createdAt: new Date().toISOString()', 'dateAdded: new Date().toISOString()');
addAuction = addAuction.replace('category: category,', 'category: category as any,');
addAuction = addAuction.replace(/user,\s*/, '');
fs.writeFileSync('src/components/modals/AddAuctionModal.tsx', addAuction);

// 7. Fix AddStoreModal.tsx
let addStore = fs.readFileSync('src/components/modals/AddStoreModal.tsx', 'utf-8');
addStore = addStore.replace('categories: selectedCats,', 'categories: selectedCats as any,');
addStore = addStore.replace(/user,\s*/, '');
fs.writeFileSync('src/components/modals/AddStoreModal.tsx', addStore);

console.log('Fix script completed.');
