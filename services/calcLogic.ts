
import { SystemParams, PumpParams, CalculationResult } from '../types';

export const calculateDosage = (system: SystemParams, pump: PumpParams): CalculationResult => {
    // 1. Calculate Total Feed Flow (Input to RO)
    const feedFlow = system.permeateFlow + system.concentrateFlow; // L/h

    // 2. Calculate Required Pure Reagent Mass Flow
    const requiredReagentMass = (feedFlow * system.targetDosage) / 1000; // g/h

    // 3. Calculate Required Pure Reagent Volume Flow (mL/h)
    const requiredReagentVolume = requiredReagentMass / system.reagentDensity; // mL/h

    // 4. Calculate Pump Flow Rate based on Mode
    let actualFrequency = 0;

    if (pump.controlMode === 'constant') {
        actualFrequency = pump.maxFrequency * (pump.speedPercent / 100);
    } else {
        // Proportional Mode (Impulse)
        if (pump.impulseLitres <= 0) pump.impulseLitres = 1; // Safety
        
        // Calculate incoming pulses per minute based on Feed Flow
        const pulsesPerHour = feedFlow / pump.impulseLitres;
        const pulsesPerMin = pulsesPerHour / 60;

        // Check for Analog Proportional Logic (AMC 200)
        if (pump.pumpId === 'amc200') {
            // AMC 200 Logic:
            // Switch position P (4:1).
            // Potentiometer scales the divider.
            // 100% = 4 pulses per stroke (Divider = 4)
            // 50% = 8 pulses per stroke (Divider = 8)
            // Formula: N = 400 / Percent
            
            const safePercent = pump.speedPercent > 0 ? pump.speedPercent : 1;
            const dividerN = 400 / safePercent;
            
            actualFrequency = pulsesPerMin / dividerN;
        } else {
            // Digital Logic (Standard)
            if (pump.proportionalMode === '1xN') {
                // Multiply: 1 Pulse = N Strokes
                actualFrequency = pulsesPerMin * pump.proportionalFactor;
            } else {
                // Divide: N Pulses = 1 Stroke
                // Avoid division by zero
                const n = pump.proportionalFactor > 0 ? pump.proportionalFactor : 1;
                actualFrequency = pulsesPerMin / n;
            }
        }
    }

    const pumpFlowRate = (pump.strokeVolume * actualFrequency * 60) / 1000; // L/h

    // 5. Calculate Recommended Dosage Range (Heuristic for Aminat K)
    let baseMin = 2.0;
    let baseMax = 4.0;

    if (system.waterHardness > 5) {
        const hardnessFactor = (system.waterHardness - 5) * 0.15;
        baseMin += hardnessFactor;
        baseMax += hardnessFactor;
    }
    
    if (system.waterIron > 0.3) {
        baseMin += 1.0;
        baseMax += 1.5;
    }

    // Cap realistic max for standard applications
    baseMax = Math.min(baseMax, 10.0); 

    // Error Checking
    if (pumpFlowRate <= 0) {
        return {
            feedFlow,
            requiredReagentMass,
            requiredReagentVolume,
            pumpFlowRate,
            actualFrequency,
            reagentInTank: 0,
            waterInTank: 0,
            tankRuntime: 0,
            recommendedDosageMin: Number(baseMin.toFixed(1)),
            recommendedDosageMax: Number(baseMax.toFixed(1)),
            error: pump.controlMode === 'constant' 
                ? "Производительность насоса равна 0. Увеличьте скорость." 
                : "Частота дозирования слишком низкая (0). Измените настройки импульсов."
        };
    }

    if (actualFrequency > pump.maxFrequency) {
        return {
            feedFlow,
            requiredReagentMass,
            requiredReagentVolume,
            pumpFlowRate,
            actualFrequency,
            reagentInTank: 0,
            waterInTank: 0,
            tankRuntime: 0,
            recommendedDosageMin: Number(baseMin.toFixed(1)),
            recommendedDosageMax: Number(baseMax.toFixed(1)),
            error: `Превышена макс. частота насоса (${actualFrequency.toFixed(1)} > ${pump.maxFrequency}). Измените настройки импульсов или выберите более мощный насос.`
        };
    }

    // 6. Calculate Recipe for Tank
    const concentrationRatio = requiredReagentVolume / pumpFlowRate; // mL/L
    const reagentInTank = (concentrationRatio * pump.tankVolume) / 1000;

    // 7. Check for physical possibility
    if (reagentInTank > pump.tankVolume) {
        return {
            feedFlow,
            requiredReagentMass,
            requiredReagentVolume,
            pumpFlowRate,
            actualFrequency,
            reagentInTank,
            waterInTank: 0,
            tankRuntime: 0,
            recommendedDosageMin: Number(baseMin.toFixed(1)),
            recommendedDosageMax: Number(baseMax.toFixed(1)),
            error: "Требуемый объем реагента превышает объем бака. Увеличьте дозирование (частоту) насоса для снижения концентрации раствора."
        };
    }

    const waterInTank = pump.tankVolume - reagentInTank;
    const tankRuntime = pump.tankVolume / pumpFlowRate;

    return {
        feedFlow,
        requiredReagentMass,
        requiredReagentVolume,
        pumpFlowRate,
        actualFrequency,
        reagentInTank,
        waterInTank,
        tankRuntime,
        recommendedDosageMin: Number(baseMin.toFixed(1)),
        recommendedDosageMax: Number(baseMax.toFixed(1))
    };
};
