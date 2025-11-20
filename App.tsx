
import React, { useState, useEffect } from 'react';
import { InputField } from './components/InputField';
import { ResultCard } from './components/ResultCard';
import { SystemParams, PumpParams, CalculationResult, PumpModel } from './types';
import { calculateDosage } from './services/calcLogic';

// SEKO Pump Catalog
const PUMP_CATALOG: PumpModel[] = [
    { id: 'manual', name: 'Ручной ввод параметров', strokeVolume: 0.52, maxFrequency: 160, maxFlow: 0, maxPressure: 0, supportsProportional: true, isAnalogProportional: false },
    // Constant Only
    { id: 'amc200', name: 'Kompact AMC 200', strokeVolume: 0.52, maxFrequency: 160, maxFlow: 5, maxPressure: 8, supportsProportional: true, isAnalogProportional: true },
    { id: 'aml200', name: 'Kompact AML 200', strokeVolume: 0.52, maxFrequency: 160, maxFlow: 5, maxPressure: 8, supportsProportional: false },
    { id: 'aks603', name: 'Tekna EVO AKS 603', strokeVolume: 0.83, maxFrequency: 160, maxFlow: 8, maxPressure: 12, supportsProportional: false },
    // Proportional Capable
    { id: 'apg603', name: 'Tekna EVO APG 603', strokeVolume: 0.83, maxFrequency: 160, maxFlow: 8, maxPressure: 12, supportsProportional: true, isAnalogProportional: false },
    { id: 'tpg603', name: 'Tekna EVO TPG 603', strokeVolume: 0.83, maxFrequency: 160, maxFlow: 8, maxPressure: 12, supportsProportional: true, isAnalogProportional: false },
    { id: 'apg800', name: 'Tekna EVO APG 800', strokeVolume: 2.08, maxFrequency: 160, maxFlow: 18, maxPressure: 12, supportsProportional: true, isAnalogProportional: false },
];

const DEFAULT_SYSTEM: SystemParams = {
  permeateFlow: 500, // L/h
  concentrateFlow: 250, // L/h
  targetDosage: 3.0, // mg/L
  reagentDensity: 1.20, // g/cm3
  waterHardness: 7.0, // mg-eq/L
  waterIron: 0.1, // mg/L
};

const DEFAULT_PUMP: PumpParams = {
  pumpId: 'amc200',
  modelName: 'Kompact AMC 200',
  tankVolume: 60, // Liters
  strokeVolume: 0.52, // ml/stroke
  maxFrequency: 160, // strokes/min
  speedPercent: 50, // %
  controlMode: 'constant',
  impulseLitres: 10,
  proportionalMode: '1xN',
  proportionalFactor: 1
};

