type FeatureIntroProps = {
  status: string;
};

export function FeatureIntro({ status }: FeatureIntroProps) {
  return (
    <p>
      Status: {status}. Implement UI under <code>src/ui</code>.
    </p>
  );
}
