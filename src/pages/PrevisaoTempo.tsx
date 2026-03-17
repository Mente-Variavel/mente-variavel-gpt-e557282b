import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Search,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Settings2,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

interface WeatherData {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: { main: string; description: string; icon: string }[];
  wind: { speed: number };
  visibility: number;
}

interface ForecastItem {
  dt: number;
  dt_txt: string;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { main: string; description: string; icon: string }[];
}

interface ForecastData {
  list: ForecastItem[];
}

const weatherIcons: Record<string, React.ElementType> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudLightning,
  Snow: CloudSnow,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
};

function getWeatherIcon(condition: string) {
  return weatherIcons[condition] || Cloud;
}

function getDayName(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { weekday: "short" });
}

function groupForecastByDay(list: ForecastItem[]) {
  const days: Record<string, ForecastItem[]> = {};
  list.forEach((item) => {
    const day = item.dt_txt.split(" ")[0];
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });
  return Object.entries(days)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((i) => i.main.temp);
      const midday = items.find((i) => i.dt_txt.includes("12:00")) || items[0];
      return {
        date,
        dayName: getDayName(date),
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        condition: midday.weather[0].main,
        description: midday.weather[0].description,
      };
    });
}

export default function PrevisaoTempo() {
  const [city, setCity] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("ow_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ReturnType<typeof groupForecastByDay>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (apiKey) localStorage.setItem("ow_api_key", apiKey);
  }, [apiKey]);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Digite o nome de uma cidade.");
      return;
    }
    if (!apiKey.trim()) {
      setError("Insira sua API Key do OpenWeather nas configurações.");
      setShowSettings(true);
      return;
    }
    setLoading(true);
    setError("");
    setWeather(null);
    setForecast([]);

    try {
      const [wRes, fRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${apiKey}`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${apiKey}`
        ),
      ]);

      if (!wRes.ok) {
        const err = await wRes.json();
        throw new Error(err.message || "Erro ao buscar dados.");
      }

      const wData: WeatherData = await wRes.json();
      const fData: ForecastData = await fRes.json();

      setWeather(wData);
      setForecast(groupForecastByDay(fData.list));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.weather[0].main) : Sun;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Previsão do{" "}
              <span className="text-primary text-glow-cyan">Tempo</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Consulte a temperatura, umidade, vento e previsão para os próximos dias de qualquer cidade do mundo.
            </p>
          </motion.div>

          {/* Settings toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              Configurações da API
              {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 glass rounded-xl p-4 border border-border/50"
              >
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  OpenWeather API Key
                </label>
                <Input
                  type="password"
                  placeholder="Cole sua API Key aqui..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Obtenha sua chave gratuita em{" "}
                  <a
                    href="https://openweathermap.org/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openweathermap.org
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Search */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 mb-8"
          >
            <Input
              placeholder="Digite o nome da cidade..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 bg-secondary/50 border-border/50"
            />
            <Button type="submit" disabled={loading} className="glow-cyan shrink-0">
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-1.5">Buscar</span>
            </Button>
          </motion.form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive text-center mb-6"
            >
              {error}
            </motion.p>
          )}

          {/* Current weather */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 md:p-8 border border-primary/20 mb-8"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {weather.name}, {weather.sys.country}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <WeatherIcon className="w-16 h-16 text-primary" />
                  <div>
                    <p className="text-5xl font-bold text-foreground">
                      {Math.round(weather.main.temp)}°
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {weather.weather[0].description}
                    </p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-primary/70" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sensação</p>
                      <p className="text-sm font-semibold text-foreground">
                        {Math.round(weather.main.feels_like)}°C
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary/70" />
                    <div>
                      <p className="text-xs text-muted-foreground">Umidade</p>
                      <p className="text-sm font-semibold text-foreground">
                        {weather.main.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-primary/70" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vento</p>
                      <p className="text-sm font-semibold text-foreground">
                        {weather.wind.speed} m/s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary/70" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visibilidade</p>
                      <p className="text-sm font-semibold text-foreground">
                        {(weather.visibility / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground justify-center">
                <span>Mín: {Math.round(weather.main.temp_min)}°</span>
                <span>•</span>
                <span>Máx: {Math.round(weather.main.temp_max)}°</span>
              </div>
            </motion.div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Próximos dias
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {forecast.map((day) => {
                  const Icon = getWeatherIcon(day.condition);
                  return (
                    <div
                      key={day.date}
                      className="glass rounded-xl p-4 border border-border/50 text-center hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                        {day.dayName}
                      </p>
                      <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-bold text-foreground">
                        {day.tempMax}°
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.tempMin}°
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Content Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8 border border-border/50 prose prose-invert max-w-none"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Como usar a Previsão do Tempo
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Nossa ferramenta de previsão do tempo é simples e direta. Basta digitar o nome de qualquer cidade no campo de busca e clicar em "Buscar". Em poucos segundos, você terá acesso à temperatura atual, sensação térmica, umidade, velocidade do vento e a previsão para os próximos dias.
            </p>

            <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
              Por que consultar o clima é importante?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-4">
              <li>Planejar seu dia com mais segurança e conforto.</li>
              <li>Evitar surpresas como chuvas inesperadas ou ondas de calor.</li>
              <li>Organizar viagens, eventos ao ar livre e atividades esportivas.</li>
              <li>Proteger sua saúde ao se preparar para mudanças bruscas de temperatura.</li>
            </ul>

            <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
              Dicas práticas
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-4">
              <li>Consulte a previsão logo pela manhã para decidir o que vestir.</li>
              <li>Verifique a umidade do ar — valores abaixo de 30% pedem hidratação extra.</li>
              <li>Ventos acima de 40 km/h podem dificultar atividades ao ar livre.</li>
              <li>Compare a temperatura real com a sensação térmica para se preparar melhor.</li>
            </ul>

            <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-3">
              Sobre a API Key
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para usar esta ferramenta, você precisa de uma chave gratuita do OpenWeather. Acesse{" "}
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openweathermap.org
              </a>
              , crie uma conta gratuita e copie sua API Key. Cole o valor no campo de configurações acima. Sua chave fica salva localmente no navegador e nunca é enviada para nossos servidores.
            </p>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
