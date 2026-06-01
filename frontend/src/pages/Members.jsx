import React from "react";
import SectionTitle from "../components/SectionTitle";
import MembersList from "../components/MembersList";

export default function Members() {
  return (
    <section className="page-section page-band">
      <div className="container">
        <SectionTitle eyebrow="Members" title="সদস্যগণ" align="left" />
        <div style={{ marginTop: 12 }}>
          <MembersList />
        </div>
      </div>
    </section>
  );
}
