const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/user\?\.id/g, 'user?.id || "guest"');
app = app.replace(/seller_id:\s+user\.id/g, 'seller_id: user?.id || "guest"');
app = app.replace(/seller_id:\s+user\?\.id/g, 'seller_id: user?.id || "guest"');

// Check where to insert modals
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
      )}`;
    const lastAddTender = app.lastIndexOf('</AddTenderModal>');
    if (lastAddTender !== -1) {
        const insertPoint = app.indexOf(')}', lastAddTender) + 2;
        app = app.slice(0, insertPoint) + modalsJSX + app.slice(insertPoint);
    }
}
fs.writeFileSync('src/App.tsx', app);

let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
auctions = auctions.replace(/\{ auctions, t \}/g, '{ auctions, t, onAddAuctionClick }');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);

let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');
stores = stores.replace(/\{ stores, mobileView, setActiveView, setSelectedStore, t \}/g, '{ stores, mobileView, setActiveView, setSelectedStore, t, onAddStoreClick }');
fs.writeFileSync('src/components/views/StoresView.tsx', stores);

let addAuction = fs.readFileSync('src/components/modals/AddAuctionModal.tsx', 'utf-8');
addAuction = addAuction.replace('isVerified: user?.isPremium || false,', 'isVerified: false,');
addAuction = addAuction.replace('dateAdded:', 'createdAt:');
fs.writeFileSync('src/components/modals/AddAuctionModal.tsx', addAuction);

let addStore = fs.readFileSync('src/components/modals/AddStoreModal.tsx', 'utf-8');
// Fix missing user
if (!addStore.includes('user,')) {
   addStore = addStore.replace('onClose, onSubmit, t, lang', 'user, onClose, onSubmit, t, lang');
}
fs.writeFileSync('src/components/modals/AddStoreModal.tsx', addStore);

let addJob = fs.readFileSync('src/components/modals/AddJobModal.tsx', 'utf-8');
if (!addJob.includes('user,')) {
   addJob = addJob.replace('onClose, onSubmit, t, lang', 'user, onClose, onSubmit, t, lang');
}
fs.writeFileSync('src/components/modals/AddJobModal.tsx', addJob);

console.log("Done");
