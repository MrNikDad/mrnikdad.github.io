
export interface SystemParams {
    permeateFlow: number; // L/h
    concentrateFlow: number; // L/h
    targetDosage: number; // mg/L (g/m3)
    reagentDensity: number; // g/cm3
    waterHardness: number; // mg-eq/L (degrees)
    waterIron: number; // mg/L
}

export type ControlMode = 'constant' | 'proportional';
export type ProportionalMode = '1xN' | '1:N';

export interface PumpParams {
    pumpId: string; // Added to track specific model logic
    modelName: string;
    tankVolume: number; // Liters
    strokeVolume: number; // ml per stroke
    maxFrequency: number; // strokes per min
    
    // Constant Mode (and Analog Proportional Knob)
    speedPercent: number; // % setting

    // Proportional Mode (Digital)
    controlMode: ControlMode;
    impulseLitres: number; // Liters per pulse (1, 10, 100, 1000)
    proportionalMode: ProportionalMode; // 1xN or 1:N
    proportionalFactor: number; // N
}

export interface PumpModel {
    id: string;
    name: string;
    strokeVolume: number;
    maxFrequency: number;
    maxFlow: number; // L/h (for reference)
    maxPressure: number; // bar (for reference)
    supportsProportional: boolean;
    isAnalogProportional?: boolean; // Specific for AMC 200 style analog division
}

export interface CalculationResult {
    feedFlow: number; // L/h
    requiredReagentMass: number; // g/h
    requiredReagentVolume: number; // mL/h (pure)
    pumpFlowRate: number; // L/h (solution)
    actualFrequency: number; // strokes/min
    reagentInTank: number; // Liters
    waterInTank: number; // Liters
    tankRuntime: number; // Hours
    recommendedDosageMin: number;
    recommendedDosageMax: number;
    error?: string;
}
