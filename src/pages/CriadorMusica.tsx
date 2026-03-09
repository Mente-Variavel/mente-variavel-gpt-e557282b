import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Copy, ExternalLink, Sparkles, Loader2, Lightbulb, RotateCcw, Globe } from "lucide-react";
import { motion } from "framer-motion";
import MicInput from "@/components/MicInput";
import { toast } from "sonner";

const genres = ["Sertanejo", "Gospel", "Pop", "Rock", "Trap", "Funk", "MPB", "Rap", "R&B", "Soul", "Samba", "Samba Rock", "Pagode"];
const themeSuggestions = ["amor", "superação", "história", "vida", "traição", "motivação"];

const SUNO_REFERRAL = "https://suno.com/invite/@vibrantsaturation527";

// Map known artist names to musical characteristics
function sanitizeArtistReferences(text: string): string {
  const artistMap: Record<string, string> = {
    "almir sater": "folk brasileiro rural com voz masculina grave, quente e levemente rouca, viola caipira e violão acústico, narrativa calma e poética, atmosfera nostálgica do campo, ritmo lento e contemplativo, instrumentação folk tradicional brasileira",
    "gusttavo lima": "sertanejo moderno com voz masculina grave e potente, textura vocal aveludada e sensual, violão marcante, batida rítmica animada, refrão emocional e envolvente, atmosfera festiva e romântica, tempo médio-rápido",
    "adele": "pop soul com voz feminina potente e dramática, textura vocal rica e encorpada, piano emocional, crescendo orquestral dramático, atmosfera intensa e melancólica, balada com progressão dinâmica, ritmo lento a moderado",
    "marília mendonça": "sertanejo sofrência com voz feminina emocional e rasgada, textura vocal crua e expressiva, violão acústico forte, letra de dor e superação, atmosfera melancólica com energia, ritmo moderado",
    "jorge e mateus": "sertanejo universitário com harmonia vocal dupla masculina, textura vocal suave e afinada, batida animada e dançante, violão e teclado, atmosfera festiva e romântica, ritmo médio-rápido",
    "jorge & mateus": "sertanejo universitário com harmonia vocal dupla masculina, textura vocal suave e afinada, batida animada e dançante, violão e teclado, atmosfera festiva e romântica, ritmo médio-rápido",
    "anavitória": "pop folk brasileiro com vocais femininos suaves e harmoniosos, textura vocal leve e delicada, violão acústico fingerstyle, atmosfera intimista e acolhedora, ritmo calmo e orgânico",
    "henrique e juliano": "sertanejo moderno com voz masculina marcante e grave, textura vocal encorpada, arranjo eletrônico com violão, atmosfera romântica e festiva, ritmo médio-rápido e dançante",
    "henrique & juliano": "sertanejo moderno com voz masculina marcante e grave, textura vocal encorpada, arranjo eletrônico com violão, atmosfera romântica e festiva, ritmo médio-rápido e dançante",
    "luísa sonza": "pop brasileiro dançante com vocais femininos agudos e sensuais, textura vocal moderna e processada, batida eletrônica pesada, sintetizadores, atmosfera energética e ousada, ritmo rápido e dançante",
    "anitta": "pop funk brasileiro com vocais femininos sensuais e confiantes, textura vocal versátil e rítmica, batida pesada com 808, percussão latina, atmosfera quente e provocante, ritmo rápido e contagiante",
    "drake": "hip hop melódico com vocais masculinos suaves e introspectivos, textura vocal nasalada e emotiva, produção atmosférica com pads etéreos, 808 sub-bass, atmosfera noturna e melancólica, ritmo moderado e fluido",
    "taylor swift": "pop com narrativa lírica detalhada, vocais femininos claros e expressivos, textura vocal limpa e juvenil, melodia cativante, violão acústico e produção polida, atmosfera emocional e confessional, ritmo variado",
    "ed sheeran": "pop acústico com voz masculina suave e calorosa, textura vocal levemente rouca e íntima, violão fingerstyle, loop pedal, atmosfera romântica e pessoal, ritmo moderado e groovy",
    "billie eilish": "pop alternativo minimalista com vocais sussurrados e íntimos, textura vocal etérea e ASMR, graves profundos e sub-bass, produção experimental e sombria, atmosfera misteriosa e introspectiva, ritmo lento e hipnótico",
    "the weeknd": "pop moderno synthwave com vocais masculinos falsete suaves, textura vocal sedosa e melancólica, sintetizadores retrô e batida eletrônica, atmosfera noturna e cinematográfica, ritmo médio e pulsante",
    "bruno mars": "pop funk retrô com vocais masculinos vibrantes e potentes, textura vocal brilhante e dinâmica, metais e guitarra funk, groove dançante irresistível, atmosfera festiva e alegre, ritmo rápido e groovy",
    "coldplay": "rock alternativo atmosférico com vocais masculinos emotivos e etéreos, textura vocal suave e esperançosa, sintetizadores e piano, guitarras com delay, atmosfera épica e inspiradora, ritmo moderado e crescente",
    "linkin park": "rock alternativo com vocais masculinos intensos e agressivos, textura vocal rasgada alternando com melodia limpa, guitarras pesadas distorcidas, elementos eletrônicos, atmosfera angustiada e poderosa, ritmo rápido e enérgico",
    "beyoncé": "r&b pop com voz feminina poderosa e virtuosa, textura vocal rica com melismas e runs, arranjos elaborados com metais e cordas, atmosfera grandiosa e empoderada, ritmo variado e groovy",
    "michael jackson": "pop dançante com vocais masculinos expressivos e ágeis, textura vocal brilhante e elétrica, groove funk irresistível, sintetizadores e baixo marcante, atmosfera energética e teatral, ritmo rápido e dançante",
    "luan santana": "sertanejo romântico com voz masculina suave e aguda, textura vocal doce e juvenil, melodia envolvente com violão e teclado, atmosfera romântica e apaixonada, ritmo moderado e melódico",
    "zé neto e cristiano": "sertanejo sofrência com vocais masculinos emotivos e rasgados, textura vocal crua e intensa, violão forte e percussão marcante, atmosfera de bar e desabafo emocional, ritmo moderado",
    "maiara e maraisa": "sertanejo feminino com harmonia vocal dupla potente, textura vocal encorpada e emotiva, violão acústico e arranjo moderno, atmosfera de empoderamento e dor, ritmo moderado",
    "alok": "eletrônica brasileira com melodia cativante e vocal processado, textura vocal etérea com vocoder, batida house e bass drops, sintetizadores envolventes, atmosfera eufórica e festiva, ritmo rápido e dançante",
    "post malone": "pop rock melódico com vocais masculinos rasgados e emotivos, textura vocal nasalada e vulnerável, guitarra acústica com produção trap, atmosfera melancólica e descontraída, ritmo moderado",
    "dua lipa": "pop dançante disco com vocais femininos fortes e confiantes, textura vocal grave e sensual, batida disco moderna e baixo groovy, atmosfera glamorosa e noturna, ritmo rápido e dançante",
    "ariana grande": "pop com vocais femininos agudos e virtuosos, textura vocal leve com whistle notes, produção polida com trap beats, atmosfera doce e dramática, ritmo moderado a rápido",
    "kendrick lamar": "hip hop lírico com flow complexo e rítmico, textura vocal variada e teatral, produção experimental com jazz e funk, atmosfera introspectiva e provocativa, ritmo variado e dinâmico",
    "bad bunny": "reggaeton e trap latino com vocais masculinos nasalados e rítmicos, textura vocal descontraída e melódica, dembow e 808 bass, atmosfera tropical e urbana, ritmo contagiante e dançante",
    "rihanna": "pop r&b com vocais femininos versáteis e marcantes, textura vocal grave e sensual, produção cinematográfica com baixo pesado, atmosfera ousada e sofisticada, ritmo moderado a rápido",
    "eminem": "rap veloz com vocais masculinos intensos e agressivos, textura vocal nasal e cortante, letras complexas com flow acelerado, produção dramática com piano e orquestra, atmosfera intensa e provocativa, ritmo rápido",
    "lady gaga": "pop artístico com vocais femininos dramáticos e potentes, textura vocal teatral e versátil, produção ousada e eletrônica, sintetizadores e batida pesada, atmosfera extravagante e emotiva, ritmo variado",
    "sia": "pop emocional com vocais femininos poderosos e rasgados, textura vocal crua e intensa com vibrato, melodia marcante e produção minimalista crescente, atmosfera catártica e inspiradora, ritmo moderado",
    "imagine dragons": "rock alternativo com percussão tribal forte e refrão épico, vocais masculinos potentes e grandiosos, textura vocal encorpada e dramática, sintetizadores e bateria pesada, atmosfera monumental e motivacional, ritmo médio-rápido",
    "maroon 5": "pop rock com vocais masculinos suaves e falsete, textura vocal leve e sedutora, guitarra funk leve e produção pop moderna, atmosfera romântica e groovy, ritmo moderado e dançante",
    "sam smith": "pop emocional com vocais masculinos altos e emotivos, textura vocal aveludada e vulnerável, arranjo minimalista com piano e cordas, atmosfera melancólica e intimista, ritmo lento e delicado",
    "chitãozinho e xororó": "sertanejo raiz com harmonia vocal dupla masculina potente, textura vocal encorpada e vibrante, viola caipira e violão, atmosfera romântica e nostálgica do campo, ritmo moderado e cadenciado",
    "roberto carlos": "MPB romântico com voz masculina suave e aveludada, textura vocal quente e gentil, orquestra com cordas e piano, atmosfera romântica e elegante, ritmo lento e melódico",
    "caetano veloso": "MPB tropicalista com voz masculina suave e nasalada, textura vocal delicada e poética, violão nylon e arranjos sofisticados, atmosfera intelectual e contemplativa, ritmo variado e orgânico",
    "gilberto gil": "MPB com influências africanas e tropicais, voz masculina calorosa e rítmica, textura vocal alegre e expressiva, violão e percussão afro-brasileira, atmosfera festiva e espiritual, ritmo animado e groovy",
    "ivete sangalo": "axé pop com voz feminina potente e extrovertida, textura vocal brilhante e festiva, percussão baiana e metais, guitarra e teclado, atmosfera carnavalesca e contagiante, ritmo rápido e dançante",
    "djavan": "MPB sofisticado com voz masculina suave e jazzy, textura vocal refinada e melismática, harmonia complexa com violão e piano, atmosfera sensual e elegante, ritmo moderado e groovy",
    "ana carolina": "MPB pop com voz feminina potente e rouca, textura vocal intensa e emocional, violão acústico e piano, atmosfera confessional e dramática, ritmo moderado",
    "legião urbana": "rock brasileiro com vocais masculinos reflexivos e melancólicos, textura vocal limpa e poética, guitarra e baixo marcantes, letras profundas e sociais, atmosfera nostálgica e revolucionária, ritmo moderado",
    "sandy": "pop brasileiro com voz feminina aguda e técnica, textura vocal cristalina e precisa, produção polida com teclado e violão, atmosfera romântica e sofisticada, ritmo moderado",
    "thiaguinho": "pagode pop com voz masculina suave e afinada, textura vocal doce e romântica, cavaquinho e percussão de pagode, atmosfera alegre e apaixonada, ritmo moderado e groovy",
    "zeca pagodinho": "samba tradicional carioca com voz masculina descontraída e calorosa, textura vocal macia e emotiva, cavaquinho, pandeiro e tantã, atmosfera boêmia e festiva, ritmo sincopado e swingado",
    "beth carvalho": "samba de raiz com voz feminina potente e emotiva, textura vocal encorpada e tradicional, cavaquinho e violão de 7 cordas, percussão completa de samba, atmosfera autêntica e apaixonada, ritmo cadenciado",
    "martinho da vila": "samba com influências africanas, voz masculina grave e narrativa, textura vocal profunda e storytelling, cavaquinho e atabaques, atmosfera cultural e reflexiva, ritmo moderado e balançado",
    "alcione": "samba romântico com voz feminina rouca e potente, textura vocal grave e marcante, pandeiro e tantã, atmosfera nostálgica e intensa, ritmo médio e emotivo",
    "diogo nogueira": "samba moderno carioca com voz masculina suave e apaixonada, textura vocal aveludada e romântica, cavaquinho e percussão swingada, atmosfera boêmia e envolvente, ritmo groovy",
    "arlindo cruz": "samba partido-alto com voz masculina vibrante e alegre, textura vocal rítmica e festiva, cavaquinho rápido e pandeiro marcante, atmosfera celebrativa e contagiante, ritmo acelerado",
    "jorge aragão": "samba romântico com voz masculina aveludada e emotiva, textura vocal suave e sofisticada, violão de 7 cordas e cavaquinho delicado, atmosfera intimista e apaixonada, ritmo moderado",
    "seu jorge": "samba soul com voz masculina rouca e expressiva, textura vocal crua alternando samba e soul, violão acústico e percussão leve, atmosfera descontraída e orgânica, ritmo moderado",
    "paulinho da viola": "samba tradicional refinado com voz masculina suave e melancólica, textura vocal delicada e poética, cavaquinho intimista e violão de 7 cordas, atmosfera nostálgica e contemplativa, ritmo lento",
    "cartola": "samba canção com voz masculina suave e lírica, textura vocal etérea e romântica, violão e cavaquinho minimalistas, atmosfera poética e melancólica, ritmo lento e cadenciado",
    "bezerra da silva": "samba malandro com voz masculina rouca e irreverente, textura vocal crua e autêntica, cavaquinho e surdo marcante, atmosfera de subúrbio carioca e malícia, ritmo swingado",
    "fundo de quintal": "samba de raiz com harmonias vocais masculinas, textura vocal rica e tradicional, banjo cavaquinho e tantã, repique de mão, atmosfera autêntica de roda de samba, ritmo cadenciado e balançado",
    "grupo revelação": "pagode romântico com harmonia vocal masculina suave, textura vocal melódica e apaixonada, banjo e tantã, percussão de pagode 90, atmosfera romântica e festiva, ritmo groovy",
    "exaltasamba": "pagode baiano com vocais masculinos potentes e harmonia rica, textura vocal encorpada e emotiva, percussão marcante e cavaquinho, atmosfera festiva e apaixonada, ritmo animado",
    "raça negra": "pagode romântico com voz masculina suave e melódica, textura vocal doce e nostálgica, teclado e percussão leve, atmosfera romântica anos 90, ritmo moderado e cadenciado",
    "art popular": "pagode paulista com voz masculina potente e alegre, textura vocal vibrante e festiva, banjo e tantã marcantes, atmosfera celebrativa e contagiante, ritmo acelerado e dançante",
    "ludmilla": "funk pop brasileiro com voz feminina potente e versátil, textura vocal forte e rítmica, batida funk e eletrônica, atmosfera empoderada e dançante, ritmo rápido",
    "projota": "rap pop brasileiro com vocais masculinos melódicos e emotivos, textura vocal suave alternando com flow rápido, violão e batida hip hop, atmosfera reflexiva e esperançosa, ritmo moderado",
    "péricles": "pagode romântico com voz masculina grave e aveludada, textura vocal encorpada e suave, cavaquinho e tantã, atmosfera romântica e noturna, ritmo cadenciado e groovy",
    "alanis morissette": "rock alternativo com voz feminina potente e raivosa, textura vocal crua e catártica com grito emocional, guitarra distorcida e bateria agressiva, atmosfera angustiada e libertadora, ritmo médio-rápido e intenso",
    "whitney houston": "pop soul com voz feminina extraordinariamente potente e virtuosa, textura vocal brilhante com melismas elaborados, arranjo orquestral e piano, atmosfera grandiosa e emotiva, ritmo moderado e dramático",
    "stevie wonder": "soul funk com voz masculina calorosa e jubilosa, textura vocal expressiva e melismática, harmonica, clavinet e sintetizadores, groove funk irresistível, atmosfera alegre e espiritual, ritmo groovy e dançante",
    "james brown": "funk soul com voz masculina gritada e enérgica, textura vocal rasgada e rítmica, metais potentes e guitarra funk, groove pesado e dançante, atmosfera explosiva e festiva, ritmo rápido e sincopado",
    "aretha franklin": "soul gospel com voz feminina poderosa e espiritual, textura vocal rica com runs vocais intensos, piano e órgão, metais e coro gospel, atmosfera empoderada e emocional, ritmo moderado e groovy",
    "ray charles": "soul blues com voz masculina rouca e emotiva, textura vocal profunda e apaixonada, piano e órgão hammond, metais e cordas, atmosfera nostálgica e calorosa, ritmo moderado e swingado",
    "marvin gaye": "soul romântico com voz masculina suave e sedutora, textura vocal aveludada e sensual, baixo groovy e cordas exuberantes, atmosfera íntima e apaixonada, ritmo lento e envolvente",
    "lauryn hill": "hip hop soul com voz feminina potente e melódica, textura vocal quente alternando entre canto e rap, violão acústico e batida hip hop, atmosfera consciente e espiritual, ritmo moderado e orgânico",
    "tupac": "rap west coast com vocais masculinos intensos e emotivos, textura vocal grave e apaixonada, flow rítmico e poético, piano melancólico e batida boom bap, atmosfera revolucionária e vulnerável, ritmo moderado",
    "2pac": "rap west coast com vocais masculinos intensos e emotivos, textura vocal grave e apaixonada, flow rítmico e poético, piano melancólico e batida boom bap, atmosfera revolucionária e vulnerável, ritmo moderado",
    "notorious big": "rap east coast com voz masculina grave e imponente, textura vocal profunda e fluida, flow relaxado e storytelling, samples de jazz e soul, atmosfera urbana e cinematográfica, ritmo moderado e groovy",
    "biggie": "rap east coast com voz masculina grave e imponente, textura vocal profunda e fluida, flow relaxado e storytelling, samples de jazz e soul, atmosfera urbana e cinematográfica, ritmo moderado e groovy",
    "snoop dogg": "g-funk rap com voz masculina relaxada e nasalada, textura vocal suave e descontraída, sintetizadores funky e batida west coast, atmosfera chill e festiva, ritmo moderado e groovy",
    "jay-z": "hip hop com voz masculina confiante e rítmica, textura vocal grave e assertiva, flow preciso e sofisticado, produção polida com samples soul, atmosfera imponente e luxuosa, ritmo médio-rápido",
    "kanye west": "hip hop experimental com vocais masculinos emotivos e autotune, textura vocal crua e vulnerável, produção inovadora com samples soul e sintetizadores, atmosfera grandiosa e introspectiva, ritmo variado",
    "john legend": "r&b soul com voz masculina suave e romântica, textura vocal aveludada e emotiva, piano elegante e cordas, atmosfera sofisticada e apaixonada, ritmo lento e intimista",
    "alicia keys": "r&b soul com voz feminina potente e emotiva, textura vocal calorosa e gospel, piano como instrumento principal, atmosfera empoderada e intimista, ritmo moderado e groovy",
    "usher": "r&b pop com voz masculina suave e sensual, textura vocal falsete e rítmica, batida dançante e produção polida, atmosfera sedutora e festiva, ritmo médio-rápido e dançante",
    "chris brown": "r&b pop com voz masculina ágil e melódica, textura vocal suave com runs rápidos, batida trap e r&b moderno, atmosfera romântica e urbana, ritmo moderado a rápido",
    "frank ocean": "r&b alternativo com voz masculina suave e etérea, textura vocal delicada e introspectiva, produção minimalista com sintetizadores e piano, atmosfera melancólica e onírica, ritmo lento e flutuante",
    "sza": "r&b alternativo com voz feminina suave e expressiva, textura vocal airy e emotiva, produção neo-soul com batida trap, atmosfera vulnerável e sensual, ritmo moderado e orgânico",
    "freddie mercury": "rock operístico com voz masculina extraordinariamente potente e versátil, textura vocal dramática com extensão ampla, guitarra pesada e piano, coro épico, atmosfera teatral e grandiosa, ritmo variado e dinâmico",
    "elvis presley": "rock and roll clássico com voz masculina grave e carismática, textura vocal calorosa e vibrante, guitarra acústica e elétrica, contrabaixo e bateria, atmosfera nostálgica e sensual, ritmo médio-rápido e swingado",
    "amy winehouse": "jazz soul com voz feminina rouca e profunda, textura vocal crua e emotiva com influência vintage, contrabaixo e bateria jazz, metais e guitarra, atmosfera melancólica e boêmia, ritmo moderado e swingado",
    "cardi b": "hip hop trap com voz feminina agressiva e carismática, textura vocal rítmica e assertiva, 808 bass pesado e hi-hats rápidos, atmosfera ousada e dominante, ritmo rápido",
    "nicki minaj": "hip hop pop com voz feminina versátil e teatral, textura vocal alternando entre rap agressivo e canto melódico, produção eletrônica pesada, atmosfera extravagante e poderosa, ritmo rápido",
    "travis scott": "trap psicodélico com vocais masculinos processados com autotune, textura vocal etérea e hipnótica, 808 bass massivo e reverb pesado, atmosfera sombria e espacial, ritmo moderado e pesado",
    "50 cent": "hip hop g-unit com voz masculina grave e rítmica, textura vocal rouca e assertiva, batida pesada com piano dramático, atmosfera street e intensa, ritmo moderado e pesado",
    "bon jovi": "rock arena com voz masculina potente e rasgada, textura vocal brilhante e épica, guitarra elétrica com riffs marcantes e solo, teclado e bateria pesada, atmosfera grandiosa e anthêmica, ritmo médio-rápido e enérgico",
    "jon bon jovi": "rock arena com voz masculina potente e rasgada, textura vocal brilhante e épica, guitarra elétrica com riffs marcantes e solo, teclado e bateria pesada, atmosfera grandiosa e anthêmica, ritmo médio-rápido e enérgico",
    "axl rose": "hard rock com voz masculina aguda e rasgada, textura vocal agressiva com grito potente e extensão ampla, guitarras pesadas com riffs icônicos, bateria poderosa, atmosfera rebelde e intensa, ritmo rápido e explosivo",
    "guns n roses": "hard rock com vocais masculinos agudos e rasgados, guitarras pesadas com solos virtuosos, baixo e bateria potentes, atmosfera rebelde e selvagem, ritmo rápido e energético",
    "mike patton": "rock experimental com voz masculina extremamente versátil, textura vocal que alterna entre gutural grave e agudo operístico, guitarras pesadas e arranjos experimentais, atmosfera caótica e teatral, ritmo variado e imprevisível",
    "faith no more": "rock alternativo experimental com vocais masculinos versáteis e teatrais, textura vocal que mistura canto lírico com agressividade, guitarra pesada e teclado, atmosfera eclética e intensa, ritmo variado",
    "kurt cobain": "grunge com voz masculina rouca e angustiada, textura vocal crua e vulnerável com grito emocional, guitarra distorcida com feedback, bateria pesada e simples, atmosfera melancólica e explosiva, ritmo moderado a rápido",
    "nirvana": "grunge com vocais masculinos roucos e angustiados, guitarra distorcida pesada, baixo potente e bateria agressiva, dinâmica quieto-alto, atmosfera sombria e catártica, ritmo moderado a rápido",
    "dave grohl": "rock alternativo com voz masculina potente e enérgica, textura vocal rouca e apaixonada, guitarras pesadas e melódicas, bateria poderosa, atmosfera otimista e intensa, ritmo rápido e energético",
    "foo fighters": "rock alternativo com vocais masculinos potentes e melódicos, guitarras pesadas com melodias cativantes, bateria enérgica, atmosfera empolgante e emotiva, ritmo rápido e dinâmico",
    "eddie vedder": "grunge rock com voz masculina grave e barítono, textura vocal profunda e emotiva, guitarra acústica e elétrica, atmosfera introspectiva e visceral, ritmo moderado e intenso",
    "pearl jam": "grunge rock com vocais masculinos graves e emotivos, guitarras alternando entre acústico e distorcido, baixo marcante e bateria dinâmica, atmosfera reflexiva e poderosa, ritmo moderado",
    "james hetfield": "thrash metal com voz masculina agressiva e rítmica, textura vocal grave e potente com grito, guitarras pesadas com riffs complexos, bateria rápida, atmosfera sombria e poderosa, ritmo rápido e pesado",
    "metallica": "thrash metal com vocais masculinos agressivos, guitarras pesadas com riffs técnicos e solos virtuosos, baixo e bateria acelerados, atmosfera épica e sombria, ritmo rápido",
    "robert plant": "rock clássico com voz masculina aguda e bluesy, textura vocal potente e sensual com vibrato, guitarra elétrica com riffs lendários, bateria pesada e groove, atmosfera mística e poderosa, ritmo variado",
    "led zeppelin": "rock clássico com vocais masculinos agudos e expressivos, guitarra elétrica virtuosa e riffs pesados, bateria tribal e groove pesado, atmosfera épica e mística, ritmo variado e dinâmico",
    "steven tyler": "hard rock com voz masculina aguda e rasgada, textura vocal vibrante e elástica, guitarra com riffs groovy e solo, atmosfera festiva e selvagem, ritmo médio-rápido e groovy",
    "aerosmith": "hard rock com vocais masculinos agudos e carismáticos, guitarras com riffs blues rock e solos, groove pesado e bateria potente, atmosfera festiva e energética, ritmo médio-rápido",
    "ozzy osbourne": "heavy metal com voz masculina aguda e sombria, textura vocal nasal e dramática, guitarras pesadas com riffs marcantes, atmosfera obscura e teatral, ritmo moderado a rápido",
    "black sabbath": "heavy metal com vocais masculinos sombrios e nasais, guitarras pesadas e doom, baixo pesado e bateria tribal, atmosfera obscura e apocalíptica, ritmo lento a moderado e pesado",
    "chris cornell": "rock alternativo grunge com voz masculina potente e extensão vocal ampla, textura vocal rouca e emotiva com falsete poderoso, guitarra pesada e acústica, atmosfera melancólica e épica, ritmo variado",
    "soundgarden": "grunge metal com vocais masculinos potentes e roucos, guitarras em afinação alternativa pesada, bateria complexa e pesada, atmosfera sombria e psicadélica, ritmo variado e pesado",
    "bono": "rock alternativo com voz masculina emotiva e épica, textura vocal brilhante e passional, guitarra com efeitos e delay, atmosfera grandiosa e espiritual, ritmo moderado e crescente",
    "u2": "rock alternativo com vocais masculinos emotivos e épicos, guitarra com efeitos atmosféricos, baixo pulsante e bateria dinâmica, atmosfera grandiosa e inspiradora, ritmo moderado",
    "mick jagger": "rock blues com voz masculina provocante e carismática, textura vocal nasalada e rítmica, guitarra blues rock e harmonica, atmosfera rebelde e festiva, ritmo médio-rápido e groovy",
    "rolling stones": "rock blues com vocais masculinos carismáticos e provocantes, guitarra blues rock com riffs icônicos, groove pesado e bateria rock, atmosfera rebelde e clássica, ritmo médio-rápido",
    // Gospel nacional
    "fernandinho": "gospel worship com voz masculina potente e apaixonada, textura vocal intensa e espiritual, guitarra elétrica e acústica, bateria enérgica e teclado atmosférico, coro congregacional, atmosfera de adoração fervorosa e avivamento, ritmo moderado a rápido",
    "aline barros": "gospel pop com voz feminina potente e cristalina, textura vocal doce e virtuosa com melismas, teclado e orquestra, coro infantil e adulto, atmosfera de louvor alegre e inspiradora, ritmo moderado e melódico",
    "anderson freire": "gospel emocional com voz masculina potente e rasgada, textura vocal intensa e dramática, piano e cordas cinematográficas, atmosfera de adoração profunda e entrega, ritmo lento a moderado e crescente",
    "bruna karla": "gospel devocional com voz feminina suave e emotiva, textura vocal delicada e espiritual, piano e violão acústico, atmosfera de oração íntima e contemplativa, ritmo lento e sereno",
    "gabriela rocha": "gospel worship moderno com voz feminina potente e etérea, textura vocal limpa e emotiva com falsete, produção contemporânea com pads e guitarra, atmosfera celestial e envolvente, ritmo moderado e atmosférico",
    "thalles roberto": "gospel pop rock com voz masculina enérgica e carismática, textura vocal vibrante e festiva, guitarra elétrica e bateria pesada, atmosfera de celebração e alegria, ritmo rápido e contagiante",
    "eli soares": "gospel soul com voz masculina grave e aveludada, textura vocal sofisticada e jazzy, piano e baixo groovy, atmosfera intimista e espiritual, ritmo moderado e suave",
    "nívea soares": "gospel worship com voz feminina potente e profética, textura vocal intensa e ungida, teclado e guitarra atmosférica, coro de adoração, atmosfera de avivamento e reverência, ritmo moderado e crescente",
    "isadora pompeo": "gospel pop jovem com voz feminina doce e moderna, textura vocal leve e acessível, produção pop contemporânea com sintetizadores, atmosfera positiva e esperançosa, ritmo moderado e dançante",
    "marina de oliveira": "gospel clássico com voz feminina lírica e potente, textura vocal operística e grandiosa, orquestra e piano, atmosfera majestosa e emocional, ritmo moderado e dramático",
    "rodolfo abrantes": "gospel rock com voz masculina intensa e rasgada, textura vocal crua e visceral com influência punk rock, guitarra distorcida e bateria pesada, atmosfera de adoração radical e apaixonada, ritmo rápido e enérgico",
  };

  let result = text;
  for (const [artist, description] of Object.entries(artistMap)) {
    const regex = new RegExp(`\\b${artist}\\b`, "gi");
    result = result.replace(regex, description);
  }
  result = result.replace(/(?:estilo|inspirado em|como|tipo)\s+[A-Z][a-záéíóúãõê]+(?:\s+(?:e|&)\s+[A-Z][a-záéíóúãõê]+)?/gi, () => {
    return "estilo característico com elementos vocais e instrumentais marcantes";
  });

  const safeWords = new Set([
    "portuguese", "full", "style", "title", "verso", "refrão", "ponte",
    "intro", "outro", "chorus", "bridge", "verse", "pop", "rock", "funk",
    "trap", "mpb", "gospel", "sertanejo", "rap", "hip", "hop",
    "jazz", "blues", "reggae", "reggaeton", "country", "folk", "indie",
    "metal", "punk", "soul", "disco", "house", "techno", "eletrônica",
    "acústico", "acústica", "romântico", "romântica", "emocional",
    "melancólico", "melancólica", "animado", "animada", "dramático",
    "dramática", "moderno", "moderna", "clássico", "clássica",
  ]);

  result = result.replace(/\b([A-Z][a-záéíóúãõêâîôûàèìòùäëïöü]+)\b/g, (match) => {
    if (safeWords.has(match.toLowerCase())) return match;
    return "";
  });

  result = result.replace(/\b(?:DJ|MC|Mc|Dj)\s+\S+/gi, "");
  result = result.replace(/@\S+/g, "");
  result = result.replace(/\s{2,}/g, " ").trim();

  return result;
}

