import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr', flag: '🇪🇹' }
];

export const translations = {
  en: {
    tabs: {
      Chat: 'Chat',
      Bounties: 'Bounties',
      Audit: 'Audit',
      Justice: 'Justice',
      Membership: 'Membership',
      Commons: 'Commons',
      Legislature: 'Legislature',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Insert Civic Common Name]',
      installApp: 'Install App',
      loginII: 'Login II',
      logout: 'Logout',
      language: 'Language'
    },
    share: {
      shareLabel: 'Share:',
      chatTitle: 'Civic OS Chat',
      chatText: 'Ask the Civic OS sovereign AI agent',
      bountiesTitle: 'Civic OS Bounties',
      bountiesText: 'Post or check bounties on The Civic OS',
      auditTitle: 'Civic OS Audit',
      auditText: 'Public audit log and zk-actions on The Civic OS',
      justiceTitle: 'Civic OS Justice',
      justiceText: 'File a case or cast a verdict on The Civic OS',
      membershipTitle: 'Civic OS Membership',
      membershipText: 'Enroll as a citizen and explore membership on The Civic OS',
      commonsTitle: 'Civic OS Knowledge Commons',
      commonsText: 'Contribute to the Civic OS knowledge commons',
      legislatureTitle: 'Civic OS Legislature',
      legislatureText: 'Propose, code, or vote on legislation on The Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'Deposit, mint, and withdraw ckBTC on The Civic OS'
    },
    common: {
      loading: 'Loading...',
      submit: 'Submit',
      search: 'Search',
      cancel: 'Cancel',
      close: 'Close',
      error: 'Error',
      success: 'Success'
    }
  },
  es: {
    tabs: {
      Chat: 'Chat',
      Bounties: 'Recompensas',
      Audit: 'Auditoría',
      Justice: 'Justicia',
      Membership: 'Membresía',
      Commons: 'Bienes Comunes',
      Legislature: 'Legislatura',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Nombre Común Cívico]',
      installApp: 'Instalar App',
      loginII: 'Iniciar con II',
      logout: 'Cerrar sesión',
      language: 'Idioma'
    },
    share: {
      shareLabel: 'Compartir:',
      chatTitle: 'Civic OS Chat',
      chatText: 'Consulta al agente de IA soberano de Civic OS',
      bountiesTitle: 'Recompensas de Civic OS',
      bountiesText: 'Publica o revisa recompensas en Civic OS',
      auditTitle: 'Auditoría de Civic OS',
      auditText: 'Registro público de auditoría y acciones zk en Civic OS',
      justiceTitle: 'Justicia de Civic OS',
      justiceText: 'Presenta un caso o emite un veredicto en Civic OS',
      membershipTitle: 'Membresía de Civic OS',
      membershipText: 'Inscríbete como ciudadano y explora membresías en Civic OS',
      commonsTitle: 'Bienes Comunes de Civic OS',
      commonsText: 'Contribuye al procomún de conocimiento de Civic OS',
      legislatureTitle: 'Legislatura de Civic OS',
      legislatureText: 'Propón, programa o vota legislación en Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'Deposita, emite y retira ckBTC en The Civic OS'
    },
    common: {
      loading: 'Cargando...',
      submit: 'Enviar',
      search: 'Buscar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      error: 'Error',
      success: 'Éxito'
    }
  },
  fr: {
    tabs: {
      Chat: 'Discussion',
      Bounties: 'Primes',
      Audit: 'Audit',
      Justice: 'Justice',
      Membership: 'Adhésion',
      Commons: 'Biens Communs',
      Legislature: 'Législature',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Nom du Bien Commun Civique]',
      installApp: 'Installer l’App',
      loginII: 'Connexion II',
      logout: 'Déconnexion',
      language: 'Langue'
    },
    share: {
      shareLabel: 'Partager :',
      chatTitle: 'Discussion Civic OS',
      chatText: 'Interrogez l’agent IA souverain de Civic OS',
      bountiesTitle: 'Primes Civic OS',
      bountiesText: 'Publiez ou vérifiez les primes sur The Civic OS',
      auditTitle: 'Audit Civic OS',
      auditText: 'Journal public d’audit et actions zk sur The Civic OS',
      justiceTitle: 'Justice Civic OS',
      justiceText: 'Déposez une plainte ou votez un verdict sur The Civic OS',
      membershipTitle: 'Adhésion Civic OS',
      membershipText: 'Inscrivez-vous comme citoyen et rejoignez The Civic OS',
      commonsTitle: 'Biens Communs Civic OS',
      commonsText: 'Contribuez aux biens communs du savoir de Civic OS',
      legislatureTitle: 'Législature Civic OS',
      legislatureText: 'Proposez, codez ou votez la législation sur The Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'Déposez, émettez et retirez du ckBTC sur The Civic OS'
    },
    common: {
      loading: 'Chargement...',
      submit: 'Soumettre',
      search: 'Rechercher',
      cancel: 'Annuler',
      close: 'Fermer',
      error: 'Erreur',
      success: 'Succès'
    }
  },
  zh: {
    tabs: {
      Chat: '对话',
      Bounties: '赏金任务',
      Audit: '审计日志',
      Justice: '正义仲裁',
      Membership: '公民身份',
      Commons: '知识公域',
      Legislature: '立法治理',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[输入公民共同体名称]',
      installApp: '安装应用',
      loginII: 'II 登录',
      logout: '退出登录',
      language: '语言'
    },
    share: {
      shareLabel: '分享：',
      chatTitle: 'Civic OS 智能问答',
      chatText: '咨询 Civic OS 主权人工智能助手',
      bountiesTitle: 'Civic OS 赏金任务',
      bountiesText: '在 Civic OS 发布或查询赏金任务',
      auditTitle: 'Civic OS 审计日志',
      auditText: 'Civic OS 上的公开审计与零知识证明操作',
      justiceTitle: 'Civic OS 正义仲裁',
      justiceText: '在 Civic OS 提交申诉或参与陪审投票',
      membershipTitle: 'Civic OS 公民身份',
      membershipText: '注册成为公民并探索 Civic OS 成员网络',
      commonsTitle: 'Civic OS 知识公域',
      commonsText: '为 Civic OS 知识共享公域贡献力量',
      legislatureTitle: 'Civic OS 立法治理',
      legislatureText: '在 Civic OS 提案、编写代码并参与法案表决',
      ckbtcTitle: 'Civic OS ckBTC 水龙头',
      ckbtcText: '在 Civic OS 充值、铸造并提取 ckBTC'
    },
    common: {
      loading: '加载中...',
      submit: '提交',
      search: '搜索',
      cancel: '取消',
      close: '关闭',
      error: '错误',
      success: '成功'
    }
  },
  ar: {
    tabs: {
      Chat: 'المحادثة',
      Bounties: 'المكافآت',
      Audit: 'التدقيق',
      Justice: 'العدالة',
      Membership: 'العضوية',
      Commons: 'المشاعات',
      Legislature: 'التشريع',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[أدخل اسم المشاع المدني]',
      installApp: 'تثبيت التطبيق',
      loginII: 'تسجيل الدخول II',
      logout: 'تسجيل الخروج',
      language: 'اللغة'
    },
    share: {
      shareLabel: 'مشاركة:',
      chatTitle: 'محادثة Civic OS',
      chatText: 'اسأل وكيل الذكاء الاصطناعي السيادي في Civic OS',
      bountiesTitle: 'مكافآت Civic OS',
      bountiesText: 'انشر أو تحقق من المكافآت على Civic OS',
      auditTitle: 'سجل التدقيق Civic OS',
      auditText: 'سجل تدقيق عام وإجراءات المعرفة الصفرية على Civic OS',
      justiceTitle: 'عدالة Civic OS',
      justiceText: 'ارفع قضية أو شارك في إصدار الحكم على Civic OS',
      membershipTitle: 'عضوية Civic OS',
      membershipText: 'سجل كمواطن واستكشف العضوية في Civic OS',
      commonsTitle: 'مشاعات المعرفة Civic OS',
      commonsText: 'ساهم في مشاعات المعرفة المدنية على Civic OS',
      legislatureTitle: 'هيئة التشريع Civic OS',
      legislatureText: 'اقترح القوانين، طور التعليمات، وصوت على التشريعات في Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'إيداع وصك وسحب ckBTC على The Civic OS'
    },
    common: {
      loading: 'جاري التحميل...',
      submit: 'إرسال',
      search: 'بحث',
      cancel: 'إلغاء',
      close: 'إغلاق',
      error: 'خطأ',
      success: 'تم بنجاح'
    }
  },
  de: {
    tabs: {
      Chat: 'Chat',
      Bounties: 'Belohnungen',
      Audit: 'Prüfung',
      Justice: 'Justiz',
      Membership: 'Mitgliedschaft',
      Commons: 'Gemeingüter',
      Legislature: 'Legislative',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Name des bürgerlichen Gemeinguts]',
      installApp: 'App installieren',
      loginII: 'II-Login',
      logout: 'Abmelden',
      language: 'Sprache'
    },
    share: {
      shareLabel: 'Teilen:',
      chatTitle: 'Civic OS Chat',
      chatText: 'Frage den souveränen Civic OS KI-Agenten',
      bountiesTitle: 'Civic OS Belohnungen',
      bountiesText: 'Erstelle oder prüfe Belohnungen auf The Civic OS',
      auditTitle: 'Civic OS Prüfungsprotokoll',
      auditText: 'Öffentliches Audit-Protokoll und zk-Aktionen auf The Civic OS',
      justiceTitle: 'Civic OS Justiz',
      justiceText: 'Fall einreichen oder Urteil fällen auf The Civic OS',
      membershipTitle: 'Civic OS Mitgliedschaft',
      membershipText: 'Als Bürger registrieren und Civic OS entdecken',
      commonsTitle: 'Civic OS Wissens-Gemeingut',
      commonsText: 'Bringe dich in das Civic OS Wissens-Gemeingut ein',
      legislatureTitle: 'Civic OS Legislative',
      legislatureText: 'Gesetze vorschlagen, programmieren und abstimmen auf The Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'ckBTC einzahlen, prägen und abheben auf The Civic OS'
    },
    common: {
      loading: 'Wird geladen...',
      submit: 'Absenden',
      search: 'Suchen',
      cancel: 'Abbrechen',
      close: 'Schließen',
      error: 'Fehler',
      success: 'Erfolg'
    }
  },
  pt: {
    tabs: {
      Chat: 'Chat',
      Bounties: 'Recompensas',
      Audit: 'Auditoria',
      Justice: 'Justiça',
      Membership: 'Membros',
      Commons: 'Bens Comuns',
      Legislature: 'Legislatura',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Nome Comum Cívico]',
      installApp: 'Instalar App',
      loginII: 'Entrar com II',
      logout: 'Sair',
      language: 'Idioma'
    },
    share: {
      shareLabel: 'Compartilhar:',
      chatTitle: 'Civic OS Chat',
      chatText: 'Consulte o assistente soberano de IA do Civic OS',
      bountiesTitle: 'Recompensas do Civic OS',
      bountiesText: 'Publique ou consulte recompensas no Civic OS',
      auditTitle: 'Auditoria do Civic OS',
      auditText: 'Registro público de auditoria e ações zk no Civic OS',
      justiceTitle: 'Justiça do Civic OS',
      justiceText: 'Abra um caso ou vote em um veredito no Civic OS',
      membershipTitle: 'Membros do Civic OS',
      membershipText: 'Inscreva-se como cidadão e explore o Civic OS',
      commonsTitle: 'Bens Comuns do Civic OS',
      commonsText: 'Contribua com o bem comum do conhecimento no Civic OS',
      legislatureTitle: 'Legislatura do Civic OS',
      legislatureText: 'Proponha, codifique ou vote em legislações no Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'Deposite, emita e retire ckBTC no The Civic OS'
    },
    common: {
      loading: 'Carregando...',
      submit: 'Enviar',
      search: 'Buscar',
      cancel: 'Cancelar',
      close: 'Fechar',
      error: 'Erro',
      success: 'Sucesso'
    }
  },
  ru: {
    tabs: {
      Chat: 'Чат',
      Bounties: 'Вознаграждения',
      Audit: 'Аудит',
      Justice: 'Правосудие',
      Membership: 'Членство',
      Commons: 'Общественное достояние',
      Legislature: 'Законодательство',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'OS',
      defaultOsName: '[Название гражданского сообщества]',
      installApp: 'Установить приложение',
      loginII: 'Вход с II',
      logout: 'Выйти',
      language: 'Язык'
    },
    share: {
      shareLabel: 'Поделиться:',
      chatTitle: 'Чат Civic OS',
      chatText: 'Задайте вопрос суверенному ИИ-агенту Civic OS',
      bountiesTitle: 'Вознаграждения Civic OS',
      bountiesText: 'Публикуйте и проверяйте вознаграждения в Civic OS',
      auditTitle: 'Аудит Civic OS',
      auditText: 'Публичный журнал аудита и zk-действия в Civic OS',
      justiceTitle: 'Правосудие Civic OS',
      justiceText: 'Подайте жалобу или проголосуйте за вердикт в Civic OS',
      membershipTitle: 'Членство Civic OS',
      membershipText: 'Зарегистрируйтесь гражданином в Civic OS',
      commonsTitle: 'База знаний Civic OS',
      commonsText: 'Внесите вклад в открытую базу знаний Civic OS',
      legislatureTitle: 'Законодательство Civic OS',
      legislatureText: 'Предлагайте, кодируйте и голосуйте за законы в Civic OS',
      ckbtcTitle: 'Civic OS ckBTC',
      ckbtcText: 'Депозит, выпуск и вывод ckBTC в The Civic OS'
    },
    common: {
      loading: 'Загрузка...',
      submit: 'Отправить',
      search: 'Поиск',
      cancel: 'Отмена',
      close: 'Закрыть',
      error: 'Ошибка',
      success: 'Успешно'
    }
  },
  am: {
    tabs: {
      Chat: 'ውይይት',
      Bounties: 'ሽልማቶች',
      Audit: 'ኦዲት',
      Justice: 'ፍትህ',
      Membership: 'አባልነት',
      Commons: 'የጋራ ሃብት',
      Legislature: 'ህግ አውጪ',
      ckBTC: 'ckBTC'
    },
    header: {
      osTitleSuffix: 'ስርዓት',
      defaultOsName: '[የሲቪክ ማህበረሰብ ስም]',
      installApp: 'መተግበሪያ ጫን',
      loginII: 'በ II ግባ',
      logout: 'ውጣ',
      language: 'ቋንቋ'
    },
    share: {
      shareLabel: 'አጋራ:',
      chatTitle: 'የሲቪክ ኦኤስ ውይይት',
      chatText: 'የሲቪክ ኦኤስ የራስ ገዝ AI ወኪልን ይጠይቁ',
      bountiesTitle: 'የሲቪክ ኦኤስ ሽልማቶች',
      bountiesText: 'በሲቪክ ኦኤስ ላይ ሽልማቶችን ይለጥፉ ወይም ያረጋግጡ',
      auditTitle: 'የሲቪክ ኦኤስ ኦዲት',
      auditText: 'የህዝብ ኦዲት መዝገብ እና zk-እርምጃዎች በሲቪክ ኦኤስ ላይ',
      justiceTitle: 'የሲቪክ ኦኤስ ፍትህ',
      justiceText: 'ክስ ይመስርቱ ወይም ውሳኔ ላይ ድምጽ ይስጡ በሲቪክ ኦኤስ',
      membershipTitle: 'የሲቪክ ኦኤስ አባልነት',
      membershipText: 'እንደ ዜጋ ይመዝገቡ እና የሲቪክ ኦኤስን አባልነት ያስሱ',
      commonsTitle: 'የሲቪክ ኦኤስ የጋራ እውቀት',
      commonsText: 'ለሲቪክ ኦኤስ የጋራ የእውቀት ማዕከል አስተዋጽኦ ያድርጉ',
      legislatureTitle: 'የሲቪክ ኦኤስ ህግ አውጪ',
      legislatureText: 'ህግ ያቅርቡ፣ ይጻፉ ወይም ድምጽ ይስጡ በሲቪክ ኦኤስ',
      ckbtcTitle: 'የሲቪክ ኦኤስ ckBTC',
      ckbtcText: 'ckBTC በThe Civic OS ላይ ያስቀምጡ፣ ያመንጩ እና ያውጡ'
    },
    common: {
      loading: 'በመጫን ላይ...',
      submit: 'አስገባ',
      search: 'ፈልግ',
      cancel: 'ሰርዝ',
      close: 'ዝጋ',
      error: 'ስህተት',
      success: 'ተሳክቷል'
    }
  }
};

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (path) => path,
  dir: 'ltr',
  currentLangMeta: SUPPORTED_LANGUAGES[0]
});

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('civic_os_lang');
    if (saved && translations[saved]) return saved;
    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (translations[browserLang]) return browserLang;
  } catch (e) {
    console.warn('Could not read saved language', e);
  }
  return 'en';
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem('civic_os_lang', lang);
      } catch (e) {
        console.warn('Could not persist language', e);
      }
    }
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLangMeta.dir;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  // Key path traversal helper: e.g. t('tabs.Chat')
  const t = (path, fallback) => {
    const parts = path.split('.');
    let current = translations[language];
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }
    if (current !== undefined) return current;

    // Fallback to English
    let enCurrent = translations.en;
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
        enCurrent = enCurrent[part];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (enCurrent !== undefined) return enCurrent;
    return fallback !== undefined ? fallback : path;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir, currentLangMeta }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

export const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="cursor-pointer appearance-none rounded bg-blue-700/80 hover:bg-blue-800 text-white text-xs font-semibold py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-white border border-blue-400/30 transition-colors"
        aria-label="Select Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-900 bg-white">
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-white/80 text-[10px]">
        ▼
      </span>
    </div>
  );
};
