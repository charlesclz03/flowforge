import { redirect } from 'next/navigation'

export default function LegacyCalibrationRedirectPage() {
  redirect('/settings/latency')
}
