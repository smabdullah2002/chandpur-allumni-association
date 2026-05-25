import React from "react";

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  return (
    <div className={`section-title ${align}`}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
