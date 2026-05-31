export default function ProductionPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="border-4 border-black bg-white p-12 text-center max-w-lg">
        <h2 className="text-2xl font-mono font-bold uppercase mb-4">Production Module</h2>
        <div className="w-16 h-2 bg-yellow-500 mx-auto mb-6" />
        <p className="font-mono text-sm text-gray-600 leading-relaxed">
          This module will display drawings that have been transmitted from
          the Drawing Activity module.
        </p>
        <p className="font-mono text-xs text-gray-400 mt-4">
          Development in progress — PRD v1.0 (Phase 2)
        </p>
      </div>
    </div>
  )
}
