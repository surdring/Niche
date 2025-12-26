import React from "react";

import { type Citation } from "@niche/core/contracts";

import { CitationsList } from "./CitationsList";
import { EvidencePanel, type EvidenceState } from "./EvidencePanel";

export type CitationsEvidencePanelProps = {
  citations: readonly Citation[];
  selectedCitationId: string | undefined;
  onSelectCitation: (citationId: string) => void;

  evidenceState: EvidenceState;
  onCloseEvidence: () => void;
};

export const CitationsEvidencePanel = (props: CitationsEvidencePanelProps) => {
  return (
    <div style={{ marginTop: 16 }}>
      <CitationsList citations={props.citations} selectedCitationId={props.selectedCitationId} onSelect={props.onSelectCitation} />
      <div style={{ marginTop: 12 }}>
        <EvidencePanel selectedCitationId={props.selectedCitationId} evidenceState={props.evidenceState} onClose={props.onCloseEvidence} />
      </div>
    </div>
  );
};
