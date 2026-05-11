import React from 'react';
import { motion } from 'motion/react';
import { Language, TRANSLATIONS, GAME_VARIANTS, GameMode } from '../types';
import { ArrowLeft, BookOpen, History, Info, Sparkles, Sword } from 'lucide-react';

interface RulesPageProps {
  language: Language;
  onBack: () => void;
  initialVariant?: GameMode;
}

export const RulesPage: React.FC<RulesPageProps> = ({ language, onBack, initialVariant }) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const sections = [
    {
      id: 'history',
      title: t.history,
      icon: <History />,
      content: isAr 
        ? "الخربقة هي لعبة استراتيجية تقليدية تونسية ضاربة في القدم. تعود أصولها إلى العصر الهلالي، وترتبط بقصص الجازية الهلالية وذياب. اللعبة ليست مجرد تسلية، بل هي مدرسة في التخطيط العسكري الشعبي، حيث تعني كلمة 'خربقة' في جذرها العربي القطع أو التشويش على خطط الخصم."
        : "Karbagha is Tunisia's foremost traditional strategic board game. Its roots trace back to the Hilalian era, linked to the epic tales of Al-Jaziya and Dhiab. More than just a game, it is a school of popular military strategy - its name derives from the Arabic root meaning 'to cut' or 'to disrupt' the opponent's plans."
    },
    {
      id: 'thalouthiya',
      title: t.thalouthName,
      icon: <Sword />,
      content: isAr
        ? "أبسط أفراد العائلة. تلعب على لوحة 3×3 بـ 3 قطع لكل لاعب. الهدف هو صف القطع الثلاث في خط مستقيم (أفقي، عمودي، أو قطري)."
        : "The simplest variant. Played on a 3x3 board with 3 pieces each. Goal: Align all 3 pieces in a straight line (horizontal, vertical, or diagonal)."
    },
    {
       id: 'tleisha',
       title: t.tleishaName,
       icon: <Sparkles />,
       content: isAr
         ? "خربقة دائرية من منطقة الرقاب. تبدأ بوضع قطعة في المركز، ثم نصل إلى 3 قطع لكل لاعب. الهدف: تكوين خط مستقيم يمر بقطر الدائرة."
         : "A circular variant from Al-Raqab. Starts with a piece in the center, 3 pieces per player. Goal: Form a straight line along a diameter of the circle."
    },
    {
      id: 'khamoussiya_jump',
      title: t.khamoussiyaJumpName,
      icon: <Sword />,
      content: isAr
        ? "تعتمد نظام 'القفز'. 12 قطعة لكل لاعب على لوحة 5×5. يتم أكل قطعة الخصم بالقفز فوقها لمربع فارغ. تسمح بالقفزات المتتالية (السلسلة)."
        : "Uses the 'Jump' capture system. 12 pieces each on a 5x5 board. Capture by jumping over an opponent's piece to an empty house. Multiple consecutive jumps are allowed."
    },
    {
      id: 'sabouiya_standard',
      title: t.sabouiyaName,
      icon: <BookOpen />,
      content: isAr
        ? "النمط الكلاسيكي الأكثر انتشاراً. 24 قطعة لكل لاعب على لوحة 7×7. تعتمد نظام 'الحصر' (القلع): يتم أكل قطعة الخصم إذا وقعت بين قطعتين من لونك (أفقياً أو عمودياً)."
        : "The most widespread classic pattern. 24 pieces each on a 7x7 board. Uses the 'Encirclement' (Custodian) system: Capture pieces by flanking them on both sides (left+right OR top+bottom) with your own pieces."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-tunisian-white overflow-y-auto pt-12 pb-24 px-6 select-text" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            onClick={onBack}
            className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue"
          >
            <ArrowLeft size={24} className={isAr ? 'rotate-180' : ''} />
          </motion.button>
          <h1 className="text-4xl font-serif font-black text-tunisian-dark-blue">{t.rules}</h1>
          <div className="w-12" />
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <motion.div 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="tunisian-tile p-8 bg-white border-4 border-tunisian-gold rounded-[2rem] shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-tunisian-blue/10 text-tunisian-blue rounded-xl">
                  {React.cloneElement(section.icon as React.ReactElement, { size: 28 })}
                </div>
                <h2 className="text-2xl font-serif font-black text-tunisian-red">{section.title}</h2>
              </div>
              <p className="text-xl leading-relaxed text-tunisian-dark-blue font-medium whitespace-pre-wrap">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-tunisian-dark-blue/40 font-bold italic">
          Source: Tunisia National Intangible Heritage Inventory — Card 057/5
        </div>
      </div>
    </div>
  );
};
