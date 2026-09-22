const fs = require('fs');

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
    const splitPoint = app.lastIndexOf('</div>\n    </div>\n  );\n};');
    if (splitPoint !== -1) {
        app = app.slice(0, splitPoint) + modalsJSX + '\n' + app.slice(splitPoint);
    }
}
fs.writeFileSync('src/App.tsx', app);

let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
auctions = auctions.replace('setActiveView: (view: any) => void;', 'setActiveView: any;');
auctions = auctions.replace(/<button[^>]*>\s*<Plus[^>]*>\s*<span>\{t\('post_auction'\)\}/, '<button onClick={onAddAuctionClick} className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5">\n            <Plus className="h-3 w-3" />\n            <span>{t(\'post_auction\')}');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);

let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');
stores = stores.replace(/setActiveView:\s*\(view:.*?\)\s*=>\s*void;/g, 'setActiveView: any;');
fs.writeFileSync('src/components/views/StoresView.tsx', stores);

let jobs = fs.readFileSync('src/components/views/JobsView.tsx', 'utf-8');
jobs = jobs.replace(/setActiveView:\s*\(view:.*?\)\s*=>\s*void;/g, 'setActiveView: any;');
fs.writeFileSync('src/components/views/JobsView.tsx', jobs);
