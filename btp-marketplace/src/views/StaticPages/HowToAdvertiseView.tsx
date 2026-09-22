import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HowToAdvertiseViewProps {
  onBack: () => void;
}

export function HowToAdvertiseView({ onBack }: HowToAdvertiseViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 md:pb-0 relative text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center h-16 px-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Comment annoncer ?</h1>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 mt-4">
        
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-orange-500 text-right font-arabic mb-4" dir="rtl">كيف تعلن ؟ (Comment annoncer ?)</h2>
          <p className="text-slate-300 text-right font-arabic leading-relaxed text-base md:text-lg" dir="rtl">
            مرحباً بك! لقد صممنا هذه المساحة لتكون بوابتك السهلة والسريعة للوصول إلى المهتمين في قطاعات الأشغال العمومية، البناء، والمناجم. اتبع هذه الخطوات البسيطة لنشر إعلانك:
          </p>

          <div className="space-y-8 mt-8" dir="rtl">
            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-orange-500 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-bold font-arabic text-lg mb-2">إنشاء الحساب:</h3>
                <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                  ابدأ رحلتك بالضغط على زر "تسجيل". يمكنك إنشاء حسابك بسهولة وفي ثوانٍ معدودة، سواء كنت تسجل كـ فرد مستقل أو ممثلاً لـ شركة. بمجرد إدخال بياناتك، قم بتأكيد الحساب عبر بريدك الإلكتروني أو رقم هاتفك لتتمكن من البدء.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-orange-500 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-bold font-arabic text-lg mb-2">إدراج الإعلان:</h3>
                <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                  بعد تسجيل الدخول، انقر على زر إضافة إعلان جديد. لضمان وصول عرضك للجمهور المستهدف بدقة، تأكد من اختيار الفئة الأنسب (على سبيل المثال: بيع آليات ثقيلة، كراء معدات بناء ومناجم، أو عرض خدمات هندسية وتقنية).
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-orange-500 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-bold font-arabic text-lg mb-2">إضافة التفاصيل:</h3>
                <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                  المعلومات الدقيقة هي سر نجاح الإعلان. احرص على كتابة عنوان واضح ووصف يشمل كافة المواصفات الفنية للآليات أو الخدمات. <strong className="text-orange-400">نصيحة:</strong> لا تنس إرفاق صور واضحة وعالية الجودة، فالإعلانات المدعومة بالصور تضاعف من فرص البيع أو الكراء وتجذب انتباه العملاء بشكل أكبر.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                <span className="text-orange-500 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-white font-bold font-arabic text-lg mb-2">نشر الإعلان ومتابعته:</h3>
                <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                  راجع تفاصيل إعلانك وتأكد من صحتها ثم اضغط على "نشر". بمجرد نشر الإعلان، ستتمكن من خلال لوحة تحكم حسابك من تعديل محتواه في أي وقت لاحق، بالإضافة إلى مراقبة أداء الإعلان ومعرفة عدد المشاهدات التي يحققها باستمرار.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
