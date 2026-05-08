
import InputForm from "@/components/InputForm";

export default function DataInputPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Data Input</h1>
        <p className="text-gray-400 mt-2">Enter new carbon emission data here. Negative values are allowed to reverse previous entries.</p>
      </div>
      
      <div className="bg-surface rounded-xl border border-border p-6">
        <InputForm />
      </div>
    </div>
  );
}
