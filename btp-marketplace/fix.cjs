const fs = require('fs');
const path = 'src/App.tsx';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

const topPart = lines.slice(0, 504).join('\n'); // Up to .from('listings')
const bottomPart = lines.slice(526).join('\n'); // From mobileView

const newMiddle = `          .from('listings')
          .select(\`
            *,
            profiles (
              company_name,
              phone,
              whatsapp,
              is_verified
            )
          \`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mappedListings = data.map((item) => ({
            id: item.id,
            sellerId: item.seller_id,
            title: item.title,
            description: item.description,
            price: Number(item.price),
            dealType: 'vente',
            category: item.category,
            equipmentType: item.equipment_type,
            subcategory: '',
            companyName: item.profiles?.company_name || 'Utilisateur Anonyme',
            wilaya: item.wilaya,
            commune: item.commune,
            phone: item.profiles?.phone || '',
            whatsapp: item.profiles?.whatsapp || '',
            coords: [item.latitude || 36.7525, item.longitude || 3.0420],
            dateAdded: new Date(item.created_at).toISOString().split('T')[0],
            images: item.images || ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'],
            isVerified: item.profiles?.is_verified || false,
            isPremium: item.is_premium || false,
            storeId: 'store-1',
            status: item.status || 'active',
            maintenanceLogUrl: item.maintenance_log_url,
            hoursOfUse: item.hours_of_use,
            isFavorite: false
          }));
          setListings(mappedListings);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchBanners();
    fetchListings();

    return () => subscription.unsubscribe();
  }, []);

  const t = useCallback((key) => {
    return translations[lang][key] || translations['fr'][key] || key;
  }, [lang]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDealType, setActiveDealType] = useState('all');
  const [activeEquipType, setActiveEquipType] = useState('all');
  const [filterWilaya, setFilterWilaya] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [activeView, setActiveView] = useState('feed');
  const [selectedStore, setSelectedStore] = useState(null);

  const [storeInventory, setStoreInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [auctions, setAuctions] = useState([]);`;

fs.writeFileSync(path, topPart + '\n' + newMiddle + '\n' + bottomPart);
console.log('Fixed successfully');
