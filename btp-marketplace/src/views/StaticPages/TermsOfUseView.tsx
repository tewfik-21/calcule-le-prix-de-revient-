import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TermsOfUseViewProps {
  onBack: () => void;
}

export function TermsOfUseView({ onBack }: TermsOfUseViewProps) {
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
          <h1 className="text-lg font-bold text-white">Conditions d'utilisation</h1>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 mt-4">
        
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-orange-500 text-right font-arabic" dir="rtl">شروط الاستخدام (Conditions d'utilisation)</h2>
          <p className="text-slate-300 text-right font-arabic leading-relaxed text-sm md:text-base" dir="rtl">
            هذا القسم يمثل الإطار القانوني والتنظيمي بين المنصة والمستخدمين:
          </p>

          <div className="space-y-6 mt-6" dir="rtl">
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2.5 rounded-full bg-orange-500 shrink-0"></div>
              <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                <strong className="text-white">دور المنصة:</strong> وضح أن التطبيق يعمل كوسيط رقمي يسهل التواصل بين المهنيين في قطاعات الأشغال العمومية والمناجم، ولا يتدخل بشكل مباشر في إبرام الصفقات.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2.5 rounded-full bg-orange-500 shrink-0"></div>
              <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                <strong className="text-white">التزامات المستخدم:</strong> ألزم المستخدمين بتقديم معلومات صحيحة حول هوياتهم والمعدات المعروضة، ومنع نشر أي محتوى مضلل أو غير قانوني.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2.5 rounded-full bg-orange-500 shrink-0"></div>
              <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                <strong className="text-white">حدود المسؤولية (Disclaimer):</strong> تعمل المنصة كوسيط تقني بحت يهدف إلى تسهيل التواصل وعرض الإعلانات، ولا تتحمل أي مسؤولية قانونية، مالية، أو تعاقدية عن أي نزاعات تجارية قد تنشأ بين الأطراف (البائع والمشتري، أو المؤجر والمستأجر). كما تُخلي إدارة المنصة مسؤوليتها التامة عن أي عيوب خفية، أعطال تقنية، أو عدم مطابقة للمواصفات في الآلات الثقيلة، معدات المناجم، أو مستلزمات الأشغال العمومية المعروضة. تقع مسؤولية المعاينة، الفحص التقني للمعدات، والتأكد من سلامة المعاملات المالية بالكامل على عاتق المستخدمين المعنيين.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 mt-2.5 rounded-full bg-orange-500 shrink-0"></div>
              <p className="text-slate-300 font-arabic text-sm md:text-base leading-relaxed">
                <strong className="text-white">الملكية الفكرية:</strong> جميع الحقوق المتعلقة بالهوية البصرية، تصميم واجهات التطبيق والموقع الإلكتروني، الأكواد البرمجية، الشعارات، وقواعد البيانات المدرجة هي ملكية فكرية حصرية للمنصة ومحمية بموجب القوانين المعمول بها. يُمنع منعاً باتاً استنساخ، تعديل، استخراج البيانات، أو استغلال أي محتوى أو جزء من هيكل المنصة لأي غرض تجاري أو غير تجاري دون الحصول على موافقة كتابية صريحة ومسبقة من الإدارة.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
