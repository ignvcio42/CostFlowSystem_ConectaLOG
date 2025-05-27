export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-sm text-muted-foreground border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="font-semibold">CostFlow System</p>
          <p>© {year} Fundación Conecta Logística. Todos los derechos reservados.</p>
        </div>
        <div className="flex gap-6">
          <a href="/" className="hover:underline">Inicio</a>
          <a href="/glosary" className="hover:underline">Glosario</a>
          <a href="mailto:soporte@conectalogistica.cl" className="hover:underline">Contacto</a>
        </div>
      </div>
    </footer>
  );
}
