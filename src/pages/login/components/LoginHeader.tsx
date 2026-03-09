import pontiLogo from "@/components/svg/ponti.svg";

export function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-14 h-14 rounded-xl sky-gradient flex items-center justify-center mb-4 shadow-md">
        <img src={pontiLogo} alt="Ponti" className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">MasterHelper</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Herramienta para la creación del Master Cliente
      </p>
    </div>
  );
}