const genreDetails: Record<string, string> = {
  "Sertanejo": "acoustic guitar, viola caipira, accordion, bass, drums, emotional male/female vocals, country-style harmonies, rhythmic groove, sertanejo universitário vibe",
  "Gospel": "piano, organ, choir harmonies, bass guitar, drums, uplifting strings, powerful vocals, worship atmosphere, spiritual intensity",
  "Pop": "synth pads, electric guitar, bass, programmed drums, catchy hooks, layered vocals, polished production, modern pop arrangement",
  "Rock": "distorted electric guitars, bass guitar, powerful drums, crash cymbals, raw vocals, guitar solo, driving rhythm, high energy",
  "Trap": "808 bass, hi-hats, snare rolls, dark synths, autotune vocals, ad-libs, heavy sub-bass, atmospheric pads, modern trap production",
  "Funk": "funk carioca beat, bass-heavy 808, atabaque percussion, shaker, MC-style vocals, rhythmic flow, Brazilian funk groove",
  "MPB": "nylon guitar, piano, flute, light percussion, smooth bass, poetic vocals, bossa nova influence, sophisticated harmony, Brazilian rhythms",
  "Rap": "boom bap drums, 808 bass, hi-hats, scratching, aggressive vocal delivery, complex rhyme schemes, sampled loops, raw lyrical flow, hip hop production",
  "R&B": "smooth bass, Rhodes piano, lush pads, finger snaps, silky vocals, layered harmonies, sensual groove, modern R&B production, slow jam atmosphere",
  "Soul": "organ, brass section, warm bass, gospel-influenced vocals, hand claps, tambourine, powerful emotional delivery, vintage soul warmth, Motown-inspired groove",
};

