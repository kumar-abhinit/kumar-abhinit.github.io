import TensionText from "./TensionText";

export default function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <TensionText
      as="h2"
      id={id}
      className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-subtle"
      mode="enter"
      settleTracking="0.18em"
      brush="scroll"
    >
      {children}
    </TensionText>
  );
}
