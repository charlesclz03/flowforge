export const IOS_SPOKEN_PROMPT_NOTICE =
  'On iPhone and iPad, spoken prompts are disabled during practice to keep the beat volume steady.'

export function getEffectiveTTSEnabled(
  isTTSEnabled: boolean,
  isIOSDevice: boolean
): boolean {
  return isTTSEnabled && !isIOSDevice
}
