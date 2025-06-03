import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqData from "@/data/preguntas_frecuentes.json";

export default function PreguntasFrecuentes() {
  return (
    <div className="p-6 " id="preguntas-frecuentes">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Preguntas Frecuentes</h2>
      {faqData.map((categoria, index) => (
        <div key={index} className="mb-6 dark:bg-black/20 dark:text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{categoria.categoria}</h3>
          <Accordion type="multiple">
            {categoria.preguntas.map((item, idx) => (
              <AccordionItem key={idx} value={`${categoria.categoria}-${idx}`}>
                <AccordionTrigger>{item.pregunta}</AccordionTrigger>
                <AccordionContent>{item.respuesta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