export default function App() {
  const [system, setSystem] = useState<SystemParams>(DEFAULT_SYSTEM);
  const [pump, setPump] = useState<PumpParams>(DEFAULT_PUMP);
  const [selectedPumpId, setSelectedPumpId] = useState<string>('amc200');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Recalculate whenever inputs change
  useEffect(() => {
    const res = calculateDosage(system, pump);
    setResult(res);
  }, [system, pump]);

  const handlePumpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedPumpId(newId);
    const model = PUMP_CATALOG.find(p => p.id === newId);
    if (model) {
        setPump(prev => ({
            ...prev,
            pumpId: model.id,
            modelName: model.name,
            strokeVolume: model.strokeVolume,
            maxFrequency: model.maxFrequency,
            // Reset to constant if new pump doesn't support proportional
            controlMode: (!model.supportsProportional && prev.controlMode === 'proportional') ? 'constant' : prev.controlMode
        }));
    }
  };

  const currentPumpModel = PUMP_CATALOG.find(p => p.id === selectedPumpId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-10">
      {/* Header */}
      <header className="bg-cyan-800 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full">
               <svg className="w-6 h-6 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               </svg>
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">Aminat K Calculator</h1>
                <p className="text-xs text-cyan-200">Расчет дозирования антискаланта</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6 animate-fade-in">
        
        {/* Section 1: Pump Selection */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                    Насос и Управление
                </h2>
            </div>
            <div className="p-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Модель насоса</label>
                    <select 
                        className="block w-full rounded-md border-slate-300 bg-white text-slate-900 py-2 pl-3 pr-10 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm border font-medium"
                        value={selectedPumpId}
                        onChange={handlePumpChange}
                    >
                        {PUMP_CATALOG.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} {p.maxFlow > 0 ? `(${p.maxFlow} л/ч)` : ''} 
                                {p.supportsProportional ? (p.isAnalogProportional ? ' [Analog P]' : ' [Pulse]') : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Control Mode Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setPump({...pump, controlMode: 'constant'})}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                            pump.controlMode === 'constant' 
                            ? 'bg-white text-cyan-700 shadow' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Постоянный (C)
                    </button>
                    <button
                        onClick={() => setPump({...pump, controlMode: 'proportional'})}
                        disabled={!currentPumpModel?.supportsProportional}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex justify-center items-center gap-2 ${
                            pump.controlMode === 'proportional' 
                            ? 'bg-white text-cyan-700 shadow' 
                            : (!currentPumpModel?.supportsProportional ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700')
                        }`}
                    >
                        Импульсный (P)
                        {!currentPumpModel?.supportsProportional && (
                            <span className="w-2 h-2 rounded-full bg-red-400" title="Не поддерживается данной моделью"></span>
                        )}
                    </button>
                </div>

                {/* Pump Settings */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 space-y-4">
                     
                     {/* SPEED SLIDER:
                        Used for Constant Mode OR Analog Proportional Mode (AMC 200)
                     */}
                     {(pump.controlMode === 'constant' || (pump.controlMode === 'proportional' && currentPumpModel?.isAnalogProportional)) && (
                        <div className="bg-cyan-50 rounded-md p-3 border border-cyan-100">
                            <label className="block text-sm font-medium text-cyan-900 mb-2">
                                {pump.controlMode === 'constant' ? 'Скорость (Потенциометр)' : 'Потенциометр (Режим 4:1)'}
                            </label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={pump.speedPercent} 
                                    onChange={(e) => setPump({ ...pump, speedPercent: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
                                />
                                <span className="text-lg font-bold text-cyan-800 w-12 text-right">{pump.speedPercent}%</span>
                            </div>
                            <p className="text-xs text-cyan-700 mt-1">
                                {pump.controlMode === 'constant' 
                                 ? `Частота: ${(pump.maxFrequency * pump.speedPercent / 100).toFixed(0)} имп/мин` 
                                 : `Делитель: 1 впрыск на ${(400 / (pump.speedPercent || 1)).toFixed(1)} импульсов`
                                }
                            </p>
                        </div>
                     )}

                     {/* Proportional Mode UI */}
                     {pump.controlMode === 'proportional' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Импульс водосчетчика</label>
                                    <select 
                                        className="block w-full rounded-md border-slate-300 bg-white text-slate-900 py-2 px-3 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm border font-medium"
                                        value={pump.impulseLitres}
                                        onChange={(e) => setPump({...pump, impulseLitres: parseInt(e.target.value)})}
                                    >
                                        <option value={1}>1 литр / имп</option>
                                        <option value={10}>10 литров / имп</option>
                                        <option value={100}>100 литров / имп</option>
                                        <option value={1000}>1000 литров / имп</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Счетчик на входе осмоса</p>
                                </div>
                                
                                <div className="bg-cyan-50 p-3 rounded-md border border-cyan-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-bold text-cyan-900">Частота работы</label>
                                        <span className={`text-xs px-2 py-0.5 rounded ${result?.error ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-cyan-800'}`}>
                                            {result?.actualFrequency.toFixed(1)} имп/мин
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-cyan-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${result?.error ? 'bg-red-500' : 'bg-cyan-600'}`} 
                                            style={{width: `${Math.min(((result?.actualFrequency || 0) / pump.maxFrequency) * 100, 100)}%`}}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-cyan-700 mt-1 text-right">Макс: {pump.maxFrequency}</p>
                                </div>
                            </div>

                            {/* DIGITAL PUMP SETTINGS (Not shown for AMC 200) */}
                            {!currentPumpModel?.isAnalogProportional && (
                                <div className="border-t border-slate-200 pt-3 animate-fade-in">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Режим обработки (n)</label>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <div className="flex rounded-md shadow-sm">
                                                <button
                                                    onClick={() => setPump({...pump, proportionalMode: '1xN'})}
                                                    className={`px-4 py-2 text-sm font-medium border border-r-0 rounded-l-md ${
                                                        pump.proportionalMode === '1xN' 
                                                        ? 'bg-cyan-600 text-white border-cyan-600' 
                                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    1 x n (Умнож)
                                                </button>
                                                <button
                                                    onClick={() => setPump({...pump, proportionalMode: '1:N'})}
                                                    className={`px-4 py-2 text-sm font-medium border rounded-r-md ${
                                                        pump.proportionalMode === '1:N' 
                                                        ? 'bg-cyan-600 text-white border-cyan-600' 
                                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    1 : n (Делен)
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {pump.proportionalMode === '1xN' ? '1 импульс дает N впрысков' : 'N импульсов дают 1 впрыск'}
                                            </p>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Значение n</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="block w-full rounded-md border-slate-300 bg-white text-slate-900 py-2 px-3 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm border font-bold"
                                                value={pump.proportionalFactor}
                                                onChange={(e) => setPump({...pump, proportionalFactor: Math.max(1, parseInt(e.target.value) || 1)})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ANALOG PUMP INFO (Only AMC 200) */}
                            {currentPumpModel?.isAnalogProportional && (
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded text-xs text-amber-800">
                                    <strong>Принцип работы AMC 200 (Режим P):</strong><br/>
                                    При 100% ручки, насос делает 1 впрыск на каждые 4 импульса.<br/>
                                    При уменьшении % ручки, количество необходимых импульсов увеличивается.
                                </div>
                            )}
                        </div>
                     )}
                     
                     {/* Common Tank Volume */}
                     <div className="border-t border-slate-200 pt-4 mt-2">
                        <InputField
                            label="Объем Емкости реагента"
                            value={pump.tankVolume}
                            onChange={(v) => setPump({ ...pump, tankVolume: v })}
                            unit="литров"
                        />
                     </div>
                </div>

                {/* Manual Params Override */}
                {selectedPumpId === 'manual' && (
                     <div className="grid grid-cols-2 gap-4 border-t pt-4 border-dashed border-slate-200">
                        <InputField
                            label="Объем Импульса"
                            value={pump.strokeVolume}
                            onChange={(v) => setPump({ ...pump, strokeVolume: v })}
                            unit="мл"
                            step={0.01}
                        />
                        <InputField
                            label="Макс. Частота"
                            value={pump.maxFrequency}
                            onChange={(v) => setPump({ ...pump, maxFrequency: v })}
                            unit="имп/мин"
                        />
                    </div>
                )}
            </div>
        </section>

        {/* Section 2: Water & System */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Параметры Воды и Осмоса
                </h2>
            </div>
            <div className="p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Исходная вода</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <InputField
                        label="Жесткость общая"
                        value={system.waterHardness}
                        onChange={(v) => setSystem({ ...system, waterHardness: v })}
                        unit="°Ж"
                        step={0.1}
                        helperText="Влияет на рекомендуемую дозу"
                    />
                     <InputField
                        label="Железо общее"
                        value={system.waterIron}
                        onChange={(v) => setSystem({ ...system, waterIron: v })}
                        unit="мг/л"
                        step={0.1}
                    />
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Режим работы осмоса</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Пермеат (Product)"
                        value={system.permeateFlow}
                        onChange={(v) => setSystem({ ...system, permeateFlow: v })}
                        unit="л/ч"
                    />
                    <InputField
                        label="Концентрат (Reject)"
                        value={system.concentrateFlow}
                        onChange={(v) => setSystem({ ...system, concentrateFlow: v })}
                        unit="л/ч"
                        helperText="Слив + Рецикл"
                    />
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-100 p-4 rounded-lg">
                     <div className="flex justify-between items-start mb-2">
                        <label className="block text-sm font-bold text-amber-900">
                            Целевая дозировка
                        </label>
                        {result && (
                             <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded">
                                Реком: {result.recommendedDosageMin} - {result.recommendedDosageMax} мг/л
                             </span>
                        )}
                     </div>
                     <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            step={0.1}
                            value={system.targetDosage}
                            onChange={(e) => setSystem({...system, targetDosage: parseFloat(e.target.value) || 0})}
                            className="block w-full rounded-md border-amber-300 bg-white text-slate-900 py-2 px-3 focus:border-amber-500 focus:ring-amber-500 font-bold text-lg"
                        />
                        <span className="text-amber-800 font-medium">мг/л</span>
                     </div>
                     <p className="text-xs text-amber-700 mt-2">
                        Корректируется вручную на основе рекомендаций производителя (Аминат К).
                     </p>
                </div>
            </div>
        </section>

        {/* Results Section */}
        {result && (
            <section className="bg-white rounded-xl shadow-lg border-t-4 border-cyan-600 overflow-hidden">
            <div className="bg-cyan-50 px-4 py-3 border-b border-cyan-100">
                <h2 className="font-bold text-cyan-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Результаты Расчета
                </h2>
            </div>
            
            {result.error ? (
                <div className="p-6 text-red-600 bg-red-50 border border-red-100 m-4 rounded-lg">
                    <strong>Ошибка конфигурации:</strong> {result.error}
                </div>
            ) : (
                <div className="p-4 space-y-6">
                    {/* Main Recipe */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 text-white shadow-md">
                        <h3 className="text-cyan-100 text-sm font-medium uppercase tracking-wider mb-4 border-b border-cyan-500 pb-2">
                            Рецепт приготовления (на {pump.tankVolume} л)
                        </h3>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="text-center sm:text-left">
                                <div className="text-5xl font-bold tracking-tight">
                                    {result.reagentInTank.toFixed(2)} <span className="text-2xl font-normal text-cyan-200">л</span>
                                </div>
                                <p className="text-cyan-50 mt-1 font-medium">Аминат К (Концентрат)</p>
                            </div>
                            <div className="text-3xl font-light text-cyan-300 hidden sm:block">+</div>
                            <div className="text-center sm:text-left">
                                <div className="text-4xl font-bold tracking-tight">
                                    {result.waterInTank.toFixed(1)} <span className="text-xl font-normal text-cyan-200">л</span>
                                </div>
                                <p className="text-cyan-50 mt-1 font-medium">Очищенная вода</p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <ResultCard 
                            title="Поток Насоса" 
                            value={result.pumpFlowRate.toFixed(2)} 
                            unit="л/ч"
                            subtext={pump.controlMode === 'constant' ? `При ${pump.speedPercent}%` : `Имп: ${result.actualFrequency.toFixed(0)}/мин`}
                        />
                        <ResultCard 
                            title="Время Работы" 
                            value={result.tankRuntime.toFixed(1)} 
                            unit="ч" 
                            highlight
                            subtext="Одной емкости"
                        />
                        <ResultCard 
                            title="Расход Аминат" 
                            value={(result.requiredReagentVolume).toFixed(1)} 
                            unit="мл/ч"
                            subtext="Чистый продукт"
                        />
                            <ResultCard 
                            title="Вход Осмоса" 
                            value={result.feedFlow.toFixed(0)} 
                            unit="л/ч"
                            subtext="Нагрузка"
                        />
                    </div>
                </div>
            )}
            </section>
        )}
      </main>
    </div>
  );
}
