/*
 * Language: the dictionary, and the switch that applies it.
 *
 * The page is written in English in the markup, so with scripting off it still
 * reads in full — in one language. This file is what makes it two: it picks a
 * language, rewrites the marked-up strings into it, and keeps the choice.
 *
 * Loaded synchronously at the end of <body> rather than deferred from <head>:
 * the whole document is parsed by the time the parser reaches it, so it can
 * translate everything in one pass before the first paint, and a Spanish
 * visitor never sees the English text flash past. main.js is deferred, so it
 * runs after this and finds the menu already in its final language.
 *
 * Adding a string to the page: give the element `data-i18n="some.key"` (its
 * text), `data-i18n-rich="some.key"` (text that contains links), or
 * `data-i18n-aria-label` / `data-i18n-content` (that attribute), then add the
 * key to both dictionaries below. An element with no key keeps whatever the
 * markup says, which is right for anything that does not translate — a proper
 * noun, "DOI", "GitHub".
 */
(() => {
  'use strict';

  const LANGS = ['en', 'es'];
  const FALLBACK = 'en';
  const STORAGE_KEY = 'lang';

  // Addresses live here, not inside the sentences that point at them, so a URL
  // is written once however many languages quote it. A string refers to one by
  // name in a markdown-ish `[label](name)` — see `rich()` at the bottom. The
  // value is one URL, or one per language where the far side is translated too.
  const LINKS = {
    uniovi: { es: 'https://www.uniovi.es/', en: 'https://www.uniovi.es/en/' },
    weso: 'https://www.weso.es/',
    rudof: 'https://rudof-project.github.io/',
    babel: { es: 'https://babelgroup.com/', en: 'https://babelgroup.com/en/' },
    bsc: {
      es: 'https://www.uniovi.es/estudia/grados/ingenieria/informaticasoftware',
      en: 'https://www.uniovi.es/en/estudia/grados/ingenieria/informaticasoftware',
    },
    msc: 'https://miw.uniovi.es/', // the programme keeps one site, in Spanish
    eii: 'https://ingenieriainformatica.uniovi.es/',
    phd: {
      es: 'https://www.uniovi.es/estudia/doctorado/ingenieriayarquitectura/informatica',
      en: 'https://www.uniovi.es/en/estudia/doctorado/ingenieriayarquitectura/informatica',
    },
    // The venues the papers appeared at. Each is the edition's own site rather
    // than the series', so the link still answers "which one was it?" years
    // from now; all of them publish in English only.
    elmke: 'https://sites.google.com/view/elmke/2026',
    dmkg: 'https://dmkg-workshop.github.io/2026/',
    iswc: 'https://iswc2026.semanticweb.org/',
    database: 'https://academic.oup.com/database',
    eswc: 'https://2026.eswc-conferences.org/',
    biohackathon: 'https://2025.biohackathon.org/',
    gonzalo: 'https://gonzalonsofernandez.es/',
    // Where rudof is published, one address per channel.
    rudofcrate: 'https://crates.io/crates/rudof_lib',
    rudofcli: 'https://github.com/rudof-project/rudof/releases/latest',
    pyrudof: 'https://pypi.org/project/pyrudof/',
    rudofwasm: 'https://www.npmjs.com/package/@rudof/rudof',
    kcap: 'https://www.k-cap.org/2025/',
  };

  // The dictionaries. Keyed by section, so a key says where on the page it
  // belongs; the two must stay in step, and a key missing from one simply
  // leaves the markup's own text in place rather than blanking the element.
  const DICT = {
    en: {
      'meta.title': 'Samuel Bustamante-Larriet — Semantic Web & Knowledge Graphs',
      'meta.description':
        'Personal site of Samuel Bustamante-Larriet: PhD student in Computer Science at the University of Oviedo, working on knowledge graphs and linked data.',

      'a11y.skip': 'Skip to content',
      'a11y.sections': 'Sections',
      'a11y.panels': 'Panels',
      'a11y.theme': 'Toggle dark theme',
      'a11y.language': 'Language',
      // The pager arrows name where they go, not which way they point: "next"
      // tells a screen reader nothing a visitor cannot already see.
      'a11y.down.experience': 'Down to experience',
      'a11y.down.education': 'Down to education',
      'a11y.down.publications': 'Down to publications',
      'a11y.down.projects': 'Down to projects',
      'a11y.down.contact': 'Down to contact',
      'a11y.down.thanks': 'Down to thanks',
      'a11y.up.top': 'Up to the top',
      'a11y.up.experience': 'Up to experience',
      'a11y.up.education': 'Up to education',
      'a11y.up.publications': 'Up to publications',
      'a11y.up.projects': 'Up to projects',
      'a11y.up.contact': 'Up to contact',
      'a11y.top': 'Back to the top',

      'nav.about': 'About',
      'nav.publications': 'Publications',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',

      'hero.role': 'PhD student in Computer Science',
      'hero.place': 'Oviedo, Asturias, Spain',
      'hero.p1':
        'I am fascinated by knowledge representation, and in particular by knowledge graph technologies and how they hold up when applied to real problems.',
      'hero.p2':
        'I am currently a PhD student in Computer Science at the [University of Oviedo](uniovi), in my first year (since Oct 2026), on a full-time research contract with the [WESO](weso) (Web Semantics Oviedo) research group, where one of my main responsibilities is the development and maintenance of [rudof](rudof), an open source library written in Rust that provides tooling for the knowledge graph ecosystem.',

      'exp.title': 'Experience',
      'exp.weso.date': 'Jan 2026 - present',
      'exp.weso.role': 'Research Technician',
      'exp.weso.org': '[WESO](weso) (Web Semantics Oviedo), [University of Oviedo](uniovi)',
      'exp.weso.desc':
        'Development and maintenance of [rudof](rudof), an open source library written in Rust that provides tooling for the knowledge graph ecosystem.',
      'exp.intern.date': 'Oct 2025 - Nov 2025',
      'exp.intern.role': 'Research Intern',
      'exp.intern.org': 'WESO, University of Oviedo',
      'exp.intern.desc':
        'Implementation of an MCP server, and a first in-depth look at Semantic Web technologies.',
      'exp.babel.date': 'Jan 2025 - Apr 2025',
      'exp.babel.role': 'Intern',
      'exp.babel.org': '[Babel](babel)',
      'exp.babel.desc':
        'Internship at an international consultancy, building on the .NET stack.',

      'edu.title': 'Education',
      'edu.phd.date': 'Oct 2026 - present',
      'edu.phd.degree': '[PhD in Computer Science](phd)',
      'edu.phd.desc':
        'Research line: Semantic Web. The subject is still to be decided; I am exploring the idea of “Declarative data transformations in knowledge graphs”.',
      'edu.msc.date': 'Sep 2025 - Jul 2026',
      'edu.msc.degree': "[Master's Degree in Web Engineering](msc), research track",
      'edu.msc.desc':
        'Web systems end to end: web standards and computing, site architecture, web services, secure server administration, databases, cloud computing, user interfaces, user experience, mobile applications, data science, big data, the Semantic Web, strategic planning, business models, e-commerce. The research track adds research methodology and the writing of scientific publications; an external placement and the final project close it.',
      'edu.bsc.date': 'Sep 2021 - Jul 2025',
      'edu.bsc.degree': "[Bachelor's Degree in Software Engineering](bsc)",
      'edu.bsc.desc':
        'The foundations of computing: the theory of computation, programming, data structures, algorithms, language design, computer technology and architecture, operating systems, networks, systems administration, distributed systems, databases, information repositories, web standards and development, human-computer interaction, intelligent systems, security. On that ground, the whole software engineering cycle: process, requirements, design, architecture, quality and verification, project management, the business, legal and ethical setting the work is done in. The electives taken were computer forensics and auditing, mobile software and enterprise application integration; an industry placement and the final project close it.',
      'edu.phd.where': '[University of Oviedo](uniovi)',
      'edu.msc.where': 'University of Oviedo, [EII](eii)',
      'edu.bsc.where': 'University of Oviedo, EII',

      'pub.title': 'Papers',
      // Only the dates and the line under each title: a paper's own title is
      // not translated, so it stays in the markup with no key of its own.
      'pub.elmke.date': 'Oct 2026',
      'pub.elmke.meta':
        'S. Bustamante-Larriet, Á. García-Fernández, J. E. Labra-Gayo. Paper presented at [ELMKE 2026](elmke), the workshop on the evaluation of language models in knowledge engineering, co-located with [ISWC 2026](iswc), the International Semantic Web Conference, in Bari, Italy.',
      'pub.dmkg.date': 'Oct 2026',
      'pub.dmkg.meta':
        'Á. García-Fernández, S. Bustamante-Larriet, J. E. Labra-Gayo, O. Corcho-García. Paper presented at [DMKG 2026](dmkg), the workshop on data management for knowledge graphs, co-located with [ISWC 2026](iswc), the International Semantic Web Conference, in Bari, Italy.',
      'pub.togomcp.date': 'Jul 2026',
      'pub.togomcp.meta':
        'A. R. Kinjo, Y. Yamamoto, S. Bustamante-Larriet, J.-E. Labra-Gayo, T. Fujisawa. Research article in [Database](database), the Oxford University Press journal of biological databases and curation. Open access.',
      'pub.eswc.date': 'May 2026',
      'pub.eswc.meta':
        'S. Bustamante-Larriet, D. Martín-Fernández, Á. García-Fernández, D. Fernández-Álvarez, J. E. Labra-Gayo. Poster and demo presented at [ESWC 2026](eswc), the European Semantic Web Conference, Dubrovnik, Croatia.',
      'pub.biohack.date': 'Dec 2025',
      'pub.biohack.meta':
        'J. E. Labra-Gayo and others, with S. Bustamante-Larriet. Report on the project carried out at the [DBCLS BioHackathon 2025](biohackathon), Mie, Japan, published on BioHackrXiv.',
      'pub.kcap.date': 'Dec 2025',
      'pub.kcap.meta':
        'J. E. Labra-Gayo, D. Tomaszuk, D. Martín-Fernández, S. Bustamante-Larriet, Á. García-Fernández, D. Fernández-Álvarez. Poster and demo presented at [K-CAP 2025](kcap), the Knowledge Capture Conference, Dayton, Ohio.',

      'proj.title': 'Coding',
      // The one real entry; the name is a name, so only the date and the line
      // under it are translated.
      'proj.rudof.date': 'Active',
      'proj.rudof.desc':
        '“A semantic-less tool for the Semantic Web”: an open source library written in Rust that provides tooling for the knowledge graph ecosystem. It is published as Rust crates, chief among them [rudof_lib](rudofcrate); as a [command line tool](rudofcli), with binaries for Linux, macOS and Windows; as [Python bindings](pyrudof); and as [WebAssembly](rudofwasm) for the browser.',

      'link.site': 'Website',
      'link.code': 'Code',

      'contact.title': 'Get in touch',
      'contact.lead':
        'Interested in collaborating on a project or exploring professional opportunities? I would like to hear from you.',

      'thanks.title': 'Thanks',
      'thanks.body':
        'Thank you to my parents, Ana and Carmelo, to my sister Gloria and to my partner in life, Teresa, for being a source of energy and constant support.',
      'colophon.credit': 'Design inspired by the page of my friend [Gonzalo Alonso-Fernandez](gonzalo)',
    },

    es: {
      'meta.title': 'Samuel Bustamante-Larriet — Web Semántica y Grafos de Conocimiento',
      'meta.description':
        'Web personal de Samuel Bustamante-Larriet: doctorando en Informática por la Universidad de Oviedo, trabajando en grafos de conocimiento y datos enlazados.',

      'a11y.skip': 'Saltar al contenido',
      'a11y.sections': 'Secciones',
      'a11y.panels': 'Paneles',
      'a11y.theme': 'Alternar el tema oscuro',
      'a11y.language': 'Idioma',
      'a11y.down.experience': 'Bajar a experiencia',
      'a11y.down.education': 'Bajar a formación',
      'a11y.down.publications': 'Bajar a publicaciones',
      'a11y.down.projects': 'Bajar a proyectos',
      'a11y.down.contact': 'Bajar a contacto',
      'a11y.down.thanks': 'Bajar a agradecimientos',
      'a11y.up.top': 'Subir al inicio',
      'a11y.up.experience': 'Subir a experiencia',
      'a11y.up.education': 'Subir a formación',
      'a11y.up.publications': 'Subir a publicaciones',
      'a11y.up.projects': 'Subir a proyectos',
      'a11y.up.contact': 'Subir a contacto',
      'a11y.top': 'Volver al inicio',

      'nav.about': 'Sobre mí',
      'nav.publications': 'Publicaciones',
      'nav.projects': 'Proyectos',
      'nav.contact': 'Contacto',

      'hero.role': 'Doctorando en Informática',
      'hero.place': 'Oviedo, Asturias, España',
      'hero.p1':
        'Me apasiona el campo de la representación del conocimiento, y en particular las tecnologías de los grafos de conocimiento y su aplicación a problemas reales.',
      'hero.p2':
        'Actualmente soy doctorando en Informática por la [Universidad de Oviedo](uniovi), en mi primer año (desde oct. 2026), y tengo un contrato de investigación a jornada completa con el grupo de investigación [WESO](weso) (Web Semantics Oviedo), donde una de mis principales labores es el desarrollo y mantenimiento de [rudof](rudof), una biblioteca open source escrita en Rust que ofrece herramientas para el ecosistema de los grafos de conocimiento.',

      'exp.title': 'Experiencia',
      'exp.weso.date': 'ene. 2026 - actualidad',
      'exp.weso.role': 'Técnico de Investigación',
      'exp.weso.org': '[WESO](weso) (Web Semantics Oviedo), [Universidad de Oviedo](uniovi)',
      'exp.weso.desc':
        'Desarrollo y mantenimiento de [rudof](rudof), una biblioteca open source escrita en Rust que ofrece herramientas para el ecosistema de los grafos de conocimiento.',
      'exp.intern.date': 'oct. 2025 - nov. 2025',
      'exp.intern.role': 'Estudiante en Prácticas',
      'exp.intern.org': 'WESO, Universidad de Oviedo',
      'exp.intern.desc':
        'Implementación de un servidor MCP y primer contacto en profundidad con las tecnologías de la web semántica.',
      'exp.babel.date': 'ene. 2025 - abr. 2025',
      'exp.babel.role': 'Estudiante en Prácticas',
      'exp.babel.org': '[Babel](babel)',
      'exp.babel.desc':
        'Prácticas en consultoría internacional con tecnologías .NET.',

      'edu.title': 'Formación',
      'edu.phd.date': 'oct. 2026 - actualidad',
      'edu.phd.degree': '[Doctorado en Informática](phd)',
      'edu.phd.desc':
        'Línea de investigación: web semántica. La temática aún está por decidir; exploro la idea de «Transformaciones declarativas de datos en grafos de conocimiento».',
      'edu.msc.date': 'sept. 2025 - jul. 2026',
      'edu.msc.degree': '[Máster en Ingeniería Web](msc), Rama de Investigación',
      'edu.msc.desc':
        'Sistemas web de principio a fin: estándares y computación web, arquitectura de sitios, servicios web, administración segura de servidores, bases de datos, computación en la nube, interfaces de usuario, experiencia de usuario, aplicaciones móviles, ciencia de datos, big data, web semántica, planificación estratégica, modelos de negocio, comercio electrónico. La rama de investigación añade metodología de la investigación y elaboración de publicaciones científicas; se completa con prácticas externas y el trabajo fin de máster.',
      'edu.bsc.date': 'sept. 2021 - jul. 2025',
      'edu.bsc.degree': '[Grado en Ingeniería Informática del Software](bsc)',
      'edu.bsc.desc':
        'Los fundamentos de la informática: teoría de la computación, programación, estructuras de datos, algoritmia, diseño de lenguajes, tecnología y arquitectura de computadores, sistemas operativos, redes, administración de sistemas, sistemas distribuidos, bases de datos, repositorios de información, estándares y desarrollo para la web, interacción persona-máquina, sistemas inteligentes, seguridad. Sobre esa base, el ciclo completo de la ingeniería del software: proceso, requisitos, diseño, arquitectura, calidad y verificación, dirección de proyectos, el marco empresarial, legal y ético en el que se ejerce. Las optativas cursadas fueron informática forense y auditoría, software para dispositivos móviles e integración de aplicaciones empresariales; se cierra con prácticas en empresa y el trabajo fin de grado.',
      'edu.phd.where': '[Universidad de Oviedo](uniovi)',
      'edu.msc.where': 'Universidad de Oviedo, [EII](eii)',
      'edu.bsc.where': 'Universidad de Oviedo, EII',

      'pub.title': 'Artículos',
      'pub.elmke.date': 'oct. 2026',
      'pub.elmke.meta':
        'S. Bustamante-Larriet, Á. García-Fernández, J. E. Labra-Gayo. Artículo presentado en [ELMKE 2026](elmke), el workshop sobre la evaluación de modelos de lenguaje en ingeniería del conocimiento, celebrado junto a [ISWC 2026](iswc), la Conferencia Internacional de Web Semántica, en Bari, Italia.',
      'pub.dmkg.date': 'oct. 2026',
      'pub.dmkg.meta':
        'Á. García-Fernández, S. Bustamante-Larriet, J. E. Labra-Gayo, O. Corcho-García. Artículo presentado en [DMKG 2026](dmkg), el workshop sobre gestión de datos para grafos de conocimiento, celebrado junto a [ISWC 2026](iswc), la Conferencia Internacional de Web Semántica, en Bari, Italia.',
      'pub.togomcp.date': 'jul. 2026',
      'pub.togomcp.meta':
        'A. R. Kinjo, Y. Yamamoto, S. Bustamante-Larriet, J.-E. Labra-Gayo, T. Fujisawa. Artículo de investigación en [Database](database), la revista de bases de datos biológicas y curación de Oxford University Press. Acceso abierto.',
      'pub.eswc.date': 'may. 2026',
      'pub.eswc.meta':
        'S. Bustamante-Larriet, D. Martín-Fernández, Á. García-Fernández, D. Fernández-Álvarez, J. E. Labra-Gayo. Póster y demo presentados en [ESWC 2026](eswc), la Conferencia Europea de Web Semántica, Dubrovnik, Croacia.',
      'pub.biohack.date': 'dic. 2025',
      'pub.biohack.meta':
        'J. E. Labra-Gayo y otros, con S. Bustamante-Larriet. Informe del proyecto desarrollado en el [DBCLS BioHackathon 2025](biohackathon), Mie, Japón, publicado en BioHackrXiv.',
      'pub.kcap.date': 'dic. 2025',
      'pub.kcap.meta':
        'J. E. Labra-Gayo, D. Tomaszuk, D. Martín-Fernández, S. Bustamante-Larriet, Á. García-Fernández, D. Fernández-Álvarez. Póster y demo presentados en [K-CAP 2025](kcap), la Conferencia de Captura de Conocimiento, Dayton, Ohio.',

      'proj.title': 'Código',
      'proj.rudof.date': 'Activo',
      'proj.rudof.desc':
        '«A semantic-less tool for the Semantic Web»: una biblioteca open source escrita en Rust que ofrece herramientas para el ecosistema de los grafos de conocimiento. Se publica como crates de Rust, el principal [rudof_lib](rudofcrate); como [herramienta de línea de comandos](rudofcli), con binarios para Linux, macOS y Windows; como [bindings de Python](pyrudof); y como [WebAssembly](rudofwasm) para el navegador.',

      'link.site': 'Web',
      'link.code': 'Código',

      'contact.title': 'Hablemos',
      'contact.lead':
        '¿Interesado en colaborar en un proyecto o explorar oportunidades profesionales? Me gustaría conocerte.',

      'thanks.title': 'Gracias',
      'thanks.body':
        'Gracias a mis padres, Ana y Carmelo, a mi hermana Gloria y a mi compañera de vida, Teresa, por ser fuente de energía y apoyo constante.',
      'colophon.credit': 'Diseño inspirado en la página de mi amigo [Gonzalo Alonso-Fernandez](gonzalo)',
    },
  };

  // Attributes that can be translated, and the marker that asks for it. Text
  // goes through the two loops below this; everything else is an attribute,
  // and all of them are set the same way.
  const ATTRS = {
    'aria-label': 'data-i18n-aria-label',
    content: 'data-i18n-content',
  };

  // ---------- Which language ----------
  //
  // A stored choice wins, because it was made on this site deliberately.
  // Failing that the browser decides: the first of its preferred languages we
  // actually speak, which is Spanish for a Spanish visitor and English for
  // everyone else, including anyone whose list we have nothing in common with.

  function stored() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGS.includes(saved) ? saved : null;
    } catch {
      // Storage can throw in private mode or when cookies are blocked.
      return null;
    }
  }

  function preferred() {
    const list = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of list) {
      // "es-ES" and "es-419" are both Spanish; only the primary subtag matters.
      const base = String(tag || '').toLowerCase().split('-')[0];
      if (LANGS.includes(base)) return base;
    }
    return FALLBACK;
  }

  // ---------- Applying it ----------

  const escapeHtml = (text) =>
    text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const href = (name, lang) => {
    const url = LINKS[name];
    return typeof url === 'string' ? url : url?.[lang] ?? url?.[FALLBACK];
  };

  // `[label](name)` becomes a link to whatever `name` stands for in LINKS. The
  // text is escaped first, so the only markup that can come out of a string is
  // the anchor built here, from an address this file owns. A name that is not
  // in LINKS leaves its label as plain text rather than producing a dead link.
  function rich(text, lang) {
    return escapeHtml(text).replace(/\[([^\]]+)\]\(([\w-]+)\)/g, (whole, label, name) => {
      const url = href(name, lang);
      return url ? `<a href="${url}" rel="noopener">${label}</a>` : label;
    });
  }

  function apply(lang) {
    const strings = DICT[lang] ?? DICT[FALLBACK];
    const read = (el, marker) => strings[el.getAttribute(marker)];

    document.documentElement.lang = lang;

    for (const el of document.querySelectorAll('[data-i18n]')) {
      const text = read(el, 'data-i18n');
      if (text != null) el.textContent = text;
    }

    for (const el of document.querySelectorAll('[data-i18n-rich]')) {
      const text = read(el, 'data-i18n-rich');
      if (text != null) el.innerHTML = rich(text, lang);
    }

    for (const [attr, marker] of Object.entries(ATTRS)) {
      for (const el of document.querySelectorAll(`[${marker}]`)) {
        const text = read(el, marker);
        if (text != null) el.setAttribute(attr, text);
      }
    }
  }

  // ---------- The switch ----------
  //
  // Two buttons rather than one toggle: the language you are not in is a
  // destination, not a state to flip into, and naming both is what lets a
  // visitor see "ES" before knowing the site has any Spanish in it.
  // `aria-pressed` carries which one is current, and doubles as the styling
  // hook — the same arrangement the theme switch uses.

  let current = stored() ?? preferred();
  apply(current);

  const buttons = [...document.querySelectorAll('.lang-option')];

  function select(lang) {
    current = lang;
    apply(lang);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // No storage available: the choice lasts for this visit only.
    }
  }

  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === current));
    button.addEventListener('click', () => {
      if (button.dataset.lang !== current) select(button.dataset.lang);
    });
  });
})();
