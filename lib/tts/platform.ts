export const IOS_SPOKEN_PROMPT_NOTICE =
  'On iPhone and iPad, spoken prompts stay text-only by default to keep the beat volume steady. You can try iPhone Voice Beta in settings.'

export const IOS_VOICE_BETA_NOTICE =
  'iPhone Voice Beta is on. Spoken prompts may lower beat volume on some iPhone and iPad speakers.'

export function getEffectiveTTSEnabled(
  isTTSEnabled: boolean,
  isIOSDevice: boolean,
  allowIOSSpokenPrompts = false
): boolean {
  return isTTSEnabled && (!isIOSDevice || allowIOSSpokenPrompts)
}