function buildSunoPrompt(genero: string, tema: string, titulo: string, estilo: string, language: string): string {
  const sanitizedEstilo = estilo ? sanitizeArtistReferences(estilo) : "";
  const instruments = genreDetails[genero] || "full band arrangement";
  const langLabel = language === "en" ? "English" : "Portuguese";
  
  let prompt = `${genero}, ${tema}, emotional depth, ${langLabel} lyrics. Title: "${titulo}". `;
  prompt += `Instruments and production: ${instruments}. `;
  prompt += `Song structure: intro, verse 1, pre-chorus build, powerful chorus, verse 2 with variation, chorus with harmonies, emotional bridge, final chorus with full arrangement, outro. `;
  if (sanitizedEstilo) prompt += `Vocal style and mood: ${sanitizedEstilo}. `;
  prompt += `Dynamic progression from intimate verses to anthemic chorus. Rich layering, professional mixing, radio-ready quality.`;

  if (prompt.length > 1000) {
    prompt = `${genero}, ${tema}, ${langLabel}. "${titulo}". ${instruments}. `;
    if (sanitizedEstilo && prompt.length + sanitizedEstilo.length + 10 < 1000) {
      prompt += `${sanitizedEstilo}. `;
    }
    prompt += `Verse-chorus-bridge, dynamic, professional production.`;
  }

  return prompt.slice(0, 1000);
}

