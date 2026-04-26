This is the correct remaining fix.

The direct submit and regenerate paths already fetch `canonicalSR` from `device_charts` and pass it into `correctPlacementData(...)`. The auto-resume completed-job path still does this instead:

```ts
const currentSR = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
const corrected = mergeDeterministicTimingSection(
  correctPlacementData(data, chartForRequest, currentSR),
  null,
);
```

That means if a job completes through the resume path after reload/HMR/tab switch, the displayed placement table can still be corrected using stale localStorage-initialized SR state.

## Implementation plan

1. In `src/components/AskView.tsx`, make the auto-resume `applyCompletedJob` helper asynchronous so it can fetch the cloud SR before correcting the completed reading.

2. Replace the local SR lookup inside that helper with:

```ts
const canonicalSR = await fetchCanonicalSolarReturn(chartForRequest, chartIdForRequest);
```

3. Pass `canonicalSR` into the existing correction call:

```ts
const corrected = mergeDeterministicTimingSection(
  correctPlacementData(data, chartForRequest, canonicalSR),
  null,
);
```

4. Update both call sites in the auto-resume effect to await the async helper:

```ts
await applyCompletedJob(row);
await applyCompletedJob(job);
```

5. Do not change any other paths, prompts, database logic, normalizers, or UI behavior.

## Expected result

All three completed-reading paths will use the same cloud-first SR source for placement correction:

```text
direct submit       -> canonicalSR
regenerate          -> canonicalSR
auto-resume result  -> canonicalSR
```

This removes the remaining path where stale localStorage SR data can feed `correctPlacementData(...)` and output `retrograde: false` for SR Mercury when the cloud record has `isRetrograde: true`.