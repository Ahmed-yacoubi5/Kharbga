import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Language, TRANSLATIONS } from '../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Landmark, 
  Award, 
  Users, 
  Code, 
  Lightbulb, 
  Palette, 
  Music, 
  Mail, 
  MessageCircle, 
  Copy, 
  Check,
  HeartHandshake
} from 'lucide-react';

interface CreditsPageProps {
  language: Language;
  onBack: () => void;
}

export const CreditsPage: React.FC<CreditsPageProps> = ({ language, onBack }) => {
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [copiedField, setCopiedField] = useState<'email' | 'whatsapp' | null>(null);

  const handleCopy = (text: string, field: 'email' | 'whatsapp') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div 
      className="min-h-screen w-full bg-tunisian-white overflow-y-auto pt-10 pb-28 px-4 sm:px-6 select-text" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header navigation bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 rounded-2xl bg-tunisian-sandy text-tunisian-dark-blue shadow-md hover:bg-tunisian-gold hover:text-white transition-all flex items-center gap-2 font-bold"
            aria-label="Back to home"
          >
            <ArrowLeft size={22} className={isAr ? 'rotate-180' : ''} />
            <span className="hidden sm:inline text-sm">{t.back}</span>
          </motion.button>

          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-tunisian-dark-blue flex items-center justify-center gap-3">
              <ShieldCheck className="text-tunisian-red shrink-0" size={32} />
              <span>{t.creditsAndCopyright}</span>
            </h1>
            <p className="text-xs sm:text-sm text-tunisian-dark-blue/60 font-medium mt-1">
              {isAr 
                ? "التراث التونسي الأصيل • فريق العمل • حقوق الملكية الفكرية" 
                : isFr 
                ? "Patrimoine Tunisien • Équipe & Crédits • Droits d'auteur"
                : "Tunisian Heritage • Development Team • Copyright & Notice"}
            </p>
          </div>

          <div className="w-12 sm:w-16" />
        </div>

        <div className="space-y-7">
          {/* 1. About the game */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="tunisian-tile rules-card p-6 sm:p-8 bg-white border-3 border-tunisian-gold rounded-3xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-tunisian-blue/10 text-tunisian-blue rounded-2xl">
                <Landmark size={26} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tunisian-gold">Heritage & Origins</span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-tunisian-red">
                  {t.aboutGame}
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-tunisian-dark-blue font-medium whitespace-pre-line">
              {isAr ? (
                <>
                  الخربڨة هي لعبة استراتيجية تقليدية تونسية. تاريخها واسمها وقواعدها ملك للتراث الثقافي المشترك لتونس وللمجتمعات التي مارستها وحافظت عليها عبر الأجيال، ولا يملكها أي فرد.
                  <span className="block mt-3 text-sm text-tunisian-dark-blue/75 italic border-t border-tunisian-gold/20 pt-3" dir="ltr">
                    "Kharbga is a traditional Tunisian strategy game. Its history, name and rules belong to Tunisia's shared cultural heritage and to the communities that have played and preserved it for generations. They are not owned by any individual."
                  </span>
                </>
              ) : isFr ? (
                <>
                  La Kharbga est un jeu de stratégie traditionnel tunisien. Son histoire, son nom et ses règles appartiennent au patrimoine culturel partagé de la Tunisie et aux communautés qui l'ont pratiqué et préservé depuis des générations. Ils ne sont la propriété d'aucun individu.
                  <span className="block mt-3 text-sm text-tunisian-dark-blue/75 italic border-t border-tunisian-gold/20 pt-3" dir="ltr">
                    "Kharbga is a traditional Tunisian strategy game. Its history, name and rules belong to Tunisia's shared cultural heritage and to the communities that have played and preserved it for generations. They are not owned by any individual."
                  </span>
                </>
              ) : (
                "Kharbga is a traditional Tunisian strategy game. Its history, name and rules belong to Tunisia's shared cultural heritage and to the communities that have played and preserved it for generations. They are not owned by any individual."
              )}
            </p>
          </motion.div>

          {/* 2. Sources and acknowledgements */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="tunisian-tile rules-card p-6 sm:p-8 bg-white border-3 border-tunisian-gold rounded-3xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-700 rounded-2xl">
                <HeartHandshake size={26} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tunisian-gold">Documentation & Preservation</span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-tunisian-red">
                  {t.sourcesAndAck}
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-tunisian-dark-blue font-medium whitespace-pre-line">
              {isAr ? (
                <>
                  تعتمد هذه النسخة الرقمية على وثائق وأبحاث الجمعية التونسية للمحافظة على ألعاب ورياضات التراث، التي جعل عملها في صون الألعاب التقليدية هذا الإنجاز ممكناً. خالص الشكر للاعبين وحملة التراث الذين يحافظون على استمرار هذه اللعبة ونبضها.
                  <span className="block mt-3 text-sm text-tunisian-dark-blue/75 italic border-t border-tunisian-gold/20 pt-3" dir="ltr">
                    "This digital version is based on documentation from the Association Tunisienne de Sauvegarde des Jeux et Sports du Patrimoine, whose work in preserving traditional games made it possible. Thanks to the players and tradition-bearers who keep the game alive."
                  </span>
                </>
              ) : isFr ? (
                <>
                  Cette version numérique est basée sur la documentation de l'Association Tunisienne de Sauvegarde des Jeux et Sports du Patrimoine, dont le travail de préservation des jeux traditionnels a rendu cela possible. Merci aux joueurs et aux gardiens des traditions qui font vivre ce jeu.
                  <span className="block mt-3 text-sm text-tunisian-dark-blue/75 italic border-t border-tunisian-gold/20 pt-3" dir="ltr">
                    "This digital version is based on documentation from the Association Tunisienne de Sauvegarde des Jeux et Sports du Patrimoine, whose work in preserving traditional games made it possible. Thanks to the players and tradition-bearers who keep the game alive."
                  </span>
                </>
              ) : (
                "This digital version is based on documentation from the Association Tunisienne de Sauvegarde des Jeux et Sports du Patrimoine, whose work in preserving traditional games made it possible. Thanks to the players and tradition-bearers who keep the game alive."
              )}
            </p>
          </motion.div>

          {/* 3. Credits */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="tunisian-tile rules-card p-6 sm:p-8 bg-white border-3 border-tunisian-gold rounded-3xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3 bg-emerald-600/10 text-emerald-700 rounded-2xl">
                <Users size={26} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tunisian-gold">App Creators</span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-tunisian-red">
                  {t.credits}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Development & Tech */}
              <div className="p-4 rounded-2xl bg-tunisian-white/70 border border-tunisian-gold/30 flex items-start gap-3.5 hover:border-tunisian-gold transition-all">
                <div className="p-2.5 rounded-xl bg-tunisian-blue text-white shrink-0 mt-0.5 shadow-sm">
                  <Code size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase text-tunisian-dark-blue/60 tracking-wider">
                    {isAr ? "تطوير البرمجيات والواجهة والمزايا التقنية" : "development, interface and all technical features"}
                  </div>
                  <div className="text-lg font-black text-tunisian-dark-blue mt-0.5">
                    Ahmed Elyaakoubi
                  </div>
                  {isAr && (
                    <div className="text-xs text-tunisian-red font-bold">أحمد اليعقوبي</div>
                  )}
                </div>
              </div>

              {/* Ideation & Information */}
              <div className="p-4 rounded-2xl bg-tunisian-white/70 border border-tunisian-gold/30 flex items-start gap-3.5 hover:border-tunisian-gold transition-all">
                <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5 shadow-sm">
                  <Lightbulb size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase text-tunisian-dark-blue/60 tracking-wider">
                    {isAr ? "الفكرة والمعلومات والتوثيق" : "Ideation and information"}
                  </div>
                  <div className="text-lg font-black text-tunisian-dark-blue mt-0.5">
                    emna kanoun and Rania Boujrada
                  </div>
                  {isAr && (
                    <div className="text-xs text-tunisian-red font-bold">آمنة كانون ورانية بوجرادة</div>
                  )}
                </div>
              </div>

              {/* Logo design */}
              <div className="p-4 rounded-2xl bg-tunisian-white/70 border border-tunisian-gold/30 flex items-start gap-3.5 hover:border-tunisian-gold transition-all">
                <div className="p-2.5 rounded-xl bg-tunisian-red text-white shrink-0 mt-0.5 shadow-sm">
                  <Palette size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase text-tunisian-dark-blue/60 tracking-wider">
                    {isAr ? "تصميم الشعار (اللوغو)" : "logo design"}
                  </div>
                  <div className="text-lg font-black text-tunisian-dark-blue mt-0.5">
                    wajih bejaoui
                  </div>
                  {isAr && (
                    <div className="text-xs text-tunisian-red font-bold">وجيه البجاوي</div>
                  )}
                </div>
              </div>

              {/* Sound design */}
              <div className="p-4 rounded-2xl bg-tunisian-white/70 border border-tunisian-gold/30 flex items-start gap-3.5 hover:border-tunisian-gold transition-all">
                <div className="p-2.5 rounded-xl bg-purple-700 text-white shrink-0 mt-0.5 shadow-sm">
                  <Music size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase text-tunisian-dark-blue/60 tracking-wider">
                    {isAr ? "الهندسة والتصميم الصوتي" : "Sound design"}
                  </div>
                  <div className="text-lg font-black text-tunisian-dark-blue mt-0.5">
                    Sami Aouini
                  </div>
                  {isAr && (
                    <div className="text-xs text-tunisian-red font-bold">سامي العويني</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Copyright */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="tunisian-tile rules-card p-6 sm:p-8 bg-white border-3 border-tunisian-red/40 rounded-3xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-tunisian-red/10 text-tunisian-red rounded-2xl">
                <ShieldCheck size={26} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tunisian-red">Legal Notice</span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-tunisian-dark-blue">
                  {t.copyright}
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-red-50/60 border border-tunisian-red/20 mb-4" dir="ltr">
              <p className="text-base sm:text-lg font-bold text-tunisian-red font-mono leading-relaxed">
                © 2026 , Team Ahmed Elyaakoubi (Ahmed Elyaakoubi, Emna Kanoun, Rania Boujrada, Wajih Bejaoui, Sami Aouini) . The software, interface, graphics, code and original features of this app are our team's original work. All rights reserved
              </p>
            </div>

            {/* Team Members Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-tunisian-dark-blue/60 mr-1">
                {isAr ? "فريق العمل والمبدعون:" : "Full Team & Creators:"}
              </span>
              <span className="px-3 py-1 rounded-full bg-tunisian-blue/10 text-tunisian-blue text-xs font-bold border border-tunisian-blue/20">
                Ahmed Elyaakoubi
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-600/10 text-amber-800 text-xs font-bold border border-amber-600/20">
                Emna Kanoun
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-600/10 text-amber-800 text-xs font-bold border border-amber-600/20">
                Rania Boujrada
              </span>
              <span className="px-3 py-1 rounded-full bg-tunisian-red/10 text-tunisian-red text-xs font-bold border border-tunisian-red/20">
                Wajih Bejaoui
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-700/10 text-purple-800 text-xs font-bold border border-purple-700/20">
                Sami Aouini
              </span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-tunisian-dark-blue font-medium">
              {isAr ? (
                <>
                  ينطبق هذا الحق المحفوظ فقط على هذا التطبيق البرمجي ويشمل عمل كامل الفريق (أحمد اليعقوبي، آمنة كانون، رانية بوجرادة، وجيه البجاوي، سامي العويني). ولا يدعي أي ملكية للعبة الخربڨة التقليدية أو تاريخها أو قواعدها، والتي تظل جزءاً أصيلاً من التراث المشترك لتونس الحبيبة.
                  <span className="block mt-2 text-sm text-tunisian-dark-blue/70 italic border-t border-tunisian-gold/20 pt-2" dir="ltr">
                    "This copyright applies only to this application and honors the collective work of the whole team. It does not claim ownership of the traditional game of Kharbga, its history or its rules, which remain part of Tunisian heritage."
                  </span>
                </>
              ) : isFr ? (
                <>
                  Ces droits d'auteur s'appliquent uniquement à cette application et protègent l'œuvre collective de toute l'équipe (Ahmed Elyaakoubi, Emna Kanoun, Rania Boujrada, Wajih Bejaoui, Sami Aouini). Ils ne revendiquent en aucun cas la propriété du jeu traditionnel de Kharbga, de son histoire ou de ses règles, qui demeurent partie intégrante du patrimoine tunisien.
                  <span className="block mt-2 text-sm text-tunisian-dark-blue/70 italic border-t border-tunisian-gold/20 pt-2" dir="ltr">
                    "This copyright applies only to this application and honors the collective work of the whole team. It does not claim ownership of the traditional game of Kharbga, its history or its rules, which remain part of Tunisian heritage."
                  </span>
                </>
              ) : (
                "This copyright applies only to this application and honors the collective work of the whole team (Ahmed Elyaakoubi, Emna Kanoun, Rania Boujrada, Wajih Bejaoui, Sami Aouini). It does not claim ownership of the traditional game of Kharbga, its history or its rules, which remain part of Tunisian heritage."
              )}
            </p>
          </motion.div>

          {/* 5. Contact */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="tunisian-tile rules-card p-6 sm:p-8 bg-white border-3 border-tunisian-gold rounded-3xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-blue-500/10 text-tunisian-blue rounded-2xl">
                <Mail size={26} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-tunisian-gold">Get In Touch</span>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-tunisian-red">
                  {t.contact}
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg text-tunisian-dark-blue font-medium mb-5">
              Main developer: <a href="mailto:ahmedchihi00@gmail.com" target="_blank" rel="noopener noreferrer" className="font-bold underline text-tunisian-dark-blue hover:text-tunisian-red transition-colors">ahmedchihi00@gmail.com</a> or whatsapp : <a href="https://wa.me/21627861705" target="_blank" rel="noopener noreferrer" className="font-bold underline text-tunisian-dark-blue hover:text-emerald-700 transition-colors" dir="ltr">+21627861705</a> for any feedback/enquiries
            </p>

            {/* Quick Action Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" dir="ltr">
              {/* Email direct link & copy */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-tunisian-blue/20 hover:border-tunisian-blue flex items-center justify-between gap-3 shadow-sm transition-all">
                <a 
                  href="mailto:ahmedchihi00@gmail.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-tunisian-blue hover:text-tunisian-dark-blue font-semibold text-sm truncate"
                  title="Send an email in new window"
                >
                  <Mail size={18} className="shrink-0 text-tunisian-blue" />
                  <span className="truncate">ahmedchihi00@gmail.com</span>
                </a>
                <button
                  onClick={() => handleCopy('ahmedchihi00@gmail.com', 'email')}
                  className="p-1.5 rounded-lg bg-tunisian-sandy/50 hover:bg-tunisian-gold hover:text-white text-tunisian-dark-blue transition-all shrink-0"
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copiedField === 'email' ? <Check size={16} className="text-emerald-600 font-bold" /> : <Copy size={16} />}
                </button>
              </div>

              {/* WhatsApp direct chat link & copy */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-600/20 hover:border-emerald-600 flex items-center justify-between gap-3 shadow-sm transition-all">
                <a 
                  href="https://wa.me/21627861705" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-emerald-700 hover:text-emerald-800 font-semibold text-sm truncate"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle size={18} className="shrink-0 text-emerald-600" />
                  <span>+216 27 861 705</span>
                </a>
                <button
                  onClick={() => handleCopy('+21627861705', 'whatsapp')}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-all shrink-0"
                  title="Copy WhatsApp number"
                  aria-label="Copy WhatsApp number"
                >
                  {copiedField === 'whatsapp' ? <Check size={16} className="text-emerald-600 font-bold" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {copiedField && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-3 text-xs font-bold text-emerald-700 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>
                  {copiedField === 'email' ? 'Email address copied to clipboard!' : 'WhatsApp number copied to clipboard!'}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Traditional Footer Embellishment */}
        <div className="mt-14 text-center text-tunisian-dark-blue/40 font-serif tracking-widest text-sm flex items-center justify-center gap-3">
          <span>❖</span>
          <span>SIDI BOU SAID • MEDINA • CARTHAGE</span>
          <span>❖</span>
        </div>
      </div>
    </div>
  );
};
