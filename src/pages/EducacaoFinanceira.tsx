import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calculator, HelpCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, PiggyBank, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const articles = [
  { title: "Como investir com pouco dinheiro", content: "Comece com Tesouro Direto, CDBs de bancos digitais ou fundos de investimento com aportes a partir de R$ 30. O importante é começar cedo e ser consistente. Diversifique entre renda fixa e variável conforme seu perfil de risco." },
  { title: "Entenda a SELIC", content: "A taxa SELIC é a taxa básica de juros da economia brasileira, definida pelo COPOM a cada 45 dias. Ela influencia todas as outras taxas de juros do país, incluindo empréstimos, financiamentos e rendimentos de investimentos em renda fixa." },
  { title: "Reserva de emergência", content: "Mantenha de 3 a 12 meses de despesas em investimentos de alta liquidez, como Tesouro SELIC ou CDBs com liquidez diária. Essa reserva protege você de imprevistos sem precisar recorrer a empréstimos." },
  { title: "Renda fixa vs variável", content: "Renda fixa oferece previsibilidade (CDBs, LCIs, Tesouro). Renda variável (ações, FIIs) tem maior potencial de retorno, mas com mais risco. O ideal é combinar ambas de acordo com seus objetivos e horizonte de tempo." },
  { title: "Introdução a criptomoedas", content: "Criptomoedas são ativos digitais descentralizados. Bitcoin e Ethereum são os mais conhecidos. Invista apenas o que pode perder, use exchanges regulamentadas e nunca compartilhe suas chaves privadas." },
  { title: "5 erros no orçamento pessoal", content: "1) Não acompanhar gastos. 2) Não ter reserva de emergência. 3) Gastar mais do que ganha. 4) Não definir metas. 5) Ignorar pequenos gastos que somados fazem diferença. Organize-se com planilhas ou apps." },
  { title: "Juros compostos", content: "Juros compostos são \"juros sobre juros\". Um investimento de R$ 1.000 a 1% ao mês rende R$ 10 no primeiro mês, R$ 10,10 no segundo, e assim por diante. Quanto mais tempo, maior o efeito exponencial." },
];

const quizQuestions = [
  { q: "O que é a taxa SELIC?", options: ["Taxa de câmbio", "Taxa básica de juros", "Imposto federal", "Taxa de inflação"], answer: 1 },
  { q: "Qual é o investimento mais seguro do Brasil?", options: ["Ações", "Bitcoin", "Tesouro SELIC", "Forex"], answer: 2 },
  { q: "O que são juros compostos?", options: ["Juros simples dobrados", "Juros sobre juros", "Taxa fixa anual", "Desconto bancário"], answer: 1 },
  { q: "Quantos meses de reserva de emergência são recomendados?", options: ["1 mês", "3 a 12 meses", "24 meses", "Não é necessário"], answer: 1 },
  { q: "O que é renda variável?", options: ["Poupança", "CDB", "Ações e FIIs", "Tesouro Direto"], answer: 2 },
  { q: "Qual a principal vantagem da diversificação?", options: ["Maior risco", "Redução de risco", "Mais taxas", "Menos liquidez"], answer: 1 },
  { q: "O que significa liquidez?", options: ["Rentabilidade", "Facilidade de converter em dinheiro", "Risco do investimento", "Taxa de administração"], answer: 1 },
  { q: "LCI e LCA são isentas de:", options: ["IOF", "IPVA", "Imposto de Renda", "ICMS"], answer: 2 },
  { q: "O que é inflação?", options: ["Queda de preços", "Aumento geral de preços", "Taxa de juros", "Crescimento do PIB"], answer: 1 },
  { q: "Qual o primeiro passo para investir?", options: ["Comprar ações", "Fazer reserva de emergência", "Pedir empréstimo", "Apostar em cripto"], answer: 1 },
];

