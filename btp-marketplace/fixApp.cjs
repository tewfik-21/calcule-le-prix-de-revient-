const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

const brokenIndex = lines.findIndex(l => l.includes('initPushNotifications(session.user.id);') && !lines[lines.indexOf(l)+1].includes('} else if'));

const codeToInsert = `      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // 1.5 Fetch Banners
    const fetchBanners = async () => {
      try {
        const { data: bannersData, error: bannersError } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!bannersError && bannersData) {
          const mappedBanners = bannersData.map((b) => ({
            id: b.id,
            sponsorName: b.sponsor_name,
            imageUrl: b.image_url,
            linkUrl: b.link_url || '#',
            position: b.position
          }));
          setBanners(mappedBanners);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    // 2. Fetch Listings
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const { data, error } = await supabase
          .from('listings')`;

const selectIndex = lines.findIndex(l => l.trim() === '.select(`');

lines.splice(brokenIndex + 1, selectIndex - brokenIndex - 1, ...codeToInsert.split('\n'));

fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf-8');
