const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf-8');
const modalsJSX = `
      {showAddJobModal && (
        <AddJobModal user={user} onClose={() => setShowAddJobModal(false)} onSubmit={handlePostJob} t={t} lang={lang} />
      )}
      {showAddAuctionModal && (
        <AddAuctionModal user={user} onClose={() => setShowAddAuctionModal(false)} onSubmit={handlePostAuction} t={t} lang={lang} />
      )}
      {showAddStoreModal && (
        <AddStoreModal user={user} onClose={() => setShowAddStoreModal(false)} onSubmit={handlePostStore} t={t} lang={lang} />
      )}`;
if (!app.includes('<AddJobModal')) {
    const target = '</AddTenderModal>\n      )';
    app = app.replace(target, target + modalsJSX);
    fs.writeFileSync('src/App.tsx', app);
}

// StoresView.tsx
let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');
stores = stores.replace(/setActiveView, setSelectedStore, t\s*\}/g, 'setActiveView, setSelectedStore, t, onAddStoreClick }');
fs.writeFileSync('src/components/views/StoresView.tsx', stores);

// AuctionsView.tsx
let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
auctions = auctions.replace('<button className="bg-rose-500 hover:bg-rose-600', '<button onClick={onAddAuctionClick} className="bg-rose-500 hover:bg-rose-600');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);

// AddAuctionModal.tsx
let auction = fs.readFileSync('src/components/modals/AddAuctionModal.tsx', 'utf-8');
auction = auction.replace('createdAt: ', 'dateAdded: /* createdAt: */ ');
auction = auction.replace(/user,/g, '/* user, */');
fs.writeFileSync('src/components/modals/AddAuctionModal.tsx', auction);

// AddJobModal.tsx & AddStoreModal.tsx
let job = fs.readFileSync('src/components/modals/AddJobModal.tsx', 'utf-8');
job = job.replace(/user,/g, '/* user, */');
fs.writeFileSync('src/components/modals/AddJobModal.tsx', job);

let store = fs.readFileSync('src/components/modals/AddStoreModal.tsx', 'utf-8');
store = store.replace(/user,/g, '/* user, */');
fs.writeFileSync('src/components/modals/AddStoreModal.tsx', store);
