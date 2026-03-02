import { motion } from "framer-motion";
import { Eye, Palette, Type, Shapes, MapPin, ShieldCheck } from "lucide-react";

export interface AnalysisData {
  detected_text: string;
  primary_colors: string[];
  logo_description: string;
  shape_notes: string;
  do_not_modify: string[];
  recommended_placement: string;
}

interface Props {
  analysis: AnalysisData;
}

const ReferenceAnalysis = ({ analysis }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-secondary/30 backdrop-blur-sm p-4 space-y-3 text-sm"
    >
      <h4 className="font-display font-bold text-foreground flex items-center gap-2 text-xs uppercase tracking-wider">
        <Eye className="w-4 h-4 text-primary" />
        Dados da Referência Extraídos
      </h4>

      <div className="grid gap-2">
        {analysis.detected_text && (
          <div className="flex items-start gap-2">
            <Type className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Texto detectado:</span>
              <p className="text-foreground font-medium">{analysis.detected_text}</p>
            </div>
          </div>
        )}

        {analysis.primary_colors?.length > 0 && (
          <div className="flex items-start gap-2">
            <Palette className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Cores principais:</span>
              <div className="flex gap-1.5 mt-1">
                {analysis.primary_colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: c }}
                    />
                    <span className="text-xs text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {analysis.logo_description && (
          <div className="flex items-start gap-2">
            <Shapes className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Descrição do logo:</span>
              <p className="text-foreground">{analysis.logo_description}</p>
            </div>
          </div>
        )}

        {analysis.shape_notes && (
          <div className="flex items-start gap-2">
            <Shapes className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Estrutura/formas:</span>
              <p className="text-foreground">{analysis.shape_notes}</p>
            </div>
          </div>
        )}

        {analysis.recommended_placement && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Posicionamento sugerido:</span>
              <p className="text-foreground">{analysis.recommended_placement}</p>
            </div>
          </div>
        )}

        {analysis.do_not_modify?.length > 0 && (
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-muted-foreground text-xs">Regras de preservação:</span>
              <ul className="text-foreground text-xs mt-0.5 space-y-0.5">
                {analysis.do_not_modify.map((rule, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-primary">•</span> {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReferenceAnalysis;