const tips = [
  { icon: PiggyBank, title: "Regra 50-30-20", desc: "Destine 50% da renda para necessidades, 30% para desejos e 20% para poupança/investimentos." },
  { icon: TrendingUp, title: "Invista cedo", desc: "Quanto antes começar, maior o efeito dos juros compostos. Mesmo R$ 50/mês faz diferença em 10 anos." },
  { icon: Calculator, title: "Controle seus gastos", desc: "Use nosso Controle de Gastos para acompanhar receitas e despesas mês a mês." },
];

export default function EducacaoFinanceira() {
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  // Simulador de investimento simples
  const [investValue, setInvestValue] = useState("");
  const [investMonths, setInvestMonths] = useState("");
  const [investRate, setInvestRate] = useState("");

  const investResult = useMemo(() => {
    const v = parseFloat(investValue) || 0;
    const m = parseInt(investMonths) || 0;
    const r = (parseFloat(investRate) || 0) / 100;
    if (v <= 0 || m <= 0) return null;
    const total = v * Math.pow(1 + r, m);
    const lucro = total - v;
    return { total, lucro };
  }, [investValue, investMonths, investRate]);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === quizQuestions[currentQ].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQ < quizQuestions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setQuizDone(true);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Educação Financeira</h1>
            <p className="text-muted-foreground mb-8">Aprenda a gerenciar seu dinheiro com inteligência.</p>
          </motion.div>

          {/* Dicas rápidas */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {tips.map((tip, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <tip.icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Simulador de Investimento */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-primary" /> Simulador de Investimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Descubra quanto seu dinheiro pode render com juros compostos.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor investido (R$)</label>
                  <Input type="number" min="0" placeholder="1000" value={investValue} onChange={e => setInvestValue(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prazo (meses)</label>
                  <Input type="number" min="1" placeholder="12" value={investMonths} onChange={e => setInvestMonths(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Taxa mensal (%)</label>
                  <Input type="number" min="0" step="0.01" placeholder="1.0" value={investRate} onChange={e => setInvestRate(e.target.value)} />
                </div>
              </div>
              {investResult && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Montante final</p>
                    <p className="text-xl font-bold text-primary">R$ {investResult.total.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Lucro estimado</p>
                    <p className="text-xl font-bold text-green-500">+ R$ {investResult.lucro.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-primary" /> Quiz Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!quizStarted ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Teste seus conhecimentos com 10 perguntas sobre finanças.</p>
                  <Button onClick={() => setQuizStarted(true)}>Iniciar Quiz</Button>
                </div>
              ) : quizDone ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-bold mb-2">{score}/{quizQuestions.length} acertos</p>
                  <p className="text-muted-foreground mb-4">
                    {score >= 7 ? "🏆 Excelente! Você manda bem em finanças!" : score >= 4 ? "👍 Bom resultado! Continue estudando." : "📚 Revise os artigos abaixo para melhorar."}
                  </p>
                  <Button variant="outline" onClick={() => { setQuizStarted(false); setQuizDone(false); setCurrentQ(0); setScore(0); setSelected(null); }} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Refazer Quiz
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Pergunta {currentQ + 1} de {quizQuestions.length}</p>
                  <p className="font-medium mb-4">{quizQuestions[currentQ].q}</p>
                  <div className="grid gap-2">
                    {quizQuestions[currentQ].options.map((opt, i) => (
                      <button
                        key={i}
                        disabled={selected !== null}
                        onClick={() => handleAnswer(i)}
                        className={`text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                          selected === null ? "border-border hover:border-primary/50 hover:bg-primary/5" :
                          i === quizQuestions[currentQ].answer ? "border-green-500 bg-green-500/10 text-green-600" :
                          i === selected ? "border-destructive bg-destructive/10 text-destructive" : "border-border opacity-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {selected !== null && i === quizQuestions[currentQ].answer && <CheckCircle className="w-4 h-4" />}
                          {selected !== null && i === selected && i !== quizQuestions[currentQ].answer && <XCircle className="w-4 h-4" />}
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Artigos
            </h2>
            <div className="space-y-3">
              {articles.map((a, i) => (
                <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenArticle(openArticle === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <span className="font-medium text-sm">{a.title}</span>
                    {openArticle === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {openArticle === i && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {a.content}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
