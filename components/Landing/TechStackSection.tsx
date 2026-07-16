"use client";

import { useState } from "react";
import FrozenKeyboard from "@/components/ThreeDPortfolio/FrozenKeyboard";
import { useLanguage } from "@/components/ThreeDPortfolio/LanguageProvider";
import { useIsMobile } from "@/lib/threeDPortfolio/useIsMobile";
import type { SkillIcon } from "@/lib/threeDPortfolio/skills";

export default function TechStackSection() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [hoveredIcon, setHoveredIcon] = useState<SkillIcon | null>(null);

  return (
    <section className="tech-stack-section">
      <div className="tech-stack-sticky" data-kb-section="stack">
        <h2 className="tech-stack-heading">Tech Stack</h2>
        <div className="tech-stack-canvas">
          <FrozenKeyboard mobile={isMobile} onHoveredIconChange={setHoveredIcon} />
        </div>

        {hoveredIcon && (
          <div className="tech-stack-callout">
            <h3>{hoveredIcon.title}</h3>
            <p>{t(`keyboard.taglines.${hoveredIcon.slug}`)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
