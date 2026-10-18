import { runCppVerificationEngine } from './cppBridge';
import { VerificationReport } from './types';

// Semantic equivalence table for common device terminology
const SEMANTIC_EQUIVALENCES: Record<string, string[]> = {
  ip68: ['ip68', 'waterproof', 'dustproof', 'water resistant', '6m 30 min', 'submersible'],
  oled: ['oled', 'super amoled', 'dynamic amoled', 'retina xdr', 'p-oled'],
  fast_charging: ['fast charging', 'warp charge', 'supervooc', 'quick charge', 'hypercharge', 'pd 3.0'],
  telephoto: ['periscope telephoto', 'optical zoom', '5x optical', '3x optical', 'telephoto lens'],
};

export async function performHybridVerification(payload: {
  deviceId: string;
  deviceName: string;
  claimed: { text?: Record<string, string>; numeric?: Record<string, number> };
  reference: { text?: Record<string, string>; numeric?: Record<string, number> };
  threshold?: number;
  enableSemanticCheck?: boolean;
}): Promise<VerificationReport> {
  // Step 1: Execute fast C++ structural exact and numerical verification
  const baseReport = await runCppVerificationEngine({
    deviceId: payload.deviceId,
    deviceName: payload.deviceName,
    claimed: payload.claimed,
    reference: payload.reference,
    threshold: payload.threshold || 0.85,
  });

  // Step 2: If semantic check enabled, analyze flagged text fields for semantic equivalence
  const actionItems: string[] = [];
  let reconciledCount = 0;

  if (payload.enableSemanticCheck !== false) {
    for (const field of baseReport.fields) {
      if (field.flagged && field.type === 'text') {
        const cLower = field.claimedValue.toLowerCase();
        const rLower = field.referenceValue.toLowerCase();

        // Check if both match any semantic group
        let semanticallyEquivalent = false;
        for (const [groupName, terms] of Object.entries(SEMANTIC_EQUIVALENCES)) {
          const cMatch = terms.some((t) => cLower.includes(t));
          const rMatch = terms.some((t) => rLower.includes(t));
          if (cMatch && rMatch) {
            semanticallyEquivalent = true;
            field.mismatchReason = `Semantic Match (Understood '${groupName}' equivalence between claimed and reference)`;
            field.flagged = false;
            field.similarityScore = Math.max(field.similarityScore, 0.92);
            reconciledCount++;
            break;
          }
        }

        if (!semanticallyEquivalent) {
          actionItems.push(`Field '${field.fieldName}' differs significantly: "${field.claimedValue}" vs "${field.referenceValue}"`);
        }
      } else if (field.flagged && field.type === 'numeric') {
        actionItems.push(`Numerical tolerance exceeded on '${field.fieldName}': Claimed ${field.claimedValue}, Reference ${field.referenceValue}`);
      }
    }
  }

  // Recalculate confidence after semantic reconciliation
  const newTotal = baseReport.fields.reduce((acc, f) => acc + f.similarityScore, 0);
  baseReport.overallConfidence = baseReport.fields.length > 0 ? Number((newTotal / baseReport.fields.length).toFixed(4)) : 0;
  baseReport.flaggedCount = baseReport.fields.filter((f) => f.flagged).length;
  baseReport.verified = baseReport.flaggedCount === 0 && baseReport.overallConfidence >= (payload.threshold || 0.85);

  baseReport.semanticAnalysis = {
    summary: reconciledCount > 0
      ? `Successfully reconciled ${reconciledCount} field(s) using Hybrid Semantic NLP analysis.`
      : (baseReport.flaggedCount === 0 ? 'All specs verified accurately with reference data.' : `${baseReport.flaggedCount} discrepancies detected.`),
    actionItems,
    riskLevel: baseReport.flaggedCount === 0 ? 'LOW' : (baseReport.flaggedCount <= 2 ? 'MEDIUM' : 'HIGH'),
  };

  return baseReport;
}
