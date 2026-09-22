import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

target = """  const handlePostJob = async (newJob: JobOffer) => {
    try {
      const { data, error } = await supabase.from('job_offers').insert({"""

replacement = """  const handlePostJob = async (newJob: JobOffer) => {
    try {
      if (newJob.type === 'offer') {
        const userOffers = jobs.filter(j => j.authorId === user?.id && j.type === 'offer').length;
        const maxOffers = user?.isPremium ? 5 : 1;
        if (userOffers >= maxOffers) {
           alert(lang === 'ar' ? `لقد وصلت للحد الأقصى (${maxOffers} عروض عمل).` : `Vous avez atteint la limite de ${maxOffers} offres d'emploi.`);
           if (!user?.isPremium) setShowPremiumModal(true);
           return;
        }
      } else {
        const userRequests = jobs.filter(j => j.authorId === user?.id && j.type === 'request').length;
        if (userRequests >= 1) {
           alert(lang === 'ar' ? 'لقد قمت بنشر طلب عمل مسبقاً.' : 'Vous avez déjà publié une demande d\\'emploi.');
           return;
        }
      }
      
      const { data, error } = await supabase.from('job_offers').insert({"""

app = app.replace(target, replacement)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("handlePostJob updated.")