export default function CriadorMusica() {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [tema, setTema] = useState("");
  const [estilo, setEstilo] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [sunoPrompt, setSunoPrompt] = useState("");
  const [showSunoPrompt, setShowSunoPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"pt" | "en">("pt");
  const [improveLyricsMode, setImproveLyricsMode] = useState(false);
  const [userLyrics, setUserLyrics] = useState("");
  const [improvedLyrics, setImprovedLyrics] = useState("");
  const [improvingLoading, setImprovingLoading] = useState(false);

  const generateLyrics = async () => {
    if (!titulo || !genero || !tema) {
      toast.error("Preencha o título, gênero e tema.");
      return;
    }
    setLoading(true);
    setLyrics("");
    setShowSunoPrompt(false);
    setSunoPrompt("");

    const langInstruction = language === "en"
      ? "Write the lyrics entirely in English."
      : "Escreva a letra inteiramente em português.";

    const prompt = language === "en"
      ? `Create a complete song lyrics in English with the following information:
Title: ${titulo}
Musical genre: ${genero}
Theme: ${tema}
${estilo ? `Style or inspiration: ${sanitizeArtistReferences(estilo)}` : ""}

The lyrics should follow this structure:
[Title]
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Final Chorus]

The lyrics must perfectly match the ${genero} genre and the theme "${tema}". Use natural language, rhymes and emotion. Write only the lyrics, no explanations.`
      : `Crie uma letra de música completa em português com as seguintes informações:
Título: ${titulo}
Gênero musical: ${genero}
Tema: ${tema}
${estilo ? `Estilo ou inspiração: ${sanitizeArtistReferences(estilo)}` : ""}

A letra deve seguir esta estrutura:
[Título]
[Verso 1]
[Refrão]
[Verso 2]
[Refrão]
[Ponte]
[Refrão Final]

A letra deve combinar perfeitamente com o gênero ${genero} e o tema "${tema}". Use linguagem natural, rimas e emoção. Escreva apenas a letra, sem explicações.`;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setLyrics(full);
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar a letra. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyLyrics = () => {
    navigator.clipboard.writeText(lyrics);
    toast.success("Letra copiada!");
  };

  const generateSunoPrompt = () => {
    const prompt = buildSunoPrompt(genero, tema, titulo, estilo, language);
    setSunoPrompt(prompt);
    setShowSunoPrompt(true);
  };

  const copySunoPrompt = () => {
    navigator.clipboard.writeText(sunoPrompt);
    toast.success("Prompt para Suno copiado!");
  };

  const improveLyrics = async () => {
    const originalLyrics = userLyrics.trim();

    if (!originalLyrics) {
      toast.error("Digite a letra que você deseja melhorar.");
      return;
    }

    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    const calculateSimilarity = (a: string, b: string) => {
      const aWords = new Set(normalizeText(a).split(" ").filter(Boolean));
      const bWords = new Set(normalizeText(b).split(" ").filter(Boolean));

      if (aWords.size === 0 || bWords.size === 0) return 0;

      let intersection = 0;
      aWords.forEach((word) => {
        if (bWords.has(word)) intersection += 1;
      });

      return intersection / Math.max(aWords.size, bWords.size);
    };

    const streamImprovedLyrics = async (extraInstruction: string) => {
      const prompt = language === "en"
        ? `Improve and refine the following song lyrics. Keep the original theme and message, but rewrite with clear creative changes.

Requirements:
- Improve rhymes and emotional impact
- Improve flow, rhythm, and structure
- Rewrite at least 60% of the lines with fresh wording
- Do not keep long identical phrases from the original
${extraInstruction}

Original lyrics:
${originalLyrics}

Return only the improved lyrics with markers like [Verse 1], [Chorus], etc. No explanations.`
        : `Melhore e refine a seguinte letra de música. Mantenha o tema e a mensagem original, mas reescreva com mudanças criativas claras.

Regras obrigatórias:
- Melhorar rimas e impacto emocional
- Melhorar fluidez, ritmo e estrutura
- Reescrever pelo menos 60% dos versos com nova construção
- Não manter frases longas idênticas da versão original
${extraInstruction}

Letra original:
${originalLyrics}

Retorne apenas a letra melhorada com marcadores como [Verso 1], [Refrão], etc. Sem explicações.`;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setImprovedLyrics(full);
            }
          } catch {
            // ignore malformed stream chunk
          }
        }
      }

      return full.trim();
    };

    setImprovingLoading(true);
    setImprovedLyrics("");

    try {
      const firstResult = await streamImprovedLyrics("");
      const similarity = calculateSimilarity(originalLyrics, firstResult);

      if (similarity >= 0.9) {
        setImprovedLyrics("");
        const secondResult = await streamImprovedLyrics(
          language === "en"
            ? "IMPORTANT: The previous version was too similar. Rewrite with clearly different phrasing while preserving meaning."
            : "IMPORTANTE: a versão anterior ficou muito parecida. Reescreva com frases claramente diferentes, mantendo o mesmo sentido."
        );

        if (calculateSimilarity(originalLyrics, secondResult) >= 0.9) {
          toast.warning("A IA manteve muita semelhança. Tente adicionar mais contexto para uma reescrita mais profunda.");
        } else {
          toast.success("Letra melhorada com sucesso!");
        }
      } else {
        toast.success("Letra melhorada com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao melhorar a letra. Tente novamente.");
    } finally {
      setImprovingLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Gerador de Letras de <span className="text-primary text-glow-cyan">Música com IA</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Crie letras de música rapidamente usando inteligência artificial. Escolha o gênero musical, defina o tema e gere uma letra completa em segundos. Depois utilize o prompt gerado para criar sua música no Suno.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Configurar Música
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language selector */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Idioma da letra
                  </label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as "pt" | "en")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Título da música</label>
                  <div className="relative">
                    <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Coração de Aço" className="pr-10" />
                    <MicInput onTranscript={t => setTitulo(prev => prev ? prev + " " + t : t)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Gênero musical</label>
                  <Select value={genero} onValueChange={setGenero}>
                    <SelectTrigger><SelectValue placeholder="Selecione o gênero" /></SelectTrigger>
                    <SelectContent>
                      {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Tema da música</label>
                  <div className="relative">
                    <Input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: amor, superação, história, vida, traição, motivação" className="pr-10" />
                    <MicInput onTranscript={t => setTema(prev => prev ? prev + " " + t : t)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {themeSuggestions.map(t => (
                      <button key={t} onClick={() => setTema(t)} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Estilo ou inspiração (opcional)</label>
                  <div className="relative">
                    <Input value={estilo} onChange={e => setEstilo(e.target.value)} placeholder="Ex: sertanejo moderno com voz grave, pop acústico..." className="pr-10" />
                    <MicInput onTranscript={t => setEstilo(prev => prev ? prev + " " + t : t)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={generateLyrics} disabled={loading} className="flex-1 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                    {loading ? "Gerando letra..." : "Gerar letra de música"}
                  </Button>
                  <Button
                    onClick={() => { setTitulo(""); setGenero(""); setTema(""); setEstilo(""); setLyrics(""); setSunoPrompt(""); setShowSunoPrompt(false); }}
                    variant="outline"
                    className="gap-2"
                    disabled={loading}
                  >
                    <RotateCcw className="w-4 h-4" /> Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Improve Lyrics Section */}
            <Card className="mb-8 border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Melhoramos a sua letra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Já tem uma letra pronta? Cole aqui e nossa IA vai aprimorar as rimas, a estrutura, a linguagem poética e o impacto emocional.
                </p>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Cole sua letra aqui</label>
                  <textarea
                    value={userLyrics}
                    onChange={e => setUserLyrics(e.target.value)}
                    placeholder="Cole aqui a letra que você quer melhorar..."
                    className="w-full min-h-[200px] p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={improveLyrics} disabled={improvingLoading} className="flex-1 gap-2 bg-accent hover:bg-accent/90">
                    {improvingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {improvingLoading ? "Melhorando letra..." : "Melhorar minha letra"}
                  </Button>
                  <Button
                    onClick={() => { setUserLyrics(""); setImprovedLyrics(""); }}
                    variant="outline"
                    className="gap-2"
                    disabled={improvingLoading}
                  >
                    <RotateCcw className="w-4 h-4" /> Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {improvedLyrics && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="mb-6 border-accent/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Letra Melhorada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-body">{improvedLyrics}</pre>
                    <div className="mt-4">
                      <Button onClick={() => {
                        navigator.clipboard.writeText(improvedLyrics);
                        toast.success("Letra melhorada copiada!");
                      }} variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" /> Copiar letra melhorada
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {lyrics && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Letra Gerada</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-body">{lyrics}</pre>
                </CardContent>
              </Card>

              {/* Suno CTA Card */}
              <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Transforme sua letra em uma música real
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agora você pode transformar a letra criada em uma música completa utilizando Inteligência Artificial.
                    Com o Suno é possível gerar vocais realistas, escolher diferentes estilos musicais e criar músicas completas em poucos segundos.
                  </p>

                  <h4 className="font-display text-base font-bold text-primary mb-2">Vantagens do Suno Pro</h4>
                  <ul className="text-sm text-foreground space-y-1.5 mb-6 list-none font-medium">
                    <li>• <strong>Acesso ao modelo mais avançado</strong> de geração de músicas (v5)</li>
                    <li>• <strong>2.500 créditos por mês</strong> (até aproximadamente 500 músicas)</li>
                    <li>• <strong>Direitos de uso comercial</strong> para novas músicas criadas</li>
                    <li>• <strong>Recursos avançados</strong> como personas musicais e edição avançada</li>
                    <li>• <strong>Separação da música</strong> em até 12 faixas (vocais e instrumentos)</li>
                    <li>• <strong>Upload de até 8 minutos</strong> de áudio para remix ou continuação</li>
                    <li>• <strong>Adicionar novos vocais ou instrumentos</strong> em músicas já existentes</li>
                    <li>• <strong>Acesso antecipado</strong> a novos recursos da plataforma</li>
                    <li>• <strong>Créditos adicionais</strong> disponíveis para compra quando necessário</li>
                    <li>• <strong>Fila prioritária</strong> para geração de músicas</li>
                    <li>• <strong>Criação de até 10 músicas</strong> simultaneamente</li>
                  </ul>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <Button onClick={copyLyrics} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> Copiar letra
                    </Button>
                    <Button
                      onClick={() => window.open(SUNO_REFERRAL, "_blank")}
                      className="gap-2"
                      style={{ backgroundColor: "hsl(30, 100%, 50%)", color: "white" }}
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir no Suno
                    </Button>
                    <Button onClick={generateSunoPrompt} variant="outline" className="gap-2">
                      ✨ Gerar Prompt para Suno
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    Dica: Usuários do plano Suno Pro podem criar mais músicas por mês, utilizar recursos avançados e gerar faixas com qualidade profissional.
                  </p>
                </CardContent>
              </Card>

              {showSunoPrompt && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Prompt para Suno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground mb-3 font-mono break-all">{sunoPrompt}</div>
                      <p className="text-xs text-muted-foreground mb-3">{sunoPrompt.length}/1000 caracteres</p>
                      <Button onClick={copySunoPrompt} variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" /> Copiar prompt
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
