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
    app = app.replace('</AddTenderModal>', '</AddTenderModal>' + modalsJSX);
    fs.writeFileSync('src/App.tsx', app);
}

// StoresView.tsx
let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');
stores = stores.replace(/<button\s+className="bg-orange-500/g, '<button onClick={onAddStoreClick} className="bg-orange-500');
stores = stores.replace(/<button onClick=\{\(\) => setActiveView\('store_pricing'\)\}/g, '<button onClick={onAddStoreClick}');
fs.writeFileSync('src/components/views/StoresView.tsx', stores);

// AuctionsView.tsx
let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
auctions = auctions.replace('<button className="bg-rose-500 hover:bg-rose-600', '<button onClick={onAddAuctionClick} className="bg-rose-500 hover:bg-rose-600');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);

// AddAuctionModal.tsx
let auction = fs.readFileSync('src/components/modals/AddAuctionModal.tsx', 'utf-8');
auction = auction.replace('dateAdded: ', 'createdAt: ');
fs.writeFileSync('src/components/modals/AddAuctionModal.tsx', auction);
