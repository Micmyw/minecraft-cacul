export function ComparisonCard({
  optimized,
  baseline,
  levelsSaved,
  preserveMode,
}: {
  optimized: number;
  baseline: number | null;
  levelsSaved: number | null;
  preserveMode: boolean;
}) {
  if (baseline === null || levelsSaved === null) {
    return (
      <div className="comparison-card warning-card">
        <p>The sequential order reaches Too Expensive.</p>
      </div>
    );
  }
  let summary = "The optimized and sequential plans use the same total levels.";
  if (levelsSaved > 0) summary = `You save ${levelsSaved} levels.`;
  if (levelsSaved < 0) {
    summary = preserveMode
      ? `Uses ${Math.abs(levelsSaved)} more levels to preserve future work.`
      : `Uses ${Math.abs(levelsSaved)} more levels than the sequential order.`;
  }
  return (
    <div className="comparison-card">
      <dl>
        <div><dt>Optimized plan</dt><dd>{optimized} levels</dd></div>
        <div><dt>Sequential order</dt><dd>{baseline} levels</dd></div>
      </dl>
      <p>{summary}</p>
    </div>
  );
}
